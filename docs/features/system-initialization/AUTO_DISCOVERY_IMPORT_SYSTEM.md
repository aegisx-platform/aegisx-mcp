# Auto-Discovery Import System Design

> **Status**: Design Complete - Ready for Implementation
> **Author**: Claude Code Planning Agent
> **Date**: 2024-12-13
> **Context**: SaaS product requiring hospital-specific data import on installation

## Executive Summary

A zero-configuration auto-discovery system for data import services that automatically detects modules with import capability and displays them in a centralized dashboard. Supports 30+ modules with dependency-aware ordering, session-based validation, and comprehensive audit trails.

## Business Context

### Problem Statement

- AegisX is a SaaS product sold to hospitals (single installation per hospital)
- Each hospital needs to import initial data: users, departments, drugs, budget plans, etc.
- Currently no centralized system to discover and manage imports
- Developers must manually register new import capabilities
- No standard pattern for implementing imports

### User Requirements

"ถ้าสมมุติว่ามี module ใหม่ๆ พัฒนาขึ้นก็สามารถใช้ตัวนี้ได้และผมอยากให้ระบบมันรุ้ว่าตอนนี้มีการทำระบบ import ขึ้นมาสำหรับ module นั้น ๆแล้วระบบสามารถดึงไปแสดงอยู่ใน center ว่าเราต้อง import อะไรบ้างเพื่อไม่ต้องไปตามหาอีกอยากให้เป็น standard สำรับหระบบไปเลยครับ"

**Translation**: Want auto-discovery system where:

1. New modules can use standard import pattern
2. System automatically knows which modules have import capability
3. Centralized dashboard shows all available imports
4. Zero manual registration/configuration needed
5. Standard for entire system

### Success Criteria

