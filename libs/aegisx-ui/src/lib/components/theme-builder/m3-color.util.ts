/**
 * Material Design 3 Color Generation Utility
 *
 * This utility generates M3-compatible color schemes from a single seed color.
 * Following Google's Material Design 3 color system specifications.
 *
 * M3 Color Roles:
 * - Primary: Main brand color (seed color)
 * - Secondary: Muted, complementary accent (~30° hue shift)
 * - Tertiary: Vibrant accent for visual interest (~60° hue shift)
 * - Error: Semantic error color (typically red)
 * - Neutral: Gray tones for surfaces and text
 * - Neutral Variant: Slightly tinted neutrals
 *
 * Tonal Palettes:
 * M3 uses tones from 0 (black) to 100 (white)
 * Key tones: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100
 */

import {
  hexToColor,
  rgbToHsl,
  hslToRgb,
  colorToHex,
  type RGBColor,
  type HSLColor,
} from './color-extraction.util';

// ============ Types ============

/**
 * M3 Extended Tonal Palette (18 tones like Google Material Theme Builder)
 * Tones: 100, 99, 98, 95, 90, 80, 70, 60, 50, 40, 35, 30, 25, 20, 15, 10, 5, 0
 */
export interface M3TonalPalette {
  0: string;
  5: string;
  10: string;
  15: string;
  20: string;
  25: string;
  30: string;
  35: string;
  40: string;
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  95: string;
  98: string;
  99: string;
  100: string;
}

export type ToneValue = keyof M3TonalPalette;

/** Standard tones for compact view */
export const STANDARD_TONES: ToneValue[] = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
];

/** Extended tones for full palette view (Google-style) */
export const EXTENDED_TONES: ToneValue[] = [
  100, 99, 98, 95, 90, 80, 70, 60, 50, 40, 35, 30, 25, 20, 15, 10, 5, 0,
];

export interface M3CorePalettes {
  primary: M3TonalPalette;
  secondary: M3TonalPalette;
  tertiary: M3TonalPalette;
  neutral: M3TonalPalette;
  neutralVariant: M3TonalPalette;
  error: M3TonalPalette;
}

export interface M3ColorScheme {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface colors
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceDim: string;
  surfaceBright: string;

  // Background
  background: string;
  onBackground: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Other
  shadow: string;
  scrim: string;
}

export interface M3ColorSchemeSet {
  light: M3ColorScheme;
  dark: M3ColorScheme;
}

// ============ Core Functions ============

/**
 * Generate M3 Tonal Palette from a seed color
 * Creates 18 tones like Google's Material Theme Builder
 * Tones: 0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100
 */
export function generateTonalPalette(seedHex: string): M3TonalPalette {
  const rgb = hexToColor(seedHex);
  const hsl = rgbToHsl(rgb);

  // M3 extended tone levels (Google-style 18 tones)
  const tones: ToneValue[] = [
    0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
  ];
  const palette: Partial<M3TonalPalette> = {};

  for (const tone of tones) {
    // M3 tones map directly to lightness
    // But we need to adjust saturation at extremes
    let saturation = hsl.s;

    // Reduce saturation at very light and very dark tones
    if (tone <= 10) {
      saturation = Math.min(saturation, 30);
    } else if (tone >= 95) {
      saturation = Math.min(saturation, 20);
    } else if (tone >= 90) {
      saturation = Math.min(saturation, 40);
    }

    const newHsl: HSLColor = {
      h: hsl.h,
      s: saturation,
      l: tone,
    };

    palette[tone] = colorToHex(hslToRgb(newHsl));
  }

  return palette as M3TonalPalette;
}

/**
 * Generate Secondary color from Primary
 * Secondary is typically a desaturated version with slight hue shift
 */
export function generateSecondaryColor(primaryHex: string): string {
  const rgb = hexToColor(primaryHex);
  const hsl = rgbToHsl(rgb);

  // Shift hue by 30° and reduce saturation
  return colorToHex(
    hslToRgb({
      h: (hsl.h + 30) % 360,
      s: Math.max(20, hsl.s * 0.5), // Desaturate by 50%
      l: hsl.l,
    }),
  );
}

/**
 * Generate Tertiary color from Primary
 * Tertiary adds visual interest with more contrast
 */
