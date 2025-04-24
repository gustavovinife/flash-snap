import { createHashRouter } from 'react-router-dom'
import DeckListPage from './pages/DeckListPage'
import DeckViewPage from './pages/DeckViewPage'
import ReviewPage from './pages/ReviewPage'
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import App from './App'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DeckListPage />
      },
      {
        path: '/deck/:id',
        element: <DeckViewPage />
      },
      {
        path: '/review',
        element: <ReviewPage />
      },
      {
        path: '/review/:id',
        element: <ReviewPage />
      },
      {
        path: '/reports/:id',
        element: <ReportsPage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      }
    ]
  }
])

export default router
