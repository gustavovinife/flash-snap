import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Deck } from '../types'
import { getDecks, deleteDeck, addDeck } from '../services/storageService'
import { Button, Input, Select } from '../ui/common'
import { useNavigate } from 'react-router-dom'
import { getDueCards } from '../services/reviewService'
import { calculateDeckProgress } from '../services/reportingService'

interface DeckListProps {
  onDeckSelect: (deck: Deck) => void
}

export default function DeckList({ onDeckSelect }: DeckListProps): React.JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [decks, setDecks] = useState<Deck[]>([])
  const [newDeckName, setNewDeckName] = useState('')
  const [isAddingDeck, setIsAddingDeck] = useState(false)
  const [dueCardCount, setDueCardCount] = useState(0)
  const [newDeckType, setNewDeckType] = useState<'language' | 'knowledge'>('language')

  useEffect(() => {
    loadDecks()

    // Count due cards
    const dueCards = getDueCards()
    setDueCardCount(dueCards.length)
  }, [])

  const loadDecks = (): void => {
    const decks = getDecks()
    setDecks(decks)
  }

  const handleDeleteDeck = (e: React.MouseEvent, deckId: string): void => {
    e.stopPropagation() // Prevent triggering the deck click
    if (confirm(t('common.deleteConfirm', { item: t('common.deck') }))) {
      deleteDeck(deckId)
      loadDecks()
    }
  }

  const handleAddDeck = (): void => {
    if (newDeckName.trim()) {
      const newDeck: Deck = {
        id: Date.now().toString(),
        name: newDeckName.trim(),
        cards: [],
        createdAt: new Date(),
        type: newDeckType
      }
      addDeck(newDeck)
      setNewDeckName('')
      setIsAddingDeck(false)
      loadDecks()
    }
  }

  const handleDeckClick = (deck: Deck): void => {
    onDeckSelect(deck)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleAddDeck()
    } else if (e.key === 'Escape') {
      setIsAddingDeck(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="my-6">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/review')}
          disabled={dueCardCount === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          {t('deckList.startReview')}{' '}
          {dueCardCount > 0 && t('deckList.cardsDue', { count: dueCardCount })}
        </Button>
      </div>

      <hr className="my-6 border-gray-200" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-800">{t('deckList.title')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingDeck(true)}
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
          {t('common.add')}
        </Button>
      </div>

      {isAddingDeck && (
        <div className="mb-6 bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="p-3">
            <Input
              placeholder={t('deckList.deckName')}
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
            />
          </div>

          <div className="p-3">
            <Select
              label={t('deckList.deckType')}
              options={[
                { label: t('deckList.language'), value: 'language' },
                { label: t('deckList.knowledge'), value: 'knowledge' }
              ]}
              onChange={(e) => setNewDeckType(e.target.value as 'language' | 'knowledge')}
            />
          </div>
          <div className="p-3 flex justify-end gap-2">
            <Button variant="ghost" size="xs" onClick={() => setIsAddingDeck(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="xs" onClick={handleAddDeck}>
              {t('common.create')}
            </Button>
          </div>
        </div>
      )}

      {decks.length > 0 ? (
        <>
          <div className="text-xs text-gray-400 mb-2 ml-1">
            {t('deckList.deckCount', {
              count: decks.length,
              deck: decks.length === 1 ? t('common.deck') : t('common.decks')
            })}
          </div>
          <ul className="space-y-3">
            {decks.map((deck) => (
              <li
                key={deck.id}
                className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-200 cursor-pointer"
                onClick={() => handleDeckClick(deck)}
              >
                <div className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">{deck.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {deck.cards.length}{' '}
                      {deck.cards.length === 1 ? t('common.card') : t('common.cards')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="relative w-8 h-8"
                      title={`${calculateDeckProgress(deck)}% Cards Mastered`}
                    >
                      <svg className="w-8 h-8" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeDasharray={`${calculateDeckProgress(deck)}, 100`}
                        />
                      </svg>
                      <div
                        className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                        style={{ fontSize: '0.60rem' }}
                      >
                        {calculateDeckProgress(deck)}%
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDeck(e, deck.id)}
                      className="text-gray-300 hover:text-gray-500 p-1 rounded-full transition-colors duration-200"
                      aria-label={t('deckList.deleteDeck')}
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
              </li>
            ))}
          </ul>
        </>
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-4">{t('deckList.noDeck')}</p>
          <Button variant="primary" size="sm" onClick={() => setIsAddingDeck(true)}>
            {t('deckList.createFirstDeck')}
          </Button>
        </div>
      )}
    </div>
  )
}
