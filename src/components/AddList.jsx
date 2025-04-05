import { db } from '../db'

export default function AddList() {
	async function addList() {
		// Create new list
		const curBoardID = await db.other.get(1).curBoardID
		const newListID = await db.lists.add({
			name: "",
			lists: [],
			parentID: curBoardID,
			parentType: "Board"
		})
		// Add new list to board's lists
		const board =  await db.boards.get(curBoardID)
		
	}

	return (
		<div className="w-60 h-11 outline-2 mt-0.5 outline-white flex flex-row items-center justify-center cursor-pointer text-white"
			onClick={addList}
		>
				Add list
		</div>
	)
}