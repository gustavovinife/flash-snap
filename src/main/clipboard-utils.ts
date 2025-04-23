import { clipboard, dialog } from 'electron'
import robot from 'robotjs'

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

export function getClipboardText(): string {
  try {
    return clipboard.readText() || ''
  } catch (error) {
    console.error('Error reading clipboard:', error)
    return ''
  }
}

export function simulateCommandC(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Store clipboard before trying to copy
      const beforeText = getClipboardText()

      console.log('Simulating Cmd+C with robotjs...')

      // Different approach for different platforms
      if (process.platform === 'darwin') {
        // macOS
        robot.keyTap('c', 'command')
      } else {
        // Windows/Linux
        robot.keyTap('c', 'control')
      }

      // Wait for clipboard to update
      setTimeout(() => {
        const afterText = getClipboardText()
        const success = afterText !== beforeText

        if (success) {
          console.log('✅ Successfully copied text to clipboard')
        } else {
          console.log('❌ No new text copied to clipboard')
        }

        resolve(success)
      }, 500)
    } catch (error) {
      console.error(
        'Permission error with robotjs:',
        error instanceof Error ? error.message : String(error)
      )
      permissionError = true
      resolve(false)
    }
  })
}

// This function simulates Cmd+C and returns selected text
export async function getSelectedText(): Promise<string> {
  if (isCapturing) return ''

  isCapturing = true

  // Get clipboard content before simulating Cmd+C
  const beforeText = getClipboardText()

  // Simulate Cmd+C to copy selected text
  const copySuccess = await simulateCommandC()

  // Get clipboard content after simulating Cmd+C
  const afterText = getClipboardText()

  isCapturing = false

  // If clipboard content changed, return the new content
  if (copySuccess && afterText !== beforeText) {
    return afterText
  }

  // If nothing changed but there's something in the clipboard, return it
  if (afterText.trim() !== '') {
    return afterText
  }

  return ''
}

export function hasPermissionError(): boolean {
  return permissionError
}

export function resetPermissionError(): void {
  permissionError = false
}
