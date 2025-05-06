import './assets/main.css'
import './i18n' // Import i18n configuration
import { initSettings } from './services/settingsService'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routes from './routes'
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

// Initialize settings (including language)
initSettings()

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  </StrictMode>
)
