import Dexie from 'dexie'
import { saveAs } from 'file-saver'

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
		if (!parentBoard) return []
		for (const listID of parentBoard.listIDs) {
			const list = await db.lists.get(listID)
			lists.push(list)
		}
	} else if (parentType === "List") {
		const parentList = await db.lists.get(parentID)
		if (!parentList) return []
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

export async function download() {
	const other = await db.other.toArray()
	const boards = await db.boards.toArray()
	const lists = await db.lists.toArray()
	const downloadObj = {
		other,
		boards,
		lists
	}
  const downloadJson = JSON.stringify(downloadObj, null, 2)
  const blob = new Blob([downloadJson], { type: "application/json"})
  saveAs(blob, "nested_to_dos.json")
}

export async function upload(event) {
	try {
		// Get the uploaded file
		const uploadedJson = await event.target.files[0].text()
		// Convert json to obj
    const uploadedObj = JSON.parse(uploadedJson)
		// Set db with values from object
		await db.transaction("rw", db.other, db.boards, db.lists, async () => {
			// Add other
			await db.other.clear()
			await db.other.add(uploadedObj.other[0])
			// Add boards
			await db.boards.clear()
      for(const board of uploadedObj.boards){
        await db.boards.add(board)
      }
			// Add lists
      await db.lists.clear()
      for(const list of uploadedObj.lists){
        await db.lists.add(list)
      }
		})
	} catch {
		alert(`Couldn't open ${event.target.files[0].name}`)
	} finally {
    // Reset value so onChange runs again
    event.target.value = ""
	}
}

export async function removeMovingListIDFromItsParent(movingListID) {
	const movingList = await db.lists.get(movingListID)
	if (movingList.parentType === "Board") {
		const parentBoard = await db.boards.get(movingList.parentID)
		parentBoard.listIDs = parentBoard.listIDs.filter((listID) => listID !== movingListID)
		await db.boards.update(movingList.parentID, {
			listIDs: parentBoard.listIDs
		})
	} else if (movingList.parentType === "List") {
		const parentList = await db.lists.get(movingList.parentID)
		parentList.listIDs = parentList.listIDs.filter((listID) => listID !== movingListID)
		await db.lists.update(movingList.parentID, {
			listIDs: parentList.listIDs
		})
	}
}
