# Flash Snap Monorepo

Flash Snap is a spaced repetition learning application available on desktop and mobile platforms. This monorepo contains both the Electron desktop application and the React Native mobile application.

## 📦 Packages

- **[@flash-snap/desktop](./packages/desktop)** - Electron desktop application
- **[@flash-snap/mobile](./packages/mobile)** - React Native mobile application (Expo)

## 🚀 Getting Started

### Quick Setup

Run the automated setup script:

```bash
./scripts/setup.sh
```

This will:

- Check prerequisites (Node.js, Yarn)
- Install all dependencies
- Create environment files
- Run initial type checks

### Manual Setup

#### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0

#### Installation

Install all dependencies for all packages:

```bash
yarn install
```

#### Environment Variables

Set up environment variables for both packages:

```bash
# Desktop
cp packages/desktop/.env.example packages/desktop/.env

# Mobile
cp packages/mobile/.env.example packages/mobile/.env
```

Edit both `.env` files with your Supabase credentials.

For detailed setup instructions, see [SETUP.md](./SETUP.md).

### Development

#### Desktop App

```bash
# Start desktop app in development mode
yarn dev:desktop

# Build desktop app
yarn build:desktop
```

#### Mobile App

```bash
# Start mobile app (Expo)
yarn dev:mobile

# Run on specific platform
yarn mobile android
yarn mobile ios
yarn mobile web
```

## 🏗️ Monorepo Structure

```
flash-snap/
├── packages/
│   ├── desktop/          # Electron desktop app
│   │   ├── src/
│   │   ├── resources/
│   │   └── package.json
│   └── mobile/           # React Native mobile app
│       ├── src/
│       ├── assets/
│       └── package.json
├── package.json          # Root package.json with workspaces
└── README.md
```

## 🛠️ Available Scripts

### Root Level

- `yarn dev:desktop` - Start desktop app in development mode
- `yarn dev:mobile` - Start mobile app with Expo
- `yarn build:desktop` - Build desktop app for production
- `yarn build:mobile` - Build mobile app for production
- `yarn lint` - Run linting across all packages
- `yarn clean` - Clean all node_modules and build artifacts

### Package-Specific

Run commands in specific packages:

```bash
# Desktop
yarn desktop <command>

# Mobile
yarn mobile <command>
```

## 🔧 Technologies

### Desktop

- Electron
- React
- TypeScript
- TailwindCSS
- Supabase
- Vite

### Mobile

- React Native
- Expo
- TypeScript
- styled-components
- Supabase

## 📝 Environment Variables

Both packages require environment variables for Supabase connection. Copy the `.env.example` files in each package and fill in your credentials:

### Desktop

```bash
cd packages/desktop
cp .env.example .env
```

### Mobile

```bash
cd packages/mobile
cp .env.example .env
```

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `yarn install`
3. Create a feature branch
4. Make your changes
5. Test both desktop and mobile apps
6. Submit a pull request

## 📄 License

MIT

## 👤 Author

Gustavo Ferreira
