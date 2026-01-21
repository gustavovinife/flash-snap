import { clipboard, dialog } from 'electron'
import { exec } from 'child_process'

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

/**
 * Execute a system command
 */
function executeCommand(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) {
        console.error(`Error executing command: ${cmd}`, error)
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Simulates copy command using system-specific commands
 * This is a more reliable approach than using native modules
 */
export function simulateCommandC(): Promise<boolean> {
  // Store clipboard before trying to copy
  const beforeText = getClipboardText()

  // Create a promise for the copy operation
  return new Promise((resolve) => {
    // Inner async function to handle the copy operation
    const performCopy = async (): Promise<void> => {
      try {
        // Try to simulate Ctrl+C/Cmd+C using OS-specific commands
        try {
          if (process.platform === 'darwin') {
            // macOS - use AppleScript
            await executeCommand(
              'osascript -e \'tell application "System Events" to keystroke "c" using command down\''
            )
          } else if (process.platform === 'win32') {
            // Windows - use PowerShell and .NET
            await executeCommand(
              'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^c\')"'
            )
          } else {
            // Linux - use xdotool if available
            await executeCommand('xdotool key ctrl+c')
          }
        } catch (err) {
          console.error('Failed to simulate key press:', err)
        }

        // Wait for clipboard to update
        await new Promise((r) => setTimeout(r, 500))

        // Check if clipboard changed
        const afterText = getClipboardText()
        const success = afterText !== beforeText

        if (success) {
          console.log('✅ Successfully copied text to clipboard')
        } else {
          console.log('❌ No new text copied to clipboard')
        }

        resolve(success)
      } catch (error) {
        console.error(
          'Error simulating copy command:',
          error instanceof Error ? error.message : String(error)
        )
        permissionError = true
        resolve(false)
      }
    }

    // Execute the async function
    performCopy()
  })
}

// Alternative implementation that uses the system clipboard directly
export async function getSelectedText(): Promise<string> {
  if (isCapturing) return ''

  isCapturing = true

  try {
    // Store original clipboard content
    const originalClipboard = getClipboardText()

    // Clear the clipboard
    clipboard.clear()

    // Wait a moment for clipboard to clear
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Try to capture selection via clipboard
    const copied = await simulateCommandC()

    // Get the new clipboard content
    const selectedText = getClipboardText()

    // Restore original clipboard content
    if (originalClipboard) {
      clipboard.writeText(originalClipboard)
    }

    return copied ? selectedText : ''
  } catch (error) {
    console.error('Error getting selected text:', error)
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
