import { useState } from 'react'
import packageJson from '../../../../package.json'
function Versions(): React.JSX.Element {
  const [versions] = useState(
    window.electron?.process?.versions || {
      electron: '',
      chrome: '',
      node: ''
    }
  )

  return (
    <div className="flex flex-wrap gap-x-3 text-xs text-gray-300">
      <div>Electron v{versions.electron}</div>
      <div>Chromium v{versions.chrome}</div>
      <div>Node v{versions.node}</div>
      <div>App Version: {packageJson.version}</div>
    </div>
  )
}

export default Versions
