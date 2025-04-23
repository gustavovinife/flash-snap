import { useState } from 'react'
import { Deck, Card } from '../types'
import { Button, Input } from '../ui/common'
import { updateDeck } from '../services/storageService'
import { playPronunciation } from '../services/translationService'

interface DeckViewProps {
  deck: Deck
  onBack: () => void
  onDeckUpdated: (updatedDeck: Deck) => void
}

interface ExtendedCard extends Card {
  translation?: string
  pronunciation?: string
  audioUrl?: string
}

export default function DeckView({
  deck,
  onBack,
  onDeckUpdated
}: DeckViewProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')
  const [newCardTranslation, setNewCardTranslation] = useState('')

  // Mock data as state - in a real app, this would come from an API or be part of the card object
  const [translations, setTranslations] = useState<Record<string, string>>({
    Ephemeral: 'Efêmero',
    Ubiquitous: 'Onipresente',
    Serendipity: 'Serendipidade',
    'What is a closure?': 'O que é uma closure?',
    'What is immutability?': 'O que é imutabilidade?',
    'What is a pure function?': 'O que é uma função pura?',
    'The unexamined life is not worth living': 'A vida não examinada não vale a pena ser vivida',
    'The only thing we have to fear is fear itself':
      'A única coisa que devemos temer é o próprio medo',
    'In the middle of difficulty lies opportunity':
      'No meio da dificuldade encontra-se a oportunidade'
  })

  const mockPronunciations: Record<string, string> = {
    Ephemeral: 'ɪˈfɛm(ə)r(ə)l',
    Ubiquitous: 'juːˈbɪkwɪtəs',
    Serendipity: 'ˌsɛr(ə)nˈdɪpɪti'
  }

  // Convert Cards to ExtendedCards with translation and pronunciation
  const extendedCards: ExtendedCard[] = deck.cards.map((card) => ({
    ...card,
    translation: translations[card.front] || '',
    pronunciation: mockPronunciations[card.front] || '',
    audioUrl: '' // Would link to audio file in real app
  }))

  // Filter cards based on search term
  const filteredCards = extendedCards.filter(
    (card) =>
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.translation && card.translation.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddCard = (): void => {
    if (newCardFront.trim() && newCardBack.trim()) {
      const front = newCardFront.trim()
      const back = newCardBack.trim()
      const translation = newCardTranslation.trim()

      // Add to translation dictionary if provided
      if (translation) {
        setTranslations((prev) => ({
          ...prev,
          [front]: translation
        }))
      }

      const newCard: Card = {
        id: Date.now().toString(),
        front,
        back
      }

      const updatedDeck = {
        ...deck,
        cards: [...deck.cards, newCard]
      }

      updateDeck(updatedDeck)
      onDeckUpdated(updatedDeck)

      // Reset form
      setNewCardFront('')
      setNewCardBack('')
      setNewCardTranslation('')
      setIsAddingCard(false)
    }
  }

  const handleDeleteCard = (cardId: string): void => {
    if (confirm('Are you sure you want to delete this card?')) {
      const updatedDeck = {
        ...deck,
        cards: deck.cards.filter((card) => card.id !== cardId)
      }

      updateDeck(updatedDeck)
      onDeckUpdated(updatedDeck)
    }
  }

  const handleCardClick = (cardId: string): void => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId)
  }

  const handlePlayAudio = (e: React.MouseEvent, cardFront: string): void => {
    e.stopPropagation()
    playPronunciation(cardFront)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && newCardFront && newCardBack) {
      handleAddCard()
    } else if (e.key === 'Escape') {
      setIsAddingCard(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Decks
          </button>
          <h2 className="text-xl font-medium text-gray-800">{deck.name}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddingCard(true)}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Add Card
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </div>

      {isAddingCard && (
        <div className="mb-6 bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="p-4 space-y-4">
            <Input
              label="Front"
              placeholder="Enter the word or phrase"
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              autoFocus
            />
            <Input
              label="Back"
              placeholder="Enter the definition or meaning"
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
            />
            <Input
              label="Translation (Portuguese)"
              placeholder="Enter the Portuguese translation"
              value={newCardTranslation}
              onChange={(e) => setNewCardTranslation(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50">
            <Button variant="ghost" size="xs" onClick={() => setIsAddingCard(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={handleAddCard}
              disabled={!newCardFront.trim() || !newCardBack.trim()}
            >
              Add Card
            </Button>
          </div>
        </div>
      )}

      {filteredCards.length > 0 ? (
        <ul className="space-y-3">
          {filteredCards.map((card) => (
            <li
              key={card.id}
              className={`
                bg-white rounded-lg border overflow-hidden transition-all duration-200
                ${expandedCardId === card.id ? 'border-gray-300' : 'border-gray-100 hover:border-gray-200 cursor-pointer'}
              `}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{card.front}</h3>
                    {expandedCardId !== card.id && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{card.back}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {card.front && (
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(e, card.front)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                        aria-label="Play pronunciation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCard(card.id)
                      }}
                      className="text-gray-300 hover:text-gray-500 p-1 rounded-full transition-colors"
                      aria-label="Delete card"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedCardId === card.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase">Definition</h4>
                        <p className="mt-1 text-gray-700">{card.back}</p>
                      </div>

                      {card.translation && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase">
                            Portuguese Translation
                          </h4>
                          <p className="mt-1 text-gray-700">{card.translation}</p>
                        </div>
                      )}

                      {card.front && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase">
                            Pronunciation
                          </h4>
                          <div className="mt-1 flex items-center">
                            <span className="text-gray-700 mr-2">{card.pronunciation}</span>
                            <button
                              onClick={(e) => handlePlayAudio(e, card.front)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                              aria-label="Play pronunciation"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {searchTerm ? 'No cards match your search' : 'No cards in this deck yet'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddingCard(true)}>
            Add your first card
          </Button>
        </div>
      )}
    </div>
  )
}
