import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Deck, Card } from '../types'
import { Button, Input } from '../ui/common'
import { getDecks, updateDeck } from '../services/storageService'

interface AddCardProps {
  capturedText: string
  onClose: () => void
  onCardAdded: (deckId: string) => void
}

export default function AddCard({
  capturedText,
  onClose,
  onCardAdded
}: AddCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string>('')
  const [cardFront, setCardFront] = useState(capturedText)
  const [cardBack, setCardBack] = useState('')
  const [cardTranslation, setCardTranslation] = useState('')

  useEffect(() => {
    // Load decks
    const availableDecks = getDecks()
    setDecks(availableDecks)

    // Set first deck as default if available
    if (availableDecks.length > 0) {
      setSelectedDeckId(availableDecks[0].id)
    }
  }, [])

  const handleAddCard = (): void => {
    if (!cardFront.trim() || !selectedDeckId) return

    // Find the selected deck
    const targetDeck = decks.find((deck) => deck.id === selectedDeckId)
    if (!targetDeck) return

    // Create new card
    const newCard: Card = {
      id: Date.now().toString(),
      front: cardFront.trim(),
      back: cardBack.trim()
    }

    // Add card to deck
    const updatedDeck = {
      ...targetDeck,
      cards: [...targetDeck.cards, newCard]
    }

    // Save to storage
    updateDeck(updatedDeck)

    // If translation provided, save it in local storage or to a translations service
    if (cardTranslation.trim()) {
      // This is a simplified approach - in a real app, this might
      // be stored differently or handled by a separate service
      const existingTranslations = localStorage.getItem('translations')
      const translations = existingTranslations ? JSON.parse(existingTranslations) : {}

      translations[cardFront.trim()] = cardTranslation.trim()
      localStorage.setItem('translations', JSON.stringify(translations))
    }

    // Notify parent
    onCardAdded(selectedDeckId)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && cardFront && selectedDeckId) {
      handleAddCard()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{t('addCard.title')}</h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addCard.selectDeck')}
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {decks.length === 0 && (
                <option value="" disabled>
                  {t('addCard.noDecksAvailable')}
                </option>
              )}
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t('addCard.front')}
            value={cardFront}
            onChange={(e) => setCardFront(e.target.value)}
            placeholder={t('addCard.termPlaceholder')}
          />

          <Input
            label={t('addCard.back')}
            value={cardBack}
            onChange={(e) => setCardBack(e.target.value)}
            placeholder={t('addCard.definitionPlaceholder')}
          />

          <Input
            label={t('addCard.translation')}
            value={cardTranslation}
            onChange={(e) => setCardTranslation(e.target.value)}
            placeholder={t('addCard.translationPlaceholder')}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCard}
            disabled={!cardFront.trim() || !selectedDeckId}
          >
            {t('addCard.addCard')}
          </Button>
        </div>
      </div>
    </div>
  )
}
