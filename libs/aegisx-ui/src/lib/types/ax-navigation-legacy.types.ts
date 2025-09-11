/**
 * Legacy Fuse Navigation Types (to be replaced with Ax types)
 * Temporarily kept for backward compatibility
 */

export interface FuseNavigationItem {
  id?: string;
  title?: string;
  type: 'aside' | 'basic' | 'collapsable' | 'divider' | 'group' | 'spacer';
  icon?: string;
  iconClass?: string;
  link?: string;
  fragment?: string;
  exactMatch?: boolean;
  externalLink?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  classes?: string | string[];
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean | ((item: FuseNavigationItem) => boolean);
  active?: boolean;
  badge?: {
    title?: string;
    type?: string;
    classes?: string;
    style?: 'filled' | 'outlined' | 'rounded';
    tooltip?: string;
  };
  children?: FuseNavigationItem[];
  meta?: Record<string, unknown>;
}

export interface FuseNavigationConfig {
  mode?: 'over' | 'side';
  position?: 'left' | 'right';
  appearance?: 'default' | 'compact' | 'dense' | 'futuristic' | 'thin';
}
