/**
 * AegisX Navigation System Types
 * Clean, modern navigation with collapsible states
 */

/**
 * Navigation Item Interface
 */
export interface AxNavigationItem {
  id: string;
  title: string;
  type: 'item' | 'group' | 'collapsible' | 'divider';
  icon?: string;
  link?: string | string[];
  children?: AxNavigationItem[];
  badge?: {
    content: string;
    type?: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  };
  hidden?: boolean | (() => boolean);
  active?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);
  tooltip?: string;
  exactMatch?: boolean;
  externalLink?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  permission?: string; // RBAC permission required to view this item
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
