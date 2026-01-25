import { app, shell, BrowserWindow, ipcMain, Tray, Menu, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import trayIcon from '../../resources/trayIcon.png?asset'
import icon from '../../resources/icon.png?asset'
import AutoLaunch from 'auto-launch'

// Disable auto-updater logging
autoUpdater.logger = null

// Auto-download updates
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

// Listen for update events
ipcMain.on('check-for-updates', () => {
  new Notification({
    title: 'Flash Snap',
    body: 'Checking for updates...'
  }).show()
  autoUpdater.checkForUpdates()
})

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let isQuiting = false
let reviewCheckInterval: NodeJS.Timeout | null = null

// Store settings in main process memory for reliable access
const cachedSettings: { reviewTime: string; lastNotificationDate: string | null } = {
  reviewTime: '09:00',
  lastNotificationDate: null
}

function showReviewNotification(message = 'Time for your daily review!'): void {
  // Check if notifications are supported
  if (!Notification.isSupported()) {
    return
  }

  const notification = new Notification({
    title: 'Flash Snap',
    body: message,
    silent: false
  })

  notification.on('click', () => {
    // Show the app when notification is clicked
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  notification.show()
}

// Function to hide dock icon (macOS only)
function hideDockIcon(): void {
  if (process.platform === 'darwin') {
    app.dock?.hide()
  }
}

// Function to show dock icon (macOS only)
function showDockIcon(): void {
  if (process.platform === 'darwin') {
    app.dock?.show()
  }
}

function checkReviewTime(): void {
  const now = new Date()
  const today = now.toDateString()

  // Skip if we already notified today
  if (cachedSettings.lastNotificationDate === today) {
    return
  }

  // Parse the review time (handles both "9:00" and "09:00" formats)
  const reviewTime = cachedSettings.reviewTime || '09:00'
  const timeParts = reviewTime.split(':')
  const targetHour = parseInt(timeParts[0], 10)
  const targetMinute = parseInt(timeParts[1] || '0', 10)

  const targetTime = new Date()
  targetTime.setHours(targetHour, targetMinute, 0, 0)

  if (now >= targetTime) {
    showReviewNotification()
    cachedSettings.lastNotificationDate = today

    // Also persist to renderer's localStorage if window is available
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents
        .executeJavaScript(`localStorage.setItem('lastReviewNotification', '${today}');`)
        .catch(() => {})
    }
  }
}

// Sync settings from renderer to main process
function syncSettingsFromRenderer(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return

  mainWindow.webContents
    .executeJavaScript(
      `
      try {
        const settingsStr = localStorage.getItem('flashSnap_settings');
        const settings = settingsStr ? JSON.parse(settingsStr) : null;
        const lastNotification = localStorage.getItem('lastReviewNotification');
        ({ reviewTime: settings?.reviewTime || '09:00', lastNotification });
      } catch (e) {
        console.error('Failed to get settings:', e);
        ({ reviewTime: '09:00', lastNotification: null });
      }
    `
    )
    .then((data: { reviewTime: string; lastNotification: string | null }) => {
      cachedSettings.reviewTime = data.reviewTime
      cachedSettings.lastNotificationDate = data.lastNotification
    })
    .catch(() => {})
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Remove the old interval
  if (reviewCheckInterval) {
    clearInterval(reviewCheckInterval)
  }

  // Check for review time every minute for better accuracy
  reviewCheckInterval = setInterval(checkReviewTime, 60 * 1000)

  if (is.dev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (
        input.key === 'F12' ||
        (input.control && input.shift && input.key.toLowerCase() === 'i')
      ) {
        mainWindow?.webContents.toggleDevTools()
        event.preventDefault()
      }
    })
  }

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow?.hide()
      if (process.platform === 'darwin') {
        hideDockIcon()
      }
    }
  })

  mainWindow.on('show', () => {
    if (process.platform === 'darwin') {
      showDockIcon()
    }
  })

  mainWindow.on('hide', () => {
    if (process.platform === 'darwin') {
      hideDockIcon()
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
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
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
    .catch(() => {})
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.flashsnap.desktop')

  // Check for updates after app is ready (only in production)
  if (!is.dev) {
    autoUpdater.checkForUpdates().catch(() => {})

    // Check for updates every hour
    setInterval(
      () => {
        autoUpdater.checkForUpdates().catch(() => {})
      },
      60 * 60 * 1000
    )
  }

  setupAutoLaunch()
  createWindow()
  createTray()

  // Hide dock icon on macOS initially
  if (process.platform === 'darwin') {
    hideDockIcon()
  }

  // Run the first check for review time after syncing settings
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      // First sync settings from renderer
      syncSettingsFromRenderer()
      // Then check review time after a short delay to allow sync to complete
      setTimeout(checkReviewTime, 1000)
    }
  }, 5000) // Give the app 5 seconds to fully initialize

  if (is.dev) {
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  else {
    // If the app is already running but hidden, show it
    mainWindow?.show()
  }
})

