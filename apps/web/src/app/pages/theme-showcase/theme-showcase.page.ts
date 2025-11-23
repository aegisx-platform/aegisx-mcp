/**
 * Theme Showcase Page
 *
 * Comprehensive showcase of all Angular Material components
 * integrated with AegisX Theme System.
 *
 * Features:
 * - Live theme switching (6 color themes)
 * - Dark/Light mode toggle
 * - Real-time preview of all Material components
 * - Organized by category with navigation
 * - Material Design 3 compliant UI
 *
 * Note: Style Presets feature temporarily removed (backed up for future use)
 *
 * Access via: /theme-showcase
 */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

import { AxThemeService } from '@aegisx/ui';

import { FormControlsSection } from './sections/form-controls.section';
import { ButtonsActionsSection } from './sections/buttons-actions.section';
import { NavigationSection } from './sections/navigation.section';
import { LayoutSection } from './sections/layout.section';
import { DataDisplaySection } from './sections/data-display.section';
import { FeedbackSection } from './sections/feedback.section';
import { AdvancedSection } from './sections/advanced.section';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-theme-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatTabsModule,
    FormControlsSection,
    ButtonsActionsSection,
    NavigationSection,
    LayoutSection,
    DataDisplaySection,
    FeedbackSection,
    AdvancedSection,
  ],
  template: `
    <div class="theme-showcase-container">
      <!-- Control Panel Header -->
      <header class="showcase-header">
        <div class="header-content">
          <div class="header-title">
            <h1>Material Component Showcase</h1>
            <p>Real-time theme testing with AegisX themes</p>
          </div>

          <!-- Theme Control Panel -->
          <div class="control-panel">
            <!-- Color Theme Selector -->
            <mat-form-field appearance="outline" class="control-field">
              <mat-label>Theme</mat-label>
              <mat-select
                [(ngModel)]="selectedThemeId"
                (selectionChange)="onThemeChange()"
              >
                @for (theme of availableThemes(); track theme.id) {
                  <mat-option [value]="theme.id">
                    {{ theme.name }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Dark Mode Toggle -->
            <div class="dark-mode-control">
              <mat-slide-toggle
                [(ngModel)]="isDarkMode"
                (change)="onDarkModeChange()"
                matTooltip="Toggle dark/light mode"
              >
                <mat-icon>{{
                  isDarkMode ? 'light_mode' : 'dark_mode'
                }}</mat-icon>
              </mat-slide-toggle>
            </div>

            <!-- Reset Button -->
            <button
              mat-icon-button
              (click)="resetToDefaults()"
              matTooltip="Reset to defaults"
            >
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>

        <!-- Theme Info -->
        <div class="theme-info">
          <span class="info-badge">
            {{ currentThemeName() }}
            @if (isDarkMode) {
              <span class="separator">•</span>
              <span>Dark Mode</span>
            }
          </span>
        </div>
      </header>

      <!-- Main Content -->
      <main class="showcase-main">
        <!-- Category Navigation -->
        <nav class="category-nav">
          <div class="nav-label">Components</div>
          <div class="nav-items">
            @for (category of categories; track category.id) {
              <button
                mat-button
                [class.active]="selectedCategory === category.id"
                (click)="selectCategory(category.id)"
                class="nav-button"
              >
                <mat-icon>{{ category.icon }}</mat-icon>
                <span>{{ category.name }}</span>
              </button>
            }
          </div>
        </nav>

        <!-- Content Sections -->
        <div class="showcase-content">
          <!-- Form Controls Section -->
          @if (selectedCategory === 'form-controls') {
            <app-form-controls-section></app-form-controls-section>
          }

          <!-- Buttons & Actions Section -->
          @if (selectedCategory === 'buttons-actions') {
            <app-buttons-actions-section></app-buttons-actions-section>
          }

          <!-- Navigation Section -->
          @if (selectedCategory === 'navigation') {
            <app-navigation-section></app-navigation-section>
          }

          <!-- Layout Section -->
          @if (selectedCategory === 'layout') {
            <app-layout-section></app-layout-section>
          }

          <!-- Data Display Section -->
          @if (selectedCategory === 'data-display') {
            <app-data-display-section></app-data-display-section>
          }

          <!-- Feedback Section -->
          @if (selectedCategory === 'feedback') {
            <app-feedback-section></app-feedback-section>
          }

          <!-- Advanced Section -->
          @if (selectedCategory === 'advanced') {
            <app-advanced-section></app-advanced-section>
          }
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow: hidden;
      }

      .theme-showcase-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: var(--theme-surface-bg);
        color: var(--theme-text-primary);
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      /* ════════════════════════════════════════════════════════════ */
      /* HEADER STYLES */
      /* ════════════════════════════════════════════════════════════ */

      .showcase-header {
        background-color: var(--md-sys-color-surface, #ffffff);
        border-bottom: 1px solid var(--theme-surface-border);
        padding: var(--preset-spacing-base, 24px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--preset-spacing-lg, 36px);
        flex-wrap: wrap;
        margin-bottom: var(--preset-spacing-lg, 36px);
      }

      .header-title h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 700;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .header-title p {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .control-panel {
        display: flex;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
        flex-wrap: wrap;
      }

      .control-field {
        width: 160px;
        min-width: 160px;
      }

      .control-field ::ng-deep .mat-mdc-text-field-wrapper {
        padding-bottom: 0 !important;
      }

      .option-label {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .color-swatch {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        flex-shrink: 0;
        border: 1px solid rgba(0, 0, 0, 0.12);
      }

      .dark-mode-control {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: var(--preset-border-radius, 12px);
        background-color: var(--theme-surface-hover);
      }

      .dark-mode-control ::ng-deep .mdc-switch__icon {
        width: 20px;
        height: 20px;
      }

      .theme-info {
        display: flex;
        justify-content: center;
        padding-top: var(--preset-spacing-md, 18px);
        border-top: 1px solid var(--theme-surface-border);
      }

      .info-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        background-color: rgba(
          var(--md-sys-color-primary-rgb, 57, 73, 171),
          0.08
        );
        color: var(--md-sys-color-primary, #2196f3);
        border-radius: var(--preset-border-radius, 12px);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.4px;
      }

      .separator {
        opacity: 0.5;
      }

      /* ════════════════════════════════════════════════════════════ */
      /* MAIN CONTENT LAYOUT */
      /* ════════════════════════════════════════════════════════════ */

      .showcase-main {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .category-nav {
        width: 220px;
        background-color: var(--theme-surface-bg);
        border-right: 1px solid var(--theme-surface-border);
        padding: var(--preset-spacing-base, 24px) 0;
        overflow-y: auto;
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .nav-label {
        padding: 0 var(--preset-spacing-base, 24px);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.5px;
        color: var(--theme-text-tertiary);
        text-transform: uppercase;
        margin-bottom: var(--preset-spacing-md, 18px);
      }

      .nav-items {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .nav-button {
        display: flex;
        align-items: center;
        gap: var(--preset-spacing-md, 18px);
        width: 100%;
        padding: 12px var(--preset-spacing-base, 24px);
        text-align: left;
        border-radius: 0;
        color: var(--theme-text-secondary);
        font-weight: 500;

        mat-icon {
          width: 20px;
          height: 20px;
          font-size: 20px;
          color: var(--theme-text-secondary);
        }

        &:hover {
          background-color: var(--theme-surface-hover);
          color: var(--theme-text-primary);

          mat-icon {
            color: var(--theme-text-primary);
          }
        }

        &.active {
          background-color: rgba(
            var(--md-sys-color-primary-rgb, 57, 73, 171),
            0.08
          );
          color: var(--md-sys-color-primary, #2196f3);
          border-right: 3px solid var(--md-sys-color-primary, #2196f3);

          mat-icon {
            color: var(--md-sys-color-primary, #2196f3);
          }
        }
      }

      .showcase-content {
        flex: 1;
        padding: var(--preset-spacing-base, 24px);
        overflow-y: auto;
        background-color: var(--theme-surface-bg);
      }

      /* ════════════════════════════════════════════════════════════ */
      /* DARK MODE */
      /* ════════════════════════════════════════════════════════════ */

      :host-context(.dark) {
        .showcase-header {
          background-color: var(--md-sys-color-surface, #1f2937);
          border-bottom-color: var(--theme-surface-border);
        }

        .category-nav {
          background-color: var(--theme-surface-bg);
          border-right-color: var(--theme-surface-border);
        }

        .showcase-content {
          background-color: var(--theme-surface-bg);
        }
      }

      /* ════════════════════════════════════════════════════════════ */
      /* RESPONSIVE */
      /* ════════════════════════════════════════════════════════════ */

      @media (max-width: 768px) {
        .showcase-main {
          flex-direction: column;
        }

        .category-nav {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid var(--theme-surface-border);
          padding: 12px 0;
          height: auto;
          max-height: 100px;
          overflow-x: auto;
          overflow-y: hidden;
        }

        .nav-items {
          flex-direction: row;
          gap: 0;
          padding: 0 var(--preset-spacing-base, 24px);
        }

        .nav-button {
          flex-shrink: 0;
          padding: 12px var(--preset-spacing-md, 18px);
          border-radius: 0;

          span {
            display: none;
          }

          &.active {
            border-right: none;
            border-bottom: 3px solid var(--md-sys-color-primary, #2196f3);
          }
        }

        .header-content {
          flex-direction: column;
          gap: var(--preset-spacing-md, 18px);
        }

        .control-panel {
          width: 100%;
          justify-content: center;
        }

        .control-field {
          width: 100%;
          max-width: 200px;
        }
      }
    `,
  ],
})
export class ThemeShowcasePage {
  private readonly themeService = inject(AxThemeService);