export function generateTertiaryColor(primaryHex: string): string {
  const rgb = hexToColor(primaryHex);
  const hsl = rgbToHsl(rgb);

  // Shift hue by 60° for more contrast
  return colorToHex(
    hslToRgb({
      h: (hsl.h + 60) % 360,
      s: Math.min(100, hsl.s * 1.1), // Slightly more saturated
      l: hsl.l,
    }),
  );
}

/**
 * Generate Neutral palette from Primary
 * Neutrals are very low saturation versions of primary
 */
export function generateNeutralColor(primaryHex: string): string {
  const rgb = hexToColor(primaryHex);
  const hsl = rgbToHsl(rgb);

  return colorToHex(
    hslToRgb({
      h: hsl.h,
      s: 5, // Very low saturation
      l: 50,
    }),
  );
}

/**
 * Generate Neutral Variant from Primary
 * Slightly more saturated than pure neutral
 */
export function generateNeutralVariantColor(primaryHex: string): string {
  const rgb = hexToColor(primaryHex);
  const hsl = rgbToHsl(rgb);

  return colorToHex(
    hslToRgb({
      h: hsl.h,
      s: 12, // Slightly more saturation than neutral
      l: 50,
    }),
  );
}

/**
 * Generate all M3 Core Palettes from a seed color
 */
export function generateM3CorePalettes(seedHex: string): M3CorePalettes {
  const secondaryBase = generateSecondaryColor(seedHex);
  const tertiaryBase = generateTertiaryColor(seedHex);
  const neutralBase = generateNeutralColor(seedHex);
  const neutralVariantBase = generateNeutralVariantColor(seedHex);
  const errorBase = '#B3261E'; // Standard M3 error red

  return {
    primary: generateTonalPalette(seedHex),
    secondary: generateTonalPalette(secondaryBase),
    tertiary: generateTonalPalette(tertiaryBase),
    neutral: generateTonalPalette(neutralBase),
    neutralVariant: generateTonalPalette(neutralVariantBase),
    error: generateTonalPalette(errorBase),
  };
}

/**
 * Generate Light Color Scheme from Core Palettes
 * Following M3 light theme specifications
 */
export function generateLightScheme(palettes: M3CorePalettes): M3ColorScheme {
  return {
    // Primary
    primary: palettes.primary[40],
    onPrimary: palettes.primary[100],
    primaryContainer: palettes.primary[90],
    onPrimaryContainer: palettes.primary[10],

    // Secondary
    secondary: palettes.secondary[40],
    onSecondary: palettes.secondary[100],
    secondaryContainer: palettes.secondary[90],
    onSecondaryContainer: palettes.secondary[10],

    // Tertiary
    tertiary: palettes.tertiary[40],
    onTertiary: palettes.tertiary[100],
    tertiaryContainer: palettes.tertiary[90],
    onTertiaryContainer: palettes.tertiary[10],

    // Error
    error: palettes.error[40],
    onError: palettes.error[100],
    errorContainer: palettes.error[90],
    onErrorContainer: palettes.error[10],

    // Surface
    surface: palettes.neutral[99],
    onSurface: palettes.neutral[10],
    surfaceVariant: palettes.neutralVariant[90],
    onSurfaceVariant: palettes.neutralVariant[30],
    surfaceContainerLowest: palettes.neutral[100],
    surfaceContainerLow: palettes.neutral[95],
    surfaceContainer: palettes.neutral[90],
    surfaceContainerHigh: palettes.neutral[80],
    surfaceContainerHighest: palettes.neutral[70],
    surfaceDim: palettes.neutral[90],
    surfaceBright: palettes.neutral[99],

    // Background
    background: palettes.neutral[99],
    onBackground: palettes.neutral[10],

    // Outline
    outline: palettes.neutralVariant[50],
    outlineVariant: palettes.neutralVariant[80],

    // Inverse
    inverseSurface: palettes.neutral[20],
    inverseOnSurface: palettes.neutral[95],
    inversePrimary: palettes.primary[80],

    // Other
    shadow: palettes.neutral[0],
    scrim: palettes.neutral[0],
  };
}

/**
 * Generate Dark Color Scheme from Core Palettes
 * Following M3 dark theme specifications
 */
