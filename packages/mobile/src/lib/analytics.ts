import type { User } from '@supabase/supabase-js'
import PostHog, { type PostHogCustomStorage } from 'posthog-react-native'
import { Platform } from 'react-native'

// Same PostHog project as the website and the old desktop app
const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'

export type AnalyticsEvent =
  // Same names as the desktop app, so dashboards keep working
  | 'page_viewed'
  | 'user_signed_up'
  | 'deck_created'
  | 'deck_updated'
  | 'card_created'
  | 'ai_generate_button_clicked'
  | 'ai_prompt_submitted'
  | 'ai_deck_created'
  | 'study_session_completed'
  | 'upgrade_clicked'
  | 'subscription_started'
  // New in the Expo app
  | 'user_signed_in'
  | 'user_signed_out'
  | 'deck_deleted'
  | 'card_updated'
  | 'template_installed'
  | 'ai_cards_generated'
  | 'ai_generation_failed'
  | 'review_started'
  | 'review_exited'
  | 'reference_link_opened'
  | 'pronunciation_played'
  | 'manage_subscription_clicked'
  | 'install_prompt_shown'
  | 'install_prompt_result'
  | 'app_installed'
  | 'language_changed'
  | 'sound_effects_toggled'
  | 'reminder_updated'
  | 'push_permission_result'
  | 'test_notification_sent'
  | 'notification_opened'

type PropertyValue = string | number | boolean | null | undefined
export type AnalyticsProperties = Record<string, PropertyValue>

// posthog-react-native only persists to the file system on native; without this every web visit would look new
const webStorage: PostHogCustomStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value)
}

/** The website runs posthog-js on the same origin; reusing its anonymous id links a landing-page visit to app usage */
function websiteDistinctId(): string | undefined {
  try {
    const stored = window.localStorage.getItem(`ph_${API_KEY}_posthog`)
    return stored ? ((JSON.parse(stored) as { distinct_id?: string }).distinct_id ?? undefined) : undefined
  } catch {
    return undefined
  }
}

function webDisplayMode(): 'standalone' | 'browser' {
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return standalone ? 'standalone' : 'browser'
}

function createClient(): PostHog | null {
  if (!API_KEY) return null
  const siteId = isWeb ? websiteDistinctId() : undefined
  const client = new PostHog(API_KEY, {
    host: HOST,
    personProfiles: 'identified_only',
    // Application Opened/Installed/Updated; the web app reports display_mode instead
    captureAppLifecycleEvents: !isWeb,
    ...(isWeb && { customStorage: webStorage }),
    ...(siteId && { bootstrap: { distinctId: siteId } })
  })
  client.register({ app: 'flash-snap', platform: Platform.OS, ...(isWeb && { display_mode: webDisplayMode() }) })

  // Reminder notifications open the app with ?from=push
  if (isWeb && new URLSearchParams(window.location.search).get('from') === 'push') {
    client.capture('notification_opened', { path: window.location.pathname })
  }

  if (isWeb) {
    // Send queued events before the tab is closed or hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void client.flush()
    })
  }
  return client
}

const client = createClient()

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  if (!client) return
  const defined = Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined))
  client.capture(event, defined as Record<string, string | number | boolean | null>)
}

/** Ties events to the Supabase account, across devices and the website */
export function identifyUser(user: User): void {
  if (!client || client.getDistinctId() === user.id) return
  client.identify(user.id, {
    email: user.email ?? null,
    name: (user.user_metadata?.full_name as string | undefined) ?? null
  })
}

export function resetAnalytics(): void {
  client?.reset()
}

/** Kept on every event so funnels can be split by plan */
export function setAnalyticsPlan(plan: 'free' | 'premium'): void {
  client?.register({ plan })
}
