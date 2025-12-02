import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ColorPalette,
  ColorShade,
  SemanticColorName,
} from './theme-builder.types';

@Component({
  selector: 'ax-color-palette-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <div class="color-palette-editor">
      <div class="palette-header">
        <h3 class="palette-title">{{ displayName() }}</h3>
        <div class="palette-actions">
          <!-- Base color input -->
          <div class="base-color-input">
            <span class="base-label">Base</span>
            <div class="color-input-wrapper">
              <input
                type="color"
                [value]="baseColor()"
                (input)="onBaseColorChange($event)"
                class="color-picker-input"
              />
              <input
                type="text"
                [value]="baseColor()"
                (blur)="onHexInput($event)"
                class="hex-input"
                maxlength="7"
              />
            </div>
          </div>
          <button
            mat-icon-button
            matTooltip="Auto-generate shades from base color"
            (click)="generateFromBase()"
            class="generate-btn"
          >
            <mat-icon>auto_fix_high</mat-icon>
          </button>
        </div>
      </div>

      <div class="shade-strip">
        @for (shade of shades; track shade) {
          <div
            class="shade-item"
            [class.shade-main]="shade === 500"
            [style.background-color]="palette[shade]"
            [matTooltip]="palette[shade] + ' (' + shade + ')'"
            (click)="selectShade(shade)"
            (keydown.enter)="selectShade(shade)"
            tabindex="0"
            role="button"
          >
            <span
              class="shade-label"
              [class.light-text]="isLightColor(palette[shade])"
              >{{ shade }}</span
            >
          </div>
        }
      </div>

      <!-- Inline edit for selected shade -->
      <div class="shade-editor">
        <div class="shade-controls-row">
          @for (shade of shades; track shade) {
            <div class="shade-control">
              <input
                type="color"
                [value]="palette[shade]"
                (input)="onShadeChange(shade, $event)"
                class="shade-color-picker"
              />
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .color-palette-editor {
        padding: 1rem;
        background: var(--ax-background-default, #ffffff);
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .palette-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .palette-title {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: capitalize;
        color: var(--ax-text-heading, #0a0a0a);
      }

      .palette-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .base-color-input {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .base-label {
          font-size: 0.75rem;
          color: var(--ax-text-secondary, #71717a);
        }
      }

      .color-input-wrapper {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-sm, 0.25rem);
        padding: 0.125rem 0.25rem;
      }

      .color-picker-input {
        width: 20px;
        height: 20px;
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

      .hex-input {
        width: 60px;
        border: none;
        font-family: monospace;
        font-size: 0.6875rem;
        text-transform: uppercase;
        background: transparent;
        outline: none;
        color: var(--ax-text-primary, #3f3f46);
      }

      .generate-btn {
        width: 28px;
        height: 28px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .shade-strip {
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
        transition: transform 0.15s ease;
        outline: none;

        &:hover {
          transform: scaleY(1.15);
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 2px var(--ax-brand-500, #6366f1);
        }

        &.shade-main {
          box-shadow: inset 0 -3px 0 0 rgba(0, 0, 0, 0.3);
        }
      }

      .shade-label {
        font-size: 0.5rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.5);
        padding-bottom: 2px;

        &.light-text {
          color: rgba(255, 255, 255, 0.7);
        }
      }

      .shade-editor {
        margin-top: 0.5rem;
      }

      .shade-controls-row {
        display: flex;
        gap: 2px;
      }

      .shade-control {
        flex: 1;
        display: flex;
        justify-content: center;
      }

      .shade-color-picker {
        width: 100%;
        max-width: 24px;
        height: 16px;
        padding: 0;
        border: none;
        cursor: pointer;
        border-radius: 2px;

        &::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        &::-webkit-color-swatch {
          border: 1px solid var(--ax-border-default, #e4e4e7);
          border-radius: 2px;
        }
      }

      :host-context(.dark) {
        .color-palette-editor {
          background: var(--ax-background-default);
          border-color: var(--ax-border-default);
        }
      }
    `,
  ],
})
export class AxColorPaletteEditorComponent {
  @Input() colorName: SemanticColorName = 'brand';
  @Input() palette: ColorPalette = {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  };

  @Output() colorChange = new EventEmitter<{
    shade: ColorShade;
    value: string;
  }>();
  @Output() paletteChange = new EventEmitter<ColorPalette>();
  @Output() generatePalette = new EventEmitter<string>();

  readonly shades: ColorShade[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
  ];

  private _selectedShade = signal<ColorShade>(500);

  readonly displayName = computed(() => {
    const names: Record<SemanticColorName, string> = {
      brand: 'Brand / Primary',
      success: 'Success',
      warning: 'Warning',
      error: 'Error / Danger',
      info: 'Info',
      cyan: 'Cyan',
      purple: 'Purple',
      pink: 'Pink',
      indigo: 'Indigo',
    };
    return names[this.colorName];
  });

  readonly baseColor = computed(() => this.palette[500]);

  selectShade(shade: ColorShade): void {
    this._selectedShade.set(shade);
  }

  onBaseColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.generatePalette.emit(input.value);
  }

  onHexInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isValidHex(input.value)) {
      this.generatePalette.emit(input.value);
    }
  }

  onShadeChange(shade: ColorShade, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.colorChange.emit({ shade, value: input.value });
  }

  onShadeHexInput(shade: ColorShade, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isValidHex(input.value)) {
      this.colorChange.emit({ shade, value: input.value });
    }
  }

  generateFromBase(): void {
    this.generatePalette.emit(this.palette[500]);
  }

  isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  private isValidHex(value: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }
}
