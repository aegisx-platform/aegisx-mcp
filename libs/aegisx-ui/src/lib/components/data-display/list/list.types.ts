/**
 * List Component Type Definitions
 *
 * Type definitions for the List component (@aegisx/ui).
 * Provides types for displaying lists of items with consistent styling.
 */

/**
 * List Item Configuration
 *
 * Defines the structure of a single list item.
 *
 * @example
 * const item: ListItem = {
 *   title: 'John Doe',
 *   description: 'Software Engineer',
 *   icon: 'person',
 *   meta: 'Active',
 *   disabled: false
 * };
 */
export interface ListItem {
  /** Primary text displayed in the list item */
  title: string;

  /** Optional secondary text shown below the title */
  description?: string;

  /** Optional Material Icon name to display */
  icon?: string;

  /** Optional metadata text shown on the right side */
  meta?: string;

  /** Whether the item is disabled (grayed out and non-interactive) */
  disabled?: boolean;
}

/**
 * List Size Options
 *
 * Controls the height and padding of list items:
 * - sm: Small - compact for dense data display
 * - md: Medium - default comfortable size
 * - lg: Large - spacious for prominent items
 */
export type ListSize = 'sm' | 'md' | 'lg';
