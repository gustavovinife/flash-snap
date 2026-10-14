import type { SchedulableCard } from './entities'

const INITIAL_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3

export interface Schedule {
  interval: number
  repetition: number
  ease_factor: number
  next_review: Date
}

function startOfDay(date: Date): Date {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

/**
 * SM-2 spaced repetition. `grade` is the recall quality from 0 (forgot) to 5 (perfect);
 * below 3 the card starts over. The next review lands on local midnight so cards are due by day.
 */
export function sm2(card: SchedulableCard, grade: number, now: Date = new Date()): Schedule {
  let interval = card.interval ?? 0
  let repetition = card.repetition ?? 0
  let easeFactor = card.ease_factor ?? INITIAL_EASE_FACTOR

  if (grade < 3) {
    repetition = 0
    interval = 1
  } else {
    interval = repetition === 0 ? 1 : repetition === 1 ? 6 : Math.round(interval * easeFactor)
    repetition += 1
  }

  easeFactor += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  easeFactor = Math.max(easeFactor, MIN_EASE_FACTOR)

  const nextReview = startOfDay(now)
  nextReview.setDate(nextReview.getDate() + interval)

  return { interval, repetition, ease_factor: easeFactor, next_review: nextReview }
}

/**
 * A card is due on its review day regardless of the time. Cards that were never reviewed
 * or have an invalid date are always due.
 */
export function isCardDue(card: SchedulableCard, referenceDate: Date = new Date()): boolean {
  if (!card.next_review) return true

  const reviewDate = new Date(card.next_review)
  if (isNaN(reviewDate.getTime())) return true

  return startOfDay(reviewDate) <= startOfDay(referenceDate)
}

export function countDueCards(cards: SchedulableCard[] | undefined, now: Date = new Date()): number {
  return (cards ?? []).filter((card) => isCardDue(card, now)).length
}

export interface DueCard<C, D> {
  card: C
  deck: D
}

export function getDueCards<C extends SchedulableCard, D extends { id: string; cards?: C[] }>(
  decks: D[],
  deckId?: string,
  now: Date = new Date()
): DueCard<C, D>[] {
  return decks
    .filter((deck) => !deckId || deck.id === deckId)
    .flatMap((deck) =>
      (deck.cards ?? []).filter((card) => isCardDue(card, now)).map((card) => ({ card, deck }))
    )
}
