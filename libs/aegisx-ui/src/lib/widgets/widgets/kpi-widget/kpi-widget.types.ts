/**
 * KPI Widget Configuration
 */
export interface KpiWidgetConfig {
  /** Widget title */
  title: string;

  /** Subtitle or description */
  subtitle?: string;

  /** Material icon name */
  icon?: string;

  /** Value format */
  format: KpiFormat;

  /** Currency code (for currency format) */
  currency?: string;

  /** Decimal places */
  decimals?: number;

  /** Show trend indicator */
  showTrend?: boolean;

  /** Color theme */
  color?: KpiColor;

  /** Compact mode */
  compact?: boolean;
}

export type KpiFormat = 'number' | 'currency' | 'percent' | 'compact';
export type KpiColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type KpiTrend = 'up' | 'down' | 'neutral';

/**
 * KPI Widget Data
 */
export interface KpiWidgetData {
  /** Main value */
  value: number;

  /** Change value (absolute or percentage) */
  change?: number;

  /** Change is percentage */
  changeIsPercent?: boolean;

  /** Trend direction */
  trend?: KpiTrend;

  /** Previous period value */
  previousValue?: number;

  /** Label for previous period */
  previousLabel?: string;
}

/**
 * Default configuration
 */
export const KPI_WIDGET_DEFAULTS: KpiWidgetConfig = {
  title: 'KPI',
  format: 'number',
  decimals: 0,
  showTrend: true,
  color: 'default',
  compact: false,
};
