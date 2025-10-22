import axios from 'axios'
import supabase from './supabaseService'

export async function playPronunciation(text: string): Promise<void> {
  try {
    // Get the current session to use the access token
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      console.error('No active session for TTS request')
      return
    }

    const response = await axios.post(
      'https://svufbwjdrbmiyvhimutm.supabase.co/functions/v1/bright-function',
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        responseType: 'arraybuffer' // Important: this ensures you get the binary data
      }
    )

    if (response.status !== 200) {
      console.error('Erro ao buscar áudio:', response.data)
      return
    }

    // Convert the binary audio data into a Blob
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)

    // Play the audio
    const audio = new Audio(audioUrl)
    audio.play()
  } catch (error) {
    console.error('Erro ao buscar áudio:', error)
  }
}
