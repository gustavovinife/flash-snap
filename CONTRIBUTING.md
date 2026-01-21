# Contributing to Flash Snap

Thank you for your interest in contributing to Flash Snap! This document provides guidelines for contributing to this monorepo.

## 🏗️ Monorepo Structure

This project uses Yarn Workspaces to manage multiple packages:

- `packages/desktop` - Electron desktop application
- `packages/mobile` - React Native mobile application

## 🚀 Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/flash-snap.git
   cd flash-snap
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   For desktop:

   ```bash
   cd packages/desktop
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

   For mobile:

   ```bash
   cd packages/mobile
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development**

   ```bash
   # Desktop
   yarn dev:desktop

   # Mobile
   yarn dev:mobile
   ```

## 📝 Development Workflow

### Working on Desktop

```bash
# Run in development mode
yarn dev:desktop

# Run linting
yarn lint:desktop

# Build for production
yarn build:desktop
```

### Working on Mobile

```bash
# Start Expo dev server
yarn dev:mobile

# Run on specific platform
yarn android
yarn ios
yarn web
```

### Running Commands in Specific Packages

```bash
# Run any command in desktop package
yarn desktop <command>

# Run any command in mobile package
yarn mobile <command>
```

## 🧪 Testing

Before submitting a PR, ensure:

1. All linting passes: `yarn lint`
2. TypeScript compiles without errors: `yarn typecheck`
3. Both desktop and mobile apps build successfully
4. Test your changes on both platforms if applicable

## 📋 Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `yarn format` before committing
- Ensure `yarn lint` passes

### Desktop-Specific Guidelines

- Use React with TailwindCSS for styling
- Follow the service-oriented architecture
- Use React Query for data fetching
- Implement i18n for all user-facing text

### Mobile-Specific Guidelines

- Use styled-components for styling
- Follow the theme colors from `src/theme/colors.ts`
- Ensure components are responsive
- Test on both iOS and Android when possible

## 🔀 Pull Request Process

1. Create a feature branch from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with clear messages

   ```bash
   git commit -m "feat: add new feature"
   ```

3. Push to your fork

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request with:
   - Clear description of changes
   - Screenshots/videos for UI changes
   - Reference to any related issues

## 🐛 Bug Reports

When reporting bugs, please include:

- Platform (Desktop/Mobile, OS version)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console logs/error messages

## 💡 Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists or is planned
- Clearly describe the feature and its use case
- Explain why it would be valuable to users

## 📦 Adding Dependencies

When adding new dependencies:

1. Add to the appropriate package (desktop or mobile)
2. Explain why the dependency is needed in your PR
3. Ensure it doesn't significantly increase bundle size

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
