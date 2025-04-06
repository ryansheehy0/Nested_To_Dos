import Add from '../assets/add.svg?react'
import Trash from '../assets/trash.svg?react'
import { useState, useEffect, useRef } from 'react'
import { db, recursivelyDeleteList } from "../db"

export default function List({id, name, parentID, parentType}) {
	const [deleted, setDeleted] = useState(false)
	const [text, setText] = useState(name)
	const trashRef = useRef(null)

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
    	recursivelyDeleteList(id, curBoardID, parentType)
		} else if (parentType === "List") {
    	recursivelyDeleteList(id, parentID, parentType)
		}
	}

	return (
		<div className="min-w-60 w-min min-h-11 h-min outline-2 mt-0.5 outline-white flex flex-row items-center justify-center text-white p-1.5 relative">
			<div className='w-0 h-0 border-10 border-white border-b-transparent border-r-transparent absolute top-0 left-0 flex items-center justify-center cursor-pointer'>
				<div className='w-0 h-0 border-8 border-black border-b-transparent border-r-transparent relative -left-0.5 -top-0.5'></div>
			</div>
			<div className='w-0 h-0 border-10 border-white border-t-transparent border-r-transparent absolute bottom-0 left-0 flex items-center justify-center cursor-pointer'>
				<div className='w-0 h-0 border-8 border-black border-t-transparent border-r-transparent relative -left-0.5 -bottom-0.5'></div>
			</div>
			<textarea className="bg-transparent m-0 boarder-none text-white resize-none pl-1 w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
				value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
			></textarea>
			<Add className="cursor-pointer w-8 h-8"/>
			<Trash ref={trashRef} className={`cursor-pointer w-8 h-8 ${deleted ? "fill-red-600" : "fill-white"}`} onClick={deleteSelf}/>
		</div>
	)
}