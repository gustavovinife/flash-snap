import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native'
import { fontSize, useTheme } from '@/theme'

type Variant = 'display' | 'headline' | 'title' | 'body' | 'label' | 'small' | 'caption'
type Tone = 'default' | 'muted' | 'subtle' | 'primary' | 'danger' | 'success' | 'inverse'

interface TextProps extends RNTextProps {
  variant?: Variant
  tone?: Tone
  weight?: '400' | '500' | '600' | '700' | '800'
  center?: boolean
}

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  center,
  style,
  ...props
}: TextProps): React.JSX.Element {
  const colors = useTheme()
  const toneColor = {
    default: colors.text,
    muted: colors.textMuted,
    subtle: colors.textSubtle,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    inverse: colors.onPrimary
  }[tone]

  return (
    <RNText
      {...props}
      style={[
        styles[variant],
        { color: toneColor },
        weight && { fontWeight: weight },
        center && styles.center,
        style
      ]}
    />
  )
}

const styles = StyleSheet.create({
  display: { fontSize: fontSize.display, fontWeight: '800', letterSpacing: -0.6 },
  headline: { fontSize: fontSize.headline, fontWeight: '800', letterSpacing: -0.4 },
  title: { fontSize: fontSize.title, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: fontSize.body, lineHeight: 22 },
  label: { fontSize: fontSize.small, fontWeight: '600' },
  small: { fontSize: fontSize.small, lineHeight: 20 },
  caption: { fontSize: fontSize.caption, fontWeight: '600', letterSpacing: 0.3 },
  center: { textAlign: 'center' }
})
