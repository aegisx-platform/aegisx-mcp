/**
 * Kbd Component Type Definitions
 *
 * Type definitions for the Kbd (Keyboard) component (@aegisx/ui).
 * Provides types for displaying keyboard shortcuts with platform-aware styling.
 */

/**
 * Kbd Visual Variant
 *
 * Controls the styling pattern of keyboard shortcuts:
 * - default: Filled background with border (default style)
 * - outline: Border only with transparent background
 * - ghost: Minimal styling with subtle background
 */
export type KbdVariant = 'default' | 'outline' | 'ghost';

/**
 * Kbd Size Options
 *
 * Controls the dimensions and padding of keyboard shortcuts:
 * - sm: Small - compact for inline text
 * - md: Medium - default size
 * - lg: Large - prominent display
 */
export type KbdSize = 'sm' | 'md' | 'lg';
