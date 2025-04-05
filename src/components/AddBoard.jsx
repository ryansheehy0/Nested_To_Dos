import { db } from '../db'

export default function AddBoard() {
	async function addBoard() {
		await db.boards.add({
			name: "",
			lists: []
		})
	}

	return (
		<div
			className="w-full h-11 outline-2 outline-white mt-0.5 flex flex-row items-center justify-center cursor-pointer text-white"
			onClick={addBoard}
		>
				Add board
		</div>
	)
}