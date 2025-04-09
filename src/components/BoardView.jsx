import AddList from "./AddList"
import List from "./List"
import { useLiveQuery } from "dexie-react-hooks"
import { db, getLists } from "../db"
import { useState, Fragment } from "react"

export default function BoardView() {
	const [movingListID, setMovingListID] = useState(false)
	const lists = useLiveQuery(async () => {
		const { curBoardID } = await db.other.get(1)
		return await getLists(curBoardID, "Board")
	})

	return (
		<div className="w-full min-w-fit h-screen flex flex-row gap-0.5">
			{lists ? lists.map((list) => (
				<Fragment key={list.id}>
					<div className={`w-5 h-full ${movingListID ? "bg-blue-500/50 hover:bg-blue-500" : "bg-transparent"}`}>Move Here</div>
					<List id={list.id} name={list.name} parentID={null} parentType={"Board"} movingListID={movingListID} setMovingListID={setMovingListID}/>
				</Fragment>
			)) : null}
			<div className={`w-5 h-full ${movingListID ? "bg-blue-500/50 hover:bg-blue-500" : "bg-transparent"}`}></div>
			<AddList/>
		</div>
	)
}