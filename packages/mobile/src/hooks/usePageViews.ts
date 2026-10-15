import { useGlobalSearchParams, usePathname, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

// Page names match the desktop app's page_viewed events
const PAGE_NAMES: Record<string, string> = {
  '': 'home',
  explore: 'explore',
  settings: 'settings',
  'deck/[id]': 'deck_view',
  'deck/[id]/stats': 'reports',
  'review/[id]': 'review',
  'sign-in': 'login',
  'ai-generate': 'ai_generate',
  'card-form': 'card_form',
  'deck-form': 'deck_form'
}

export function usePageViews(): void {
  const pathname = usePathname()
  const segments = useSegments()
  const { id } = useGlobalSearchParams<{ id?: string }>()

  useEffect(() => {
    const route = segments.filter((segment) => !segment.startsWith('(')).join('/')
    track('page_viewed', { page: PAGE_NAMES[route] ?? route, path: pathname, deck_id: id })
    // Only a new path is a new page; params alone don't count
  }, [pathname])
}
