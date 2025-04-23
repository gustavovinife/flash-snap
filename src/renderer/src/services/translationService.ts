import axios from 'axios'

export async function playPronunciation(text: string): Promise<void> {
  try {
    const response = await axios.post(
      'https://ndkwgtcfvfrsagghsujx.supabase.co/functions/v1/swift-service',
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ka3dndGNmdmZyc2FnZ2hzdWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQzMDMxOCwiZXhwIjoyMDYxMDA2MzE4fQ.6wJVsCzlMBZKfAKhGbK58hJTkP77GV5f7Woym_JpnwM'
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
