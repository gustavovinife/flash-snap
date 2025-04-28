import { Deck } from '../types'
import { addDeck } from './storageService'

export interface Template {
  name: string
  description: string
  type: 'language' | 'knowledge'
  language?: string
  nationality?: string
  emoji?: string
  cards: Array<{
    front: string
    back: string
    content?: string
  }>
}

// Function to load all available templates
export const getTemplates = async (): Promise<Template[]> => {
  try {
    // Dynamically import all templates
    const templateModules = import.meta.glob('../data/templates/*.json', { eager: true })

    return Object.values(templateModules).map((module) => module as unknown as Template)
  } catch (error) {
    console.error('Error loading templates:', error)
    return []
  }
}

// Function to install a template as a new deck
export const installTemplate = (template: Template): string => {
  // Create a new deck from the template
  const newDeck: Deck = {
    id: Date.now().toString(),
    name: template.name,
    cards: template.cards.map((card) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      front: card.front,
      back: card.back,
      context: card.content || ''
    })),
    createdAt: new Date(),
    type: template.type
  }

  // Add the deck
  addDeck(newDeck)

  //notify the user
  alert(`Template ${template.name} installed successfully`)
  return newDeck.id
}
