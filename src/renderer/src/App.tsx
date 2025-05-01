import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AddCard from './components/AddCard'
import Layout from './components/Layout'
import { getDecks } from './services/storageService'

function App(): React.JSX.Element {
  const [capturedText, setCapturedText] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for text captured from main process
    if ((window.api as any)?.onTextCaptured) {
      ;(window.api as any).onTextCaptured((text: string) => {
        setCapturedText(text)
      })
    }
  }, [])

  const handleCloseAddCard = (): void => {
    setCapturedText(null)
  }

  const handleCardAdded = (deckId: string): void => {
    // Find and select the deck that the card was added to
    const decks = getDecks()
    const updatedDeck = decks.find((deck) => deck.id === deckId)
    if (updatedDeck) {
      navigate(`/deck/${deckId}`)
    }
    setCapturedText(null)
  }

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>

      {capturedText && (
        <AddCard
          capturedText={capturedText}
          onClose={handleCloseAddCard}
          onCardAdded={handleCardAdded}
        />
      )}
    </>
  )
}

export default App
