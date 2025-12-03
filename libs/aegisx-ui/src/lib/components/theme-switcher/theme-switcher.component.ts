/**
 * AegisX Theme Switcher Component
 *
 * Provides theme switching UI for AegisX applications.
 * Integrates with AxThemeService to switch between light/dark modes
 * and different color themes.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AxThemeService } from '../../services/theme/ax-theme.service';

@Component({
  selector: 'ax-theme-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <!-- Theme Switcher Button -->
    <button
      mat-icon-button
      [matMenuTriggerFor]="themeMenu"
      matTooltip="Change theme"
      class="theme-switcher-button"
    >
      <mat-icon>palette</mat-icon>
    </button>

    <!-- Theme Menu -->
    <mat-menu #themeMenu="matMenu" class="theme-switcher-menu">
      <!-- Theme Selection Header -->
      <div class="theme-menu-section">
        <div class="theme-menu-header">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
            THEMES
          </span>
        </div>

        <!-- Theme Options -->
        @for (theme of themes; track theme.id) {
          <button
            mat-menu-item
            (click)="selectTheme(theme.id)"
            [class.theme-active]="currentTheme()?.id === theme.id"
            class="theme-option"
          >
            <div class="theme-option-content">
              <!-- Theme Icon -->
              <mat-icon>
                {{ theme.id.includes('dark') ? 'dark_mode' : 'light_mode' }}
              </mat-icon>

              <!-- Theme Name -->
              <span class="theme-name">{{ theme.name }}</span>

              <!-- Check Icon (visible when active) -->
              @if (currentTheme()?.id === theme.id) {
                <mat-icon class="theme-check-icon">check_circle</mat-icon>
              }
            </div>
          </button>
        }
      </div>

      <!-- Divider -->
      <mat-divider></mat-divider>

      <!-- Quick Actions -->
      <div class="theme-menu-section">
        <div class="theme-menu-header">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
            QUICK ACTIONS
          </span>
        </div>

        <!-- Toggle Light/Dark -->
        <button
          mat-menu-item
          (click)="toggleDarkMode()"
          class="appearance-option"
        >
          <mat-icon>
            {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
          </mat-icon>
          <span>{{ isDarkMode() ? 'Switch to Light' : 'Switch to Dark' }}</span>
        </button>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .theme-switcher-button:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .theme-switcher-menu {
        min-width: 240px !important;
      }

      /* Override Material menu panel styles */
      ::ng-deep .theme-switcher-menu.mat-mdc-menu-panel {
        background-color: var(--ax-background-default) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: var(--ax-radius-md) !important;
        border: 1px solid var(--ax-border-default) !important;
        box-shadow: var(--ax-shadow-lg) !important;
      }

      /* Material menu surface */
      ::ng-deep .theme-switcher-menu .mat-mdc-menu-content {
        background-color: transparent !important;
      }

      .theme-menu-section {
        padding: 8px 0;
      }

      .theme-menu-header {
        padding: 12px 16px 8px;

        span {
          color: var(--ax-text-subtle) !important;
        }
      }

      .theme-option {
        height: auto !important;
        padding: 12px 16px !important;
      }

      .theme-option.theme-active {
        background-color: var(--ax-brand-faint) !important;
      }

      .theme-option.theme-active .theme-name {
        font-weight: 500;
        color: var(--ax-brand-emphasis) !important;
      }

      .theme-option:hover {
        background-color: var(--ax-background-muted) !important;
      }

      .theme-option-content {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;

        mat-icon:first-child {
          width: 20px;
          height: 20px;
          font-size: 20px;
          color: var(--ax-text-subtle);
        }
      }

      .theme-name {
        flex: 1;
        font-size: 14px;
        color: var(--ax-text-body);
      }

      .theme-check-icon {
        margin-left: auto;
        color: var(--ax-brand-default);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .appearance-option {
        height: auto !important;
        padding: 12px 16px !important;
      }

      .appearance-option:hover {
        background-color: var(--ax-background-muted) !important;
      }

      .appearance-option mat-icon {
        margin-right: 12px;
        color: var(--ax-text-body);
      }

      .appearance-option span {
        color: var(--ax-text-body);
      }
    `,
  ],
})
export class AxThemeSwitcherComponent {
  private readonly themeService = inject(AxThemeService);

  // Expose theme service properties
  themes = this.themeService.themes;
  currentTheme = this.themeService.currentTheme;

  /**
   * Check if current theme is dark mode
   */
  isDarkMode() {
    return this.currentTheme()?.id.includes('dark') ?? false;
  }

  /**
   * Select a theme by ID
   */
  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  /**
   * Toggle between light and dark mode
   * For AegisX themes: switches between -light and -dark variants
   * For Material prebuilt themes: falls back to AegisX light/dark
   */
  toggleDarkMode(): void {
    const currentId = this.currentTheme()?.id;

    if (!currentId) {
      this.selectTheme('aegisx-light');
      return;
    }

    // Check if it's an AegisX theme (has -light or -dark suffix)
    const isAegisXTheme =
      currentId.includes('-light') || currentId.includes('-dark');

    if (isAegisXTheme) {
      if (currentId.includes('dark')) {
        // Switch to light version
        this.selectTheme(currentId.replace('-dark', '-light'));
      } else {
        // Switch to dark version
        this.selectTheme(currentId.replace('-light', '-dark'));
      }
    } else {
      // Material prebuilt themes don't have light/dark variants
      // Fall back to AegisX themes
      this.selectTheme(this.isDarkMode() ? 'aegisx-light' : 'aegisx-dark');
    }
  }
}
