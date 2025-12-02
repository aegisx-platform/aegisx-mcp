import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExtractedPalette, generateColorShades } from './color-extraction.util';
import { AxColorPaletteEditorComponent } from './color-palette-editor.component';
import { AxImageColorExtractorComponent } from './image-color-extractor.component';
import { AxThemePreviewPanelComponent } from './preview-panel.component';
import { ThemeBuilderService } from './theme-builder.service';
import {
  ColorShade,
  ExportFormat,
  SemanticColorName,
  ThemePreset,
  ThemeSection,
} from './theme-builder.types';

@Component({
  selector: 'ax-theme-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatSliderModule,
    AxColorPaletteEditorComponent,
    AxThemePreviewPanelComponent,
    AxImageColorExtractorComponent,
  ],
  template: `
    <div class="theme-builder">
      <!-- Header -->
      <header class="theme-builder-header">
        <div class="header-left">
          <mat-icon class="logo-icon">palette</mat-icon>
          <div class="header-title">
            <h1>Theme Builder</h1>
            <span class="theme-name">{{
              themeService.currentTheme().name
            }}</span>
          </div>
        </div>

        <div class="header-actions">
          <!-- Preset Selector -->
          <mat-form-field appearance="outline" class="preset-selector">
            <mat-label>Theme Preset</mat-label>
            <mat-select
              [value]="selectedPresetId()"
              (selectionChange)="onPresetChange($event.value)"
            >
              @for (preset of presets; track preset.id) {
                <mat-option [value]="preset.id">
                  {{ preset.name }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- Export Menu -->
          <button mat-stroked-button [matMenuTriggerFor]="exportMenu">
            <mat-icon>download</mat-icon>
            Export
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportTheme('scss')">
              <mat-icon>code</mat-icon>
              <span>Export as SCSS</span>
            </button>
            <button mat-menu-item (click)="exportTheme('css')">
              <mat-icon>css</mat-icon>
              <span>Export as CSS</span>
            </button>
            <button mat-menu-item (click)="exportTheme('json')">
              <mat-icon>data_object</mat-icon>
              <span>Export as JSON</span>
            </button>
            <button mat-menu-item (click)="exportTheme('tailwind')">
              <mat-icon>extension</mat-icon>
              <span>Export for Tailwind</span>
            </button>
          </mat-menu>

          <!-- Apply Theme -->
          <button mat-flat-button color="primary" (click)="applyTheme()">
            <mat-icon>check</mat-icon>
            Apply Theme
          </button>

          <!-- Reset -->
          <button
            mat-icon-button
            matTooltip="Reset to default"
            (click)="resetTheme()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="theme-builder-content">
        <!-- Sidebar Navigation -->
        <nav class="theme-builder-sidebar">
          <button
            class="nav-item"
            [class.active]="activeSection() === 'colors'"
            (click)="setActiveSection('colors')"
          >
            <mat-icon>palette</mat-icon>
            <span>Colors</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'image-extractor'"
            (click)="setActiveSection('image-extractor')"
          >
            <mat-icon>image</mat-icon>
            <span>Extract Colors</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'typography'"
            (click)="setActiveSection('typography')"
          >
            <mat-icon>text_fields</mat-icon>
            <span>Typography</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'spacing'"
            (click)="setActiveSection('spacing')"
          >
            <mat-icon>space_bar</mat-icon>
            <span>Spacing</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'radius'"
            (click)="setActiveSection('radius')"
          >
            <mat-icon>rounded_corner</mat-icon>
            <span>Border Radius</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'shadows'"
            (click)="setActiveSection('shadows')"
          >
            <mat-icon>blur_on</mat-icon>
            <span>Shadows</span>
          </button>
        </nav>

        <!-- Editor Area -->
        <main class="theme-builder-editor">
          <!-- Image Color Extractor Section -->
          @if (activeSection() === 'image-extractor') {
            <div class="section-content">
              <ax-image-color-extractor
                (colorsExtracted)="onColorsExtracted($event)"
                (paletteApplied)="onPaletteApplied($event)"
                (dominantColorApplied)="onDominantColorApplied($event)"
              />
            </div>
          }

          <!-- Colors Section -->
          @if (activeSection() === 'colors') {
            <div class="section-content">
              <div class="section-header">
                <h2>Color Palettes</h2>
                <p class="section-description">
                  Customize your color palettes. Each color has 10 shades from
                  50 (lightest) to 900 (darkest). The 500 shade is the main
                  color.
                </p>
              </div>

              <div class="color-editors">
                @for (colorName of colorNames; track colorName) {
                  <ax-color-palette-editor
                    [colorName]="colorName"
                    [palette]="themeService.currentTheme().colors[colorName]"
                    (colorChange)="
                      onColorChange(colorName, $event.shade, $event.value)
                    "
                    (generatePalette)="onGeneratePalette(colorName, $event)"
                  />
                }
              </div>

              <!-- Background & Text Colors -->
              <div class="semantic-colors">
                <h3>Background Colors</h3>
                <div class="color-row">
                  @for (bg of backgroundKeys; track bg) {
                    <div class="color-item">
                      <label>{{ formatLabel(bg) }}</label>
                      <div class="color-input-wrapper">
                        <input
                          type="color"
                          [value]="themeService.currentTheme().background[bg]"
                          (input)="onBackgroundChange(bg, $event)"
                        />
                        <input
                          type="text"
                          [value]="themeService.currentTheme().background[bg]"
                          (blur)="onBackgroundHexInput(bg, $event)"
                          maxlength="7"
                        />
                      </div>
                    </div>
                  }
                </div>

                <h3>Text Colors</h3>
                <div class="color-row">
                  @for (text of textKeys; track text) {
                    <div class="color-item">
                      <label>{{ formatLabel(text) }}</label>
                      <div class="color-input-wrapper">
                        <input
                          type="color"
                          [value]="themeService.currentTheme().text[text]"
                          (input)="onTextChange(text, $event)"
                        />
                        <input
                          type="text"
                          [value]="themeService.currentTheme().text[text]"
                          (blur)="onTextHexInput(text, $event)"
                          maxlength="7"
                        />
                      </div>
                    </div>
                  }
                </div>

                <h3>Border Colors</h3>
                <div class="color-row">
                  @for (border of borderKeys; track border) {
                    <div class="color-item">
                      <label>{{ formatLabel(border) }}</label>
                      <div class="color-input-wrapper">
                        <input
                          type="color"
                          [value]="themeService.currentTheme().border[border]"
                          (input)="onBorderChange(border, $event)"
                        />
                        <input
                          type="text"
                          [value]="themeService.currentTheme().border[border]"
                          (blur)="onBorderHexInput(border, $event)"
                          maxlength="7"
                        />
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Typography Section -->
          @if (activeSection() === 'typography') {
            <div class="section-content">
              <div class="section-header">
                <h2>Typography</h2>
                <p class="section-description">
                  Configure font family, sizes, weights, and line heights for
                  consistent typography.
                </p>
              </div>

              <div class="typography-editor">
                <div class="typography-group">
                  <h3>Font Family</h3>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Primary Font</mat-label>
                    <input
                      matInput
                      [value]="
                        themeService.currentTheme().typography.fontFamily
                      "
                      (blur)="onFontFamilyChange($event)"
                    />
                  </mat-form-field>
                </div>

                <div class="typography-group">
                  <h3>Font Sizes</h3>
                  <div class="slider-grid">
                    @for (size of fontSizeKeys; track size) {
                      <div class="slider-item">
                        <div class="slider-header">
                          <span class="slider-label">{{ size }}</span>
                          <span class="slider-value">{{
                            themeService.currentTheme().typography.fontSize[
                              size
                            ]
                          }}</span>
                        </div>
                        <mat-slider
                          [min]="0.5"
                          [max]="4"
                          [step]="0.0625"
                          [displayWith]="formatRem"
                          class="full-width-slider"
                        >
                          <input
                            matSliderThumb
                            [ngModel]="
                              parseRemValue(
                                themeService.currentTheme().typography.fontSize[
                                  size
                                ]
                              )
                            "
                            (ngModelChange)="
                              onFontSizeSliderChange(size, $event)
                            "
                          />
                        </mat-slider>
                        <span
                          class="size-preview"
                          [style.font-size]="
                            themeService.currentTheme().typography.fontSize[
                              size
                            ]
                          "
                        >
                          Aa
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <div class="typography-group">
                  <h3>Font Weights</h3>
                  <div class="slider-grid">
                    @for (weight of fontWeightKeys; track weight) {
                      <div class="slider-item">
                        <div class="slider-header">
                          <span class="slider-label">{{ weight }}</span>
                          <span class="slider-value">{{
                            themeService.currentTheme().typography.fontWeight[
                              weight
                            ]
                          }}</span>
                        </div>
                        <mat-slider
                          [min]="100"
                          [max]="900"
                          [step]="100"
                          class="full-width-slider"
                        >
                          <input
                            matSliderThumb
                            [ngModel]="
                              themeService.currentTheme().typography.fontWeight[
                                weight
                              ]
                            "
                            (ngModelChange)="
                              onFontWeightSliderChange(weight, $event)
                            "
                          />
                        </mat-slider>
                        <span
                          class="weight-preview"
                          [style.font-weight]="
                            themeService.currentTheme().typography.fontWeight[
                              weight
                            ]
                          "
                        >
                          Abc
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <div class="typography-group">
                  <h3>Line Heights</h3>
                  <div class="slider-grid">
                    @for (lh of lineHeightKeys; track lh) {
                      <div class="slider-item">
                        <div class="slider-header">
                          <span class="slider-label">{{ lh }}</span>
                          <span class="slider-value">{{
                            themeService.currentTheme().typography.lineHeight[
                              lh
                            ]
                          }}</span>
                        </div>
                        <mat-slider
                          [min]="1"
                          [max]="2.5"
                          [step]="0.05"
                          class="full-width-slider"
                        >
                          <input
                            matSliderThumb
                            [ngModel]="
                              themeService.currentTheme().typography.lineHeight[
                                lh
                              ]
                            "
                            (ngModelChange)="
                              onLineHeightSliderChange(lh, $event)
                            "
                          />
                        </mat-slider>
                        <div class="line-height-preview">
                          <span
                            [style.line-height]="
                              themeService.currentTheme().typography.lineHeight[
                                lh
                              ]
                            "
                          >
                            Line 1<br />Line 2
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Spacing Section -->
          @if (activeSection() === 'spacing') {
            <div class="section-content">
              <div class="section-header">
                <h2>Spacing Scale</h2>
                <p class="section-description">
                  Define your spacing scale for consistent margins, paddings,
                  and gaps.
                </p>
              </div>

              <div class="slider-grid spacing-grid">
                @for (space of spacingKeys; track space) {
                  <div class="slider-item">
                    <div class="slider-header">
                      <span class="slider-label">{{ space }}</span>
                      <span class="slider-value">{{
                        themeService.currentTheme().spacing[space]
                      }}</span>
                    </div>
                    <mat-slider
                      [min]="0"
                      [max]="6"
                      [step]="0.125"
                      [displayWith]="formatRem"
                      class="full-width-slider"
                    >
                      <input
                        matSliderThumb
                        [ngModel]="
                          parseRemValue(
                            themeService.currentTheme().spacing[space]
                          )
                        "
                        (ngModelChange)="onSpacingSliderChange(space, $event)"
                      />
                    </mat-slider>
                    <div
                      class="spacing-preview"
                      [style.width]="themeService.currentTheme().spacing[space]"
                      [style.height]="
                        themeService.currentTheme().spacing[space]
                      "
                    ></div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Border Radius Section -->
          @if (activeSection() === 'radius') {
            <div class="section-content">
              <div class="section-header">
                <h2>Border Radius</h2>
                <p class="section-description">
                  Configure border radius values for rounded corners.
                </p>
              </div>

              <div class="slider-grid radius-grid">
                @for (radius of radiusKeys; track radius) {
                  <div class="slider-item">
                    <div class="slider-header">
                      <span class="slider-label">{{ radius }}</span>
                      <span class="slider-value">{{
                        themeService.currentTheme().radius[radius]
                      }}</span>
                    </div>
                    @if (radius !== 'full') {
                      <mat-slider
                        [min]="0"
                        [max]="2"
                        [step]="0.0625"
                        [displayWith]="formatRem"
                        class="full-width-slider"
                      >
                        <input
                          matSliderThumb
                          [ngModel]="
                            parseRemValue(
                              themeService.currentTheme().radius[radius]
                            )
                          "
                          (ngModelChange)="onRadiusSliderChange(radius, $event)"
                        />
                      </mat-slider>
                    } @else {
                      <div class="full-radius-info">
                        <mat-icon>all_inclusive</mat-icon>
                        <span>9999px (Full circle)</span>
                      </div>
                    }
                    <div
                      class="radius-preview"
                      [style.border-radius]="
                        themeService.currentTheme().radius[radius]
                      "
                    ></div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Shadows Section -->
          @if (activeSection() === 'shadows') {
            <div class="section-content">
              <div class="section-header">
                <h2>Shadow Effects</h2>
                <p class="section-description">
                  Define box shadow values for elevation effects. Adjust blur,
                  spread, and opacity.
                </p>
              </div>

              <div class="shadow-editor">
                @for (shadow of shadowKeys; track shadow) {
                  <div class="shadow-card">
                    <div class="shadow-card-header">
                      <span class="shadow-label">{{ shadow | uppercase }}</span>
                      <span class="shadow-description">{{
                        getShadowDescription(shadow)
                      }}</span>
                    </div>
                    <div class="shadow-controls">
                      <div class="shadow-slider-group">
                        <div class="slider-header">
                          <span class="slider-label">Blur</span>
                          <span class="slider-value"
                            >{{ getShadowBlur(shadow) }}px</span
                          >
                        </div>
                        <mat-slider
                          [min]="0"
                          [max]="30"
                          [step]="1"
                          class="full-width-slider"
                        >
                          <input
                            matSliderThumb
                            [ngModel]="getShadowBlur(shadow)"
                            (ngModelChange)="onShadowBlurChange(shadow, $event)"
                          />
                        </mat-slider>
                      </div>
                      <div class="shadow-slider-group">
                        <div class="slider-header">
                          <span class="slider-label">Spread</span>
                          <span class="slider-value"
                            >{{ getShadowSpread(shadow) }}px</span
                          >
                        </div>
                        <mat-slider
                          [min]="-10"
                          [max]="10"
                          [step]="1"
                          class="full-width-slider"
                        >
                          <input
                            matSliderThumb
                            [ngModel]="getShadowSpread(shadow)"
                            (ngModelChange)="
                              onShadowSpreadChange(shadow, $event)
                            "
                          />
                        </mat-slider>
                      </div>
                      <div class="shadow-slider-group">
                        <div class="slider-header">
                          <span class="slider-label">Opacity</span>
                          <span class="slider-value"
                            >{{ getShadowOpacity(shadow) }}%</span
                          >
                        </div>
                        <mat-slider
                          [min]="0"
                          [max]="50"
                          [step]="1"
                          class="full-width-slider"
                        >
                          <input
                            matSliderThumb
                            [ngModel]="getShadowOpacity(shadow)"
                            (ngModelChange)="
                              onShadowOpacityChange(shadow, $event)
                            "
                          />
                        </mat-slider>
                      </div>
                    </div>
                    <div
                      class="shadow-preview"
                      [style.box-shadow]="
                        themeService.currentTheme().shadows[shadow]
                      "
                    ></div>
                  </div>
                }
              </div>
            </div>
          }
        </main>

        <!-- Preview Panel -->
        <aside class="theme-builder-preview">
          <ax-theme-preview-panel [previewMode]="themeService.previewMode()" />
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .theme-builder {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--ax-background-default, #ffffff);
      }

      /* Header */
      .theme-builder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
        background: var(--ax-background-subtle, #f4f4f5);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .logo-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--ax-brand-500, #6366f1);
      }

      .header-title {
        h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
        }

        .theme-name {
          font-size: 0.75rem;
          color: var(--ax-text-secondary, #71717a);
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .preset-selector {
        width: 180px;

        ::ng-deep .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }
      }

      /* Main Content Layout */
      .theme-builder-content {
        display: grid;
        grid-template-columns: 200px 1fr 500px;
        flex: 1;
        overflow: hidden;
      }

      /* Sidebar */
      .theme-builder-sidebar {
        display: flex;
        flex-direction: column;
        padding: 1rem 0.5rem;
        border-right: 1px solid var(--ax-border-default, #e4e4e7);
        background: var(--ax-background-subtle, #f4f4f5);
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: var(--ax-radius-md, 0.375rem);
        font-size: 0.875rem;
        color: var(--ax-text-secondary, #71717a);
        transition: all 0.15s ease;

        &:hover {
          background: var(--ax-background-default, #ffffff);
          color: var(--ax-text-primary, #3f3f46);
        }

        &.active {
          background: var(--ax-brand-50, #eef2ff);
          color: var(--ax-brand-600, #4f46e5);
          font-weight: 500;

          mat-icon {
            color: var(--ax-brand-500, #6366f1);
          }
        }
      }

      /* Editor Area */
      .theme-builder-editor {
        padding: 1.5rem;
        overflow-y: auto;
      }

      .section-header {
        margin-bottom: 1.5rem;

        h2 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
        }

        .section-description {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary, #71717a);
        }
      }

      /* Color Editors */
      .color-editors {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .semantic-colors {
        h3 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
        }
      }

      .color-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .color-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ax-text-secondary, #71717a);
          text-transform: capitalize;
        }
      }

      .color-input-wrapper {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background: var(--ax-background-default, white);
        border: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-md, 0.375rem);
        padding: 0.25rem;

        input[type='color'] {
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          cursor: pointer;
          border-radius: var(--ax-radius-sm, 0.25rem);

          &::-webkit-color-swatch-wrapper {
            padding: 0;
          }
          &::-webkit-color-swatch {
            border: none;
            border-radius: var(--ax-radius-sm, 0.25rem);
          }
        }

        input[type='text'] {
          width: 70px;
          border: none;
          font-family: monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          background: transparent;
          outline: none;
          color: var(--ax-text-primary, #3f3f46);
        }
      }

      /* Typography Editor */
      .typography-editor {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .typography-group {
        h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
        }
      }

      .full-width {
        width: 100%;
        max-width: 400px;
      }

      .size-grid,
      .weight-grid,
      .line-height-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
      }

      .size-item,
      .weight-item,
      .line-height-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ax-text-secondary, #71717a);
        }

        mat-form-field {
          width: 100%;

          ::ng-deep .mat-mdc-form-field-subscript-wrapper {
            display: none;
          }
        }
      }

      .size-preview {
        color: var(--ax-text-primary, #3f3f46);
      }

      .weight-preview {
        font-size: 0.875rem;
        color: var(--ax-text-primary, #3f3f46);
      }

      /* Slider Grid Layout */
      .slider-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.5rem;
      }

      .slider-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .slider-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-text-secondary, #71717a);
        text-transform: capitalize;
      }

      .slider-value {
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-brand-600, #4f46e5);
        background: var(--ax-brand-50, #eef2ff);
        padding: 0.125rem 0.5rem;
        border-radius: var(--ax-radius-sm, 0.25rem);
      }

      .full-width-slider {
        width: 100%;
      }

      .size-preview {
        color: var(--ax-text-primary, #3f3f46);
        font-weight: 500;
        text-align: center;
        padding: 0.25rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-sm, 0.25rem);
      }

      .weight-preview {
        font-size: 0.875rem;
        color: var(--ax-text-primary, #3f3f46);
        text-align: center;
        padding: 0.25rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-sm, 0.25rem);
      }

      .line-height-preview {
        font-size: 0.75rem;
        color: var(--ax-text-secondary, #71717a);
        padding: 0.25rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-sm, 0.25rem);
        text-align: center;
      }

      /* Spacing Grid */
      .spacing-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }

      .spacing-preview {
        background: var(--ax-brand-500, #6366f1);
        border-radius: 2px;
        min-width: 8px;
        min-height: 8px;
        max-width: 100%;
        max-height: 48px;
        align-self: center;
      }

      /* Radius Grid */
      .radius-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      .radius-preview {
        width: 48px;
        height: 48px;
        background: var(--ax-brand-100, #e0e7ff);
        border: 2px solid var(--ax-brand-500, #6366f1);
        align-self: center;
      }

      .full-radius-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-sm, 0.25rem);
        font-size: 0.75rem;
        color: var(--ax-text-secondary, #71717a);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      /* Shadow Editor */
      .shadow-editor {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .shadow-card {
        padding: 1.25rem;
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-lg, 0.75rem);
        border: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .shadow-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .shadow-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ax-text-heading, #0a0a0a);
      }

      .shadow-description {
        font-size: 0.75rem;
        color: var(--ax-text-secondary, #71717a);
      }

      .shadow-controls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .shadow-slider-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .shadow-preview {
        width: 100%;
        height: 60px;
        background: var(--ax-background-default, white);
        border-radius: var(--ax-radius-md, 0.5rem);
      }

      /* Preview Panel */
      .theme-builder-preview {
        border-left: 1px solid var(--ax-border-default, #e4e4e7);
        overflow-y: auto;
        padding: 1rem;
        background: var(--ax-background-muted, #fafafa);
      }

      /* Responsive */
      @media (max-width: 1200px) {
        .theme-builder-content {
          grid-template-columns: 180px 1fr;
        }

        .theme-builder-preview {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .theme-builder-content {
          grid-template-columns: 1fr;
        }

        .theme-builder-sidebar {
          flex-direction: row;
          overflow-x: auto;
          border-right: none;
          border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
        }

        .header-actions {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class AxThemeBuilderComponent {
  readonly themeService = inject(ThemeBuilderService);
  private snackBar = inject(MatSnackBar);

  // Section navigation
  readonly activeSection = signal<ThemeSection>('colors');

  // Presets
  readonly presets: ThemePreset[] = [
    {
      id: 'aegisx',
      name: 'AegisX Default',
      description: 'Default indigo theme',
      config: {},
    },
    {
      id: 'verus',
      name: 'Verus Blue',
      description: 'Professional blue theme',
      config: {},
    },
    { id: 'rose', name: 'Rose', description: 'Warm rose theme', config: {} },
    {
      id: 'emerald',
      name: 'Emerald',
      description: 'Fresh green theme',
      config: {},
    },
  ];

  readonly selectedPresetId = signal<string>('aegisx');

  // Color names for iteration
  readonly colorNames: SemanticColorName[] = [
    'brand',
    'success',
    'warning',
    'error',
    'info',
  ];

  // Keys for semantic colors (simplified types)
  readonly backgroundKeys = ['muted', 'subtle', 'default', 'emphasis'] as const;
  readonly textKeys = [
    'disabled',
    'subtle',
    'secondary',
    'primary',
    'heading',
    'inverted',
  ] as const;
  readonly borderKeys = ['muted', 'default', 'emphasis'] as const;

  // Typography keys
  readonly fontSizeKeys = [
    'xs',
    'sm',
    'base',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
  ] as const;
  readonly fontWeightKeys = ['normal', 'medium', 'semibold', 'bold'] as const;
  readonly lineHeightKeys = ['tight', 'normal', 'relaxed'] as const;

  // Spacing keys
  readonly spacingKeys = [
    '2xs',
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
  ] as const;

  // Radius keys
  readonly radiusKeys = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;

  // Shadow keys
  readonly shadowKeys = ['sm', 'md', 'lg'] as const;

  setActiveSection(section: ThemeSection): void {
    this.activeSection.set(section);
  }

  onPresetChange(presetId: string): void {
    this.selectedPresetId.set(presetId);
    this.themeService.applyPreset(presetId);
    this.showNotification(`Applied "${presetId}" preset`);
  }

  onColorChange(
    colorName: SemanticColorName,
    shade: ColorShade,
    value: string,
  ): void {
    this.themeService.updateColor(colorName, shade, value);
  }

  onGeneratePalette(colorName: SemanticColorName, baseColor: string): void {
    const palette = this.themeService.generateColorPalette(baseColor);
    this.themeService.updateColorPalette(colorName, palette);
  }

  onBackgroundChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateBackground(
      key as keyof typeof this.themeService.currentTheme extends () => infer T
        ? T extends { background: infer B }
          ? keyof B
          : never
        : never,
      input.value,
    );
  }

  onBackgroundHexInput(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isValidHex(input.value)) {
      this.themeService.updateBackground(key as any, input.value);
    }
  }

  onTextChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateText(key as any, input.value);
  }

  onTextHexInput(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isValidHex(input.value)) {
      this.themeService.updateText(key as any, input.value);
    }
  }

  onBorderChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateBorder(key as any, input.value);
  }

  onBorderHexInput(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isValidHex(input.value)) {
      this.themeService.updateBorder(key as any, input.value);
    }
  }

  onFontFamilyChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateTypography('fontFamily', input.value);
  }

  onFontSizeChange(size: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateFontSize(size as any, input.value);
  }

  onFontWeightChange(weight: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateFontWeight(
      weight as any,
      parseInt(input.value, 10),
    );
  }

  onLineHeightChange(lh: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateLineHeight(lh as any, parseFloat(input.value));
  }

  onSpacingChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateSpacing(key as any, input.value);
  }

  onRadiusChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateRadius(key as any, input.value);
  }

  onShadowChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeService.updateShadow(key as any, input.value);
  }

  exportTheme(format: ExportFormat): void {
    const output = this.themeService.exportTheme(format);

    // Copy to clipboard
    navigator.clipboard.writeText(output).then(() => {
      this.showNotification(
        `Theme exported as ${format.toUpperCase()} and copied to clipboard`,
      );
    });
  }

  applyTheme(): void {
    this.themeService.applyToDocument();
    this.showNotification('Theme applied successfully!');
  }

  resetTheme(): void {
    this.themeService.resetToDefault();
    this.selectedPresetId.set('aegisx');
    this.showNotification('Theme reset to default');
  }

  formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  private isValidHex(value: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Handle colors extracted from image
   */
  onColorsExtracted(_palette: ExtractedPalette): void {
    this.showNotification('Colors extracted successfully!');
  }

  /**
   * Handle palette applied from extracted colors
   */
  onPaletteApplied(event: {
    baseColor: string;
    palette: string[];
    targetPalette?: SemanticColorName;
  }): void {
    const { palette, targetPalette } = event;
    const target = targetPalette || 'brand';
    const shadeValues: ColorShade[] = [
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
    ];

    for (let i = 0; i < Math.min(palette.length, shadeValues.length); i++) {
      this.themeService.updateColor(target, shadeValues[i], palette[i]);
    }

    this.showNotification(
      `Color palette applied to ${target.charAt(0).toUpperCase() + target.slice(1)}!`,
    );
  }

  /**
   * Handle dominant color applied
   */
  onDominantColorApplied(color: string): void {
    // Generate shades from the dominant color and apply to brand palette
    const shades = generateColorShades(color, 10);
    const shadeValues: ColorShade[] = [
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
    ];

    for (let i = 0; i < Math.min(shades.length, shadeValues.length); i++) {
      this.themeService.updateColor('brand', shadeValues[i], shades[i]);
    }

    this.showNotification('Dominant color applied to Brand palette!');
  }

  // ========== Slider Helper Methods ==========

  /**
   * Format rem value for slider display
   */
  formatRem = (value: number): string => {
    return `${value}rem`;
  };

  /**
   * Parse rem value from string (e.g., "1.5rem" -> 1.5)
   */
  parseRemValue(value: string): number {
    const match = value.match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Handle font size slider change
   */
  onFontSizeSliderChange(size: string, value: number): void {
    type FontSizeKey =
      | 'xs'
      | 'sm'
      | 'base'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl';
    this.themeService.updateFontSize(size as FontSizeKey, `${value}rem`);
  }

  /**
   * Handle font weight slider change
   */
  onFontWeightSliderChange(weight: string, value: number): void {
    type FontWeightKey = 'normal' | 'medium' | 'semibold' | 'bold';
    this.themeService.updateFontWeight(weight as FontWeightKey, value);
  }

  /**
   * Handle line height slider change
   */
  onLineHeightSliderChange(lh: string, value: number): void {
    type LineHeightKey = 'tight' | 'normal' | 'relaxed';
    this.themeService.updateLineHeight(lh as LineHeightKey, value);
  }

  /**
   * Handle spacing slider change
   */
  onSpacingSliderChange(key: string, value: number): void {
    type SpacingKey =
      | '2xs'
      | 'xs'
      | 'sm'
      | 'md'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl';
    this.themeService.updateSpacing(key as SpacingKey, `${value}rem`);
  }

  /**
   * Handle radius slider change
   */
  onRadiusSliderChange(key: string, value: number): void {
    type RadiusKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    this.themeService.updateRadius(key as RadiusKey, `${value}rem`);
  }

  // ========== Shadow Helper Methods ==========

  /**
   * Get shadow description
   */
  getShadowDescription(shadow: string): string {
    const descriptions: Record<string, string> = {
      sm: 'Subtle elevation for cards and buttons',
      md: 'Medium elevation for dropdowns and modals',
      lg: 'Strong elevation for floating elements',
    };
    return descriptions[shadow] || '';
  }

  /**
   * Parse shadow blur value
   */
  getShadowBlur(shadow: string): number {
    const shadows = this.themeService.currentTheme().shadows;
    const shadowValue = shadows[shadow as keyof typeof shadows] as string;
    if (!shadowValue) return 0;
    const match = shadowValue.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
    return match ? parseInt(match[3], 10) : 0;
  }

  /**
   * Parse shadow spread value
   */
  getShadowSpread(shadow: string): number {
    const shadows = this.themeService.currentTheme().shadows;
    const shadowValue = shadows[shadow as keyof typeof shadows] as string;
    if (!shadowValue) return 0;
    const match = shadowValue.match(/(\d+)px\s+(\d+)px\s+(\d+)px\s+([-\d]+)px/);
    return match ? parseInt(match[4], 10) : 0;
  }

  /**
   * Parse shadow opacity value
   */
  getShadowOpacity(shadow: string): number {
    const shadows = this.themeService.currentTheme().shadows;
    const shadowValue = shadows[shadow as keyof typeof shadows] as string;
    if (!shadowValue) return 10;
    const match = shadowValue.match(/\/\s*([\d.]+)\s*\)/);
    return match ? Math.round(parseFloat(match[1]) * 100) : 10;
  }

  /**
   * Handle shadow blur change
   */
  onShadowBlurChange(shadow: string, blur: number): void {
    this.updateShadowProperty(shadow, 'blur', blur);
  }

  /**
   * Handle shadow spread change
   */
  onShadowSpreadChange(shadow: string, spread: number): void {
    this.updateShadowProperty(shadow, 'spread', spread);
  }

  /**
   * Handle shadow opacity change
   */
  onShadowOpacityChange(shadow: string, opacity: number): void {
    this.updateShadowProperty(shadow, 'opacity', opacity);
  }

  /**
   * Update shadow property and rebuild shadow string
   */
  private updateShadowProperty(
    shadow: string,
    property: 'blur' | 'spread' | 'opacity',
    value: number,
  ): void {
    const currentBlur = this.getShadowBlur(shadow);
    const currentSpread = this.getShadowSpread(shadow);
    const currentOpacity = this.getShadowOpacity(shadow);

    const blur = property === 'blur' ? value : currentBlur;
    const spread = property === 'spread' ? value : currentSpread;
    const opacity = property === 'opacity' ? value : currentOpacity;

    // Build shadow string based on shadow type
    let shadowStr: string;
    const opacityValue = opacity / 100;

    if (shadow === 'sm') {
      shadowStr = `0 1px ${blur}px ${spread}px rgb(0 0 0 / ${opacityValue})`;
    } else if (shadow === 'md') {
      shadowStr = `0 4px ${blur}px ${spread}px rgb(0 0 0 / ${opacityValue}), 0 2px 4px -2px rgb(0 0 0 / ${opacityValue})`;
    } else {
      shadowStr = `0 10px ${blur}px ${spread}px rgb(0 0 0 / ${opacityValue}), 0 4px 6px -4px rgb(0 0 0 / ${opacityValue})`;
    }

    this.themeService.updateShadow(shadow as 'sm' | 'md' | 'lg', shadowStr);
  }
}
