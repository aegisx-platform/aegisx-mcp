/**
 * AegisX Theme Types
 *
 * Type definitions for the AegisX theme system.
 */

export type ColorScheme = 'aegisx' | 'verus';
export type ThemeMode = 'light' | 'dark';

export interface ThemeOption {
  id: string;
  name: string;
  path: string;
  /** Color scheme identifier (aegisx, verus) */
  colorScheme?: ColorScheme;
  /** Theme mode (light or dark) */
  mode?: ThemeMode;
  /** data-theme attribute value */
  dataTheme?: string;
}

export interface ThemeConfig {
  /** Current color scheme */
  colorScheme: ColorScheme;
  /** Current theme mode */
  mode: ThemeMode;
  /** Combined theme ID */
  themeId: string;
  /** data-theme attribute value */
  dataTheme: string;
}

/**
 * Type-safe keys for theme builder configuration
 * These types enable autocomplete and type safety for theme customization
 */

/** Background color keys */
export type BackgroundKey = 'muted' | 'subtle' | 'default' | 'emphasis';

/** Text color keys */
export type TextKey =
  | 'disabled'
  | 'subtle'
  | 'secondary'
  | 'primary'
  | 'heading'
  | 'inverted';

/** Border color keys */
export type BorderKey = 'muted' | 'default' | 'emphasis';

/** Font size keys */
export type FontSizeKey =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

/** Font weight keys */
export type FontWeightKey = 'normal' | 'medium' | 'semibold' | 'bold';

/** Line height keys */
export type LineHeightKey = 'tight' | 'normal' | 'relaxed';

/** Spacing keys */
export type SpacingKey =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

/** Border radius keys */
export type RadiusKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/** Shadow keys */
export type ShadowKey = 'sm' | 'md' | 'lg';
