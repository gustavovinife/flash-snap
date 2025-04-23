import { exec } from 'child_process'

export function getSelectedText(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      `osascript -e 'tell application "System Events"
         set frontApp to name of first application process whose frontmost is true
       end tell
       tell application frontApp to get selection'`,
      (error, stdout) => {
        if (error) return reject(error)
        resolve(stdout.trim())
      }
    )
  })
}
