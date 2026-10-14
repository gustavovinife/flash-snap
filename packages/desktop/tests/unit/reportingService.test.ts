/**
 * Unit Tests for Reporting Service
 *
 * Cards are built the way Supabase returns them: timestamps as ISO strings and
 * scheduling fields as null for cards that were never reviewed.
 */

import { describe, it, expect } from 'vitest'
import {
  getDeckReport,
  getCardStats,
  calculateDeckProgress,
  calculateRetentionRate,
  getCardsByDifficulty,
  isMastered
} from '../../src/renderer/src/services/reportingService'
import { Card, Deck } from '../../src/renderer/src/types'

const NOW = new Date(2026, 9, 14, 16, 0, 0)

function daysFromNow(days: number): Date {
  const date = new Date(NOW)
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date
}

interface DbCardOverrides {
  id?: number
  interval?: number | null
  repetition?: number | null
  ease_factor?: number | null
  next_review?: string | null
}

function createDbCard(overrides: DbCardOverrides = {}): Card {
  return {
    id: 1,
    front: 'Question',
    back: 'Answer',
    interval: null,
    repetition: null,
    ease_factor: null,
    next_review: null,
    ...overrides
  } as unknown as Card
}

const newCard = (): Card => createDbCard()

const reviewedCard = (overrides: DbCardOverrides & { dueInDays: number }): Card => {
  const { dueInDays, ...rest } = overrides
  return createDbCard({
    interval: 1,
    repetition: 1,
    ease_factor: 2.5,
    next_review: daysFromNow(dueInDays).toISOString(),
    ...rest
  })
}

describe('getCardStats', () => {
  it('counts cards with ISO string next_review that are due today and this week', () => {
    const cards = [
      reviewedCard({ dueInDays: -2 }),
      reviewedCard({ dueInDays: 0 }),
      reviewedCard({ dueInDays: 3 }),
      reviewedCard({ dueInDays: 7 }),
      reviewedCard({ dueInDays: 8 })
    ]

    const stats = getCardStats(cards, NOW)

    expect(stats.dueToday).toBe(2)
    expect(stats.dueThisWeek).toBe(4)
  })

  it('treats never-reviewed cards as due today', () => {
    const stats = getCardStats([newCard(), newCard()], NOW)

    expect(stats.dueToday).toBe(2)
    expect(stats.dueThisWeek).toBe(2)
  })

  it('categorizes cards into new, learning, review and mastered', () => {
    const cards = [
      newCard(),
      reviewedCard({ dueInDays: 1, repetition: 2 }),
      reviewedCard({ dueInDays: 10, repetition: 3, ease_factor: 2.3, interval: 15 }),
      reviewedCard({ dueInDays: 20, repetition: 4, ease_factor: 2.7, interval: 30 })
    ]

    const stats = getCardStats(cards, NOW)

    expect(stats).toMatchObject({ total: 4, new: 1, learning: 1, review: 1, mastered: 1 })
  })

  it('returns zeros for an empty deck', () => {
    expect(getCardStats([], NOW)).toEqual({
      total: 0,
      new: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      dueToday: 0,
      dueThisWeek: 0
    })
  })
})

describe('isMastered / calculateDeckProgress', () => {
  it('requires both enough repetitions and a high ease factor', () => {
    expect(isMastered(reviewedCard({ dueInDays: 5, repetition: 1, ease_factor: 2.8 }))).toBe(false)
    expect(isMastered(reviewedCard({ dueInDays: 5, repetition: 5, ease_factor: 2.5 }))).toBe(false)
    expect(isMastered(reviewedCard({ dueInDays: 5, repetition: 3, ease_factor: 2.6 }))).toBe(true)
  })

  it('uses the same mastered definition as the report', () => {
    const deck: Deck = {
      id: 'deck-1',
      name: 'Deck',
      type: 'language',
      user_id: 'user-1',
      created_at: NOW.toISOString(),
      last_reviewed: null,
      cards: [
        newCard(),
        reviewedCard({ dueInDays: 5, repetition: 1, ease_factor: 2.8 }),
        reviewedCard({ dueInDays: 5, repetition: 3, ease_factor: 2.6 }),
        reviewedCard({ dueInDays: 5, repetition: 3, ease_factor: 2.6 })
      ]
    }

    const { cardStats } = getDeckReport(deck.cards, NOW)

    expect(calculateDeckProgress(deck)).toBe(50)
    expect(cardStats.mastered).toBe(2)
  })
})

describe('calculateRetentionRate', () => {
  it('counts failed cards (repetition reset to 0) against retention', () => {
    const cards = [
      reviewedCard({ dueInDays: 1, repetition: 0, interval: 1 }),
      reviewedCard({ dueInDays: 6, repetition: 2, interval: 6 }),
      reviewedCard({ dueInDays: 6, repetition: 2, interval: 6 }),
      reviewedCard({ dueInDays: 6, repetition: 2, interval: 6 })
    ]

    expect(calculateRetentionRate(cards)).toBe(75)
  })

  it('ignores cards that were never reviewed', () => {
    expect(calculateRetentionRate([newCard(), newCard()])).toBe(0)
  })
})

describe('getCardsByDifficulty', () => {
  it('accounts for every card, including ones with a null ease factor', () => {
    const cards = [
      newCard(),
      reviewedCard({ dueInDays: 1, ease_factor: 1.5 }),
      reviewedCard({ dueInDays: 1, ease_factor: 2.9 })
    ]

    const { easy, medium, hard } = getCardsByDifficulty(cards)

    expect(easy.length + medium.length + hard.length).toBe(cards.length)
    expect(medium).toHaveLength(1)
  })
})

describe('getDeckReport', () => {
  it('averages intervals only over reviewed cards', () => {
    const cards = [
      newCard(),
      reviewedCard({ dueInDays: 1, interval: 4 }),
      reviewedCard({ dueInDays: 1, interval: 10 })
    ]

    expect(getDeckReport(cards, NOW).averageInterval).toBe(7)
  })

  it('puts never-reviewed cards in the default ease factor bucket', () => {
    const report = getDeckReport([newCard(), newCard()], NOW)

    expect(report.easeFactorDistribution['2.5-3.0']).toBe(2)
    expect(report.averageEaseFactor).toBe(2.5)
  })
})
