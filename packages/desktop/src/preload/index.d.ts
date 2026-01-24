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
      notifySettingsUpdated: () => void
      checkForUpdates: () => void
      onAuthCallback: (callback: (url: string) => void) => void
    }
  }
}
