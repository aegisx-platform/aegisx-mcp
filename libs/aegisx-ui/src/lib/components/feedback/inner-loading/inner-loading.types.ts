/**
 * Inner Loading Component Types
 *
 * Type definitions for the AxInnerLoading feedback component.
 */

/**
 * Spinner size determines the dimensions of the loading indicator.
 *
 * @example
 * // Using different sizes
 * <ax-inner-loading [showing]="isLoading" size="sm"></ax-inner-loading>
 * <ax-inner-loading [showing]="isLoading" size="md"></ax-inner-loading>
 * <ax-inner-loading [showing]="isLoading" size="lg"></ax-inner-loading>
 *
 * @see {@link AxInnerLoadingComponent}
 */
export type InnerLoadingSize = 'sm' | 'md' | 'lg';

/**
 * Spinner color determines the theme of the loading indicator.
 *
 * Uses Material Design color palette for consistency.
 *
 * @example
 * // Using different colors
 * <ax-inner-loading [showing]="isLoading" color="primary"></ax-inner-loading>
 * <ax-inner-loading [showing]="isLoading" color="accent"></ax-inner-loading>
 * <ax-inner-loading [showing]="isLoading" color="warn"></ax-inner-loading>
 * <ax-inner-loading [showing]="isLoading" color="light"></ax-inner-loading>
 *
 * @see {@link AxInnerLoadingComponent}
 */
export type InnerLoadingColor = 'primary' | 'accent' | 'warn' | 'light';
