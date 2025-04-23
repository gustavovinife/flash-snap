import { useState, useEffect } from 'react'
import Versions from './components/Versions'
import DeckList from './components/DeckList'
import { Deck } from './types'
import DeckView from './components/DeckView'
import AddCard from './components/AddCard'
import Logo from './components/Logo'
import { getDecks } from './services/storageService'

// Define window API types
declare global {
  interface Window {
    api: {
      onTextCaptured: (callback: (text: string) => void) => void
    }
  }
}

function App(): React.JSX.Element {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [capturedText, setCapturedText] = useState<string | null>(null)

  useEffect(() => {
    // Listen for text captured from main process
    window.api.onTextCaptured((text) => {
      console.log('Text captured in renderer:', text)
      setCapturedText(text)
    })
  }, [])

  const handleDeckSelect = (deck: Deck): void => {
    setSelectedDeck(deck)
  }

  const handleBackToDecks = (): void => {
    setSelectedDeck(null)
  }

  const handleCloseAddCard = (): void => {
    setCapturedText(null)
  }

  const handleCardAdded = (deckId: string): void => {
    // Find and select the deck that the card was added to
    const decks = getDecks()
    const updatedDeck = decks.find((deck) => deck.id === deckId)
    if (updatedDeck) {
      setSelectedDeck(updatedDeck)
    }
    setCapturedText(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <h1 className="text-2xl font-medium text-gray-800">Flash Snap</h1>
              <p className="text-sm text-gray-400 mt-1">A lightweight, passive memorization tool</p>
            </div>
          </div>
        </header>

        <main>
          {selectedDeck ? (
            <DeckView
              deck={selectedDeck}
              onBack={handleBackToDecks}
              onDeckUpdated={setSelectedDeck}
            />
          ) : (
            <DeckList onDeckSelect={handleDeckSelect} />
          )}
        </main>

        {capturedText && (
          <AddCard
            capturedText={capturedText}
            onClose={handleCloseAddCard}
            onCardAdded={handleCardAdded}
          />
        )}

        <footer className="mt-16 pt-6 border-t border-gray-100">
          <Versions />
        </footer>
      </div>
    </div>
  )
}

export default App
