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
import { StylePresetService } from '../../services/theme/style-preset.service';

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

      <!-- Style Preset Section -->
      <div class="theme-menu-section">
        <div class="theme-menu-header">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
            STYLE PRESET
          </span>
        </div>

        <!-- Style Preset Options -->
        @for (preset of availablePresets(); track preset.id) {
          <button
            mat-menu-item
            (click)="selectPreset(preset.id)"
            [class.preset-active]="currentPreset() === preset.id"
            class="preset-option"
          >
            <div class="preset-option-content">
              <!-- Preset Icon -->
              <mat-icon class="preset-icon">style</mat-icon>

              <!-- Preset Name -->
              <span class="preset-name">{{ preset.name }}</span>

              <!-- Check Icon (visible when active) -->
              @if (currentPreset() === preset.id) {
                <mat-icon class="preset-check-icon">check_circle</mat-icon>
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

      /* Override Material menu panel styles */
      ::ng-deep .theme-switcher-menu.mat-mdc-menu-panel {
        background-color: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }

      /* Dark mode */
      ::ng-deep .dark .theme-switcher-menu.mat-mdc-menu-panel {
        background-color: rgba(33, 33, 33, 0.98) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
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

      /* Style Preset Options */
      .preset-option {
        height: auto !important;
        padding: 12px 16px !important;

        &.preset-active {
          background-color: rgba(
            var(--md-sys-color-primary-rgb, 57, 73, 171),
            0.08
          );

          .preset-name {
            font-weight: 500;
          }
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }

      .preset-option-content {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .preset-icon {
        width: 20px;
        height: 20px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.5);
        flex-shrink: 0;
      }

      .preset-name {
        flex: 1;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
      }

      .preset-check-icon {
        margin-left: auto;
        color: var(--md-sys-color-primary, #1976d2);
        font-size: 20px;
        width: 20px;
        height: 20px;
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

        .preset-icon {
          color: rgba(255, 255, 255, 0.5);
        }

        .preset-name {
          color: rgba(255, 255, 255, 0.87);
        }

        .preset-option {
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
  private readonly stylePresetService = inject(StylePresetService);

  // Expose theme service properties
  currentTheme = this.themeService.currentTheme;
  isDarkMode = this.themeService.isDarkMode;
  availableThemes = this.themeService.availableThemes;

  // Expose style preset service properties
  currentPreset = this.stylePresetService.currentPreset;
  availablePresets = this.stylePresetService.availablePresets;

  /**
   * Select a theme by ID
   */
  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  /**
   * Select a style preset by ID
   */
  selectPreset(presetId: string): void {
    this.stylePresetService.setPreset(presetId);
    // Re-apply theme to include new preset CSS
    this.themeService.reapplyTheme();
  }

  /**
   * Toggle dark/light mode
   */
  toggleDarkMode(): void {
    this.themeService.toggleScheme();
  }
}
