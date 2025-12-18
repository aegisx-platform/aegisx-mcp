/**
 * Description List Component Type Definitions
 *
 * Type definitions for the Description List component (@aegisx/ui).
 * Container for organizing field-display components in structured layouts.
 */

/**
 * Description List Layout Mode
 *
 * Defines how fields are arranged:
 * - horizontal: Label and value side-by-side (default)
 * - vertical: Label stacked above value
 * - grid: Multi-column grid layout
 */
export type DescriptionListLayout = 'horizontal' | 'vertical' | 'grid';

/**
 * Description List Grid Columns
 *
 * Number of columns in grid layout mode.
 * Only applies when layout is set to 'grid'.
 * - 1: Single column
 * - 2: Two columns (default for grid)
 * - 3: Three columns
 */
export type DescriptionListColumns = 1 | 2 | 3;

/**
 * Description List Size Options
 *
 * Controls spacing and text size:
 * - sm: Small - compact spacing for dense layouts
 * - md: Medium - default balanced spacing
 * - lg: Large - generous spacing for prominent display
 */
export type DescriptionListSize = 'sm' | 'md' | 'lg';
