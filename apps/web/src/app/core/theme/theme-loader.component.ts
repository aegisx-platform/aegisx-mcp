import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from './theme.service';

/**
 * Theme Loader Component
 *
 * This component dynamically loads the appropriate Material theme CSS
 * based on the current theme selection. It must be included in the root
 * component (AppComponent) to work properly.
 *
 * Usage:
 * <ax-theme-loader></ax-theme-loader>
 */
@Component({
  selector: 'ax-theme-loader',
  standalone: true,
  template: '',
})
export class ThemeLoaderComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Load initial theme
    const currentTheme = this.themeService.getCurrentTheme();
    this.loadThemeCss(currentTheme.name);
  }

  /**
   * Dynamically load theme CSS file
   */
  private loadThemeCss(themeName: string): void {
    // Remove existing theme link if present
    const existingLink = document.getElementById('app-theme-link');
    if (existingLink) {
      existingLink.remove();
    }

    // Create and append new link element
    const link = document.createElement('link');
    link.id = 'app-theme-link';
    link.rel = 'stylesheet';
    link.href = `/styles/themes/${themeName}.css`;

    document.head.appendChild(link);

    link.onload = () => {
      console.log(`Theme CSS loaded: ${themeName}`);
    };

    link.onerror = () => {
      console.error(`Failed to load theme CSS: ${themeName}`);
    };
  }
}
