import type { DeckType } from '../entities'
import advancedSmallTalk from './advanced-small-talk-english-portuguese.json'
import beginnerEnglish from './beginner-english-portuguese.json'
import beginnerSmallTalk from './beginner-small-talk-english-portuguese.json'
import americanExpressions from './intermediate-american-expressions-english-portuguese.json'
import business from './intermediate-business-english-portuguese.json'
import restaurant from './intermediate-restaurant-english-portuguese.json'
import intermediateSmallTalk from './intermediate-small-talk-english-portuguese.json'
import travel from './intermediate-travel-english-portuguese.json'

export interface TemplateCard {
  front: string
  back: string
  content?: string
}

export interface Template {
  id: string
  name: string
  description: string
  type: DeckType
  language?: string
  nationality?: string
  emoji?: string
  cards: TemplateCard[]
}

type TemplateFile = Omit<Template, 'id' | 'type'> & { type: string }

const files: Record<string, TemplateFile> = {
  'beginner-english': beginnerEnglish,
  'beginner-small-talk': beginnerSmallTalk,
  'intermediate-small-talk': intermediateSmallTalk,
  'intermediate-travel': travel,
  'intermediate-restaurant': restaurant,
  'intermediate-business': business,
  'intermediate-american-expressions': americanExpressions,
  'advanced-small-talk': advancedSmallTalk
}

export const templates: Template[] = Object.entries(files).map(([id, file]) => ({
  ...file,
  id,
  type: file.type === 'knowledge' ? 'knowledge' : 'language'
}))

// Installed templates are recognized by deck name (decks don't store a template id)
export function isTemplateInstalled(template: Pick<Template, 'name'>, decks: { name: string }[]): boolean {
  return decks.some((deck) => deck.name === template.name)
}
