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

  // Handle null values from database (destructuring defaults don't work with null)
  if (ease_factor === null || ease_factor === undefined) {
    ease_factor = INITIAL_EASE_FACTOR
  }
  if (interval === null || interval === undefined) {
    interval = 0
  }
  if (repetition === null || repetition === undefined) {
    repetition = 0
  }

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
  // Normalize to midnight to ensure day-based comparison (not hour-based)
  next_review.setHours(0, 0, 0, 0)

  return { interval, repetition, ease_factor, next_review }
}

/**
 * Gets a date with time set to midnight in local timezone
 *
 * @param date The date to normalize
 * @returns A new Date object representing midnight of the given date in local timezone
 */
function getLocalMidnight(date: Date): Date {
  // Create a new date object to avoid modifying the input
  const localDate = new Date(date)

  // Set to midnight in the local timezone
  localDate.setHours(0, 0, 0, 0)

  return localDate
}

/**
 * Compare two dates ignoring time component
 *
 * @param date1 First date
 * @param date2 Second date
 * @returns True if date1 is earlier than or the same day as date2
 */
function isSameDayOrEarlier(date1: Date, date2: Date): boolean {
  // Convert both dates to local timezone midnight
  const d1 = getLocalMidnight(date1)
  const d2 = getLocalMidnight(date2)

  // Compare the dates - card is due if its review date is on or before today
  return d1 <= d2
}

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

  // Get today's date in local timezone
  const today = getLocalMidnight(new Date())

  // Filter decks by ID if specified
  const decksToCheck = deckId ? decks.filter((deck) => deck.id === deckId) : decks

  if (decksToCheck.length === 0) {
    return []
  }

  const dueCards: { card: Card; deckId: string; deckName: string }[] = []

  for (const deck of decksToCheck) {
    if (!deck.cards || !Array.isArray(deck.cards)) {
      continue
    }

    for (const card of deck.cards) {
      try {
        if (!card || !card.id) {
          continue
        }

        let isDue = false

        if (!card.next_review) {
          // If no next_review date is set, the card is due for its first review
          isDue = true
        } else {
          // Parse the next_review date safely
          let reviewDate: Date | null = null

          try {
            reviewDate = new Date(card.next_review)

            // Ensure it's a valid date
            if (isNaN(reviewDate.getTime())) {
              isDue = true
            } else {
              // Get local midnight of the review date
              const reviewDateMidnight = getLocalMidnight(reviewDate)

              // Compare dates - a card is due only if its review date is strictly earlier than today
              isDue = isSameDayOrEarlier(reviewDateMidnight, today)
            }
          } catch {
            isDue = true
          }
        }

        if (isDue) {
          dueCards.push({
            card,
            deckId: deck.id,
            deckName: deck.name
          })
        }
      } catch {
        // Skip cards that fail processing
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
    return
  }

  // Update the deck's last reviewed timestamp
  deck.last_reviewed = new Date()
  await updateDeck.mutateAsync(deck)
}
