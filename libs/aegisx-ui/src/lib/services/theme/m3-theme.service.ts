/**
 * Material 3 Theme Service
 *
 * Manages Material Design 3 theme switching, color palette generation,
 * and synchronization with application configuration.
 */

import { Injectable, inject, signal, computed, DOCUMENT } from '@angular/core';
import { AegisxConfigService } from '../config/config.service';
import { M3Theme, M3ThemeState } from './m3-theme.types';
import { generateM3Palette, lightenColor, darkenColor } from './m3-color-utils';

@Injectable({
  providedIn: 'root',
})
export class M3ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly configService = inject(AegisxConfigService);

  /**
   * Pre-defined Material 3 themes
   * Maps to SCSS theme classes defined in user-themes.scss
   */
  private readonly themes: Record<string, M3Theme> = {
    brand: {
      id: 'brand',
      name: 'Blue (Brand)',
      seedColor: '#2196f3',
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
  private readonly _currentTheme = signal<string>('blue');
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

    // Apply theme on init
    this.applyTheme();
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
