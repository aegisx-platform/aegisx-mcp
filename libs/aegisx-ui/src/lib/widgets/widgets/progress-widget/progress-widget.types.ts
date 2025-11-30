/**
 * Progress Widget Configuration
 */
export interface ProgressWidgetConfig {
  /** Widget title */
  title: string;

  /** Progress type */
  type: ProgressType;

  /** Max value */
  max?: number;

  /** Show value label */
  showLabel?: boolean;

  /** Show percentage */
  showPercent?: boolean;

  /** Color */
  color?: ProgressColor;

  /** Auto color based on value */
  autoColor?: boolean;

  /** Thresholds for auto color */
  thresholds?: {
    warning: number;
    error: number;
  };
}

export type ProgressType = 'circular' | 'linear' | 'gauge';
export type ProgressColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * Progress Widget Data
 */
export interface ProgressWidgetData {
  /** Current value */
  value: number;

  /** Label text */
  label?: string;

  /** Secondary value */
  secondaryValue?: number;

  /** Secondary label */
  secondaryLabel?: string;
}

/**
 * Default configuration
 */
export const PROGRESS_WIDGET_DEFAULTS: ProgressWidgetConfig = {
  title: 'Progress',
  type: 'circular',
  max: 100,
  showLabel: true,
  showPercent: true,
  color: 'primary',
  autoColor: false,
  thresholds: {
    warning: 70,
    error: 90,
  },
};
