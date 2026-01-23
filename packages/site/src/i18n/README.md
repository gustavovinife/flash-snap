# Internationalization (i18n) for Flash Snap Site

This directory contains the internationalization setup for the Flash Snap marketing site.

## Structure

```
i18n/
├── index.ts           # i18n configuration and initialization
└── locales/
    ├── en-US.ts      # English (US) translations
    └── pt-BR.ts      # Portuguese (Brazil) translations
```

## Supported Languages

- **en-US**: English (United States) - Default
- **pt-BR**: Portuguese (Brazil)

## Usage

The site automatically detects the user's browser language and falls back to English if the language is not supported.

### In Components

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t("hero.title")}</h1>;
}
```

### With Interpolation

```tsx
{
  t("hero.downloadFor", { platform: "macOS" });
}
// Output: "Download for macOS"
```

## Language Switcher

The `LanguageSwitcher` component in the navigation allows users to manually change the language. The selection is persisted in localStorage.

## Adding New Languages

1. Create a new locale file in `locales/` (e.g., `es-ES.ts`)
2. Copy the structure from `en-US.ts`
3. Translate all strings
4. Import and add to `resources` in `index.ts`
5. Update the `languages` array in `LanguageSwitcher.tsx`

## Translation Keys Structure

- `hero.*` - Hero section content
- `features.*` - Features section
- `useCases.*` - Use cases section
- `howItWorks.*` - How it works section
- `download.*` - Download section
- `footer.*` - Footer content
