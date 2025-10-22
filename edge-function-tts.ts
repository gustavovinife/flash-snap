// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

interface reqPayload {
  text: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

console.info('TTS server started')

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text }: reqPayload = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Google Cloud Text-to-Speech API
    const apiKey = Deno.env.get('GOOGLE_API_KEY')

    if (!apiKey) {
      console.error('Google API key not found in environment variables')
      return new Response(JSON.stringify({ error: 'Google API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.info(
      `Generating TTS for text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
    )

    const ttsRequest = {
      input: { text: text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-D', // Voz masculina neural
        ssmlGender: 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ttsRequest)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google TTS API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate speech', details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()

    if (!data.audioContent) {
      console.error('No audio content received from Google TTS API')
      return new Response(JSON.stringify({ error: 'No audio content received' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Decode base64 audio content
    const audioBuffer = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))

    console.info(`Successfully generated ${audioBuffer.length} bytes of audio`)

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      }
    })
  } catch (error) {
    console.error('Error in TTS function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
