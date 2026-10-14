import type { SchedulableCard } from './entities'
import { isCardDue } from './srs'

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

export interface CardsByDifficulty<T> {
  easy: T[]
  medium: T[]
  hard: T[]
}

export interface DeckReport<T> {
  cardStats: CardStats
  easeFactorDistribution: EaseFactorDistribution
  cardsByDifficulty: CardsByDifficulty<T>
  masteredPercent: number
  averageEaseFactor: number
  retentionRate: number
  averageInterval: number
}

const easeFactorOf = (card: SchedulableCard): number => card.ease_factor ?? DEFAULT_EASE_FACTOR
const repetitionOf = (card: SchedulableCard): number => card.repetition ?? 0
// SM-2 always sets an interval of at least 1 day after a review
const hasBeenReviewed = (card: SchedulableCard): boolean => (card.interval ?? 0) > 0

const percent = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 100) : 0

export function isMastered(card: SchedulableCard): boolean {
  return (
    repetitionOf(card) >= MASTERED_MIN_REPETITIONS &&
    easeFactorOf(card) > MASTERED_MIN_EASE_FACTOR
  )
}

export function calculateDeckProgress(deck: { cards?: SchedulableCard[] }): number {
  const cards = deck.cards ?? []
  return percent(cards.filter(isMastered).length, cards.length)
}

export function getCardsByDifficulty<T extends SchedulableCard>(cards: T[]): CardsByDifficulty<T> {
  return {
    easy: cards.filter((card) => easeFactorOf(card) > 2.5),
    medium: cards.filter((card) => easeFactorOf(card) >= 1.8 && easeFactorOf(card) <= 2.5),
    hard: cards.filter((card) => easeFactorOf(card) < 1.8)
  }
}

export function calculateAverageEaseFactor(cards: SchedulableCard[]): number {
  if (!cards.length) return 0
  const total = cards.reduce((sum, card) => sum + easeFactorOf(card), 0)
  return parseFloat((total / cards.length).toFixed(2))
}

// Share of reviewed cards whose last review was a pass (SM-2 resets repetition to 0 on a fail)
export function calculateRetentionRate(cards: SchedulableCard[]): number {
  const reviewed = cards.filter(hasBeenReviewed)
  return percent(reviewed.filter((card) => repetitionOf(card) > 0).length, reviewed.length)
}

export function calculateAverageInterval(cards: SchedulableCard[]): number {
  const reviewed = cards.filter(hasBeenReviewed)
  if (!reviewed.length) return 0
  const total = reviewed.reduce((sum, card) => sum + (card.interval ?? 0), 0)
  return Math.round(total / reviewed.length)
}

export function getCardStats(cards: SchedulableCard[], now: Date = new Date()): CardStats {
  const weekFromNow = new Date(now)
  weekFromNow.setDate(now.getDate() + 7)

  const stats: CardStats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
    dueToday: 0,
    dueThisWeek: 0
  }

  for (const card of cards) {
    const repetition = repetitionOf(card)
    if (repetition === 0) stats.new++
    else if (repetition < MASTERED_MIN_REPETITIONS) stats.learning++
    else if (isMastered(card)) stats.mastered++
    else stats.review++

    if (isCardDue(card, now)) stats.dueToday++
    if (isCardDue(card, weekFromNow)) stats.dueThisWeek++
  }

  return stats
}

export function getEaseFactorDistribution(cards: SchedulableCard[]): EaseFactorDistribution {
  const distribution: EaseFactorDistribution = {
    '<1.5': 0,
    '1.5-2.0': 0,
    '2.0-2.5': 0,
    '2.5-3.0': 0,
    '>3.0': 0
  }

  for (const card of cards) {
    const ef = easeFactorOf(card)
    if (ef < 1.5) distribution['<1.5']++
    else if (ef < 2.0) distribution['1.5-2.0']++
    else if (ef < 2.5) distribution['2.0-2.5']++
    else if (ef < 3.0) distribution['2.5-3.0']++
    else distribution['>3.0']++
  }

  return distribution
}

export function getDeckReport<T extends SchedulableCard>(cards: T[], now: Date = new Date()): DeckReport<T> {
  const cardStats = getCardStats(cards, now)
  return {
    cardStats,
    easeFactorDistribution: getEaseFactorDistribution(cards),
    cardsByDifficulty: getCardsByDifficulty(cards),
    masteredPercent: percent(cardStats.mastered, cardStats.total),
    averageEaseFactor: calculateAverageEaseFactor(cards),
    retentionRate: calculateRetentionRate(cards),
    averageInterval: calculateAverageInterval(cards)
  }
}
