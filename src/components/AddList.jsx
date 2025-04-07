import { db } from '../db'

export default function AddList() {
	async function addList() {
		const { curBoardID } = await db.other.get(1)
		// Create new list
		const newListID = await db.lists.add({
			name: "",
			listIDs: [],
			parentID: curBoardID,
			parentType: "Board",
			folded: false
		})
		// Add new list to board's lists
		const board =  await db.boards.get(curBoardID)
		await db.boards.update(curBoardID, {
			listIDs: [...board.listIDs, newListID]
		})
	}

	return (
		<div className="min-w-60 w-min bg-black h-11 outline-2 mt-0.5 outline-white flex flex-row items-center justify-center cursor-pointer text-white"
			onClick={addList}
		>
				Add list
		</div>
	)
}