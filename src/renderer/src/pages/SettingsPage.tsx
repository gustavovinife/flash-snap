import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, saveSettings, getLanguages, Settings } from '../services/settingsService'
import { Button } from '@renderer/ui/common'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<Settings>(getSettings())
  const languages = getLanguages()

  const handleSave = (): void => {
    // Save settings to localStorage via the service
    saveSettings(settings)
    // Show success message or notification
    alert('Settings saved successfully!')
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
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-medium mb-6">Settings</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Main Language
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
            <p className="text-sm text-gray-500">
              Select your native language for better learning.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reviewTime" className="block text-sm font-medium text-gray-700">
              Daily Review Time
            </label>
            <input
              id="reviewTime"
              type="time"
              value={settings.reviewTime}
              onChange={(e) => setSettings({ ...settings, reviewTime: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500">
              Set a daily reminder time for your reviews. Default is 9:00 AM.
            </p>
          </div>

          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
