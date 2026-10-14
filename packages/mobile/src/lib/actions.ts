import { ActionSheetIOS, Platform } from 'react-native'
import { showDialog } from './dialogs'

export interface ActionOption {
  label: string
  onPress: () => void
  destructive?: boolean
}

export function showActions(title: string | undefined, options: ActionOption[], cancelLabel: string): void {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...options.map((option) => option.label), cancelLabel],
        cancelButtonIndex: options.length,
        destructiveButtonIndex: options.flatMap((option, index) => (option.destructive ? [index] : []))
      },
      (index) => options[index]?.onPress()
    )
    return
  }

  showDialog(title ?? '', undefined, [
    ...options.map((option) => ({
      text: option.label,
      style: option.destructive ? ('destructive' as const) : ('default' as const),
      onPress: option.onPress
    })),
    { text: cancelLabel, style: 'cancel' as const }
  ])
}

export function confirm(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
  onConfirm: () => void
): void {
  showDialog(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm }
  ])
}
