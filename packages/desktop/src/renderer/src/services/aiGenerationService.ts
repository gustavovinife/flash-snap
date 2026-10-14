import {
  AI_FUNCTION_NAME,
  type GenerateDeckError,
  type GenerateDeckRequest,
  type GenerationResult
} from '@flash-snap/shared'
import { FunctionsHttpError } from '@supabase/supabase-js'
import supabase from './supabaseService'

export type { GeneratedCard, GenerationResult } from '@flash-snap/shared'

/**
 * Generates a flashcard deck with AI through the generate-deck Supabase Edge Function,
 * which keeps the OpenAI key on the server.
 */
export async function generateDeck(prompt: string): Promise<GenerationResult> {
  const body: GenerateDeckRequest = { prompt }
  const { data, error } = await supabase.functions.invoke<GenerationResult>(AI_FUNCTION_NAME, { body })

  if (error instanceof FunctionsHttpError) {
    const details = (await error.context.json().catch(() => null)) as GenerateDeckError | null
    throw new Error(details?.error ?? 'AI service temporarily unavailable. Please try again.')
  }
  if (error || !data) {
    throw new Error('Connection error. Please check your internet connection.')
  }

  return data
}