  selectedCategory = 'form-controls';
  selectedThemeId = this.themeService.themeId();
  isDarkMode = this.themeService.themeId().includes('dark');

  availableThemes = computed(() => this.themeService.themes);

  currentThemeName = computed(() => {
    const theme = this.themeService.themes.find(
      (t) => t.id === this.selectedThemeId,
    );
    return theme?.name || 'Unknown';
  });

  categories: Category[] = [
    {
      id: 'form-controls',
      name: 'Form Controls',
      icon: 'input',
      description: 'Input, Select, Checkbox, Radio, Slider, Toggle, Datepicker',
    },
    {
      id: 'buttons-actions',
      name: 'Buttons & Actions',
      icon: 'touch_app',
      description: 'Buttons, FAB, Icon Button, Chips, Badge',
    },
    {
      id: 'navigation',
      name: 'Navigation',
      icon: 'navigation',
      description: 'Toolbar, Menu, Tabs, Sidenav',
    },
    {
      id: 'layout',
      name: 'Layout',
      icon: 'dashboard',
      description: 'Card, List, Grid, Divider, Expansion Panel',
    },
    {
      id: 'data-display',
      name: 'Data Display',
      icon: 'table_chart',
      description: 'Table, Paginator, Sort, Badge',
    },
    {
      id: 'feedback',
      name: 'Feedback',
      icon: 'notifications',
      description: 'Progress, Snackbar, Dialog, Tooltip',
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: 'settings',
      description: 'Drag & Drop, Virtual Scrolling, CDK Features',
    },
  ];

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  onThemeChange(): void {
    this.themeService.setTheme(this.selectedThemeId);
    this.isDarkMode = this.selectedThemeId.includes('dark');
  }

  onDarkModeChange(): void {
    const currentTheme = this.themeService.themes.find(
      (t) => t.id === this.selectedThemeId,
    );
    if (!currentTheme) return;

    // Toggle between light and dark version of current theme
    if (this.isDarkMode) {
      // Switch to dark version
      const darkId = currentTheme.id.replace('-light', '-dark');
      this.selectedThemeId = darkId;
      this.themeService.setTheme(darkId);
    } else {
      // Switch to light version
      const lightId = currentTheme.id.replace('-dark', '-light');
      this.selectedThemeId = lightId;
      this.themeService.setTheme(lightId);
    }
  }

  resetToDefaults(): void {
    this.selectedThemeId = 'aegisx-light';
    this.isDarkMode = false;
    this.themeService.setTheme('aegisx-light');
  }
}
