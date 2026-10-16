// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { extractText, getDocumentProxy } from 'npm:unpdf@1'
import {
  AI_MAX_FOCUS_LENGTH,
  AI_MAX_PDF_BYTES,
  AI_MAX_PROMPT_LENGTH,
  AI_MAX_SOURCE_CHARS,
  AI_MIN_PROMPT_LENGTH,
  AI_RESPONSE_SCHEMA,
  AI_SYSTEM_PROMPT,
  buildDocumentUserMessage,
  buildGenerationUserMessage,
  type GenerateDeckErrorCode,
  parseGenerationResult
} from '../../../../shared/src/ai.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function pdfError(code: GenerateDeckErrorCode, error: string, status: number): Response {
  return json({ error, code }, status)
}

// Below this a PDF is almost certainly a scan (images with no selectable text)
const MIN_DOCUMENT_CHARS = 200

interface PreparedRequest {
  userMessage: string
  document?: { pages: number; truncated: boolean }
}

async function preparePromptRequest(req: Request): Promise<PreparedRequest | Response> {
  // A PDF upload comes as multipart form data; a topic description as JSON
  const isPdf = (req.headers.get('content-type') ?? '').startsWith('multipart/form-data')
  const prepared = isPdf ? await preparePdfRequest(req, user.id) : await preparePromptRequest(req)
  if (prepared instanceof Response) return prepared
  return { userMessage: buildGenerationUserMessage(trimmed) }
}

async function preparePdfRequest(req: Request, userId: string): Promise<PreparedRequest | Response> {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return pdfError('pdf_invalid', 'Choose a PDF file.', 400)
  }

  const file = form.get('file')
  if (!(file instanceof File)) return pdfError('pdf_invalid', 'Choose a PDF file.', 400)
  if (file.size > AI_MAX_PDF_BYTES) return pdfError('pdf_too_large', 'This PDF is larger than 10 MB.', 413)

  const bytes = new Uint8Array(await file.arrayBuffer())
  // Every PDF starts with "%PDF"
  if (String.fromCharCode(...bytes.subarray(0, 4)) !== '%PDF') return pdfError('pdf_invalid', 'This file is not a PDF.', 400)

  let pages: number
  let text: string
  try {
    const pdf = await getDocumentProxy(bytes)
    const extracted = await extractText(pdf, { mergePages: true })
    pages = extracted.totalPages
    text = String(extracted.text)
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim()
  } catch (error) {
    console.error(`PDF extraction failed for user ${userId}:`, error)
    return pdfError('pdf_unreadable', "This PDF couldn't be read. Try another file.", 422)
  }

  if (text.length < MIN_DOCUMENT_CHARS) {
    return pdfError('pdf_no_text', 'This PDF has no selectable text, so it may be a scan.', 422)
  }

  const focus = String(form.get('focus') ?? '').trim().slice(0, AI_MAX_FOCUS_LENGTH)
  const fileName = file.name.replace(/["\n\r]/g, '').slice(0, 120) || 'document.pdf'
  const truncated = text.length > AI_MAX_SOURCE_CHARS
  return {
    userMessage: buildDocumentUserMessage(text.slice(0, AI_MAX_SOURCE_CHARS), focus, fileName),
    document: { pages, truncated }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
  })
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: 'You need to be signed in to generate decks.' }, 401)
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set')
    return json({ error: 'AI generation is not available right now.' }, 500)
  }

  let prompt: unknown
  try {
    ;({ prompt } = await req.json())
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const trimmed = typeof prompt === 'string' ? prompt.trim() : ''
  if (trimmed.length < AI_MIN_PROMPT_LENGTH || trimmed.length > AI_MAX_PROMPT_LENGTH) {
    return json(
      { error: `Describe your topic in ${AI_MIN_PROMPT_LENGTH} to ${AI_MAX_PROMPT_LENGTH} characters.` },
      400
    )
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: prepared.userMessage }
      ],
      temperature: 0.6,
      // Up to 50 rich cards (front, back and context) need around 6k tokens
      max_tokens: 12000,
      response_format: { type: 'json_schema', json_schema: AI_RESPONSE_SCHEMA }
    })
  })

  if (response.status === 429) {
    return json({ error: 'Too many requests. Please wait a moment and try again.' }, 429)
  }
  if (!response.ok) {
    console.error(`OpenAI request failed for user ${user.id}: ${response.status} ${await response.text()}`)
    return json({ error: 'AI service temporarily unavailable. Please try again.' }, 502)
  }

  const completion = await response.json()
  const message = completion.choices?.[0]?.message
  if (message?.refusal) {
    return json({ error: "The AI couldn't create a deck for this request. Try rephrasing it." }, 422)
  }
  const content = message?.content
  if (typeof content !== 'string') {
    return json({ error: 'The AI returned an empty response. Please try again.' }, 502)
  }

  try {
    return json({ ...parseGenerationResult(content), ...prepared.document })
  } catch (error) {
    console.error(`Invalid AI response for user ${user.id}:`, error)
    return json({ error: 'The AI returned an invalid deck. Please try again.' }, 502)
  }
})
