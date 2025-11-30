/**
 * Chart Widget Configuration
 */
export interface ChartWidgetConfig {
  /** Widget title */
  title: string;

  /** Chart type */
  type: ChartType;

  /** Show legend */
  showLegend?: boolean;

  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  /** Show grid lines */
  showGrid?: boolean;

  /** Animate chart */
  animate?: boolean;

  /** Chart colors */
  colors?: string[];

  /** Show data labels */
  showLabels?: boolean;

  /** Stacked (for bar charts) */
  stacked?: boolean;

  /** Smooth curves (for line/area) */
  smooth?: boolean;

  /** Fill area (for line charts) */
  fill?: boolean;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area';

/**
 * Chart Widget Data
 */
export interface ChartWidgetData {
  /** X-axis labels */
  labels: string[];

  /** Data series */
  series: ChartSeries[];
}

export interface ChartSeries {
  /** Series name */
  name: string;

  /** Data points */
  data: number[];

  /** Series color (optional) */
  color?: string;
}

/**
 * Default configuration
 */
export const CHART_WIDGET_DEFAULTS: ChartWidgetConfig = {
  title: 'Chart',
  type: 'line',
  showLegend: true,
  legendPosition: 'bottom',
  showGrid: true,
  animate: true,
  showLabels: false,
  stacked: false,
  smooth: true,
  fill: false,
};

/**
 * Default colors
 */
export const CHART_DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];
