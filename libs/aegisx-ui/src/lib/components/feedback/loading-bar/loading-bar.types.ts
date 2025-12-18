/**
 * Loading Bar Component Types
 *
 * Type definitions for the AxLoadingBar feedback component.
 */

/**
 * Loading bar variant determines the color scheme of the progress indicator.
 *
 * Uses semantic color names for consistency with design system.
 *
 * @example
 * // Using different variants
 * <ax-loading-bar variant="primary"></ax-loading-bar>
 * <ax-loading-bar variant="success"></ax-loading-bar>
 * <ax-loading-bar variant="error"></ax-loading-bar>
 * <ax-loading-bar variant="warning"></ax-loading-bar>
 * <ax-loading-bar variant="info"></ax-loading-bar>
 *
 * @see {@link AxLoadingBarComponent}
 */
export type LoadingBarVariant =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';
