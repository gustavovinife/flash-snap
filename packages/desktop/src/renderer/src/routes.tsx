import { createHashRouter, RouterProvider } from 'react-router-dom'
import DeckListPage from './pages/DeckListPage'
import DeckViewPage from './pages/DeckViewPage'
import ReviewPage from './pages/ReviewPage'
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import TemplatesPage from './pages/TemplatesPage'
import LoginPage from './pages/LoginPage'
import App from './App'
import { SessionProvider } from './context/SessionContext'
import ProtectedRoute from './components/ProtectedRoute'

const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
        path: '/templates',
        element: <TemplatesPage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      }
    ]
  }
])

const Routes = (): React.ReactNode => {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  )
}

export default Routes
