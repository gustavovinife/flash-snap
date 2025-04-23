import React from 'react'
import DeckList from '../components/DeckList'
import { Deck } from '../types'
import { useNavigate } from 'react-router-dom'

const DeckListPage: React.FC = () => {
  const navigate = useNavigate()

  const handleDeckSelect = (deck: Deck): void => {
    navigate(`/deck/${deck.id}`)
  }

  return <DeckList onDeckSelect={handleDeckSelect} />
}

export default DeckListPage
