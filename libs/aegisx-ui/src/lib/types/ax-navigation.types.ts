/**
 * AegisX Navigation System Types
 * Unified navigation types for all layouts (Compact, Enterprise, Docs)
 */

/**
 * Badge Configuration
 */
export interface AxNavigationBadge {
  /** Badge content text or number */
  content?: string;
  /** Legacy: Badge title (same as content) */
  title?: string;
  /** Badge color type */
  type?: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  /** Legacy: CSS classes for custom styling */
  classes?: string;
}

/**
 * Unified Navigation Item Interface
 *
 * This is the primary navigation item type used across all layouts:
 * - AxCompactLayout (sidebar navigation)
 * - AxEnterpriseLayout (horizontal navigation)
 * - AxDocsLayout (documentation sidebar)
 */
export interface AxNavigationItem {
  /** Unique identifier */
  id: string;

  /** Display title */
  title: string;

  /** Optional subtitle (for detailed navigation) */
  subtitle?: string;

  /** Item type - determines rendering behavior */
  type?:
    | 'item'
    | 'basic'
    | 'group'
    | 'collapsible'
    | 'collapsable'
    | 'divider'
    | 'spacer';

  /** Material icon name */
  icon?: string;

  /** Router link (string or array for complex routes) */
  link?: string | string[];

  /** Child navigation items */
  children?: AxNavigationItem[];

  /** Badge configuration */
  badge?: AxNavigationBadge;

  /** Hide item - static or dynamic */
  hidden?: boolean | (() => boolean);

  /** Active state - static or dynamic */
  active?: boolean | (() => boolean);

  /** Disabled state - static or dynamic */
  disabled?: boolean | (() => boolean);

  /** Tooltip text */
  tooltip?: string;

  /** Exact URL matching for active state */
  exactMatch?: boolean;

  /** Is this an external link */
  externalLink?: boolean;

  /** Link target */
  target?: '_blank' | '_self' | '_parent' | '_top';

  /** @deprecated Use permissions array instead */
  permission?: string;

  /** RBAC permissions required (OR logic) */
  permissions?: string[];

  /** CSS classes for custom styling */
  classes?: string;

  /** Custom metadata */
  meta?: Record<string, unknown>;

  /** Expanded state for collapsible items */
  expanded?: boolean;

  /** Default open state for groups (docs layout) */
  defaultOpen?: boolean;

  /** Badge color for enterprise layout */
  badgeColor?: 'primary' | 'accent' | 'warn';
}

/**
 * Navigation Collection Interface
 * Contains navigation items for different layout modes
 */
export interface AxNavigation {
  default: AxNavigationItem[];
  compact: AxNavigationItem[];
  horizontal?: AxNavigationItem[];
  mobile?: AxNavigationItem[];
}

/**
 * Navigation Component Configuration
 */
export interface AxNavigationConfig {
  state: 'collapsed' | 'expanded';
  mode: 'side' | 'over' | 'push';
  position: 'left' | 'right';
  showToggleButton: boolean;
  autoCollapse: boolean;
  breakpoint: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Navigation Component Events
 */
export interface AxNavigationEvents {
  onStateChange?: (state: 'collapsed' | 'expanded') => void;
  onItemClick?: (item: AxNavigationItem) => void;
  onGroupToggle?: (group: AxNavigationItem, isOpen: boolean) => void;
}
