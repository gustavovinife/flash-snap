import {
  AI_FUNCTION_NAME,
  type GenerateDeckError,
  type GenerateDeckErrorCode,
  type GenerateDeckRequest,
  type GenerationResult
} from '@flash-snap/shared'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { File as FsFile } from 'expo-file-system'
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

async function handleResponse(data: GenerationResult | null, error: unknown): Promise<GenerationResult> {
  if (error instanceof FunctionsHttpError) {
    const details = (await error.context.json().catch(() => null)) as GenerateDeckError | null
    throw new GenerateDeckFailure(details?.error ?? 'AI service temporarily unavailable. Please try again.', details?.code)
  }
  if (error || !data) {
    throw new GenerateDeckFailure('Connection error. Please check your internet connection.')
  }

  return data
}

// The generate-deck Edge Function keeps the OpenAI key on the server
export async function generateDeck(prompt: string): Promise<GenerationResult> {
  const body: GenerateDeckRequest = { prompt }
  const { data, error } = await supabase.functions.invoke<GenerationResult>(AI_FUNCTION_NAME, { body })
  return handleResponse(data, error)
}

// The PDF goes as the raw request body (multipart FormData isn't encoded the same way by every
// React Native fetch); the file name and focus travel in headers, URI-encoded to stay ASCII
export async function generateDeckFromPdf(pdf: PickedPdf, focus: string): Promise<GenerationResult> {
  const bytes = pdf.file ? await pdf.file.arrayBuffer() : await new FsFile(pdf.uri).arrayBuffer()
  const { data, error } = await supabase.functions.invoke<GenerationResult>(AI_FUNCTION_NAME, {
    body: bytes,
    headers: {
      'Content-Type': 'application/pdf',
      'x-file-name': encodeURIComponent(pdf.name),
      ...(focus.trim() && { 'x-focus': encodeURIComponent(focus.trim()) })
    }
  })
  return handleResponse(data, error)
}
