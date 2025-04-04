import Menu from "../assets/menu2.svg?react"
import Save from "../assets/save2.svg?react"
import Folder from "../assets/folder2.svg?react"
import Github from "../assets/github.svg?react"
import { useState } from "react"
import Board from './Board'
import AddBoard from './AddBoard'

export default function Navbar() {
	const [open, setOpen] = useState(false)

	return (
		<div className={`${open ? "w-76" : "w-11"} h-full bg-black border-2 border-white`}>
			<div className="w-full h-11 p-1.5 flex flex-row outline-2 outline-white gap-2 items-center">
				<Menu className="fill-white cursor-pointer w-7 h-7" onClick={() => setOpen(!open)}/>
				{open ? (<>
					<Save className="fill-white cursor-pointer w-5 h-5"/>
					<Folder className="fill-white cursor-pointer w-6.5 h-6"/>
					<a target="_blank" href="https://github.com/ryansheehy0/New_Nested_To_Dos">
						<Github className="fill-white cursor-pointer w-5.25 h-5.25"/>
					</a>
				</>) : ""}
			</div>
			{open ? (<>
				<Board/>
				<AddBoard/>
			</>) : ""}
		</div>
	)
}