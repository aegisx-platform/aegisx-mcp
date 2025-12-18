/**
 * Stats Card Component Type Definitions
 *
 * Type definitions for the Stats Card component (@aegisx/ui).
 * Provides types for displaying statistical metrics with trend indicators.
 */

/**
 * Stats Card Trend Direction
 *
 * Indicates the direction of metric change:
 * - up: Positive trend (increasing metric) - typically shown in green
 * - down: Negative trend (decreasing metric) - typically shown in red
 * - neutral: No significant change or non-directional metric - shown in gray
 */
export type StatsCardTrend = 'up' | 'down' | 'neutral';
