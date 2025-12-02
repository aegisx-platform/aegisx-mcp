/**
 * M3 Color Scheme Preview Component
 *
 * Displays Material Design 3 color scheme preview generated from primary color.
 * Shows Primary, Secondary, Tertiary palettes and complete light/dark schemes.
 */
import { Component, computed, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import {
  generateM3CorePalettes,
  generateM3ColorScheme,
  generateTonalPalette,
  formatM3ColorName,
  getM3ColorRoleCategories,
  getContrastRatio,
  type M3CorePalettes,
  type M3ColorScheme,
  type M3ColorSchemeSet,
  type M3TonalPalette,
  type ToneValue,
} from './m3-color.util';

type ViewMode = 'scheme' | 'palettes' | 'tones';
type SchemeMode = 'light' | 'dark';

@Component({
  selector: 'ax-m3-color-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonToggleModule,
  ],
  template: `
    <div class="m3-preview">
      <!-- Header with View Toggle -->
      <div class="m3-preview-header">
        <div class="header-info">
          <h3>M3 Color Scheme</h3>
          <p class="subtitle">
            Generated from seed color
            <span
              class="seed-badge"
              [style.background]="seedColor()"
              [style.color]="getSeedTextColor()"
            >
              {{ seedColor() }}
            </span>
          </p>
        </div>

        <mat-button-toggle-group
          [value]="viewMode()"
          (change)="viewMode.set($event.value)"
          class="view-toggle"
        >
          <mat-button-toggle value="scheme">
            <mat-icon>color_lens</mat-icon>
            Scheme
          </mat-button-toggle>
          <mat-button-toggle value="palettes">
            <mat-icon>palette</mat-icon>
            Palettes
          </mat-button-toggle>
          <mat-button-toggle value="tones">
            <mat-icon>gradient</mat-icon>
            Tones
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <!-- Scheme View -->
      @if (viewMode() === 'scheme') {
        <div class="scheme-view">
          <!-- Light/Dark Toggle -->
          <div class="scheme-toggle">
            <mat-button-toggle-group
              [value]="schemeMode()"
              (change)="schemeMode.set($event.value)"
            >
              <mat-button-toggle value="light">
                <mat-icon>light_mode</mat-icon>
                Light
              </mat-button-toggle>
              <mat-button-toggle value="dark">
                <mat-icon>dark_mode</mat-icon>
                Dark
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <!-- Color Scheme Grid -->
          <div class="scheme-grid">
            @for (category of colorCategories; track category.category) {
              <div class="scheme-category">
                <h4>{{ category.category }}</h4>
                <div class="color-roles">
                  @for (role of category.roles; track role) {
                    <div
                      class="color-role"
                      [style.background]="getSchemeColor(role)"
                      [matTooltip]="getColorTooltip(role)"
                    >
                      <span
                        class="role-name"
                        [style.color]="getTextColorFor(getSchemeColor(role))"
                      >
                        {{ formatRoleName(role) }}
                      </span>
                      <span
                        class="role-value"
                        [style.color]="getTextColorFor(getSchemeColor(role))"
                      >
                        {{ getSchemeColor(role) }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Palettes View -->
      @if (viewMode() === 'palettes') {
        <div class="palettes-view">
          @for (paletteName of paletteNames; track paletteName) {
            <div class="palette-section">
              <h4>{{ formatPaletteName(paletteName) }}</h4>
              <div class="tonal-strip">
                @for (tone of toneValues; track tone) {
                  <div
                    class="tone-cell"
                    [style.background]="getPaletteColor(paletteName, tone)"
                    [matTooltip]="
                      'Tone ' + tone + ': ' + getPaletteColor(paletteName, tone)
                    "
                  >
                    <span
                      class="tone-label"
                      [style.color]="
                        getTextColorFor(getPaletteColor(paletteName, tone))
                      "
                    >
                      {{ tone }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Tones View (Single Palette Detail) -->
      @if (viewMode() === 'tones') {
        <div class="tones-view">
          <div class="tones-header">
            <label>Select Palette:</label>
            <select
              [value]="selectedPalette()"
              (change)="onPaletteSelect($event)"
              class="palette-select"
            >
              @for (name of paletteNames; track name) {
                <option [value]="name">{{ formatPaletteName(name) }}</option>
              }
            </select>
          </div>

          <div class="tones-grid">
            @for (tone of toneValues; track tone) {
              <div class="tone-card">
                <div
                  class="tone-preview"
                  [style.background]="getSelectedPaletteColor(tone)"
                >
                  <span
                    [style.color]="
                      getTextColorFor(getSelectedPaletteColor(tone))
                    "
                  >
                    Aa
                  </span>
                </div>
                <div class="tone-info">
                  <span class="tone-number">{{ tone }}</span>
                  <span class="tone-hex">{{
                    getSelectedPaletteColor(tone)
                  }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Export Section -->
      <div class="export-section">
        <button mat-stroked-button (click)="copyScheme('css')">
          <mat-icon>content_copy</mat-icon>
          Copy CSS
        </button>
        <button mat-stroked-button (click)="copyScheme('scss')">
          <mat-icon>code</mat-icon>
          Copy SCSS
        </button>
        <button mat-flat-button color="primary" (click)="applyToTheme()">
          <mat-icon>check</mat-icon>
          Apply to Theme
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .m3-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .m3-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-info {
        h3 {
          margin: 0 0 0.25rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        .subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      .seed-badge {
        padding: 0.125rem 0.5rem;
        border-radius: var(--ax-radius-sm);
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .view-toggle {
        ::ng-deep {
          .mat-button-toggle-button {
            height: 36px;
          }

          .mat-button-toggle-label-content {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0 0.75rem;
            font-size: 0.75rem;
          }

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }

      /* Scheme View */
      .scheme-view {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .scheme-toggle {
        display: flex;
        justify-content: center;
      }

      .scheme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      .scheme-category {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-md);
        padding: 1rem;

        h4 {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }
      }

      .color-roles {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }

      .color-role {
        padding: 0.75rem 0.5rem;
        border-radius: var(--ax-radius-sm);
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
          transform: scale(1.02);
        }
      }

      .role-name {
        font-size: 0.625rem;
        font-weight: 500;
        text-transform: capitalize;
        opacity: 0.9;
      }

      .role-value {
        font-family: monospace;
        font-size: 0.625rem;
        opacity: 0.75;
      }

      /* Palettes View */
      .palettes-view {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .palette-section {
        h4 {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }
      }

      .tonal-strip {
        display: flex;
        border-radius: var(--ax-radius-md);
        overflow: hidden;
      }

      .tone-cell {
        flex: 1;
        aspect-ratio: 1;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
          transform: scale(1.1);
          z-index: 1;
        }
      }

      .tone-label {
        font-size: 0.625rem;
        font-weight: 600;
      }

      /* Tones View */
      .tones-view {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .tones-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ax-text-secondary);
        }
      }

      .palette-select {
        padding: 0.5rem 1rem;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md);
        background: var(--ax-background-default);
        font-size: 0.875rem;
        color: var(--ax-text-primary);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--ax-brand-500);
        }
      }

      .tones-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.75rem;
      }

      .tone-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--ax-radius-md);
        overflow: hidden;
        border: 1px solid var(--ax-border-muted);
      }

      .tone-preview {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .tone-info {
        padding: 0.5rem;
        background: var(--ax-background-default);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
      }

      .tone-number {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .tone-hex {
        font-family: monospace;
        font-size: 0.625rem;
        color: var(--ax-text-secondary);
      }

      /* Export Section */
      .export-section {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid var(--ax-border-muted);
        flex-wrap: wrap;

        button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .m3-preview-header {
          flex-direction: column;
        }

        .color-roles {
          grid-template-columns: 1fr;
        }

        .tonal-strip {
          flex-wrap: wrap;
        }

        .tone-cell {
          min-width: 30px;
        }
      }
    `,
  ],
})
export class AxM3ColorPreviewComponent {
  /** Seed color (primary color from Theme Builder) */
  seedColor = input.required<string>();

