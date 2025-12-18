/**
 * KPI Card Component Type Definitions
 *
 * Type definitions for the KPI Card component (@aegisx/ui).
 * Specialized card for displaying Key Performance Indicators with various layouts and visual accents.
 * Based on Tremor-inspired design patterns.
 */

/**
 * KPI Card Visual Variant
 *
 * Defines the layout and style of the KPI card:
 * - simple: Clean minimal layout with value and label
 * - badge: Includes a colored badge for change indicators
 * - compact: Dense layout with reduced spacing
 * - accent: Features a colored accent bar on one edge
 * - visual-indicator: Includes visual elements like sparklines or icons
 * - progress: Shows progress bar or percentage completion
 * - segmented: Displays segmented progress for multi-category metrics
 */
export type KpiCardVariant =
  | 'simple'
  | 'badge'
  | 'compact'
  | 'accent'
  | 'visual-indicator'
  | 'progress'
  | 'segmented';

/**
 * KPI Card Size Options
 *
 * Controls the overall dimensions and padding:
 * - sm: Small - compact for dashboard tiles
 * - md: Medium - default balanced size
 * - lg: Large - prominent display for key metrics
 */
export type KpiCardSize = 'sm' | 'md' | 'lg';

/**
 * KPI Card Trend Direction
 *
 * Indicates the direction of metric change:
 * - up: Positive trend (increasing) - typically shown with green
 * - down: Negative trend (decreasing) - typically shown with red
 * - neutral: No significant change or non-directional metric
 */
export type KpiCardTrend = 'up' | 'down' | 'neutral';

/**
 * KPI Card Badge Type
 *
 * Semantic color for the badge variant:
 * - success: Green - positive performance
 * - error: Red - negative performance or alert
 * - warning: Orange/Yellow - warning or attention needed
 * - info: Blue - informational
 * - neutral: Gray - neutral status
 */
export type KpiCardBadgeType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral';

/**
 * KPI Card Accent Bar Position
 *
 * Defines where the colored accent bar is displayed:
 * - left: Vertical bar on the left edge (most common)
 * - right: Vertical bar on the right edge
 * - top: Horizontal bar on the top edge
 * - bottom: Horizontal bar on the bottom edge
 */
export type KpiCardAccentPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * KPI Card Accent Color
 *
 * Color scheme for the accent bar:
 * - primary: Primary brand color
 * - info: Blue - informational metrics
 * - success: Green - positive metrics
 * - warning: Orange/Yellow - metrics needing attention
 * - error: Red - critical or negative metrics
 */
export type KpiCardAccentColor =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
