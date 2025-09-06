import { FuseNavigationItem } from '../types/ax-navigation-legacy.types';
import { AxNavigationItem } from '../types/ax-navigation.types';

/**
 * Convert FuseNavigationItem to AxNavigationItem
 */
export function convertFuseToAxNavigation(
  fuseItems: FuseNavigationItem[],
): AxNavigationItem[] {
  return fuseItems
    .map((item) => convertItem(item))
    .filter(Boolean) as AxNavigationItem[];
}

function convertItem(fuseItem: FuseNavigationItem): AxNavigationItem | null {
  // Skip if no ID (required in AxNavigationItem)
  if (!fuseItem.id) {
    if (fuseItem.type === 'divider') {
      // Generate ID for dividers
      fuseItem.id = `divider-${Date.now()}-${Math.random()}`;
    } else {
      return null;
    }
  }

  const axItem: AxNavigationItem = {
    id: fuseItem.id,
    title: fuseItem.title || '',
    type: mapType(fuseItem.type),
    icon: fuseItem.icon,
    link: fuseItem.link,
    tooltip: fuseItem.tooltip,
    exactMatch: fuseItem.exactMatch,
    externalLink: fuseItem.externalLink,
    target: fuseItem.target as
      | '_blank'
      | '_self'
      | '_parent'
      | '_top'
      | undefined,
  };

  // Map badge
  if (fuseItem.badge) {
    axItem.badge = {
      content: fuseItem.badge.title || '',
      type: mapBadgeType(fuseItem.badge.classes),
    };
  }

  // Map function properties
  if (fuseItem.hidden !== undefined) {
    if (typeof fuseItem.hidden === 'function') {
      const hiddenFn = fuseItem.hidden as (item: FuseNavigationItem) => boolean;
      axItem.hidden = () => hiddenFn(fuseItem);
    } else {
      axItem.hidden = fuseItem.hidden as boolean;
    }
  }

  if (fuseItem.active !== undefined) {
    if (typeof fuseItem.active === 'function') {
      const activeFn = fuseItem.active as (item: FuseNavigationItem) => boolean;
      axItem.active = () => activeFn(fuseItem);
    } else {
      axItem.active = fuseItem.active as boolean;
    }
  }

  if (fuseItem.disabled !== undefined) {
    if (typeof fuseItem.disabled === 'function') {
      const disabledFn = fuseItem.disabled as (
        item: FuseNavigationItem,
      ) => boolean;
      axItem.disabled = () => disabledFn(fuseItem);
    } else {
      axItem.disabled = fuseItem.disabled as boolean;
    }
  }

  // Convert children recursively
  if (fuseItem.children) {
    axItem.children = convertFuseToAxNavigation(fuseItem.children);
  }

  return axItem;
}

function mapType(
  fuseType?: string,
): 'item' | 'group' | 'collapsible' | 'divider' {
  switch (fuseType) {
    case 'basic':
    case 'aside':
      return 'item';
    case 'collapsable':
      return 'collapsible';
    case 'group':
      return 'group';
    case 'divider':
    case 'spacer':
      return 'divider';
    default:
      return 'item';
  }
}

function mapBadgeType(
  classes?: string,
): 'primary' | 'accent' | 'warn' | 'success' | 'info' {
  if (!classes) return 'primary';

  if (classes.includes('primary')) return 'primary';
  if (classes.includes('accent')) return 'accent';
  if (classes.includes('warn') || classes.includes('error')) return 'warn';
  if (classes.includes('success') || classes.includes('green'))
    return 'success';
  if (classes.includes('info')) return 'info';

  return 'primary';
}
