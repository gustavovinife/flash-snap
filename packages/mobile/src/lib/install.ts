import { Platform } from 'react-native'

// Helpers for installing the web build to the home screen. Everything is a no-op on native.

const DISMISSED_KEY = 'flashSnap.installPromptDismissedAt'
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallMode = 'native-prompt' | 'ios' | 'android-manual'

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'

let deferredPrompt: BeforeInstallPromptEvent | null = null
let openListener: (() => void) | null = null

// Chrome fires this once, early, so capture it as soon as the module loads
if (isWeb) {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
  })
}

function userAgent(): string {
  return isWeb ? navigator.userAgent.toLowerCase() : ''
}

function isIOS(): boolean {
  const ua = userAgent()
  // iPadOS reports itself as a Mac, so also check for touch support
  return /iphone|ipad|ipod/.test(ua) || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)
}

function isAndroid(): boolean {
  return userAgent().includes('android')
}

export function isInstalled(): boolean {
  if (!isWeb) return true
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

/** How the app can be installed here, or null when it can't (native, desktop, already installed). */
export function getInstallMode(): InstallMode | null {
  if (!isWeb || isInstalled()) return null
  if (deferredPrompt) return 'native-prompt'
  if (isIOS()) return 'ios'
  if (isAndroid()) return 'android-manual'
  return null
}

export function wasRecentlyDismissed(): boolean {
  if (!isWeb) return true
  const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY) ?? 0)
  return Date.now() - dismissedAt < SNOOZE_MS
}

export function snoozeInstallPrompt(): void {
  if (isWeb) window.localStorage.setItem(DISMISSED_KEY, String(Date.now()))
}

/** Shows the browser's own install dialog (Chrome on Android). Returns true when accepted. */
export async function promptNativeInstall(): Promise<boolean> {
  if (!deferredPrompt) return false
  const prompt = deferredPrompt
  deferredPrompt = null
  await prompt.prompt()
  return (await prompt.userChoice).outcome === 'accepted'
}

export function openInstallPrompt(): void {
  openListener?.()
}

export function onOpenInstallPrompt(listener: (() => void) | null): void {
  openListener = listener
}