  /** Emitted when user wants to apply M3 scheme to theme */
  schemeApplied = output<{ scheme: M3ColorScheme; mode: SchemeMode }>();

  /** Emitted when scheme is copied */
  schemeCopied = output<{ format: 'css' | 'scss'; content: string }>();

  // Internal state
  viewMode = signal<ViewMode>('scheme');
  schemeMode = signal<SchemeMode>('light');
  selectedPalette = signal<keyof M3CorePalettes>('primary');

  // Tone values for iteration
  readonly toneValues: ToneValue[] = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
  ];

  // Palette names
  readonly paletteNames: (keyof M3CorePalettes)[] = [
    'primary',
    'secondary',
    'tertiary',
    'neutral',
    'neutralVariant',
    'error',
  ];

  // Color categories for scheme view
  readonly colorCategories = getM3ColorRoleCategories();

  // Computed palettes
  corePalettes = computed(() => generateM3CorePalettes(this.seedColor()));

  // Computed color schemes
  colorSchemes = computed(() => generateM3ColorScheme(this.seedColor()));

  // Current scheme based on mode
  currentScheme = computed(() => {
    const schemes = this.colorSchemes();
    return this.schemeMode() === 'light' ? schemes.light : schemes.dark;
  });

  // Get seed text color for badge
  getSeedTextColor(): string {
    const rgb = this.hexToRgb(this.seedColor());
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Get color from current scheme
  getSchemeColor(role: keyof M3ColorScheme): string {
    return this.currentScheme()[role];
  }

  // Get text color for a given background
  getTextColorFor(bgColor: string): string {
    const rgb = this.hexToRgb(bgColor);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Get color tooltip
  getColorTooltip(role: keyof M3ColorScheme): string {
    const color = this.getSchemeColor(role);
    const bgRole = this.getBackgroundRoleFor(role);
    if (bgRole) {
      const bgColor = this.getSchemeColor(bgRole);
      const contrast = getContrastRatio(color, bgColor).toFixed(2);
      return `${color} | Contrast: ${contrast}:1`;
    }
    return color;
  }

  // Get background role for "on" colors
  private getBackgroundRoleFor(
    role: keyof M3ColorScheme,
  ): keyof M3ColorScheme | null {
    const mappings: Partial<Record<keyof M3ColorScheme, keyof M3ColorScheme>> =
      {
        onPrimary: 'primary',
        onPrimaryContainer: 'primaryContainer',
        onSecondary: 'secondary',
        onSecondaryContainer: 'secondaryContainer',
        onTertiary: 'tertiary',
        onTertiaryContainer: 'tertiaryContainer',
        onError: 'error',
        onErrorContainer: 'errorContainer',
        onSurface: 'surface',
        onSurfaceVariant: 'surfaceVariant',
        onBackground: 'background',
      };
    return mappings[role] || null;
  }

  // Format role name for display
  formatRoleName(role: string): string {
    return formatM3ColorName(role);
  }

  // Format palette name
  formatPaletteName(name: string): string {
    const names: Record<string, string> = {
      primary: 'Primary',
      secondary: 'Secondary',
      tertiary: 'Tertiary',
      neutral: 'Neutral',
      neutralVariant: 'Neutral Variant',
      error: 'Error',
    };
    return names[name] || name;
  }

  // Get palette color
  getPaletteColor(paletteName: keyof M3CorePalettes, tone: ToneValue): string {
    return this.corePalettes()[paletteName][tone];
  }

  // Get selected palette color
  getSelectedPaletteColor(tone: ToneValue): string {
    return this.corePalettes()[this.selectedPalette()][tone];
  }

  // Handle palette selection
  onPaletteSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPalette.set(select.value as keyof M3CorePalettes);
  }

  // Copy scheme to clipboard
  copyScheme(format: 'css' | 'scss'): void {
    const scheme = this.currentScheme();
    const content = this.generateExportContent(scheme, format);

    navigator.clipboard.writeText(content).then(() => {
      this.schemeCopied.emit({ format, content });
    });
  }

  // Generate export content
  private generateExportContent(
    scheme: M3ColorScheme,
    format: 'css' | 'scss',
  ): string {
    const prefix = format === 'scss' ? '$m3-' : '--m3-';
    const lines: string[] = [];

    if (format === 'css') {
      lines.push(':root {');
    }

    for (const [key, value] of Object.entries(scheme)) {
      const varName = this.toKebabCase(key);
      if (format === 'scss') {
        lines.push(`${prefix}${varName}: ${value};`);
      } else {
        lines.push(`  ${prefix}${varName}: ${value};`);
      }
    }

    if (format === 'css') {
      lines.push('}');
    }

    return lines.join('\n');
  }

  // Apply scheme to theme
  applyToTheme(): void {
    this.schemeApplied.emit({
      scheme: this.currentScheme(),
      mode: this.schemeMode(),
    });
  }

  // Helper: hex to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  // Helper: camelCase to kebab-case
  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
