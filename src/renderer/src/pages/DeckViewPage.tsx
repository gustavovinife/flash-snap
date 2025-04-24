import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import DeckView from '../components/DeckView'
import { Deck } from '../types'
import { getDecks } from '../services/storageService'

const DeckViewPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<Deck | null>(null)

  useEffect(() => {
    if (id) {
      const decks = getDecks()
      const foundDeck = decks.find((d) => d.id === id)
      if (foundDeck) {
        setDeck(foundDeck)
      } else {
        navigate('/')
      }
    }
  }, [id, navigate])

  const handleBack = (): void => {
    navigate('/')
  }

  if (!deck) {
    return <div>{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <DeckView deck={deck} onBack={handleBack} onDeckUpdated={setDeck} />
    </div>
  )
}

export default DeckViewPage
