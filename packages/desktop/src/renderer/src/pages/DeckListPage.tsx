import React, { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
import DeckList from '../components/DeckList'

const DeckListPage: React.FC = () => {
  const posthog = usePostHog()

  useEffect(() => {
    posthog.capture('page_viewed', { page: 'home' })
  }, [])

  return <DeckList />
}

export default DeckListPage