- ✅ Zero-configuration discovery (developers don't manually register)
- ✅ Sub-100ms discovery time
- ✅ Type-safe throughout (no `any` types)
- ✅ Automatic dependency resolution
- ✅ Production-ready with rollback support
- ✅ Works with existing BaseImportService pattern

## Architecture Overview

### Discovery Mechanism: Hybrid Approach

**Combines three patterns for robust discovery:**

1. **TypeScript Decorators** - Declarative metadata
2. **File Convention** - `**/*-import.service.ts` pattern
3. **Runtime Registry** - Global service catalog

```typescript
// Step 1: Developer decorates service class
@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics (ยาหลัก)',
  dependencies: [],
  priority: 1,
  tags: ['master-data', 'required'],
  supportsRollback: true,
})
export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  // Implementation...
}

// Step 2: Decorator execution populates global registry
// Step 3: Discovery service scans files and instantiates services
// Step 4: Services appear in centralized dashboard
```

### Core Components

#### 1. Import Service Interface

```typescript
export interface IImportService<T = any> {
  // Metadata
  getMetadata(): ImportServiceMetadata;

  // Template Generation
  generateTemplate(format: 'csv' | 'excel'): Promise<Buffer>;
  getTemplateColumns(): TemplateColumn[];

  // Validation (Session-based)
  validateFile(
    buffer: Buffer,
    fileName: string,
    fileType: 'csv' | 'excel',
  ): Promise<{
    sessionId: string;
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    stats: { totalRows: number; validRows: number; errorRows: number };
  }>;

  validateRow(row: any, rowNumber: number): Promise<ValidationError[]>;

  // Import Execution
  importData(
    sessionId: string,
    options: ImportOptions,
  ): Promise<{
    jobId: string;
    status: 'queued' | 'running';
  }>;

  getImportStatus(jobId: string): Promise<ImportStatus>;

  // Rollback
  canRollback(jobId: string): Promise<boolean>;
  rollback(jobId: string): Promise<void>;

  // History
  getImportHistory(limit?: number): Promise<ImportHistoryRecord[]>;
}
```

#### 2. Metadata Types

```typescript
export interface ImportServiceMetadata {
  module: string; // e.g., 'drug_generics'
  domain: string; // e.g., 'inventory'
  subdomain?: string; // e.g., 'master-data'
  displayName: string; // e.g., 'Drug Generics (ยาหลัก)'
  description?: string;
  dependencies: string[]; // e.g., [] (no deps) or ['users', 'departments']
  priority: number; // 1 = highest (import first)
  tags: string[]; // e.g., ['master-data', 'required']
  supportsRollback: boolean;
  version: string; // e.g., '1.0.0'
}

export interface TemplateColumn {
  name: string;
  displayName?: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string; // regex
  enumValues?: string[];
  description?: string;
  example?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  code: string; // e.g., 'DUPLICATE_CODE', 'INVALID_FORMAT'
}
```

#### 3. Discovery Service

```typescript
export class ImportDiscoveryService {
  private registry: Map<string, RegisteredImportService>;
  private dependencyGraph: Map<string, Set<string>>;

  constructor(
    private fastify: FastifyInstance,
    private db: Knex,
  ) {
    this.registry = new Map();
    this.dependencyGraph = new Map();
  }

  async discoverServices(): Promise<void> {
    // 1. Scan for **/*-import.service.ts files
    const files = await glob('apps/api/src/modules/**/*-import.service.ts');

    // 2. Dynamic import (triggers decorator registration)
    await Promise.all(files.map((f) => import(f)));

    // 3. Get metadata from decorator registry
    const metadata = getRegisteredImportServices();

    // 4. Instantiate services with DI
    for (const meta of metadata) {
      const ServiceClass = meta.target;
      const instance = new ServiceClass(this.db, this.fastify);

      this.registry.set(meta.module, {
        metadata: meta,
        instance: instance,
        filePath: meta.filePath,
      });
    }

    // 5. Build dependency graph
    this.buildDependencyGraph();

    // 6. Validate (check circular deps, missing deps)
    this.validateDependencies();

    // 7. Persist to database
    await this.persistRegistry();

    console.log(`✅ Discovered ${this.registry.size} import services`);
  }

  getImportOrder(): string[] {
    // Topological sort based on dependencies
    return topologicalSort(this.dependencyGraph);
  }

  getService(moduleName: string): IImportService | null {
    return this.registry.get(moduleName)?.instance || null;
  }

  getAllServices(): RegisteredImportService[] {
    return Array.from(this.registry.values());
  }
}
```

## Database Schema

### Table 1: import_service_registry

```sql
CREATE TABLE public.import_service_registry (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(50) NOT NULL,
  subdomain VARCHAR(50),
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  dependencies JSONB DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 100,
  tags JSONB DEFAULT '[]',
  supports_rollback BOOLEAN DEFAULT false,
  version VARCHAR(20),

  -- Import status
  import_status VARCHAR(20) DEFAULT 'not_started',
    -- Values: 'not_started', 'in_progress', 'completed', 'error'
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

### Table 2: import_history

```sql
CREATE TABLE public.import_history (
  id SERIAL PRIMARY KEY,
  job_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES import_sessions(session_id) ON DELETE SET NULL,
  module_name VARCHAR(100) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Values: 'pending', 'running', 'completed', 'failed', 'rolled_back'

  -- Metrics
  total_rows INTEGER,
  imported_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,

  -- Error tracking
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
```

### Table 3: import_sessions

```sql
CREATE TABLE public.import_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(100) NOT NULL,

  -- Uploaded file data
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER,
  file_type VARCHAR(10), -- 'csv' or 'excel'

  -- Validation results
  validated_data JSONB NOT NULL, -- Parsed rows
  validation_result JSONB NOT NULL, -- Errors, warnings, stats
  can_proceed BOOLEAN NOT NULL DEFAULT false,

  -- Session lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_by UUID REFERENCES users(id) NOT NULL
);

CREATE INDEX idx_is_module ON import_sessions(module_name);
CREATE INDEX idx_is_expires ON import_sessions(expires_at);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_import_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM import_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

## API Specification

### Base Path: `/api/admin/system-init`

#### 1. GET `/available-modules`

**Purpose**: List all discovered import services

**Response**:

```typescript
{
  modules: [
    {
      module: 'drug_generics',
      domain: 'inventory',
      subdomain: 'master-data',
      displayName: 'Drug Generics (ยาหลัก)',
      dependencies: [],
      priority: 1,
      tags: ['master-data', 'required'],
      importStatus: 'not_started',
      recordCount: 0,
      lastImportDate: null
    },
    // ... 29 more modules
  ],
  totalModules: 30,
  completedModules: 0,
  pendingModules: 30
}
```

#### 2. GET `/import-order`

**Purpose**: Get recommended import order (dependency-aware)

**Response**:

```typescript
{
  order: [
    { module: 'drug_generics', reason: 'No dependencies' },
    { module: 'users', reason: 'No dependencies' },
    { module: 'departments', reason: 'Requires: users' },
    { module: 'budget_plans', reason: 'Requires: departments, drug_generics' },
    // ... rest in dependency order
  ];
}
```

#### 3. GET `/module/:moduleName/template`

**Purpose**: Download CSV/Excel template

**Query Params**: `?format=csv|excel`

**Response**: File download (Content-Type: application/octet-stream)

#### 4. POST `/module/:moduleName/validate`

**Purpose**: Validate uploaded file (creates session)

**Request**:

```typescript
// Content-Type: multipart/form-data
{
  file: <Buffer>, // CSV or Excel file
}
```

**Response**:

```typescript
{
  sessionId: 'uuid',
  isValid: true,
  errors: [],
  warnings: [
    {
      row: 15,
      field: 'ven_classification',
      message: 'Value is empty but recommended',
      severity: 'WARNING',
      code: 'MISSING_RECOMMENDED'
    }
  ],
  stats: {
    totalRows: 150,
    validRows: 150,
    errorRows: 0
  },
  expiresAt: '2024-12-13T15:30:00Z',
  canProceed: true
}
```

#### 5. POST `/module/:moduleName/import`

**Purpose**: Execute import (requires valid session)

**Request**:

```typescript
{
  sessionId: 'uuid',
  options: {
    skipWarnings: false,
    batchSize: 100,
    onConflict: 'skip' | 'update' | 'error'
  }
}
```

**Response**:

```typescript
{
  jobId: 'uuid',
  status: 'queued',
  message: 'Import job queued successfully'
}
```

#### 6. GET `/module/:moduleName/status/:jobId`

**Purpose**: Check import progress

**Response**:

```typescript
{
  jobId: 'uuid',
  status: 'running',
  progress: {
    totalRows: 150,
    importedRows: 75,
    errorRows: 0,
    currentRow: 75,
    percentComplete: 50
  },
  startedAt: '2024-12-13T15:00:00Z',
  estimatedCompletion: '2024-12-13T15:01:30Z'
}
```

#### 7. DELETE `/module/:moduleName/rollback/:jobId`

**Purpose**: Rollback completed import

**Response**:

```typescript
{
  success: true,
  message: 'Import rolled back successfully',
  deletedRecords: 150
}
```

#### 8. GET `/dashboard`

**Purpose**: Centralized system init dashboard data

**Response**:

```typescript
{
  overview: {
    totalModules: 30,
    completedModules: 5,
    inProgressModules: 1,
    pendingModules: 24,
    totalRecordsImported: 5432
  },
  modulesByDomain: {
    'inventory': { total: 15, completed: 3 },
    'core': { total: 5, completed: 2 },
    'hr': { total: 10, completed: 0 }
  },
  recentImports: [
    {
      jobId: 'uuid',
      module: 'drug_generics',
      status: 'completed',
      recordsImported: 1500,
      completedAt: '2024-12-13T14:30:00Z',
      importedBy: { id: 'uuid', name: 'Admin User' }
    }
  ],
  nextRecommended: [
    { module: 'users', reason: 'No dependencies, required for setup' },
    { module: 'departments', reason: 'Depends on users (completed)' }
  ]
}
```

## Example Implementation

### Drug Generics Import Service

```typescript
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { ImportService, BaseImportService, TemplateColumn, ValidationError } from '@/core/import';
import { DrugGenericsRepository } from '../repositories/drug-generics.repository';
import { DrugGeneric } from '../types/drug-generic.types';

@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics (ยาหลัก)',
  description: 'Master list of generic drug names and classifications',
  dependencies: [], // No dependencies - can import first
  priority: 1, // Highest priority
  tags: ['master-data', 'required', 'inventory'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  constructor(
    private db: Knex,
    private fastify: FastifyInstance,
  ) {
    super();
    this.repository = new DrugGenericsRepository(db);
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'generic_code',
        displayName: 'Generic Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code for the generic drug',
        example: 'PARA500',
      },
      {
        name: 'generic_name_th',
        displayName: 'Generic Name (Thai)',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'Thai name of the generic drug',
        example: 'พาราเซตามอล',
      },
      {
        name: 'generic_name_en',
        displayName: 'Generic Name (English)',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'English name of the generic drug',
        example: 'Paracetamol',
      },
      {
        name: 'ven_classification',
        displayName: 'VEN Classification',
        required: false,
        type: 'string',
        enumValues: ['V', 'E', 'N'],
        description: 'Vital/Essential/Non-essential classification',
        example: 'E',
      },
      {
        name: 'procurement_method',
        displayName: 'Procurement Method',
        required: false,
        type: 'string',
        enumValues: ['central', 'local', 'both'],
        description: 'How this drug is procured',
        example: 'central',
      },
      {
        name: 'is_active',
        displayName: 'Active',
        required: false,
        type: 'boolean',
        description: 'Whether this generic is currently active',
        example: 'true',
      },
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // 1. Check for duplicate generic_code
    const existing = await this.repository.findByCode(row.generic_code);
    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'generic_code',
        message: `Generic code '${row.generic_code}' already exists in database`,
        severity: 'ERROR',
        code: 'DUPLICATE_CODE',
      });
    }

    // 2. Validate VEN classification (if provided)
    if (row.ven_classification && !['V', 'E', 'N'].includes(row.ven_classification)) {
      errors.push({
        row: rowNumber,
        field: 'ven_classification',
        message: `Invalid VEN classification. Must be V, E, or N`,
        severity: 'ERROR',
        code: 'INVALID_ENUM',
      });
    }

    // 3. Warn if VEN classification is missing
    if (!row.ven_classification) {
      errors.push({
        row: rowNumber,
        field: 'ven_classification',
        message: 'VEN classification is recommended for proper budget planning',
        severity: 'WARNING',
        code: 'MISSING_RECOMMENDED',
      });
    }

    // 4. Validate procurement_method
    if (row.procurement_method && !['central', 'local', 'both'].includes(row.procurement_method)) {
      errors.push({
        row: rowNumber,
        field: 'procurement_method',
        message: `Invalid procurement method. Must be: central, local, or both`,
        severity: 'ERROR',
        code: 'INVALID_ENUM',
      });
    }

    return errors;
  }

  // BaseImportService provides:
  // - generateTemplate()
  // - validateFile()
  // - importData()
  // - getImportStatus()
  // - rollback()
  // - getImportHistory()
}
```

## Developer Workflow

### Adding New Import Service

```bash
# Step 1: Generate scaffolding
pnpm run generate:import -- \
  --module=locations \
  --domain=inventory/master-data \
  --dependencies=users

# Generated file: apps/api/src/modules/inventory/master-data/locations/locations-import.service.ts

# Step 2: Implement required methods
# - getTemplateColumns()
# - validateRow()

# Step 3: Restart API server
pnpm run dev:api

# Console output:
# ✅ Discovered 31 import services
# 📦 New service detected: locations
# 🔗 Dependencies resolved: locations -> users (OK)
# 🎯 Import order updated

# Step 4: Service automatically appears in dashboard
# Visit: http://localhost:4249/admin/system-init
# See: "Locations (สถานที่จัดเก็บ)" card with "Import" button
```

### Import Workflow (User Perspective)

```bash
# 1. Admin visits system initialization dashboard
GET /admin/system-init

# 2. Downloads CSV template for drug_generics
GET /api/admin/system-init/module/drug_generics/template?format=csv

# 3. Fills in CSV with 150 drug generics

# 4. Uploads CSV for validation
POST /api/admin/system-init/module/drug_generics/validate
# Response: sessionId='abc-123', isValid=true, warnings=[...]

# 5. Reviews warnings (10 missing VEN classifications)

# 6. Confirms and starts import
POST /api/admin/system-init/module/drug_generics/import
# Body: { sessionId: 'abc-123', options: { skipWarnings: true } }
# Response: jobId='xyz-789', status='queued'

# 7. Polls for progress
GET /api/admin/system-init/module/drug_generics/status/xyz-789
# Response: status='running', percentComplete=50

# 8. Import completes
# Response: status='completed', importedRows=150

# 9. Realizes mistake, rolls back
DELETE /api/admin/system-init/module/drug_generics/rollback/xyz-789
# Response: success=true, deletedRecords=150

# 10. Fixes CSV, re-imports
```

## Dependency Management

### Example Dependency Graph

```
drug_generics (priority 1)
  └─> (no dependencies)

users (priority 1)
  └─> (no dependencies)

departments (priority 2)
  └─> users

dosage_forms (priority 1)
  └─> (no dependencies)

drugs (priority 3)
  ├─> drug_generics
  └─> dosage_forms

budget_plans (priority 4)
  ├─> departments
  └─> drug_generics

budget_allocations (priority 5)
  ├─> budget_plans
  └─> drugs
```

### Topological Sort Result

```typescript
[
  'drug_generics', // Priority 1, no deps
  'users', // Priority 1, no deps
  'dosage_forms', // Priority 1, no deps
  'departments', // Priority 2, deps: [users]
  'drugs', // Priority 3, deps: [drug_generics, dosage_forms]
  'budget_plans', // Priority 4, deps: [departments, drug_generics]
  'budget_allocations', // Priority 5, deps: [budget_plans, drugs]
];
```

### Circular Dependency Detection

```typescript
// This would be caught during discovery:

@ImportService({
  module: 'A',
  dependencies: ['B'],
})
class AImportService {}

@ImportService({
  module: 'B',
  dependencies: ['C'],
})
class BImportService {}

@ImportService({
  module: 'C',
  dependencies: ['A'], // ❌ CIRCULAR!
})
class CImportService {}

// Console output:
// ❌ ERROR: Circular dependency detected: A -> B -> C -> A
// 🛑 Server startup aborted
```

## Module Coverage

### Core Domain (5 modules)

1. **users** - System users (Priority 1)
2. **roles** - User roles (Priority 1)
3. **permissions** - Role permissions (Priority 1)
4. **departments** - Hospital departments (Priority 2, deps: users)
5. **hospitals** - Hospital information (Priority 1)

### Inventory - Master Data (15 modules)

1. **drug_generics** - Generic drugs (Priority 1)
2. **dosage_forms** - Tablet, capsule, etc. (Priority 1)
3. **drugs** - Actual drug products (Priority 3, deps: drug_generics, dosage_forms)
4. **drug_categories** - Drug categorization (Priority 1)
5. **locations** - Storage locations (Priority 2, deps: departments)
6. **units** - Units of measure (Priority 1)
7. **manufacturers** - Drug manufacturers (Priority 1)
8. **suppliers** - Drug suppliers (Priority 1)
9. **budget_types** - Budget type categories (Priority 1)
10. **fiscal_years** - Fiscal year definitions (Priority 1)
11. **procurement_methods** - Procurement method types (Priority 1)
12. **ven_classifications** - VEN classification reference (Priority 1)
13. **therapeutic_categories** - Drug therapeutic categories (Priority 1)
14. **storage_conditions** - Storage condition types (Priority 1)
15. **administration_routes** - Route of administration (Priority 1)

### Inventory - Operations (10 modules)

1. **budget_plans** - Annual budget plans (Priority 4, deps: departments, drug_generics)
2. **budget_allocations** - Quarterly allocations (Priority 5, deps: budget_plans, drugs)
3. **budget_requests** - Budget requests (Priority 6, deps: budget_allocations)
4. **inventory_transactions** - Stock movements (Priority 7, deps: drugs, locations)
5. **purchase_orders** - Purchase orders (Priority 7, deps: budget_requests, suppliers)
6. **goods_receipts** - Goods receipt notes (Priority 8, deps: purchase_orders)
7. **stock_adjustments** - Stock adjustments (Priority 7, deps: drugs, locations)
8. **stock_transfers** - Inter-location transfers (Priority 7, deps: locations, drugs)
9. **stock_takes** - Physical inventory counts (Priority 7, deps: locations)
10. **dispensing_records** - Drug dispensing records (Priority 9, deps: drugs, users)

**Total: 30 modules**

## Frontend Implementation

### System Initialization Dashboard

**Location**: `apps/web/src/app/features/admin/pages/system-init-dashboard/`

**Key Features**:

- Module cards grouped by domain
- Dependency visualization (graph view)
- Import wizard (4-step process)
- Real-time progress tracking (WebSocket)
- Rollback capability
- Import history timeline

**Component Structure**:

```typescript
@Component({
  selector: 'app-system-init-dashboard',
  template: `
    <div class="system-init-container">
      <!-- Overview Stats -->
      <div class="stats-cards">
        <ax-card>
          <h3>Total Modules</h3>
          <div class="stat-value">{{ stats().totalModules }}</div>
        </ax-card>
        <ax-card>
          <h3>Completed</h3>
          <div class="stat-value success">{{ stats().completedModules }}</div>
        </ax-card>
        <ax-card>
          <h3>Pending</h3>
          <div class="stat-value warning">{{ stats().pendingModules }}</div>
        </ax-card>
        <ax-card>
          <h3>Records Imported</h3>
          <div class="stat-value">{{ stats().totalRecordsImported | number }}</div>
        </ax-card>
      </div>

      <!-- Domain Tabs -->
      <mat-tab-group>
        <mat-tab label="Inventory ({{ inventoryModules().length }})">
          <div class="module-grid">
            <app-import-module-card *ngFor="let module of inventoryModules()" [module]="module" (import)="openImportWizard($event)" (rollback)="confirmRollback($event)" />
          </div>
        </mat-tab>

        <mat-tab label="Core ({{ coreModules().length }})">
          <!-- Similar grid -->
        </mat-tab>

        <mat-tab label="Dependency Graph">
          <app-dependency-graph [modules]="allModules()" />
        </mat-tab>

        <mat-tab label="Import History">
          <app-import-history-timeline [history]="importHistory()" />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class SystemInitDashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  modules = signal<ImportModule[]>([]);
  importHistory = signal<ImportHistoryRecord[]>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  async loadDashboard() {
    const data = await this.http.get('/api/admin/system-init/dashboard').toPromise();
    this.stats.set(data.overview);
    this.modules.set(data.modules);
    this.importHistory.set(data.recentImports);
  }

  inventoryModules = computed(() => this.modules().filter((m) => m.domain === 'inventory'));

  coreModules = computed(() => this.modules().filter((m) => m.domain === 'core'));

  openImportWizard(module: ImportModule) {
    this.dialog.open(ImportWizardDialog, {
      data: { module },
      width: '800px',
    });
  }
}
```

### Import Wizard (4 Steps)

```typescript
@Component({
  selector: 'app-import-wizard-dialog',
  template: `
    <h1 mat-dialog-title>Import {{ data.module.displayName }}</h1>

    <mat-dialog-content>
      <mat-stepper [linear]="true" #stepper>
        <!-- Step 1: Download Template -->
        <mat-step [completed]="templateDownloaded()">
          <ng-template matStepLabel>Download Template</ng-template>
          <div class="step-content">
            <p>Download the CSV template to fill in your data:</p>
            <button mat-raised-button color="primary" (click)="downloadTemplate()">
              <mat-icon>download</mat-icon>
              Download Template
            </button>
            <div *ngIf="templateDownloaded()" class="success-message">✓ Template downloaded</div>
          </div>
        </mat-step>

        <!-- Step 2: Upload & Validate -->
        <mat-step [completed]="validationPassed()">
          <ng-template matStepLabel>Upload & Validate</ng-template>
          <div class="step-content">
            <input type="file" #fileInput (change)="onFileSelect($event)" accept=".csv,.xlsx" />

            <div *ngIf="validating()" class="loading">Validating file...</div>

            <div *ngIf="validationResult()">
              <ax-alert [status]="validationResult().isValid ? 'success' : 'danger'">
                <p>{{ validationResult().isValid ? 'Validation passed!' : 'Validation failed' }}</p>
                <p>Total rows: {{ validationResult().stats.totalRows }}</p>
                <p>Valid rows: {{ validationResult().stats.validRows }}</p>
                <p>Error rows: {{ validationResult().stats.errorRows }}</p>
              </ax-alert>

              <!-- Error List -->
              <div *ngIf="validationResult().errors.length > 0" class="error-list">
                <h4>Errors ({{ validationResult().errors.length }})</h4>
                <mat-list>
                  <mat-list-item *ngFor="let error of validationResult().errors">
                    <mat-icon matListItemIcon color="warn">error</mat-icon>
                    <div matListItemTitle>Row {{ error.row }}: {{ error.message }}</div>
                    <div matListItemLine>Field: {{ error.field }}</div>
                  </mat-list-item>
                </mat-list>
              </div>

              <!-- Warning List -->
              <div *ngIf="validationResult().warnings.length > 0" class="warning-list">
                <h4>Warnings ({{ validationResult().warnings.length }})</h4>
                <mat-list>
                  <mat-list-item *ngFor="let warning of validationResult().warnings">
                    <mat-icon matListItemIcon color="accent">warning</mat-icon>
                    <div matListItemTitle>Row {{ warning.row }}: {{ warning.message }}</div>
                  </mat-list-item>
                </mat-list>
              </div>
            </div>
          </div>
        </mat-step>

        <!-- Step 3: Confirm -->
        <mat-step [completed]="confirmed()">
          <ng-template matStepLabel>Confirm Import</ng-template>
          <div class="step-content">
            <p>Ready to import {{ validationResult().stats.validRows }} records?</p>

            <mat-checkbox [(ngModel)]="skipWarnings"> Skip warnings and proceed with import </mat-checkbox>

            <button mat-raised-button color="primary" (click)="startImport()">
              <mat-icon>upload</mat-icon>
              Start Import
            </button>
          </div>
        </mat-step>

        <!-- Step 4: Progress -->
        <mat-step>
          <ng-template matStepLabel>Import Progress</ng-template>
          <div class="step-content">
            <div *ngIf="importStatus()">
              <mat-progress-bar mode="determinate" [value]="importStatus().progress.percentComplete"></mat-progress-bar>

              <p>{{ importStatus().progress.importedRows }} / {{ importStatus().progress.totalRows }} rows imported</p>

              <div *ngIf="importStatus().status === 'completed'" class="success-message">✅ Import completed successfully!</div>

              <div *ngIf="importStatus().status === 'failed'" class="error-message">❌ Import failed: {{ importStatus().error }}</div>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>
  `,
})
export class ImportWizardDialog {
  templateDownloaded = signal(false);
  validating = signal(false);
  validationResult = signal<ValidationResult | null>(null);
  confirmed = signal(false);
  importStatus = signal<ImportStatus | null>(null);

