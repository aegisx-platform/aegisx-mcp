/**
 * M3 Color Scheme Preview Component
 *
 * Google Material Theme Builder-style UI for M3 color scheme preview.
 * Shows Primary, Secondary, Tertiary palettes with large color blocks
 * and full-width tonal palette strips.
 */
import { Component, computed, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import {
  generateM3CorePalettes,
  generateM3ColorScheme,
  EXTENDED_TONES,
  type M3CorePalettes,
  type M3ColorScheme,
  type ToneValue,
} from './m3-color.util';
import {
  AxCodeTabsComponent,
  type CodeTab,
} from '../code-tabs/code-tabs.component';

type ViewMode = 'scheme' | 'palettes';
type SchemeMode = 'light' | 'dark';

@Component({
  selector: 'ax-m3-color-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonToggleModule,
    AxCodeTabsComponent,
  ],
  template: `
    <div class="m3-preview">
      <!-- Header -->
      <div class="m3-header">
        <div class="header-left">
          <h3>Material Design 3 Colors</h3>
          <div class="seed-info">
            <span class="label">Source color:</span>
            <span
              class="seed-badge"
              [style.background]="seedColor()"
              [style.color]="getTextColorFor(seedColor())"
            >
              {{ seedColor() }}
            </span>
          </div>
        </div>

        <div class="header-controls">
          <mat-button-toggle-group
            [value]="viewMode()"
            (change)="viewMode.set($event.value)"
            class="view-toggle"
          >
            <mat-button-toggle value="scheme">Key Colors</mat-button-toggle>
            <mat-button-toggle value="palettes"
              >Tonal Palettes</mat-button-toggle
            >
          </mat-button-toggle-group>
        </div>
      </div>

      <!-- Scheme View (Key Colors) -->
      @if (viewMode() === 'scheme') {
        <div
          class="scheme-view"
          [class.light-mode]="schemeMode() === 'light'"
          [class.dark-mode]="schemeMode() === 'dark'"
          [style.background]="currentScheme().surface"
        >
          <!-- Light/Dark Toggle -->
          <div class="mode-toggle">
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

          <!-- 4-Column Color Grid (Google-style color pairs) -->
          <div class="color-grid-4col">
            <!-- Primary Column -->
            <div class="color-column">
              <!-- Primary + On Primary pair -->
              <div class="color-pair">
                <div
                  class="color-block main"
                  [style.background]="currentScheme().primary"
                >
                  <span [style.color]="currentScheme().onPrimary">Primary</span>
                </div>
                <div
                  class="color-block on"
                  [style.background]="currentScheme().onPrimary"
                >
                  <span [style.color]="currentScheme().primary"
                    >On Primary</span
                  >
                </div>
              </div>
              <!-- Primary Container + On Primary Container pair -->
              <div class="color-pair">
                <div
                  class="color-block container"
                  [style.background]="currentScheme().primaryContainer"
                >
                  <span [style.color]="currentScheme().onPrimaryContainer"
                    >Primary Container</span
                  >
                </div>
                <div
                  class="color-block on-container"
                  [style.background]="currentScheme().onPrimaryContainer"
                >
                  <span [style.color]="currentScheme().primaryContainer"
                    >On Primary Container</span
                  >
                </div>
              </div>
            </div>

            <!-- Secondary Column -->
            <div class="color-column">
              <!-- Secondary + On Secondary pair -->
              <div class="color-pair">
                <div
                  class="color-block main"
                  [style.background]="currentScheme().secondary"
                >
                  <span [style.color]="currentScheme().onSecondary"
                    >Secondary</span
                  >
                </div>
                <div
                  class="color-block on"
                  [style.background]="currentScheme().onSecondary"
                >
                  <span [style.color]="currentScheme().secondary"
                    >On Secondary</span
                  >
                </div>
              </div>
              <!-- Secondary Container + On Secondary Container pair -->
              <div class="color-pair">
                <div
                  class="color-block container"
                  [style.background]="currentScheme().secondaryContainer"
                >
                  <span [style.color]="currentScheme().onSecondaryContainer"
                    >Secondary Container</span
                  >
                </div>
                <div
                  class="color-block on-container"
                  [style.background]="currentScheme().onSecondaryContainer"
                >
                  <span [style.color]="currentScheme().secondaryContainer"
                    >On Secondary Container</span
                  >
                </div>
              </div>
            </div>

            <!-- Tertiary Column -->
            <div class="color-column">
              <!-- Tertiary + On Tertiary pair -->
              <div class="color-pair">
                <div
                  class="color-block main"
                  [style.background]="currentScheme().tertiary"
                >
                  <span [style.color]="currentScheme().onTertiary"
                    >Tertiary</span
                  >
                </div>
                <div
                  class="color-block on"
                  [style.background]="currentScheme().onTertiary"
                >
                  <span [style.color]="currentScheme().tertiary"
                    >On Tertiary</span
                  >
                </div>
              </div>
              <!-- Tertiary Container + On Tertiary Container pair -->
              <div class="color-pair">
                <div
                  class="color-block container"
                  [style.background]="currentScheme().tertiaryContainer"
                >
                  <span [style.color]="currentScheme().onTertiaryContainer"
                    >Tertiary Container</span
                  >
                </div>
                <div
                  class="color-block on-container"
                  [style.background]="currentScheme().onTertiaryContainer"
                >
                  <span [style.color]="currentScheme().tertiaryContainer"
                    >On Tertiary Container</span
                  >
                </div>
              </div>
            </div>

            <!-- Error Column -->
            <div class="color-column">
              <!-- Error + On Error pair -->
              <div class="color-pair">
                <div
                  class="color-block main"
                  [style.background]="currentScheme().error"
                >
                  <span [style.color]="currentScheme().onError">Error</span>
                </div>
                <div
                  class="color-block on"
                  [style.background]="currentScheme().onError"
                >
                  <span [style.color]="currentScheme().error">On Error</span>
                </div>
              </div>
              <!-- Error Container + On Error Container pair -->
              <div class="color-pair">
                <div
                  class="color-block container"
                  [style.background]="currentScheme().errorContainer"
                >
                  <span [style.color]="currentScheme().onErrorContainer"
                    >Error Container</span
                  >
                </div>
                <div
                  class="color-block on-container"
                  [style.background]="currentScheme().onErrorContainer"
                >
                  <span [style.color]="currentScheme().errorContainer"
                    >On Error Container</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Surface Colors Row -->
          <div class="surface-section">
            <h4 [style.color]="currentScheme().onSurface">Surface Colors</h4>
            <div class="surface-row">
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceDim"
                [matTooltip]="'Surface Dim: ' + currentScheme().surfaceDim"
              >
                <span
                  [style.color]="getTextColorFor(currentScheme().surfaceDim)"
                >
                  Dim
                </span>
              </div>
              <div
                class="surface-block"
                [style.background]="currentScheme().surface"
                [matTooltip]="'Surface: ' + currentScheme().surface"
              >
                <span [style.color]="getTextColorFor(currentScheme().surface)">
                  Surface
                </span>
              </div>
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceBright"
                [matTooltip]="
                  'Surface Bright: ' + currentScheme().surfaceBright
                "
              >
                <span
                  [style.color]="getTextColorFor(currentScheme().surfaceBright)"
                >
                  Bright
                </span>
              </div>
            </div>

            <div class="surface-row">
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceContainerLowest"
                [matTooltip]="
                  'Container Lowest: ' + currentScheme().surfaceContainerLowest
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().surfaceContainerLowest)
                  "
                >
                  Lowest
                </span>
              </div>
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceContainerLow"
                [matTooltip]="
                  'Container Low: ' + currentScheme().surfaceContainerLow
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().surfaceContainerLow)
                  "
                >
                  Low
                </span>
              </div>
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceContainer"
                [matTooltip]="'Container: ' + currentScheme().surfaceContainer"
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().surfaceContainer)
                  "
                >
                  Container
                </span>
              </div>
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceContainerHigh"
                [matTooltip]="
                  'Container High: ' + currentScheme().surfaceContainerHigh
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().surfaceContainerHigh)
                  "
                >
                  High
                </span>
              </div>
              <div
                class="surface-block"
                [style.background]="currentScheme().surfaceContainerHighest"
                [matTooltip]="
                  'Container Highest: ' +
                  currentScheme().surfaceContainerHighest
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().surfaceContainerHighest)
                  "
                >
                  Highest
                </span>
              </div>
            </div>
          </div>

          <!-- Outline & Inverse -->
          <div class="other-colors">
            <div class="color-row">
              <div
                class="small-block"
                [style.background]="currentScheme().outline"
                [matTooltip]="'Outline: ' + currentScheme().outline"
              >
                <span [style.color]="getTextColorFor(currentScheme().outline)">
                  Outline
                </span>
              </div>
              <div
                class="small-block"
                [style.background]="currentScheme().outlineVariant"
                [matTooltip]="
                  'Outline Variant: ' + currentScheme().outlineVariant
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().outlineVariant)
                  "
                >
                  Outline Variant
                </span>
              </div>
              <div
                class="small-block"
                [style.background]="currentScheme().inverseSurface"
                [matTooltip]="
                  'Inverse Surface: ' + currentScheme().inverseSurface
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().inverseSurface)
                  "
                >
                  Inverse Surface
                </span>
              </div>
              <div
                class="small-block"
                [style.background]="currentScheme().inversePrimary"
                [matTooltip]="
                  'Inverse Primary: ' + currentScheme().inversePrimary
                "
              >
                <span
                  [style.color]="
                    getTextColorFor(currentScheme().inversePrimary)
                  "
                >
                  Inverse Primary
                </span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tonal Palettes View -->
      @if (viewMode() === 'palettes') {
        <div class="palettes-view">
          @for (palette of paletteEntries; track palette.name) {
            <div class="palette-row">
              <div class="palette-label">{{ palette.label }}</div>
              <div class="tonal-strip">
                @for (tone of extendedTones; track tone) {
                  <div
                    class="tone-cell"
                    [style.background]="getPaletteColor(palette.name, tone)"
                    [matTooltip]="
                      'Tone ' +
                      tone +
                      ': ' +
                      getPaletteColor(palette.name, tone)
                    "
                  >
                    <span
                      class="tone-number"
                      [style.color]="
                        getTextColorFor(getPaletteColor(palette.name, tone))
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

      <!-- Export Actions -->
      <div class="export-section">
        <div class="export-buttons">
          <button
            mat-stroked-button
            (click)="showCodePreview.set(!showCodePreview())"
          >
            <mat-icon>{{
              showCodePreview() ? 'visibility_off' : 'visibility'
            }}</mat-icon>
            {{ showCodePreview() ? 'Hide Code' : 'Preview Code' }}
          </button>
          <button mat-stroked-button (click)="copyScheme('css')">
            <mat-icon>content_copy</mat-icon>
            Copy CSS
          </button>
          <button mat-flat-button color="primary" (click)="applyToTheme()">
            <mat-icon>check</mat-icon>
            Apply to Theme
          </button>
        </div>

        <!-- Code Preview using ax-code-tabs -->
        @if (showCodePreview()) {
          <ax-code-tabs [tabs]="codeTabs()"></ax-code-tabs>
        }
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

      /* Header */
      .m3-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-left {
        h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }
      }

      .seed-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .label {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .seed-badge {
        padding: 0.25rem 0.75rem;
        border-radius: var(--ax-radius-md);
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .view-toggle {
        ::ng-deep {
          .mat-button-toggle-button {
            height: 40px;
          }
          .mat-button-toggle-label-content {
            padding: 0 1rem;
            font-size: 0.875rem;
          }
        }
      }

      /* Scheme View */
      .scheme-view {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        border-radius: var(--ax-radius-xl);
        transition: background-color 0.3s ease;
      }

      .mode-toggle {
        display: flex;
        justify-content: center;

        ::ng-deep {
          .mat-button-toggle-label-content {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0 1rem;
          }
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }

      /* 4-Column Color Grid (Google-style paired colors) */
      .color-grid-4col {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
      }

      .color-column {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      /* Color pair container - groups main + on colors together */
      .color-pair {
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      .color-block {
        padding: 1rem 0.875rem;
        display: flex;
        align-items: flex-start;
        cursor: pointer;
        transition: filter 0.15s ease;

        &:hover {
          filter: brightness(1.05);
        }

        span {
          font-size: 0.8125rem;
          font-weight: 500;
        }

        /* Main color block - larger */
        &.main {
          min-height: 72px;
        }

        /* On color block - smaller, attached to main */
        &.on {
          min-height: 40px;
        }

        /* Container block - larger */
        &.container {
          min-height: 72px;
        }

        /* On container block - smaller */
        &.on-container {
          min-height: 40px;
        }
      }

      /* Surface Colors */
      .surface-section {
        h4 {
          margin: 0 0 0.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }
      }

      .surface-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .surface-block {
        flex: 1;
        padding: 1rem 0.75rem;
        border-radius: var(--ax-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
          transform: scale(1.02);
        }

        span {
          font-size: 0.75rem;
          font-weight: 500;
        }
      }

      /* Other Colors (Outline, Inverse) */
      .other-colors {
        padding-top: 0.5rem;
      }

      .color-row {
        display: flex;
        gap: 0.5rem;
      }

      .small-block {
        flex: 1;
        padding: 0.875rem 0.5rem;
        border-radius: var(--ax-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
          transform: scale(1.02);
        }

        span {
          font-size: 0.6875rem;
          font-weight: 500;
          text-align: center;
        }
      }

      /* Tonal Palettes View (Google-style full-width strips) */
      .palettes-view {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .palette-row {
        display: flex;
        align-items: stretch;
        gap: 0.75rem;
      }

      .palette-label {
        width: 100px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--ax-text-secondary);
      }

      .tonal-strip {
        flex: 1;
        display: flex;
        border-radius: var(--ax-radius-md);
        overflow: hidden;
      }

      .tone-cell {
        flex: 1;
        min-width: 0;
        aspect-ratio: 1;
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;
        position: relative;

        &:hover {
          transform: scale(1.15);
          z-index: 1;
          border-radius: var(--ax-radius-sm);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      }

      .tone-number {
        font-size: 0.625rem;
        font-weight: 600;
        opacity: 0.9;
      }

      /* Export Section */
      .export-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--ax-border-muted);
      }

      .export-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        flex-wrap: wrap;

        button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .color-grid-4col {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .m3-header {
          flex-direction: column;
        }

        .color-grid-4col {
          grid-template-columns: 1fr;
        }

        .palette-row {
          flex-direction: column;
          gap: 0.25rem;
        }

        .palette-label {
          width: auto;
        }

        .tonal-strip {
          flex-wrap: wrap;
        }

        .tone-cell {
          min-width: calc(100% / 9);
          aspect-ratio: 1;
        }

        .surface-row,
        .color-row {
          flex-wrap: wrap;
        }

        .surface-block,
        .small-block {
          min-width: calc(50% - 0.25rem);
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
  showCodePreview = signal<boolean>(false);

  // Extended tones for Google-style palette view
  readonly extendedTones: ToneValue[] = EXTENDED_TONES;

  // Palette entries for iteration
  readonly paletteEntries: { name: keyof M3CorePalettes; label: string }[] = [
    { name: 'primary', label: 'Primary' },
    { name: 'secondary', label: 'Secondary' },
    { name: 'tertiary', label: 'Tertiary' },
    { name: 'neutral', label: 'Neutral' },
    { name: 'neutralVariant', label: 'Neutral Variant' },
    { name: 'error', label: 'Error' },
  ];

  // Computed palettes
  corePalettes = computed(() => generateM3CorePalettes(this.seedColor()));

  // Computed color schemes
  colorSchemes = computed(() => generateM3ColorScheme(this.seedColor()));

  // Current scheme based on mode
  currentScheme = computed(() => {
    const schemes = this.colorSchemes();
    return this.schemeMode() === 'light' ? schemes.light : schemes.dark;
  });

  // Code tabs for preview (CSS and SCSS)
  codeTabs = computed<CodeTab[]>(() => {
    const scheme = this.currentScheme();
    const mode = this.schemeMode() === 'light' ? 'Light' : 'Dark';
    return [
      {
        label: `CSS (${mode})`,
        code: this.generateExportContent(scheme, 'css'),
        language: 'scss', // Use scss for syntax highlighting (css not in CodeLanguage type)
      },
      {
        label: `SCSS (${mode})`,
        code: this.generateExportContent(scheme, 'scss'),
        language: 'scss',
      },
    ];
  });

  // Get text color for a given background
  getTextColorFor(bgColor: string): string {
    const rgb = this.hexToRgb(bgColor);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Get palette color by name and tone
  getPaletteColor(paletteName: keyof M3CorePalettes, tone: ToneValue): string {
    return this.corePalettes()[paletteName][tone];
  }

  // Copy scheme to clipboard
  copyScheme(format: 'css' | 'scss'): void {
    const scheme = this.currentScheme();
    const content = this.generateExportContent(scheme, format);

    navigator.clipboard.writeText(content).then(() => {
      this.schemeCopied.emit({ format, content });
    });
  }

  // Generate export content as AegisX theme variables
  private generateExportContent(
    scheme: M3ColorScheme,
    format: 'css' | 'scss',
  ): string {
    const lines: string[] = [];
    const mode = this.schemeMode();
    const indent = format === 'css' ? '  ' : '';
    const prefix = format === 'scss' ? '$ax-' : '--ax-';

    // Add header comment
    if (format === 'scss') {
      lines.push(
        `// AegisX Theme - ${mode === 'light' ? 'Light' : 'Dark'} Mode`,
      );
      lines.push(`// Generated from M3 Color Scheme`);
      lines.push('');
    } else {
      lines.push(
        `/* AegisX Theme - ${mode === 'light' ? 'Light' : 'Dark'} Mode */`,
      );
      lines.push(`/* Generated from M3 Color Scheme */`);
      lines.push('');
      lines.push('[data-theme="custom"] {');
    }

    // PRIMARY / BRAND
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}PRIMARY / BRAND${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}primary: ${scheme.primary};`);
    lines.push(`${indent}${prefix}primary-light: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}primary-dark: ${scheme.onPrimaryContainer};`);
    lines.push(`${indent}${prefix}primary-contrast: ${scheme.onPrimary};`);
    lines.push('');
    lines.push(`${indent}${prefix}brand-default: ${scheme.primary};`);
    lines.push(
      `${indent}${prefix}brand-emphasis: ${scheme.onPrimaryContainer};`,
    );
    lines.push(`${indent}${prefix}brand-muted: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}brand-faint: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}brand-surface: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}brand-border: ${scheme.outline};`);
    lines.push('');

    // BACKGROUNDS
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}BACKGROUNDS${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}background-default: ${scheme.surface};`);
    lines.push(
      `${indent}${prefix}background-subtle: ${scheme.surfaceContainerLow};`,
    );
    lines.push(
      `${indent}${prefix}background-muted: ${scheme.surfaceContainerLowest};`,
    );
    lines.push(
      `${indent}${prefix}background-emphasis: ${scheme.inverseSurface};`,
    );
    lines.push(`${indent}${prefix}background-page: ${scheme.surfaceDim};`);
    lines.push(`${indent}${prefix}white: ${scheme.surface};`);
    lines.push('');

    // TEXT
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}TEXT${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}text-default: ${scheme.onSurface};`);
    lines.push(`${indent}${prefix}text-primary: ${scheme.onSurface};`);
    lines.push(`${indent}${prefix}text-secondary: ${scheme.onSurfaceVariant};`);
    lines.push(`${indent}${prefix}text-subtle: ${scheme.outline};`);
    lines.push(`${indent}${prefix}text-disabled: ${scheme.outlineVariant};`);
    lines.push(`${indent}${prefix}text-heading: ${scheme.onSurface};`);
    lines.push(`${indent}${prefix}text-strong: ${scheme.onSurface};`);
    lines.push(`${indent}${prefix}text-inverse: ${scheme.inverseOnSurface};`);
    lines.push('');

    // BORDERS
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}BORDERS${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}border-default: ${scheme.outline};`);
    lines.push(`${indent}${prefix}border-emphasis: ${scheme.outline};`);
    lines.push(`${indent}${prefix}border-subtle: ${scheme.outlineVariant};`);
    lines.push(`${indent}${prefix}border-color: ${scheme.outline};`);
    lines.push('');

    // ERROR (from M3 error colors)
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}ERROR${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}error-default: ${scheme.error};`);
    lines.push(`${indent}${prefix}error-emphasis: ${scheme.onErrorContainer};`);
    lines.push(`${indent}${prefix}error-faint: ${scheme.errorContainer};`);
    lines.push(`${indent}${prefix}error-muted: ${scheme.errorContainer};`);
    lines.push(`${indent}${prefix}error-surface: ${scheme.errorContainer};`);
    lines.push(`${indent}${prefix}error-border: ${scheme.error};`);
    lines.push('');

    // SECONDARY (for success-like semantics)
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}SUCCESS (derived from Secondary)${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}success-default: ${scheme.secondary};`);
    lines.push(
      `${indent}${prefix}success-emphasis: ${scheme.onSecondaryContainer};`,
    );
    lines.push(
      `${indent}${prefix}success-faint: ${scheme.secondaryContainer};`,
    );
    lines.push(
      `${indent}${prefix}success-muted: ${scheme.secondaryContainer};`,
    );
    lines.push(
      `${indent}${prefix}success-surface: ${scheme.secondaryContainer};`,
    );
    lines.push(`${indent}${prefix}success-border: ${scheme.secondary};`);
    lines.push(`${indent}${prefix}success: ${scheme.secondary};`);
    lines.push('');

    // TERTIARY (for warning-like semantics)
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}WARNING (derived from Tertiary)${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}warning-default: ${scheme.tertiary};`);
    lines.push(
      `${indent}${prefix}warning-emphasis: ${scheme.onTertiaryContainer};`,
    );
    lines.push(`${indent}${prefix}warning-faint: ${scheme.tertiaryContainer};`);
    lines.push(`${indent}${prefix}warning-muted: ${scheme.tertiaryContainer};`);
    lines.push(
      `${indent}${prefix}warning-surface: ${scheme.tertiaryContainer};`,
    );
    lines.push(`${indent}${prefix}warning-border: ${scheme.tertiary};`);
    lines.push('');

    // INFO (derived from Primary variant)
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}INFO (derived from Primary)${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}info-default: ${scheme.primary};`);
    lines.push(
      `${indent}${prefix}info-emphasis: ${scheme.onPrimaryContainer};`,
    );
    lines.push(`${indent}${prefix}info-faint: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}info-muted: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}info-surface: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}info-border: ${scheme.primary};`);
    lines.push('');

    // SURFACE VARIANTS (M3 specific)
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}SURFACE VARIANTS${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}surface: ${scheme.surface};`);
    lines.push(`${indent}${prefix}surface-variant: ${scheme.surfaceVariant};`);
    lines.push(
      `${indent}${prefix}surface-container: ${scheme.surfaceContainer};`,
    );
    lines.push(
      `${indent}${prefix}surface-container-high: ${scheme.surfaceContainerHigh};`,
    );
    lines.push(
      `${indent}${prefix}surface-container-highest: ${scheme.surfaceContainerHighest};`,
    );
    lines.push(`${indent}${prefix}surface-bright: ${scheme.surfaceBright};`);
    lines.push(`${indent}${prefix}surface-dim: ${scheme.surfaceDim};`);
    lines.push('');

    // NAVIGATION
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}NAVIGATION${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}nav-bg: ${scheme.surface};`);
    lines.push(`${indent}${prefix}nav-text: ${scheme.onSurfaceVariant};`);
    lines.push(`${indent}${prefix}nav-text-active: ${scheme.primary};`);
    lines.push(`${indent}${prefix}nav-hover: ${scheme.surfaceContainerLow};`);
    lines.push(`${indent}${prefix}nav-active: ${scheme.primaryContainer};`);
    lines.push(`${indent}${prefix}nav-border: ${scheme.outlineVariant};`);
    lines.push('');

    // INVERSE
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}INVERSE${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}inverse-surface: ${scheme.inverseSurface};`);
    lines.push(
      `${indent}${prefix}inverse-on-surface: ${scheme.inverseOnSurface};`,
    );
    lines.push(`${indent}${prefix}inverse-primary: ${scheme.inversePrimary};`);
    lines.push('');

    // SHADOWS & EFFECTS
    lines.push(
      `${indent}${format === 'scss' ? '// ' : '/* '}SHADOWS${format === 'scss' ? '' : ' */'}`,
    );
    lines.push(`${indent}${prefix}shadow: ${scheme.shadow};`);
    lines.push(`${indent}${prefix}scrim: ${scheme.scrim};`);

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
