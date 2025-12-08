import Add from '../assets/add.svg?react'
import Trash from '../assets/trash.svg?react'
import Arrow from '../assets/arrow.svg?react'
import Drag from '../assets/drag.svg?react'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { db, recursivelyDeleteList, getLists, removeListIDFromItsParent } from "../db"
import { useLiveQuery } from 'dexie-react-hooks'

export default function List({id, name, parentID, parentType, hasSiblingsAbove, hasSiblingsBelow, movingListID, setMovingListID}) {
	const [deleted, setDeleted] = useState(false)
	const [text, setText] = useState(name)
	const [spellChecking, setSpellChecking] = useState(false)
	const trashRef = useRef(null)
	const textareaRef = useRef(null)
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

	useEffect(() => { // Size the textarea on load
		const textarea = textareaRef.current
		const observer = new ResizeObserver(() => {
			textarea.style.height = "fit-content"
			textarea.style.height = textarea.scrollHeight + 'px'
		})
		observer.observe(textarea)
		return () => observer.disconnect()
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
		await new Promise(r => setTimeout(r, 100))
    // Resize text area
    const textarea = textareaRef.current
		textarea.style.height = "fit-content"
		textarea.style.height = textarea.scrollHeight + "px"
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
		<div className={`w-5 h-auto pt-5 flex items-center select-none
			${movingListID ? "bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white" : "invisible"}
			${parentType === "Board" ? "" : "hidden"}
		`} style={{writingMode: "vertical-rl", textOrientation: "upright"}} onClick={moveHere}>Move Here</div>
		<div className={`min-w-64 h-fit flex flex-col
			${parentType === "Board" ? "w-min mt-5" : "w-full"}
			${parentID === movingListID ? "invisible" : ""}
		`}>
			<div className={`w-full bg-neutral-800 min-h-11 h-min mt-0.5 flex flex-row items-center text-white p-1 relative shadow-md overflow-clip
				${parentType === "Board" ? "rounded-t-lg" : ""}
				${(parentType !== "Board" && !hasSiblingsAbove) ? "rounded-t-lg" : ""}
				${(parentType === "Board" && (lists?.length === 0 || folded)) ? "rounded-b-lg" : ""}
				${(parentType !== "Board" && !hasSiblingsBelow && (lists?.length === 0 || folded)) ? "rounded-b-lg" : ""}
			`}>
				<Drag className={`cursor-pointer w-5 h-7 mr-1 flex-none
					${id === movingListID ? "fill-red-500" : "fill-white"}
				`} onClick={toggleMove} onMouseDown={e => e.preventDefault()}/>
				<textarea ref={textareaRef} className="bg-transparent m-0 border-none text-white resize-none w-full h-auto focus:outline focus:outline-1 focus:outline-transparent hyphens-auto overflow-hidden shrink"
					value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
					onFocus={() => {setSpellChecking(true)}} onBlur={() => {setSpellChecking(false)}} spellCheck={spellChecking}
				></textarea>
				{lists?.length ?
					<Arrow className={`cursor-pointer w-4.5 h-6.5 mr-1 fill-white flex-none
						${folded ? "" : "rotate-90"}
						${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}
					`} onClick={toggleFold} onMouseDown={e => e.preventDefault()}/>
				: null}
				<Add className={`cursor-pointer w-4.5 h-6.5 mr-1 fill-white flex-none
					${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}
				`} onClick={addList} onMouseDown={e => e.preventDefault()}/>
				<Trash ref={trashRef} className={`w-5 h-7 flex-none
					${deleted ? "fill-red-600" : "fill-white"}
					${id === movingListID ? "pointer-events-none cursor-default" : "cursor-pointer"}
				`} onClick={deleteSelf} onMouseDown={e => e.preventDefault()}/>
				<div className={`w-full h-1/2 absolute top-0 text-center select-none bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white
					${id === movingListID || !movingListID ? "hidden" : ""}
				`} onClick={moveInside}>Move Inside</div>
				<div className={`w-full h-1/2 absolute bottom-0 text-center select-none
					${id === movingListID || !movingListID ? "hidden" : ""}
					${parentType === "Board" || parentID === movingListID ? "bg-transparent text-transparent pointer-events-none" : "bg-red-500/50 hover:bg-red-500 text-transparent hover:text-white"}
				`} onClick={moveBelow}>Move Below</div>
			</div>
			{lists?.length ?
				<div className={`h-min w-auto bg-neutral-700 shadow-md border-2 border-t-0 border-neutral-800 pl-6.5
					${folded ? "invisible overflow-hidden max-h-0 py-0 px-1.5" : "p-1.5"}
					${(parentType === "Board" && (lists?.length !== 0 || !folded)) ? "rounded-b-lg" : ""}
					${(parentType !== "Board" && !hasSiblingsBelow && (lists?.length !== 0 || !folded)) ? "rounded-b-lg" : ""}
				`}>
					{lists.map((list, index) => (
						<List key={list.id} id={list.id} name={list.name} parentID={id} parentType={"List"} hasSiblingsAbove={index === 0 ? false : true} hasSiblingsBelow={index === lists.length - 1 ? false : true} movingListID={movingListID} setMovingListID={setMovingListID}/>
					))}
				</div>
			: null}
		</div>
		</>
	)
}