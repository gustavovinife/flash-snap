import {
  AI_FUNCTION_NAME,
  type GenerateDeckError,
  type GenerateDeckErrorCode,
  type GenerateDeckRequest,
  type GenerationResult
} from '@flash-snap/shared'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

/** Carries the server's error code so the screen can explain it in the user's language */
export class GenerateDeckFailure extends Error {
  constructor(
    message: string,
    readonly code?: GenerateDeckErrorCode
  ) {
    super(message)
  }
}

/** A PDF picked with expo-document-picker (`file` is set on web) */
export interface PickedPdf {
  name: string
  uri: string
  size?: number
  mimeType?: string
  file?: File
}

// The generate-deck Edge Function keeps the OpenAI key on the server
async function invokeGenerateDeck(body: GenerateDeckRequest | FormData): Promise<GenerationResult> {
  const { data, error } = await supabase.functions.invoke<GenerationResult>(AI_FUNCTION_NAME, { body })

  if (error instanceof FunctionsHttpError) {
    const details = (await error.context.json().catch(() => null)) as GenerateDeckError | null
    throw new GenerateDeckFailure(details?.error ?? 'AI service temporarily unavailable. Please try again.', details?.code)
  }
  if (error || !data) {
    throw new GenerateDeckFailure('Connection error. Please check your internet connection.')
  }

  return data
}

export function generateDeck(prompt: string): Promise<GenerationResult> {
  return invokeGenerateDeck({ prompt })
}

export function generateDeckFromPdf(pdf: PickedPdf, focus: string): Promise<GenerationResult> {
  const form = new FormData()
  if (pdf.file) {
    form.append('file', pdf.file, pdf.name)
  } else {
    // React Native's FormData uploads a local file from its uri
    form.append('file', { uri: pdf.uri, name: pdf.name, type: pdf.mimeType ?? 'application/pdf' } as unknown as Blob)
  }
  if (focus.trim()) form.append('focus', focus.trim())
  return invokeGenerateDeck(form)
}
