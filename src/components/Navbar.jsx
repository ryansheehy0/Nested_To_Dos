import Menu from "../assets/menu.svg?react"
import Save from "../assets/save.svg?react"
import Folder from "../assets/folder.svg?react"
import Github from "../assets/github.svg?react"

export default function Navbar() {
	return (
		<div className="w-72 h-full bg-black border-2 border-white">
			<div className="w-full h-fit p-1 flex flex-row border-b-2 border-white gap-1">
				<Menu className="fill-white cursor-pointer w-10 h-10"/>
				<Save className="fill-white cursor-pointer w-10 h-10"/>
				<Folder className="fill-white cursor-pointer w-10 h-10"/>
				<Github className="fill-white cursor-pointer w-10 h-10 p-1.5"/>
			</div>
		</div>
	)
}