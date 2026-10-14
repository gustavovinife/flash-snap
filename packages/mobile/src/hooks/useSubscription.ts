import type { Subscription } from '@flash-snap/shared'
import { useQuery } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const FREE_DECK_LIMIT = 1
const STRIPE_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID
// Stripe redirects here when checkout or the billing portal finishes (set in the Supabase functions)
const STRIPE_RETURN_URL = 'flash-snap://subscription-callback'

interface UseSubscription {
  subscription: Subscription | null
  isPremium: boolean
  canUpgrade: boolean
  canCreateDeck: (deckCount: number) => boolean
  openCheckout: () => Promise<void>
  openPortal: () => Promise<void>
}

async function openStripePage(functionName: string, body: Record<string, string>): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ url?: string }>(functionName, { body })
  if (error || !data?.url) throw new Error(error?.message ?? 'No URL returned')
  await WebBrowser.openAuthSessionAsync(data.url, STRIPE_RETURN_URL)
}

export function useSubscription(): UseSubscription {
  const { user } = useAuth()

  const { data: subscription, refetch } = useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data as Subscription | null
    },
    staleTime: 5 * 60 * 1000
  })

  const isPremium = subscription?.status === 'active'

  return {
    subscription: subscription ?? null,
    isPremium,
    canUpgrade: !!STRIPE_PRICE_ID,
    canCreateDeck: (deckCount) => isPremium || deckCount < FREE_DECK_LIMIT,

    openCheckout: async () => {
      if (!user?.email || !STRIPE_PRICE_ID) return
      await openStripePage('create-checkout-session', {
        priceId: STRIPE_PRICE_ID,
        userId: user.id,
        userEmail: user.email
      })
      await refetch()
    },

    openPortal: async () => {
      if (!subscription?.stripe_customer_id) return
      await openStripePage('create-portal-session', { customerId: subscription.stripe_customer_id })
      await refetch()
    }
  }
}
