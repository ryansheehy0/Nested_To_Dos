import AddList from "./AddList"
import List from "./List"

export default function BoardView() {
	return (
		<div className="w-full h-screen bg-black px-6.25 py-5.75 flex flex-row gap-5.75">
			<List/>
			<AddList/>
		</div>
	)
}