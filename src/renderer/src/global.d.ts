declare global {
  interface Window {
    electron: {
      ipcRenderer: unknown
      openExternal: (url: string) => void
      showApp: () => void
      process?: {
        versions: {
          electron: string
          chrome: string
          node: string
        }
      }
    }
    api: {
      onTextCaptured: (callback: (text: string) => void) => void
      notifySettingsUpdated: () => void
      checkForUpdates: () => void
      onAuthCallback: (callback: (url: string) => void) => void
    }
  }
}

export {}
