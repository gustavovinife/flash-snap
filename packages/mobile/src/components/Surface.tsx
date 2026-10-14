import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native'
import { radius, spacing, useTheme } from '@/theme'

interface SurfaceProps extends ViewProps {
  onPress?: () => void
  padded?: boolean
  style?: ViewStyle | ViewStyle[]
}

export function Surface({ onPress, padded = true, style, children, ...props }: SurfaceProps): React.JSX.Element {
  const colors = useTheme()
  const base = [
    styles.surface,
    padded && styles.padded,
    { backgroundColor: colors.surface, borderColor: colors.border }
  ]

  if (!onPress) {
    return (
      <View {...props} style={[...base, style]}>
        {children}
      </View>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [...base, pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 }, style]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth
  },
  padded: {
    padding: spacing.lg
  }
})
