import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  getSettings,
  saveSettings,
  getLanguages,
  Settings,
  testNotification
} from '../services/settingsService'
import { Button } from '@renderer/ui/common'
import { useSubscription } from '@renderer/hooks/useSubscription'
import SubscriptionStatus from '@renderer/components/SubscriptionStatus'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [settings, setSettings] = useState<Settings>(getSettings())
  const languages = getLanguages()
  const {
    subscription,
    isLoading: subscriptionLoading,
    openCheckout,
    openPortal
  } = useSubscription()

  const handleUpgrade = async (): Promise<void> => {
    try {
      await openCheckout()
    } catch (error) {
      console.error('Failed to open checkout:', error)
      alert(t('subscription.checkoutError'))
    }
  }

  const handleManageSubscription = async (): Promise<void> => {
    try {
      await openPortal()
    } catch (error) {
      console.error('Failed to open portal:', error)
      alert(t('subscription.portalError'))
    }
  }

  const handleSave = (): void => {
    // Save settings to localStorage via the service
    saveSettings(settings)
    // Show success message or notification
    alert(t('settings.saveSuccess'))
  }

  const handleBack = (): void => {
    navigate('/')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('common.back')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-medium mb-6">{t('settings.title')}</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              {t('settings.language.label')}
            </label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">{t('settings.language.description')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reviewTime" className="block text-sm font-medium text-gray-700">
              {t('settings.reviewTime.label')}
            </label>
            <div className="flex gap-2">
              <input
                id="reviewTime"
                type="time"
                value={settings.reviewTime}
                onChange={(e) => setSettings({ ...settings, reviewTime: e.target.value })}
                className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Button variant="primary" size="md" type="button" onClick={testNotification}>
                {t('settings.testNotification')}
              </Button>
            </div>
            <p className="text-sm text-gray-500">{t('settings.reviewTime.description')}</p>
          </div>

          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleSave}>
              {t('settings.saveButton')}
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-medium mb-6">{t('subscription.title')}</h2>
        <SubscriptionStatus
          subscription={subscription}
          isLoading={subscriptionLoading}
          onUpgrade={handleUpgrade}
          onManage={handleManageSubscription}
        />
      </div>
    </div>
  )
}

export default SettingsPage
