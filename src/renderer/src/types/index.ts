export interface Card {
  id: string
  front: string
  back: string
  dueDate?: Date
  interval?: number
  easeFactor?: number
  repetition?: number
  nextReview?: Date
}

export interface Deck {
  id: string
  name: string
  cards: Card[]
  createdAt: Date
  lastReviewed?: Date
}
