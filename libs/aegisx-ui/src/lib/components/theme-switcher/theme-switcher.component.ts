/**
 * AegisX Theme Switcher Component
 *
 * Provides a user interface for switching between Material 3 themes
 * and toggling light/dark mode.
 *
 * Usage:
 * <ax-theme-switcher></ax-theme-switcher>
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { M3ThemeService } from '../../services/theme/m3-theme.service';

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
            COLOR THEME
          </span>
        </div>

        <!-- Theme Options -->
        @for (theme of availableThemes(); track theme.id) {
          <button
            mat-menu-item
            (click)="selectTheme(theme.id)"
            [class.theme-active]="currentTheme() === theme.id"
            class="theme-option"
          >
            <div class="theme-option-content">
              <!-- Color Preview Dot -->
              <div
                class="theme-color-dot"
                [style.background-color]="theme.seedColor"
                [style.border]="
                  currentTheme() === theme.id
                    ? '2px solid ' + theme.seedColor
                    : '2px solid transparent'
                "
              ></div>

              <!-- Theme Name -->
              <span class="theme-name">{{ theme.name }}</span>

              <!-- Check Icon (visible when active) -->
              @if (currentTheme() === theme.id) {
                <mat-icon class="theme-check-icon">check_circle</mat-icon>
              }
            </div>
          </button>
        }
      </div>

      <!-- Divider -->
      <mat-divider></mat-divider>

      <!-- Appearance Section -->
      <div class="theme-menu-section">
        <div class="theme-menu-header">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
            APPEARANCE
          </span>
        </div>

        <!-- Dark Mode Toggle -->
        <button
          mat-menu-item
          (click)="toggleDarkMode()"
          class="appearance-option"
        >
          <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          <span>{{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .theme-switcher-button {
        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }

      .theme-switcher-menu {
        min-width: 220px !important;
      }

      .theme-menu-section {
        padding: 8px 0;
      }

      .theme-menu-header {
        padding: 12px 16px 8px;
      }

      .theme-option {
        height: auto !important;
        padding: 12px 16px !important;

        &.theme-active {
          background-color: rgba(
            var(--md-sys-color-primary-rgb, 57, 73, 171),
            0.08
          );

          .theme-name {
            font-weight: 500;
          }
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }

      .theme-option-content {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .theme-color-dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        flex-shrink: 0;
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .theme-name {
        flex: 1;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
      }

      .theme-check-icon {
        margin-left: auto;
        color: var(--md-sys-color-primary, #1976d2);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .appearance-option {
        height: auto !important;
        padding: 12px 16px !important;

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }

      /* Dark mode overrides */
      :host-context(.dark) {
        .theme-name {
          color: rgba(255, 255, 255, 0.87);
        }

        .theme-option {
          &:hover {
            background-color: rgba(255, 255, 255, 0.08);
          }
        }

        .appearance-option {
          &:hover {
            background-color: rgba(255, 255, 255, 0.08);
          }
        }
      }
    `,
  ],
})
export class AxThemeSwitcherComponent {
  private readonly themeService = inject(M3ThemeService);

  // Expose theme service properties
  currentTheme = this.themeService.currentTheme;
  isDarkMode = this.themeService.isDarkMode;
  availableThemes = this.themeService.availableThemes;

  /**
   * Select a theme by ID
   */
  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  /**
   * Toggle dark/light mode
   */
  toggleDarkMode(): void {
    this.themeService.toggleScheme();
  }
}
