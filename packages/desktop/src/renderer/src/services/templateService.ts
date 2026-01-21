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
export const installTemplate = async (
  template: Template,
  addDeck: any,
  createManyCards: any,
  user_id: string
): Promise<string> => {
  if (!user_id) {
    throw new Error('User ID is required')
  }
  // Create a new deck from the template
  const newDeck = {
    name: template.name,
    user_id: user_id,
    created_at: new Date(),
    type: template.type
  }

  // Add the deck
  const response = await addDeck.mutateAsync(newDeck)

  // Add the cards
  await createManyCards.mutateAsync(
    template.cards.map((card) => ({
      front: card.front,
      back: card.back,
      context: card.content || '',
      deck_id: response.id
    }))
  )

  //notify the user
  alert(`Template ${template.name} installed successfully`)
  return response.id
}
