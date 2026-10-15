import { Stack } from 'expo-router'
import { useStackScreenOptions } from '@/navigation'

// Deck screens live inside the Decks tab so the tab bar / sidebar stays visible
export default function HomeLayout(): React.JSX.Element {
  const screenOptions = useStackScreenOptions()
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="deck/[id]/index" options={{ title: '' }} />
      <Stack.Screen name="deck/[id]/stats" />
    </Stack>
  )
}
