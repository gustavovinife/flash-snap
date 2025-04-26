/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  electron: {
    ipcRenderer: any
  }
  api: {
    onTextCaptured: (callback: (text: string) => void) => void
    notifySettingsUpdated: () => void
  }
}
