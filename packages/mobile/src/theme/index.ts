import { useColorScheme } from 'react-native'

const palette = {
  violet50: '#f5f3ff',
  violet100: '#ede9fe',
  violet200: '#ddd6fe',
  violet400: '#a78bfa',
  violet500: '#8b5cf6',
  violet600: '#7c3aed',
  violet700: '#6d28d9',
  violet900: '#2e1065'
}

const light = {
  scheme: 'light' as const,
  background: '#f6f5fb',
  surface: '#ffffff',
  surfaceMuted: '#f1effa',
  border: '#e7e4f2',
  text: '#16131f',
  textMuted: '#6b6780',
  textSubtle: '#9b97ad',
  primary: palette.violet600,
  primaryPressed: palette.violet700,
  primarySoft: palette.violet100,
  onPrimary: '#ffffff',
  success: '#10b981',
  successSoft: '#d1fae5',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
  info: '#3b82f6',
  infoSoft: '#dbeafe'
}

export type ThemeColors = Omit<typeof light, 'scheme'> & { scheme: 'light' | 'dark' }

const dark: ThemeColors = {
  scheme: 'dark',
  background: '#0e0c14',
  surface: '#191623',
  surfaceMuted: '#221e2f',
  border: '#2c2839',
  text: '#f4f2fa',
  textMuted: '#a7a2b8',
  textSubtle: '#6f6a82',
  primary: palette.violet500,
  primaryPressed: palette.violet600,
  primarySoft: '#2a1f4a',
  onPrimary: '#ffffff',
  success: '#34d399',
  successSoft: '#123829',
  warning: '#fbbf24',
  warningSoft: '#3a2c0c',
  danger: '#f87171',
  dangerSoft: '#3d1717',
  info: '#60a5fa',
  infoSoft: '#132a4a'
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
}

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999
}

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  title: 20,
  headline: 28,
  display: 34
}

export function useTheme(): ThemeColors {
  return useColorScheme() === 'dark' ? dark : light
}
