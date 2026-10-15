import { router } from 'expo-router'
import { useTheme } from '@/theme'

/** Header styling shared by every stack navigator */
export function useStackScreenOptions() {
  const colors = useTheme()
  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: colors.background }
  }
}

/** Goes back, or to the decks screen when the page was opened directly (reload, bookmark, app shortcut) */
export function goBack(): void {
  if (router.canGoBack()) router.back()
  else router.replace('/')
}
