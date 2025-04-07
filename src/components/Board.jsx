import Trash from '../assets/trash.svg?react'
import { useState, useEffect, useRef } from 'react'
import { db, recursivelyDeleteBoard } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

export default function Board({id, name}) {
	const [deleted, setDeleted] = useState(false)
  const [text, setText] = useState(name)
	const trashRef = useRef(null)
  const selected = useLiveQuery(async () => {
    const { curBoardID } = await db.other.get(1)
    return curBoardID === id
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
    await db.boards.update(id, {
      name: textarea.value
    })
  }

	function deleteSelf() {
		if (!deleted) return setDeleted(true)
    recursivelyDeleteBoard(id)
	}

  async function selectSelf(event) {
    if(trashRef.current.contains(event.target)) return
    // Update currently selected board
    await db.other.update(1, {
      curBoardID: id
    })
  }

	return (
		<div className="w-full min-h-11 h-fit outline-2 outline-white mt-0.5 flex flex-row items-center justify-center p-1.5"
      onClick={selectSelf}
    >
			<textarea className="bg-transparent m-0 boarder-none text-white resize-none px-1 w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
				value={text} onInput={onTextareaInput} rows={1} autoFocus={text === ""}
			></textarea>
			<Trash ref={trashRef} className={`cursor-pointer w-8 h-8 ${deleted ? "fill-red-600" : "fill-white"} ${!selected ? "" : "hidden"}`} onClick={deleteSelf}/>
		</div>
	)
}