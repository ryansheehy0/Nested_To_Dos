import Add from '../assets/add.svg?react'
import Trash from '../assets/trash.svg?react'
import { useState, useEffect, useRef } from 'react'

export default function List() {
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
		<div className="w-60 min-h-11 h-min outline-2 mt-0.5 outline-white flex flex-row items-center justify-center text-white p-1.5 relative">
			<div className='w-0 h-0 border-10 border-white border-b-transparent border-r-transparent absolute top-0 left-0 flex items-center justify-center cursor-pointer'>
				<div className='w-0 h-0 border-8 border-black border-b-transparent border-r-transparent relative -left-0.5 -top-0.5'></div>
			</div>
			<div className='w-0 h-0 border-10 border-white border-t-transparent border-r-transparent absolute bottom-0 left-0 flex items-center justify-center cursor-pointer'>
				<div className='w-0 h-0 border-8 border-black border-t-transparent border-r-transparent relative -left-0.5 -bottom-0.5'></div>
			</div>
			<textarea className="bg-transparent m-0 boarder-none text-white resize-none pl-1 w-full h-auto focus:outline focus:outline-1 focus:outline-black hyphens-auto overflow-hidden"
				onInput={onTextareaInput} rows={1}
			></textarea>
			<Add className="cursor-pointer w-8 h-8"/>
			<Trash ref={trashRef} className={`cursor-pointer w-8 h-8 ${deleted ? "fill-red-600" : "fill-white"}`} onClick={deleteSelf}/>
		</div>
	)
}