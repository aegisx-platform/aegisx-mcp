import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { AegisxCardComponent } from '@aegisx/ui';

interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
}

@Component({
  selector: 'ax-appearance-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    AegisxCardComponent,
  ],
  template: `
    <form [formGroup]="appearanceForm">
      <!-- Theme Selection -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Theme
        </h3>

        <div class="space-y-4">
          <mat-radio-group
            formControlName="theme"
            class="flex flex-col space-y-3"
          >
            <mat-radio-button value="light" color="primary">
              <div class="flex items-center space-x-3">
                <mat-icon>light_mode</mat-icon>
                <div>
                  <p class="font-medium">Light Theme</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Default light theme
                  </p>
                </div>
              </div>
            </mat-radio-button>

            <mat-radio-button value="dark" color="primary">
              <div class="flex items-center space-x-3">
                <mat-icon>dark_mode</mat-icon>
                <div>
                  <p class="font-medium">Dark Theme</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Easy on the eyes
                  </p>
                </div>
              </div>
            </mat-radio-button>

            <mat-radio-button value="system" color="primary">
              <div class="flex items-center space-x-3">
                <mat-icon>brightness_auto</mat-icon>
                <div>
                  <p class="font-medium">System Theme</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Follow system preferences
                  </p>
                </div>
              </div>
            </mat-radio-button>
          </mat-radio-group>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Color Presets -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Color Scheme
        </h3>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          @for (preset of themePresets; track preset.id) {
            <ax-card
              [appearance]="'outlined'"
              class="cursor-pointer transition-all"
              [class.ring-2]="selectedPreset() === preset.id"
              [class.ring-primary]="selectedPreset() === preset.id"
              (click)="selectPreset(preset)"
            >
              <div class="text-center">
                <div class="flex justify-center space-x-2 mb-3">
                  <div
                    class="w-8 h-8 rounded-full shadow-sm"
                    [style.backgroundColor]="preset.primary"
                  ></div>
                  <div
                    class="w-8 h-8 rounded-full shadow-sm"
                    [style.backgroundColor]="preset.accent"
                  ></div>
                  <div
                    class="w-8 h-8 rounded-full shadow-sm border"
                    [style.backgroundColor]="preset.background"
                  ></div>
                </div>
                <p class="text-sm font-medium">{{ preset.name }}</p>
              </div>
            </ax-card>
          }
        </div>

        <div class="mt-4">
          <button mat-stroked-button type="button" (click)="customizeColors()">
            <mat-icon>palette</mat-icon>
            Customize Colors
          </button>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Layout Settings -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Layout
        </h3>

        <div class="space-y-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Navigation Style</mat-label>
            <mat-select formControlName="navigationStyle">
              <mat-option value="sidebar">Sidebar Navigation</mat-option>
              <mat-option value="top">Top Navigation</mat-option>
              <mat-option value="combined">Combined Navigation</mat-option>
            </mat-select>
            <mat-icon matSuffix>menu</mat-icon>
          </mat-form-field>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Compact Mode
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Reduce spacing and padding
              </p>
            </div>
            <mat-slide-toggle
              formControlName="compactMode"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Show Footer
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Display footer with additional information
              </p>
            </div>
            <mat-slide-toggle
              formControlName="showFooter"
              color="primary"
            ></mat-slide-toggle>
          </div>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Typography -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Typography
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Font Family</mat-label>
            <mat-select formControlName="fontFamily">
              <mat-option value="inter">Inter (Default)</mat-option>
              <mat-option value="roboto">Roboto</mat-option>
              <mat-option value="system">System Font</mat-option>
              <mat-option value="poppins">Poppins</mat-option>
              <mat-option value="lato">Lato</mat-option>
            </mat-select>
            <mat-icon matSuffix>text_format</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Font Size</mat-label>
            <mat-select formControlName="fontSize">
              <mat-option value="small">Small</mat-option>
              <mat-option value="medium">Medium (Default)</mat-option>
              <mat-option value="large">Large</mat-option>
              <mat-option value="extra-large">Extra Large</mat-option>
            </mat-select>
            <mat-icon matSuffix>format_size</mat-icon>
          </mat-form-field>
        </div>

        <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p class="text-sm mb-2">Preview:</p>
          <p [style.fontFamily]="getFontFamily()" [class]="getFontSizeClass()">
            The quick brown fox jumps over the lazy dog. 1234567890
          </p>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-radio-button {
        margin-bottom: 8px;
      }

      .text-size-small {
        font-size: 14px;
      }
      .text-size-medium {
        font-size: 16px;
      }
      .text-size-large {
        font-size: 18px;
      }
      .text-size-extra-large {
        font-size: 20px;
      }
    `,
  ],
})
export class AppearanceSettingsComponent {
  @Output() settingsChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  selectedPreset = signal('default');

  appearanceForm = this.fb.group({
    theme: ['system'],
    navigationStyle: ['sidebar'],
    compactMode: [false],
    showFooter: [true],
    fontFamily: ['inter'],
    fontSize: ['medium'],
  });

  themePresets: ThemePreset[] = [
    {
      id: 'default',
      name: 'Default',
      primary: '#1976d2',
      accent: '#ff4081',
      background: '#ffffff',
    },
    {
      id: 'ocean',
      name: 'Ocean',
      primary: '#006064',
      accent: '#00acc1',
      background: '#e0f7fa',
    },
    {
      id: 'forest',
      name: 'Forest',
      primary: '#2e7d32',
      accent: '#66bb6a',
      background: '#e8f5e9',
    },
    {
      id: 'sunset',
      name: 'Sunset',
      primary: '#d84315',
      accent: '#ff6e40',
      background: '#fff3e0',
    },
    {
      id: 'midnight',
      name: 'Midnight',
      primary: '#1a237e',
      accent: '#3949ab',
      background: '#121212',
    },
    {
      id: 'lavender',
      name: 'Lavender',
      primary: '#6a1b9a',
      accent: '#ab47bc',
      background: '#f3e5f5',
    },
  ];

  constructor() {
    this.appearanceForm.valueChanges.subscribe((values) => {
      this.emitChanges();
    });
  }

  selectPreset(preset: ThemePreset): void {
    this.selectedPreset.set(preset.id);
    this.emitChanges();
  }

  customizeColors(): void {
    console.log('Open color customization dialog');
  }

  getFontFamily(): string {
    const fontMap: Record<string, string> = {
      inter: '"Inter", sans-serif',
      roboto: '"Roboto", sans-serif',
      system:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      poppins: '"Poppins", sans-serif',
      lato: '"Lato", sans-serif',
    };
    return fontMap[this.appearanceForm.get('fontFamily')?.value || 'inter'];
  }

  getFontSizeClass(): string {
    return `text-size-${this.appearanceForm.get('fontSize')?.value || 'medium'}`;
  }

  private emitChanges(): void {
    this.settingsChange.emit({
      appearance: {
        ...this.appearanceForm.value,
        colorPreset: this.selectedPreset(),
      },
    });
  }
}
