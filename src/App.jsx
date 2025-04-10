import Navbar from './components/Navbar'
import BoardView from './components/BoardView'
import { db } from './db'
import { useEffect, useState } from 'react'

/* To Do
- Moving
  - Remove click events for things that are transparent

- Visuals
  - Fix icons
    - Icon sizes the same for lists and boards
    - Thinner icon lines
    - Clean up assets folder
  - New lists cause the vertical scrollbar to show up for some reason
  - Background radius gradient chaining as you add new lists

- Review code, clean everything, and add comments
- Fix readme
  - List all the features and screen shots on how to use them.
- Buy and upload to nestedtodos.com
- Test PWA in distribution
*/

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadApp() {
      // If no board then add one and set the curBoardID to that board
      const board = await db.boards.toArray()
      if (board.length === 0) {
        const newBoardID = await db.boards.add({
          name: "To Dos",
          listIDs: []
        })
        await db.other.add({
          curBoardID: newBoardID
        })
      }
      setLoading(false)
    }
    loadApp()
  })

  if (loading) return null

  return (
    <div className='w-fit min-w-screen h-screen flex flex-row bg-radial-[at_50vw_50vh] to-black from-neutral-600'>
      <Navbar/>
      <BoardView/>
    </div>
  )
}

export default App
