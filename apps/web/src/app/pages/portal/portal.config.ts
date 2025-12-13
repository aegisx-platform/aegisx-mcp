import { LauncherApp, LauncherCategory, LauncherConfig } from '@aegisx/ui';

/**
 * Portal Categories
 *
 * Define the main categories for organizing enterprise applications
 */
export const PORTAL_CATEGORIES: LauncherCategory[] = [
  {
    id: 'operations',
    name: 'Operations',
    icon: 'precision_manufacturing',
    description: 'Operational and logistics management',
    order: 1,
  },
  {
    id: 'admin',
    name: 'Administration',
    icon: 'admin_panel_settings',
    description: 'System administration and settings',
    order: 2,
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: 'build',
    description: 'Development and utility tools',
    order: 3,
  },
];

/**
 * Portal Apps
 *
 * All enterprise applications available in the portal
 */
export const PORTAL_APPS: LauncherApp[] = [
  // ============================================
  // Operations Apps
  // ============================================
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'ระบบบริหารคลังยาและเวชภัณฑ์',
    icon: 'warehouse',
    route: '/inventory',
    color: 'blue',
    categoryId: 'operations',
    status: 'active',
    enabled: true,
    featured: true,
    order: 1,
    notificationCount: 3,
    lastEdited: 'Last edit by Admin at 10:30 AM',
    tags: ['stock', 'warehouse', 'inventory'],
    permission: {
      viewRoles: ['admin', 'warehouse'],
      viewPermissions: ['inventory.read'],
    },
  },

  // ============================================
  // Administration Apps (under /system)
  // ============================================
  {
    id: 'admin-users',
    name: 'User Management',
    description: 'Manage users, roles, and permissions',
    icon: 'manage_accounts',
    route: '/system/users',
    color: 'rose',
    categoryId: 'admin',
    status: 'active',
    enabled: true,
    featured: true,
    order: 1,
    tags: ['user', 'role', 'permission'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['users.read', 'admin.*'],
    },
  },
  {
    id: 'admin-rbac',
    name: 'RBAC Management',
    description: 'Role-based access control settings',
    icon: 'security',
    route: '/system/rbac',
    color: 'mint',
    categoryId: 'admin',
    status: 'active',
    enabled: true,
    order: 2,
    tags: ['rbac', 'security', 'access'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['rbac.read', 'admin.*'],
    },
  },
  {
    id: 'admin-settings',
    name: 'System Settings',
    description: 'Application configuration and preferences',
    icon: 'settings',
    route: '/system/settings',
    color: 'neutral',
    categoryId: 'admin',
    status: 'active',
    enabled: true,
    order: 3,
    tags: ['settings', 'config', 'preferences'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['settings.read', 'admin.*'],
    },
  },
  {
    id: 'admin-audit',
    name: 'Audit Logs',
    description: 'System audit trails and activity logs',
    icon: 'history',
    route: '/system/audit',
    color: 'yellow',
    categoryId: 'admin',
    status: 'active',
    enabled: true,
    order: 4,
    tags: ['audit', 'log', 'activity'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['audit.read', 'admin.*'],
    },
  },
  {
    id: 'admin-monitoring',
    name: 'Monitoring',
    description: 'System health and performance monitoring',
    icon: 'monitoring',
    route: '/system/monitoring',
    color: 'blue',
    categoryId: 'admin',
    status: 'active',
    enabled: true,
    order: 5,
    notificationCount: 2,
    tags: ['monitoring', 'health', 'performance'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['monitoring.read', 'admin.*'],
    },
  },
  {
    id: 'admin-system-init',
    name: 'System Initialization',
    description: 'Initialize and import master data',
    icon: 'cloud_upload',
    route: '/system/system-init',
    color: 'cyan',
    categoryId: 'admin',
    status: 'active',
    enabled: true,
    featured: true,
    order: 6,
    tags: ['initialization', 'import', 'master-data'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['system-init.read', 'admin.*'],
    },
  },

  // ============================================
  // Tools (under /system/tools)
  // ============================================
  {
    id: 'tools-pdf',
    name: 'PDF Templates',
    description: 'Design and manage PDF templates',
    icon: 'picture_as_pdf',
    route: '/system/tools/pdf-templates',
    color: 'rose',
    categoryId: 'tools',
    status: 'active',
    enabled: true,
    order: 1,
    tags: ['pdf', 'template', 'document'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['pdf-templates.read', 'admin.*'],
    },
  },
  {
    id: 'tools-file',
    name: 'File Manager',
    description: 'Upload and manage files',
    icon: 'folder',
    route: '/system/tools/file-upload',
    color: 'peach',
    categoryId: 'tools',
    status: 'active',
    enabled: true,
    order: 2,
    tags: ['file', 'upload', 'storage'],
    permission: {
      viewRoles: ['admin', 'user'],
      viewPermissions: ['files.read'],
    },
  },
];

/**
 * Portal Configuration
 *
 * Default configuration for the ax-launcher component
 */
export const PORTAL_CONFIG: LauncherConfig = {
  showSearch: true,
  showCategoryTabs: true,
  showStatusFilter: false,
  showViewToggle: true,
  defaultViewMode: 'grid',
  defaultGroupBy: 'category',
  emptyMessage: 'No applications available',
  noResultsMessage: 'No applications found matching your search',
  enableFavorites: true,
  enableRecent: true,
  maxRecentApps: 5,
  storageKeyPrefix: 'aegisx-portal',
  cardMinWidth: 280,
  cardMaxWidth: 320,
  cardGap: 20,
  enableDraggable: false,
  gridsterConfig: {
    columns: 4,
    rowHeight: 180,
    margin: 16,
    enableResize: true,
    minItemCols: 1,
    maxItemCols: 2,
    minItemRows: 1,
    maxItemRows: 2,
  },
};

/**
 * Featured apps configuration
 *
 * Define which apps appear in the Featured tab with their grid positions
 */
export const FEATURED_APPS_LAYOUT = [
  { id: 'inventory', x: 0, y: 0, cols: 2, rows: 1 }, // Large card
  { id: 'admin-users', x: 2, y: 0, cols: 1, rows: 1 },
  { id: 'admin-monitoring', x: 3, y: 0, cols: 1, rows: 1 },
  { id: 'admin-system-init', x: 0, y: 1, cols: 1, rows: 1 },
];
