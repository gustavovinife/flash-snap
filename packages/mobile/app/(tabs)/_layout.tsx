import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import type { ColorValue } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { spacing, useTheme } from '@/theme'

type IconName = keyof typeof Ionicons.glyphMap

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }): React.JSX.Element {
    return <Ionicons name={focused ? active : inactive} size={24} color={color} />
  }
}

export default function TabsLayout(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const insets = useSafeAreaInsets()
  // React Navigation already pads the bar by the bottom inset; only devices reporting
  // (almost) none, like Android 3-button navigation or browsers, need extra room
  const needsExtraPadding = insets.bottom < spacing.md

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          ...(needsExtraPadding && { height: 64, paddingTop: spacing.xs, paddingBottom: spacing.md })
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.decks'), tabBarIcon: tabIcon('albums', 'albums-outline') }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: t('tabs.explore'), tabBarIcon: tabIcon('compass', 'compass-outline') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.settings'), tabBarIcon: tabIcon('settings', 'settings-outline') }}
      />
    </Tabs>
  )
}
