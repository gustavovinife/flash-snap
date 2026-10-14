import { useAudioPlayer } from 'expo-audio'
import { areSoundEffectsEnabled } from '@/lib/soundSettings'

/** Plays a chime when a card is remembered and a soft low tone when it's forgotten. */
export function useReviewSounds(): (grade: number) => void {
  const success = useAudioPlayer(require('../../assets/sounds/success.wav'))
  const miss = useAudioPlayer(require('../../assets/sounds/miss.wav'))

  return (grade) => {
    if (!areSoundEffectsEnabled()) return
    // SM-2 treats grades below 3 as forgotten
    const player = grade < 3 ? miss : success
    void player.seekTo(0).then(() => player.play())
  }
}
