import { AxNavigationItem } from '@aegisx/ui';
import { AppConfig } from '../../shared/multi-app';

/**
 * Inventory App Configuration
 *
 * Defines the inventory management app structure with sub-apps:
 * - Dashboard: Overview and KPIs
 * - Warehouse: Stock management
 * - Receiving: Goods receipt
 * - Shipping: Outbound logistics
 */

// Dashboard Sub-App Navigation
const dashboardNavigation: AxNavigationItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: 'dashboard',
    link: '/inventory/dashboard',
    exactMatch: true,
  },
  {
    id: 'kpis',
    title: 'KPI Metrics',
    icon: 'analytics',
    link: '/inventory/dashboard/kpis',
  },
  {
    id: 'alerts',
    title: 'Stock Alerts',
    icon: 'notifications_active',
    link: '/inventory/dashboard/alerts',
  },
];

// Warehouse Sub-App Navigation
const warehouseNavigation: AxNavigationItem[] = [
  {
    id: 'stock-overview',
    title: 'Stock Overview',
    icon: 'inventory_2',
    link: '/inventory/warehouse',
    exactMatch: true,
  },
  {
    id: 'locations',
    title: 'Locations',
    icon: 'location_on',
    link: '/inventory/warehouse/locations',
  },
  {
    id: 'stock-counts',
    title: 'Stock Counts',
    icon: 'calculate',
    link: '/inventory/warehouse/counts',
  },
  {
    id: 'transfers',
    title: 'Transfers',
    icon: 'swap_horiz',
    link: '/inventory/warehouse/transfers',
  },
];

// Receiving Sub-App Navigation
const receivingNavigation: AxNavigationItem[] = [
  {
    id: 'pending',
    title: 'Pending Receipts',
    icon: 'pending_actions',
    link: '/inventory/receiving',
    exactMatch: true,
  },
  {
    id: 'received',
    title: 'Received',
    icon: 'check_circle',
    link: '/inventory/receiving/received',
  },
  {
    id: 'inspection',
    title: 'Quality Check',
    icon: 'fact_check',
    link: '/inventory/receiving/inspection',
  },
];

// Shipping Sub-App Navigation
const shippingNavigation: AxNavigationItem[] = [
  {
    id: 'orders',
    title: 'Orders',
    icon: 'shopping_cart',
    link: '/inventory/shipping',
    exactMatch: true,
  },
  {
    id: 'picking',
    title: 'Picking',
    icon: 'checklist',
    link: '/inventory/shipping/picking',
  },
  {
    id: 'packing',
    title: 'Packing',
    icon: 'package_2',
    link: '/inventory/shipping/packing',
  },
  {
    id: 'dispatch',
    title: 'Dispatch',
    icon: 'local_shipping',
    link: '/inventory/shipping/dispatch',
  },
];

/**
 * Inventory App Configuration
 */
export const INVENTORY_APP_CONFIG: AppConfig = {
  id: 'inventory',
  name: 'Inventory Management',
  description: 'Warehouse and inventory management system',
  theme: 'inventory',
  baseRoute: '/inventory',
  defaultRoute: '/inventory/dashboard',
  showFooter: true,
  footerContent: 'Inventory Management System - AegisX Platform',

  // Global header actions for all sub-apps
  headerActions: [
    {
      id: 'scan',
      icon: 'qr_code_scanner',
      tooltip: 'Scan Barcode',
      action: 'onScanBarcode',
    },
    {
      id: 'notifications',
      icon: 'notifications',
      tooltip: 'Notifications',
      badge: 5,
      action: 'onNotifications',
    },
    {
      id: 'settings',
      icon: 'settings',
      tooltip: 'Settings',
      action: 'onSettings',
    },
  ],

  // Sub-apps configuration
  subApps: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'dashboard',
      route: '/inventory/dashboard',
      navigation: dashboardNavigation,
      isDefault: true,
      description: 'Overview and KPIs',
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      icon: 'warehouse',
      route: '/inventory/warehouse',
      navigation: warehouseNavigation,
      description: 'Stock management and locations',
      permissions: ['inventory.warehouse.read'],
    },
    {
      id: 'receiving',
      name: 'Receiving',
      icon: 'move_to_inbox',
      route: '/inventory/receiving',
      navigation: receivingNavigation,
      description: 'Goods receipt and quality check',
      permissions: ['inventory.receiving.read'],
    },
    {
      id: 'shipping',
      name: 'Shipping',
      icon: 'local_shipping',
      route: '/inventory/shipping',
      navigation: shippingNavigation,
      description: 'Outbound logistics',
      permissions: ['inventory.shipping.read'],
    },
  ],
};
