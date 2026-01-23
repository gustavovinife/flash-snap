import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@renderer/context/SessionContext'
import {
  getSubscription,
  createCheckoutSession,
  createPortalSession
} from '@renderer/services/subscriptionService'
import type { Subscription } from '@renderer/types'

interface UseSubscriptionReturn {
  subscription: Subscription | null
  isLoading: boolean
  isPremium: boolean
  canCreateDeck: (currentDeckCount: number) => boolean
  openCheckout: () => Promise<void>
  openPortal: () => Promise<void>
  refetch: () => void
}

const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1SsUhmE13c2k8XKrUecLh4J7'

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useSession()
  const queryClient = useQueryClient()

  const {
    data: subscription,
    isLoading,
    refetch
  } = useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      return getSubscription(user.id)
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes - matching existing hooks
  })

  const isPremium = subscription?.status === 'active'

  const canCreateDeck = (currentDeckCount: number): boolean => {
    // Premium users can create unlimited decks
    if (isPremium) return true
    // Free users are limited to 1 deck
    return currentDeckCount < 1
  }

  const openCheckout = async (): Promise<void> => {
    try {
      const url = await createCheckoutSession(STRIPE_PRICE_ID)
      // Open checkout URL in external browser
      if (window.electron?.openExternal) {
        window.electron.openExternal(url)
      } else {
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Failed to open checkout:', error)
      throw error
    }
  }

  const openPortal = async (): Promise<void> => {
    if (!subscription?.stripe_customer_id) {
      throw new Error('No Stripe customer ID found')
    }

    try {
      const url = await createPortalSession(subscription.stripe_customer_id)
      // Open portal URL in external browser
      if (window.electron?.openExternal) {
        window.electron.openExternal(url)
      } else {
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Failed to open portal:', error)
      throw error
    }
  }

  const handleRefetch = (): void => {
    queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] })
    refetch()
  }

  return {
    subscription: subscription ?? null,
    isLoading,
    isPremium,
    canCreateDeck,
    openCheckout,
    openPortal,
    refetch: handleRefetch
  }
}
