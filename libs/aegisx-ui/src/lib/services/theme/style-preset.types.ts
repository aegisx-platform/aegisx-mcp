/**
 * Style Preset Types
 *
 * Defines the structure for UI style presets that control layout,
 * spacing, shadows, typography, and transitions independent of colors.
 */

/**
 * Style preset properties that can be customized
 * These control the visual appearance and feel independent of colors
 */
export interface StylePresetConfig {
  /** Border radius in pixels - affects roundness of components */
  borderRadius: string;

  /** Base spacing unit in pixels - affects padding and margins */
  spacing: string;

  /** Shadow intensity: 'none' | 'light' | 'medium' | 'deep' */
  shadow: 'none' | 'light' | 'medium' | 'deep';

  /** Base font size in pixels */
  fontSize: string;

  /** Line height multiplier for text readability */
  lineHeight: string;

  /** Transition duration for animations in milliseconds */
  transitionDuration: string;
}

/**
 * Complete style preset definition
 */
export interface StylePreset {
  /** Unique identifier for the preset */
  id: string;

  /** Display name for the preset */
  name: string;

  /** Description of the preset's visual characteristics */
  description: string;

  /** Configuration for this preset */
  config: StylePresetConfig;
}

/**
 * Style preset state managed by the service
 */
export interface StylePresetState {
  /** Currently selected preset ID */
  currentPreset: string;

  /** All available presets */
  availablePresets: StylePreset[];

  /** Whether the preset has been loaded from localStorage */
  isInitialized: boolean;
}

/**
 * Preset-specific values for common properties
 */
export interface PresetValues {
  /** Border radius value for this preset */
  borderRadius: {
    modern: '12px';
    compact: '4px';
    classic: '0px';
    tremor: '8px';
  };

  /** Base spacing value for this preset */
  spacing: {
    modern: '24px';
    compact: '12px';
    classic: '16px';
    tremor: '16px';
  };

  /** Shadow intensity for this preset */
  shadow: {
    modern: 'deep';
    compact: 'light';
    classic: 'none';
    tremor: 'medium';
  };

  /** Font size for this preset */
  fontSize: {
    modern: '14px';
    compact: '12px';
    classic: '14px';
    tremor: '14px';
  };

  /** Line height for this preset */
  lineHeight: {
    modern: '1.6';
    compact: '1.4';
    classic: '1.5';
    tremor: '1.5';
  };

  /** Transition duration for this preset (in milliseconds) */
  transitionDuration: {
    modern: '300';
    compact: '200';
    classic: '0';
    tremor: '200';
  };
}
