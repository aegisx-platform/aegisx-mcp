import { AxNavigationItem } from '@aegisx/ui';
import { AppConfig } from '../../shared/multi-app';

/**
 * Inventory Navigation Configuration
 *
 * Navigation items for the Inventory app.
 */
const inventoryNavigation: AxNavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/inventory',
  },

  // Master Data (ax-launcher for CRUD modules)
  {
    id: 'master-data',
    title: 'Master Data',
    icon: 'storage',
    link: '/inventory/master-data',
  },
];

/**
 * Inventory App Configuration
 *
 * Configuration following AppConfig interface for MultiAppService integration.
 */
export const INVENTORY_APP_CONFIG: AppConfig = {
  id: 'inventory',
  name: 'Inventory',
  description: 'Inventory management system',
  theme: 'default',
  baseRoute: '/inventory',
  defaultRoute: '/inventory',
  showFooter: true,
  footerContent: 'AegisX Platform',

  // Header actions
  headerActions: [
    {
      id: 'notifications',
      icon: 'notifications',
      tooltip: 'Notifications',
      badge: 0,
      action: 'onNotifications',
    },
    {
      id: 'settings',
      icon: 'settings',
      tooltip: 'Settings',
      action: 'onSettings',
    },
  ],

  // Single sub-app containing all navigation
  subApps: [
    {
      id: 'main',
      name: 'Inventory',
      icon: 'apps',
      route: '/inventory',
      navigation: inventoryNavigation,
      isDefault: true,
      description: 'Inventory management system',
      roles: ['admin'],
    },
  ],
};

/**
 * @deprecated Use INVENTORY_APP_CONFIG instead
 * Kept for backward compatibility
 */
export const INVENTORY_NAVIGATION = inventoryNavigation;
