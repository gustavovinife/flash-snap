import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en-US')}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          i18n.language === 'en-US'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('pt-BR')}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          i18n.language === 'pt-BR'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Mudar para Português"
      >
        PT
      </button>
    </div>
  )
}

export default LanguageSwitcher
