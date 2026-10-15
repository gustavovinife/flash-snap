import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { type ColorValue, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Sidebar } from '@/components/Sidebar'
import { useLayout } from '@/hooks/useLayout'
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
  const { isDesktop } = useLayout()
  // Devices reporting no bottom inset (Android 3-button navigation, browsers) still get some room;
  // React Navigation sizes the bar from this inset
  const bottomInset = Math.max(insets.bottom, spacing.md)

  return (
    <Tabs
      safeAreaInsets={{ bottom: bottomInset }}
      tabBar={isDesktop ? (props) => <Sidebar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // Browsers render the 10pt label taller than native, which clips it in the default 49pt bar
          ...(Platform.OS === 'web' && { height: 55 + bottomInset })
        },
        tabBarLabelStyle: { fontWeight: '600' }
      }}
    >
      <Tabs.Screen
        name="(home)"
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
