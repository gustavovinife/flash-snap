/// <reference path="../../preload/index.d.ts" />

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
      hasPendingChanges: () => Promise<boolean>
      syncToCloud: () => Promise<boolean>
      syncFromCloud: () => Promise<boolean>
      notifySettingsUpdated: (settings: { reviewTime: string }) => void
      syncSettings: (settings: { reviewTime: string; lastNotification: string | null }) => void
      testNotification: () => void
      checkForUpdates: () => void
      onAuthCallback: (callback: (url: string) => void) => void
      handleLogout: () => void
      setupPeriodicSync: (intervalMinutes?: number) => () => void
    }
  }
}

export {}
