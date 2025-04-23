export interface Card {
  id: string
  front: string
  back: string
  dueDate?: Date
  interval?: number
  ease?: number
}

export interface Deck {
  id: string
  name: string
  cards: Card[]
  createdAt: Date
  lastReviewed?: Date
}
