import { Type } from '@angular/core';

// ============================================================================
// Widget Category & Status
// ============================================================================

export type WidgetCategory = 'display' | 'chart' | 'data' | 'action' | 'custom';

export type WidgetStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

// ============================================================================
// Widget Size
// ============================================================================

export interface WidgetSize {
  cols: number;
  rows: number;
}

export interface WidgetSizeConstraints {
  minSize: WidgetSize;
  maxSize?: WidgetSize;
  defaultSize: WidgetSize;
}

// ============================================================================
// Widget Position (in grid)
// ============================================================================

export interface WidgetPosition extends WidgetSize {
  x: number;
  y: number;
}

// ============================================================================
// Data Source Configuration
// ============================================================================

export interface WidgetDataSource {
  /** REST API endpoint */
  endpoint?: string;

  /** Query parameters */
  params?: Record<string, unknown>;

  /** WebSocket channel for real-time updates */
  wsChannel?: string;

  /** Auto-refresh interval in ms (0 = disabled) */
  refreshInterval?: number;

  /** Transform function name (registered in app) */
  transform?: string;
}

// ============================================================================
// Widget Definition (Registry Entry)
// ============================================================================

export interface WidgetDefinition<TConfig = unknown> {
  /** Unique widget ID (e.g., 'ax-kpi-widget') */
  id: string;

  /** Display name */
  name: string;

  /** Description for palette tooltip */
  description: string;

  /** Material icon name */
  icon: string;

  /** Widget category */
  category: WidgetCategory;

  /** Widget status */
  status?: WidgetStatus;

  /** Angular component class */
  component: Type<unknown>;

  /** Size constraints */
  sizes: WidgetSizeConstraints;

  /** Default configuration */
  defaultConfig: TConfig;

  /** JSON Schema for config validation (optional) */
  configSchema?: object;

  /** Preview image URL for palette (optional) */
  thumbnail?: string;

  /** Tags for search/filter */
  tags?: string[];
}

// ============================================================================
// Widget Instance (In Dashboard)
// ============================================================================

export interface WidgetInstance<TConfig = Record<string, unknown>> {
  /** Unique instance ID within dashboard */
  instanceId: string;

  /** Reference to WidgetDefinition.id */
  widgetId: string;

  /** Position and size in grid */
  position: WidgetPosition;

  /** Widget-specific configuration */
  config: TConfig;

  /** Data source configuration */
  dataSource?: WidgetDataSource;

  /** Instance title override */
  title?: string;

  /** Visibility flag */
  visible?: boolean;
}

// ============================================================================
// Dashboard Configuration
// ============================================================================

export interface DashboardConfig {
  /** Unique dashboard ID */
  id: string;

  /** Dashboard name */
  name: string;

  /** Description */
  description?: string;

  /** Grid columns */
  columns: number;

  /** Row height in pixels */
  rowHeight: number;

  /** Gap between widgets in pixels */
  gap: number;

  /** Widget instances */
  widgets: WidgetInstance[];

  /** Dashboard template ID (if created from template) */
  templateId?: string;

  /** Metadata */
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DashboardSummary {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  updatedAt: string;
  createdBy?: string;
}

// ============================================================================
// Dashboard Defaults
// ============================================================================

export const DASHBOARD_DEFAULTS = {
  columns: 4,
  rowHeight: 160,
  gap: 16,
} as const;

// ============================================================================
// Widget Config Change Event
// ============================================================================

export interface WidgetConfigChangeEvent<TConfig = unknown> {
  instanceId: string;
  changes: Partial<TConfig>;
}

// ============================================================================
// Widget Data Event
// ============================================================================

export interface WidgetDataEvent<TData = unknown> {
  instanceId: string;
  data: TData;
  timestamp: number;
  source: 'fetch' | 'realtime' | 'cache';
}

// ============================================================================
// Widget Error Event
// ============================================================================

export interface WidgetErrorEvent {
  instanceId: string;
  error: string;
  code?: string;
  retryable?: boolean;
}
