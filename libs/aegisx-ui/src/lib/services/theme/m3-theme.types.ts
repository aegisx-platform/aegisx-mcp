/**
 * Material 3 Theme Type Definitions
 *
 * Defines types for Material 3 theme management including
 * seed colors, color palettes, and theme metadata.
 */

/**
 * M3 Theme Definition
 */
export interface M3Theme {
  id: string;
  name: string;
  seedColor: string;
  description?: string;
}

/**
 * M3 Color Tokens for a specific color role
 */
export interface M3ColorTokens {
  main: string;
  onMain: string;
  container: string;
  onContainer: string;
  rgb?: {
    main: string;
    onMain: string;
    container: string;
    onContainer: string;
  };
}

/**
 * Complete M3 Color Palette
 */
export interface M3Palette {
  primary: M3ColorTokens;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  secondary: M3ColorTokens;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  tertiary: M3ColorTokens;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  error: M3ColorTokens;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  background: string;
  onBackground: string;

  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  outline: string;
  outlineVariant: string;

  scrim: string;
  shadow: string;

  // Dark mode variants
  darkPrimary?: string;
  darkOnPrimary?: string;
  darkPrimaryContainer?: string;
  darkOnPrimaryContainer?: string;
  darkBackground?: string;
  darkOnBackground?: string;
  darkSurface?: string;
  darkOnSurface?: string;
}

/**
 * M3 Theme State
 */
export interface M3ThemeState {
  currentTheme: string;
  scheme: 'light' | 'dark' | 'auto';
  palette?: M3Palette;
  customSeedColor?: string;
}
