import Add from '../assets/add.svg?react'
import Trash from '../assets/trash.svg?react'
import Arrow from '../assets/arrow.svg?react'
import Move from '../assets/move.svg?react'
import { useState, useEffect, useRef } from 'react'
import { db, recursivelyDeleteList, getLists } from "../db"
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
		if (parentType === "Board") {
			const { curBoardID } = await db.other.get(1)
    	await recursivelyDeleteList(id, curBoardID, parentType)
		} else if (parentType === "List") {
    	await recursivelyDeleteList(id, parentID, parentType)
		}
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

	async function removeMovingListIDFromItsParent() {
		const movingList = await db.lists.get(movingListID)
		if (movingList.parentType === "Board") {
			const parentBoard = await db.boards.get(movingList.parentID)
			parentBoard.listIDs = parentBoard.listIDs.filter((listID) => listID !== movingListID)
			await db.boards.update(movingList.parentID, {
				listIDs: parentBoard.listIDs
			})
		} else if (movingList.parentType === "List") {
			const parentList = await db.lists.get(movingList.parentID)
			parentList.listIDs = parentList.listIDs.filter((listID) => listID !== movingListID)
			await db.lists.update(movingList.parentID, {
				listIDs: parentList.listIDs
			})
		}
	}

	async function updateMovingListsParentIDandParentType(curBoardID) {
		await db.lists.update(movingListID, {
			parentID: curBoardID,
			parentType: "Board"
		})
	}

	async function moveHere() {
		// Remove moving list's ID from its parent
		removeMovingListIDFromItsParent()
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
		// Reset moving
		setMovingListID(false)
	}

	async function moveInside() {
		// Remove moving list's ID from its parent
		removeMovingListIDFromItsParent()
		// Put the moving list's ID at the start of this list's ID(the list that was clicked)
		// Change the moving list's parentID and parentType
		// Reset moving
		setMovingListID(false)
	}

	async function moveBelow() {
	}

	return (
		<>
		<div className={`w-5 h-full pt-5 flex items-center select-none ${movingListID ? "bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white" : "invisible"} ${parentType === "Board" ? "" : "hidden"}`} style={{writingMode: "vertical-rl", textOrientation: "upright"}} onClick={moveHere}>Move Here</div>
		<div className={`min-w-60 h-fit flex flex-col ${parentType === "Board" ? "w-min mt-5" : "w-full"} ${parentID === movingListID ? "invisible" : ""}`}>
			<div className="w-full bg-black min-h-11 h-min outline-2 mt-0.5 outline-white flex flex-row items-center justify-center text-white p-1 relative">
				<Move className={`cursor-pointer w-8 h-8 ${id === movingListID ? "fill-red-500" : "fill-white"}`} onClick={toggleMove}/>
				<textarea className="bg-transparent m-0 boarder-none text-white resize-none w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
					value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
				></textarea>
				{lists?.length ?
					<Arrow className={`cursor-pointer w-6 h-6 fill-white ${folded ? "" : "rotate-90"} ${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}`} onClick={toggleFold}/>
				: null}
				<Add className={`cursor-pointer w-8 h-8 fill-white ${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}`} onClick={addList}/>
				<Trash ref={trashRef} className={`w-8 h-8 ${deleted ? "fill-red-600" : "fill-white"} ${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}`} onClick={deleteSelf}/>
				<div className={`${id === movingListID || !movingListID ? "hidden" : ""} w-full h-1/2 absolute top-0 text-center select-none ${parentID === movingListID ? "bg-transparent" : "bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white"}`}>Move Inside</div>
				<div className={`${id === movingListID || !movingListID ? "hidden" : ""} w-full h-1/2 absolute bottom-0 text-center select-none ${parentType === "Board" || parentID === movingListID ? "bg-transparent text-transparent" : "bg-red-500/50 hover:bg-red-500 text-transparent hover:text-white"}`}>Move Below</div>
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