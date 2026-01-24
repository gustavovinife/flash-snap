import { app, shell, BrowserWindow, ipcMain, Tray, Menu, Notification, autoUpdater } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import trayIcon from '../../resources/trayIcon.png?asset'
import icon from '../../resources/icon.png?asset'
import AutoLaunch from 'auto-launch'
import { updateElectronApp } from 'update-electron-app'

// Initialize automatic updates
updateElectronApp({
  repo: 'gustavowebjs/flash-snap',
  updateInterval: '1 hour',
  logger: {
    info: (message: string) => console.log(`Update info: ${message}`),
    warn: (message: string) => console.warn(`Update warning: ${message}`),
    error: (message: string) => console.error(`Update error: ${message}`),
    log: (message: string) => console.log(`Update log: ${message}`)
  },
  notifyUser: true
})

// Listen for update events
ipcMain.on('check-for-updates', () => {
  // The update-electron-app package automatically checks for updates
  // This is just to provide feedback to the user when manually checking
  new Notification({
    title: 'Flash Snap',
    body: 'Checking for updates...'
  }).show()
})

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
    .catch((err) => {
      console.error('Error configuring auto-launch:', err)
    })
}

app.whenReady().then(() => {
  autoUpdater.checkForUpdates()
  electronApp.setAppUserModelId('com.electron')

  setupAutoLaunch()
  createWindow()
  createTray()

  // Hide dock icon on macOS initially
  if (process.platform === 'darwin') {
    hideDockIcon()
  }

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

autoUpdater.on('update-available', () => {
  new Notification({
    title: 'Flash Snap',
    body: 'A new update is available. Please restart the app to apply it.'
  }).show()
})

autoUpdater.on('update-downloaded', () => {
  new Notification({
    title: 'Flash Snap',
    body: 'The update has been downloaded. Please restart the app to apply it.'
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
    if (allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      console.log('Allowing navigation to:', navigationUrl)
    } else {
      console.log('Blocking navigation to:', navigationUrl)
      event.preventDefault()
      shell.openExternal(navigationUrl)
    }
  })

  // Open external links in default browser
  contents.setWindowOpenHandler(({ url }) => {
    console.log('Window open request for URL:', url)
    const parsedUrl = new URL(url)
    const allowedDomains = ['accounts.google.com', 'svufbwjdrbmiyvhimutm.supabase.co']

    if (allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      console.log('Allowing window open for URL:', url)
      return { action: 'allow' }
    }

    console.log('Opening URL in external browser:', url)
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
