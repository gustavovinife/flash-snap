import { useWindowDimensions } from 'react-native'

export const BREAKPOINTS = {
  tablet: 640,
  desktop: 900,
  wide: 1240
}

export interface Layout {
  width: number
  isTablet: boolean
  /** Sidebar navigation, multi-column grids and roomier spacing */
  isDesktop: boolean
  isWide: boolean
}

export function useLayout(): Layout {
  const { width } = useWindowDimensions()
  return {
    width,
    isTablet: width >= BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.desktop,
    isWide: width >= BREAKPOINTS.wide
  }
}
