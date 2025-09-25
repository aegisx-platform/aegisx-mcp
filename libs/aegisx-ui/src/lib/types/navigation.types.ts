export interface AegisxNavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'basic' | 'collapsable' | 'group' | 'divider' | 'spacer';
  icon?: string;
  link?: string;
  badge?: {
    title: string;
    classes: string;
  };
  children?: AegisxNavigationItem[];
  hidden?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);
  tooltip?: string;
  exactMatch?: boolean;
  externalLink?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  permissions?: string[];
  classes?: string;
  meta?: Record<string, unknown>;
  expanded?: boolean;
}

export interface AegisxNavigation {
  default: AegisxNavigationItem[];
  compact: AegisxNavigationItem[];
  horizontal?: AegisxNavigationItem[];
  mobile?: AegisxNavigationItem[];
}
