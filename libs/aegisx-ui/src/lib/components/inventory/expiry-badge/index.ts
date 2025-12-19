/**
 * Expiry Badge Component - Public API
 *
 * A signal-based badge component displaying color-coded product expiry status.
 * Features countdown display, multiple size/style variants, compact mode for tables,
 * and full WCAG 2.1 AA accessibility compliance.
 *
 * Usage:
 * ```html
 * <ax-expiry-badge
 *   [expiryDate]="product.expiryDate"
 *   [warningDays]="30"
 *   [criticalDays]="7"
 *   (onClick)="handleExpiryClick($event)">
 * </ax-expiry-badge>
 * ```
 */

export { AxExpiryBadgeComponent } from './ax-expiry-badge.component';

// Types
export type {
  ExpiryInfo,
  ExpiryStatus,
  BadgeSize,
  BadgeVariant,
  ExpiryBadgeConfig,
  ExpiryBadgeState,
  BadgeClassMap,
} from './ax-expiry-badge.component.types';
