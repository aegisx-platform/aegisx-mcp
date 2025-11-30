/**
 * List Widget Configuration
 */
export interface ListWidgetConfig {
  /** Widget title */
  title: string;

  /** Max items to display */
  maxItems?: number;

  /** Show item icons */
  showIcons?: boolean;

  /** Show item metadata */
  showMeta?: boolean;

  /** Clickable items */
  clickable?: boolean;

  /** Compact mode */
  compact?: boolean;

  /** Show dividers between items */
  divided?: boolean;
}

/**
 * List Widget Data
 */
export interface ListWidgetData {
  items: WidgetListItem[];
}

export interface WidgetListItem {
  /** Unique ID */
  id: string;

  /** Primary text */
  title: string;

  /** Secondary text */
  subtitle?: string;

  /** Material icon */
  icon?: string;

  /** Icon color */
  iconColor?: string;

  /** Metadata (right side) */
  meta?: string;

  /** Status badge */
  status?: ListItemStatus;

  /** Link URL */
  url?: string;
}

export type ListItemStatus =
  | 'active'
  | 'pending'
  | 'completed'
  | 'error'
  | 'warning';

/**
 * Default configuration
 */
export const LIST_WIDGET_DEFAULTS: ListWidgetConfig = {
  title: 'List',
  maxItems: 5,
  showIcons: true,
  showMeta: true,
  clickable: false,
  compact: false,
  divided: true,
};
