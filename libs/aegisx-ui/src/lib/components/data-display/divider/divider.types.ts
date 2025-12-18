/**
 * Divider Component Type Definitions
 *
 * Type definitions for the Divider component (@aegisx/ui).
 * Provides types for configuring divider layout, style, and alignment.
 */

/**
 * Divider Layout Direction
 *
 * Defines the orientation of the divider:
 * - horizontal: Horizontal line (default) - divides vertically stacked content
 * - vertical: Vertical line - divides horizontally arranged content
 */
export type DividerLayout = 'horizontal' | 'vertical';

/**
 * Divider Border Style
 *
 * Controls the line style pattern:
 * - solid: Continuous solid line (default)
 * - dashed: Dashed line pattern
 * - dotted: Dotted line pattern
 */
export type DividerType = 'solid' | 'dashed' | 'dotted';

/**
 * Divider Content Alignment
 *
 * Defines the position of optional content (text/icon) within the divider:
 * - left: Align content to the left (horizontal layout)
 * - center: Center content (default)
 * - right: Align content to the right (horizontal layout)
 * - top: Align content to the top (vertical layout)
 * - bottom: Align content to the bottom (vertical layout)
 */
export type DividerAlign = 'left' | 'center' | 'right' | 'top' | 'bottom';
