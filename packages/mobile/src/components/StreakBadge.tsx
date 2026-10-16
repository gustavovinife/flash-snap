import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { useStreak } from '@/hooks/useStreak'
import { radius, spacing, useTheme } from '@/theme'
import { Text } from './Text'

/** Flame with the current streak; lit once today has a review, grey while the streak still needs one */
export function StreakBadge({
  showLabel = false,
  style
}: {
  showLabel?: boolean
  style?: StyleProp<ViewStyle>
}): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { current, reviewedToday } = useStreak()
  const color = reviewedToday ? colors.warning : colors.textSubtle

  return (
    <View
      accessible
      accessibilityLabel={reviewedToday ? t('streak.days', { count: current }) : t('streak.keepItGoing', { count: current })}
      style={[styles.badge, { backgroundColor: reviewedToday ? colors.warningSoft : colors.surfaceMuted }, style]}
    >
      <Ionicons name={reviewedToday ? 'flame' : 'flame-outline'} size={18} color={color} />
      <Text variant="label" style={{ color }}>
        {showLabel ? (current > 0 ? t('streak.days', { count: current }) : t('streak.start')) : current}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radius.pill
  }
})
