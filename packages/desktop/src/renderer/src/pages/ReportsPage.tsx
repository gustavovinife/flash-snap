import React, { useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'
import { Button } from '../ui/common'
import { getDeckReport } from '../services/reportingService'
import { useDecks } from '../hooks/useDecks'

const ReportsPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const posthog = usePostHog()
  const { decks, isLoading } = useDecks()
  const trackedDeckIdRef = useRef<string | null>(null)

  const deck = useMemo(() => decks.find((d) => d.id === id) ?? null, [decks, id])
  const report = useMemo(() => (deck ? getDeckReport(deck.cards ?? []) : null), [deck])

  useEffect(() => {
    if (!isLoading && !deck) {
      navigate('/')
    }
  }, [isLoading, deck, navigate])

  useEffect(() => {
    if (deck && trackedDeckIdRef.current !== deck.id) {
      trackedDeckIdRef.current = deck.id
      posthog.capture('page_viewed', { page: 'reports', deck_id: deck.id, deck_name: deck.name })
    }
  }, [deck, posthog])

  const handleBack = (): void => {
    navigate(`/deck/${id}`)
  }

  if (isLoading) {
    return <div>{t('common.loading')}</div>
  }

  if (!deck || !report) {
    return <div>{t('common.notFound', { item: t('common.deck') })}</div>
  }

  const {
    cardStats,
    easeFactorDistribution,
    cardsByDifficulty,
    averageEaseFactor,
    retentionRate,
    averageInterval
  } = report

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
          {deck.last_reviewed
            ? t('common.lastReviewed', { date: new Date(deck.last_reviewed).toLocaleDateString() })
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
            {averageInterval} {t('common.days')}
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
          <div className="mb-4 flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-gray-800">{cardStats.dueToday}</p>
              <p className="text-sm text-gray-500">{t('reports.stats.cardsDueToday')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{cardStats.dueThisWeek}</p>
              <p className="text-sm text-gray-500">{t('reports.stats.cardsDueNext7Days')}</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/review/${deck.id}`)}
            disabled={cardStats.dueToday === 0}
          >
            {t('reports.stats.startReview')}
          </Button>
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
