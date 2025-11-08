import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeName =
  | 'indigo-pink'
  | 'deeppurple-amber'
  | 'pink-bluegrey'
  | 'purple-green';
export type ThemeScheme = 'light' | 'dark';

export interface ThemeConfig {
  name: ThemeName;
  scheme: ThemeScheme;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT) as Document;

  // Current theme state signals
  private currentThemeName = signal<ThemeName>('indigo-pink');
  private currentScheme = signal<ThemeScheme>('light');

  // Public signals for component subscription
  themeName = this.currentThemeName.asReadonly();
  scheme = this.currentScheme.asReadonly();

  // Available themes
  readonly availableThemes: Array<{ name: ThemeName; label: string }> = [
    { name: 'indigo-pink', label: 'Indigo Pink' },
    { name: 'deeppurple-amber', label: 'Deep Purple Amber' },
    { name: 'pink-bluegrey', label: 'Pink Blue Grey' },
    { name: 'purple-green', label: 'Purple Green' },
  ];

  constructor() {
    // Load theme from localStorage on init
    this.initializeTheme();

    // Apply theme whenever it changes
    effect(() => {
      this.applyTheme(this.currentThemeName(), this.currentScheme());
    });
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme-name') as ThemeName | null;
    const savedScheme = localStorage.getItem(
      'theme-scheme',
    ) as ThemeScheme | null;

    // Use saved theme or default
    if (savedTheme && this.availableThemes.some((t) => t.name === savedTheme)) {
      this.currentThemeName.set(savedTheme);
    }

    // Use saved scheme or detect from system
    if (savedScheme) {
      this.currentScheme.set(savedScheme);
    } else {
      this.currentScheme.set(this.getSystemScheme());
    }
  }

  /**
   * Get system color scheme preference
   */
  private getSystemScheme(): ThemeScheme {
    if (
      this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)')
        .matches
    ) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Apply theme by updating HTML attributes and localStorage
   */
  private applyTheme(themeName: ThemeName, scheme: ThemeScheme): void {
    const root = this.document.documentElement;

    // Update data-theme attribute for CSS variable selection
    root.setAttribute('data-theme', themeName);

    // Update dark class for TailwindCSS dark mode
    if (scheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme-name', themeName);
    localStorage.setItem('theme-scheme', scheme);
  }

  /**
   * Set theme by name
   */
  setTheme(themeName: ThemeName): void {
    if (this.availableThemes.some((t) => t.name === themeName)) {
      this.currentThemeName.set(themeName);
    } else {
      console.warn(`Unknown theme: ${themeName}`);
    }
  }

  /**
   * Set color scheme (light/dark)
   */
  setScheme(scheme: ThemeScheme): void {
    this.currentScheme.set(scheme);
  }

  /**
   * Toggle between light and dark
   */
  toggleScheme(): void {
    const newScheme = this.currentScheme() === 'light' ? 'dark' : 'light';
    this.setScheme(newScheme);
  }

  /**
   * Get current theme configuration
   */
  getCurrentTheme(): ThemeConfig {
    return {
      name: this.currentThemeName(),
      scheme: this.currentScheme(),
    };
  }

  /**
   * Get CSS variable value by name
   */
  getCSSVariable(name: string): string {
    const value = this.document.documentElement.style.getPropertyValue(
      `--${name}`,
    );
    return value.trim() || this.getFallbackCSSVariable(name);
  }

  /**
   * Fallback CSS variables from computed styles
   */
  private getFallbackCSSVariable(name: string): string {
    const value = this.document.defaultView
      ?.getComputedStyle(this.document.documentElement)
      .getPropertyValue(`--${name}`);
    return value?.trim() || '';
  }

  /**
   * Update CSS variable at runtime
   */
  setCSSVariable(name: string, value: string): void {
    this.document.documentElement.style.setProperty(`--${name}`, value);
  }

  /**
   * Reset to system preference for scheme
   */
  resetToSystemPreference(): void {
    this.currentScheme.set(this.getSystemScheme());
  }
}
