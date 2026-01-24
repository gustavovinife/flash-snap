import i18n from '../i18n'

export interface Settings {
  language: string
  reviewTime: string
}

// Define the API interface for type safety
interface FlashSnapAPI {
  notifySettingsUpdated?: (settings: { reviewTime: string }) => void
  syncSettings?: (settings: { reviewTime: string; lastNotification: string | null }) => void
  testNotification?: () => void
  checkForUpdates?: () => void
  onAuthCallback?: (callback: (url: string) => void) => void
}

const DEFAULT_SETTINGS: Settings = {
  language: 'en-US',
  reviewTime: '09:00'
}

const STORAGE_KEY = 'flashSnap_settings'

// Helper to get the API with proper typing
const getApi = (): FlashSnapAPI | undefined => {
  return (window as { api?: FlashSnapAPI }).api
}

export const getSettings = (): Settings => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      return JSON.parse(savedSettings) as Settings
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
  return DEFAULT_SETTINGS
}

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

    // Change the application language if different from current
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language)
    }

    // Notify main process that settings have changed with the new settings
    const api = getApi()
    if (api?.notifySettingsUpdated) {
      api.notifySettingsUpdated({ reviewTime: settings.reviewTime })
    }
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export const getLanguages = (): { value: string; label: string }[] => [
  { value: 'en-US', label: 'English (US)' },
  { value: 'pt-BR', label: 'Português (Brasil)' }
]

// Initialize settings
export function initSettings(): void {
  const settings = getSettings()

  // Set the initial language based on settings
  if (settings.language && settings.language !== i18n.language) {
    i18n.changeLanguage(settings.language)
  }

  // Sync settings to main process on startup
  const lastNotification = localStorage.getItem('lastReviewNotification')
  const api = getApi()
  if (api?.syncSettings) {
    api.syncSettings({
      reviewTime: settings.reviewTime,
      lastNotification
    })
  }
}

// Test notification function
export function testNotification(): void {
  const api = getApi()
  if (api?.testNotification) {
    api.testNotification()
  }
}
