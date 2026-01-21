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
  deck_id?: string
}

export interface Deck {
  id: string
  name: string
  cards: Card[]
  created_at: Date
  last_reviewed?: Date
  type: 'language' | 'knowledge'
  user_id?: string
}
