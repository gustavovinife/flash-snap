import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US'
import ptBR from './locales/pt-BR'

export const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português' }
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

const LANGUAGE_STORAGE_KEY = 'flashSnap.language'

function deviceLanguage(): LanguageCode {
  return getLocales()[0]?.languageCode === 'pt' ? 'pt-BR' : 'en-US'
}

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'pt-BR': { translation: ptBR }
  },
  lng: deviceLanguage(),
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false }
})

AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
  if (saved && saved !== i18n.language) i18n.changeLanguage(saved)
})

export async function setLanguage(code: LanguageCode): Promise<void> {
  await i18n.changeLanguage(code)
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code)
}

export default i18n
