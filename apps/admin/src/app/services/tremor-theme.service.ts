import { Injectable, signal, computed } from '@angular/core';

export interface ThemeOption {
  id: string;
  name: string;
  path: string;
}

/**
 * TremorThemeService
 *
 * Manages dynamic theme switching for the admin application.
 * Supports both Tremor custom themes and Material prebuilt themes.
 *
 * All themes are loaded dynamically via <link> tags - no static imports.
 * This ensures only one theme is active at a time, preventing CSS conflicts.
 */
@Injectable({
  providedIn: 'root',
})
export class TremorThemeService {
  private readonly STORAGE_KEY = 'selected-theme';
  private readonly THEME_LINK_ID = 'app-theme';

  // Available themes (Tremor + Material prebuilt)
  readonly themes: ThemeOption[] = [
    // Tremor Custom Themes
    { id: 'tremor-light', name: 'Tremor Light', path: 'tremor-light.css' },
    { id: 'tremor-dark', name: 'Tremor Dark', path: 'tremor-dark.css' },

    // Material Prebuilt Themes
    {
      id: 'indigo-pink',
      name: 'Indigo & Pink',
      path: 'themes/indigo-pink.css',
    },
    {
      id: 'deeppurple-amber',
      name: 'Deep Purple & Amber',
      path: 'themes/deeppurple-amber.css',
    },
    {
      id: 'pink-bluegrey',
      name: 'Pink & Blue Grey',
      path: 'themes/pink-bluegrey.css',
    },
    {
      id: 'purple-green',
      name: 'Purple & Green',
      path: 'themes/purple-green.css',
    },
    { id: 'azure-blue', name: 'Azure Blue', path: 'themes/azure-blue.css' },
    {
      id: 'cyan-orange',
      name: 'Cyan & Orange',
      path: 'themes/cyan-orange.css',
    },
    {
      id: 'magenta-violet',
      name: 'Magenta & Violet',
      path: 'themes/magenta-violet.css',
    },
    { id: 'rose-red', name: 'Rose & Red', path: 'themes/rose-red.css' },
  ];

  // Reactive state
  private currentThemeId = signal<string>('tremor-light');

  // Public readonly signals
  readonly themeId = this.currentThemeId.asReadonly();
  readonly currentTheme = computed(() =>
    this.themes.find((t) => t.id === this.currentThemeId()),
  );

  constructor() {
    // Initialize theme from storage or use default
    this.initializeTheme();
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: string): void {
    const theme = this.themes.find((t) => t.id === themeId);

    if (!theme) {
      console.warn(
        `Theme "${themeId}" not found. Available themes:`,
        this.themes.map((t) => t.id),
      );
      return;
    }

    // Update reactive state
    this.currentThemeId.set(themeId);

    // Apply theme (load CSS dynamically)
    this.applyTheme(theme);

    // Save to localStorage
    this.saveTheme(themeId);
  }

  /**
   * Initialize theme from localStorage or use default
   */
  private initializeTheme(): void {
    const savedThemeId = this.loadTheme();

    if (savedThemeId && this.themes.find((t) => t.id === savedThemeId)) {
      this.setTheme(savedThemeId);
    } else {
      // Use default theme
      this.setTheme('tremor-light');
    }
  }

  /**
   * Apply theme by dynamically loading CSS file
   */
  private applyTheme(theme: ThemeOption): void {
    // Remove existing theme link if any
    const existingLink = document.getElementById(this.THEME_LINK_ID);
    if (existingLink) {
      existingLink.remove();
    }

    // Create and append new theme link
    const linkElement = document.createElement('link');
    linkElement.id = this.THEME_LINK_ID;
    linkElement.rel = 'stylesheet';
    linkElement.href = theme.path;

    // Add to document head
    document.head.appendChild(linkElement);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(themeId: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, themeId);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Load theme preference from localStorage
   */
  private loadTheme(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return null;
    }
  }
}
