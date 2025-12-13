/**
 * Module Card Component - Example Data
 *
 * This file contains example data for all visual states of the Module Card component.
 * Use these for testing, documentation, and development.
 */

import type { ImportModule } from '../../types/system-init.types';
import type { ModuleCardData } from './module-card.component';

/**
 * Example: Not Started Module
 * Shows a module that hasn't been imported yet
 */
export const NOT_STARTED_MODULE: ImportModule = {
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics',
  displayNameThai: 'ยาสามัญ',
  dependencies: ['locations'],
  priority: 2,
  importStatus: 'not_started',
  recordCount: 0,
  tags: [],
  supportsRollback: false,
  version: '1.0.0',
};

/**
 * Example: In Progress Module
 * Shows a module currently being imported with 45% progress
 */
export const IN_PROGRESS_MODULE: ModuleCardData = {
  module: 'locations',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Locations',
  displayNameThai: 'สถานที่',
  dependencies: [],
  priority: 1,
  importStatus: 'in_progress',
  recordCount: 0,
  tags: [],
  supportsRollback: false,
  version: '1.0.0',
  progress: {
    totalRows: 100,
    importedRows: 45,
    percentComplete: 45,
  },
};

/**
 * Example: Completed Module
 * Shows a successfully imported module with timestamp and user info
 */
export const COMPLETED_MODULE: ImportModule = {
  module: 'departments',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Departments',
  displayNameThai: 'แผนกต่างๆ',
  dependencies: [],
  priority: 1,
  importStatus: 'completed',
  recordCount: 50,
  tags: [],
  supportsRollback: true,
  version: '1.0.0',
  lastImport: {
    jobId: 'job-uuid-xxx',
    completedAt: '2025-12-13T11:00:05Z',
    importedBy: {
      id: 'user-uuid-123',
      name: 'admin@example.com',
    },
  },
};

/**
 * Example: Failed Module
 * Shows a module with import errors
 */
export const FAILED_MODULE: ModuleCardData = {
  module: 'drug_brands',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Brands',
  displayNameThai: 'ยาชื่อการค้า',
  dependencies: ['drug_generics'],
  priority: 3,
  importStatus: 'failed',
  recordCount: 0,
  tags: [],
  supportsRollback: false,
  version: '1.0.0',
  error: 'Duplicate codes found in rows: 5, 12, 25',
  lastImport: {
    jobId: 'job-uuid-zzz',
    completedAt: '2025-12-13T10:50:00Z',
    importedBy: {
      id: 'user-uuid-456',
      name: 'admin@example.com',
    },
  },
};

/**
 * Example: Users Module
 * Complete example for a core domain module
 */
export const USERS_MODULE: ImportModule = {
  module: 'users',
  domain: 'core',
  displayName: 'Users',
  displayNameThai: 'ผู้ใช้',
  dependencies: [],
  priority: 1,
  importStatus: 'completed',
  recordCount: 10,
  tags: [],
  supportsRollback: true,
  version: '1.0.0',
  lastImport: {
    jobId: 'job-uuid-yyy',
    completedAt: '2025-12-13T11:05:00Z',
    importedBy: {
      id: 'user-uuid-789',
      name: 'admin@example.com',
    },
  },
};

/**
 * Example: Budget Types Module
 * Module with no subdomain
 */
export const BUDGET_TYPES_MODULE: ImportModule = {
  module: 'budget_types',
  domain: 'budget',
  displayName: 'Budget Types',
  displayNameThai: 'ประเภทงบประมาณ',
  dependencies: [],
  priority: 1,
  importStatus: 'completed',
  recordCount: 12,
  tags: [],
  supportsRollback: true,
  version: '1.0.0',
  lastImport: {
    jobId: 'job-uuid-111',
    completedAt: '2025-12-13T10:30:00Z',
    importedBy: {
      id: 'user-uuid-222',
      name: 'finance@example.com',
    },
  },
};

/**
 * All example modules for gallery/showcase
 */
export const ALL_EXAMPLE_MODULES: (ImportModule | ModuleCardData)[] = [
  NOT_STARTED_MODULE,
  IN_PROGRESS_MODULE,
  COMPLETED_MODULE,
  FAILED_MODULE,
  USERS_MODULE,
  BUDGET_TYPES_MODULE,
];

/**
 * Complete mock dashboard data
 * Simulates the response from the System Init API
 */
