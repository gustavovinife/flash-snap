import supabase from './supabaseService'
import type { Subscription } from '../types'

/**
 * Fetches the subscription record for a given user
 * @param userId - The user's ID
 * @returns The subscription record or null if not found
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data as Subscription
}

/**
 * Creates a Stripe Checkout Session for upgrading to premium
 * @param priceId - The Stripe price ID for the subscription
 * @returns The checkout URL to redirect the user to
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('No active session')
  }

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      priceId,
      userId: session.user.id,
      userEmail: session.user.email
    }
  })

  if (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }

  if (!data?.url) {
    throw new Error('No checkout URL returned')
  }

  return data.url
}

/**
 * Creates a Stripe Customer Portal session for managing subscription
 * @param customerId - The Stripe customer ID
 * @returns The portal URL to redirect the user to
 */
export async function createPortalSession(customerId: string): Promise<string> {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('No active session')
  }

  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: {
      customerId
    }
  })

  if (error) {
    console.error('Error creating portal session:', error)
    throw new Error('Failed to create portal session')
  }

  if (!data?.url) {
    throw new Error('No portal URL returned')
  }

  return data.url
}
