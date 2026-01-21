import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../types'
import { getDueCards, updateCardAfterReview } from '../services/reviewService'
import { useDecks } from '../hooks/useDecks'
import { useCards } from '../hooks/useCards'
import { playPronunciation } from '../services/translationService'

const ReviewPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { decks } = useDecks()
  const { updateCard } = useCards()

  const [dueCards, setDueCards] = useState<{ card: Card; deckId: string; deckName: string }[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewComplete, setReviewComplete] = useState(false)
  const [cardsReviewed, setCardsReviewed] = useState(0)
  const [showCardStats, setShowCardStats] = useState(false)
  const [currentDeckName, setCurrentDeckName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Safe access to currentCard to prevent accessing undefined
  const currentCard =
    dueCards.length > 0 && currentCardIndex < dueCards.length
      ? dueCards[currentCardIndex].card
      : null

  const isDeckLanguage =
    currentCard && currentCard.deck_id
      ? decks.find((d) => d.id === currentCard.deck_id)?.type === 'language'
      : false

  useEffect(() => {
    async function loadDueCards(): Promise<void> {
      try {
        setIsLoading(true)
        const cards = await getDueCards(decks, id)

        // Shuffle the cards to avoid always reviewing in the same order
        const shuffledCards = [...cards].sort(() => Math.random() - 0.5)

        setDueCards(shuffledCards)

        if (shuffledCards.length > 0) {
          setCurrentDeckName(shuffledCards[0].deckName)
        }
      } catch (error) {
        console.error('Error loading due cards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDueCards()
  }, [decks, id])

  const handleBack = useCallback(() => {
    navigate(id ? `/deck/${id}` : '/')
  }, [navigate, id])

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true)
  }, [])

  const handleGrade = useCallback(
    async (grade: number) => {
      if (!currentCard || currentCardIndex >= dueCards.length) return

      const currentDueCard = dueCards[currentCardIndex]
      const currentDeck = decks.find((d) => d.id === currentDueCard.deckId)

      if (currentDeck) {
        try {
          await updateCardAfterReview(
            currentDeck,
            currentCard,
            grade,
            updateCard,
            { mutateAsync: async () => {} } // We don't need to update the deck in this case
          )

          setCardsReviewed((prev) => prev + 1)

          // Remove the current card from dueCards since it's been reviewed
          setDueCards((prev) => prev.filter((_, index) => index !== currentCardIndex))

          // If there are more cards, stay at the same index (since we removed the current card)
          // If no more cards, mark review as complete
          if (dueCards.length <= 1) {
            setReviewComplete(true)
          } else {
            setShowAnswer(false)
            setShowCardStats(false)
          }
        } catch (error) {
          console.error('Error updating card after review:', error)
        }
      }
    },
    [currentCard, currentCardIndex, dueCards, decks, updateCard]
  )

  const toggleCardStats = useCallback(() => {
    setShowCardStats((prev) => !prev)
  }, [])

  const handleRestartReview = useCallback(() => {
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setReviewComplete(false)
    setCardsReviewed(0)
    setShowCardStats(false)
  }, [])

  const handlePlayAudio = useCallback(() => {
    if (currentCard?.front) {
      playPronunciation(currentCard.front)
    }
  }, [currentCard])

  const formatCardStats = (card: Card): React.ReactNode => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
      <h4 className="font-medium text-gray-700 mb-2">{t('review.cardStatistics')}</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-500">{t('review.repetitions')}:</span>
          <span className="ml-2 text-gray-700">{card.repetition || 0}</span>
        </div>
        <div>
          <span className="text-gray-500">{t('review.interval')}:</span>
          <span className="ml-2 text-gray-700">
            {card.interval || 0} {t('common.days')}
          </span>
        </div>
        <div>
          <span className="text-gray-500">{t('review.easeFactor')}:</span>
          <span className="ml-2 text-gray-700">{card.ease_factor?.toFixed(2) || 2.5}</span>
        </div>
        <div>
          <span className="text-gray-500">{t('review.nextReview')}:</span>
          <span className="ml-2 text-gray-700">
            {card.next_review
              ? new Date(card.next_review).toLocaleDateString()
              : t('review.notScheduled')}
          </span>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray hover:text-primary"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('common.back')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-medium mb-6">{t('review.reviewMode')}</h2>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (dueCards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray hover:text-primary"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('common.back')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-medium mb-6">{t('review.reviewMode')}</h2>
          <p className="text-gray-600">{t('review.noCardsDue')}</p>
        </div>
      </div>
    )
  }

  if (reviewComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray hover:text-primary"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('common.back')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-medium mb-6">{t('review.reviewComplete')}</h2>
          <p className="text-gray-600 mb-6">
            {t('review.cardsReviewed', { count: cardsReviewed })}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestartReview}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              {t('review.checkMoreCards')}
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              {t('review.returnToDeck')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray hover:text-primary"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('common.back')}
        </button>
        <div className="text-sm text-gray-500">
          {t('review.cardCount', { current: currentCardIndex + 1, total: dueCards.length })} •{' '}
          {t('review.deckName', { name: currentDeckName })}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <div className="w-full min-h-[100px] flex flex-col items-center justify-center mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <h3 className="text-sm text-gray-500 mb-2 mr-2">{t('review.front')}</h3>
              {isDeckLanguage && currentCard?.front && (
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors mb-2"
                  aria-label={t('review.playPronunciation')}
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
            </div>
            <p className="text-xl text-center font-medium">{currentCard?.front}</p>
          </div>
          {showAnswer ? (
            <>
              <div className="w-full min-h-[100px] flex flex-col items-center justify-center mb-4 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm text-gray-500 mb-2">{t('review.back')}</h3>
                <p className="text-xl text-center">{currentCard?.back}</p>

                {currentCard?.context && (
                  <div className="w-full flex flex-col items-center justify-center mb-4 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-2">{t('review.context')}</h3>
                    <p className="text-xl text-center">{currentCard?.context}</p>
                  </div>
                )}
              </div>

              {showCardStats && currentCard && formatCardStats(currentCard)}
              <button
                onClick={toggleCardStats}
                className="mb-6 text-sm text-purple-500 hover:text-purple-700 flex items-center"
              >
                {showCardStats ? t('review.hideStats') : t('review.showStats')}
                <svg
                  className={`h-4 w-4 ml-1 transition-transform ${showCardStats ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="mt-6">
                <h3 className="text-center text-gray-700 mb-4">{t('review.howWellRemembered')}</h3>
                <div className="flex space-x-2 justify-center">
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => handleGrade(grade)}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${
                        [
                          'bg-red-500 hover:bg-red-600',
                          'bg-orange-500 hover:bg-orange-600',
                          'bg-yellow-500 hover:bg-yellow-600',
                          'bg-green-500 hover:bg-green-600',
                          'bg-blue-500 hover:bg-blue-600'
                        ][grade - 1]
                      }`}
                    >
                      {t(`review.grade${grade}`)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={handleShowAnswer}
              className="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              {t('review.showAnswer')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
