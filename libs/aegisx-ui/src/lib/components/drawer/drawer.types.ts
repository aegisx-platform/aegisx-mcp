/**
 * Drawer Component Type Definitions
 *
 * Type definitions for the AegisX Drawer component, including position
 * and size configuration options.
 */

// ============================================================================
// Drawer Position
// ============================================================================

/**
 * Drawer position on the screen
 *
 * Determines from which edge the drawer slides into view.
 * - **left**: Slides in from the left edge (vertical drawer)
 * - **right**: Slides in from the right edge (vertical drawer)
 * - **top**: Slides in from the top edge (horizontal sheet)
 * - **bottom**: Slides in from the bottom edge (horizontal sheet)
 *
 * @example
 * ```typescript
 * // Side drawer from right
 * <ax-drawer position="right" size="md">
 *   Content here
 * </ax-drawer>
 *
 * // Bottom sheet on mobile
 * <ax-drawer position="bottom" size="sm">
 *   Mobile content
 * </ax-drawer>
 * ```
 *
 * @default 'right'
 */
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

// ============================================================================
// Drawer Size
// ============================================================================

/**
 * Drawer size preset
 *
 * Predefined size options for consistent spacing and layout.
 * Actual dimensions vary based on drawer position:
 *
 * **For side drawers (left/right):**
 * - **sm**: 320px width
 * - **md**: 400px width (default)
 * - **lg**: 500px width
 * - **xl**: 640px width
 * - **full**: 100% of viewport width
 *
 * **For bottom drawers (top/bottom):**
 * - **sm**: 200px height
 * - **md**: 320px height (default)
 * - **lg**: 480px height
 * - **xl**: 640px height
 * - **full**: 100% of viewport height
 *
 * @example
 * ```typescript
 * // Medium side drawer (400px wide)
 * <ax-drawer position="right" size="md">
 *   Sidebar content
 * </ax-drawer>
 *
 * // Small bottom sheet (200px tall)
 * <ax-drawer position="bottom" size="sm">
 *   Quick actions
 * </ax-drawer>
 *
 * // Full-width drawer
 * <ax-drawer position="right" size="full">
 *   Full panel content
 * </ax-drawer>
 * ```
 *
 * @default 'md'
 * @see {@link DrawerPosition} for drawer position configuration
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
