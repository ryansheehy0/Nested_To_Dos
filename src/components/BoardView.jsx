import AddList from "./AddList"
import List from "./List"
import { useLiveQuery } from "dexie-react-hooks"
import { db, getLists } from "../db"
import { useState } from "react"

export default function BoardView() {
	const [movingListID, setMovingListID] = useState(false)
	const lists = useLiveQuery(async () => {
		setMovingListID(false) // If the list changes, then disable moving. This prevents moving when the selected board changes.
		const { curBoardID } = await db.other.get(1)
		return await getLists(curBoardID, "Board")
	})

	return (
		<div className="w-full min-w-fit h-screen flex flex-row gap-0.5">
			{lists ? lists.map((list) => (
				<List key={list.id} id={list.id} name={list.name} parentID={null} parentType={"Board"} movingListID={movingListID} setMovingListID={setMovingListID}/>
			)) : null}
			<div className={`w-5 h-full pt-5 flex items-center select-none ${movingListID ? "bg-blue-500/50 hover:bg-blue-500 text-transparent hover:text-white" : "invisible"}`} style={{writingMode: "vertical-rl", textOrientation: "upright"}}>Move Here</div>
			<AddList/>
		</div>
	)
}