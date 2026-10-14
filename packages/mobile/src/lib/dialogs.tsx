import { useEffect, useState } from 'react'
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/Text'
import { radius, spacing, useTheme } from '@/theme'

export interface DialogButton {
  text: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress?: () => void
}

interface DialogRequest {
  title: string
  message?: string
  buttons: DialogButton[]
}

let presentDialog: ((request: DialogRequest) => void) | null = null

/** Same contract as Alert.alert, which does nothing on web; there a <DialogHost /> renders it. */
export function showDialog(title: string, message?: string, buttons: DialogButton[] = [{ text: 'OK' }]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons)
    return
  }
  presentDialog?.({ title, message, buttons })
}

export function DialogHost(): React.JSX.Element | null {
  const colors = useTheme()
  const [dialog, setDialog] = useState<DialogRequest | null>(null)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    presentDialog = setDialog
    return () => {
      presentDialog = null
    }
  }, [])

  if (!dialog) return null

  const press = (button: DialogButton): void => {
    setDialog(null)
    button.onPress?.()
  }
  const cancel = dialog.buttons.find((button) => button.style === 'cancel')

  return (
    <Modal transparent animationType="fade" onRequestClose={() => (cancel ? press(cancel) : setDialog(null))}>
      <Pressable style={styles.backdrop} onPress={() => (cancel ? press(cancel) : setDialog(null))}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => {}}>
          {dialog.title ? <Text variant="title">{dialog.title}</Text> : null}
          {dialog.message ? <Text tone="muted">{dialog.message}</Text> : null}
          <View style={styles.buttons}>
            {dialog.buttons.map((button) => {
              const tint =
                button.style === 'destructive' ? colors.danger : button.style === 'cancel' ? colors.textMuted : colors.primary
              return (
                <Pressable
                  key={button.text}
                  accessibilityRole="button"
                  onPress={() => press(button)}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: pressed ? colors.surfaceMuted : colors.background }
                  ]}
                >
                  <Text variant="label" style={{ color: tint }} center>
                    {button.text}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md
  },
  buttons: { gap: spacing.sm, marginTop: spacing.sm },
  button: { borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg }
})
