/**
 * Style Preset Service
 *
 * Manages UI style presets (Modern, Compact, Classic, Tremor) that control
 * layout, spacing, shadows, typography, and transitions independently from color themes.
 */

import {
  Injectable,
  signal,
  computed,
} from '@angular/core';
import { StylePreset, StylePresetConfig, PresetValues } from './style-preset.types';

@Injectable({
  providedIn: 'root',
})
export class StylePresetService {
  /**
   * Preset configuration values for all available presets
   * These define the specific values for each style preset
   */
  private readonly presetValues: PresetValues = {
    borderRadius: {
      modern: '12px',
      compact: '4px',
      classic: '0px',
      tremor: '8px',
    },
    spacing: {
      modern: '24px',
      compact: '12px',
      classic: '16px',
      tremor: '16px',
    },
    shadow: {
      modern: 'deep',
      compact: 'light',
      classic: 'none',
      tremor: 'medium',
    },
    fontSize: {
      modern: '14px',
      compact: '12px',
      classic: '14px',
      tremor: '14px',
    },
    lineHeight: {
      modern: '1.6',
      compact: '1.4',
      classic: '1.5',
      tremor: '1.5',
    },
    transitionDuration: {
      modern: '300',
      compact: '200',
      classic: '0',
      tremor: '200',
    },
  };

  /**
   * Pre-defined style presets
   * Each preset controls the overall visual feel and responsiveness
   */
  private readonly presets: Record<string, StylePreset> = {
    modern: {
      id: 'modern',
      name: 'Modern',
      description: 'Rounded corners, generous spacing, smooth animations',
      config: {
        borderRadius: this.presetValues.borderRadius.modern,
        spacing: this.presetValues.spacing.modern,
        shadow: this.presetValues.shadow.modern,
        fontSize: this.presetValues.fontSize.modern,
        lineHeight: this.presetValues.lineHeight.modern,
        transitionDuration: this.presetValues.transitionDuration.modern,
      },
    },
    compact: {
      id: 'compact',
      name: 'Compact',
      description: 'Minimal corners, tight spacing, snappy interactions',
      config: {
        borderRadius: this.presetValues.borderRadius.compact,
        spacing: this.presetValues.spacing.compact,
        shadow: this.presetValues.shadow.compact,
        fontSize: this.presetValues.fontSize.compact,
        lineHeight: this.presetValues.lineHeight.compact,
        transitionDuration: this.presetValues.transitionDuration.compact,
      },
    },
    classic: {
      id: 'classic',
      name: 'Classic',
      description: 'Sharp edges, balanced spacing, instant response',
      config: {
        borderRadius: this.presetValues.borderRadius.classic,
        spacing: this.presetValues.spacing.classic,
        shadow: this.presetValues.shadow.classic,
        fontSize: this.presetValues.fontSize.classic,
        lineHeight: this.presetValues.lineHeight.classic,
        transitionDuration: this.presetValues.transitionDuration.classic,
      },
    },
    tremor: {
      id: 'tremor',
      name: 'Tremor',
      description: 'Subtle curves, modern spacing, smooth transitions',
      config: {
        borderRadius: this.presetValues.borderRadius.tremor,
        spacing: this.presetValues.spacing.tremor,
        shadow: this.presetValues.shadow.tremor,
        fontSize: this.presetValues.fontSize.tremor,
        lineHeight: this.presetValues.lineHeight.tremor,
        transitionDuration: this.presetValues.transitionDuration.tremor,
      },
    },
  };

  /**
   * Current style preset ID signal
   */
  private readonly _currentPreset = signal<string>('modern');
  public readonly currentPreset = this._currentPreset.asReadonly();

  /**
   * Available presets list
   */
  public readonly availablePresets = computed(() => Object.values(this.presets));

  /**
   * Get current preset configuration
   */
  public readonly currentConfig = computed(() => {
    const presetId = this.currentPreset();
    return this.presets[presetId]?.config || this.presets['modern'].config;
  });

  constructor() {
    // Initialize preset from localStorage
    this.initializePreset();
  }

  /**
   * Initialize preset from localStorage or use default
   */
  private initializePreset(): void {
    const savedPreset = localStorage.getItem('style-preset-id');
    if (savedPreset && this.presets[savedPreset]) {
      this._currentPreset.set(savedPreset);
    }
  }

  /**
   * Set the current style preset
   */
  setPreset(presetId: string): void {
    const preset = this.presets[presetId];
    if (!preset) {
      console.warn(`Style preset "${presetId}" not found`);
      return;
    }

    this._currentPreset.set(presetId);
    localStorage.setItem('style-preset-id', presetId);
  }

  /**
   * Get a specific preset by ID
   */
  getPreset(presetId: string): StylePreset | undefined {
    return this.presets[presetId];
  }

  /**
   * Register a custom style preset
   */
  registerPreset(preset: StylePreset): void {
    this.presets[preset.id] = preset;
  }

  /**
   * Generate CSS custom properties for the current preset
   * These variables can be used in SCSS/CSS to apply the preset styling
   */
  generatePresetCSS(preset: StylePreset): string {
    const config = preset.config;

    // Shadow mappings for CSS variables
    const shadowMap: Record<string, string> = {
      none: '0 0 0 rgba(0, 0, 0, 0)',
      light: '0 1px 2px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      deep: '0 10px 15px rgba(0, 0, 0, 0.1)',
    };

    return `
      /* ⭐ STYLE PRESET CSS VARIABLES - ${preset.name} */
      :root {
        /* Border Radius */
        --preset-border-radius: ${config.borderRadius};
        --preset-border-radius-sm: calc(${config.borderRadius} * 0.5);
        --preset-border-radius-lg: calc(${config.borderRadius} * 1.5);

        /* Spacing */
        --preset-spacing-base: ${config.spacing};
        --preset-spacing-sm: calc(${config.spacing} * 0.5);
        --preset-spacing-md: calc(${config.spacing} * 0.75);
        --preset-spacing-lg: calc(${config.spacing} * 1.5);
        --preset-spacing-xl: calc(${config.spacing} * 2);

        /* Shadow */
        --preset-shadow: ${shadowMap[config.shadow]};

        /* Typography */
        --preset-font-size-base: ${config.fontSize};
        --preset-font-size-sm: calc(${config.fontSize} * 0.875);
        --preset-font-size-lg: calc(${config.fontSize} * 1.125);
        --preset-line-height: ${config.lineHeight};

        /* Transitions */
        --preset-transition-duration: ${config.transitionDuration}ms;
        --preset-transition: all var(--preset-transition-duration) ease-in-out;
      }
    `;
  }
}
