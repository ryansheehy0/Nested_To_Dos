import Dexie from 'dexie'

export const db = new Dexie('nested-to-dos')

db.version(1).stores({
	other: "++id, curBoardID",
	boards: "++id, name, listIDs",
	lists: "++id, name, listIDs, parentID, parentType, folded",
})

export async function getLists(parentID, parentType) {
	let lists = []
	if (parentType === "Board") {
		const parentBoard = await db.boards.get(parentID)
		for (const listID of parentBoard.listIDs) {
			const list = await db.lists.get(listID)
			lists.push(list)
		}
	} else if (parentType === "List") {
		const parentList = await db.lists.get(parentID)
		for (const listID of parentList.listIDs) {
			const list = await db.lists.get(listID)
			lists.push(list)
		}
	}
	return lists
}

export async function recursivelyDeleteList(id, parentID, parentType) {
	// Delete all lists in list
	const list = await db.lists.get(id)
	for (const listID of list.listIDs) {
		await recursivelyDeleteList(listID, id, "List")
	}
	// Remove reference of self in parent
	if (parentType === "Board") {
		const parentBoard = await db.boards.get(parentID)
		parentBoard.listIDs = parentBoard.listIDs.filter((listID) => {return listID !== id})
		await db.boards.update(parentID, {
			listIDs: [...parentBoard.listIDs]
		})
	} else if (parentType === "List") {
		const parentList = await db.lists.get(parentID)
		parentList.listIDs = parentList.listIDs.filter((listID) => {return listID !== id})
		await db.lists.update(parentID, {
			listIDs: [...parentList.listIDs]
		})
	}
	// Delete self
	await db.lists.delete(id)
}

export async function recursivelyDeleteBoard(id) {
	// Delete all lists in board
	const board = await db.boards.get(id)
	for (const listID of board.listIDs) {
		await recursivelyDeleteList(listID, id, "Board")
	}
	// Delete self
	await db.boards.delete(id)
}