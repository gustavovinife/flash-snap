import { isCardDue, sm2 } from '@flash-snap/shared'
import { Card, Deck } from '../types'

export { isCardDue, sm2 }

/**
 * Returns all cards that are due for review today or earlier.
 *
 * @param decks List of all decks to check
 * @param deckId Optional: only return cards from a specific deck
 * @returns List of due cards with their deck context
 */
export async function getDueCards(
  decks: Deck[],
  deckId?: string
): Promise<{ card: Card; deckId: string; deckName: string }[]> {
  if (!decks || !Array.isArray(decks) || decks.length === 0) {
    return []
  }

  const today = new Date()
  const decksToCheck = deckId ? decks.filter((deck) => deck.id === deckId) : decks

  return decksToCheck.flatMap((deck) =>
    (deck.cards ?? [])
      .filter((card) => card?.id && isCardDue(card, today))
      .map((card) => ({ card, deckId: deck.id, deckName: deck.name }))
  )
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
  updateCard: { mutateAsync: (card: Card) => Promise<unknown> },
  updateDeck: { mutateAsync: (deck: Deck) => Promise<unknown> }
): Promise<void> {
  const schedule = sm2(card, grade)
  await updateCard.mutateAsync({ ...card, ...schedule, next_review: schedule.next_review.toISOString() })

  if (!deck) {
    return
  }

  deck.last_reviewed = new Date().toISOString()
  await updateDeck.mutateAsync(deck)
}
