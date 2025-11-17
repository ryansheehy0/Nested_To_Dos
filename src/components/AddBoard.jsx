import { db } from '../db'

export default function AddBoard() {
	async function addBoard() {
		await db.boards.add({
			name: "",
			listIDs: []
		})
	}

	return (
		<div
			className="w-full h-11 mt-0.5 flex flex-row items-center justify-center bg-neutral-800 cursor-pointer text-white"
			onClick={addBoard}
		>
				Add board
		</div>
	)
}