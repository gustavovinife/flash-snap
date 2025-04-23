export interface Settings {
  language: string
  reviewTime: string
}

const DEFAULT_SETTINGS: Settings = {
  language: 'english',
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
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export const getLanguages = (): { value: string; label: string }[] => [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' }
]
