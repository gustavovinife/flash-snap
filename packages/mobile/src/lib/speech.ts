import * as Speech from 'expo-speech'

// Language decks hold English on the front (same as the desktop templates)
export function speak(text: string): void {
  Speech.stop()
  Speech.speak(text, { language: 'en-US', rate: 0.95 })
}
