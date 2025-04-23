import { Deck } from '../types'

const DECKS_STORAGE_KEY = 'flashsnap-decks'

// Sample decks for initial load
const sampleDecks: Deck[] = [
  {
    id: '1',
    name: 'Daily Vocabulary',
    cards: [],
    createdAt: new Date()
  }
]

// Helper to safely check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.localStorage !== undefined
  } catch (e: unknown) {
    console.error('Error checking localStorage availability:', e)
    return false
  }
}

export const getDecks = (): Deck[] => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, returning sample decks')
      return sampleDecks
    }

    const decksJson = localStorage.getItem(DECKS_STORAGE_KEY)

    if (!decksJson) {
      // Initialize with sample decks if nothing exists
      saveDecks(sampleDecks)
      return sampleDecks
    }

    return JSON.parse(decksJson, (key, value) => {
      // Convert ISO strings back to Date objects
      if (key === 'createdAt' || key === 'lastReviewed' || key === 'dueDate') {
        return value ? new Date(value) : null
      }
      return value
    })
  } catch (error) {
    console.error('Error loading decks from localStorage:', error)
    return []
  }
}

export const saveDecks = (decks: Deck[]): void => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, cannot save decks')
      return
    }

    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks))
  } catch (error) {
    console.error('Error saving decks to localStorage:', error)
  }
}

export const addDeck = (deck: Deck): void => {
  const decks = getDecks()
  decks.push(deck)
  saveDecks(decks)
}

export const updateDeck = (updatedDeck: Deck): void => {
  const decks = getDecks()
  const index = decks.findIndex((deck) => deck.id === updatedDeck.id)
  if (index !== -1) {
    decks[index] = updatedDeck
    saveDecks(decks)
  }
}

export const deleteDeck = (deckId: string): void => {
  const decks = getDecks()
  const updatedDecks = decks.filter((deck) => deck.id !== deckId)
  saveDecks(updatedDecks)
}

export const clearAllDecks = (): void => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(DECKS_STORAGE_KEY)
  }
}
