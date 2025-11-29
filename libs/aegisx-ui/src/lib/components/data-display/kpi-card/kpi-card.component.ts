import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiCardVariant =
  | 'simple'
  | 'badge'
  | 'compact'
  | 'accent'
  | 'visual-indicator';
export type KpiCardSize = 'sm' | 'md' | 'lg';
export type KpiCardTrend = 'up' | 'down' | 'neutral';
export type KpiCardBadgeType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral';
export type KpiCardAccentPosition = 'left' | 'right' | 'top' | 'bottom';
export type KpiCardAccentColor =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

/**
 * KPI Card Component
 *
 * A specialized card component for displaying Key Performance Indicators (KPIs)
 * with support for various layouts, badges, trends, and visual accents.
 *
 * Based on Tremor-inspired design patterns from card-examples.
 *
 * @example
 * // Simple KPI
 * <ax-kpi-card
 *   label="Unique visitors"
 *   [value]="10450"
 *   [change]="-12.5"
 *   changeType="negative">
 * </ax-kpi-card>
 *
 * @example
 * // With badge
 * <ax-kpi-card
 *   variant="badge"
 *   label="Daily active users"
 *   [value]="3450"
 *   badge="+12.1%"
 *   badgeType="success">
 * </ax-kpi-card>
 *
 * @example
 * // With color accent
 * <ax-kpi-card
 *   variant="accent"
 *   label="Monthly active users"
 *   [value]="996"
 *   accentColor="info"
 *   accentPosition="left">
 * </ax-kpi-card>
 */
@Component({
  selector: 'ax-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AxKpiCardComponent {
  /** Card variant */
  @Input() variant: KpiCardVariant = 'simple';

  /** Card size */
  @Input() size: KpiCardSize = 'md';

  /** KPI label/title */
  @Input() label = '';

  /** KPI value (number or formatted string) */
  @Input() value: string | number = '';

  /** Optional subtitle/description */
  @Input() subtitle = '';

  /** Change percentage (e.g., 12.5 for +12.5% or -12.5 for -12.5%) */
  @Input() change?: number;

  /** Change trend type (auto-calculated from change if not provided) */
  @Input() changeType?: KpiCardTrend;

  /** Optional change label (e.g., "vs last month") */
  @Input() changeLabel = '';

  /** Badge text (for badge variant) */
  @Input() badge = '';

  /** Badge type/color */
  @Input() badgeType: KpiCardBadgeType = 'neutral';

  /** Accent bar color */
  @Input() accentColor?: KpiCardAccentColor;

  /** Accent bar position */
  @Input() accentPosition: KpiCardAccentPosition = 'left';

  /** Compact spacing */
  @Input() compact = false;

  /** Hoverable effect */
  @Input() hoverable = false;

  /** Clickable cursor */
  @Input() clickable = false;

  /** Flat style (no shadow) */
  @Input() flat = false;

  /** Number of filled bars (for visual-indicator variant, 0-3) */
  @Input() barsFilled = 0;

  /** Total number of bars (for visual-indicator variant) */
  @Input() barsTotal = 3;

  /** Bar color (for visual-indicator variant) */
  @Input() barColor: KpiCardAccentColor = 'info';

  /** Supplementary text (for visual-indicator variant, e.g., "450/752") */
  @Input() supplementary = '';

  get cardClasses(): string {
    const classes = ['ax-kpi-card'];
    classes.push(`ax-kpi-card--${this.variant}`);
    classes.push(`ax-kpi-card--${this.size}`);
    if (this.compact) classes.push('ax-kpi-card--compact');
    if (this.hoverable) classes.push('ax-kpi-card--hoverable');
    if (this.clickable) classes.push('ax-kpi-card--clickable');
    if (this.flat) classes.push('ax-kpi-card--flat');
    if (this.accentColor)
      classes.push(`ax-kpi-card--accent-${this.accentColor}`);
    return classes.join(' ');
  }

  get accentClasses(): string {
    if (!this.accentColor) return '';
    const classes = ['ax-kpi-card__accent'];
    classes.push(`ax-kpi-card__accent--${this.accentPosition}`);
    classes.push(`ax-kpi-card__accent--${this.accentColor}`);
    return classes.join(' ');
  }

  get badgeClasses(): string {
    const classes = ['ax-kpi-card__badge'];
    classes.push(`ax-kpi-card__badge--${this.badgeType}`);
    return classes.join(' ');
  }

  get changeClasses(): string {
    const classes = ['ax-kpi-card__change'];
    const trend = this.changeType || this.calculateTrend();
    classes.push(`ax-kpi-card__change--${trend}`);
    return classes.join(' ');
  }

  get formattedChange(): string {
    if (this.change === undefined) return '';
    const sign = this.change > 0 ? '+' : '';
    return `${sign}${this.change}%`;
  }

  private calculateTrend(): KpiCardTrend {
    if (this.change === undefined) return 'neutral';
    if (this.change > 0) return 'up';
    if (this.change < 0) return 'down';
    return 'neutral';
  }

  /** Get array for rendering bars (visual-indicator variant) */
  get barsArray(): boolean[] {
    return Array(this.barsTotal)
      .fill(false)
      .map((_, index) => index < this.barsFilled);
  }

  get barClasses(): string {
    const classes = ['ax-kpi-card__bar'];
    classes.push(`ax-kpi-card__bar--${this.barColor}`);
    return classes.join(' ');
  }
}