export function generateDarkScheme(palettes: M3CorePalettes): M3ColorScheme {
  return {
    // Primary
    primary: palettes.primary[80],
    onPrimary: palettes.primary[20],
    primaryContainer: palettes.primary[30],
    onPrimaryContainer: palettes.primary[90],

    // Secondary
    secondary: palettes.secondary[80],
    onSecondary: palettes.secondary[20],
    secondaryContainer: palettes.secondary[30],
    onSecondaryContainer: palettes.secondary[90],

    // Tertiary
    tertiary: palettes.tertiary[80],
    onTertiary: palettes.tertiary[20],
    tertiaryContainer: palettes.tertiary[30],
    onTertiaryContainer: palettes.tertiary[90],

    // Error
    error: palettes.error[80],
    onError: palettes.error[20],
    errorContainer: palettes.error[30],
    onErrorContainer: palettes.error[90],

    // Surface
    surface: palettes.neutral[10],
    onSurface: palettes.neutral[90],
    surfaceVariant: palettes.neutralVariant[30],
    onSurfaceVariant: palettes.neutralVariant[80],
    surfaceContainerLowest: palettes.neutral[0],
    surfaceContainerLow: palettes.neutral[10],
    surfaceContainer: palettes.neutral[20],
    surfaceContainerHigh: palettes.neutral[30],
    surfaceContainerHighest: palettes.neutral[40],
    surfaceDim: palettes.neutral[10],
    surfaceBright: palettes.neutral[30],

    // Background
    background: palettes.neutral[10],
    onBackground: palettes.neutral[90],

    // Outline
    outline: palettes.neutralVariant[60],
    outlineVariant: palettes.neutralVariant[30],

    // Inverse
    inverseSurface: palettes.neutral[90],
    inverseOnSurface: palettes.neutral[20],
    inversePrimary: palettes.primary[40],

    // Other
    shadow: palettes.neutral[0],
    scrim: palettes.neutral[0],
  };
}

/**
 * Generate complete M3 Color Scheme Set (Light + Dark) from seed color
 */
export function generateM3ColorScheme(seedHex: string): M3ColorSchemeSet {
  const palettes = generateM3CorePalettes(seedHex);

  return {
    light: generateLightScheme(palettes),
    dark: generateDarkScheme(palettes),
  };
}

// ============ Utility Functions ============

/**
 * Get tone value at specific level from a tonal palette
 */
export function getTone(palette: M3TonalPalette, tone: ToneValue): string {
  return palette[tone];
}

/**
 * Calculate relative luminance of a color
 * Used for determining contrast ratios
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToColor(hex);

  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG 2.0 contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * Get appropriate text color (white or black) for a given background
 */
export function getOnColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
}

/**
 * Format M3 color role name for display
 */
export function formatM3ColorName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Get all M3 color role names grouped by category
 */
export function getM3ColorRoleCategories(): {
  category: string;
  roles: (keyof M3ColorScheme)[];
}[] {
  return [
    {
      category: 'Primary',
      roles: ['primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer'],
    },
    {
      category: 'Secondary',
      roles: [
        'secondary',
        'onSecondary',
        'secondaryContainer',
        'onSecondaryContainer',
      ],
    },
    {
      category: 'Tertiary',
      roles: [
        'tertiary',
        'onTertiary',
        'tertiaryContainer',
        'onTertiaryContainer',
      ],
    },
    {
      category: 'Error',
      roles: ['error', 'onError', 'errorContainer', 'onErrorContainer'],
    },
    {
      category: 'Surface',
      roles: [
        'surface',
        'onSurface',
        'surfaceVariant',
        'onSurfaceVariant',
        'surfaceContainerLowest',
        'surfaceContainerLow',
        'surfaceContainer',
        'surfaceContainerHigh',
        'surfaceContainerHighest',
        'surfaceDim',
        'surfaceBright',
      ],
    },
    {
      category: 'Background',
      roles: ['background', 'onBackground'],
    },
    {
      category: 'Outline',
      roles: ['outline', 'outlineVariant'],
    },
    {
      category: 'Inverse',
      roles: ['inverseSurface', 'inverseOnSurface', 'inversePrimary'],
    },
    {
      category: 'Other',
      roles: ['shadow', 'scrim'],
    },
  ];
}
