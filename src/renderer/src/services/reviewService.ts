import { Card, Deck } from '../types'

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
  let { interval = 0, repetition = 0, ease_factor = INITIAL_EASE_FACTOR } = card

  if (grade < 3) {
    // Poor recall: reset repetition and set minimal interval
    repetition = 0
    interval = 1
  } else {
    // Good recall: increase interval based on repetition count
    interval = repetition === 0 ? 1 : repetition === 1 ? 6 : Math.round(interval * ease_factor)
    repetition += 1
  }

  // Adjust ease factor (EF)
  ease_factor += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  ease_factor = Math.max(ease_factor, MIN_EASE_FACTOR)

  const next_review = new Date()
  next_review.setDate(next_review.getDate() + interval)

  return { interval, repetition, ease_factor, next_review }
}

/**
 * Returns all cards that are due for review today or earlier.
 *
 * @param deckId Optional: only return cards from a specific deck
 * @returns List of due cards with their deck context
 */
export async function getDueCards(
  decks: Deck[],
  deckId?: number
): Promise<{ card: Card; deckId: number; deckName: string }[]> {
  const now = new Date()

  // Normalize "today" to ignore time component
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const decksToCheck = deckId ? decks.filter((deck) => deck.id === deckId) : decks
  const dueCards: { card: Card; deckId: number; deckName: string }[] = []

  for (const deck of decksToCheck) {
    for (const card of deck.cards) {
      const reviewDate = card.next_review ? new Date(card.next_review) : null
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
 * @param deck The deck containing the card
 * @param card The card being reviewed
 * @param grade The recall grade (0–5)
 */
export async function updateCardAfterReview(
  deck: Deck,
  card: Card,
  grade: number,
  updateCard: any,
  updateDeck: any
): Promise<void> {
  const updatedCard = { ...card, ...sm2(card, grade) }

  // Update card in the database
  await updateCard.mutateAsync(updatedCard)

  if (!deck) {
    console.error(`Deck  not found.`)
    return
  }

  // Update the deck's last reviewed timestamp
  deck.last_reviewed = new Date()
  await updateDeck.mutateAsync(deck)
}
