import { Card } from '../types'
import { getDecks, updateDeck } from './storageService'

const INITIAL_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3

/**
 * Applies the SM-2 spaced repetition algorithm to a card based on the review grade.
 *
 * @param card The card being reviewed
 * @param grade The recall grade (0–5). Lower grades mean poor recall.
 * @returns Updated scheduling properties for the card
 */
export function sm2(card: Card, grade: number): Partial<Card> {
  let { interval = 0, repetition = 0, easeFactor = INITIAL_EASE_FACTOR } = card

  if (grade < 3) {
    // Poor recall: reset repetition and set minimal interval
    repetition = 0
    interval = 1
  } else {
    // Good recall: increase interval based on repetition count
    interval = repetition === 0 ? 1 : repetition === 1 ? 6 : Math.round(interval * easeFactor)
    repetition += 1
  }

  // Adjust ease factor (EF)
  easeFactor += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  easeFactor = Math.max(easeFactor, MIN_EASE_FACTOR)

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return { interval, repetition, easeFactor, nextReview }
}

/**
 * Returns all cards that are due for review today or earlier.
 *
 * @param deckId Optional: only return cards from a specific deck
 * @returns List of due cards with their deck context
 */
export function getDueCards(deckId?: string): { card: Card; deckId: string; deckName: string }[] {
  const decks = getDecks()

  const now = new Date()

  // Normalize "today" to ignore time component
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const decksToCheck = deckId ? decks.filter((deck) => deck.id === deckId) : decks
  const dueCards: { card: Card; deckId: string; deckName: string }[] = []

  for (const deck of decksToCheck) {
    for (const card of deck.cards) {
      const reviewDate = card.nextReview ? new Date(card.nextReview) : null
      const reviewDateWithNoTime = reviewDate
        ? new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate())
        : null
      const isDue = !reviewDate || !reviewDateWithNoTime || reviewDateWithNoTime <= today

      if (isDue) {
        dueCards.push({ card, deckId: deck.id, deckName: deck.name })
      }
    }
  }

  return dueCards
}

/**
 * Updates a card after a review session and saves it back to its deck.
 *
 * @param deckId The ID of the deck containing the card
 * @param card The card being reviewed
 * @param grade The recall grade (0–5)
 */
export function updateCardAfterReview(deckId: string, card: Card, grade: number): void {
  const updatedCard = { ...card, ...sm2(card, grade) }

  const decks = getDecks()
  const deck = decks.find((d) => d.id === deckId)

  if (!deck) {
    console.error(`Deck with ID "${deckId}" not found.`)
    return
  }

  const cardIndex = deck.cards.findIndex((c) => c.id === card.id)

  if (cardIndex === -1) {
    console.error(`Card with ID "${card.id}" not found in deck "${deckId}".`)
    return
  }

  deck.cards[cardIndex] = updatedCard
  deck.lastReviewed = new Date()

  updateDeck(deck)
}
