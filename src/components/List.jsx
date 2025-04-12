import Add from '../assets/add.svg?react'
import Trash from '../assets/trash.svg?react'
import Arrow from '../assets/arrow.svg?react'
import Drag from '../assets/drag.svg?react'
import { useState, useEffect, useRef } from 'react'
import { db, recursivelyDeleteList, getLists, removeListIDFromItsParent } from "../db"
import { useLiveQuery } from 'dexie-react-hooks'

export default function List({id, name, parentID, parentType, movingListID, setMovingListID}) {
	const [deleted, setDeleted] = useState(false)
	const [text, setText] = useState(name)
	const trashRef = useRef(null)
	const lists = useLiveQuery(async () => {
		return await getLists(id, "List")
	})
	const folded = useLiveQuery(async () => {
		const list = await db.lists.get(id)
		if (!list) return false
		return list.folded
	})

  useEffect(() => { // Remove deleted on click outside
    function handleClickOutside(event){
      if(!trashRef.current.contains(event.target)){
        setDeleted(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return(() => {
      document.removeEventListener("click", handleClickOutside)
    })
  }, [])

	async function onTextareaInput(event) {
    const textarea = event.target
    // Resize text area
    textarea.style.height = "fit-content"
    textarea.style.height = textarea.scrollHeight + "px"
    // Set the text
    setText(textarea.value)
    // Ave the name change to db
    await db.lists.update(id, {
      name: textarea.value
    })
  }

	async function deleteSelf() {
		if (!deleted) return setDeleted(true)
		await recursivelyDeleteList(id)
	}

	async function addList() {
		// Create new list
		const newListID = await db.lists.add({
			name: "",
			listIDs: [],
			parentID: id,
			parentType: "List",
			folded: false
		})
		// Add list to parent lists's listIDs
		const list = await db.lists.get(id)
		await db.lists.update(id, {
			listIDs: [...list.listIDs, newListID]
		})
	}

	async function toggleFold() {
		// Update the folding
		await db.lists.update(id, {
			folded: !folded
		})
	}

	async function toggleMove() {
		// Toggle movingListID. Either remove it or set to the current list
		setMovingListID(movingListID ? false : id)
	}

	async function moveHere() {
		// Remove moving list's ID from its parent
		await removeListIDFromItsParent(movingListID)
		// Find the index of this list(the list right of the Move Here)
		const { curBoardID } = await db.other.get(1)
		const board = await db.boards.get(curBoardID) // There parent of this list is always a board.
		const indexOfThisList = board.listIDs.findIndex((listID) => listID === id)
		// Put the moving list's ID in front of this list's ID
		board.listIDs.splice(indexOfThisList, 0, movingListID)
		await db.boards.update(curBoardID, {
			listIDs: board.listIDs
		})
		// Change the moving list's parentID and parentType
		await db.lists.update(movingListID, {
			parentID: curBoardID,
			parentType: "Board"
		})
		// Reset moving
		setMovingListID(false)
	}

	async function moveInside() {
		// Remove moving list's ID from its parent
		await removeListIDFromItsParent(movingListID)
		// Put the moving list's ID at the start of this list's ID(the list that was clicked)
		const thisList = await db.lists.get(id)
		thisList.listIDs.splice(0, 0, movingListID)
		await db.lists.update(id, {
			listIDs: thisList.listIDs
		})
		// Change the moving list's parentID and parentType
		await db.lists.update(movingListID, {
			parentID: id,
			parentType: "List"
		})
		// Reset moving
		setMovingListID(false)
	}

	async function moveBelow() {
		// Remove moving list's ID from its parent
		await removeListIDFromItsParent(movingListID)
		// Find the index of this list's ID in its parent list
		const parentList = await db.lists.get(parentID)
		const indexOfThisList = parentList.listIDs.findIndex((listID) => listID === id)
		// Put the moving list's ID after the index of this list's ID
		parentList.listIDs.splice(indexOfThisList + 1, 0, movingListID)
		await db.lists.update(parentID, {
			listIDs: parentList.listIDs
		})
		// Change the moving list's parentID and parentType
		await db.lists.update(movingListID, {
			parentID: parentID,
			parentType: parentType
		})
		// Reset moving
		setMovingListID(false)
	}

	return (
		<>
		<div className={`w-5 h-full pt-5 flex items-center select-none ${movingListID ? "bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white" : "invisible"} ${parentType === "Board" ? "" : "hidden"}`} style={{writingMode: "vertical-rl", textOrientation: "upright"}} onClick={moveHere}>Move Here</div>
		<div className={`min-w-60 h-fit flex flex-col ${parentType === "Board" ? "w-min mt-5" : "w-full"} ${parentID === movingListID ? "invisible" : ""}`}>
			<div className="w-full bg-black min-h-11 h-min outline-2 mt-0.5 outline-white flex flex-row items-center justify-center text-white p-1 relative">
				<Drag className={`cursor-pointer w-7 h-7 mr-1 ${id === movingListID ? "fill-red-500" : "fill-white"}`} onClick={toggleMove}/>
				<textarea className="bg-transparent m-0 boarder-none text-white resize-none w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
					value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
				></textarea>
				{lists?.length ?
					<Arrow className={`cursor-pointer w-6.5 h-6.5 mr-1 fill-white ${folded ? "" : "rotate-90"} ${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}`} onClick={toggleFold}/>
				: null}
				<Add className={`cursor-pointer w-6.5 h-6.5 mr-1 fill-white ${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}`} onClick={addList}/>
				<Trash ref={trashRef} className={`w-7 h-7 ${deleted ? "fill-red-600" : "fill-white"} ${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}`} onClick={deleteSelf}/>
				<div className={`${id === movingListID || !movingListID ? "hidden" : ""} w-full h-1/2 absolute top-0 text-center select-none bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white`} onClick={moveInside}>Move Inside</div>
				<div className={`${id === movingListID || !movingListID ? "hidden" : ""} w-full h-1/2 absolute bottom-0 text-center select-none ${parentType === "Board" || parentID === movingListID ? "bg-transparent text-transparent pointer-events-none" : "bg-red-500/50 hover:bg-red-500 text-transparent hover:text-white"}`} onClick={moveBelow}>Move Below</div>
			</div>
			{lists?.length ?
				<div className={`h-min w-fit outline-2 bg-neutral-600 outline-white pl-6.5 ${folded ? "invisible max-h-0 py-0 px-2.5" : "p-2.5 mt-0.5"}`}>
					{lists.map((list) => (
						<List key={list.id} id={list.id} name={list.name} parentID={id} parentType={"List"} movingListID={movingListID} setMovingListID={setMovingListID}/>
					))}
				</div>
			: null}
		</div>
		</>
	)
}