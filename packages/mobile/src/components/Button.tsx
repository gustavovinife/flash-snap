import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import { isHovered, radius, spacing, useTheme } from '@/theme'
import { Text } from './Text'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: Variant
  icon?: keyof typeof Ionicons.glyphMap
  loading?: boolean
  disabled?: boolean
  compact?: boolean
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  compact,
  style
}: ButtonProps): React.JSX.Element {
  const colors = useTheme()
  const isDisabled = disabled || loading

  const palette = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary },
    secondary: { bg: colors.primarySoft, pressed: colors.surfaceMuted, fg: colors.primary },
    ghost: { bg: 'transparent', pressed: colors.surfaceMuted, fg: colors.primary },
    danger: { bg: colors.dangerSoft, pressed: colors.surfaceMuted, fg: colors.danger }
  }[variant]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: state.pressed || (isHovered(state) && !isDisabled) ? palette.pressed : palette.bg,
          opacity: isDisabled ? 0.5 : 1
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={compact ? 16 : 18} color={palette.fg} />}
          <Text variant="label" style={{ color: palette.fg, fontSize: compact ? 14 : 16 }}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compact: {
    minHeight: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  }
})
