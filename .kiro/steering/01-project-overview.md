---
inclusion: always
---

# Flash Snap Project Overview

Flash Snap is an Electron desktop application designed for spaced repetition learning. It helps users create and review flashcards with minimal friction.

## Core Technologies

- **Framework**: Electron with Vite 3.1.0
- **UI**: React with TailwindCSS
- **State Management**: Supabase (PostgreSQL) for cards and decks, localStorage for settings
- **Updates**: Using `update-electron-app` with GitHub releases

## Key Features

- Global shortcut (`Ctrl + Shift + X`) to create cards from selected text
- Pre-built card templates for immediate value
- Spaced repetition algorithm (SM-2) for optimized learning
- Text-to-Speech integration via Supabase Edge Functions

The application follows a modular architecture with services for different functionalities and reusable UI components.

## Main Configuration Files

- [package.json](mdc:package.json) - Dependencies and scripts uses yarn
- [electron.vite.config.ts](mdc:electron.vite.config.ts) - Vite configuration
- [electron-builder.yml](mdc:electron-builder.yml) - Build configuration
- [tailwind.config.js](mdc:tailwind.config.js) - TailwindCSS configuration
