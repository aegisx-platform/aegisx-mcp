# System Initialization Feature - Complete Guide

> **Version**: 1.0.0
> **Status**: Implementation Complete
> **Last Updated**: 2025-12-14
> **Author**: AegisX Development Team

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [How to Add New Module/Table](#how-to-add-new-moduletable)
5. [Import Workflow](#import-workflow)
6. [API Endpoints](#api-endpoints)
7. [Configuration Options](#configuration-options)
8. [Database Schema](#database-schema)
9. [Example: Departments Module](#example-departments-module)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Related Documentation](#related-documentation)

---

## 1. Feature Overview

### What is System Initialization?

System Initialization is a **zero-configuration auto-discovery system** for managing bulk data imports into AegisX. It automatically detects modules with import capability and displays them in a centralized dashboard, enabling hospital administrators to import initial data without manual configuration.

### Purpose and Benefits

**Problems Solved:**

- Hospital IT administrators needed to import initial data (users, departments, drugs, budgets) when setting up AegisX
- No centralized place to discover available imports
- Each module required manual registration
- No standard pattern for implementing imports
- No rollback capability for mistakes

**Benefits:**

- **Zero Configuration**: New modules are auto-discovered via decorators
- **Centralized Dashboard**: All imports in one place
- **Dependency Management**: Automatic import order based on dependencies
- **Validation & Rollback**: Validate before importing, rollback if needed
- **Progress Tracking**: Real-time import progress via WebSocket
- **Audit Trail**: Complete history of all imports

### Auto-Discovery Import System

The system uses a **hybrid discovery approach** combining:

1. **TypeScript Decorators** - Declarative metadata (@ImportService)
2. **File Conventions** - Pattern matching (`**/*-import.service.ts`)
3. **Runtime Registry** - Global metadata store

This enables:

- **Sub-100ms discovery time** for 30+ modules
- **Type-safe** throughout (zero `any` types)
- **Automatic dependency resolution** with circular dependency detection
- **Production-ready** with validation, rollback, and audit trail

### Key Features

- **Template Generation**: Download CSV/Excel templates for data entry
- **Session-based Validation**: File upload → validation → confirmation workflow
- **Batch Processing**: Insert data in configurable batches (default: 100 rows)
- **Transactions**: Each batch is atomic (all succeed or all fail)
- **Rollback Support**: Delete imported data by batch_id via `import_batch_id` column
- **Real-time Progress**: WebSocket updates during import
- **Import History**: Complete audit trail with timestamps and user info

---

## 2. Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
│  (Angular Dashboard + Import Wizard)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            REST API Layer                                   │
│  (SystemInitController + Routes)                           │
│  POST /validate | /import                                  │
│  GET /available-modules, /template                         │
│  DELETE /rollback                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          SystemInitService (Business Logic)                │
│  - Template generation                                      │
│  - Session management                                       │
│  - Import job orchestration                                 │
│  - Progress tracking                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌──────────────────────┐    ┌──────────────────────┐
│ ImportDiscovery      │    │ BaseImportService    │
│ Service              │    │ (Generic base class) │
│                      │    │                      │
│ - File scanning      │    │ - File parsing       │
│ - Decorator registry │    │ - Field validation   │
│ - Dependency graph   │    │ - Batch insertion    │
│ - Circular dep check │    │ - Rollback           │
└──────────────────────┘    └──────────────────────┘
        │                             ▲
        │                             │
        │              ┌──────────────┘
        │              │
        ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│     Module-Specific Import Services                         │
│  (extends BaseImportService<T>)                             │
│                                                              │
│  @ImportService decorator                                   │
│  + getTemplateColumns()                                      │
│  + validateRow()                                             │
│  + insertBatch()                                             │
│  + performRollback()                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Departments    Drug Generics   Locations  (30+ modules)
```

### Auto-Discovery Mechanism

**Step 1: Decorator Application**

Developers mark services with `@ImportService`:

```typescript
@ImportService({
  module: 'departments',
  domain: 'inventory',
  displayName: 'Departments (แผนก)',
  dependencies: [],
  priority: 1,
})
export class DepartmentsImportService extends BaseImportService<Departments> {
  // Implementation
}
```

**Step 2: File Scanning**

On server startup, ImportDiscoveryService:

- Scans for `**/*-import.service.ts` files
- Dynamically imports each file
- Decorator execution populates global registry

**Step 3: Metadata Extraction**

Registry collects all service metadata:

- Module name, domain, subdomain
- Display names (Thai/English)
- Dependencies and priority
- Rollback capability

**Step 4: Dependency Resolution**

Creates dependency graph:

- Validates no circular dependencies
- Builds topological sort
- Determines import order

**Step 5: Registry Persistence**

Stores metadata in database for:

- Discovery status
- Import history per module
- Record counts
- Last import timestamp

### Dependency Graph & Topological Sorting

**Example Dependency Chain:**

```
drug_generics (priority 1, no deps)
    ↓
dosage_forms (priority 1, no deps)
    ↓
drugs (priority 3, deps: [drug_generics, dosage_forms])
    ↓
budget_allocations (priority 5, deps: [drugs, budget_plans])
```

**Topological Sort Result:**

```typescript
[
  'drug_generics', // Priority 1, no deps → 1st
  'dosage_forms', // Priority 1, no deps → 2nd
  'users', // Priority 1, no deps → 3rd
  'departments', // Priority 2, needs users
  'drugs', // Priority 3, needs generics & forms
  'budget_plans', // Priority 4, needs departments
  'budget_allocations', // Priority 5, needs plans & drugs
];
```

### Session-Based Validation Workflow

```
User Upload
    │
    ▼
[1] Parse File (CSV/Excel)
    - Extract rows
    - Map headers to field names
    - Handle different formats
    │
    ▼
[2] Field-Level Validation
    - Type checking (string, number, boolean, date)
    - Length validation
    - Pattern matching (regex)
    - Required field checks
    │
    ▼
[3] Row-Level Validation
    - Call validateRow() for business logic
    - Check foreign key references
    - Detect duplicates
    │
    ▼
[4] Create Validation Session
    - Generate sessionId (UUID)
    - Store validated rows in memory
    - Set 30-minute expiration
    - Calculate summary (total, valid, errors, warnings)
    │
    ▼
[5] Return Results
    - sessionId for import confirmation
    - Errors (must fix before import)
    - Warnings (can skip)
    - Stats (total rows, valid rows, error count)
```

### Batch Processing with Transactions

```
Import Execution
    │
    ▼
[1] Get Valid Session
    - Retrieve session by ID
    - Validate not expired
    - Filter out invalid rows
    │
    ▼
[2] Generate Batch ID
    - Create UUID for this import job
    - Add batch_id to each row
    │
    ▼
[3] Split into Batches
    - Default: 100 rows per batch
    - Configurable via options
    │
    ▼
[4] Process Each Batch (Atomic Transaction)
    BEGIN TRANSACTION
    │
    ├─ [4.1] Transform Row Data
    │   - Map CSV fields to DB columns
    │   - Convert types (true → true, "yes" → true)
    │   - Add batch_id to each row
    │
    ├─ [4.2] Call insertBatch()
    │   - Module-specific insert logic
    │   - Can perform complex operations
    │   - Returns inserted records
    │
    ├─ [4.3] Update Progress
    │   - Increment counter
    │   - Calculate percentage
    │   - Emit WebSocket event
    │
    └─ COMMIT (all succeed) or ROLLBACK (any fail)
    │
    ▼
[5] Repeat for All Batches
    │
    ▼
[6] Complete Import
    - Record in import_history
    - Update module registry status
    - Emit completion event
```

### Rollback Support via import_batch_id

Every table supporting imports must have:

```sql
ALTER TABLE target_table ADD COLUMN import_batch_id UUID DEFAULT NULL;
CREATE INDEX idx_import_batch ON target_table(import_batch_id);
```

**Rollback Process:**

```
User clicks "Rollback" on completed import
    │
    ▼
DELETE FROM target_table WHERE import_batch_id = :batchId
    │
    ▼
Update import_history: status = 'rolled_back'
    │
    ▼
Return count of deleted records
```

**Safety Features:**

- **Precise**: Only deletes records from this specific import
- **Safe**: Cannot affect records from other imports
- **Auditable**: Tracks who rolled back and when
- **Reversible**: Can re-import if needed

---

## 3. Core Components

### Backend Components

#### 1. @ImportService Decorator

**Location**: `apps/api/src/core/import/decorator/import-service.decorator.ts`

Marks a class as an import service and stores metadata:

```typescript
export function ImportService(config: ImportServiceConfig): ClassDecorator {
  return function (target: Function) {
    // Store metadata in global registry
    registerImportService({
      module: config.module,
      domain: config.domain,
      subdomain: config.subdomain,
      displayName: config.displayName,
      description: config.description,
      dependencies: config.dependencies || [],
      priority: config.priority || 100,
      tags: config.tags || [],
      supportsRollback: config.supportsRollback || false,
      version: config.version || '1.0.0',
      target: target as any,
      filePath: __filename,
    });
  };
}
```

**Usage:**

```typescript
@ImportService({
  module: 'departments',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Departments (แผนก)',
  description: 'Hospital department master data',
  dependencies: [],
  priority: 1,
  tags: ['master-data', 'required'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DepartmentsImportService extends BaseImportService<Departments> {
  // ...
}
```

#### 2. BaseImportService<T> Abstract Class

**Location**: `apps/api/src/shared/services/base-import.service.ts`

Generic base class providing common import functionality:

```typescript
export abstract class BaseImportService<T> {
  // Template generation (CSV/Excel)
  async generateTemplate(options: ImportTemplateOptions): Promise<Buffer>;

  // File validation
  async validateFile(request: ImportValidationRequest): Promise<ImportValidationResponse>;

  // Import execution
  async executeImport(request: ImportExecutionRequest): Promise<ImportExecutionResponse>;

  // Job monitoring
  async getJobStatus(jobId: string): Promise<ImportJobStatusResponse>;

  // Cleanup
  cleanup(): void;

  // Must be implemented by subclasses:
  protected abstract insertBatch(batch: Partial<T>[]): Promise<T[]>;
}
```

**Features:**

- **Generic Type Safety**: Works with any entity type T
- **File Parsing**: Handles both CSV and Excel formats
- **Field Validation**: Type checking, length, patterns, enums
- **Session Management**: In-memory session store with expiration
- **Batch Processing**: Configurable batch size with progress tracking
- **Error Handling**: Detailed error messages with severity levels
- **WebSocket Integration**: Real-time progress events

#### 3. ImportDiscoveryService

**Location**: `apps/api/src/core/import/discovery/import-discovery.service.ts`

Auto-discovers and manages import services:

```typescript
export class ImportDiscoveryService {
  constructor(
    private fastify: FastifyInstance,
    private db: Knex,
  ) {}

  // Scan for import services and register them
  async discoverServices(): Promise<void>;

  // Get all discovered services
  getAllServices(): RegisteredImportService[];

  // Get service by module name
  getService(moduleName: string): IImportService | null;

  // Get recommended import order
  getImportOrder(): string[];

  // Validate no circular dependencies
  private validateDependencies(): void;

  // Build dependency graph
  private buildDependencyGraph(): void;
}
```

**Discovery Process:**

1. Glob pattern matches `**/*-import.service.ts` files
2. Dynamic import triggers decorators
3. Metadata collected from registry
4. Dependency graph validation
5. Services instantiated with DI
6. Metadata persisted to database

#### 4. ImportServiceRegistry

**Location**: `apps/api/src/core/import/registry/import-service-registry.ts`

Global registry for decorator metadata:

```typescript
// Register during decorator execution
registerImportService({
  module: 'departments',
  domain: 'inventory',
  displayName: 'Departments',
  // ... more metadata
  target: DepartmentsImportService,
  filePath: '.../departments-import.service.ts',
});

// Retrieve for discovery
const allServices = getRegisteredImportServices();
const service = getRegisteredService('departments');
```

#### 5. Import Repositories

**Location**: `apps/api/src/core/import/repositories/`

Database access for import metadata:

- **ImportSessionRepository**: Manages validation sessions
- **ImportHistoryRepository**: Tracks all imports
- **ImportBatchRepository**: Manages batch metadata

#### 6. SystemInitService

**Location**: `apps/api/src/modules/admin/system-init/system-init.service.ts`

Business logic orchestration:

```typescript
export class SystemInitService {
  // Get all available modules
  async getAvailableModules(filters?: any): Promise<AvailableModulesResponse>;

  // Get recommended import order
  async getImportOrder(includeDetails?: boolean): Promise<ImportOrderResponse>;

  // Generate CSV/Excel template
  async generateTemplate(moduleName: string, format: 'csv' | 'excel'): Promise<Buffer>;

  // Validate uploaded file
  async validateFile(moduleName: string, buffer: Buffer, fileName: string, fileType: 'csv' | 'excel', context: ImportContext): Promise<ValidateResponse>;

  // Execute import
  async executeImport(moduleName: string, sessionId: string, options: ImportOptions, context: ImportContext): Promise<ImportResponse>;

  // Check import progress
  async getImportStatus(moduleName: string, jobId: string): Promise<StatusResponse>;

  // Rollback import
  async rollbackImport(moduleName: string, jobId: string, context: ImportContext): Promise<RollbackResponse>;

  // Dashboard data
  async getDashboardData(options: any): Promise<DashboardResponse>;

  // Health check
  async getHealthStatus(): Promise<HealthResponse>;
}
```

#### 7. SystemInitController

**Location**: `apps/api/src/modules/admin/system-init/system-init.controller.ts`

HTTP request handlers with TypeBox validation:

```typescript
export class SystemInitController {
  async listAvailableModules(request, reply): Promise<AvailableModulesResponse>;
  async getImportOrder(request, reply): Promise<ImportOrderResponse>;
  async downloadTemplate(request, reply): Promise<Buffer>;
  async validateFile(request, reply): Promise<ValidateResponse>;
  async executeImport(request, reply): Promise<ImportResponse>;
  async getImportStatus(request, reply): Promise<StatusResponse>;
  async rollbackImport(request, reply): Promise<RollbackResponse>;
  async getDashboard(request, reply): Promise<DashboardResponse>;
  async getHealthStatus(request, reply): Promise<HealthResponse>;
}
```

### Frontend Components

#### 1. System Init Dashboard Page

**Location**: `apps/web/src/app/features/system-init/pages/system-init-dashboard/`

Main dashboard component displaying:

- Overview statistics (total, completed, pending modules)
- Module cards grouped by domain
- Recent import history timeline
- Filter and search capabilities
- Responsive grid layout (3 columns on desktop, 1 on mobile)

**Features:**

- Auto-refresh every 30 seconds
- Real-time status updates
- Filter by domain, status, search term
- Sort by priority, name, status
- Click module card to open import wizard

#### 2. Import Wizard Dialog (4-Step Process)

**Location**: `apps/web/src/app/features/system-init/components/import-wizard/`

**Step 1: Download Template**

- Shows module details
- Display template columns
- Download CSV or Excel template

**Step 2: Upload File**

- Drag & drop file upload
- File type validation (CSV, Excel)
- File size validation (<10MB)
- Show file details after selection

**Step 3: Validation Results**

- Display validation summary (total, valid, error rows)
- Show errors (must fix before import)
- Show warnings (can skip)
- Option to skip warnings
- Batch size configuration

**Step 4: Import Execution**

- Progress bar with percentage
- Real-time updates (2-second polling)
- Elapsed time and estimated completion
- Success/failure message
- Rollback button on completion

#### 3. Module Card Component

**Location**: `apps/web/src/app/features/system-init/components/module-card/`

Displays single module status:

**Visual States:**

- **Not Started**: "Import" button
- **In Progress**: Progress bar with percentage
- **Completed**: Record count, import timestamp, rollback button
- **Failed**: Error message, retry button

#### 4. Progress Tracker Component

**Location**: `apps/web/src/app/features/system-init/components/progress-tracker/`

Real-time progress display:

- Overall progress bar
- Current batch tracking
- Elapsed and estimated time
- Records/second speed
- Cancel button

#### 5. Import History Timeline Component

**Location**: `apps/web/src/app/features/system-init/components/import-history-timeline/`

Chronological import list:

- Module name, status, timestamp
- Records imported
- Imported by user
- Quick actions (view details, rollback)
- Load more pagination

#### 6. Validation Results Component

**Location**: `apps/web/src/app/features/system-init/components/validation-results/`

Detailed validation display:

- Error list (expandable rows)
- Warning list (expandable rows)
- Statistics summary
- Download report button

#### 7. Services

**SystemInitService** (`apps/web/src/app/features/system-init/services/`)

HTTP client for backend APIs:

```typescript
@Injectable({ providedIn: 'root' })
export class SystemInitService {
  getAvailableModules(): Observable<AvailableModulesResponse>;
  getDashboard(): Observable<DashboardResponse>;
  downloadTemplate(moduleName: string, format: 'csv' | 'xlsx'): Observable<Blob>;
  validateFile(moduleName: string, file: File): Observable<ValidationResult>;
  importData(moduleName: string, sessionId: string, options: ImportOptions): Observable<ImportJobResponse>;
  getImportStatus(moduleName: string, jobId: string): Observable<ImportStatus>;
  rollbackImport(moduleName: string, jobId: string): Observable<void>;
}
```

**ImportProgressService** - Tracks import progress via polling

**UserDepartmentsService** - User-department relationships (for user import)

---

## 4. How to Add New Module/Table

### Step-by-Step Guide (Thai Instructions)

### ขั้นตอนที่ 1: สร้าง Import Service Class

1. สร้างไฟล์ `apps/api/src/modules/[domain]/[subdomain]/[table]/[table]-import.service.ts`

2. Import necessary dependencies:

```typescript
import { Knex } from 'knex';
import {
  ImportService,
  BaseImportService,
  TemplateColumn,
  ValidationError,
} from '../../../../core/import';
import type { [Entity], Create[Entity] } from './[table].types';
import { [EntityName]Repository } from './[table].repository';
```

3. Add @ImportService decorator with metadata

4. Extend BaseImportService<T>

5. Implement required methods

### ขั้นตอนที่ 2: เพิ่ม Column import_batch_id

ในไฟล์ migration ของตาราที่เกี่ยวข้อง:

```sql
ALTER TABLE [table_name] ADD COLUMN import_batch_id UUID DEFAULT NULL;
CREATE INDEX idx_[table_name]_import_batch ON [table_name](import_batch_id);
```

### ขั้นตอนที่ 3: ใช้ @ImportService Decorator

```typescript
@ImportService({
  module: 'table_name',
  domain: 'inventory', // หรือ hr, finance, etc.
  subdomain: 'master-data', // หรือ operations
  displayName: 'Display Name (ชื่อไทย)',
  description: 'Module description',
  dependencies: [], // e.g., ['users', 'departments']
  priority: 1, // 1 = import first, 100 = import last
  tags: ['master-data', 'required'],
  supportsRollback: true,
  version: '1.0.0',
})
export class [EntityName]ImportService extends BaseImportService<[Entity]> {
  // Implementation...
}
```

### ขั้นตอนที่ 4: Implement Required Methods

#### Method 1: getTemplateColumns()

Define CSV/Excel template structure:

```typescript
getTemplateColumns(): TemplateColumn[] {
  return [
    {
      name: 'code',
      displayName: 'Code',
      required: true,
      type: 'string',
      maxLength: 50,
      pattern: '^[A-Z0-9_-]+$',
      description: 'Unique code',
      example: 'CODE-01',
    },
    {
      name: 'name',
      displayName: 'Name',
      required: true,
      type: 'string',
      maxLength: 255,
      description: 'Full name',
      example: 'Example Name',
    },
    {
      name: 'is_active',
      displayName: 'Active',
      required: false,
      type: 'boolean',
      description: 'Is active',
      example: 'true',
    },
  ];
}
```

#### Method 2: validateRow()

Business logic validation:

```typescript
async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // 1. Check required fields
  if (!row.code || !row.code.trim()) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'Code is required',
      severity: 'ERROR',
      code: 'REQUIRED_FIELD',
    });
  }

  // 2. Check duplicates
  const existing = await this.knex('table_name')
    .where('code', row.code)
    .first();
  if (existing) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: `Code '${row.code}' already exists`,
      severity: 'ERROR',
      code: 'DUPLICATE_CODE',
    });
  }

  // 3. Validate foreign keys
  if (row.department_id) {
    const dept = await this.knex('inventory.departments')
      .where('id', row.department_id)
      .first();
    if (!dept) {
      errors.push({
        row: rowNumber,
        field: 'department_id',
        message: `Department ${row.department_id} not found`,
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
      });
    }
  }

  // 4. Warnings (optional)
  if (!row.description) {
    errors.push({
      row: rowNumber,
      field: 'description',
      message: 'Description is recommended',
      severity: 'WARNING',
      code: 'MISSING_RECOMMENDED',
    });
  }

  return errors;
}
```

#### Method 3: insertBatch()

Insert validated data:

```typescript
protected async insertBatch(
  batch: any[],
  trx: Knex.Transaction,
  options: any,
): Promise<[Entity][]> {
  const results: [Entity][] = [];

  for (const row of batch) {
    try {
      // Transform row data to DB format
      const dbData = this.transformRowToDb(row);

      // Include import_batch_id
      if (row.import_batch_id) {
        dbData.import_batch_id = row.import_batch_id;
      }

      // Insert into database
      const [inserted] = await trx('schema.table_name')
        .insert(dbData)
        .returning('*');

      // Transform back to entity
      const entity = this.transformDbToEntity(inserted);
      results.push(entity);
    } catch (error) {
      console.error(`Failed to insert:`, error);
      throw error;
    }
  }

  return results;
}

