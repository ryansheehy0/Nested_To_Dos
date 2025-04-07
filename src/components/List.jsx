import Add from '../assets/add.svg?react'
import Trash from '../assets/trash.svg?react'
import Arrow from '../assets/arrow.svg?react'
import Move from '../assets/move.svg?react'
import { useState, useEffect, useRef } from 'react'
import { db, recursivelyDeleteList, getLists } from "../db"
import { useLiveQuery } from 'dexie-react-hooks'

export default function List({id, name, parentID, parentType}) {
	const [deleted, setDeleted] = useState(false)
	const [text, setText] = useState(name)
	const trashRef = useRef(null)
	const lists = useLiveQuery(async () => {
		return await getLists(id, "List")
	})
	const folded = useLiveQuery(async () => {
		const { folded } = await db.lists.get(id)
		return folded
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

	/*
		<div className='min-w-60 w-min h-fit flex flex-col'>
			<div className="w-full bg-black min-h-11 h-min outline-2 mt-0.5 outline-white flex flex-row items-center justify-center text-white p-1 relative">
				<Move className="cursor-pointer w-8 h-8 fill-white"/>
				<textarea className="bg-transparent m-0 boarder-none text-white resize-none w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
					value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
				></textarea>
	*/
	return (
		<div className={`min-w-60 h-fit flex flex-col ${parentType === "Board" ? "w-min" : "w-full"}`}>
			<div className="w-full bg-black min-h-11 h-min outline-2 mt-0.5 outline-white flex flex-row items-center justify-center text-white p-1 relative">
				<Move className="cursor-pointer w-8 h-8 fill-white"/>
				<textarea className="bg-transparent m-0 boarder-none text-white resize-none w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
					value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
				></textarea>
				{lists?.length ?
					<Arrow className={`cursor-pointer w-6 h-6 fill-white ${folded ? "" : "rotate-90"}`} onClick={toggleFold}/>
				: null}
				<Add className="cursor-pointer w-8 h-8 fill-white" onClick={addList}/>
				<Trash ref={trashRef} className={`cursor-pointer w-8 h-8 ${deleted ? "fill-red-600" : "fill-white"}`} onClick={deleteSelf}/>
			</div>
			{lists?.length ?
				<div className={`h-min w-fit outline-2 bg-neutral-600 outline-white pl-6.5 ${folded ? "invisible max-h-0 py-0 px-2.5" : "p-2.5 mt-0.5"}`}>
					{lists.map((list) => (
						<List key={list.id} id={list.id} name={list.name} parentID={id} parentType={"List"}/>
					))}
				</div>
			: null}
		</div>
	)
}