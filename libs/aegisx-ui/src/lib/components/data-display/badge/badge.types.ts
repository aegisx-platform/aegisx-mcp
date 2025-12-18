/**
 * Badge Component Type Definitions
 *
 * Type definitions for the Badge component (@aegisx/ui).
 * Provides types for configuring badge styling, size, and behavior.
 */

/**
 * Badge Visual Variant
 *
 * Controls the badge styling pattern:
 * - outlined: Border with transparent background
 * - soft: Subtle background with no border
 * - outlined-strong: Strong border with background fill
 */
export type BadgeVariant = 'outlined' | 'soft' | 'outlined-strong';

/**
 * Badge Semantic Type
 *
 * Defines the semantic meaning and color scheme:
 * - success: Green - positive status or successful operation
 * - error: Red - error state or failed operation
 * - warning: Orange/Yellow - warning or caution
 * - info: Blue - informational status
 * - neutral: Gray - neutral or default state
 */
export type BadgeType = 'success' | 'error' | 'warning' | 'info' | 'neutral';

/**
 * Badge Size Options
 *
 * Controls the badge dimensions and padding:
 * - sm: Small - compact size for dense layouts
 * - md: Medium - default size
 * - lg: Large - prominent display
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge Border Radius
 *
 * Defines the corner rounding:
 * - none: No rounding (square corners)
 * - sm: Small radius (2px)
 * - md: Medium radius (4px)
 * - lg: Large radius (8px)
 * - full: Fully rounded (pill shape)
 */
export type BadgeRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';
