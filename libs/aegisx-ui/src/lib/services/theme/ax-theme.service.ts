import { Injectable, signal, computed } from '@angular/core';
import { ThemeOption } from './ax-theme.types';

/**
 * AxThemeService
 *
 * Manages dynamic theme switching for AegisX applications.
 * Supports both AegisX custom themes and Material prebuilt themes.
 *
 * All themes are loaded dynamically via <link> tags - no static imports.
 * This ensures only one theme is active at a time, preventing CSS conflicts.
 */
@Injectable({
  providedIn: 'root',
})
export class AxThemeService {
  private readonly STORAGE_KEY = 'ax-theme-id';
  private readonly THEME_LINK_ID = 'ax-theme-link';

  // Available themes (AegisX themes generated from SCSS)
  readonly themes: ThemeOption[] = [
    // AegisX Themes
    { id: 'aegisx-light', name: 'AegisX Light', path: 'aegisx-light.css' },
    { id: 'aegisx-dark', name: 'AegisX Dark', path: 'aegisx-dark.css' },

    // Material 3 Prebuilt Themes
    {
      id: 'material-indigo-pink',
      name: 'Material 3 Indigo-Pink',
      path: 'themes/indigo-pink.css',
    },
    {
      id: 'material-deeppurple-amber',
      name: 'Material 3 Deep Purple-Amber',
      path: 'themes/deeppurple-amber.css',
    },
    {
      id: 'material-azure-blue',
      name: 'Material 3 Azure-Blue',
      path: 'themes/azure-blue.css',
    },
    {
      id: 'material-cyan-orange',
      name: 'Material 3 Cyan-Orange',
      path: 'themes/cyan-orange.css',
    },
    {
      id: 'material-pink-bluegrey',
      name: 'Material 3 Pink-Blue Grey',
      path: 'themes/pink-bluegrey.css',
    },
    {
      id: 'material-purple-green',
      name: 'Material 3 Purple-Green',
      path: 'themes/purple-green.css',
    },
  ];

  // Reactive state
  private currentThemeId = signal<string>('aegisx-light');

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
      this.setTheme('aegisx-light');
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

    // Apply dark/light class to HTML root for TailwindCSS dark mode
    const root = document.documentElement;
    if (theme.id.includes('dark')) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
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
