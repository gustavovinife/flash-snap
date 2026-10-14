import type { Subscription } from '@flash-snap/shared'
import { useQuery } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const FREE_DECK_LIMIT = 1
const STRIPE_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID

interface UseSubscription {
  subscription: Subscription | null
  isPremium: boolean
  canUpgrade: boolean
  canCreateDeck: (deckCount: number) => boolean
  openCheckout: () => Promise<void>
  openPortal: () => Promise<void>
}

// Where Stripe sends people back to: the Settings screen of whichever app they're using
function settingsReturnUrl(): string {
  return Platform.OS === 'web' ? `${window.location.origin}/app/settings` : Linking.createURL('settings')
}

async function openStripePage(functionName: string, body: Record<string, string>): Promise<void> {
  const returnUrl = settingsReturnUrl()
  const { data, error } = await supabase.functions.invoke<{ url?: string }>(functionName, {
    body: { ...body, returnUrl }
  })
  if (error || !data?.url) throw new Error(error?.message ?? 'No URL returned')

  if (Platform.OS === 'web') {
    window.location.assign(data.url)
    return
  }
  await WebBrowser.openAuthSessionAsync(data.url, returnUrl)
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
      if (!STRIPE_PRICE_ID) return
      await openStripePage('create-checkout-session', { priceId: STRIPE_PRICE_ID })
      await refetch()
      // Stripe's webhook can land a moment after the user is redirected back
      setTimeout(() => void refetch(), 4000)
    },

    openPortal: async () => {
      await openStripePage('create-portal-session', {})
      await refetch()
    }
  }
}
