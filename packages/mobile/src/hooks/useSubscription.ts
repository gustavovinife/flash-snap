import type { Subscription } from '@flash-snap/shared'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { setAnalyticsPlan, track } from '@/lib/analytics'
import { supabase } from '@/lib/supabase'

const FREE_DECK_LIMIT = 1
const STRIPE_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID

interface UseSubscription {
  subscription: Subscription | null
  isPremium: boolean
  canUpgrade: boolean
  canCreateDeck: (deckCount: number) => boolean
  openCheckout: (location: 'settings' | 'deck_limit') => Promise<void>
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

// Shared by every screen using this hook, so a plan change is reported once. On web it's also saved,
// because Stripe Checkout is a full-page redirect and the app reloads when the user comes back
let lastKnownPremium: boolean | undefined
const PLAN_KEY = 'flashSnap.lastKnownPlan'

function readLastKnownPremium(userId: string): boolean | undefined {
  if (lastKnownPremium !== undefined || Platform.OS !== 'web') return lastKnownPremium
  const saved = window.localStorage.getItem(`${PLAN_KEY}.${userId}`)
  return saved === null ? undefined : saved === 'premium'
}

function saveLastKnownPremium(userId: string, premium: boolean): void {
  lastKnownPremium = premium
  if (Platform.OS === 'web') window.localStorage.setItem(`${PLAN_KEY}.${userId}`, premium ? 'premium' : 'free')
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
  const loaded = subscription !== undefined

  useEffect(() => {
    if (!loaded || !user) return
    if (readLastKnownPremium(user.id) === false && isPremium) {
      track('subscription_started', { subscription_id: subscription?.id, plan: 'premium' })
    }
    saveLastKnownPremium(user.id, isPremium)
    setAnalyticsPlan(isPremium ? 'premium' : 'free')
  }, [loaded, isPremium, subscription?.id, user])

  return {
    subscription: subscription ?? null,
    isPremium,
    canUpgrade: !!STRIPE_PRICE_ID,
    canCreateDeck: (deckCount) => isPremium || deckCount < FREE_DECK_LIMIT,

    openCheckout: async (location) => {
      if (!STRIPE_PRICE_ID) return
      track('upgrade_clicked', { location, current_plan: isPremium ? 'premium' : 'free' })
      await openStripePage('create-checkout-session', { priceId: STRIPE_PRICE_ID })
      await refetch()
      // Stripe's webhook can land a moment after the user is redirected back
      setTimeout(() => void refetch(), 4000)
    },

    openPortal: async () => {
      track('manage_subscription_clicked')
      await openStripePage('create-portal-session', {})
      await refetch()
    }
  }
}
