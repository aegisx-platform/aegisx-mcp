/**
 * Material 3 Theme Service
 *
 * Manages Material Design 3 theme switching, color palette generation,
 * and synchronization with application configuration.
 */

import {
  DOCUMENT,
  Injectable,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AegisxConfigService } from '../config/config.service';
import { darkenColor, lightenColor } from './m3-color-utils';
import { M3Theme } from './m3-theme.types';
import { StylePresetService } from './style-preset.service';

@Injectable({
  providedIn: 'root',
})
export class M3ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly configService = inject(AegisxConfigService);
  private readonly stylePresetService = inject(StylePresetService);
  private themeStyleElement: HTMLStyleElement | null = null;

  /**
   * Pre-defined Material 3 themes
   * Maps to SCSS theme classes defined in user-themes.scss
   */
  private readonly themes: Record<string, M3Theme> = {
    brand: {
      id: 'brand',
      name: 'Blue (Brand)',
      seedColor: '#0c5df4',
      description: 'Brand Blue theme',
    },
    teal: {
      id: 'teal',
      name: 'Teal',
      seedColor: '#14b8a6',
      description: 'Material Teal',
    },
    rose: {
      id: 'rose',
      name: 'Rose',
      seedColor: '#f43f5e',
      description: 'Material Rose',
    },
    purple: {
      id: 'purple',
      name: 'Purple',
      seedColor: '#a855f7',
      description: 'Material Purple',
    },
    amber: {
      id: 'amber',
      name: 'Amber',
      seedColor: '#f59e0b',
      description: 'Material Amber',
    },
    default: {
      id: 'default',
      name: 'Indigo',
      seedColor: '#4f46e5',
      description: 'Default Indigo theme',
    },
  };

  /**
   * Current theme ID signal
   */
  private readonly _currentTheme = signal<string>('brand');
  public readonly currentTheme = this._currentTheme.asReadonly();

  /**
   * Current color scheme signal
   */
  private readonly _scheme = signal<'light' | 'dark'>('light');
  public readonly scheme = this._scheme.asReadonly();

  /**
   * Available themes list
   */
  public readonly availableThemes = computed(() => Object.values(this.themes));

  /**
   * Is dark mode enabled
   */
  public readonly isDarkMode = computed(() => this.scheme() === 'dark');

  constructor() {
    // Initialize theme from saved state or config
    this.initializeTheme();

    // Apply theme after browser render to ensure DOM is ready
    afterNextRender(() => {
      this.applyTheme();
    });
  }

  /**
   * Initialize theme from localStorage or config
   */
  private initializeTheme(): void {
    // Try to load from localStorage first
    const savedTheme = localStorage.getItem('m3-theme-id');
    const savedScheme = localStorage.getItem('m3-theme-scheme') as
      | 'light'
      | 'dark'
      | null;

    if (savedTheme && this.themes[savedTheme]) {
      this._currentTheme.set(savedTheme);
    }

    if (savedScheme) {
      this._scheme.set(savedScheme);
    } else {
      // Auto-detect dark mode from system preference
      const prefersDark = this.document.defaultView?.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      this._scheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: string): void {
    const theme = this.themes[themeId];
    if (!theme) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    this._currentTheme.set(themeId);
    localStorage.setItem('m3-theme-id', themeId);

    // Apply the theme
    this.applyTheme();

    // Sync with config service
    this.syncWithConfig();
  }

  /**
   * Set color scheme (light/dark)
   */
  setScheme(scheme: 'light' | 'dark'): void {
    this._scheme.set(scheme);
    localStorage.setItem('m3-theme-scheme', scheme);

    // Apply the theme
    this.applyTheme();

    // Sync with config service
    this.syncWithConfig();
  }

  /**
   * Toggle between light and dark mode
   */
  toggleScheme(): void {
    const newScheme = this.scheme() === 'light' ? 'dark' : 'light';
    this.setScheme(newScheme);
  }

  /**
   * Apply current theme to DOM
   */
  private applyTheme(): void {
    const root = this.document.documentElement;
    const theme = this.themes[this.currentTheme()];

    if (!theme) return;

    // Apply dark/light class for TailwindCSS and global styles
    root.classList.remove('light', 'dark');
    root.classList.add(this.scheme());

    // Remove all existing theme classes
    root.classList.forEach((className) => {
      if (className.startsWith('theme-')) {
        root.classList.remove(className);
      }
    });

    // Apply theme-specific class (maps to SCSS theme classes in user-themes.scss)
    root.classList.add(`theme-${this.currentTheme()}`);

    // Inject dynamic theme CSS for Material components
    this.injectThemeCss(theme);
  }

  /**
   * Inject theme CSS dynamically into the document
   * This ensures Material components get the correct colors and style presets are applied
   */
  private injectThemeCss(theme: M3Theme): void {
    // Remove old theme style if it exists
    if (this.themeStyleElement && this.themeStyleElement.parentNode) {
      this.themeStyleElement.parentNode.removeChild(this.themeStyleElement);
    }

    // Create new style element with combined theme and preset CSS
    const styleElement = this.document.createElement('style');
    styleElement.id = 'dynamic-theme-styles';

    // Combine color theme CSS with style preset CSS
    const themeCss = this.generateThemeCss(theme);
    const currentPreset = this.stylePresetService.getPreset(
      this.stylePresetService.currentPreset(),
    );
    const presetCss = currentPreset
      ? this.stylePresetService.generatePresetCSS(currentPreset)
      : '';

    styleElement.textContent = themeCss + presetCss;

    // Inject into document head
    this.document.head.appendChild(styleElement);
    this.themeStyleElement = styleElement;
  }

  /**
   * Generate CSS for the given theme
   * Separates CSS Custom Properties (Variables) from Color Rules
   */
  private generateThemeCss(theme: M3Theme): string {
    const primaryColor = theme.seedColor;
    const primaryDark = darkenColor(primaryColor, 0.15);
    const primaryLight = lightenColor(primaryColor, 0.15);
    const accentColor = this.getAccentColor(theme);

    // ⭐ PART 1: CSS VARIABLES (for components to use)
    const cssVariables = `
      /* ⭐ CSS CUSTOM PROPERTIES - Global Theme Variables */
      :root {
        /* Primary Colors */
        --theme-primary: ${primaryColor};
        --theme-primary-dark: ${primaryDark};
        --theme-primary-light: ${primaryLight};

        /* Accent Color */
        --theme-accent: ${accentColor};

        /* Semantic Colors */
        --theme-success: #10b981;
        --theme-warning: #f59e0b;
        --theme-danger: #ef4444;
        --theme-info: #3b82f6;

        /* Text Colors (Light Mode) */
        --theme-text-primary: #1f2937;
        --theme-text-secondary: #6b7280;
        --theme-text-tertiary: #9ca3af;

        /* Surface Colors (Light Mode) */
        --theme-surface-bg: #ffffff;
        --theme-surface-border: #e5e7eb;
        --theme-surface-hover: #f3f4f6;

        /* Shadows */
        --theme-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
        --theme-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
        --theme-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
      }

      /* Dark Mode Variants */
      [data-theme="dark"],
      .dark {
        --theme-text-primary: #f3f4f6;
        --theme-text-secondary: #d1d5db;
        --theme-text-tertiary: #9ca3af;
        --theme-surface-bg: #1f2937;
        --theme-surface-border: #374151;
        --theme-surface-hover: #111827;
      }
    `;

    // ⭐ PART 2: MATERIAL COMPONENT COLORS (specific rules)
    const materialColors = `
      /* ⭐ MATERIAL COMPONENTS - Color Rules */
      .theme-${theme.id} button[mat-raised-button][color="primary"],
      .theme-${theme.id} button[mat-button][color="primary"],
      .theme-${theme.id} .mdc-button--raised:not(.mdc-button--outlined) {
        background-color: ${primaryColor} !important;
        color: #ffffff !important;
      }

      .theme-${theme.id} button[mat-stroked-button][color="primary"],
      .theme-${theme.id} .mdc-button--outlined {
        border-color: ${primaryColor} !important;
        color: ${primaryColor} !important;
      }

      .theme-${theme.id} mat-form-field.mat-focused .mat-form-field-label,
      .theme-${theme.id} .mdc-text-field--filled.mdc-text-field--focused {
        color: ${primaryColor} !important;
      }

      .theme-${theme.id} .mdc-button {
        --mdc-theme-primary: ${primaryColor};
      }
    `;

    return cssVariables + materialColors;
  }

  /**
   * Get accent color based on theme
   * Provides a complementary color for accent elements
   */
  private getAccentColor(theme: M3Theme): string {
    const accentMap: Record<string, string> = {
      brand: '#6366f1',    // Indigo
      teal: '#06b6d4',     // Cyan
      rose: '#ec4899',     // Pink
      purple: '#a855f7',   // Purple
      amber: '#f59e0b',    // Amber
      default: '#8b5cf6',  // Violet
    };
    return accentMap[theme.id] || '#6366f1';
  }

  /**
   * Generate complementary color for secondary
   * Uses color wheel (120 degrees offset)
   */
  private generateComplementaryColor(hex: string): string {
    // Simple implementation: rotate hue by 120 degrees
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#6200EE';

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.h = (hsl.h + 120) % 360;

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId: string): M3Theme | undefined {
    return this.themes[themeId];
  }

  /**
   * Register custom theme
   */
  registerTheme(theme: M3Theme): void {
    this.themes[theme.id] = theme;
  }

  /**
   * Re-apply theme when style preset changes
   * Called by StylePresetService when user selects a different preset
   */
  reapplyTheme(): void {
    const theme = this.themes[this.currentTheme()];
    if (theme) {
      this.applyTheme();
    }
  }

  /**
   * Sync theme state with AegisxConfigService
   */
  private syncWithConfig(): void {
    try {
      const currentConfig = this.configService.config();
      if (currentConfig) {
        this.configService.setConfig({
          ...currentConfig,
          theme: {
            name: this.currentTheme(),
            scheme: this.scheme(),
          },
        });
      }
    } catch (error) {
      console.debug('Could not sync with AegisxConfigService:', error);
    }
  }

  /**
   * Color utility methods
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  private rgbToHsl(
    r: number,
    g: number,
    b: number,
  ): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
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

  private hslToRgb(
    h: number,
    s: number,
    l: number,
  ): { r: number; g: number; b: number } {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
}
