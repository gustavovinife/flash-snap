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
