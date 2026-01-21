---
inclusion: always
---
# Project Structure

The project follows a typical Electron structure with some custom organization:

## Source Code Structure
- [src/main](mdc:src/main) - Electron main process code
- [src/preload](mdc:src/preload) - Preload scripts for secure IPC
- [src/renderer](mdc:src/renderer) - Frontend UI code (React application)
  - [src/renderer/src/components](mdc:src/renderer/src/components) - React components
  - [src/renderer/src/context](mdc:src/renderer/src/context) - React context providers
  - [src/renderer/src/pages](mdc:src/renderer/src/pages) - Application pages/views
  - [src/renderer/src/services](mdc:src/renderer/src/services) - Core service logic
  - [src/renderer/src/ui](mdc:src/renderer/src/ui) - Reusable UI components
    - [src/renderer/src/ui/common](mdc:src/renderer/src/ui/common) - Shared UI elements (Button, Input, etc.)
    - [src/renderer/src/ui/template](mdc:src/renderer/src/ui/template) - Layout templates
  - [src/renderer/src/data/templates](mdc:src/renderer/src/data/templates) - Pre-built card templates
  - [src/renderer/src/i18n](mdc:src/renderer/src/i18n) - Internationalization files

## Configuration Files
- [electron.vite.config.ts](mdc:electron.vite.config.ts) - Vite configuration for Electron
- [electron-builder.yml](mdc:electron-builder.yml) - Electron builder configuration
- [package.json](mdc:package.json) - Project dependencies and scripts
- [tailwind.config.js](mdc:tailwind.config.js) - TailwindCSS configuration

## Documentation
- [docs/adr.md](mdc:docs/adr.md) - Architecture Decision Records


