import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDueCards, updateCardAfterReview } from '../services/reviewService'
import { Card } from '../types'

const ReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dueCards, setDueCards] = useState<{ card: Card; deckId: string; deckName: string }[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewComplete, setReviewComplete] = useState(false)
  const [cardsReviewed, setCardsReviewed] = useState(0)
  const [showCardStats, setShowCardStats] = useState(false)

  useEffect(() => {
    // Load due cards when component mounts
    const loadDueCards = (): void => {
      const cards = getDueCards(id)
      setDueCards(cards)
    }

    loadDueCards()
  }, [id])

  const handleBack = (): void => {
    if (id) {
      navigate(`/deck/${id}`)
    } else {
      navigate('/')
    }
  }

  const currentCard = dueCards[currentCardIndex]?.card
  const currentDeckId = dueCards[currentCardIndex]?.deckId
  const currentDeckName = dueCards[currentCardIndex]?.deckName

  const handleShowAnswer = (): void => {
    setShowAnswer(true)
  }

  const handleGrade = (grade: number): void => {
    if (!currentCard || !currentDeckId) return

    // Update the card using SM2 algorithm
    updateCardAfterReview(currentDeckId, currentCard, grade)
    setCardsReviewed((prev) => prev + 1)

    // Move to next card or finish review
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setShowAnswer(false)
      setShowCardStats(false)
    } else {
      setReviewComplete(true)
    }
  }

  const handleRestartReview = (): void => {
    const cards = getDueCards(id)
    setDueCards(cards)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setReviewComplete(false)
    setCardsReviewed(0)
    setShowCardStats(false)
  }

  const toggleCardStats = (): void => {
    setShowCardStats(!showCardStats)
  }

  const formatCardStats = (card: Card): React.JSX.Element => {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
        <h4 className="font-medium text-gray-700 mb-2">Card Statistics</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500">Repetitions:</span>
            <span className="ml-2 text-gray-700">{card.repetition || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Interval:</span>
            <span className="ml-2 text-gray-700">{card.interval || 0} days</span>
          </div>
          <div>
            <span className="text-gray-500">Ease Factor:</span>
            <span className="ml-2 text-gray-700">{card.easeFactor?.toFixed(2) || 2.5}</span>
          </div>
          <div>
            <span className="text-gray-500">Next Review:</span>
            <span className="ml-2 text-gray-700">
              {card.nextReview ? new Date(card.nextReview).toLocaleDateString() : 'Not scheduled'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Render loading state
  if (dueCards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-medium mb-6">Review Mode</h2>
          <p className="text-gray-600">No cards due for review!</p>
        </div>
      </div>
    )
  }

  // Render review complete state
  if (reviewComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-medium mb-6">Review Complete!</h2>
          <p className="text-gray-600 mb-6">You&apos;ve reviewed {cardsReviewed} cards.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestartReview}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              Check for More Cards
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Return to Deck
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render review in progress
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <div className="text-sm text-gray-500">
          {currentCardIndex + 1} of {dueCards.length} • Deck: {currentDeckName}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <div className="w-full min-h-[200px] flex flex-col items-center justify-center mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-2">Front</h3>
            <p className="text-xl text-center font-medium">{currentCard?.front}</p>
          </div>

          {showAnswer ? (
            <>
              <div className="w-full min-h-[200px] flex flex-col items-center justify-center mb-4 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm text-gray-500 mb-2">Back</h3>
                <p className="text-xl text-center">{currentCard?.back}</p>
              </div>

              {showCardStats && currentCard && formatCardStats(currentCard)}

              <button
                onClick={toggleCardStats}
                className="mb-6 text-sm text-blue-500 hover:text-blue-700 flex items-center"
              >
                {showCardStats ? 'Hide Stats' : 'Show Stats'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
                <h3 className="text-center text-gray-700 mb-4">
                  How well did you remember this card?
                </h3>
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={() => handleGrade(1)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    1 - Failed
                  </button>
                  <button
                    onClick={() => handleGrade(2)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    2 - Hard
                  </button>
                  <button
                    onClick={() => handleGrade(3)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    3 - Good
                  </button>
                  <button
                    onClick={() => handleGrade(4)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    4 - Easy
                  </button>
                  <button
                    onClick={() => handleGrade(5)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    5 - Perfect
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={handleShowAnswer}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Show Answer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
