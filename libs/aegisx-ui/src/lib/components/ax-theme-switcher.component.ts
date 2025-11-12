import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ax-theme-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      (click)="toggleTheme()"
      [matTooltip]="
        isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
      "
    >
      <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
      }
    `,
  ],
})
export class AxThemeSwitcherComponent implements OnInit {
  isDarkMode = signal(false);
  private readonly THEME_KEY = 'theme-mode';

  constructor() {
    // Load and apply theme immediately in constructor
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      this.isDarkMode.set(prefersDark);
    }

    // Apply initial theme immediately
    this.applyTheme(this.isDarkMode());

    // Auto-apply theme when it changes
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  ngOnInit(): void {
    console.log(
      '[AxThemeSwitcher] Component initialized, current theme:',
      this.isDarkMode() ? 'dark' : 'light',
    );
  }

  toggleTheme(): void {
    console.log(
      '[AxThemeSwitcher] Toggling theme from:',
      this.isDarkMode() ? 'dark' : 'light',
    );
    this.isDarkMode.update((current) => !current);
    localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
    console.log(
      '[AxThemeSwitcher] Theme changed to:',
      this.isDarkMode() ? 'dark' : 'light',
    );
  }

  private applyTheme(isDark: boolean): void {
    const themeFile = isDark ? 'aegisx-dark.css' : 'aegisx-light.css';
    const linkId = 'aegisx-theme-link';

    // Find existing theme link
    let themeLink = document.getElementById(linkId) as HTMLLinkElement;

    if (themeLink) {
      // Update existing link href
      themeLink.href = themeFile;
      console.log('[AxThemeSwitcher] Updated theme CSS href:', themeFile);
    } else {
      // Create new link if not found
      themeLink = document.createElement('link');
      themeLink.id = linkId;
      themeLink.rel = 'stylesheet';
      themeLink.href = themeFile;
      document.head.appendChild(themeLink);
      console.log('[AxThemeSwitcher] Created new theme CSS link:', themeFile);
    }

    // Apply class to HTML element
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark', isDark);
    htmlElement.classList.toggle('light', !isDark);
    console.log(
      '[AxThemeSwitcher] Applied theme classes:',
      htmlElement.classList.toString(),
    );
  }
}
