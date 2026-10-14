// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import {
  AI_MAX_PROMPT_LENGTH,
  AI_MIN_PROMPT_LENGTH,
  AI_RESPONSE_SCHEMA,
  AI_SYSTEM_PROMPT,
  buildGenerationUserMessage,
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
        { role: 'user', content: buildGenerationUserMessage(trimmed) }
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
    return json(parseGenerationResult(content))
  } catch (error) {
    console.error(`Invalid AI response for user ${user.id}:`, error)
    return json({ error: 'The AI returned an invalid deck. Please try again.' }, 502)
  }
})
