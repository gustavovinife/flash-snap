import { forwardRef, useState } from 'react'
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native'
import { fontSize, radius, spacing, useTheme } from '@/theme'
import { Text } from './Text'

interface TextFieldProps extends TextInputProps {
  label?: string
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, multiline, style, onFocus, onBlur, ...props },
  ref
) {
  const colors = useTheme()
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.textSubtle}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.border
          },
          style
        ]}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.body
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top'
  }
})
