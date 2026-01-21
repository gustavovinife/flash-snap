# Flash Snap Monorepo Setup Guide

This guide will help you set up the Flash Snap monorepo for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **Yarn** >= 1.22.0 (Install with `npm install -g yarn`)
- **Git** ([Download](https://git-scm.com/))

For mobile development, you'll also need:

- **Expo CLI** (will be installed automatically)
- **iOS Simulator** (macOS only) or **Android Studio** for emulators

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gustavowebjs/flash-snap.git
cd flash-snap
```

### 2. Install Dependencies

Install all dependencies for both desktop and mobile packages:

```bash
yarn install
```

This will install dependencies for:

- Root workspace
- Desktop package (`packages/desktop`)
- Mobile package (`packages/mobile`)

### 3. Set Up Environment Variables

#### Desktop Environment

```bash
cd packages/desktop
cp .env.example .env
```

Edit `packages/desktop/.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

#### Mobile Environment

```bash
cd packages/mobile
cp .env.example .env
```

Edit `packages/mobile/.env` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Verify Installation

Return to the root directory and verify everything is set up correctly:

```bash
cd ../..
yarn typecheck
```

## Development

### Desktop Development

Start the desktop app in development mode:

```bash
yarn dev:desktop
```

The Electron app will launch with hot-reload enabled.

### Mobile Development

Start the mobile app with Expo:

```bash
yarn dev:mobile
```

This will start the Expo dev server. You can then:

- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your phone

### Running Specific Commands

You can run any command in a specific package:

```bash
# Desktop
yarn desktop <command>

# Mobile
yarn mobile <command>
```

Examples:

```bash
yarn desktop lint
yarn mobile android
```

## Building for Production

### Desktop

Build the desktop app for your current platform:

```bash
yarn build:desktop
```

Build for specific platforms:

```bash
# From packages/desktop directory
cd packages/desktop

# macOS
yarn build:mac

# Windows
yarn build:win

# Linux
yarn build:linux
```

### Mobile

Build the mobile app:

```bash
yarn build:mobile
```

For production builds, refer to [Expo's build documentation](https://docs.expo.dev/build/introduction/).

## Common Tasks

### Linting

```bash
# Lint all packages
yarn lint

# Lint specific package
yarn lint:desktop
yarn lint:mobile
```

### Type Checking

```bash
# Check types in all packages
yarn typecheck

# Check types in desktop
yarn desktop typecheck
```

### Formatting

```bash
# Format all packages
yarn format

# Format specific package
yarn desktop format
```

### Cleaning

```bash
# Clean all packages
yarn clean

# Clean specific package
yarn clean:desktop
yarn clean:mobile
```

## Troubleshooting

### Desktop Issues

**Issue**: Electron app won't start

- Solution: Try cleaning and reinstalling dependencies
  ```bash
  yarn clean:desktop
  cd packages/desktop
  yarn install
  ```

**Issue**: Build fails

- Solution: Ensure all environment variables are set correctly
- Check that you have the latest version of Electron Builder

### Mobile Issues

**Issue**: Expo won't start

- Solution: Clear Expo cache
  ```bash
  cd packages/mobile
  npx expo start -c
  ```

**Issue**: Dependencies conflict

- Solution: Use legacy peer deps flag
  ```bash
  cd packages/mobile
  yarn install --legacy-peer-deps
  ```

### General Issues

**Issue**: Yarn workspace errors

- Solution: Delete all node_modules and reinstall
  ```bash
  yarn clean
  yarn install
  ```

**Issue**: TypeScript errors

- Solution: Ensure all packages are using compatible TypeScript versions
  ```bash
  yarn typecheck
  ```

## Project Structure

```
flash-snap/
├── packages/
│   ├── desktop/              # Electron desktop app
│   │   ├── src/
│   │   │   ├── main/        # Electron main process
│   │   │   ├── preload/     # Preload scripts
│   │   │   └── renderer/    # React UI
│   │   ├── resources/       # App icons and assets
│   │   └── package.json
│   └── mobile/              # React Native mobile app
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   ├── screens/     # App screens
│       │   ├── services/    # API services
│       │   ├── context/     # React context
│       │   └── theme/       # Theme configuration
│       ├── assets/          # Images and fonts
│       └── package.json
├── package.json             # Root workspace config
├── tsconfig.json            # Shared TypeScript config
└── README.md
```

## Next Steps

1. Read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
2. Check out the [Desktop README](./packages/desktop/README.md)
3. Check out the [Mobile README](./packages/mobile/README.md)
4. Review the architecture documentation in `packages/desktop/docs/`

## Getting Help

- Check the [Issues](https://github.com/gustavowebjs/flash-snap/issues) page
- Read the documentation in each package
- Contact the maintainers

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [Supabase Documentation](https://supabase.com/docs)
