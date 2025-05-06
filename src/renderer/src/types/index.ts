export interface Card {
  id: number
  front: string
  back: string
  context?: string
  due_date?: Date
  interval?: number
  ease_factor?: number
  repetition?: number
  next_review?: Date
  created_at?: Date
  deck_id?: number
}

export interface Deck {
  id: number
  name: string
  cards: Card[]
  created_at: Date
  last_reviewed?: Date
  type: 'language' | 'knowledge'
}
