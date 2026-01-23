import { clipboard, dialog, systemPreferences } from 'electron'

let isCapturing = false
let permissionError = false

export function showNotification(message: string, type: 'info' | 'error' = 'info'): void {
  dialog.showMessageBox({
    type,
    title: 'FlashSnap',
    message,
    buttons: ['OK']
  })
}

/**
 * Check if the app has accessibility permissions on macOS
 */
export function checkAccessibilityPermission(): boolean {
  if (process.platform === 'darwin') {
    // Check if we have accessibility permissions
    const isTrusted = systemPreferences.isTrustedAccessibilityClient(false)
    return isTrusted
  }
  return true // Non-macOS platforms don't need this check
}

/**
 * Prompt user to grant accessibility permissions on macOS
 */
export function promptAccessibilityPermission(): boolean {
  if (process.platform === 'darwin') {
    // This will show the system prompt to grant accessibility permissions
    const isTrusted = systemPreferences.isTrustedAccessibilityClient(true)
    return isTrusted
  }
  return true
}

export function getClipboardText(): string {
  try {
    return clipboard.readText() || ''
  } catch (error) {
    console.error('Error reading clipboard:', error)
    return ''
  }
}

/**
 * On macOS, we can't reliably simulate Cmd+C due to security restrictions.
 * Instead, we'll inform the user to copy the text first, then use the shortcut.
 *
 * Alternative approach: The user selects text and presses Cmd+C themselves,
 * then presses our shortcut to capture from clipboard.
 */
export async function getSelectedText(): Promise<string> {
  if (isCapturing) return ''

  isCapturing = true

  try {
    // Simply read whatever is currently in the clipboard
    // The user should copy text first (Cmd+C), then press our shortcut
    const clipboardText = getClipboardText()

    if (clipboardText?.trim()) {
      console.log('✅ Text found in clipboard')
      return clipboardText
    } else {
      console.log('❌ No text in clipboard')
      permissionError = false // Not a permission error, just no text
      return ''
    }
  } catch (error) {
    console.error('Error getting clipboard text:', error)
    return ''
  } finally {
    isCapturing = false
  }
}

export function hasPermissionError(): boolean {
  return permissionError
}

export function resetPermissionError(): void {
  permissionError = false
}
