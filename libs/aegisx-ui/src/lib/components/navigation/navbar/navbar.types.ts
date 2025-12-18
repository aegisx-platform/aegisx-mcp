/**
 * Navbar Component Types
 *
 * Type definitions for the enterprise navigation bar component.
 */

/**
 * Visual style variant for the navbar.
 *
 * - `default` - Standard navbar with subtle background
 * - `transparent` - Transparent background (useful for hero sections)
 * - `solid` - Solid background color without transparency
 * - `bordered` - Navbar with bottom border
 *
 * @example
 * ```typescript
 * <ax-navbar variant="transparent"></ax-navbar>
 * ```
 */
export type NavbarVariant = 'default' | 'transparent' | 'solid' | 'bordered';

/**
 * Positioning behavior for the navbar.
 *
 * - `fixed` - Fixed to top of viewport (stays visible when scrolling)
 * - `sticky` - Sticks to top when scrolling past it
 * - `static` - Normal document flow positioning
 *
 * @example
 * ```typescript
 * <ax-navbar position="sticky"></ax-navbar>
 * ```
 */
export type NavbarPosition = 'fixed' | 'sticky' | 'static';

/**
 * Height presets for the navbar.
 *
 * Controls the overall height and padding of the navbar.
 *
 * - `sm` - Small/compact navbar (48px typical height)
 * - `md` - Medium navbar (64px typical height) - default
 * - `lg` - Large navbar (80px typical height)
 *
 * @example
 * ```typescript
 * <ax-navbar height="sm"></ax-navbar>
 * ```
 */
export type NavbarHeight = 'sm' | 'md' | 'lg';

/**
 * Theme mode for the navbar appearance.
 *
 * - `light` - Light theme colors
 * - `dark` - Dark theme colors
 * - `auto` - Automatically adapts to system/app theme
 *
 * @example
 * ```typescript
 * <ax-navbar theme="dark"></ax-navbar>
 * ```
 */
export type NavbarTheme = 'light' | 'dark' | 'auto';

/**
 * Predefined color schemes for the navbar.
 *
 * Provides themed color combinations inspired by modern design systems.
 *
 * - `default` - Uses default theme colors
 * - `primary` - Uses primary brand color
 * - `charcoal` - Dark charcoal gray
 * - `slate` - Light slate gray
 * - `slate-dark` - Dark slate gray
 * - `ocean` - Ocean blue
 * - `ocean-dark` - Deep ocean blue
 * - `royal` - Royal purple
 * - `royal-dark` - Deep royal purple
 * - `forest` - Forest green
 * - `amber` - Warm amber
 *
 * @example
 * ```typescript
 * <ax-navbar color="ocean-dark"></ax-navbar>
 * ```
 */
export type NavbarColor =
  | 'default'
  | 'primary'
  | 'charcoal'
  | 'slate'
  | 'slate-dark'
  | 'ocean'
  | 'ocean-dark'
  | 'royal'
  | 'royal-dark'
  | 'forest'
  | 'amber';

/**
 * Horizontal alignment for navigation items in the center zone.
 *
 * - `start` - Align navigation to the start (left in LTR)
 * - `center` - Center navigation items
 * - `end` - Align navigation to the end (right in LTR)
 *
 * @example
 * ```typescript
 * <ax-navbar navAlign="start"></ax-navbar>
 * ```
 */
export type NavbarNavAlign = 'start' | 'center' | 'end';
