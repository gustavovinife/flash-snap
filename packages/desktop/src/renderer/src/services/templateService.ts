import { isTemplateInstalled, templates, type NewCard, type Template } from '@flash-snap/shared'
import type { UseMutationResult } from '@tanstack/react-query'
import type { Card, Deck, DeckType } from '../types'

export { isTemplateInstalled }
export type { Template }

export const getTemplates = async (): Promise<Template[]> => templates

// Function to install a template as a new deck
export const installTemplate = async (
  template: Template,
  addDeck: UseMutationResult<Deck, Error, { name: string; type: DeckType; user_id: string }, unknown>,
  createManyCards: UseMutationResult<Card[], Error, NewCard[], unknown>,
  user_id: string,
  existingDecks: { name: string }[] = []
): Promise<string> => {
  if (!user_id) {
    throw new Error('User ID is required')
  }

  if (isTemplateInstalled(template, existingDecks)) {
    throw new Error('TEMPLATE_ALREADY_INSTALLED')
  }

  const newDeck = await addDeck.mutateAsync({
    name: template.name,
    user_id,
    type: template.type
  })

  await createManyCards.mutateAsync(
    template.cards.map((card) => ({
      front: card.front,
      back: card.back,
      context: card.content || '',
      deck_id: newDeck.id
    }))
  )

  return newDeck.id
}
