import Dexie from 'dexie'

export const db = new Dexie('nested-to-dos')

db.version(1).stores({
	other: "++id, curBoardID",
	boards: "++id,name,lists",
	lists: "++id,name,lists,parentID,parentType",
})

export async function recursivelyDeleteList(id, parentID, parentType) {
	// Delete all lists in list
	const list = await db.lists.get(id)
	for (const listId of list.lists) {
		await recursivelyDeleteList(listId, id, "List")
	}
	// Remove reference of self in parent
	if (parentType === "Board") {
		const board = await db.boards.get(parentID)
		board.lists = board.lists.filter((listID) => {return listID !== id})
		await db.boards.update(parentID, {
			lists: [...board.lists]
		})
	} else if (parentType === "List") {
		const parentList = await db.lists.get(parentID)
		parentList.lists = parentList.lists.filter((listID) => {return listID !== id})
		await db.lists.update(parentID, {
			lists: [...parentList.lists]
		})
	}
	// Delete self
	await db.lists.delete(id)
}

export async function recursivelyDeleteBoard(id) {
	// Delete all lists in board
	const board = await db.boards.get(id)
	for (const listId of board.lists) {
		await recursivelyDeleteList(listId, id, "Board")
	}
	// Delete self
	await db.boards.delete(id)
}