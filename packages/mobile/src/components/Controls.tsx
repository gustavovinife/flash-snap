import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { radius, spacing, useTheme } from '@/theme'
import { Text } from './Text'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  description?: string
  icon?: keyof typeof Ionicons.glyphMap
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

// Large selectable tiles, used for choices like deck type or language
export function OptionTiles<T extends string>({ options, value, onChange }: SegmentedProps<T>): React.JSX.Element {
  const colors = useTheme()
  return (
    <View style={styles.tiles}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.tile,
              {
                backgroundColor: selected ? colors.primarySoft : colors.surface,
                borderColor: selected ? colors.primary : colors.border
              }
            ]}
          >
            {option.icon && (
              <Ionicons name={option.icon} size={22} color={selected ? colors.primary : colors.textMuted} />
            )}
            <View style={styles.tileText}>
              <Text variant="label" tone={selected ? 'primary' : 'default'}>
                {option.label}
              </Text>
              {option.description && (
                <Text variant="small" tone="muted">
                  {option.description}
                </Text>
              )}
            </View>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={selected ? colors.primary : colors.textSubtle}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  label: string
  tone?: 'default' | 'primary'
}

export function IconButton({ icon, onPress, label, tone = 'default' }: IconButtonProps): React.JSX.Element {
  const colors = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: tone === 'primary' ? colors.primary : colors.surfaceMuted, opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <Ionicons name={icon} size={20} color={tone === 'primary' ? colors.onPrimary : colors.text} />
    </Pressable>
  )
}

interface ListRowProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  value?: string
  onPress?: () => void
  right?: React.ReactNode
  destructive?: boolean
}

export function ListRow({ icon, title, value, onPress, right, destructive }: ListRowProps): React.JSX.Element {
  const colors = useTheme()
  const tint = destructive ? colors.danger : colors.primary
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.surfaceMuted : 'transparent' }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.rowTitle} tone={destructive ? 'danger' : 'default'} weight="500">
        {title}
      </Text>
      {value && (
        <Text variant="small" tone="muted">
          {value}
        </Text>
      )}
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tiles: { gap: spacing.sm },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5
  },
  tileText: { flex: 1, gap: 2 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowTitle: { flex: 1 }
})
