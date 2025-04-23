import { Card } from '../types'
import { getDecks, updateDeck } from './storageService'

const SM2_EASE_INITIAL_FACTOR = 2.5

// SM2 algorithm implementation
// goes from 1 to 5
export function sm2(card: Card, grade: number): Partial<Card> {
  let { interval = 0, repetition = 0, easeFactor = SM2_EASE_INITIAL_FACTOR } = card

  if (grade < 3) {
    repetition = 0
    interval = 1
  } else {
    if (repetition === 0) {
      interval = 1
    } else if (repetition === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetition += 1
  }

  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    interval,
    repetition,
    easeFactor,
    nextReview
  }
}

/*
HOW TO USE:

const updated = sm2(card, 4) // 4 = lembrei com leve dificuldade
Object.assign(card, updated) */

// Get all cards that are due for review across all decks
export function getDueCards(deckId?: string): { card: Card; deckId: string; deckName: string }[] {
  const decks = getDecks()
  const today = new Date()
  const dueCards: { card: Card; deckId: string; deckName: string }[] = []

  // If deckId is provided, only get cards from that deck
  const decksToCheck = deckId ? decks.filter((deck) => deck.id === deckId) : decks

  decksToCheck.forEach((deck) => {
    deck.cards.forEach((card) => {
      // A card is due if it has never been reviewed or its next review date is today or earlier
      if (!card.nextReview || card.nextReview <= today) {
        dueCards.push({
          card,
          deckId: deck.id,
          deckName: deck.name
        })
      }
    })
  })

  return dueCards
}

// Update a card after review
export function updateCardAfterReview(deckId: string, card: Card, grade: number): void {
  const updatedCardData = sm2(card, grade)
  const updatedCard = { ...card, ...updatedCardData }

  const decks = getDecks()
  const deckIndex = decks.findIndex((d) => d.id === deckId)

  if (deckIndex === -1) {
    console.error(`Deck with ID ${deckId} not found`)
    return
  }

  const deck = decks[deckIndex]
  const cardIndex = deck.cards.findIndex((c) => c.id === card.id)

  if (cardIndex === -1) {
    console.error(`Card with ID ${card.id} not found in deck ${deckId}`)
    return
  }

  deck.cards[cardIndex] = updatedCard
  deck.lastReviewed = new Date()

  updateDeck(deck)
}
