import { Platform } from 'react-native'
import { isInstalled, isIOS } from './install'
import { supabase } from './supabase'

// Daily reminders on the web app: this browser's push subscription plus the user's schedule,
// both read by the send-reminders Edge Function. Phone builds schedule on the device instead (reminders.ts).

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'

export type WebPushSupport = 'supported' | 'needs-install' | 'unsupported'

export interface WebReminderSettings {
  enabled: boolean
  hour: number
  minute: number
  streakNudge: boolean
}

export const DEFAULT_WEB_REMINDER: WebReminderSettings = { enabled: false, hour: 9, minute: 0, streakNudge: true }

export function getWebPushSupport(): WebPushSupport {
  if (!isWeb || !VAPID_PUBLIC_KEY) return 'unsupported'
  // iOS only delivers web push to apps added to the home screen
  if (isIOS() && !isInstalled()) return 'needs-install'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  return 'supported'
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
  return bytes
}

/** The service worker is registered at startup on the deployed site (see install.ts) */
async function serviceWorker(): Promise<ServiceWorkerRegistration> {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Service worker not available')), 8000))
  return Promise.race([navigator.serviceWorker.ready, timeout])
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration('/app/')
  return (await registration?.pushManager.getSubscription()) ?? null
}

/** True when this browser is subscribed, so reminders reach this device */
export async function isThisBrowserSubscribed(): Promise<boolean> {
  if (getWebPushSupport() !== 'supported' || Notification.permission !== 'granted') return false
  return !!(await currentSubscription())
}

export async function loadWebReminderSettings(userId: string): Promise<WebReminderSettings> {
  const { data } = await supabase
    .from('reminder_settings')
    .select('enabled, hour, minute, streak_nudge')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) return DEFAULT_WEB_REMINDER
  return { enabled: data.enabled, hour: data.hour, minute: data.minute, streakNudge: data.streak_nudge }
}

export async function saveWebReminderSettings(userId: string, settings: WebReminderSettings, language: string): Promise<void> {
  const { error } = await supabase.from('reminder_settings').upsert({
    user_id: userId,
    enabled: settings.enabled,
    hour: settings.hour,
    minute: settings.minute,
    streak_nudge: settings.streakNudge,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language,
    updated_at: new Date().toISOString()
  })
  if (error) throw new Error(error.message)
}

export type EnableResult = 'enabled' | 'denied' | 'failed'

/** Asks for permission and registers this browser for reminders */
export async function enableWebPush(): Promise<EnableResult> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'
  try {
    const registration = await serviceWorker()
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY!) }))
    const { endpoint, keys } = subscription.toJSON()
    const { error } = await supabase.rpc('save_push_subscription', {
      p_endpoint: endpoint,
      p_p256dh: keys?.p256dh,
      p_auth: keys?.auth,
      p_user_agent: navigator.userAgent.slice(0, 300)
    })
    if (error) throw new Error(error.message)
    return 'enabled'
  } catch (error) {
    console.warn('Enabling web push failed', error)
    return 'failed'
  }
}

/** Stops reminders on this browser; returns how many other browsers still get them */
export async function disableWebPush(userId: string): Promise<number> {
  const subscription = await currentSubscription()
  if (subscription) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
    await subscription.unsubscribe().catch(() => {})
  }
  const { count } = await supabase.from('push_subscriptions').select('endpoint', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
}

/** Sends a test notification to every browser the user enabled; returns how many got it */
export async function sendTestNotification(): Promise<number> {
  const { data, error } = await supabase.functions.invoke<{ sent: number }>('send-reminders', { body: { test: true } })
  if (error) throw error
  return data?.sent ?? 0
}
