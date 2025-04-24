import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Deck, Card } from '../types'
import { getDecks } from '../services/storageService'
import { Button } from '../ui/common'
import {
  calculateAverageEaseFactor,
  calculateRetentionRate,
  calculateReviewEfficiency,
  getCardsByDifficulty
} from '../services/reportingService'

// Categories of cards based on performance
interface CardStats {
  total: number
  new: number
  learning: number
  review: number
  mastered: number
  dueSoon: number
}

// Interface for the distribution of ease factors
interface EaseFactorDistribution {
  [key: string]: number // range -> count
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cardStats, setCardStats] = useState<CardStats>({
    total: 0,
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
    dueSoon: 0
  })
  const [easeFactorDistribution, setEaseFactorDistribution] = useState<EaseFactorDistribution>({})
  const [loading, setLoading] = useState(true)
  const [averageEaseFactor, setAverageEaseFactor] = useState(0)
  const [retentionRate, setRetentionRate] = useState(0)
  const [reviewEfficiency, setReviewEfficiency] = useState(0)
  const [cardsByDifficulty, setCardsByDifficulty] = useState<{
    easy: Card[]
    medium: Card[]
    hard: Card[]
  }>({ easy: [], medium: [], hard: [] })

  useEffect(() => {
    if (id) {
      const decks = getDecks()
      const foundDeck = decks.find((d) => d.id === id)

      if (foundDeck) {
        setDeck(foundDeck)
        calculateCardStats(foundDeck.cards)

        // Calculate additional stats using reportingService
        setAverageEaseFactor(calculateAverageEaseFactor(foundDeck.cards))
        setRetentionRate(calculateRetentionRate(foundDeck.cards))
        setReviewEfficiency(calculateReviewEfficiency(foundDeck.cards))
        setCardsByDifficulty(getCardsByDifficulty(foundDeck.cards))
      } else {
        navigate('/')
      }

      setLoading(false)
    }
  }, [id, navigate])

  const calculateCardStats = (cards: Card[]): void => {
    const today = new Date()
    const oneWeekFromNow = new Date()
    oneWeekFromNow.setDate(today.getDate() + 7)

    // Initialize stats
    const stats: CardStats = {
      total: cards.length,
      new: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      dueSoon: 0
    }

    // Initialize ease factor distribution
    const easeFactors: EaseFactorDistribution = {
      '<1.5': 0,
      '1.5-2.0': 0,
      '2.0-2.5': 0,
      '2.5-3.0': 0,
      '>3.0': 0
    }

    // Analyze each card
    cards.forEach((card) => {
      // Categorize cards
      if (!card.repetition || card.repetition === 0) {
        stats.new++
      } else if (card.repetition < 3) {
        stats.learning++
      } else if (card.easeFactor && card.easeFactor > 2.5) {
        stats.mastered++
      } else {
        stats.review++
      }

      // Count cards due soon
      if (card.nextReview && card.nextReview <= oneWeekFromNow) {
        stats.dueSoon++
      }

      // Categorize by ease factor
      const ef = card.easeFactor || 2.5
      if (ef < 1.5) {
        easeFactors['<1.5']++
      } else if (ef < 2.0) {
        easeFactors['1.5-2.0']++
      } else if (ef < 2.5) {
        easeFactors['2.0-2.5']++
      } else if (ef < 3.0) {
        easeFactors['2.5-3.0']++
      } else {
        easeFactors['>3.0']++
      }
    })

    setCardStats(stats)
    setEaseFactorDistribution(easeFactors)
  }

  const handleBack = (): void => {
    navigate(`/deck/${id}`)
  }

  if (loading) {
    return <div>{t('common.loading')}</div>
  }

  if (!deck) {
    return <div>{t('common.notFound', { item: t('common.deck') })}</div>
  }

  // Helper function to get card progress percentage
  const getProgressPercentage = (count: number): number => {
    return cardStats.total > 0 ? Math.round((count / cardStats.total) * 100) : 0
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleBack}
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
          {t('common.backTo', { destination: t('common.deck') })}
        </button>
        <h2 className="text-xl font-medium text-gray-800">
          {t('reports.title', { deckName: deck.name })}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {deck.lastReviewed
            ? t('common.lastReviewed', { date: new Date(deck.lastReviewed).toLocaleDateString() })
            : t('common.neverReviewed')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">{t('reports.stats.averageEaseFactor')}</div>
          <div className="text-xl font-semibold">{averageEaseFactor}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">{t('reports.stats.retentionRate')}</div>
          <div className="text-xl font-semibold">{retentionRate}%</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">{t('reports.stats.avgReviewInterval')}</div>
          <div className="text-xl font-semibold">
            {reviewEfficiency} {t('common.days')}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {t('reports.stats.cardStatusOverview')}
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('reports.stats.newCards')}
              </span>
              <span className="text-sm text-gray-500">
                {cardStats.new} ({getProgressPercentage(cardStats.new)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${getProgressPercentage(cardStats.new)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('reports.stats.learningCards')}
              </span>
              <span className="text-sm text-gray-500">
                {cardStats.learning} ({getProgressPercentage(cardStats.learning)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${getProgressPercentage(cardStats.learning)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('reports.stats.reviewCards')}
              </span>
              <span className="text-sm text-gray-500">
                {cardStats.review} ({getProgressPercentage(cardStats.review)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${getProgressPercentage(cardStats.review)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('reports.stats.masteredCards')}
              </span>
              <span className="text-sm text-gray-500">
                {cardStats.mastered} ({getProgressPercentage(cardStats.mastered)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${getProgressPercentage(cardStats.mastered)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">{t('reports.stats.dueCards')}</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{cardStats.dueSoon}</p>
              <p className="text-sm text-gray-500">{t('reports.stats.cardsDueNext7Days')}</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/review/${deck.id}`)}
              disabled={cardStats.dueSoon === 0}
            >
              {t('reports.stats.startReview')}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t('reports.stats.easeFactorDistribution')}
          </h3>
          <div className="space-y-2">
            {Object.entries(easeFactorDistribution).map(([range, count]) => (
              <div key={range}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{range}</span>
                  <span className="text-sm text-gray-500">
                    {count} ({getProgressPercentage(count)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${getProgressPercentage(count)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {t('reports.stats.cardDifficulty')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-50 p-4 border border-green-100">
            <h4 className="text-sm font-medium text-green-800">{t('reports.stats.easyCards')}</h4>
            <p className="text-2xl font-bold text-green-700">{cardsByDifficulty.easy.length}</p>
            <p className="text-xs text-green-600 mt-1">
              {getProgressPercentage(cardsByDifficulty.easy.length)}% {t('reports.stats.ofTotal')}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
            <h4 className="text-sm font-medium text-yellow-800">
              {t('reports.stats.mediumCards')}
            </h4>
            <p className="text-2xl font-bold text-yellow-700">{cardsByDifficulty.medium.length}</p>
            <p className="text-xs text-yellow-600 mt-1">
              {getProgressPercentage(cardsByDifficulty.medium.length)}% {t('reports.stats.ofTotal')}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <h4 className="text-sm font-medium text-red-800">{t('reports.stats.hardCards')}</h4>
            <p className="text-2xl font-bold text-red-700">{cardsByDifficulty.hard.length}</p>
            <p className="text-xs text-red-600 mt-1">
              {getProgressPercentage(cardsByDifficulty.hard.length)}% {t('reports.stats.ofTotal')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {t('reports.stats.deckProgress')}
        </h3>
        <div className="flex items-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray={`${getProgressPercentage(cardStats.mastered)}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-medium">
              {getProgressPercentage(cardStats.mastered)}%
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-700">
              {t('reports.stats.masteredCardsMessage', {
                mastered: cardStats.mastered,
                total: cardStats.total
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t('reports.stats.masteredExplanation')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
