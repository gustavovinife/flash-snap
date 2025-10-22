import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Deck } from '../types'
import { Button, Input } from '../ui/common'
import { playPronunciation } from '../services/translationService'
import { useNavigate } from 'react-router-dom'
import { useCards } from '@renderer/hooks/useCards'

interface DeckViewProps {
  deck: Deck
}

export default function DeckView({ deck }: DeckViewProps): React.JSX.Element {
  const { t } = useTranslation()
  const { createCard, deleteCard } = useCards()

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')
  const [newCardContext, setNewCardContext] = useState('')
  const filteredCards = deck.cards.filter(
    (card) =>
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCard = async (): Promise<void> => {
    if (newCardFront.trim() && newCardBack.trim()) {
      try {
        const front = newCardFront.trim()
        const back = newCardBack.trim()
        const context = newCardContext.trim()

        const newCard = {
          front,
          back,
          context,
          deck_id: deck.id
        }

        await createCard.mutateAsync(newCard)

        // Reset form
        setNewCardFront('')
        setNewCardBack('')
        setNewCardContext('')
        setIsAddingCard(false)
      } catch (error) {
        console.error('Error adding card:', error)
        // You could add a toast notification here
      }
    }
  }

  const handleDeleteCard = async (cardId: number): Promise<void> => {
    if (confirm(t('common.deleteConfirm', { item: t('common.card') }))) {
      await deleteCard.mutateAsync(cardId)
    }
  }

  const handleCardClick = (cardId: number): void => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId)
  }

  const handlePlayAudio = (e: React.MouseEvent, cardFront: string): void => {
    e.stopPropagation()
    playPronunciation(cardFront)
  }

  const navigate = useNavigate()

  const handleStartReview = (): void => {
    navigate(`/review/${deck.id}`)
  }

  const handleViewReports = (): void => {
    navigate(`/reports/${deck.id}`)
  }

  const handleOnKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && newCardFront.trim() && newCardBack.trim()) {
      handleAddCard()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
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
            {t('deckView.backToDecks')}
          </button>
          <h2 className="text-xl font-medium text-gray-800">{deck.name}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {t('deckView.cardCount', {
              count: deck.cards.length,
              card: deck.cards.length === 1 ? t('common.card') : t('common.cards')
            })}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStartReview}
            disabled={deck.cards.length === 0}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            {t('common.review')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewReports}
            disabled={deck.cards.length === 0}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            {t('deckView.reports')}
          </Button>
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
            {t('deckView.addCard')}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder={t('deckView.searchCards')}
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
              label={t('deckView.front')}
              placeholder={t('deckView.enterWord')}
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              autoFocus
            />
            <Input
              label={t('deckView.back')}
              placeholder={t('deckView.enterDefinition')}
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              onKeyDown={handleOnKeyDown}
            />
            <Input
              label={t('deckView.context')}
              placeholder={t('deckView.enterContext')}
              value={newCardContext}
              onChange={(e) => setNewCardContext(e.target.value)}
              onKeyDown={handleOnKeyDown}
            />
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50">
            <Button variant="ghost" size="xs" onClick={() => setIsAddingCard(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={handleAddCard}
              disabled={!newCardFront.trim() || !newCardBack.trim()}
            >
              {t('deckView.addCard')}
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
                    {/* Pronunciation is only for language decks */}
                    {deck.type === 'language' && card.front && (
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(e, card.front)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                        aria-label={t('deckView.playPronunciation')}
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
                      aria-label={t('deckView.deleteCard')}
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
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="mt-3 pt-3 border-t border-gray-100"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase">
                          {t('deckView.back')}
                        </h4>
                        <p className="mt-1 text-gray-700">{card.back}</p>
                      </div>

                      {card.context && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase">
                            {t('deckView.context')}
                          </h4>
                          <p className="mt-1 text-gray-700">{card.context}</p>
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
            {searchTerm ? t('deckView.noCardsMatch') : t('deckView.noCardsYet')}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddingCard(true)}>
            {t('deckView.addFirstCard')}
          </Button>
        </div>
      )}
    </div>
  )
}
