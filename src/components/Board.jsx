import Trash from '../assets/trash.svg?react'
import { useState, useEffect, useRef } from 'react'

export default function Board() {
	const [deleted, setDeleted] = useState(false)
	const trashRef = useRef(null)

	// Remove deleted on click outside
  useEffect(() => {
    function handleClickOutside(event){
      //if(!trashParentRef.current.lastChild) return
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
    // Resize text area
    const textarea = event.target
    textarea.style.height = "fit-content"
    textarea.style.height = textarea.scrollHeight + "px"
    //setText(textarea.value)
  }

	function deleteSelf() {
		if (!deleted) return setDeleted(true)
		console.log("Delete self")
	}

	return (
		<div className="w-full min-h-11 h-fit outline-2 outline-white mt-0.5 flex flex-row items-center justify-center p-1.5">
			<textarea className="bg-transparent m-0 boarder-none text-white resize-none px-1 w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
				onInput={onTextareaInput} rows={1}
			></textarea>
			<Trash ref={trashRef} className={`cursor-pointer w-8 h-8 ${deleted ? "fill-red-600" : "fill-white"}`} onClick={deleteSelf}/>
		</div>
	)
}