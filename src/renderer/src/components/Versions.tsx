import { useState } from 'react'

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
    </div>
  )
}

export default Versions
