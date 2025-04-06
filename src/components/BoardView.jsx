import AddList from "./AddList"
import List from "./List"
import { useLiveQuery } from "dexie-react-hooks"
import { db, getLists } from "../db"

export default function BoardView() {
	const lists = useLiveQuery(async () => {
		const { curBoardID } = await db.other.get(1)
		return await getLists(curBoardID, "Board")
	})

	return (
		<div className="w-full h-screen bg-black px-6.25 py-5.75 flex flex-row gap-5.75">
			{lists ? lists.map((list) => (
				<List key={list.id} id={list.id} name={list.name} parentID={null} parentType={"Board"}/>
			)) : null}
			<AddList/>
		</div>
	)
}