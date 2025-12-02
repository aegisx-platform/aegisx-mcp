import { Injectable, signal, computed } from '@angular/core';
import {
  ThemeBuilderConfig,
  ThemeBuilderState,
  ThemeSection,
  SemanticColorName,
  ColorShade,
  ColorPalette,
  ExportFormat,
  ThemePreset,
} from './theme-builder.types';

/**
 * Default light theme configuration
 */
const DEFAULT_LIGHT_THEME: ThemeBuilderConfig = {
  name: 'AegisX Light',
  mode: 'light',
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9f1239',
      900: '#831843',
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
  },
  background: {
    muted: '#fafafa',
    subtle: '#f4f4f5',
    default: '#ffffff',
    emphasis: '#3f3f46',
  },
  text: {
    disabled: '#a1a1aa',
    subtle: '#a1a1aa',
    secondary: '#71717a',
    primary: '#3f3f46',
    heading: '#0a0a0a',
    inverted: '#fafafa',
  },
  border: {
    muted: '#f4f4f5',
    default: '#e4e4e7',
    emphasis: '#d4d4d8',
  },
  typography: {
    fontFamily:
      "'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
  },
  spacing: {
    '2xs': '0.125rem',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

/**
 * Theme presets
 */
const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'aegisx',
    name: 'AegisX',
    description: 'Default AegisX indigo theme',
    config: {},
  },
  {
    id: 'verus',
    name: 'Verus',
    description: 'Teal/cyan color scheme',
    config: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      } as ThemeBuilderConfig['colors'],
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Pink/rose color scheme',
    config: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      } as ThemeBuilderConfig['colors'],
    },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Green/emerald color scheme',
    config: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      } as ThemeBuilderConfig['colors'],
    },
  },
];

@Injectable({
  providedIn: 'root',
})
export class ThemeBuilderService {
  private readonly STORAGE_KEY = 'ax-theme-builder-config';

  // State signals
  private _currentTheme = signal<ThemeBuilderConfig>(
    structuredClone(DEFAULT_LIGHT_THEME),
  );
  private _previewMode = signal<'light' | 'dark'>('light');
  private _activeSection = signal<ThemeSection>('colors');
  private _hasChanges = signal(false);

  // Public readonly signals
  readonly currentTheme = this._currentTheme.asReadonly();
  readonly previewMode = this._previewMode.asReadonly();
  readonly activeSection = this._activeSection.asReadonly();
  readonly hasChanges = this._hasChanges.asReadonly();

  // Computed values
  readonly presets = signal<ThemePreset[]>(THEME_PRESETS);

  readonly state = computed<ThemeBuilderState>(() => ({
    currentTheme: this._currentTheme(),
    previewMode: this._previewMode(),
    activeSection: this._activeSection(),
    hasChanges: this._hasChanges(),
  }));

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Set active section
   */
  setActiveSection(section: ThemeSection): void {
    this._activeSection.set(section);
  }

  /**
   * Toggle preview mode (light/dark)
   */
  togglePreviewMode(): void {
    this._previewMode.update((mode) => (mode === 'light' ? 'dark' : 'light'));
  }

  /**
   * Set preview mode
   */
  setPreviewMode(mode: 'light' | 'dark'): void {
    this._previewMode.set(mode);
  }

