/**
 * Unit Tests for Review Service
 *
 * These tests verify the spaced repetition algorithm (SM-2) and due card logic,
 * specifically ensuring day-based (not hour-based) review scheduling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { sm2, getDueCards } from '../../src/renderer/src/services/reviewService'
import { Card, Deck } from '../../src/renderer/src/types'

/**
 * Helper to create a card with optional overrides
 */
function createCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    front: 'Test Question',
    back: 'Test Answer',
    ...overrides
  }
}

/**
 * Helper to create a deck with cards
 */
function createDeck(cards: Card[], overrides: Partial<Deck> = {}): Deck {
  return {
    id: 'deck-1',
    name: 'Test Deck',
    cards,
    created_at: new Date(),
    type: 'knowledge',
    ...overrides
  }
}

/**
 * Helper to create a date at a specific time
 */
function createDateAtTime(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0
): Date {
  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}

describe('reviewService', () => {
  describe('sm2 - Spaced Repetition Algorithm', () => {
    describe('next_review date normalization', () => {
      it('should set next_review to midnight (00:00:00) regardless of current time', () => {
        const card = createCard()

        // Mock the current time to be mid-day
        const mockNow = createDateAtTime(2026, 1, 24, 15, 30) // 3:30 PM
        vi.setSystemTime(mockNow)

        const result = sm2(card, 4) // Good recall

        // next_review should be at midnight
        expect(result.next_review).toBeDefined()
        expect(result.next_review!.getHours()).toBe(0)
        expect(result.next_review!.getMinutes()).toBe(0)
        expect(result.next_review!.getSeconds()).toBe(0)
        expect(result.next_review!.getMilliseconds()).toBe(0)

        vi.useRealTimers()
      })

      it('should set next_review to tomorrow midnight for interval=1', () => {
        const card = createCard()

        const mockNow = createDateAtTime(2026, 1, 24, 22, 0) // 10 PM
        vi.setSystemTime(mockNow)

        const result = sm2(card, 4) // First good recall, interval becomes 1

        expect(result.interval).toBe(1)
        expect(result.next_review).toBeDefined()

        // Should be January 25th at midnight
        expect(result.next_review!.getFullYear()).toBe(2026)
        expect(result.next_review!.getMonth()).toBe(0) // January (0-indexed)
        expect(result.next_review!.getDate()).toBe(25)
        expect(result.next_review!.getHours()).toBe(0)

        vi.useRealTimers()
      })

      it('should set next_review to correct day for longer intervals', () => {
        const card = createCard({
          interval: 6,
          repetition: 2,
          ease_factor: 2.5
        })

        const mockNow = createDateAtTime(2026, 1, 24, 8, 0) // 8 AM
        vi.setSystemTime(mockNow)

        const result = sm2(card, 4) // Good recall

        // interval should be 6 * 2.5 = 15 (rounded)
        expect(result.interval).toBe(15)
        expect(result.next_review).toBeDefined()

        // Should be February 8th at midnight (24 + 15 = 39, wraps to Feb 8)
        expect(result.next_review!.getHours()).toBe(0)
        expect(result.next_review!.getMinutes()).toBe(0)

        vi.useRealTimers()
      })
    })

    describe('SM-2 algorithm correctness', () => {
      beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('should set interval=1 for first successful review (grade >= 3)', () => {
        const card = createCard()

        const result = sm2(card, 3)

        expect(result.interval).toBe(1)
        expect(result.repetition).toBe(1)
      })

      it('should set interval=6 for second successful review', () => {
        const card = createCard({
          interval: 1,
          repetition: 1,
          ease_factor: 2.5
        })

        const result = sm2(card, 4)

        expect(result.interval).toBe(6)
        expect(result.repetition).toBe(2)
      })

      it('should reset repetition and set interval=1 for poor recall (grade < 3)', () => {
        const card = createCard({
          interval: 15,
          repetition: 5,
          ease_factor: 2.5
        })

        const result = sm2(card, 2) // Poor recall

        expect(result.interval).toBe(1)
        expect(result.repetition).toBe(0)
      })

      it('should decrease ease_factor for difficult cards', () => {
        const card = createCard({
          ease_factor: 2.5
        })

        const result = sm2(card, 3) // Barely passing

        expect(result.ease_factor).toBeLessThan(2.5)
      })

      it('should increase ease_factor for easy cards', () => {
        const card = createCard({
          ease_factor: 2.5
        })

        const result = sm2(card, 5) // Perfect recall

        expect(result.ease_factor).toBeGreaterThan(2.5)
      })

      it('should not let ease_factor go below 1.3', () => {
        const card = createCard({
          ease_factor: 1.3
        })

        const result = sm2(card, 0) // Complete failure

        expect(result.ease_factor).toBeGreaterThanOrEqual(1.3)
      })

      it('should handle null values from database', () => {
        const card = createCard({
          interval: null as unknown as number,
          repetition: null as unknown as number,
          ease_factor: null as unknown as number
        })

        const result = sm2(card, 4)

        expect(result.interval).toBe(1)
        expect(result.repetition).toBe(1)
        expect(result.ease_factor).toBeDefined()
      })
    })
  })

  describe('getDueCards - Due Card Detection', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('day-based comparison (not hour-based)', () => {
      it('should mark card as due when next_review is today (same day)', async () => {
        // Current time: January 24, 2026 at 9:00 AM
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 9, 0))

        // Card with next_review set to today at midnight
        const card = createCard({
          next_review: createDateAtTime(2026, 1, 24, 0, 0)
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(1)
        expect(dueCards[0].card.id).toBe(card.id)
      })

      it('should mark card as due when next_review is today even if reviewed late yesterday', async () => {
        // Scenario: User reviewed at 11 PM yesterday, next_review is today
        // Current time: January 24, 2026 at 6:00 AM (early morning)
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 6, 0))

        // Card with next_review set to today at midnight
        const card = createCard({
          next_review: createDateAtTime(2026, 1, 24, 0, 0)
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(1)
      })

      it('should mark card as due when next_review is in the past', async () => {
        // Current time: January 24, 2026
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        // Card with next_review set to yesterday
        const card = createCard({
          next_review: createDateAtTime(2026, 1, 23, 0, 0)
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(1)
      })

      it('should NOT mark card as due when next_review is tomorrow', async () => {
        // Current time: January 24, 2026
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 23, 59))

        // Card with next_review set to tomorrow
        const card = createCard({
          next_review: createDateAtTime(2026, 1, 25, 0, 0)
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(0)
      })

      it('should mark card as due when next_review is today regardless of stored time', async () => {
        // Current time: January 24, 2026 at 8:00 AM
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 8, 0))

        // Card with next_review set to today at 3:00 PM (stored with time component)
        // This tests backward compatibility with old data that might have time components
        const card = createCard({
          next_review: createDateAtTime(2026, 1, 24, 15, 0)
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        // Should be due because it's the same DAY, regardless of hour
        expect(dueCards.length).toBe(1)
      })
    })

    describe('cards without next_review', () => {
      it('should mark new cards (no next_review) as due', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const card = createCard({
          next_review: undefined
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(1)
      })

      it('should mark cards with null next_review as due', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const card = createCard({
          next_review: null as unknown as Date
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(1)
      })
    })

    describe('filtering by deck', () => {
      it('should filter cards by deckId when provided', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const card1 = createCard({ id: 1, next_review: createDateAtTime(2026, 1, 24, 0, 0) })
        const card2 = createCard({ id: 2, next_review: createDateAtTime(2026, 1, 24, 0, 0) })

        const deck1 = createDeck([card1], { id: 'deck-1', name: 'Deck 1' })
        const deck2 = createDeck([card2], { id: 'deck-2', name: 'Deck 2' })

        const dueCards = await getDueCards([deck1, deck2], 'deck-1')

        expect(dueCards.length).toBe(1)
        expect(dueCards[0].deckId).toBe('deck-1')
      })

      it('should return cards from all decks when no deckId is provided', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const card1 = createCard({ id: 1, next_review: createDateAtTime(2026, 1, 24, 0, 0) })
        const card2 = createCard({ id: 2, next_review: createDateAtTime(2026, 1, 24, 0, 0) })

        const deck1 = createDeck([card1], { id: 'deck-1', name: 'Deck 1' })
        const deck2 = createDeck([card2], { id: 'deck-2', name: 'Deck 2' })

        const dueCards = await getDueCards([deck1, deck2])

        expect(dueCards.length).toBe(2)
      })
    })

    describe('edge cases', () => {
      it('should handle empty decks array', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const dueCards = await getDueCards([])

        expect(dueCards.length).toBe(0)
      })

      it('should handle deck with no cards', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const deck = createDeck([])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(0)
      })

      it('should handle invalid date strings gracefully', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const card = createCard({
          next_review: 'invalid-date' as unknown as Date
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        // Invalid dates should be treated as due (fail-safe)
        expect(dueCards.length).toBe(1)
      })

      it('should handle date stored as ISO string', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        // Simulate how dates might come from database as ISO strings
        const card = createCard({
          next_review: '2026-01-24T00:00:00.000Z' as unknown as Date
        })
        const deck = createDeck([card])

        const dueCards = await getDueCards([deck])

        expect(dueCards.length).toBe(1)
      })
    })

    describe('real-world scenarios', () => {
      it('scenario: user reviews at night, card should be due next day morning', async () => {
        // User reviews at 11 PM on January 23
        vi.setSystemTime(createDateAtTime(2026, 1, 23, 23, 0))

        const card = createCard()
        const result = sm2(card, 4) // Good recall, interval = 1

        // next_review should be January 24 at midnight
        expect(result.next_review!.getDate()).toBe(24)
        expect(result.next_review!.getHours()).toBe(0)

        // Now it's January 24 at 6 AM
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 6, 0))

        const updatedCard = createCard({
          ...result,
          next_review: result.next_review
        })
        const deck = createDeck([updatedCard])

        const dueCards = await getDueCards([deck])

        // Card should be due!
        expect(dueCards.length).toBe(1)
      })

      it('scenario: user reviews early morning, card should NOT be due same day', async () => {
        // User reviews at 6 AM on January 24
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 6, 0))

        const card = createCard()
        const result = sm2(card, 4) // Good recall, interval = 1

        // next_review should be January 25 at midnight
        expect(result.next_review!.getDate()).toBe(25)

        // Still January 24 at 11 PM
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 23, 0))

        const updatedCard = createCard({
          ...result,
          next_review: result.next_review
        })
        const deck = createDeck([updatedCard])

        const dueCards = await getDueCards([deck])

        // Card should NOT be due yet
        expect(dueCards.length).toBe(0)
      })

      it('scenario: multiple cards with different due dates', async () => {
        vi.setSystemTime(createDateAtTime(2026, 1, 24, 12, 0))

        const cardDueYesterday = createCard({
          id: 1,
          next_review: createDateAtTime(2026, 1, 23, 0, 0)
        })
        const cardDueToday = createCard({
          id: 2,
          next_review: createDateAtTime(2026, 1, 24, 0, 0)
        })
        const cardDueTomorrow = createCard({
          id: 3,
          next_review: createDateAtTime(2026, 1, 25, 0, 0)
        })
        const newCard = createCard({
          id: 4,
          next_review: undefined
        })

        const deck = createDeck([cardDueYesterday, cardDueToday, cardDueTomorrow, newCard])

        const dueCards = await getDueCards([deck])

        // Should include: yesterday (overdue), today, and new card
        // Should NOT include: tomorrow
        expect(dueCards.length).toBe(3)
        const dueIds = dueCards.map((c) => c.card.id)
        expect(dueIds).toContain(1) // yesterday
        expect(dueIds).toContain(2) // today
        expect(dueIds).toContain(4) // new card
        expect(dueIds).not.toContain(3) // tomorrow
      })
    })
  })
})
