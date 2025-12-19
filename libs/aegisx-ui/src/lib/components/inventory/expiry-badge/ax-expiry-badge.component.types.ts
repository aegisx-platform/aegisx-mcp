/**
 * Expiry Badge Component - Type Definitions
 * ================================================================
 *
 * Complete type definitions for the Expiry Badge component,
 * supporting all status levels, configurations, and events.
 */

/**
 * Expiry status type
 * - safe: Days remaining > warningDays threshold
 * - warning: Days remaining between criticalDays and warningDays
 * - critical: Days remaining <= criticalDays
 * - expired: Expiry date has passed
 */
export type ExpiryStatus = 'safe' | 'warning' | 'critical' | 'expired';

/**
 * Badge size type
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge variant type
 */
export type BadgeVariant = 'outlined' | 'soft' | 'solid';

/**
 * Expiry information provided in click events
 */
export interface ExpiryInfo {
  /** Original expiry date */
  expiryDate: Date;

  /** Number of days until expiry (negative if expired) */
  daysUntilExpiry: number;

  /** Current expiry status */
  status: ExpiryStatus;

  /** Display message (e.g., "15 days left" or "Expired 3 days ago") */
  message: string;
}

/**
 * Configuration options for expiry badge
 */
export interface ExpiryBadgeConfig {
  /** Days threshold for warning status (default: 30) */
  warningDays?: number;

  /** Days threshold for critical status (default: 7) */
  criticalDays?: number;

  /** Show countdown text (default: true) */
  showCountdown?: boolean;

  /** Show status icon (default: true) */
  showIcon?: boolean;

  /** Badge size (default: 'md') */
  size?: BadgeSize;

  /** Badge variant (default: 'soft') */
  variant?: BadgeVariant;

  /** Compact mode for tables (default: false) */
  compact?: boolean;
}

/**
 * Expiry badge state interface (for state management)
 */
export interface ExpiryBadgeState {
  /** Current expiry status */
  status: ExpiryStatus;

  /** Days remaining until expiry */
  daysRemaining: number;

  /** Original expiry date */
  expiryDate: Date;

  /** Whether product is expired */
  isExpired: boolean;
}

/**
 * CSS class mapping for badge styling
 */
export interface BadgeClassMap {
  /** Container classes based on status */
  container: string;

  /** Icon classes */
  icon: string;

  /** Text classes */
  text: string;
}
