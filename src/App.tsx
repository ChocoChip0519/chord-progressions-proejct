import { useState } from 'react'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'
import { useEditorStore } from './store/useEditorStore'

type View = 'home' | 'editor'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [editCardId, setEditCardId] = useState<string | undefined>()
  const reset = useEditorStore(s => s.reset)

  const goToNewEditor = () => {
    reset()
    setEditCardId(undefined)
    setView('editor')
  }

  const goToEditCard = (id: string) => {
    reset()
    setEditCardId(id)
    setView('editor')
  }

  const goHome = () => setView('home')

  return (
    <>
      {view === 'home' && (
        <HomePage onNewCard={goToNewEditor} onOpenCard={goToEditCard} />
      )}
      {view === 'editor' && (
        <EditorPage cardId={editCardId} onBack={goHome} />
      )}
    </>
  )
}
