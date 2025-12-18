/**
 * Breadcrumb Component Types
 *
 * Type definitions for the breadcrumb navigation component.
 */

/**
 * Represents a single item in the breadcrumb trail.
 *
 * @example
 * ```typescript
 * const homeItem: BreadcrumbItem = {
 *   label: 'Home',
 *   url: '/',
 *   icon: 'home'
 * };
 *
 * const currentPage: BreadcrumbItem = {
 *   label: 'Products'
 *   // No URL - this is the current page
 * };
 * ```
 */
export interface BreadcrumbItem {
  /**
   * Display text for the breadcrumb item.
   */
  label: string;

  /**
   * Optional URL for navigation.
   * If omitted, the item is treated as the current page (not clickable).
   */
  url?: string;

  /**
   * Optional Material icon name to display before the label.
   *
   * @example
   * ```typescript
   * icon: 'home'
   * icon: 'dashboard'
   * ```
   */
  icon?: string;
}

/**
 * Size variants for the breadcrumb component.
 *
 * Controls the font size and spacing of breadcrumb items.
 *
 * - `sm` - Small size for compact layouts
 * - `md` - Medium size (default)
 * - `lg` - Large size for emphasis
 *
 * @example
 * ```typescript
 * <ax-breadcrumb [items]="items" size="lg"></ax-breadcrumb>
 * ```
 */
export type BreadcrumbSize = 'sm' | 'md' | 'lg';
