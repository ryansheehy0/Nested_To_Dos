import Navbar from './components/Navbar'
import BoardView from './components/BoardView'
import { db } from './db'
import { useEffect, useState } from 'react'

/* To Do
- Add lists to lists
- Save icon
- Open icon
- Folding
- Moving
- PWA

- Fix icons
  - Icon sizes the same for lists and boards
  - Thinner icon lines
- Fix width and sizing of everything

- Review code and clean everything
- Fix readme
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
    <div className='w-screen h-screen flex flex-row'>
      <Navbar/>
      <BoardView/>
    </div>
  )
}

export default App
