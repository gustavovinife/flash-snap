# Flash Snap Monorepo - Quick Reference

Quick reference for common commands and workflows.

## 🚀 Setup

```bash
# Initial setup (run once)
./scripts/setup.sh

# Or manually
yarn install
cp packages/desktop/.env.example packages/desktop/.env
cp packages/mobile/.env.example packages/mobile/.env
```

## 💻 Development

### Desktop

```bash
# Start development server
yarn dev:desktop

# Build for production
yarn build:desktop

# Lint code
yarn lint:desktop

# Type check
yarn desktop typecheck
```

### Mobile

```bash
# Start Expo dev server
yarn dev:mobile

# Run on specific platform
yarn android
yarn ios
yarn web

# Lint code
yarn lint:mobile
```

## 🔧 Common Commands

### All Packages

```bash
yarn lint              # Lint all packages
yarn typecheck         # Type check all packages
yarn format            # Format all packages
yarn clean             # Clean all packages
```

### Specific Package

```bash
yarn desktop <command>  # Run command in desktop
yarn mobile <command>   # Run command in mobile
```

## 📁 Project Structure

```
flash-snap/
├── packages/
│   ├── desktop/          # Electron app
│   │   ├── src/
│   │   │   ├── main/     # Main process
│   │   │   ├── preload/  # Preload scripts
│   │   │   └── renderer/ # React UI
│   │   └── package.json
│   └── mobile/           # React Native app
│       ├── src/
│       │   ├── components/
│       │   ├── screens/
│       │   ├── services/
│       │   └── theme/
│       └── package.json
└── package.json          # Root workspace
```

## 🌍 Environment Variables

### Desktop (`packages/desktop/.env`)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_PROJECT_ID=
```

### Mobile (`packages/mobile/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_PROJECT_ID=
```

## 🐛 Troubleshooting

### Clean Everything

```bash
yarn clean
yarn install
```

### Desktop Won't Start

```bash
yarn clean:desktop
cd packages/desktop
yarn install
cd ../..
yarn dev:desktop
```

### Mobile Won't Start

```bash
yarn clean:mobile
cd packages/mobile
npx expo start -c
```

### Type Errors

```bash
yarn typecheck
```

## 📚 Documentation

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [MONOREPO_MIGRATION.md](./MONOREPO_MIGRATION.md) - Migration details

## 🔗 Useful Links

- [Desktop README](./packages/desktop/README.md)
- [Mobile README](./packages/mobile/README.md)
- [Electron Docs](https://www.electronjs.org/docs)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