app.on('will-quit', () => {
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

ipcMain.on('ping', () => {})

// Listen for settings changes to update notification schedule
ipcMain.on('settings-updated', (_event, settings: { reviewTime: string }) => {
  if (settings?.reviewTime) {
    cachedSettings.reviewTime = settings.reviewTime
  }

  // Restart the check interval
  if (reviewCheckInterval) {
    clearInterval(reviewCheckInterval)
  }
  reviewCheckInterval = setInterval(checkReviewTime, 60 * 1000) // Check every minute for more accuracy

  // Run a check immediately in case the time is now
  checkReviewTime()
})

// Handle test notification request
ipcMain.on('test-notification', () => {
  showReviewNotification('This is a test notification!')
})

// Handle request to sync settings on app start
ipcMain.on(
  'sync-settings',
  (_event, settings: { reviewTime: string; lastNotification: string | null }) => {
    if (settings) {
      cachedSettings.reviewTime = settings.reviewTime || '09:00'
      cachedSettings.lastNotificationDate = settings.lastNotification
    }
  }
)

autoUpdater.on('update-available', () => {
  new Notification({
    title: 'Flash Snap',
    body: 'A new update is available. Downloading...'
  }).show()
})

autoUpdater.on('update-downloaded', () => {
  new Notification({
    title: 'Flash Snap',
    body: 'Update downloaded. Restart the app to apply the update.'
  }).show()
})

// Remove the protocol handler setup since we're not using custom protocols
// and replace with proper Electron auth handling
app.on('web-contents-created', (_, contents) => {
  // Allow navigation to auth providers and redirect URLs
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    const allowedDomains = ['accounts.google.com', 'svufbwjdrbmiyvhimutm.supabase.co', 'localhost']

    // Allow navigation only to specific domains
    if (!allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      event.preventDefault()
      shell.openExternal(navigationUrl)
    }
  })

  // Open external links in default browser
  contents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url)
    const allowedDomains = ['accounts.google.com', 'svufbwjdrbmiyvhimutm.supabase.co']

    if (allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      return { action: 'allow' }
    }

    shell.openExternal(url)
    return { action: 'deny' }
  })
})

// Add an IPC handler for opening external URLs
ipcMain.on('open-external-url', (_event, url) => {
  shell.openExternal(url).catch(() => {
    // Silently handle errors
  })
})

// Register the app as a protocol handler
app.setAsDefaultProtocolClient('flash-snap')

// Handle the protocol. In this case, we choose to show the window and process the auth URL
function processDeepLink(url: string): void {
  if (!url) return

  // Show the window if it exists
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()

    // Process the URL - if it's an auth callback, send it to the renderer
    if (url.includes('access_token') || url.includes('refresh_token') || url.includes('code=')) {
      mainWindow.webContents.send('auth-callback', url)
    }
  }
}

// Handle deep linking on macOS
app.on('open-url', (event, url) => {
  event.preventDefault()
  processDeepLink(url)
})

// Handle deep linking on Windows
if (process.platform === 'win32') {
  // Keep only the first instance
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (_, commandLine) => {
      // Someone tried to run a second instance, we should focus our window
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }

      // Extract deep link URL from second instance (Windows)
      const deepLinkUrl = commandLine.find((arg) => arg.startsWith('flash-snap://'))
      if (deepLinkUrl) {
        processDeepLink(deepLinkUrl)
      }
    })
  }
}

// Process any deep link URLs that are part of the process.argv (Windows)
if (process.platform === 'win32') {
  const deepLinkUrl = process.argv.find((arg) => arg.startsWith('flash-snap://'))
  if (deepLinkUrl) {
    processDeepLink(deepLinkUrl)
  }
}

// Add an IPC handler for showing the app window
ipcMain.on('show-app', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()

    // Show dock icon on macOS when the app is active
    if (process.platform === 'darwin') {
      showDockIcon()
    }
  }
})