export const MOCK_DASHBOARD_MODULES: (ImportModule | ModuleCardData)[] = [
  // Inventory Domain - Master Data
  {
    module: 'locations',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Locations',
    displayNameThai: 'สถานที่',
    dependencies: [],
    priority: 1,
    importStatus: 'completed',
    recordCount: 50,
    tags: [],
    supportsRollback: true,
    version: '1.0.0',
    lastImport: {
      jobId: 'job-001',
      completedAt: new Date('2025-12-13T10:00:00Z').toISOString(),
      importedBy: {
        id: 'admin-001',
        name: 'Administrator',
      },
    },
  },
  {
    module: 'departments',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Departments',
    displayNameThai: 'แผนกต่างๆ',
    dependencies: ['locations'],
    priority: 2,
    importStatus: 'completed',
    recordCount: 15,
    tags: [],
    supportsRollback: true,
    version: '1.0.0',
    lastImport: {
      jobId: 'job-002',
      completedAt: new Date('2025-12-13T10:15:00Z').toISOString(),
      importedBy: {
        id: 'admin-001',
        name: 'Administrator',
      },
    },
  },
  {
    module: 'drug_generics',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Drug Generics',
    displayNameThai: 'ยาสามัญ',
    dependencies: [],
    priority: 3,
    importStatus: 'completed',
    recordCount: 320,
    tags: [],
    supportsRollback: true,
    version: '1.0.0',
    lastImport: {
      jobId: 'job-003',
      completedAt: new Date('2025-12-13T10:30:00Z').toISOString(),
      importedBy: {
        id: 'admin-001',
        name: 'Administrator',
      },
    },
  },
  {
    module: 'drug_brands',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Drug Brands',
    displayNameThai: 'ยาชื่อการค้า',
    dependencies: ['drug_generics'],
    priority: 4,
    importStatus: 'in_progress',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
    progress: {
      totalRows: 250,
      importedRows: 125,
      percentComplete: 50,
    },
  },
  {
    module: 'units',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Units',
    displayNameThai: 'หน่วย',
    dependencies: [],
    priority: 5,
    importStatus: 'not_started',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
  },

  // Core Domain
  {
    module: 'users',
    domain: 'core',
    displayName: 'Users',
    displayNameThai: 'ผู้ใช้',
    dependencies: [],
    priority: 1,
    importStatus: 'completed',
    recordCount: 25,
    tags: [],
    supportsRollback: true,
    version: '1.0.0',
    lastImport: {
      jobId: 'job-101',
      completedAt: new Date('2025-12-13T09:00:00Z').toISOString(),
      importedBy: {
        id: 'admin-001',
        name: 'Administrator',
      },
    },
  },
  {
    module: 'roles',
    domain: 'core',
    displayName: 'Roles',
    displayNameThai: 'บทบาท',
    dependencies: [],
    priority: 2,
    importStatus: 'completed',
    recordCount: 8,
    tags: [],
    supportsRollback: true,
    version: '1.0.0',
    lastImport: {
      jobId: 'job-102',
      completedAt: new Date('2025-12-13T09:15:00Z').toISOString(),
      importedBy: {
        id: 'admin-001',
        name: 'Administrator',
      },
    },
  },

  // Budget Domain
  {
    module: 'budget_types',
    domain: 'budget',
    displayName: 'Budget Types',
    displayNameThai: 'ประเภทงบประมาณ',
    dependencies: [],
    priority: 1,
    importStatus: 'completed',
    recordCount: 12,
    tags: [],
    supportsRollback: true,
    version: '1.0.0',
    lastImport: {
      jobId: 'job-201',
      completedAt: new Date('2025-12-13T09:30:00Z').toISOString(),
      importedBy: {
        id: 'finance-001',
        name: 'Finance Officer',
      },
    },
  },
  {
    module: 'budget_sources',
    domain: 'budget',
    displayName: 'Budget Sources',
    displayNameThai: 'แหล่งงบประมาณ',
    dependencies: [],
    priority: 2,
    importStatus: 'not_started',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
  },
  {
    module: 'budget_expenses',
    domain: 'budget',
    displayName: 'Budget Expenses',
    displayNameThai: 'รายการใช้งบประมาณ',
    dependencies: ['budget_types'],
    priority: 3,
    importStatus: 'failed',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
    error: 'Invalid budget_type references in rows: 10, 25, 30',
    lastImport: {
      jobId: 'job-202',
      completedAt: new Date('2025-12-13T09:45:00Z').toISOString(),
      importedBy: {
        id: 'finance-001',
        name: 'Finance Officer',
      },
    },
  },

  // Procurement Domain
  {
    module: 'suppliers',
    domain: 'procurement',
    displayName: 'Suppliers',
    displayNameThai: 'ผู้จัดจำหน่าย',
    dependencies: [],
    priority: 1,
    importStatus: 'not_started',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
  },
  {
    module: 'purchase_orders',
    domain: 'procurement',
    displayName: 'Purchase Orders',
    displayNameThai: 'ใบสั่งซื้อ',
    dependencies: ['suppliers', 'drug_generics'],
    priority: 2,
    importStatus: 'not_started',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
  },
];

/**
 * Example component usage with signals
 *
 * ```typescript
 * import { Component, signal } from '@angular/core';
 * import { ModuleCardComponent } from './module-card.component';
 * import { MOCK_DASHBOARD_MODULES } from './module-card.examples';
 *
 * @Component({
 *   selector: 'app-module-card-gallery',
 *   standalone: true,
 *   imports: [CommonModule, ModuleCardComponent],
 *   template: `
 *     <div class="gallery">
 *       @for (module of modules(); track module.module) {
 *         <app-module-card
 *           [module]="module"
 *           (import)="onImport($event)"
 *           (viewDetails)="onViewDetails($event)"
 *           (rollback)="onRollback($event)"
 *         />
 *       }
 *     </div>
 *   `,
 *   styles: [`
 *     .gallery {
 *       display: grid;
 *       grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
 *       gap: 20px;
 *       padding: 20px;
 *     }
 *   `]
 * })
 * export class ModuleCardGalleryComponent {
 *   modules = signal(MOCK_DASHBOARD_MODULES);
 *
 *   onImport(module: ImportModule) {
 *     console.log('Import:', module);
 *   }
 *
 *   onViewDetails(module: ImportModule) {
 *     console.log('View Details:', module);
 *   }
 *
 *   onRollback(module: ImportModule) {
 *     console.log('Rollback:', module);
 *   }
 * }
 * ```
 */
