// Also imported by the generate-deck Supabase Edge Function (Deno), so this file must not import anything.

export const AI_MAX_CARDS = 50
export const AI_MIN_PROMPT_LENGTH = 3
export const AI_MAX_PROMPT_LENGTH = 500
export const AI_FUNCTION_NAME = 'generate-deck'

export interface GeneratedCard {
  front: string
  back: string
}

export interface GenerationResult {
  deckName: string
  deckType: 'language' | 'knowledge'
  cards: GeneratedCard[]
}

export interface GenerateDeckRequest {
  prompt: string
}

export interface GenerateDeckError {
  error: string
}

export const AI_SYSTEM_PROMPT = `You are a flashcard generation assistant. Your task is to create educational flashcards based on the user's topic.

IMPORTANT RULES:
1. Generate a maximum of ${AI_MAX_CARDS} cards, even if the user requests more.
2. Each card must have a "front" (question/term) and "back" (answer/definition).
3. Determine an appropriate deck name based on the topic.
4. Determine the deck type: "language" for language learning topics, "knowledge" for everything else.

You MUST respond with valid JSON in this exact format:
{
  "deckName": "string - a concise, descriptive name for the deck",
  "deckType": "language" or "knowledge",
  "cards": [
    { "front": "question or term", "back": "answer or definition" }
  ]
}

Make the cards educational, clear, and useful for spaced repetition learning.`

function isCard(value: unknown): value is GeneratedCard {
  if (typeof value !== 'object' || value === null) return false
  const { front, back } = value as Record<string, unknown>
  return typeof front === 'string' && typeof back === 'string' && front.trim() !== '' && back.trim() !== ''
}

/** Validates the model's JSON answer, dropping malformed cards and capping the card count. */
export function parseGenerationResult(content: string): GenerationResult {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Failed to parse AI response: invalid JSON format')
  }

  const { deckName, deckType, cards } = parsed
  if (typeof deckName !== 'string' || !deckName.trim()) {
    throw new Error('Invalid response: missing or invalid deckName')
  }
  if (deckType !== 'language' && deckType !== 'knowledge') {
    throw new Error('Invalid response: deckType must be "language" or "knowledge"')
  }
  if (!Array.isArray(cards)) {
    throw new Error('Invalid response: cards must be an array')
  }

  return {
    deckName: deckName.trim(),
    deckType,
    cards: cards
      .filter(isCard)
      .slice(0, AI_MAX_CARDS)
      .map((card) => ({ front: card.front.trim(), back: card.back.trim() }))
  }
}

export interface PresetPrompt {
  id: string
  /** Translation key under each app's `aiGeneration.presets` namespace */
  labelKey: string
  prompt: string
  category: 'language' | 'knowledge'
}

export const AI_PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'english-travel',
    labelKey: 'englishTravel',
    prompt:
      'Generate 30 flashcards with essential English phrases and vocabulary for traveling, including airport, hotel, restaurant, and directions',
    category: 'language'
  },
  {
    id: 'english-interviews',
    labelKey: 'englishInterviews',
    prompt: 'Generate 30 flashcards with professional English vocabulary and phrases commonly used in job interviews',
    category: 'language'
  },
  {
    id: 'spanish-basics',
    labelKey: 'spanishBasics',
    prompt: 'Generate 30 flashcards with basic Spanish vocabulary and common phrases for beginners',
    category: 'language'
  },
  {
    id: 'js-programming',
    labelKey: 'jsProgram',
    prompt:
      'Generate 30 flashcards about JavaScript programming fundamentals including variables, functions, arrays, objects, and ES6 features',
    category: 'knowledge'
  },
  {
    id: 'python-programming',
    labelKey: 'pythonProgram',
    prompt: 'Generate 30 flashcards about Python programming including syntax, data structures, and common patterns',
    category: 'knowledge'
  }
]