  /**
   * Update a color in the palette
   */
  updateColor(
    colorName: SemanticColorName,
    shade: ColorShade,
    value: string,
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      colors: {
        ...theme.colors,
        [colorName]: {
          ...theme.colors[colorName],
          [shade]: value,
        },
      },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update entire color palette
   */
  updateColorPalette(
    colorName: SemanticColorName,
    palette: ColorPalette,
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      colors: {
        ...theme.colors,
        [colorName]: palette,
      },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update background colors
   */
  updateBackground(
    key: keyof ThemeBuilderConfig['background'],
    value: string,
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      background: { ...theme.background, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update text colors
   */
  updateText(key: keyof ThemeBuilderConfig['text'], value: string): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      text: { ...theme.text, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update border colors
   */
  updateBorder(key: keyof ThemeBuilderConfig['border'], value: string): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      border: { ...theme.border, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update typography
   */
  updateTypography(
    key: keyof ThemeBuilderConfig['typography'],
    value:
      | string
      | ThemeBuilderConfig['typography']['fontSize']
      | ThemeBuilderConfig['typography']['fontWeight']
      | ThemeBuilderConfig['typography']['lineHeight'],
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      typography: { ...theme.typography, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update font size
   */
  updateFontSize(
    key: keyof ThemeBuilderConfig['typography']['fontSize'],
    value: string,
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      typography: {
        ...theme.typography,
        fontSize: { ...theme.typography.fontSize, [key]: value },
      },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update font weight
   */
  updateFontWeight(
    key: keyof ThemeBuilderConfig['typography']['fontWeight'],
    value: number,
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      typography: {
        ...theme.typography,
        fontWeight: { ...theme.typography.fontWeight, [key]: value },
      },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update line height
   */
  updateLineHeight(
    key: keyof ThemeBuilderConfig['typography']['lineHeight'],
    value: number,
  ): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      typography: {
        ...theme.typography,
        lineHeight: { ...theme.typography.lineHeight, [key]: value },
      },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update spacing
   */
  updateSpacing(key: keyof ThemeBuilderConfig['spacing'], value: string): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      spacing: { ...theme.spacing, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update radius
   */
  updateRadius(key: keyof ThemeBuilderConfig['radius'], value: string): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      radius: { ...theme.radius, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Update shadow
   */
  updateShadow(key: keyof ThemeBuilderConfig['shadows'], value: string): void {
    this._currentTheme.update((theme) => ({
      ...theme,
      shadows: { ...theme.shadows, [key]: value },
    }));
    this._hasChanges.set(true);
  }

  /**
   * Apply a preset theme
   */
  applyPreset(presetId: string): void {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const baseTheme = structuredClone(DEFAULT_LIGHT_THEME);

    // Deep merge preset config
    if (preset.config.colors) {
      Object.keys(preset.config.colors).forEach((key) => {
        const colorKey = key as SemanticColorName;
        if (preset.config.colors![colorKey]) {
          baseTheme.colors[colorKey] = {
            ...baseTheme.colors[colorKey],
            ...preset.config.colors![colorKey],
          };
        }
      });
    }

    this._currentTheme.set(baseTheme);
    this._hasChanges.set(true);
  }

  /**
   * Reset to default theme
   */
  resetToDefault(): void {
    this._currentTheme.set(structuredClone(DEFAULT_LIGHT_THEME));
    this._hasChanges.set(false);
  }

  /**
   * Save current theme to localStorage
   */
  saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this._currentTheme()),
      );
      this._hasChanges.set(false);
    } catch (e) {
      console.error('Failed to save theme to storage:', e);
    }
  }

  /**
   * Load theme from localStorage
   */
  loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved) as ThemeBuilderConfig;
        this._currentTheme.set(config);
      }
    } catch (e) {
      console.error('Failed to load theme from storage:', e);
    }
  }

  /**
   * Export theme in specified format
   */
  exportTheme(format: ExportFormat): string {
    const theme = this._currentTheme();

    switch (format) {
      case 'scss':
        return this.exportAsSCSS(theme);
      case 'css':
        return this.exportAsCSS(theme);
      case 'json':
        return JSON.stringify(theme, null, 2);
      case 'tailwind':
        return this.exportAsTailwind(theme);
      default:
        return '';
    }
  }

  /**
   * Download theme as file
   */
  downloadTheme(format: ExportFormat): void {
    const content = this.exportTheme(format);
    const extensions: Record<ExportFormat, string> = {
      scss: 'scss',
      css: 'css',
      json: 'json',
      tailwind: 'js',
    };

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisx-theme.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Apply theme to document (live preview)
   */
  applyToDocument(): void {
    const theme = this._currentTheme();
    const root = document.documentElement;

    // Apply colors
    Object.entries(theme.colors).forEach(([colorName, palette]) => {
      Object.entries(palette).forEach(([shade, value]) => {
        root.style.setProperty(`--ax-${colorName}-${shade}`, value);
      });
    });

    // Apply background
    Object.entries(theme.background).forEach(([key, value]) => {
      root.style.setProperty(`--ax-background-${key}`, value);
    });

    // Apply text
    Object.entries(theme.text).forEach(([key, value]) => {
      root.style.setProperty(`--ax-text-${key}`, value);
    });

    // Apply border
    Object.entries(theme.border).forEach(([key, value]) => {
      root.style.setProperty(`--ax-border-${key}`, value);
    });

    // Apply radius
    Object.entries(theme.radius).forEach(([key, value]) => {
      root.style.setProperty(`--ax-radius-${key}`, value);
    });
  }

  /**
   * Generate color palette from base color (public method)
   */
  generateColorPalette(baseColor: string): ColorPalette {
    // Convert hex to HSL for manipulation
    const hsl = this.hexToHSL(baseColor);

    return {
      50: this.hslToHex(
        hsl.h,
        Math.max(hsl.s - 30, 10),
        Math.min(hsl.l + 45, 98),
      ),
      100: this.hslToHex(
        hsl.h,
        Math.max(hsl.s - 20, 20),
        Math.min(hsl.l + 35, 95),
      ),
      200: this.hslToHex(
        hsl.h,
        Math.max(hsl.s - 10, 30),
        Math.min(hsl.l + 25, 90),
      ),
      300: this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 80)),
      400: this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 5, 70)),
      500: baseColor, // Base color
      600: this.hslToHex(
        hsl.h,
        Math.min(hsl.s + 5, 100),
        Math.max(hsl.l - 10, 30),
      ),
      700: this.hslToHex(
        hsl.h,
        Math.min(hsl.s + 10, 100),
        Math.max(hsl.l - 20, 25),
      ),
      800: this.hslToHex(
        hsl.h,
        Math.min(hsl.s + 15, 100),
        Math.max(hsl.l - 30, 20),
      ),
      900: this.hslToHex(
        hsl.h,
        Math.min(hsl.s + 20, 100),
        Math.max(hsl.l - 40, 15),
      ),
    };
  }

  /**
   * Convert hex to HSL
   */
  private hexToHSL(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Convert HSL to hex
   */
  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  /**
   * Export as SCSS variables
   */
  private exportAsSCSS(theme: ThemeBuilderConfig): string {
    let scss = `// AegisX Theme: ${theme.name}\n// Generated by Theme Builder\n\n`;

    // Colors
    scss += '// Color Palettes\n';
    Object.entries(theme.colors).forEach(([name, palette]) => {
      Object.entries(palette).forEach(([shade, value]) => {
        scss += `$ax-${name}-${shade}: ${value};\n`;
      });
      scss += '\n';
    });

    // Background
    scss += '// Background\n';
    Object.entries(theme.background).forEach(([key, value]) => {
      scss += `$ax-background-${key}: ${value};\n`;
    });

    // Text
    scss += '\n// Text\n';
    Object.entries(theme.text).forEach(([key, value]) => {
      scss += `$ax-text-${key}: ${value};\n`;
    });

    // Border
    scss += '\n// Border\n';
    Object.entries(theme.border).forEach(([key, value]) => {
      scss += `$ax-border-${key}: ${value};\n`;
    });

    // Radius
    scss += '\n// Radius\n';
    Object.entries(theme.radius).forEach(([key, value]) => {
      scss += `$ax-radius-${key}: ${value};\n`;
    });

    return scss;
  }

  /**
   * Export as CSS custom properties
   */
  private exportAsCSS(theme: ThemeBuilderConfig): string {
    let css = `/* AegisX Theme: ${theme.name} */\n/* Generated by Theme Builder */\n\n:root {\n`;

    // Colors
    Object.entries(theme.colors).forEach(([name, palette]) => {
      Object.entries(palette).forEach(([shade, value]) => {
        css += `  --ax-${name}-${shade}: ${value};\n`;
      });
    });

    // Background
    Object.entries(theme.background).forEach(([key, value]) => {
      css += `  --ax-background-${key}: ${value};\n`;
    });

    // Text
    Object.entries(theme.text).forEach(([key, value]) => {
      css += `  --ax-text-${key}: ${value};\n`;
    });

    // Border
    Object.entries(theme.border).forEach(([key, value]) => {
      css += `  --ax-border-${key}: ${value};\n`;
    });

    // Radius
    Object.entries(theme.radius).forEach(([key, value]) => {
      css += `  --ax-radius-${key}: ${value};\n`;
    });

    css += '}\n';
    return css;
  }

  /**
   * Export as Tailwind config
   */
  private exportAsTailwind(theme: ThemeBuilderConfig): string {
    const config = {
      theme: {
        extend: {
          colors: {} as Record<string, Record<string, string>>,
        },
      },
    };

    Object.entries(theme.colors).forEach(([name, palette]) => {
      // Convert number keys to string keys for Tailwind
      const paletteObj: Record<string, string> = {};
      Object.entries(palette).forEach(([shade, value]) => {
        paletteObj[shade] = value;
      });
      config.theme.extend.colors[name] = paletteObj;
    });

    return `// Tailwind Config Extension\nmodule.exports = ${JSON.stringify(config, null, 2)}`;
  }
}
