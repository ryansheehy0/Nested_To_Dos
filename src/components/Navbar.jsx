import Menu from "../assets/menu2.svg?react"
import Save from "../assets/save2.svg?react"
import Folder from "../assets/folder2.svg?react"
import Github from "../assets/github.svg?react"
import { useState, useRef } from "react"
import Board from './Board'
import AddBoard from './AddBoard'
import { db, download, upload } from '../db'
import { useLiveQuery } from "dexie-react-hooks"

export default function Navbar() {
	const [open, setOpen] = useState(false)
	const boards = useLiveQuery(async () => await db.boards.toArray())
	const folderRef = useRef(null)

	return (
		<div className={`${open ? "min-w-60" : "min-w-11"} h-full bg-black w-min border-2 border-white`}>
			<div className="w-full h-11 p-1.5 flex flex-row outline-2 outline-white gap-2 items-center">
				<Menu className="fill-white cursor-pointer w-7 h-7" onClick={() => setOpen(!open)}/>
				{open ? (<>
					<Save className="fill-white cursor-pointer w-5 h-5" onClick={download}/>
					<Folder ref={folderRef} className="fill-white cursor-pointer w-6.5 h-6" onClick={() => {folderRef.current.click()}}/>
          <input type="file" ref={folderRef} className="hidden" accept=".json" onChange={(event) => upload(event)}/>
					<a target="_blank" href="https://github.com/ryansheehy0/New_Nested_To_Dos">
						<Github className="fill-white cursor-pointer w-5.25 h-5.25"/>
					</a>
				</>) : ""}
			</div>
			{open ? (<>
				{boards.map((board) => (
					<Board key={board.id} id={board.id} name={board.name}/>
				))}
				<AddBoard/>
			</>) : ""}
		</div>
	)
}