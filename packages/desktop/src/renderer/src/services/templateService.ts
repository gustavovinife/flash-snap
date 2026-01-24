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

// Check if a template is already installed (by matching deck name)
export const isTemplateInstalled = (
  template: Template,
  existingDecks: { name: string }[]
): boolean => {
  return existingDecks.some((deck) => deck.name === template.name)
}

// Function to install a template as a new deck
export const installTemplate = async (
  template: Template,
  addDeck: any,
  createManyCards: any,
  user_id: string,
  existingDecks: { name: string }[] = []
): Promise<string> => {
  if (!user_id) {
    throw new Error('User ID is required')
  }

  // Check if template is already installed
  if (isTemplateInstalled(template, existingDecks)) {
    throw new Error('TEMPLATE_ALREADY_INSTALLED')
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

  return response.id
}
