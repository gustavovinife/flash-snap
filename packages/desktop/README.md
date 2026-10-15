# flash-snap (desktop) — deprecated

> **Deprecated.** The Electron desktop app is no longer developed or released. Flash Snap now runs as a web app on every device (desktop and mobile) from [`packages/mobile`](../mobile), served at https://www.flashsnap.com.br/app.
>
> This package stays in the repo for reference and because it hosts the Supabase project (`supabase/` with Edge Functions and migrations), which is still in use. Version 1.0.24 on GitHub Releases is the last desktop release.

An Electron application with React and TypeScript.

## Supabase

Edge Functions and migrations live in `supabase/` and are deployed with:

```bash
npx supabase functions deploy <name>
```

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
