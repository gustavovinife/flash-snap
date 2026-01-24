import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      openExternal: (url: string) => void
      showApp: () => void
      process?: {
        versions: Record<string, string>
      }
    }
    api: {
      notifySettingsUpdated: (settings: { reviewTime: string }) => void
      syncSettings: (settings: { reviewTime: string; lastNotification: string | null }) => void
      testNotification: () => void
      checkForUpdates: () => void
      onAuthCallback: (callback: (url: string) => void) => void
    }
  }
}
