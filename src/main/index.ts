import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Tray,
  Menu,
  Notification
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import trayIcon from '../../resources/trayIcon.png?asset'
import AutoLaunch from 'auto-launch'
import {
  getSelectedText,
  showNotification,
  hasPermissionError,
  resetPermissionError
} from './clipboard-utils'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let isQuiting = false
let reviewCheckInterval: NodeJS.Timeout | null = null

function showReviewNotification(message = 'Time for your daily review!'): void {
  new Notification({
    title: 'Flash Snap',
    body: message
  }).show()
}

function checkReviewTime(): void {
  if (!mainWindow) return

  mainWindow.webContents
    .executeJavaScript(
      `
      try {
        const settingsStr = localStorage.getItem('flashSnap_settings');
        const settings = settingsStr ? JSON.parse(settingsStr) : null;

        const last = localStorage.getItem('lastReviewNotification');

        ({ settings, last });
      } catch (e) {
        console.error('Failed to get settings:', e);
        null;
      }
    `
    )
    .then((data) => {
      if (!data || !data.settings) return

      const { settings, last } = data
      const now = new Date()

      const [hourStr, minuteStr] = (settings.reviewTime || '9:0').split(':')
      const targetTime = new Date()
      targetTime.setHours(parseInt(hourStr), parseInt(minuteStr), 0, 0)

      const today = now.toDateString()

      if (now >= targetTime && last !== today) {
        showReviewNotification()
        mainWindow?.webContents.executeJavaScript(`
          localStorage.setItem('lastReviewNotification', '${today}');
        `)
      }
    })
    .catch((err) => {
      console.error('Error checking review time:', err)
    })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: trayIcon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Remove the old interval
  if (reviewCheckInterval) {
    clearInterval(reviewCheckInterval)
  }

  // Check for review time every 5 minutes
  reviewCheckInterval = setInterval(checkReviewTime, 5 * 60 * 1000)

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow?.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Flash Snap',
      click: () => {
        mainWindow?.show()
      }
    },
    {
      label: 'Quit',
      click: () => {
        isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Flash Snap')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show()
  })
}

function registerGlobalShortcut(): void {
  const shortcut = 'CommandOrControl+Shift+X'

  const success = globalShortcut.register(shortcut, async () => {
    try {
      const clipboardText = await getSelectedText()

      if (hasPermissionError()) {
        showNotification(
          'Permission denied. Enable it in System Preferences > Security & Privacy > Accessibility.',
          'error'
        )
        resetPermissionError()
        return
      }

      if (clipboardText?.trim()) {
        console.log('🔤 Text captured:', clipboardText)

        // Garante que a janela vai abrir e receber foco
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }

        mainWindow?.webContents.send('text-captured', clipboardText)
      } else {
        console.log('⚠️ No text selected')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Error in clipboard:', message)
      showNotification(`Error: ${message}`, 'error')
    }
  })

  if (!success) {
    console.error('❌ Failed to register global shortcut')
  }
}

function setupAutoLaunch(): void {
  const flashSnapAutoLauncher = new AutoLaunch({
    name: 'Flash Snap',
    path: app.getPath('exe'),
    isHidden: true
  })

  flashSnapAutoLauncher
    .isEnabled()
    .then((isEnabled) => {
      if (!isEnabled) flashSnapAutoLauncher.enable()
    })
    .catch((err) => {
      console.error('Error configuring auto-launch:', err)
    })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  setupAutoLaunch()
  createWindow()
  createTray()
  registerGlobalShortcut()

  // Run the first check for review time
  setTimeout(() => {
    if (mainWindow && mainWindow.webContents.isLoading() === false) {
      checkReviewTime()
    }
  }, 5000) // Give the app 5 seconds to fully initialize

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  if (reviewCheckInterval) {
    clearInterval(reviewCheckInterval)
  }
  tray?.destroy()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('ping', () => console.log('pong'))

// Listen for settings changes to update notification schedule
ipcMain.on('settings-updated', () => {
  console.log('Settings updated, restarting review check interval')
  if (reviewCheckInterval) {
    clearInterval(reviewCheckInterval)
  }
  reviewCheckInterval = setInterval(checkReviewTime, 5 * 60 * 1000)

  // Run a check immediately in case the time is now
  if (mainWindow && mainWindow.webContents.isLoading() === false) {
    checkReviewTime()
  }
})
