import { AxNavigationItem } from '@aegisx/ui';
import { AppConfig } from '../../shared/multi-app';

/**
 * System Navigation Configuration
 *
 * Navigation items for the System Administration app.
 */
const systemNavigation: AxNavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/system',
  },

  // User Management Section
  {
    id: 'user-management',
    title: 'User Management',
    icon: 'people',
    type: 'collapsible',
    children: [
      {
        id: 'users',
        title: 'Users',
        icon: 'manage_accounts',
        link: '/system/users',
      },
      {
        id: 'profile',
        title: 'My Profile',
        icon: 'person',
        link: '/system/profile',
      },
    ],
  },

  // Security & Access
  {
    id: 'security',
    title: 'Security',
    icon: 'security',
    type: 'collapsible',
    children: [
      {
        id: 'rbac',
        title: 'RBAC Management',
        icon: 'admin_panel_settings',
        link: '/system/rbac',
      },
      {
        id: 'audit',
        title: 'Audit Logs',
        icon: 'history',
        link: '/system/audit',
      },
    ],
  },

  // System
  {
    id: 'system-config',
    title: 'System',
    icon: 'settings_applications',
    type: 'collapsible',
    children: [
      {
        id: 'departments',
        title: 'Departments',
        icon: 'account_tree',
        link: '/system/departments',
      },
      {
        id: 'settings',
        title: 'Settings',
        icon: 'settings',
        link: '/system/settings',
      },
      {
        id: 'monitoring',
        title: 'Monitoring',
        icon: 'monitoring',
        link: '/system/monitoring',
      },
    ],
  },

  // Tools
  {
    id: 'tools',
    title: 'Tools',
    icon: 'build',
    type: 'collapsible',
    children: [
      {
        id: 'pdf-templates',
        title: 'PDF Templates',
        icon: 'picture_as_pdf',
        link: '/system/tools/pdf-templates',
      },
      {
        id: 'file-upload',
        title: 'File Manager',
        icon: 'folder',
        link: '/system/tools/file-upload',
      },
    ],
  },
];

/**
 * System App Configuration
 *
 * Configuration following AppConfig interface for MultiAppService integration.
 * System app uses a single "main" sub-app since it doesn't have
 * multiple sub-applications like Inventory.
 */
export const SYSTEM_APP_CONFIG: AppConfig = {
  id: 'system',
  name: 'System Administration',
  description: 'System administration and management',
  theme: 'default',
  baseRoute: '/system',
  defaultRoute: '/system',
  showFooter: true,
  footerContent: 'AegisX Platform',

  // Header actions
  headerActions: [
    {
      id: 'notifications',
      icon: 'notifications',
      tooltip: 'Notifications',
      badge: 3,
      action: 'onNotifications',
    },
    {
      id: 'settings',
      icon: 'settings',
      tooltip: 'Settings',
      action: 'onSettings',
    },
  ],

  // Single sub-app containing all system navigation
  // This allows System app to work with MultiAppService while
  // maintaining its flat navigation structure
  subApps: [
    {
      id: 'main',
      name: 'Administration',
      icon: 'admin_panel_settings',
      route: '/system',
      navigation: systemNavigation,
      isDefault: true,
      description: 'System administration',
      roles: ['admin'],
    },
  ],
};

/**
 * @deprecated Use SYSTEM_APP_CONFIG instead
 * Kept for backward compatibility
 */
export const SYSTEM_NAVIGATION = systemNavigation;
