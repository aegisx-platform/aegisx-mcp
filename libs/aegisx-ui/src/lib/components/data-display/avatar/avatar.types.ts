/**
 * Avatar Component Type Definitions
 *
 * Type definitions for the Avatar component (@aegisx/ui).
 * Provides types for configuring avatar size and shape.
 */

/**
 * Avatar Size Options
 *
 * Controls the dimensions of the avatar component.
 * - xs: Extra small (16px)
 * - sm: Small (24px)
 * - md: Medium (32px) - default
 * - lg: Large (48px)
 * - xl: Extra large (64px)
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar Shape Options
 *
 * Defines the border radius style of the avatar.
 * - circle: Circular avatar (50% border radius)
 * - square: Square avatar with rounded corners
 */
export type AvatarShape = 'circle' | 'square';
