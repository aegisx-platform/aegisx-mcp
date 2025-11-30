/**
 * Table Widget Configuration
 */
export interface TableWidgetConfig {
  /** Widget title */
  title: string;

  /** Column definitions */
  columns: TableColumn[];

  /** Page size */
  pageSize?: number;

  /** Show pagination */
  showPagination?: boolean;

  /** Enable sorting */
  sortable?: boolean;

  /** Striped rows */
  striped?: boolean;

  /** Compact mode */
  compact?: boolean;

  /** Show row numbers */
  showRowNumbers?: boolean;
}

export interface TableColumn {
  /** Column key (property name) */
  key: string;

  /** Column header */
  label: string;

  /** Column width */
  width?: string;

  /** Text alignment */
  align?: 'left' | 'center' | 'right';

  /** Data type for formatting */
  type?: 'text' | 'number' | 'currency' | 'date' | 'status';

  /** Sortable */
  sortable?: boolean;
}

/**
 * Table Widget Data
 */
export interface TableWidgetData {
  /** Table rows */
  items: Record<string, unknown>[];

  /** Total count (for pagination) */
  total?: number;
}

/**
 * Default configuration
 */
export const TABLE_WIDGET_DEFAULTS: TableWidgetConfig = {
  title: 'Table',
  columns: [],
  pageSize: 5,
  showPagination: true,
  sortable: true,
  striped: false,
  compact: false,
  showRowNumbers: false,
};