  async downloadTemplate() {
    const blob = await this.http.get(`/api/admin/system-init/module/${this.data.module.module}/template?format=csv`, { responseType: 'blob' }).toPromise();

    saveAs(blob, `${this.data.module.module}_template.csv`);
    this.templateDownloaded.set(true);
  }

  async onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.validating.set(true);

    const formData = new FormData();
    formData.append('file', file);

    const result = await this.http.post(`/api/admin/system-init/module/${this.data.module.module}/validate`, formData).toPromise();

    this.validationResult.set(result);
    this.validating.set(false);
  }

  async startImport() {
    const result = await this.http
      .post(`/api/admin/system-init/module/${this.data.module.module}/import`, {
        sessionId: this.validationResult().sessionId,
        options: { skipWarnings: this.skipWarnings },
      })
      .toPromise();

    this.confirmed.set(true);

    // Poll for progress
    this.pollImportStatus(result.jobId);
  }

  private pollImportStatus(jobId: string) {
    interval(1000)
      .pipe(
        switchMap(() => this.http.get(`/api/admin/system-init/module/${this.data.module.module}/status/${jobId}`)),
        takeWhile((status) => status.status === 'running' || status.status === 'queued', true),
      )
      .subscribe((status) => {
        this.importStatus.set(status);
      });
  }
}
```

## Implementation Timeline

### Week 1: Backend Infrastructure

- Database migrations (3 tables)
- `@ImportService` decorator implementation
- `ImportDiscoveryService` with file scanning
- Registry pattern implementation
- Fastify plugin integration
- Testing: Discovery performance (<100ms requirement)

### Week 2: Core Import Services

- Enhance `BaseImportService` with template generation
- Implement `UsersImportService` (with role/department assignment)
- Implement `DepartmentsImportService`
- Implement `DrugGenericsImportService`
- Testing: Validation logic, rollback capability

### Week 3: API Layer

- `SystemInitController` (12 endpoints)
- `SystemInitService` business logic
- Route definitions with TypeBox schemas
- Error handling, logging
- Testing: API contracts, session management

### Week 4: Additional Import Services

- 10 master-data services (dosage_forms, drugs, locations, etc.)
- 5 operations services (budget_plans, budget_allocations, etc.)
- Dependency graph validation
- Testing: Import order, circular dependency detection

### Week 5: Frontend Dashboard

- System initialization dashboard component
- Import wizard dialog (4 steps)
- Module cards with status
- Dependency graph visualization
- Import history timeline
- Testing: User flows, error scenarios

### Week 6: Developer Tools & Polish

- Code generator: `pnpm run generate:import`
- Import service linter (checks metadata, dependencies)
- Dependency checker CLI
- Documentation: Developer guide, examples
- Performance optimization
- End-to-end testing

**Total: 6 weeks**

## Success Metrics

### Technical Metrics

- ✅ Discovery time: <100ms (for 30 modules)
- ✅ Type safety: 100% (zero `any` types)
- ✅ Test coverage: >90%
- ✅ API response time: <500ms (p95)

### Business Metrics

- ✅ Time to add new import service: <30 minutes
- ✅ Time to import 1000 records: <2 minutes
- ✅ Zero manual registration required
- ✅ 100% rollback success rate

### Developer Experience

- ✅ One command to generate service: `pnpm run generate:import`
- ✅ Auto-discovery on server restart
- ✅ Clear validation error messages
- ✅ Comprehensive developer docs

## References

### Related Documents

- [Department Management Design](./DEPARTMENT_MANAGEMENT_DESIGN.md)
- [Budget Request Submission Spec](../budget-request-submission-v2/IMPLEMENTATION-PLAN.md)
- [Universal Full-Stack Standard](../../../development/universal-fullstack-standard.md)

### Code Locations

- BaseImportService: `apps/api/src/core/import/base-import.service.ts`
- Discovery Service: `apps/api/src/core/import/import-discovery.service.ts`
- Example Services: `apps/api/src/modules/inventory/master-data/*/&ast;-import.service.ts`
- Frontend Dashboard: `apps/web/src/app/features/admin/pages/system-init-dashboard/`

---

**Status**: ✅ Design Complete - Ready for Implementation
**Next Step**: User to decide implementation priority (Department Management vs Auto-Discovery vs Quick Fix)
