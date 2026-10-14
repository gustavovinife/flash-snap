// electron-builder afterPack hook: ad-hoc signs the macOS app while there is no Developer ID.
// Apple Silicon refuses to run apps whose bundle signature is broken, which happens when
// electron-builder modifies Electron's prebuilt app and skips signing.
import { execFileSync } from 'child_process'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function adhocSignMac(context) {
  if (context.electronPlatformName !== 'darwin') return

  // Per-arch temp apps are merged into the universal app, which gets signed afterwards
  if (context.appOutDir.endsWith('-temp')) return

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' })
}
