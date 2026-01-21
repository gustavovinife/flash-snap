# Monorepo Migration Summary

This document summarizes the migration of Flash Snap to a Yarn Workspaces monorepo structure.

## What Changed

### Structure

**Before:**

```
flash-snap/
├── src/              # Desktop app
├── mobile/           # Mobile app (separate)
└── package.json
```

**After:**

```
flash-snap/
├── packages/
│   ├── desktop/      # @flash-snap/desktop
│   └── mobile/       # @flash-snap/mobile
├── scripts/
│   └── setup.sh
├── package.json      # Root workspace config
└── [config files]
```

### Package Names

- Desktop: `flash-snap` → `@flash-snap/desktop`
- Mobile: `mobile` → `@flash-snap/mobile`

### Scripts Changed

All `npm` commands have been replaced with `yarn` in both packages.

#### Desktop (`packages/desktop/package.json`)

- `npm run dev` → `yarn dev`
- `npm run build` → `yarn build`
- `npm run typecheck` → `yarn typecheck`

#### Mobile (`packages/mobile/package.json`)

- No changes (already using npm/yarn agnostic commands)

### New Root Scripts

From the root directory, you can now run:

```bash
# Development
yarn dev:desktop          # Start desktop app
yarn dev:mobile           # Start mobile app

# Building
yarn build:desktop        # Build desktop app
yarn build:mobile         # Build mobile app

# Mobile platform-specific
yarn android              # Run on Android
yarn ios                  # Run on iOS
yarn web                  # Run on web

# Maintenance
yarn lint                 # Lint all packages
yarn typecheck            # Type check all packages
yarn clean                # Clean all packages
yarn format               # Format all packages

# Package-specific commands
yarn desktop <command>    # Run command in desktop package
yarn mobile <command>     # Run command in mobile package
```

## Benefits

### 1. Unified Dependency Management

- Single `yarn install` installs dependencies for both packages
- Shared dependencies are hoisted to the root
- Reduced disk space and installation time

### 2. Consistent Tooling

- Shared TypeScript configuration
- Unified linting and formatting
- Consistent scripts across packages

### 3. Easier Development

- Work on both desktop and mobile simultaneously
- Shared code can be easily extracted to a shared package
- Single repository for issues, PRs, and documentation

### 4. Better CI/CD

- Single pipeline can build and test both packages
- Easier to ensure compatibility between versions
- Simplified release process

## Migration Steps Completed

1. ✅ Created root `package.json` with workspace configuration
2. ✅ Moved desktop app to `packages/desktop/`
3. ✅ Moved mobile app to `packages/mobile/`
4. ✅ Updated package names to use `@flash-snap/` scope
5. ✅ Converted npm scripts to yarn in desktop package
6. ✅ Created root-level scripts for common tasks
7. ✅ Added shared TypeScript configuration
8. ✅ Created comprehensive documentation:
   - README.md (overview)
   - SETUP.md (detailed setup guide)
   - CONTRIBUTING.md (contribution guidelines)
   - LICENSE (MIT license)
9. ✅ Created automated setup script (`scripts/setup.sh`)
10. ✅ Configured Yarn with `.yarnrc.yml`
11. ✅ Created root `.gitignore`

## What Developers Need to Do

### For Existing Developers

1. **Pull the latest changes**

   ```bash
   git pull origin main
   ```

2. **Clean old installations**

   ```bash
   # Remove old node_modules
   rm -rf node_modules mobile/node_modules
   ```

3. **Run setup script**

   ```bash
   ./scripts/setup.sh
   ```

4. **Update environment variables**
   - Desktop: `packages/desktop/.env`
   - Mobile: `packages/mobile/.env`

5. **Update your workflow**
   - Use `yarn dev:desktop` instead of `npm run dev`
   - Use `yarn dev:mobile` instead of `cd mobile && npm start`

### For New Developers

Simply follow the [SETUP.md](./SETUP.md) guide or run:

```bash
./scripts/setup.sh
```

## Future Improvements

### Potential Shared Packages

Consider extracting shared code into separate packages:

```
packages/
├── desktop/
├── mobile/
├── shared/           # Shared utilities
├── types/            # Shared TypeScript types
└── ui/               # Shared UI components (if applicable)
```

### Shared Configuration

- ESLint configuration
- Prettier configuration
- TypeScript configuration
- Testing setup

### Monorepo Tools

Consider adding:

- **Turborepo** - For faster builds and caching
- **Changesets** - For version management and changelogs
- **Lerna** - For publishing packages

## Troubleshooting

### Issue: Yarn not found

**Solution:** Install Yarn globally

```bash
npm install -g yarn
```

### Issue: Dependencies not installing

**Solution:** Clear Yarn cache and reinstall

```bash
yarn cache clean
yarn install
```

### Issue: Scripts not working

**Solution:** Ensure you're in the root directory

```bash
cd /path/to/flash-snap
yarn dev:desktop
```

### Issue: Environment variables not loading

**Solution:** Check that .env files exist in both packages

```bash
ls packages/desktop/.env
ls packages/mobile/.env
```

## Resources

- [Yarn Workspaces Documentation](https://classic.yarnpkg.com/en/docs/workspaces/)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Project README](./README.md)
- [Setup Guide](./SETUP.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Questions?

If you have questions about the migration:

1. Check this document
2. Read [SETUP.md](./SETUP.md)
3. Open an issue on GitHub
4. Contact the maintainers
