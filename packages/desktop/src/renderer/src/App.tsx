import { Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: '2025-11-30',
} as const
function App(): React.JSX.Element {
  return (
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      <Layout>
        <Outlet />
      </Layout>
    </PostHogProvider>
  )
}

export default App
