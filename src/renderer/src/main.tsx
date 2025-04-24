import './assets/main.css'
import './i18n' // Import i18n configuration
import { initSettings } from './services/settingsService'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes'

// Initialize settings (including language)
initSettings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
