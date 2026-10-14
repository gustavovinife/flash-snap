// Makes the web export installable from the browser ("Add to Home Screen") with the Flash Snap icon.
// Usage: node scripts/finalize-web.mjs <export-dir>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.argv[2]
if (!outDir) {
  console.error('Usage: node scripts/finalize-web.mjs <export-dir>')
  process.exit(1)
}

const BASE = '/app'
const VIOLET = '#7c3aed'

const manifest = {
  name: 'Flash Snap',
  short_name: 'Flash Snap',
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  background_color: VIOLET,
  theme_color: VIOLET,
  icons: [
    { src: `${BASE}/icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png' }
  ]
}
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

const tags = [
  `<link rel="manifest" href="${BASE}/manifest.json">`,
  `<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">`,
  `<meta name="apple-mobile-web-app-capable" content="yes">`,
  `<meta name="mobile-web-app-capable" content="yes">`,
  `<meta name="apple-mobile-web-app-title" content="Flash Snap">`,
  `<meta name="theme-color" content="${VIOLET}">`
].join('\n    ')

const indexPath = join(outDir, 'index.html')
let html = readFileSync(indexPath, 'utf8')
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `    ${tags}\n  </head>`)
}
// Match the app background (light/dark) so Safari never shows white around the app, and follow
// Safari's dynamic toolbars with dvh so the app always fills the visible screen
const PAGE_STYLE = `<style id="flash-snap-page">
      html, body { background-color: #f6f5fb; }
      @media (prefers-color-scheme: dark) { html, body { background-color: #0e0c14; } }
      html, body, #root { height: 100%; height: 100dvh; }
    </style>`
if (!html.includes('id="flash-snap-page"')) {
  html = html.replace('</head>', `    ${PAGE_STYLE}\n  </head>`)
}
writeFileSync(indexPath, html)

console.log(`Finalized web app in ${outDir}`)
