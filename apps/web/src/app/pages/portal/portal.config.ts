import { LauncherApp, LauncherCategory, LauncherConfig } from '@aegisx/ui';

/**
 * Portal Categories
 *
 * Define the main categories for organizing enterprise applications
 */
export const PORTAL_CATEGORIES: LauncherCategory[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'local_hospital',
    description: 'Hospital Information System modules',
    order: 1,
  },
  {
    id: 'erp',
    name: 'ERP',
    icon: 'business',
    description: 'Enterprise Resource Planning modules',
    order: 2,
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: 'precision_manufacturing',
    description: 'Operational and logistics management',
    order: 3,
  },
  {
    id: 'admin',
    name: 'Administration',
    icon: 'admin_panel_settings',
    description: 'System administration and settings',
    order: 4,
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: 'build',
    description: 'Development and utility tools',
    order: 5,
  },
];

/**
 * Portal Apps
 *
 * All enterprise applications available in the portal
 */
export const PORTAL_APPS: LauncherApp[] = [
  // ============================================
  // Healthcare Apps (HIS)
  // ============================================
  {
    id: 'his-opd',
    name: 'OPD - Outpatient',
    description: 'Outpatient department management',
    icon: 'person',
    route: '/his/opd',
    color: 'blue',
    categoryId: 'healthcare',
    status: 'active',
    enabled: true,
    featured: true,
    order: 1,
    tags: ['patient', 'outpatient', 'clinic'],
    permission: {
      viewRoles: ['admin', 'doctor', 'nurse', 'receptionist'],
      viewPermissions: ['his.opd.read'],
    },
  },
  {
    id: 'his-ipd',
    name: 'IPD - Inpatient',
    description: 'Inpatient department and ward management',
    icon: 'hotel',
    route: '/his/ipd',
    color: 'cyan',
    categoryId: 'healthcare',
    status: 'active',
    enabled: true,
    featured: true,
    order: 2,
    tags: ['patient', 'inpatient', 'ward', 'admission'],
    permission: {
      viewRoles: ['admin', 'doctor', 'nurse'],
      viewPermissions: ['his.ipd.read'],
    },
  },
  {
    id: 'his-pharmacy',
    name: 'Pharmacy',
    description: 'Medicine dispensing and inventory',
    icon: 'medication',
    route: '/his/pharmacy',
    color: 'mint',
    categoryId: 'healthcare',
    status: 'active',
    enabled: true,
    order: 3,
    tags: ['medicine', 'drug', 'prescription'],
    permission: {
      viewRoles: ['admin', 'pharmacist'],
      viewPermissions: ['his.pharmacy.read'],
    },
  },
  {
    id: 'his-lab',
    name: 'Laboratory',
    description: 'Lab orders and results management',
    icon: 'science',
    route: '/his/lab',
    color: 'lavender',
    categoryId: 'healthcare',
    status: 'active',
    enabled: true,
    order: 4,
    tags: ['lab', 'test', 'results'],
    permission: {
      viewRoles: ['admin', 'doctor', 'lab_tech'],
      viewPermissions: ['his.lab.read'],
    },
  },
  {
    id: 'his-radiology',
    name: 'Radiology',
    description: 'Imaging and radiology services',
    icon: 'image_search',
    route: '/his/radiology',
    color: 'yellow',
    categoryId: 'healthcare',
    status: 'coming_soon',
    enabled: true,
    order: 5,
    tags: ['xray', 'imaging', 'scan'],
    permission: {
      viewRoles: ['admin', 'doctor', 'radiologist'],
      viewPermissions: ['his.radiology.read'],
    },
  },
  {
    id: 'his-billing',
    name: 'Billing',
    description: 'Patient billing and insurance',
    icon: 'receipt_long',
    route: '/his/billing',
    color: 'peach',
    categoryId: 'healthcare',
    status: 'active',
    enabled: true,
    order: 6,
    tags: ['payment', 'invoice', 'insurance'],
    permission: {
      viewRoles: ['admin', 'cashier', 'finance'],
      viewPermissions: ['his.billing.read'],
    },
  },

  // ============================================
  // ERP Apps
  // ============================================
  {
    id: 'erp-finance',
    name: 'Finance',
    description: 'Financial management and accounting',
    icon: 'account_balance',
    route: '/erp/finance',
    color: 'mint',
    categoryId: 'erp',
    status: 'active',
    enabled: true,
    featured: true,
    order: 1,
    tags: ['accounting', 'ledger', 'budget'],
    permission: {
      viewRoles: ['admin', 'finance', 'accountant'],
      viewPermissions: ['erp.finance.read'],
    },
  },
  {
    id: 'erp-hr',
    name: 'Human Resources',
    description: 'Employee and payroll management',
    icon: 'groups',
    route: '/erp/hr',
    color: 'pink',
    categoryId: 'erp',
    status: 'active',
    enabled: true,
    order: 2,
    tags: ['employee', 'payroll', 'leave'],
    permission: {
      viewRoles: ['admin', 'hr'],
      viewPermissions: ['erp.hr.read'],
    },
  },
  {
    id: 'erp-procurement',
    name: 'Procurement',
    description: 'Purchase orders and vendor management',
    icon: 'shopping_cart',
    route: '/erp/procurement',
    color: 'peach',
    categoryId: 'erp',
    status: 'active',
    enabled: true,
    order: 3,
    tags: ['purchase', 'vendor', 'supplier'],
    permission: {
      viewRoles: ['admin', 'procurement'],
      viewPermissions: ['erp.procurement.read'],
    },
  },
  {
    id: 'erp-asset',
    name: 'Asset Management',
    description: 'Fixed assets and depreciation',
    icon: 'inventory',
    route: '/erp/asset',
    color: 'neutral',
    categoryId: 'erp',
    status: 'beta',
    enabled: true,
    order: 4,
    tags: ['asset', 'equipment', 'depreciation'],
    permission: {
      viewRoles: ['admin', 'finance'],
      viewPermissions: ['erp.asset.read'],
    },
  },

  // ============================================
  // Operations Apps
  // ============================================
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Warehouse and stock management',
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
  {
    id: 'ops-maintenance',
    name: 'Maintenance',
    description: 'Equipment and facility maintenance',
    icon: 'engineering',
    route: '/ops/maintenance',
    color: 'yellow',
    categoryId: 'operations',
    status: 'active',
    enabled: true,
    order: 2,
    tags: ['repair', 'maintenance', 'facility'],
    permission: {
      viewRoles: ['admin', 'maintenance'],
      viewPermissions: ['ops.maintenance.read'],
    },
  },
  {
    id: 'ops-transport',
    name: 'Transport',
    description: 'Fleet and logistics management',
    icon: 'local_shipping',
    route: '/ops/transport',
    color: 'cyan',
    categoryId: 'operations',
    status: 'coming_soon',
    enabled: true,
    order: 3,
    tags: ['fleet', 'delivery', 'logistics'],
    permission: {
      viewRoles: ['admin', 'transport'],
      viewPermissions: ['ops.transport.read'],
    },
  },
  {
    id: 'ops-quality',
    name: 'Quality Control',
    description: 'Quality assurance and compliance',
    icon: 'verified',
    route: '/ops/quality',
    color: 'lavender',
    categoryId: 'operations',
    status: 'active',
    enabled: true,
    order: 4,
    tags: ['quality', 'audit', 'compliance'],
    permission: {
      viewRoles: ['admin', 'qa'],
      viewPermissions: ['ops.quality.read'],
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
    id: 'tools-showcase',
    name: 'Theme Showcase',
    description: 'Material components and theme testing',
    icon: 'palette',
    route: '/system/tools/theme-showcase',
    color: 'lavender',
    categoryId: 'tools',
    status: 'active',
    enabled: true,
    order: 2,
    tags: ['theme', 'components', 'design'],
    permission: {
      viewRoles: ['admin'],
      viewPermissions: ['admin.*'],
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
    order: 3,
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
  { id: 'his-opd', x: 2, y: 0, cols: 1, rows: 1 },
  { id: 'his-ipd', x: 3, y: 0, cols: 1, rows: 1 },
  { id: 'erp-finance', x: 0, y: 1, cols: 1, rows: 1 },
  { id: 'admin-users', x: 1, y: 1, cols: 1, rows: 1 },
  { id: 'admin-monitoring', x: 2, y: 1, cols: 2, rows: 1 }, // Large card
];
