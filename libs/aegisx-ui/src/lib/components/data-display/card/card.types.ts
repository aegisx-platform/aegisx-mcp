/**
 * Card Component Type Definitions
 *
 * Type definitions for the Card component (@aegisx/ui).
 * Provides types for configuring card styling, variants, and interactive states.
 */

/**
 * Card Visual Variant
 *
 * Defines the card's visual style:
 * - default: Flat card with subtle background (no border or shadow)
 * - outlined: Card with border and no shadow
 * - elevated: Card with shadow for depth effect
 */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/**
 * Card Size Options
 *
 * Controls the card padding and spacing:
 * - sm: Small - compact padding for dense layouts
 * - md: Medium - default balanced spacing
 * - lg: Large - generous padding for prominent display
 */
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * Card Color Theme
 *
 * Defines the semantic color scheme:
 * - default: Default theme (follows global theme)
 * - primary: Primary brand color
 * - success: Green - success or positive state
 * - warning: Orange/Yellow - warning or attention
 * - error: Red - error or critical state
 * - info: Blue - informational content
 * - neutral: Gray - neutral state
 */
export type CardColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/**
 * Card Color Intensity
 *
 * Controls how strongly the color is applied:
 * - filled: Full color background (higher contrast)
 * - subtle: Light tint background (lower contrast)
 */
export type CardColorIntensity = 'filled' | 'subtle';

/**
 * Card Border Width
 *
 * Defines the border thickness in pixels:
 * - '1': 1px border (default)
 * - '2': 2px border
 * - '3': 3px border
 * - '4': 4px border (maximum thickness)
 *
 * Note: Can also accept custom string values for flexibility
 */
export type CardBorderWidth = '1' | '2' | '3' | '4';
