import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import DeckView from '../components/DeckView'
import { useDecks } from '../hooks/useDecks'

const DeckViewPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { decks, isLoading } = useDecks()

  const deck = useMemo(() => {
    return decks.find((d) => d.id === id)
  }, [decks, id])

  if (isLoading) {
    return <div>{t('common.loading')}</div>
  }

  if (!deck && !isLoading) {
    // Only show loading if we're still waiting for data
    return <div>{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <DeckView deck={deck!} />
    </div>
  )
}

export default DeckViewPage