private transformRowToDb(row: any): Partial<any> {
  return {
    code: row.code?.trim(),
    name: row.name?.trim(),
    is_active: row.is_active === 'true' || row.is_active === true,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

private transformDbToEntity(dbRow: any): [Entity] {
  return {
    id: dbRow.id,
    code: dbRow.code,
    name: dbRow.name,
    is_active: dbRow.is_active,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
  };
}
```

#### Method 4: performRollback()

Delete imported data:

```typescript
protected async performRollback(
  batchId: string,
  knex: Knex,
): Promise<number> {
  try {
    const deleted = await knex('schema.table_name')
      .where({ import_batch_id: batchId })
      .delete();

    return deleted;
  } catch (error) {
    throw new Error(
      `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
```

### Code Template

Here's a complete template you can copy and modify:

```typescript
/**
 * [EntityName] Import Service
 * Auto-Discovery Import System implementation for [table description]
 *
 * Features:
 * - Auto-discovery via @ImportService decorator
 * - Template generation (CSV/Excel)
 * - Session-based validation
 * - Batch import with transaction support
 * - Rollback support
 *
 * Dependencies: [list dependencies like 'users', 'departments', or 'None']
 * Priority: [1-100, where 1 = import first]
 */

import { Knex } from 'knex';
import {
  ImportService,
  BaseImportService,
  TemplateColumn,
  ValidationError,
} from '../../../../core/import';
import type { [Entity], Create[Entity] } from './[table].types';
import { [EntityName]Repository } from './[table].repository';

@ImportService({
  module: '[table_name]',
  domain: '[domain]', // inventory, hr, finance, etc.
  subdomain: '[subdomain]', // master-data, operations, etc.
  displayName: '[Display Name (Thai)]',
  description: '[Module description]',
  dependencies: [], // e.g., ['users', 'departments']
  priority: [number], // 1 = first, 100 = last
  tags: ['[tag1]', '[tag2]'],
  supportsRollback: true,
  version: '1.0.0',
})
export class [EntityName]ImportService extends BaseImportService<[Entity]> {
  private repository: [EntityName]Repository;

  constructor(knex: Knex) {
    super(knex);
    this.repository = new [EntityName]Repository(knex);
    this.moduleName = '[table_name]';
  }

  getMetadata() {
    return {
      module: '[table_name]',
      domain: '[domain]',
      subdomain: '[subdomain]',
      displayName: '[Display Name (Thai)]',
      description: '[Module description]',
      dependencies: [],
      priority: [number],
      tags: ['[tag1]', '[tag2]'],
      supportsRollback: true,
      version: '1.0.0',
    };
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'code',
        displayName: 'Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code',
        example: 'CODE-01',
      },
      // Add more columns...
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Implement validation logic

    return errors;
  }

  protected async insertBatch(
    batch: any[],
    trx: Knex.Transaction,
    options: any,
  ): Promise<[Entity][]> {
    const results: [Entity][] = [];

    for (const row of batch) {
      try {
        const dbData = this.transformRowToDb(row);

        if (row.import_batch_id) {
          dbData.import_batch_id = row.import_batch_id;
        }

        const [inserted] = await trx('schema.[table_name]')
          .insert(dbData)
          .returning('*');

        const entity = this.transformDbToEntity(inserted);
        results.push(entity);
      } catch (error) {
        console.error(`Failed to insert:`, error);
        throw error;
      }
    }

    return results;
  }

  protected async performRollback(
    batchId: string,
    knex: Knex,
  ): Promise<number> {
    try {
      const deleted = await knex('schema.[table_name]')
        .where({ import_batch_id: batchId })
        .delete();

      return deleted;
    } catch (error) {
      throw new Error(
        `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private transformRowToDb(row: any): Partial<any> {
    return {
      code: row.code?.trim(),
      // Transform other fields...
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  private transformDbToEntity(dbRow: any): [Entity] {
    return {
      id: dbRow.id,
      code: dbRow.code,
      // Map other fields...
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }
}
```

---

## 5. Import Workflow

### 4-Step User Process

#### Step 1: Module Selection & Template Download

1. User navigates to System Initialization Dashboard
2. Sees all available modules organized by domain
3. Clicks "Import" on desired module
4. Wizard opens with module details
5. User downloads CSV or Excel template
6. Opens template in Excel/Google Sheets
7. Fills in data

#### Step 2: File Upload

1. User selects filled template file
2. Drags & drops into upload zone OR clicks to browse
3. Client validates:
   - File size < 10MB
   - File type is CSV or Excel
4. Displays selected file details
5. Proceeds to validation

#### Step 3: Validation

1. File uploaded to server
2. Server parses CSV/Excel
3. Header mapping to template columns
4. Row-by-row validation:
   - Required fields check
   - Type validation
   - Length validation
   - Duplicate detection
   - Foreign key validation
5. Validation session created (30-min expiration)
6. Results displayed:
   - Errors (red) - must fix
   - Warnings (yellow) - can skip
   - Statistics (total, valid, error rows)
7. User reviews and proceeds

#### Step 4: Import Execution

1. User reviews summary
2. Option to skip warnings
3. Clicks "Start Import"
4. Server creates import job
5. Progress tracked in real-time:
   - Progress bar
   - Percentage complete
   - Records imported count
   - Estimated completion time
   - Speed (records/second)
6. User waits for completion (or can close browser)
7. On completion:
   - Success message
   - Record count
   - Timestamp
   - Rollback button (if supported)

### Technical Flow Diagram

```
┌─────────────────┐
│  Upload File    │
└────────┬────────┘
         │
         ▼
   ┌─────────────────────────────────┐
   │ POST /validate                  │
   │ - Parse file (CSV/Excel)        │
   │ - Validate each row             │
   │ - Create session                │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Return ValidationResult         │
   │ - sessionId                     │
   │ - errors, warnings              │
   │ - stats (total, valid, error)   │
   └────────┬────────────────────────┘
            │
      User Reviews Results
            │
            ▼
   ┌─────────────────────────────────┐
   │ POST /import                    │
   │ - Get session                   │
   │ - Generate batch_id             │
   │ - Create import job             │
   │ - Start background processing   │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Background: Process Batches     │
   │ For each 100 rows:              │
   │  1. START TRANSACTION           │
   │  2. Transform row data          │
   │  3. Call insertBatch()          │
   │  4. Update progress             │
   │  5. COMMIT/ROLLBACK             │
   │  6. Emit WebSocket event        │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ GET /status (polling)           │
   │ Every 2 seconds:                │
   │ - Check job status              │
   │ - Get progress                  │
   │ - Update UI                     │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Import Complete                 │
   │ - Status: completed/failed      │
   │ - Records imported/failed       │
   │ - Duration                      │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Optional: Rollback              │
   │ DELETE WHERE import_batch_id=id │
   └─────────────────────────────────┘
```

---

## 6. API Endpoints

All endpoints are under base path: `/api/admin/system-init`

### 1. GET `/available-modules`

**Purpose**: List all discovered import modules

**Query Parameters:**

- `domain` (optional): Filter by domain
- `tag` (optional): Filter by tag
- `limit` (optional): Max modules to return

**Response:**

```typescript
{
  success: true,
  data: {
    modules: [
      {
        module: 'departments',
        domain: 'inventory',
        subdomain: 'master-data',
        displayName: 'Departments (แผนก)',
        displayNameThai: 'แผนก',
        dependencies: [],
        priority: 1,
        tags: ['master-data', 'required'],
        importStatus: 'not_started', // not_started, in_progress, completed, failed
        recordCount: 0,
        lastImport: {
          jobId: 'uuid',
          completedAt: '2025-12-13T10:00:00Z',
          importedBy: { id: 'user-uuid', name: 'Admin User' }
        }
      }
      // ... more modules
    ],
    totalModules: 30,
    completedModules: 5,
    pendingModules: 25,
  },
  meta: { requestId, timestamp, version }
}
```

### 2. GET `/import-order`

**Purpose**: Get recommended import order with dependency reasoning

**Query Parameters:**

- `includeDetails` (optional): Include dependency details

**Response:**

```typescript
{
  success: true,
  data: {
    order: [
      {
        module: 'drug_generics',
        reason: 'No dependencies, required for setup',
        priority: 1,
        dependencies: [],
      },
      {
        module: 'users',
        reason: 'No dependencies, required for setup',
        priority: 1,
        dependencies: [],
      },
      {
        module: 'departments',
        reason: 'Depends on users (completed)',
        priority: 2,
        dependencies: ['users'],
      },
      // ... more modules
    ],
  },
  meta: { requestId, timestamp, version }
}
```

### 3. GET `/module/:moduleName/template`

**Purpose**: Download CSV or Excel template

**Path Parameters:**

- `moduleName` (required): Module identifier

**Query Parameters:**

- `format` (optional): 'csv' or 'excel' (default: 'csv')

**Response:**

- File download (Content-Type: text/csv or application/xlsx)
- Headers: Content-Disposition attachment

**Example:**

```bash
GET /api/admin/system-init/module/departments/template?format=excel
# Response: departments_template.xlsx file
```

### 4. POST `/module/:moduleName/validate`

**Purpose**: Validate uploaded file

**Path Parameters:**

- `moduleName` (required): Module identifier

**Request:**

- Content-Type: multipart/form-data
- Body: `file` (File)

**Response:**

```typescript
{
  success: true,
  data: {
    sessionId: 'uuid-xxx',
    isValid: true,
    errors: [
      {
        row: 5,
        field: 'code',
        message: "Code 'PHARM' already exists",
        severity: 'ERROR',
        code: 'DUPLICATE_CODE',
      }
    ],
    warnings: [
      {
        row: 15,
        field: 'description',
        message: 'Description is recommended',
        severity: 'WARNING',
        code: 'MISSING_RECOMMENDED',
      }
    ],
    stats: {
      totalRows: 50,
      validRows: 48,
      errorRows: 0,
      warningRows: 2,
    },
    expiresAt: '2025-12-13T15:30:00Z',
    canProceed: true, // isValid or (allowWarnings && noErrors)
  },
  meta: { requestId, timestamp, version }
}
```

**Error Cases:**

- 413: File size exceeds 10MB
- 400: No file provided, invalid format
- 404: Module not found
- 500: Processing error

### 5. POST `/module/:moduleName/import`

**Purpose**: Execute import from validated session

**Path Parameters:**

- `moduleName` (required): Module identifier

**Request Body:**

```typescript
{
  sessionId: 'uuid-xxx', // From validation response
  options: {
    skipWarnings: false, // Skip warnings and proceed
    batchSize: 100, // Records per batch (default: 100)
    onConflict: 'skip', // skip, update, error
  }
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    jobId: 'job-uuid-yyy',
    status: 'queued', // queued, running, completed, failed
    message: 'Import job started successfully',
    createdAt: '2025-12-13T15:00:00Z',
  },
  meta: { requestId, timestamp, version }
}
```

**Error Cases:**

- 400: Invalid session, cannot proceed
- 401: Unauthorized
- 404: Module or session not found
- 500: Import execution error

### 6. GET `/module/:moduleName/status/:jobId`

**Purpose**: Check import job progress

**Path Parameters:**

- `moduleName` (required): Module identifier
- `jobId` (required): Job ID from import response

**Response:**

```typescript
{
  success: true,
  data: {
    jobId: 'job-uuid-yyy',
    status: 'running', // queued, running, completed, failed
    progress: {
      totalRows: 150,
      importedRows: 75,
      failedRows: 0,
      currentRow: 75,
      percentComplete: 50,
    },
    startedAt: '2025-12-13T15:00:00Z',
    completedAt: null,
    estimatedRemaining: 10000, // milliseconds
    speed: 7.5, // records per second
    error: null,
  },
  meta: { requestId, timestamp, version }
}
```

### 7. DELETE `/module/:moduleName/rollback/:jobId`

**Purpose**: Rollback completed import

**Path Parameters:**

- `moduleName` (required): Module identifier
- `jobId` (required): Completed job ID

**Response:**

```typescript
{
  success: true,
  data: {
    jobId: 'job-uuid-yyy',
    success: true,
    message: 'Import rolled back successfully',
    deletedRecords: 150,
    rolledBackAt: '2025-12-13T15:15:00Z',
  },
  meta: { requestId, timestamp, version }
}
```

**Error Cases:**

- 400: Module doesn't support rollback
- 401: Unauthorized
- 404: Job not found
- 500: Rollback error

### 8. GET `/dashboard`

**Purpose**: Centralized system initialization dashboard

**Query Parameters:**

- `includeHistory` (optional): Include recent imports
- `historyLimit` (optional): Max history records

**Response:**

```typescript
{
  success: true,
  data: {
    overview: {
      totalModules: 30,
      completedModules: 8,
      inProgressModules: 1,
      pendingModules: 21,
      totalRecordsImported: 5432,
    },
    modulesByDomain: {
      inventory: { total: 20, completed: 5, inProgress: 1 },
      core: { total: 5, completed: 2, inProgress: 0 },
      hr: { total: 5, completed: 1, inProgress: 0 },
    },
    recentImports: [
      {
        jobId: 'uuid',
        module: 'users',
        status: 'completed',
        recordsImported: 10,
        completedAt: '2025-12-13T11:05:00Z',
        importedBy: { id: 'user-uuid', name: 'admin@example.com' },
      }
      // ... up to historyLimit
    ],
    nextRecommended: [
      {
        module: 'users',
        reason: 'No dependencies, required for setup',
      },
      {
        module: 'departments',
        reason: 'Depends on users (not started)',
      },
    ],
  },
  meta: { requestId, timestamp, version }
}
```

### 9. GET `/health-status`

**Purpose**: Check import discovery service health

**Response:**

```typescript
{
  success: true,
  data: {
    isHealthy: true,
    discoveredServices: 30,
    validationErrors: [],
    circularDependencies: [],
    services: [
      { module: 'departments', status: 'active' },
      { module: 'users', status: 'active' },
      // ... all services
    ],
  },
  meta: { requestId, timestamp, version }
}
```

---

## 7. Configuration Options

### @ImportService Decorator Options

```typescript
interface ImportServiceConfig {
  // Identification
  module: string; // Unique identifier (e.g., 'departments')
  domain: string; // Domain (inventory, hr, finance, core)
  subdomain?: string; // Subdomain (master-data, operations)

  // Display
  displayName: string; // Display name (e.g., 'Departments (แผนก)')
  displayNameThai?: string; // Thai name only
  description?: string; // Module description

  // Dependencies
  dependencies?: string[]; // Array of module IDs (e.g., ['users'])
  priority?: number; // Import order (1 = first, 100 = last)

  // Features
  tags?: string[]; // Tags for filtering (e.g., ['master-data', 'required'])
  supportsRollback?: boolean; // Enable rollback (default: false)
  version?: string; // Module version (e.g., '1.0.0')
}
```

**Example:**

```typescript
@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics (ยาหลัก)',
  description: 'Master list of generic drugs',
  dependencies: [], // No dependencies
  priority: 1,      // Import first
  tags: ['master-data', 'required'],
  supportsRollback: true,
  version: '1.0.0',
})
```

### Template Column Options

```typescript
interface TemplateColumn {
  name: string; // Field name in code
  displayName?: string; // Header in template
  required: boolean; // Is field required
  type: 'string' | 'number' | 'boolean' | 'date';
  maxLength?: number; // Max string length
  minValue?: number; // Min numeric value
  maxValue?: number; // Max numeric value
  pattern?: string; // Regex pattern for validation
  enumValues?: string[]; // List of allowed values
  description?: string; // Column description
  example?: string; // Example value
}
```

**Example:**

```typescript
{
  name: 'generic_code',
  displayName: 'Generic Code',
  required: true,
  type: 'string',
  maxLength: 50,
  pattern: '^[A-Z0-9_-]+$',
  description: 'Unique code for the generic drug',
  example: 'PARA500',
}
```

---

## 8. Database Schema

### Required Tables

#### Table 1: import_service_registry

Stores discovered module metadata:

```sql
CREATE TABLE public.import_service_registry (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(50) NOT NULL,
  subdomain VARCHAR(50),
  display_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Dependencies
  dependencies JSONB DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 100,
  tags JSONB DEFAULT '[]',

  -- Capabilities
  supports_rollback BOOLEAN DEFAULT false,
  version VARCHAR(20),

  -- Import Status
  import_status VARCHAR(20) DEFAULT 'not_started',
  last_import_date TIMESTAMP WITH TIME ZONE,
  last_import_job_id UUID,
  record_count INTEGER DEFAULT 0,

  -- Metadata
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path VARCHAR(500),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_isr_domain ON import_service_registry(domain);
CREATE INDEX idx_isr_status ON import_service_registry(import_status);
CREATE INDEX idx_isr_priority ON import_service_registry(priority);
```

#### Table 2: import_sessions

Stores validation session data:

```sql
CREATE TABLE public.import_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(100) NOT NULL,

  -- Uploaded File
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER,
  file_type VARCHAR(10),

  -- Validation Results
  validated_data JSONB NOT NULL,
  validation_result JSONB NOT NULL,
  can_proceed BOOLEAN NOT NULL DEFAULT false,

  -- Session Lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_by UUID REFERENCES users(id) NOT NULL
);

CREATE INDEX idx_is_module ON import_sessions(module_name);
CREATE INDEX idx_is_expires ON import_sessions(expires_at);
```

#### Table 3: import_history

Tracks all import jobs:

```sql
CREATE TABLE public.import_history (
  id SERIAL PRIMARY KEY,
  job_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES import_sessions(session_id) ON DELETE SET NULL,
  module_name VARCHAR(100) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- Metrics
  total_rows INTEGER,
  imported_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,

  -- Error Tracking
  error_message TEXT,
  error_details JSONB,

  -- Rollback
  can_rollback BOOLEAN DEFAULT true,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  rolled_back_by UUID REFERENCES users(id),

  -- Audit
  imported_by UUID REFERENCES users(id) NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ih_job_id ON import_history(job_id);
CREATE INDEX idx_ih_module ON import_history(module_name);
CREATE INDEX idx_ih_status ON import_history(status);
CREATE INDEX idx_ih_user ON import_history(imported_by);
CREATE INDEX idx_ih_created ON import_history(created_at);
```

#### Table 4: Add to Target Tables

Add to each table that supports imports:

```sql
ALTER TABLE [target_table] ADD COLUMN import_batch_id UUID DEFAULT NULL;
CREATE INDEX idx_[target_table]_import_batch ON [target_table](import_batch_id);
```

---

## 9. Example: Departments Module

Complete working example with all implementations:

### File: departments-import.service.ts

```typescript
/**
 * Departments Import Service
 * Auto-Discovery Import System for hospital departments
 */

import { Knex } from 'knex';
import { ImportService, BaseImportService, TemplateColumn, ValidationError } from '../../../../core/import';
import type { Departments, CreateDepartments } from './departments.types';
import { DepartmentsRepository } from './departments.repository';

@ImportService({
  module: 'departments',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Departments (แผนก)',
  description: 'Master list of hospital departments',
  dependencies: [],
  priority: 1,
  tags: ['master-data', 'required', 'inventory'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DepartmentsImportService extends BaseImportService<Departments> {
  private repository: DepartmentsRepository;

  constructor(knex: Knex) {
    super(knex);
    this.repository = new DepartmentsRepository(knex);
    this.moduleName = 'departments';
  }

  getMetadata() {
    return {
      module: 'departments',
      domain: 'inventory',
      subdomain: 'master-data',
      displayName: 'Departments (แผนก)',
      description: 'Master list of hospital departments',
      dependencies: [],
      priority: 1,
      tags: ['master-data', 'required', 'inventory'],
      supportsRollback: true,
      version: '1.0.0',
    };
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'code',
        displayName: 'Department Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code for the department (e.g., ICU, ED, OPD)',
        example: 'ICU-01',
      },
      {
        name: 'name',
        displayName: 'Department Name',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'Full name of the department in Thai or English',
        example: 'Intensive Care Unit',
      },
      {
        name: 'hospital_id',
        displayName: 'Hospital ID',
        required: false,
        type: 'number',
        description: 'Hospital ID assignment (if provided, must exist in database)',
        example: '1',
      },
      {
        name: 'description',
        displayName: 'Description',
        required: false,
        type: 'string',
        maxLength: 500,
        description: 'Additional description or notes about the department',
        example: 'High-dependency unit for critical patients',
      },
      {
        name: 'is_active',
        displayName: 'Is Active',
        required: false,
        type: 'boolean',
        description: 'Whether this department is currently active',
        example: 'true',
      },
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Required field validation
    if (!row.code || typeof row.code !== 'string' || !row.code.trim()) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'Department code is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!row.name || typeof row.name !== 'string' || !row.name.trim()) {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'Department name is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    // Duplicate code check
    if (row.code && typeof row.code === 'string' && row.code.trim()) {
      const existing = await this.knex('inventory.departments').where('dept_code', row.code.trim()).first();

      if (existing) {
        errors.push({
          row: rowNumber,
          field: 'code',
          message: `Department code '${row.code}' already exists in database`,
          severity: 'ERROR',
          code: 'DUPLICATE_CODE',
        });
      }
    }

    // Hospital ID validation (optional)
    if (row.hospital_id !== undefined && row.hospital_id !== null && row.hospital_id !== '') {
      const hospitalId = parseInt(row.hospital_id, 10);

      if (isNaN(hospitalId)) {
        errors.push({
          row: rowNumber,
          field: 'hospital_id',
          message: 'Hospital ID must be a valid number',
          severity: 'ERROR',
          code: 'INVALID_TYPE',
        });
      } else {
        try {
          const tableExists = await this.knex.schema.hasTable('hospitals');
          if (tableExists) {
            const hospital = await this.knex('hospitals').where('id', hospitalId).first();

            if (!hospital) {
              errors.push({
                row: rowNumber,
                field: 'hospital_id',
                message: `Hospital with ID ${hospitalId} does not exist`,
                severity: 'ERROR',
                code: 'INVALID_REFERENCE',
              });
            }
          }
        } catch {
          // Skip hospital validation if table check fails
        }
      }
    }

    // Code format validation
    if (row.code && typeof row.code === 'string') {
      const codePattern = /^[A-Z0-9_-]+$/;
      if (!codePattern.test(row.code.trim())) {
        errors.push({
          row: rowNumber,
          field: 'code',
          message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores',
          severity: 'ERROR',
          code: 'INVALID_FORMAT',
        });
      }
    }

    // Boolean field validation
    if (row.is_active !== undefined && row.is_active !== null) {
      const activeStr = String(row.is_active).toLowerCase().trim();
      if (!['true', 'false', 'yes', 'no', '1', '0'].includes(activeStr)) {
        errors.push({
          row: rowNumber,
          field: 'is_active',
          message: 'Is Active must be true, false, yes, no, 1, or 0',
          severity: 'ERROR',
          code: 'INVALID_FORMAT',
        });
      }
    }

    return errors;
  }

  protected async insertBatch(batch: any[], trx: Knex.Transaction, options: any): Promise<Departments[]> {
    const results: Departments[] = [];

    for (const row of batch) {
      try {
        const dbData = this.transformRowToDb(row);

        if (row.import_batch_id) {
          dbData.import_batch_id = row.import_batch_id;
        }

        const [inserted] = await trx('inventory.departments').insert(dbData).returning('*');

        const entity = this.transformDbToEntity(inserted);
        results.push(entity);
      } catch (error) {
        console.error(`Failed to insert department:`, error);
        throw error;
      }
    }

    return results;
  }

  protected async performRollback(batchId: string, knex: Knex): Promise<number> {
    try {
      const deleted = await knex('inventory.departments').where({ import_batch_id: batchId }).delete();

      return deleted;
    } catch (error) {
      throw new Error(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private transformRowToDb(row: any): Partial<any> {
    const isActiveStr = String(row.is_active || 'true')
      .toLowerCase()
      .trim();
    const isActive = isActiveStr === 'true' || isActiveStr === 'yes' || isActiveStr === '1';

    return {
      dept_code: row.code ? row.code.trim() : null,
      dept_name: row.name ? row.name.trim() : null,
      his_code: row.hospital_id ? String(row.hospital_id) : null,
      consumption_group: null,
      is_active: isActive,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  private transformDbToEntity(dbRow: any): Departments {
    return {
      id: dbRow.id,
      dept_code: dbRow.dept_code,
      dept_name: dbRow.dept_name,
      his_code: dbRow.his_code,
      parent_id: dbRow.parent_id,
      consumption_group: dbRow.consumption_group,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }
}
```

---

## 10. Best Practices

### 1. Validation Rules

Always validate:

```typescript
✅ Required fields present
✅ Field types correct
✅ String lengths within limits
✅ Numeric ranges valid
✅ Patterns match (regex)
✅ Duplicates don't exist
✅ Foreign key references exist
✅ Enum values are valid
```

**Example:**

```typescript
async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // 1. Required field
  if (!row.code?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'Code is required',
      severity: 'ERROR',
      code: 'REQUIRED_FIELD',
    });
  }

  // 2. Type check
  if (row.quantity && isNaN(Number(row.quantity))) {
    errors.push({
      row: rowNumber,
      field: 'quantity',
      message: 'Quantity must be a number',
      severity: 'ERROR',
      code: 'INVALID_TYPE',
    });
  }

  // 3. Duplicate check
  const existing = await this.knex('table').where('code', row.code).first();
  if (existing) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: `Code '${row.code}' already exists`,
      severity: 'ERROR',
      code: 'DUPLICATE_CODE',
    });
  }

  // 4. Foreign key check
  if (row.department_id) {
    const dept = await this.knex('departments').where('id', row.department_id).first();
    if (!dept) {
      errors.push({
        row: rowNumber,
        field: 'department_id',
        message: `Department ${row.department_id} not found`,
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
      });
    }
  }

  return errors;
}
```

### 2. Defensive Checks for Optional Tables

If a table is optional (might not exist):

```typescript
// Check if table exists before validation
try {
  const tableExists = await this.knex.schema.hasTable('hospitals');
  if (tableExists && row.hospital_id) {
    const hospital = await this.knex('hospitals').where('id', row.hospital_id).first();
    if (!hospital) {
      errors.push({
        row: rowNumber,
        field: 'hospital_id',
        message: `Hospital ${row.hospital_id} not found`,
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
      });
    }
  }
} catch {
  // Skip validation if table check fails
}
```

### 3. Error Messages in Thai and English

Provide clear messages:

```typescript
errors.push({
  row: rowNumber,
  field: 'code',
  message: 'Code must be unique (รหัสต้องไม่ซ้ำ)',
  severity: 'ERROR',
  code: 'DUPLICATE_CODE',
});
```

### 4. Set Dependencies and Priority Correctly

```typescript
@ImportService({
  // Independent modules (import first)
  dependencies: [],
  priority: 1,

  // Modules that depend on others
  dependencies: ['users', 'departments'],
  priority: 5,
})
```

**Guidelines:**

- **Priority 1**: No dependencies (users, departments, drugs)
- **Priority 2-3**: Few dependencies (locations needs departments)
- **Priority 4-5**: Complex dependencies (budgets needs multiple)
- **Priority 6+**: Final modules (reports, analytics)

### 5. Test Rollback Functionality

```typescript
// After import
const jobId = importResponse.jobId;

// Later, test rollback
const rollbackResult = await systemInitService.rollbackImport('departments', jobId);

// Verify count matches
expect(rollbackResult.deletedRecords).toBe(50);

// Verify records deleted
const count = await knex('inventory.departments').where('import_batch_id', jobId).count();
expect(count).toBe(0);
```

### 6. Add Comprehensive Validation

Don't just check types, check business logic:

```typescript
// Bad: Only type check
if (typeof row.quantity !== 'number') {
  errors.push(...);
}

// Good: Type + business logic
const qty = Number(row.quantity);
if (isNaN(qty)) {
  errors.push({ message: 'Quantity must be a valid number' });
}
if (qty <= 0) {
  errors.push({ message: 'Quantity must be greater than zero' });
}
if (qty > 10000) {
  errors.push({ message: 'Quantity cannot exceed 10,000' });
}
```

### 7. Use Proper TypeBox Schemas for API Routes

```typescript
// For request validation
const ImportDataRequestSchema = Type.Object({
  sessionId: Type.String({ format: 'uuid' }),
  options: Type.Optional(
    Type.Object({
      skipWarnings: Type.Boolean(),
      batchSize: Type.Number({ minimum: 1, maximum: 1000 }),
      onConflict: Type.Enum({ skip: 'skip', update: 'update', error: 'error' }),
    }),
  ),
});

// For response
const ImportResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    jobId: Type.String({ format: 'uuid' }),
    status: Type.String(),
    message: Type.String(),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String(),
    version: Type.String(),
  }),
});
```

---

## 11. Troubleshooting

### Common Issues

#### Issue 1: Module not appearing in dashboard

**Symptoms:**

- Service created but not in available modules list
- API returns fewer modules than expected

**Diagnosis:**

```bash
# Check file naming
ls -la apps/api/src/modules/**/[table]-import.service.ts

# Check decorator is applied
grep -n "@ImportService" apps/api/src/modules/**/[table]-import.service.ts

# Check class name ends with ImportService
grep -n "class.*ImportService" apps/api/src/modules/**/[table]-import.service.ts
```

**Solution:**

1. Ensure file name matches pattern: `*-import.service.ts`
2. Ensure class extends `BaseImportService<T>`
3. Ensure `@ImportService` decorator is present
4. Restart API server
5. Check server logs for discovery process

#### Issue 2: Validation errors not showing

**Symptoms:**

- File uploaded successfully
- No errors returned
- Validation shows "canProceed: true"

**Solution:**

1. Check `validateRow()` is implemented
2. Add console.log() to debug:

```typescript
async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
  console.log(`Validating row ${rowNumber}:`, row);
  const errors: ValidationError[] = [];
  // ... validation logic
  console.log(`Row ${rowNumber} errors:`, errors);
  return errors;
}
```

3. Check error codes match expected values
4. Verify database queries in validation

#### Issue 3: Import fails silently

**Symptoms:**

- Import shows as complete
- No records inserted
- No error message

**Solution:**

1. Check database transaction errors:

```typescript
protected async insertBatch(batch, trx, options) {
  for (const row of batch) {
    try {
      const dbData = this.transformRowToDb(row);
      console.log('Inserting:', dbData);
      const result = await trx('schema.table').insert(dbData).returning('*');
      console.log('Insert result:', result);
    } catch (error) {
      console.error('Insert error:', error);
      throw error; // Important: re-throw error
    }
  }
}
```

2. Check import_batch_id column exists
3. Check table schema matches expectations
4. Run migration: `pnpm run db:migrate`

#### Issue 4: Rollback not working

**Symptoms:**

- Rollback API returns success
- Records still exist in database
- deletedRecords count is 0

**Diagnosis:**

```sql
-- Check import_batch_id column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = '[table]' AND column_name = 'import_batch_id';

-- Check records with batch_id
SELECT COUNT(*) FROM [table] WHERE import_batch_id = 'job-uuid';

-- Check index
SELECT indexname FROM pg_indexes WHERE tablename = '[table]';
```

**Solution:**

1. Add column if missing:

```sql
ALTER TABLE [table] ADD COLUMN import_batch_id UUID DEFAULT NULL;
```

2. Create index:

```sql
CREATE INDEX idx_[table]_import_batch ON [table](import_batch_id);
```

3. Update `performRollback()` to use correct column name

#### Issue 5: Circular dependency detected

**Symptoms:**

- Server fails to start
- Error: "Circular dependency detected: A → B → C → A"

**Solution:**

1. Review dependencies in @ImportService decorators
2. Find circular chain in error message
3. Remove one dependency to break cycle:

```typescript
// Before (circular)
@ImportService({ module: 'A', dependencies: ['B'] })
class A {}

@ImportService({ module: 'B', dependencies: ['C'] })
class B {}

@ImportService({ module: 'C', dependencies: ['A'] }) // <- Remove this
class C {}

// After (fixed)
@ImportService({ module: 'C', dependencies: [] })
class C {}
```

4. Restart server to verify

### Debug Commands

```bash
# Check discovered modules
curl http://localhost:4249/api/admin/system-init/available-modules

# Check import order
curl http://localhost:4249/api/admin/system-init/import-order

# Check health status
curl http://localhost:4249/api/admin/system-init/health-status

# View server logs for import discovery
npm run dev:api | grep -i "import\|discovery"

# List import service files
find apps/api/src -name "*-import.service.ts" -type f

# Check for syntax errors
npx tsc --noEmit apps/api/src/modules/**/[table]-import.service.ts
```

---

## 12. Related Documentation

### API Documentation

- **API Contracts**: `docs/features/system-initialization/API_CONTRACTS.md`
- **API Endpoint Reference**: [See Section 6 above](#6-api-endpoints)

### Implementation Details

- **Auto-Discovery System Design**: `docs/features/system-initialization/AUTO_DISCOVERY_IMPORT_SYSTEM.md`
- **Batch Tracking & Rollback**: `docs/features/system-initialization/BATCH_TRACKING_MIGRATION.md`
- **Frontend Specification**: `docs/features/system-initialization/FRONTEND_SPECIFICATION.md`

### Component Documentation

- **Base Import Service**: `apps/api/src/shared/services/base-import.service.ts`
- **Import Discovery Service**: `apps/api/src/core/import/discovery/import-discovery.service.ts`
- **System Init Controller**: `apps/api/src/modules/admin/system-init/system-init.controller.ts`

### User Guides

- **User Departments Service**: `docs/features/system-initialization/USER_DEPARTMENTS_SERVICE.md`
- **Import History Timeline**: `docs/features/system-initialization/IMPORT_HISTORY_TIMELINE_COMPONENT.md`
- **Testing Guide**: `docs/features/system-initialization/TESTING_GUIDE.md`

### Development Guidelines

- **Universal Full-Stack Standard**: `docs/development/universal-fullstack-standard.md`
- **API Calling Standard**: `docs/development/API_CALLING_STANDARD.md`
- **QA Checklist**: `docs/development/qa-checklist.md`

---

## Summary

The **System Initialization Feature** provides a complete, production-ready data import system for AegisX:

### Key Capabilities

- **Auto-Discovery**: Zero-configuration module discovery
- **Validation**: Comprehensive field and business logic validation
- **Batch Processing**: Atomic transactions with configurable batch sizes
- **Progress Tracking**: Real-time updates via WebSocket/polling
- **Rollback Support**: Safe rollback via `import_batch_id` column
- **Dependency Management**: Automatic import ordering with circular dependency detection
- **Audit Trail**: Complete history of all imports with user tracking

### For Developers

1. **Adding a new module**: Follow [Section 4](#4-how-to-add-new-moduletable)
2. **Understanding architecture**: See [Section 2](#2-architecture)
3. **API integration**: See [Section 6](#6-api-endpoints)
4. **Troubleshooting**: See [Section 11](#11-troubleshooting)

### For Users

1. Access dashboard at `/admin/system-init`
2. Follow 4-step wizard: Download → Upload → Validate → Import
3. Monitor progress in real-time
4. Rollback if needed (15 minutes of processing)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-14
**Status**: Production Ready
