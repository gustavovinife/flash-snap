import OpenAI from 'openai'

/**
 * Interface for a generated card (preview state before saving)
 */
export interface GeneratedCard {
  front: string
  back: string
}

/**
 * Interface for the AI generation result
 */
export interface GenerationResult {
  deckName: string
  deckType: 'language' | 'knowledge'
  cards: GeneratedCard[]
}

/**
 * Maximum number of cards that can be generated per request
 */
const MAX_CARDS = 50

/**
 * System prompt for flashcard generation
 */
const SYSTEM_PROMPT = `You are a flashcard generation assistant. Your task is to create educational flashcards based on the user's topic.

IMPORTANT RULES:
1. Generate a maximum of ${MAX_CARDS} cards, even if the user requests more.
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

/**
 * Get the OpenAI API key from environment variables
 */
function getApiKey(): string | undefined {
  return import.meta.env.VITE_OPENAI_API_KEY
}

/**
 * Check if the OpenAI API key is configured
 */
export function isConfigured(): boolean {
  const apiKey = getApiKey()
  return !!apiKey && apiKey.trim().length > 0
}

/**
 * Create an OpenAI client instance
 */
function createClient(): OpenAI {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured')
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })
}

/**
 * Parse the OpenAI response to extract deck data
 */
function parseResponse(content: string): GenerationResult {
  try {
    const parsed = JSON.parse(content)

    // Validate required fields
    if (!parsed.deckName || typeof parsed.deckName !== 'string') {
      throw new Error('Invalid response: missing or invalid deckName')
    }

    if (!parsed.deckType || !['language', 'knowledge'].includes(parsed.deckType)) {
      throw new Error('Invalid response: deckType must be "language" or "knowledge"')
    }

    if (!Array.isArray(parsed.cards)) {
      throw new Error('Invalid response: cards must be an array')
    }

    // Validate and filter cards
    const validCards: GeneratedCard[] = parsed.cards
      .filter(
        (card: unknown): card is { front: string; back: string } =>
          typeof card === 'object' &&
          card !== null &&
          typeof (card as Record<string, unknown>).front === 'string' &&
          typeof (card as Record<string, unknown>).back === 'string' &&
          ((card as Record<string, unknown>).front as string).trim() !== '' &&
          ((card as Record<string, unknown>).back as string).trim() !== ''
      )
      .slice(0, MAX_CARDS)
      .map((card: { front: string; back: string }) => ({
        front: card.front.trim(),
        back: card.back.trim()
      }))

    return {
      deckName: parsed.deckName.trim(),
      deckType: parsed.deckType,
      cards: validCards
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response: invalid JSON format')
    }
    throw error
  }
}

/**
 * Generate a flashcard deck using AI based on the provided prompt
 * @param prompt - The user's topic or request for flashcard generation
 * @returns A promise that resolves to the generation result
 */
export async function generateDeck(prompt: string): Promise<GenerationResult> {
  if (!isConfigured()) {
    throw new Error('OpenAI API key is not configured')
  }

  const client = createClient()

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response content from AI')
    }

    return parseResponse(content)
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const status = error.status
      if (status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.')
      }
      if (status === 401) {
        throw new Error('API configuration error. Please check your settings.')
      }
      if (status && status >= 500) {
        throw new Error('AI service temporarily unavailable. Please try again.')
      }
    }
    if (error instanceof Error && error.message.includes('network')) {
      throw new Error('Connection error. Please check your internet connection.')
    }
    throw error
  }
}
