/**
 * AegisX Theme Builder Types
 */

// Color shade levels (Tailwind-style)
export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

// Color palette with all shades
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Main color
  600: string;
  700: string;
  800: string;
  900: string;
}

// Semantic color names
export type SemanticColorName =
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'cyan'
  | 'purple'
  | 'pink'
  | 'indigo';

// Typography configuration
export interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// Spacing configuration
export interface SpacingConfig {
  '2xs': string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

// Border radius configuration
export interface RadiusConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

// Shadow configuration
export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
}

// Complete theme configuration for Theme Builder
// Note: Named ThemeBuilderConfig to avoid conflict with ThemeConfig in services/theme
export interface ThemeBuilderConfig {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    [K in SemanticColorName]: ColorPalette;
  };
  background: {
    muted: string;
    subtle: string;
    default: string;
    emphasis: string;
  };
  text: {
    disabled: string;
    subtle: string;
    secondary: string;
    primary: string;
    heading: string;
    inverted: string;
  };
  border: {
    muted: string;
    default: string;
    emphasis: string;
  };
  typography: TypographyConfig;
  spacing: SpacingConfig;
  radius: RadiusConfig;
  shadows: ShadowConfig;
}

// Theme builder state
export interface ThemeBuilderState {
  currentTheme: ThemeBuilderConfig;
  previewMode: 'light' | 'dark';
  activeSection: ThemeSection;
  hasChanges: boolean;
}

// Theme sections for navigation
export type ThemeSection =
  | 'colors'
  | 'image-extractor'
  | 'm3-colors'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadows'
  | 'preview';

// Export format options
export type ExportFormat = 'scss' | 'css' | 'json' | 'tailwind';

// Color editor event
export interface ColorChangeEvent {
  colorName: SemanticColorName;
  shade: ColorShade;
  value: string;
}

// Preset theme option
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: Partial<ThemeBuilderConfig>;
}
