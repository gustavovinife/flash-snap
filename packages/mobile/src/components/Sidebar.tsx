import type { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { openInstallPrompt, useInstallMode } from '@/lib/install'
import { isHovered, radius, spacing, useTheme } from '@/theme'
import { Button } from './Button'
import { Logo } from './Logo'
import { StreakBadge } from './StreakBadge'
import { Text } from './Text'

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0]

const SIDEBAR_WIDTH = 248

/** Navigation for wide screens, replacing the bottom tab bar */
export function Sidebar({ state, descriptors, navigation }: TabBarProps): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { user } = useAuth()
  const installMode = useInstallMode()

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      <View style={styles.brand}>
        <Logo size={36} />
        <Text variant="title">Flash Snap</Text>
      </View>

      <View style={styles.nav}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const focused = state.index === index
          const color = focused ? colors.primary : colors.textMuted

          // Same behavior as the default tab bar: pressing the active tab pops its stack to the top
          const onPress = (): void => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params)
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={(pressState) => [
                styles.item,
                {
                  backgroundColor: focused
                    ? colors.primarySoft
                    : isHovered(pressState)
                      ? colors.surfaceMuted
                      : 'transparent'
                }
              ]}
            >
              {options.tabBarIcon?.({ focused, color, size: 22 })}
              <Text variant="label" style={{ color, fontSize: 15 }}>
                {typeof options.title === 'string' ? options.title : route.name}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.footer}>
        <StreakBadge showLabel />
        {installMode && (
          <Button
            compact
            variant="secondary"
            icon="download-outline"
            title={t('settings.installApp')}
            onPress={openInstallPrompt}
          />
        )}
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {user?.email}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    gap: spacing.xl
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm },
  nav: { flex: 1, gap: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md
  },
  footer: { gap: spacing.md, paddingHorizontal: spacing.sm }
})
