import AddList from "./AddList"
import List from "./List"

export default function BoardView() {
	return (
		<div className="w-full h-screen bg-black px-4.5 py-4 flex flex-row gap-5">
			<List/>
			<AddList/>
		</div>
	)
}