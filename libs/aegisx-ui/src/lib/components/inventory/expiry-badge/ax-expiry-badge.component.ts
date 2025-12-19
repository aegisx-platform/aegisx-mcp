import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExpiryInfo, ExpiryStatus } from './ax-expiry-badge.component.types';

/**
 * Expiry Badge Component
 * ================================================================
 *
 * A signal-based component that displays color-coded expiry status
 * badges for inventory items. Shows visual indicators and countdown
 * information with full WCAG 2.1 AA accessibility compliance.
 *
 * Key Features:
 * - Color-coded status (Safe/Green, Warning/Yellow, Critical/Red, Expired/Gray)
 * - Countdown display with configurable thresholds
 * - Size variants (sm/md/lg) and styles (outlined/soft/solid)
 * - Compact mode for tables (icon-only with tooltip)
 * - Full tooltip with exact expiry date and time
 * - WCAG 2.1 AA compliant with proper ARIA labels
 * - Reactive updates using Angular signals
 *
 * Status Rules:
 * - Safe: Days > warningDays (default 30)
 * - Warning: warningDays >= Days > criticalDays (default 7)
 * - Critical: criticalDays >= Days > 0
 * - Expired: Days < 0
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ax-expiry-badge
 *   [expiryDate]="product.expiryDate"
 *   (onClick)="onExpiryClick($event)">
 * </ax-expiry-badge>
 *
 * <!-- With custom thresholds -->
 * <ax-expiry-badge
 *   [expiryDate]="product.expiryDate"
 *   [warningDays]="14"
 *   [criticalDays]="3"
 *   [size]="'lg'"
 *   [variant]="'solid'">
 * </ax-expiry-badge>
 *
 * <!-- Compact mode for tables -->
 * <ax-expiry-badge
 *   [expiryDate]="item.expiryDate"
 *   [compact]="true"
 *   [size]="'sm'">
 * </ax-expiry-badge>
 * ```
 */
@Component({
  selector: 'ax-expiry-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './ax-expiry-badge.component.html',
  styleUrl: './ax-expiry-badge.component.scss',
})
export class AxExpiryBadgeComponent {
  /**
   * Expiry date to evaluate (required)
   */
  expiryDate = input.required<Date>();

  /**
   * Days threshold for warning status (default: 30)
   */
  warningDays = input<number>(30);

  /**
   * Days threshold for critical status (default: 7)
   */
  criticalDays = input<number>(7);

  /**
   * Show countdown text (e.g., "15 days left") (default: true)
   */
  showCountdown = input<boolean>(true);

  /**
   * Show status icon (default: true)
   */
  showIcon = input<boolean>(true);

  /**
   * Badge size: 'sm' (20px), 'md' (24px), 'lg' (32px) (default: 'md')
   */
  size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Badge style variant: 'outlined', 'soft', 'solid' (default: 'soft')
   */
  variant = input<'outlined' | 'soft' | 'solid'>('soft');

  /**
   * Compact mode for tables (icon only with tooltip) (default: false)
   */
  compact = input<boolean>(false);

  /**
   * Click event emitter with expiry information
   */
  onClick = output<ExpiryInfo>();

  /**
   * Calculate days until expiry
   * Positive = days remaining, Negative = days expired
   * Returns 0 if expiring today
   */
  daysUntilExpiry = computed(() => {
    const now = new Date();
    const expiry = new Date(this.expiryDate());

    // Set expiry to end of day for accurate comparison
    expiry.setHours(23, 59, 59, 999);

    // Calculate difference in days
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  });

  /**
   * Compute expiry status based on days and thresholds
   */
  expiryStatus = computed((): ExpiryStatus => {
    const days = this.daysUntilExpiry();

    if (days < 0) {
      return 'expired';
    }
    if (days <= this.criticalDays()) {
      return 'critical';
    }
    if (days <= this.warningDays()) {
      return 'warning';
    }
    return 'safe';
  });

  /**
   * Map status to badge type (success, warning, error, neutral)
   */
  badgeType = computed((): 'success' | 'warning' | 'error' | 'neutral' => {
    const status = this.expiryStatus();
    const typeMap: Record<
      ExpiryStatus,
      'success' | 'warning' | 'error' | 'neutral'
    > = {
      safe: 'success',
      warning: 'warning',
      critical: 'error',
      expired: 'neutral',
    };
    return typeMap[status];
  });

  /**
   * Generate badge display text based on status and countdown setting
   */
  badgeText = computed(() => {
    if (this.compact()) {
      return '';
    }

    const status = this.expiryStatus();
    const days = this.daysUntilExpiry();

    if (!this.showCountdown()) {
      // Return status text only
      const statusMap: Record<ExpiryStatus, string> = {
        safe: 'Safe',
        warning: 'Warning',
        critical: 'Critical',
        expired: 'EXPIRED',
      };
      return statusMap[status];
    }

    // Return status with countdown
    if (status === 'expired') {
      const daysAgo = Math.abs(days);
      return daysAgo === 1
        ? 'Expired 1 day ago'
        : `Expired ${daysAgo} days ago`;
    }

    if (days === 0) {
      return 'Expires Today';
    }

    if (days === 1) {
      return 'Expires Tomorrow';
    }

    return `${days} day${days !== 1 ? 's' : ''} left`;
  });

  /**
   * Get status icon name from Material Icons
   */
  statusIcon = computed(() => {
    const status = this.expiryStatus();
    const iconMap: Record<ExpiryStatus, string> = {
      safe: 'check_circle',
      warning: 'warning',
      critical: 'error',
      expired: 'cancel',
    };
    return iconMap[status];
  });

  /**
   * Generate tooltip text with exact expiry date and time
   */
  tooltipText = computed(() => {
    const expiry = new Date(this.expiryDate());
    const dateStr = expiry.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = expiry.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Expiry: ${dateStr} at ${timeStr}`;
  });

  /**
   * Aria label for accessibility
   */
  ariaLabel = computed(() => {
    const status = this.expiryStatus();
    const days = this.daysUntilExpiry();

    if (status === 'expired') {
      return `Product expired ${Math.abs(days)} days ago`;
    }

    const message = this.badgeText();
    return `Expiry status: ${message}`;
  });

  /**
   * Handle badge click and emit expiry information
   */
  handleClick(): void {
    const info: ExpiryInfo = {
      expiryDate: this.expiryDate(),
      daysUntilExpiry: this.daysUntilExpiry(),
      status: this.expiryStatus(),
      message: this.badgeText(),
    };
    this.onClick.emit(info);
  }
}
