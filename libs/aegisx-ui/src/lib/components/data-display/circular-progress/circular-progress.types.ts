/**
 * Circular Progress Component Type Definitions
 *
 * Type definitions for the Circular Progress component (@aegisx/ui).
 * SVG-based circular progress indicator for displaying percentage metrics.
 */

/**
 * Circular Progress Variant
 *
 * Defines the visual style of the progress circle:
 * - ring: Thin circular ring (minimal design)
 * - donut: Thicker circular band (donut chart style)
 * - gauge: Semi-circle gauge (speedometer style)
 */
export type CircularProgressVariant = 'ring' | 'donut' | 'gauge';

/**
 * Circular Progress Size Options
 *
 * Controls the dimensions of the progress circle:
 * - sm: Small (48px diameter)
 * - md: Medium (96px diameter) - default
 * - lg: Large (144px diameter)
 * - xl: Extra large (192px diameter)
 */
export type CircularProgressSize = 'sm' | 'md' | 'lg' | 'xl';
