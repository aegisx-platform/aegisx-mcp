import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AxFileUploadComponent,
  FileItem,
} from '../file-upload/file-upload.component';
import {
  extractDominantColors,
  ExtractedPalette,
  fileToDataUrl,
  generateColorShades,
  hexToColor,
  rgbToHsl,
} from './color-extraction.util';
import { SemanticColorName } from './theme-builder.types';

/**
 * Color category info for categorized extraction
 */
interface ColorCategory {
  name: string;
  color: string;
  hue: number;
  saturation: number;
  lightness: number;
  category: 'warm' | 'cool' | 'neutral';
  suggestedFor: SemanticColorName[];
}

/**
 * Image Color Extractor Component
 *
 * Allows users to upload an image and extract color palettes from it.
 * The extracted colors can be applied to the theme builder.
 * Now supports categorized color extraction and assignment to specific semantic palettes.
 *
 * @example
 * ```html
 * <ax-image-color-extractor
 *   (colorsExtracted)="onColorsExtracted($event)"
 *   (paletteApplied)="onPaletteApplied($event)"
 * />
 * ```
 */
@Component({
  selector: 'ax-image-color-extractor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AxFileUploadComponent,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="image-color-extractor">
      <!-- Upload section -->
      <div class="extractor-upload">
        <h3 class="extractor-title">
          <mat-icon>auto_awesome</mat-icon>
          Extract Colors from Image
        </h3>
        <p class="extractor-description">
          Upload an image to automatically extract and generate color palettes.
          Supports PNG, JPG, WebP, and GIF formats.
        </p>

        <ax-file-upload
          accept="image/*"
          [multiple]="false"
          [maxSize]="10 * 1024 * 1024"
          dragText="Drop image here to extract colors"
          hint="Max 10MB • Drag & Drop or Click to Browse"
          (filesChange)="onFilesSelected($event)"
        />

        <!-- URL Input -->
        <div class="url-input-section">
          <span class="divider-text">or paste image URL</span>
          <div class="url-input-wrapper">
            <mat-icon>link</mat-icon>
            <input
              type="url"
              placeholder="https://example.com/image.png"
              [value]="imageUrl()"
              (input)="onUrlInput($event)"
              (keydown.enter)="extractFromUrl()"
            />
            <button
              mat-icon-button
              [disabled]="!imageUrl() || isProcessing()"
              (click)="extractFromUrl()"
              matTooltip="Extract from URL"
            >
              <mat-icon>download</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Processing state -->
      @if (isProcessing()) {
        <div class="extractor-processing">
          <mat-spinner [diameter]="32"></mat-spinner>
          <span>Extracting colors...</span>
        </div>
      }

      <!-- Results section -->
      @if (palette(); as pal) {
        <div class="extractor-results">
          <div class="results-header">
            <h4>
              <mat-icon>palette</mat-icon>
              Extracted Colors
            </h4>
            <div class="header-actions">
              <button
                mat-stroked-button
                (click)="extractMoreColors()"
                matTooltip="Extract more colors"
              >
                <mat-icon>refresh</mat-icon>
                Re-extract
              </button>
              <button
                mat-icon-button
                (click)="clearResults()"
                matTooltip="Clear results"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Image preview with color overlay -->
          @if (imagePreview(); as preview) {
            <div class="preview-section">
              <div class="preview-container">
                <img
                  [src]="preview"
                  alt="Uploaded image"
                  class="preview-image"
                />
                <div class="color-strip">
                  @for (color of pal.colors; track color) {
                    <div
                      class="strip-color"
                      [style.background-color]="color"
                      [matTooltip]="color"
                    ></div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- View mode toggle -->
          <div class="view-mode-section">
            <mat-button-toggle-group
              [value]="viewMode()"
              (change)="viewMode.set($event.value)"
            >
              <mat-button-toggle value="grid">
                <mat-icon>grid_view</mat-icon>
                Grid
              </mat-button-toggle>
              <mat-button-toggle value="categorized">
                <mat-icon>category</mat-icon>
                Categorized
              </mat-button-toggle>
              <mat-button-toggle value="palette">
                <mat-icon>gradient</mat-icon>
                Palette
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <!-- Grid View -->
          @if (viewMode() === 'grid') {
            <div class="colors-section">
              <div class="section-label">All Extracted Colors</div>
              <div class="colors-grid">
                @for (color of pal.colors; track color; let i = $index) {
                  <div
                    class="color-card"
                    [class.selected]="selectedColor() === color"
                    (click)="selectColor(color)"
                    (keydown.enter)="selectColor(color)"
                    (keydown.space)="selectColor(color)"
                    tabindex="0"
                    role="button"
                    [attr.aria-pressed]="selectedColor() === color"
                  >
                    <div
                      class="color-swatch-large"
                      [style.background-color]="color"
                    >
                      @if (i === 0) {
                        <span class="dominant-badge">Dominant</span>
                      }
                    </div>
                    <div class="color-details">
                      <span class="color-hex">{{ color }}</span>
                      <span class="color-hsl">{{ getColorInfo(color) }}</span>
                    </div>
                    <div class="color-actions">
                      <button
                        mat-icon-button
                        (click)="
                          copyToClipboard(color); $event.stopPropagation()
                        "
                        matTooltip="Copy hex"
                      >
                        <mat-icon>content_copy</mat-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Categorized View -->
          @if (viewMode() === 'categorized') {
            <div class="categorized-section">
              @for (category of colorCategories(); track category.name) {
                <div class="category-group">
                  <div class="category-header">
                    <div
                      class="category-swatch"
                      [style.background-color]="category.color"
                    ></div>
                    <div class="category-info">
                      <span class="category-name">{{ category.name }}</span>
                      <span class="category-type"
                        >{{ category.category }} tone</span
                      >
                    </div>
                  </div>
                  <div class="category-suggestions">
                    <span class="suggestion-label">Suggested for:</span>
                    <div class="suggestion-chips">
                      @for (
                        suggestion of category.suggestedFor;
                        track suggestion
                      ) {
                        <button
                          mat-stroked-button
                          class="suggestion-chip"
                          [class.active]="
                            selectedPalette() === suggestion &&
                            selectedColor() === category.color
                          "
                          (click)="
                            applyColorToPalette(category.color, suggestion)
                          "
                        >
                          {{ suggestion | titlecase }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Palette View -->
          @if (viewMode() === 'palette') {
            <div class="palette-section">
              <div class="section-label">Generated Palettes from Colors</div>
              @for (
                color of pal.colors.slice(0, 3);
                track color;
                let i = $index
              ) {
                <div class="palette-row">
                  <div class="palette-header">
                    <span class="palette-name"
                      >Palette {{ i + 1 }} from {{ color }}</span
                    >
                    <button
                      mat-stroked-button
                      [matMenuTriggerFor]="paletteMenu"
                      class="apply-palette-btn"
                    >
                      <mat-icon>add</mat-icon>
                      Apply to...
                    </button>
                    <mat-menu #paletteMenu="matMenu">
                      @for (
                        paletteName of semanticPalettes;
                        track paletteName
                      ) {
                        <button
                          mat-menu-item
                          (click)="applyGeneratedPalette(color, paletteName)"
                        >
                          <mat-icon>palette</mat-icon>
                          {{ paletteName | titlecase }}
                        </button>
                      }
                    </mat-menu>
                  </div>
                  <div class="palette-shades">
                    @for (
                      shade of getGeneratedShades(color);
                      track shade;
                      let j = $index
                    ) {
                      <div
                        class="shade-item"
                        [style.background-color]="shade"
                        [matTooltip]="shade + ' (' + getShadeLabel(j) + ')'"
                      >
                        <span class="shade-label">{{ getShadeLabel(j) }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Quick Apply Section -->
          <div class="quick-apply-section">
            <div class="section-label">Quick Apply</div>
            <div class="quick-apply-grid">
              @for (paletteName of semanticPalettes; track paletteName) {
                <button
                  mat-flat-button
                  [color]="getButtonColor(paletteName)"
                  (click)="applyDominantToPalette(paletteName)"
                  class="quick-apply-btn"
                >
                  <mat-icon>{{ getPaletteIcon(paletteName) }}</mat-icon>
                  Apply to {{ paletteName | titlecase }}
                </button>
              }
            </div>
          </div>

          <!-- Selected Color Actions -->
          @if (selectedColor(); as selected) {
            <div class="selected-color-panel">
              <div class="selected-preview">
                <div
                  class="selected-swatch"
                  [style.background-color]="selected"
                ></div>
                <div class="selected-info">
                  <span class="selected-hex">{{ selected }}</span>
                  <span class="selected-hsl">{{ getColorInfo(selected) }}</span>
                </div>
              </div>
              <div class="selected-actions">
                <mat-select
                  placeholder="Apply to palette..."
                  (selectionChange)="
                    applyColorToPalette(selected, $event.value)
                  "
                >
                  @for (paletteName of semanticPalettes; track paletteName) {
                    <mat-option [value]="paletteName">
                      {{ paletteName | titlecase }}
                    </mat-option>
                  }
                </mat-select>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="applySelectedAsDominant()"
                >
                  <mat-icon>check</mat-icon>
                  Apply as Brand
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      @use '@angular/material' as mat;

      .image-color-extractor {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .extractor-upload {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .extractor-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ax-text-heading, #0a0a0a);
        display: flex;
        align-items: center;
        gap: 0.5rem;

        mat-icon {
          color: var(--ax-brand-500, #6366f1);
        }
      }

      .extractor-description {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ax-text-secondary, #71717a);
        line-height: 1.5;
      }

      .url-input-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .divider-text {
        font-size: 0.75rem;
        color: var(--ax-text-subtle, #a1a1aa);
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .url-input-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--ax-background-default, #ffffff);
        border: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-md, 0.5rem);
        transition: border-color 0.2s;

        &:focus-within {
          border-color: var(--ax-brand-500, #6366f1);
        }

        mat-icon {
          color: var(--ax-text-subtle, #a1a1aa);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
          background: transparent;
          color: var(--ax-text-primary, #3f3f46);

          &::placeholder {
            color: var(--ax-text-subtle, #a1a1aa);
          }
        }
      }

      .extractor-processing {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-lg, 0.75rem);
        color: var(--ax-text-secondary, #71717a);
      }

      .extractor-results {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-lg, 0.75rem);
        border: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }
      }

      .preview-section {
        margin-bottom: 0.5rem;
      }

      .preview-container {
        position: relative;
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: hidden;
        border: 1px solid var(--ax-border-default, #e4e4e7);
        background: var(--ax-background-default, #ffffff);
      }

      .preview-image {
        width: 100%;
        max-height: 250px;
        object-fit: contain;
        display: block;
      }

      .color-strip {
        display: flex;
        height: 8px;
        width: 100%;
      }

      .strip-color {
        flex: 1;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: scaleY(2);
        }
      }

      .view-mode-section {
        display: flex;
        justify-content: center;
      }

      .section-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-text-secondary, #71717a);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75rem;
      }

      /* Grid View */
      .colors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
      }

      .color-card {
        display: flex;
        flex-direction: column;
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 2px solid transparent;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--ax-brand-200, #c7d2fe);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border-color: var(--ax-brand-500, #6366f1);
        }
      }

      .color-swatch-large {
        height: 80px;
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 0.25rem;
      }

      .dominant-badge {
        font-size: 0.625rem;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 0.125rem 0.375rem;
        border-radius: var(--ax-radius-sm, 0.25rem);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .color-details {
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .color-hex {
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-text-primary, #3f3f46);
      }

      .color-hsl {
        font-size: 0.625rem;
        color: var(--ax-text-secondary, #71717a);
      }

      .color-actions {
        display: flex;
        justify-content: flex-end;
        padding: 0 0.25rem 0.25rem;

        button {
          width: 28px;
          height: 28px;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }

      /* Categorized View */
      .categorized-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .category-group {
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-md, 0.5rem);
        padding: 1rem;
        border: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .category-swatch {
        width: 48px;
        height: 48px;
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .category-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .category-name {
        font-family: monospace;
        font-weight: 600;
        color: var(--ax-text-primary, #3f3f46);
      }

      .category-type {
        font-size: 0.75rem;
        color: var(--ax-text-secondary, #71717a);
        text-transform: capitalize;
      }

      .category-suggestions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .suggestion-label {
        font-size: 0.75rem;
        color: var(--ax-text-subtle, #a1a1aa);
      }

      .suggestion-chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .suggestion-chip {
        font-size: 0.75rem;
        padding: 0.25rem 0.75rem;
        min-height: 28px;

        &.active {
          background: var(--ax-brand-100, #e0e7ff);
          color: var(--ax-brand-700, #4338ca);
        }
      }

      /* Palette View */
      .palette-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .palette-row {
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-md, 0.5rem);
        padding: 1rem;
        border: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .palette-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .palette-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-primary, #3f3f46);
      }

      .apply-palette-btn {
        font-size: 0.75rem;
      }

      .palette-shades {
        display: flex;
        gap: 2px;
        border-radius: var(--ax-radius-sm, 0.25rem);
        overflow: hidden;
      }

      .shade-item {
        flex: 1;
        height: 40px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s;

        &:hover {
          transform: scaleY(1.2);
        }
      }

      .shade-label {
        font-size: 0.5rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.4);
        padding-bottom: 2px;
      }

      /* Quick Apply */
      .quick-apply-section {
        padding-top: 1rem;
        border-top: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .quick-apply-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.5rem;
      }

      .quick-apply-btn {
        justify-content: flex-start;
        gap: 0.5rem;
      }

      /* Selected Color Panel */
      .selected-color-panel {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 2px solid var(--ax-brand-500, #6366f1);
        margin-top: 0.5rem;
      }

      .selected-preview {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .selected-swatch {
        width: 56px;
        height: 56px;
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .selected-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .selected-hex {
        font-family: monospace;
        font-size: 1rem;
        font-weight: 600;
        color: var(--ax-text-primary, #3f3f46);
      }

      .selected-hsl {
        font-size: 0.75rem;
        color: var(--ax-text-secondary, #71717a);
      }

      .selected-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-left: auto;

        mat-select {
          width: 160px;
        }
      }

      /* Dark mode */
      :host-context(.dark) {
        .extractor-results,
        .color-card,
        .category-group,
        .palette-row,
        .selected-color-panel {
          background: var(--ax-background-default);
        }

        .color-hex,
        .category-name,
        .selected-hex {
          color: var(--ax-text-primary);
        }

        .shade-label {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    `,
  ],
})
export class AxImageColorExtractorComponent {
  @Output() colorsExtracted = new EventEmitter<ExtractedPalette>();
  @Output() paletteApplied = new EventEmitter<{
    baseColor: string;
    palette: string[];
    targetPalette: SemanticColorName;
  }>();
  @Output() dominantColorApplied = new EventEmitter<string>();

  private snackBar = inject(MatSnackBar);

  // State signals
  protected readonly isProcessing = signal(false);
  protected readonly palette = signal<ExtractedPalette | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly imageUrl = signal('');
  protected readonly viewMode = signal<'grid' | 'categorized' | 'palette'>(
    'grid',
  );
  protected readonly selectedColor = signal<string | null>(null);
  protected readonly selectedPalette = signal<SemanticColorName | null>(null);
  protected readonly colorCategories = signal<ColorCategory[]>([]);

  // Cached generated palettes
  private generatedPalettesCache = new Map<string, string[]>();

  // Semantic palette names
  readonly semanticPalettes: SemanticColorName[] = [
    'brand',
    'success',
    'warning',
    'error',
    'info',
  ];

  // Current file for re-extraction
  private currentFile: File | null = null;

  /**
   * Handle file selection and extract colors
   */
  async onFilesSelected(files: FileItem[]): Promise<void> {
    if (files.length === 0) return;

    const fileItem = files[0];
    if (!fileItem.file) return;

    this.currentFile = fileItem.file;
    await this.extractColorsFromFile(fileItem.file);
  }

  /**
   * Handle URL input
   */
  onUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageUrl.set(input.value);
  }

  /**
   * Extract colors from URL
   */
  async extractFromUrl(): Promise<void> {
    const url = this.imageUrl();
    if (!url) return;

    this.isProcessing.set(true);

    try {
      // Fetch image and convert to file
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'image-from-url', { type: blob.type });

      this.currentFile = file;
      await this.extractColorsFromFile(file);
    } catch (error) {
      console.error('Failed to fetch image from URL:', error);
      this.snackBar.open('Failed to load image from URL', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      this.isProcessing.set(false);
    }
  }

  /**
   * Extract colors from file
   */
  private async extractColorsFromFile(file: File): Promise<void> {
    this.isProcessing.set(true);
    this.selectedColor.set(null);
    this.selectedPalette.set(null);

    try {
      // Generate preview
      const preview = await fileToDataUrl(file);
      this.imagePreview.set(preview);

      // Extract colors (more colors for better categorization)
      const extractedPalette = await extractDominantColors(file, 8);
      this.palette.set(extractedPalette);

      // Categorize colors
      this.categorizeColors(extractedPalette.colors);

      // Clear palette cache
      this.generatedPalettesCache.clear();

      this.colorsExtracted.emit(extractedPalette);

      this.snackBar.open('Colors extracted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      console.error('Failed to extract colors:', error);
      this.snackBar.open('Failed to extract colors from image', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Re-extract colors with more samples
   */
  async extractMoreColors(): Promise<void> {
    if (this.currentFile) {
      await this.extractColorsFromFile(this.currentFile);
    }
  }

  /**
   * Categorize colors based on hue and saturation
   */
  private categorizeColors(colors: string[]): void {
    const categories: ColorCategory[] = colors.map((color) => {
      const rgb = hexToColor(color);
      const hsl = rgbToHsl(rgb);

      let category: 'warm' | 'cool' | 'neutral';
      let suggestedFor: SemanticColorName[] = [];

      // Determine category based on hue
      if (hsl.s < 15) {
        category = 'neutral';
        suggestedFor = ['brand'];
      } else if (hsl.h >= 0 && hsl.h < 60) {
        // Red to Yellow - Warm
        category = 'warm';
        if (hsl.h < 30) {
          suggestedFor = ['error', 'warning'];
        } else {
          suggestedFor = ['warning', 'brand'];
        }
      } else if (hsl.h >= 60 && hsl.h < 180) {
        // Yellow to Cyan - includes green
        if (hsl.h >= 80 && hsl.h < 160) {
          category = 'cool';
          suggestedFor = ['success', 'brand'];
        } else {
          category = 'warm';
          suggestedFor = ['warning', 'brand'];
        }
      } else if (hsl.h >= 180 && hsl.h < 270) {
        // Cyan to Purple - Cool
        category = 'cool';
        suggestedFor = ['info', 'brand'];
      } else {
        // Purple to Red - Cool/Warm transition
        category = 'cool';
        suggestedFor = ['brand', 'error'];
      }

      return {
        name: color,
        color,
        hue: hsl.h,
        saturation: hsl.s,
        lightness: hsl.l,
        category,
        suggestedFor,
      };
    });

    this.colorCategories.set(categories);
  }

  /**
   * Select a color
   */
  selectColor(color: string): void {
    if (this.selectedColor() === color) {
      this.selectedColor.set(null);
    } else {
      this.selectedColor.set(color);
    }
  }

  /**
   * Get color info (HSL string)
   */
  getColorInfo(hex: string): string {
    const rgb = hexToColor(hex);
    const hsl = rgbToHsl(rgb);
    return `H: ${hsl.h}° S: ${hsl.s}% L: ${hsl.l}%`;
  }

  /**
   * Get generated shades for a color (cached)
   */
  getGeneratedShades(baseColor: string): string[] {
    if (!this.generatedPalettesCache.has(baseColor)) {
      this.generatedPalettesCache.set(
        baseColor,
        generateColorShades(baseColor, 10),
      );
    }
    return this.generatedPalettesCache.get(baseColor) ?? [];
  }

  /**
   * Get shade label (50, 100, 200, etc.)
   */
  getShadeLabel(index: number): string {
    const labels = [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ];
    return labels[index] || '';
  }

  /**
   * Apply color to specific palette
   */
  applyColorToPalette(color: string, paletteName: SemanticColorName): void {
    const palette = generateColorShades(color, 10);
    this.selectedPalette.set(paletteName);
    this.selectedColor.set(color);

    this.paletteApplied.emit({
      baseColor: color,
      palette,
      targetPalette: paletteName,
    });

    this.snackBar.open(`Applied to ${paletteName} palette!`, 'Close', {
      duration: 2000,
    });
  }

  /**
   * Apply generated palette to specific semantic palette
   */
  applyGeneratedPalette(
    baseColor: string,
    paletteName: SemanticColorName,
  ): void {
    const palette = this.getGeneratedShades(baseColor);

    this.paletteApplied.emit({
      baseColor,
      palette,
      targetPalette: paletteName,
    });

    this.snackBar.open(`Palette applied to ${paletteName}!`, 'Close', {
      duration: 2000,
    });
  }

  /**
   * Apply dominant color to specific palette
   */
  applyDominantToPalette(paletteName: SemanticColorName): void {
    const pal = this.palette();
    if (!pal) return;

    this.applyColorToPalette(pal.dominant, paletteName);
  }

  /**
   * Apply selected color as brand (dominant)
   */
  applySelectedAsDominant(): void {
    const selected = this.selectedColor();
    if (!selected) return;

    this.applyColorToPalette(selected, 'brand');
    this.dominantColorApplied.emit(selected);
  }

  /**
   * Get button color for palette
   */
  getButtonColor(
    paletteName: SemanticColorName,
  ): 'primary' | 'accent' | 'warn' | undefined {
    switch (paletteName) {
      case 'brand':
      case 'info':
        return 'primary';
      case 'success':
        return 'accent';
      case 'error':
      case 'warning':
        return 'warn';
      default:
        return undefined;
    }
  }

  /**
   * Get icon for palette
   */
  getPaletteIcon(paletteName: SemanticColorName): string {
    switch (paletteName) {
      case 'brand':
        return 'star';
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'palette';
    }
  }

  /**
   * Copy color to clipboard
   */
  async copyToClipboard(color: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(color);
      this.snackBar.open('Copied to clipboard!', 'Close', {
        duration: 1500,
      });
    } catch {
      this.snackBar.open('Failed to copy to clipboard', 'Close', {
        duration: 1500,
      });
    }
  }

  /**
   * Clear extraction results
   */
  clearResults(): void {
    this.palette.set(null);
    this.imagePreview.set(null);
    this.imageUrl.set('');
    this.selectedColor.set(null);
    this.selectedPalette.set(null);
    this.colorCategories.set([]);
    this.generatedPalettesCache.clear();
    this.currentFile = null;
  }
}
