import AsyncStorage from '@react-native-async-storage/async-storage'

const SOUND_EFFECTS_KEY = 'flashSnap.soundEffects'

let soundEffectsEnabled = true

AsyncStorage.getItem(SOUND_EFFECTS_KEY).then((saved) => {
  if (saved !== null) soundEffectsEnabled = saved === 'true'
})

export function areSoundEffectsEnabled(): boolean {
  return soundEffectsEnabled
}

export async function setSoundEffectsEnabled(enabled: boolean): Promise<void> {
  soundEffectsEnabled = enabled
  await AsyncStorage.setItem(SOUND_EFFECTS_KEY, String(enabled))
}
