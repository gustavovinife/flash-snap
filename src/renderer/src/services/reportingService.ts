import { Card, Deck } from '../types'

// Calculate learning progress for a deck
export function calculateDeckProgress(deck: Deck): number {
  if (!deck.cards.length) return 0

  const masteredCards = deck.cards.filter((card) => card.easeFactor && card.easeFactor > 2.5).length
  return Math.round((masteredCards / deck.cards.length) * 100)
}

// Get cards by difficulty level
export function getCardsByDifficulty(cards: Card[]): {
  easy: Card[]
  medium: Card[]
  hard: Card[]
} {
  return {
    easy: cards.filter((card) => card.easeFactor && card.easeFactor > 2.5),
    medium: cards.filter(
      (card) => card.easeFactor && card.easeFactor >= 1.8 && card.easeFactor <= 2.5
    ),
    hard: cards.filter((card) => card.easeFactor && card.easeFactor < 1.8)
  }
}

// Calculate average ease factor
export function calculateAverageEaseFactor(cards: Card[]): number {
  if (!cards.length) return 0

  const total = cards.reduce((sum, card) => sum + (card.easeFactor || 2.5), 0)
  return parseFloat((total / cards.length).toFixed(2))
}

// Calculate retention rate (correct responses)
export function calculateRetentionRate(cards: Card[]): number {
  const cardsWithHistory = cards.filter(
    (card) => card.repetition !== undefined && card.repetition > 0
  )
  if (!cardsWithHistory.length) return 0

  // Cards with ease factor > 1.3 likely had mostly correct responses
  const goodResponses = cardsWithHistory.filter(
    (card) => card.easeFactor && card.easeFactor > 1.3
  ).length
  return Math.round((goodResponses / cardsWithHistory.length) * 100)
}

// Calculate review efficiency (average time between reviews)
export function calculateReviewEfficiency(cards: Card[]): number {
  const cardsWithInterval = cards.filter((card) => card.interval !== undefined && card.interval > 0)
  if (!cardsWithInterval.length) return 0

  const totalInterval = cardsWithInterval.reduce((sum, card) => sum + (card.interval || 0), 0)
  return Math.round(totalInterval / cardsWithInterval.length)
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
    if (card.nextReview) {
      const nextReview = new Date(card.nextReview)
      const reviewDate = nextReview.toISOString().split('T')[0]

      if (forecast[reviewDate] !== undefined) {
        forecast[reviewDate]++
      }
    }
  })

  // Convert to array for easier rendering
  return Object.entries(forecast).map(([date, count]) => ({ date, count }))
}
