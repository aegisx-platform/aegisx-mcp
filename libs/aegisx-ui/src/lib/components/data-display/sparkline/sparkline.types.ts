/**
 * Sparkline Component Type Definitions
 *
 * Type definitions for the Sparkline component (@aegisx/ui).
 * Lightweight SVG-based sparkline charts for showing trends in inline metrics.
 */

/**
 * Sparkline Chart Variant
 *
 * Defines the visualization style:
 * - line: Simple line chart (stroke only)
 * - area: Area chart (filled below the line)
 */
export type SparklineVariant = 'line' | 'area';

/**
 * Sparkline Size Options
 *
 * Controls the chart dimensions:
 * - sm: Small (height: 24px) - compact inline display
 * - md: Medium (height: 48px) - default size
 * - lg: Large (height: 72px) - prominent display
 */
export type SparklineSize = 'sm' | 'md' | 'lg';
