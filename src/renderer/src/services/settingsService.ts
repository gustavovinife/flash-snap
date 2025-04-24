import i18n from '../i18n'

export interface Settings {
  language: string
  reviewTime: string
}

const DEFAULT_SETTINGS: Settings = {
  language: 'en-US',
  reviewTime: '09:00'
}

const STORAGE_KEY = 'flashSnap_settings'

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
}
