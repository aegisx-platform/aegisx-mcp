import { LauncherApp, LauncherCategory } from '@aegisx/ui';

/**
 * Master Data Section Configuration
 *
 * This file contains the configuration for Master Data modules
 * displayed in the ax-launcher component.
 *
 * NOTE: CRUD generator will auto-register new modules here when using --section master-data
 */

/**
 * Master Data Categories
 *
 * Organize modules into tabs by category
 */
export const MASTER_DATA_CATEGORIES: LauncherCategory[] = [
  {
    id: 'organization',
    name: 'Organization',
    icon: 'business',
    description: 'Organization-related master data',
    order: 1,
  },
  {
    id: 'drugs',
    name: 'Drugs',
    icon: 'medication',
    description: 'Drug-related master data',
    order: 2,
  },
  {
    id: 'budget',
    name: 'Budget',
    icon: 'attach_money',
    description: 'Budget-related master data',
    order: 3,
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: 'settings',
    description: 'Operations and configuration data',
    order: 4,
  },
];

/**
 * Section Items
 *
 * Each item represents a CRUD module accessible from the launcher.
 * Generator will auto-add entries when using: --shell inventory --section master-data
 *
 * Available colors: 'pink', 'peach', 'mint', 'blue', 'yellow', 'lavender', 'cyan', 'rose', 'neutral', 'white'
 */
export const SECTION_ITEMS: LauncherApp[] = [
  // === AUTO-GENERATED ENTRIES START ===
  {
    id: 'return-actions',
    name: 'Return Actions',
    description: 'จัดการข้อมูลการคืนสินค้า',
    icon: 'description',
    route: '/inventory/master-data/return-actions',
    color: 'blue',
    status: 'active',
    enabled: true,
    categoryId: 'operations',
  },

  {
    id: 'adjustment-reasons',
    name: 'Adjustment Reasons',
    description: 'จัดการข้อมูลเหตุผลการปรับปรุง',
    icon: 'description',
    route: '/inventory/master-data/adjustment-reasons',
    color: 'mint',
    status: 'active',
    enabled: true,
    categoryId: 'operations',
  },

  {
    id: 'drug-units',
    name: 'Drug Units',
    description: 'จัดการข้อมูลหน่วยยา',
    icon: 'medication',
    route: '/inventory/master-data/drug-units',
    color: 'yellow',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  {
    id: 'dosage-forms',
    name: 'Dosage Forms',
    description: 'จัดการข้อมูลรูปแบบปริมาณยา',
    icon: 'description',
    route: '/inventory/master-data/dosage-forms',
    color: 'mint',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  {
    id: 'drug-pack-ratios',
    name: 'Drug Pack Ratios',
    description: 'จัดการข้อมูลอัตราส่วนแพ็คยา',
    icon: 'medication',
    route: '/inventory/master-data/drug-pack-ratios',
    color: 'mint',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  {
    id: 'drug-focus-lists',
    name: 'Drug Focus Lists',
    description: 'จัดการข้อมูลรายการยาเด่น',
    icon: 'medication',
    route: '/inventory/master-data/drug-focus-lists',
    color: 'rose',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  {
    id: 'drug-components',
    name: 'Drug Components',
    description: 'จัดการข้อมูลส่วนประกอบของยา',
    icon: 'medication',
    route: '/inventory/master-data/drug-components',
    color: 'rose',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  {
    id: 'budget-categories',
    name: 'Budget Categories',
    description: 'จัดการข้อมูลประเภทงบประมาณ',
    icon: 'description',
    route: '/inventory/master-data/budget-categories',
    color: 'blue',
    status: 'active',
    enabled: true,
    categoryId: 'budget',
  },

  {
    id: 'budget-types',
    name: 'Budget Types',
    description: 'จัดการข้อมูลประเภทงบประมาณ',
    icon: 'description',
    route: '/inventory/master-data/budget-types',
    color: 'rose',
    status: 'active',
    enabled: true,
    categoryId: 'budget',
  },

  {
    id: 'drug-generics',
    name: 'Drug Generics',
    description: 'จัดการข้อมูลยาสามัญชาติ',
    icon: 'medication',
    route: '/inventory/master-data/drug-generics',
    color: 'mint',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  {
    id: 'budgets',
    name: 'Budgets',
    description: 'จัดการข้อมูลงบประมาณ',
    icon: 'description',
    route: '/inventory/master-data/budgets',
    color: 'cyan',
    status: 'active',
    enabled: true,
    categoryId: 'budget',
  },

  {
    id: 'bank',
    name: 'Bank',
    description: 'จัดการข้อมูลธนาคาร',
    icon: 'description',
    route: '/inventory/master-data/bank',
    color: 'yellow',
    status: 'active',
    enabled: true,
    categoryId: 'operations',
  },

  {
    id: 'hospitals',
    name: 'Hospitals',
    description: 'จัดการข้อมูลโรงพยาบาล',
    icon: 'description',
    route: '/inventory/master-data/hospitals',
    color: 'peach',
    status: 'active',
    enabled: true,
    categoryId: 'organization',
  },

  {
    id: 'departments',
    name: 'Departments',
    description: 'จัดการข้อมูลแผนก',
    icon: 'corporate_fare',
    route: '/inventory/master-data/departments',
    color: 'blue',
    status: 'active',
    enabled: true,
    categoryId: 'organization',
  },

  {
    id: 'companies',
    name: 'Companies',
    description: 'จัดการข้อมูลบริษัท',
    icon: 'description',
    route: '/inventory/master-data/companies',
    color: 'cyan',
    status: 'active',
    enabled: true,
    categoryId: 'organization',
  },

  {
    id: 'locations',
    name: 'Locations',
    description: 'จัดการข้อมูลสถานที่',
    icon: 'location_on',
    route: '/inventory/master-data/locations',
    color: 'rose',
    status: 'active',
    enabled: true,
    categoryId: 'organization',
  },

  {
    id: 'drugs',
    name: 'Drugs',
    description: 'จัดการข้อมูลยา',
    icon: 'medication',
    route: '/inventory/master-data/drugs',
    color: 'yellow',
    status: 'active',
    enabled: true,
    categoryId: 'drugs',
  },

  // CRUD modules will be auto-registered here by the generator
  // === AUTO-GENERATED ENTRIES END ===
];
