import { Card, Deck } from '../types'
import { isCardDue } from './reviewService'

const DEFAULT_EASE_FACTOR = 2.5
const MASTERED_MIN_REPETITIONS = 3
const MASTERED_MIN_EASE_FACTOR = 2.5

export interface CardStats {
  total: number
  new: number
  learning: number
  review: number
  mastered: number
  dueToday: number
  dueThisWeek: number
}

export type EaseFactorRange = '<1.5' | '1.5-2.0' | '2.0-2.5' | '2.5-3.0' | '>3.0'

export type EaseFactorDistribution = Record<EaseFactorRange, number>

export interface CardsByDifficulty {
  easy: Card[]
  medium: Card[]
  hard: Card[]
}

export interface DeckReport {
  cardStats: CardStats
  easeFactorDistribution: EaseFactorDistribution
  cardsByDifficulty: CardsByDifficulty
  averageEaseFactor: number
  retentionRate: number
  averageInterval: number
}

// Supabase returns null for cards that were never reviewed
function getEaseFactor(card: Card): number {
  return card.ease_factor ?? DEFAULT_EASE_FACTOR
}

function getRepetition(card: Card): number {
  return card.repetition ?? 0
}

// SM-2 always sets an interval of at least 1 day after a review
function hasBeenReviewed(card: Card): boolean {
  return (card.interval ?? 0) > 0
}

export function isMastered(card: Card): boolean {
  return (
    getRepetition(card) >= MASTERED_MIN_REPETITIONS &&
    getEaseFactor(card) > MASTERED_MIN_EASE_FACTOR
  )
}

// Calculate learning progress for a deck
export function calculateDeckProgress(deck: Deck): number {
  if (!deck.cards?.length) return 0

  const masteredCards = deck.cards.filter(isMastered).length
  return Math.round((masteredCards / deck.cards.length) * 100)
}

// Get cards by difficulty level
export function getCardsByDifficulty(cards: Card[]): CardsByDifficulty {
  return {
    easy: cards.filter((card) => getEaseFactor(card) > 2.5),
    medium: cards.filter((card) => getEaseFactor(card) >= 1.8 && getEaseFactor(card) <= 2.5),
    hard: cards.filter((card) => getEaseFactor(card) < 1.8)
  }
}

// Calculate average ease factor
export function calculateAverageEaseFactor(cards: Card[]): number {
  if (!cards.length) return 0

  const total = cards.reduce((sum, card) => sum + getEaseFactor(card), 0)
  return parseFloat((total / cards.length).toFixed(2))
}

// Percentage of reviewed cards whose last review was successful
// (SM-2 resets repetition to 0 when a card is failed)
export function calculateRetentionRate(cards: Card[]): number {
  const reviewedCards = cards.filter(hasBeenReviewed)
  if (!reviewedCards.length) return 0

  const retainedCards = reviewedCards.filter((card) => getRepetition(card) > 0).length
  return Math.round((retainedCards / reviewedCards.length) * 100)
}

// Average number of days between reviews for cards that have been reviewed
export function calculateAverageInterval(cards: Card[]): number {
  const reviewedCards = cards.filter(hasBeenReviewed)
  if (!reviewedCards.length) return 0

  const totalInterval = reviewedCards.reduce((sum, card) => sum + (card.interval ?? 0), 0)
  return Math.round(totalInterval / reviewedCards.length)
}

export function getCardStats(cards: Card[], now: Date = new Date()): CardStats {
  const oneWeekFromNow = new Date(now)
  oneWeekFromNow.setDate(now.getDate() + 7)

  const stats: CardStats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
    dueToday: 0,
    dueThisWeek: 0
  }

  cards.forEach((card) => {
    const repetition = getRepetition(card)
    if (repetition === 0) {
      stats.new++
    } else if (repetition < MASTERED_MIN_REPETITIONS) {
      stats.learning++
    } else if (isMastered(card)) {
      stats.mastered++
    } else {
      stats.review++
    }

    if (isCardDue(card, now)) {
      stats.dueToday++
    }
    if (isCardDue(card, oneWeekFromNow)) {
      stats.dueThisWeek++
    }
  })

  return stats
}

export function getEaseFactorDistribution(cards: Card[]): EaseFactorDistribution {
  const distribution: EaseFactorDistribution = {
    '<1.5': 0,
    '1.5-2.0': 0,
    '2.0-2.5': 0,
    '2.5-3.0': 0,
    '>3.0': 0
  }

  cards.forEach((card) => {
    const ef = getEaseFactor(card)
    if (ef < 1.5) {
      distribution['<1.5']++
    } else if (ef < 2.0) {
      distribution['1.5-2.0']++
    } else if (ef < 2.5) {
      distribution['2.0-2.5']++
    } else if (ef < 3.0) {
      distribution['2.5-3.0']++
    } else {
      distribution['>3.0']++
    }
  })

  return distribution
}

export function getDeckReport(cards: Card[], now: Date = new Date()): DeckReport {
  return {
    cardStats: getCardStats(cards, now),
    easeFactorDistribution: getEaseFactorDistribution(cards),
    cardsByDifficulty: getCardsByDifficulty(cards),
    averageEaseFactor: calculateAverageEaseFactor(cards),
    retentionRate: calculateRetentionRate(cards),
    averageInterval: calculateAverageInterval(cards)
  }
}

// Get estimated review schedule for the next 30 days
export function getReviewForecast(cards: Card[]): { date: string; count: number }[] {
  const forecast: { [key: string]: number } = {}
  const today = new Date()

  // Initialize forecast for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateString = date.toISOString().split('T')[0]
    forecast[dateString] = 0
  }

  // Count cards due on each date
  cards.forEach((card) => {
    if (card.next_review) {
      const nextReview = new Date(card.next_review)
      const reviewDate = nextReview.toISOString().split('T')[0]

      if (forecast[reviewDate] !== undefined) {
        forecast[reviewDate]++
      }
    }
  })

  // Convert to array for easier rendering
  return Object.entries(forecast).map(([date, count]) => ({ date, count }))
}
