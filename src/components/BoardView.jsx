import AddList from "./AddList"
import List from "./List"
import { useLiveQuery } from "dexie-react-hooks"
import { db, getLists, removeListIDFromItsParent } from "../db"
import { useState } from "react"

export default function BoardView() {
	const [movingListID, setMovingListID] = useState(false)
	const lists = useLiveQuery(async () => {
		setMovingListID(false) // If the list changes, then disable moving. This prevents moving when the selected board changes.
		const { curBoardID } = await db.other.get(1)
		return await getLists(curBoardID, "Board")
	})

	async function moveHere() {
		// Remove moving list's ID from its parent
		await removeListIDFromItsParent(movingListID)
		// Put the moving list's ID at the end of the current board's listIDs
		const { curBoardID } = await db.other.get(1)
		const board = await db.boards.get(curBoardID)
		board.listIDs.push(movingListID)
		await db.boards.update(curBoardID, {
			listIDs: board.listIDs
		})
		// Change the moving list's parentID and parentType
		await db.lists.update(movingListID, {
			parentID: curBoardID,
			parentType: "Board"
		})
		// Reset moving
		setMovingListID(false)
	}

	return (
		<div className="w-full min-w-fit h-screen flex flex-row gap-0.5 pr-5">
			{lists ? lists.map((list) => (
				<List key={list.id} id={list.id} name={list.name} parentID={null} parentType={"Board"} movingListID={movingListID} setMovingListID={setMovingListID}/>
			)) : null}
			<div className={`w-5 h-full pt-5 flex items-center select-none ${movingListID ? "bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white" : "invisible"}`} style={{writingMode: "vertical-rl", textOrientation: "upright"}} onClick={moveHere}>Move Here</div>
			<AddList/>
		</div>
	)
}