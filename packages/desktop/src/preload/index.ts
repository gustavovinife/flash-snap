import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Notify main process that settings have been updated
  notifySettingsUpdated: (): void => {
    ipcRenderer.send('settings-updated')
  },

  // Check for app updates
  checkForUpdates: (): void => {
    ipcRenderer.send('check-for-updates')
  },

  // Handle auth callback from the main process
  onAuthCallback: (callback: (url: string) => void): void => {
    ipcRenderer.on('auth-callback', (_event, url) => callback(url))
  }
}

// Extend the electronAPI with our custom functions
const extendedElectronAPI = {
  ...electronAPI,
  openExternal: (url: string): void => {
    // Use IPC to safely open external URLs
    ipcRenderer.send('open-external-url', url)
  },
  showApp: (): void => {
    // Send a message to show the app window
    ipcRenderer.send('show-app')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', extendedElectronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = extendedElectronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
