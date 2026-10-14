import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { radius, spacing, useTheme } from '@/theme'
import { Text } from './Text'

export function ProgressBar({ value, color }: { value: number; color?: string }): React.JSX.Element {
  const colors = useTheme()
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color ?? colors.primary }]} />
    </View>
  )
}

type PillTone = 'primary' | 'success' | 'warning' | 'neutral'

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }): React.JSX.Element {
  const colors = useTheme()
  const palette = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    neutral: { bg: colors.surfaceMuted, fg: colors.textMuted }
  }[tone]

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text variant="caption" style={{ color: palette.fg }}>
        {label}
      </Text>
    </View>
  )
}

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  body?: string
  children?: React.ReactNode
}

export function EmptyState({ icon, title, body, children }: EmptyStateProps): React.JSX.Element {
  const colors = useTheme()
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text variant="title" center>
        {title}
      </Text>
      {body && (
        <Text tone="muted" center>
          {body}
        </Text>
      )}
      {children && <View style={styles.emptyActions}>{children}</View>}
    </View>
  )
}

export function LoadingView(): React.JSX.Element {
  const colors = useTheme()
  return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  emptyActions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.lg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
