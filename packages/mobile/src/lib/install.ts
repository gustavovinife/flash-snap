import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { track } from './analytics'

// Helpers for installing the web build to the home screen. Everything is a no-op on native.

const DISMISSED_KEY = 'flashSnap.installPromptDismissedAt'
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallMode = 'native-prompt' | 'ios' | 'android-manual' | 'macos-safari'
/**
 * Extra modes used only when someone explicitly asked to install (…/app/?install=1):
 * desktop Chrome/Edge before they offer one-click install, and browsers that can't install (e.g. Firefox)
 */
export type InstallDialogMode = InstallMode | 'desktop-manual' | 'unsupported'

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'

let deferredPrompt: BeforeInstallPromptEvent | null = null
let openListener: (() => void) | null = null
const availabilityListeners = new Set<() => void>()
const notifyAvailability = (): void => availabilityListeners.forEach((listener) => listener())

// Chrome fires this once, early, so capture it as soon as the module loads
if (isWeb) {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    notifyAvailability()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notifyAvailability()
    track('app_installed')
  })

  // Registered on the deployed site only, so local development never serves cached bundles
  if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
    navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' }).catch(() => {})
  }
}

/** Query parameter set by the website's "Install" links (…/app/?install=1) */
export const INSTALL_PARAM = 'install'

export function hasInstallRequest(): boolean {
  return isWeb && new URLSearchParams(window.location.search).has(INSTALL_PARAM)
}

/** Resolves with the install mode once known; Chrome's install event can arrive a few seconds after load. */
export function waitForInstallMode(timeoutMs: number): Promise<InstallMode | null> {
  const ready = getInstallMode()
  // Safari never fires the install event, so its manual steps are already final
  if (!isWeb || ready === 'native-prompt' || ready === 'ios' || ready === 'macos-safari') return Promise.resolve(ready)
  return new Promise((resolve) => {
    const finish = (): void => {
      availabilityListeners.delete(onChange)
      clearTimeout(timer)
      resolve(getInstallMode())
    }
    const onChange = (): void => {
      if (getInstallMode() === 'native-prompt') finish()
    }
    const timer = setTimeout(finish, timeoutMs)
    availabilityListeners.add(onChange)
  })
}

function userAgent(): string {
  return isWeb ? navigator.userAgent.toLowerCase() : ''
}

export function isIOS(): boolean {
  const ua = userAgent()
  // iPadOS reports itself as a Mac, so also check for touch support
  return /iphone|ipad|ipod/.test(ua) || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)
}

function isAndroid(): boolean {
  return userAgent().includes('android')
}

/** Chrome, Edge and other Chromium browsers on a computer can install from their address bar or menu */
export function isDesktopChromium(): boolean {
  const ua = userAgent()
  return /chrome|chromium|edg\//.test(ua) && !/firefox|android|mobile/.test(ua)
}

function isMacSafari(): boolean {
  const ua = userAgent()
  return ua.includes('macintosh') && ua.includes('safari') && !/chrome|crios|edg|firefox|fxios/.test(ua)
}

/** Phones and tablets, where the install dialog is shown automatically */
export function isMobileBrowser(): boolean {
  return isIOS() || isAndroid()
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
  if (isMacSafari()) return 'macos-safari'
  return null
}

/** Re-renders when the browser makes installing available (Chrome fires that event late) */
export function useInstallMode(): InstallMode | null {
  const [mode, setMode] = useState(getInstallMode)
  useEffect(() => {
    const update = (): void => setMode(getInstallMode())
    availabilityListeners.add(update)
    return () => {
      availabilityListeners.delete(update)
    }
  }, [])
  return mode
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
  notifyAvailability()
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  track('install_prompt_result', { outcome })
  return outcome === 'accepted'
}

export function openInstallPrompt(): void {
  openListener?.()
}

export function onOpenInstallPrompt(listener: (() => void) | null): void {
  openListener = listener
}
