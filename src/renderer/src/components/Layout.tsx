import React from 'react'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { useNavigate } from 'react-router-dom'
import Versions from './Versions'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSettingsClick = (): void => {
    navigate('/settings')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <div>
                <h1 className="text-2xl font-medium text-gray-800">{t('layout.appName')}</h1>
                <p className="text-sm text-gray-400 mt-1">{t('layout.appDescription')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSettingsClick}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label={t('layout.settings')}
                title={t('layout.settings')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 pt-6 border-t border-gray-100">
          <small
            className="text-gray-500"
            style={{
              fontSize: '0.65rem'
            }}
          >
            {t('layout.copyright')}{' '}
            <a
              style={{ color: '#501f75' }}
              href="https://github.com/gustavowebjs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gustavo Ferreira
            </a>
          </small>

          <Versions />
        </footer>
      </div>
    </div>
  )
}

export default Layout
