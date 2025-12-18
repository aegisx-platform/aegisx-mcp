/**
 * Navigation Component Types
 *
 * Type definitions for the main navigation component that renders navigation items.
 *
 * Note: This file contains component-specific types for the navigation renderer.
 * For navigation item definitions, see `../../types/ax-navigation.types.ts`.
 */

/**
 * Layout orientation for the navigation component.
 *
 * - `vertical` - Vertical navigation (default, for sidebars)
 * - `horizontal` - Horizontal navigation (for top navigation bars)
 *
 * @example
 * ```typescript
 * <ax-navigation [navigation]="items" layout="horizontal"></ax-navigation>
 * ```
 */
export type NavigationLayout = 'vertical' | 'horizontal';

/**
 * Visual appearance variant for the navigation component.
 *
 * - `default` - Standard appearance with full labels and spacing
 * - `compact` - Compact appearance with icons only (labels hidden)
 * - `dense` - Dense appearance with reduced spacing
 *
 * @example
 * ```typescript
 * <ax-navigation [navigation]="items" appearance="compact"></ax-navigation>
 * ```
 */
export type NavigationAppearance = 'default' | 'compact' | 'dense';
