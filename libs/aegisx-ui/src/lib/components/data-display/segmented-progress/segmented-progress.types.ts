/**
 * Segmented Progress Component Type Definitions
 *
 * Type definitions for the Segmented Progress component (@aegisx/ui).
 * Multi-segment progress bar with legend for displaying distribution metrics.
 */

/**
 * Progress Segment Configuration
 *
 * Defines a single segment in the progress bar.
 *
 * @example
 * const segment: ProgressSegment = {
 *   label: 'Completed',
 *   value: 45,
 *   percentage: 45,
 *   color: 'var(--ax-success-default)'
 * };
 */
export interface ProgressSegment {
  /** Segment label displayed in the legend */
  label: string;

  /** Segment numeric value (raw data) */
  value: number;

  /** Segment percentage (0-100) used for visual display */
  percentage: number;

  /** Segment color - CSS color value or design token */
  color: string;
}

/**
 * Segmented Progress Bar Size
 *
 * Controls the height of the progress bar:
 * - sm: Small (8px height) - compact display
 * - md: Medium (12px height) - default
 * - lg: Large (16px height) - prominent display
 */
export type SegmentedProgressSize = 'sm' | 'md' | 'lg';

/**
 * Legend Position Options
 *
 * Defines where the legend is displayed relative to the progress bar:
 * - bottom: Below the progress bar (default) - good for horizontal layouts
 * - right: To the right of the progress bar - good for side-by-side layouts
 * - none: No legend displayed - progress bar only
 */
export type LegendPosition = 'bottom' | 'right' | 'none';
