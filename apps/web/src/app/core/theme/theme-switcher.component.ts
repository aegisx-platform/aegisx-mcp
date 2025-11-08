import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, ThemeName } from './theme.service';

/**
 * Theme Switcher Component
 *
 * Provides UI controls to switch between themes and toggle dark/light mode.
 * Can be placed in toolbar, sidebar, or settings page.
 *
 * Usage:
 * <ax-theme-switcher></ax-theme-switcher>
 */
@Component({
  selector: 'ax-theme-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Theme Switcher Button -->
    <button
      mat-icon-button
      [matMenuTriggerFor]="themeMenu"
      matTooltip="Change theme and appearance"
      class="text-slate-700 dark:text-slate-200"
    >
      <mat-icon>palette</mat-icon>
    </button>

    <!-- Theme Menu -->
    <mat-menu #themeMenu="matMenu" class="theme-menu">
      <!-- Dark/Light Toggle Section -->
      <div class="px-4 py-3 flex items-center justify-between gap-4">
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Appearance
        </span>
        <div class="flex gap-1">
          <button
            mat-icon-button
            [class.bg-blue-100]="scheme() === 'light'"
            [class.dark:bg-blue-900]="scheme() === 'light'"
            (click)="themeService.setScheme('light')"
            matTooltip="Light mode"
            class="w-8 h-8"
          >
            <mat-icon class="text-lg">light_mode</mat-icon>
          </button>
          <button
            mat-icon-button
            [class.bg-blue-100]="scheme() === 'dark'"
            [class.dark:bg-blue-900]="scheme() === 'dark'"
            (click)="themeService.setScheme('dark')"
            matTooltip="Dark mode"
            class="w-8 h-8"
          >
            <mat-icon class="text-lg">dark_mode</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider class="my-2"></mat-divider>

      <!-- Theme Selection -->
      <div class="px-4 py-2">
        <p
          class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2"
        >
          COLOR THEMES
        </p>
      </div>

      @for (theme of themeService.availableThemes; track theme.name) {
        <button
          mat-menu-item
          (click)="themeService.setTheme(theme.name)"
          [ngClass]="{
            'flex items-center gap-3 w-full': true,
            'bg-blue-50': themeName() === theme.name,
            'dark:bg-slate-700': themeName() === theme.name,
          }"
        >
          <span
            class="w-4 h-4 rounded-full border-2 flex-shrink-0"
            [style.background-color]="getThemeColor(theme.name)"
            [class.border-blue-600]="themeName() === theme.name"
            [class.dark:border-blue-400]="themeName() === theme.name"
            [class.border-slate-300]="themeName() !== theme.name"
            [class.dark:border-slate-600]="themeName() !== theme.name"
          ></span>
          <span class="flex-1 text-left">{{ theme.label }}</span>
          @if (themeName() === theme.name) {
            <mat-icon
              class="text-blue-600 dark:text-blue-400 text-lg flex-shrink-0"
              >check</mat-icon
            >
          }
        </button>
      }

      <mat-divider class="my-2"></mat-divider>

      <!-- Theme Info -->
      <div class="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
        <p>Current: {{ themeName() | titlecase }}</p>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      ::ng-deep .theme-menu {
        min-width: 250px !important;
      }

      ::ng-deep .theme-menu .mat-mdc-menu-content {
        padding: 0 !important;
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  // Expose theme signals for template
  themeName = this.themeService.themeName;
  scheme = this.themeService.scheme;

  /**
   * Get theme color for display
   */
  getThemeColor(themeName: ThemeName): string {
    const colors: Record<ThemeName, string> = {
      'indigo-pink': '#3f51b5',
      'deeppurple-amber': '#673ab7',
      'pink-bluegrey': '#e91e63',
      'purple-green': '#9c27b0',
    };
    return colors[themeName];
  }
}
