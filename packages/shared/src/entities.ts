import type { CardLink } from './links'

// Row shapes as returned by Supabase. Timestamps are ISO strings; scheduling fields are
// null until a card is reviewed for the first time.

export type DeckType = 'language' | 'knowledge'

export interface Card {
  id: number
  deck_id: string
  front: string
  back: string
  context: string | null
  interval: number | null
  ease_factor: number | null
  repetition: number | null
  next_review: string | null
  created_at?: string
  // Optional for rows cached before the column existed
  links?: CardLink[]
}

export interface Deck {
  id: string
  user_id: string
  name: string
  type: DeckType
  created_at: string
  last_reviewed: string | null
  cards: Card[]
}

export type NewCard = Pick<Card, 'deck_id' | 'front' | 'back'> & {
  context?: string | null
  links?: CardLink[]
}

export type NewDeck = Pick<Deck, 'user_id' | 'name' | 'type'>

export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// The fields spaced-repetition and report logic need; loose so cards still being edited fit too
export interface SchedulableCard {
  interval?: number | null
  repetition?: number | null
  ease_factor?: number | null
  next_review?: string | Date | null
}
