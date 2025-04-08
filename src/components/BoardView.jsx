import AddList from "./AddList"
import List from "./List"
import { useLiveQuery } from "dexie-react-hooks"
import { db, getLists } from "../db"

export default function BoardView() {
	const lists = useLiveQuery(async () => {
		const { curBoardID } = await db.other.get(1)
		return await getLists(curBoardID, "Board")
	})
// w-full
	return (
		<div className="w-full min-w-fit h-screen p-5 flex flex-row gap-5">
			{lists ? lists.map((list) => (
				<List key={list.id} id={list.id} name={list.name} parentID={null} parentType={"Board"}/>
			)) : null}
			<AddList/>
		</div>
	)
}