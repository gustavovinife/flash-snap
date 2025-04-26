/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  electron: {
    ipcRenderer: any
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
  }
}
