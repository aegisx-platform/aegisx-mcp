# Bulk Import Guide

**Complete guide to bulk Excel/CSV import in CRUD Generator v2.0+**

## Table of Contents

- [Overview](#overview)
- [Import Architecture Comparison](#import-architecture-comparison)
- [What is `--with-import`?](#what-is---with-import)
- [Import Workflow](#import-workflow)
- [Backend Implementation](#backend-implementation)
  - [Generic Import (Module-Specific)](#generic-import-module-specific)
  - [System Init Import (Auto-Discovery)](#system-init-import-auto-discovery)
- [Frontend Implementation](#frontend-implementation)
- [Excel/CSV Format](#excelcsv-format)
- [Validation & Error Handling](#validation--error-handling)
- [Session Management](#session-management)
- [Progress Tracking](#progress-tracking)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The `--with-import` flag enables **bulk data import from Excel/CSV files** with a complete 5-step workflow: Upload → Review → Configure → Process → Complete.

**Two Architecture Variants:**

1. **Generic Import (Module-Specific)** - Traditional import implementation for individual CRUD modules
2. **System Init Import (Auto-Discovery)** - Advanced auto-discovery system with centralized dashboard

---

## Import Architecture Comparison

### Quick Decision Guide

**Use Generic Import when:**

- ✅ You need a simple import feature for a single module
- ✅ You don't need a centralized import dashboard
- ✅ Import is an occasional feature (not core workflow)
- ✅ You prefer self-contained module code

**Use System Init Import when:**

- ✅ You have multiple modules with import needs
- ✅ You want a centralized import dashboard
- ✅ You need dependency management (import order)
- ✅ You want auto-discovery of import services
- ✅ You need batch tracking and rollback support
- ✅ You want import history and audit trail

### Feature Comparison

| Feature                   | Generic Import           | System Init Import                 |
| ------------------------- | ------------------------ | ---------------------------------- |
| **Setup**                 | Per-module configuration | `@ImportService` decorator         |
| **Discovery**             | Manual registration      | Auto-discovery on server start     |
| **Dashboard**             | Module-specific UI       | Centralized dashboard              |
| **Dependency Management** | None                     | Automatic (topological sort)       |
| **Import History**        | Not included             | Complete audit trail               |
| **Batch Rollback**        | Not included             | Precise rollback with `batch_id`   |
| **Session Storage**       | In-memory Map            | Database (`import_sessions` table) |
| **Progress Tracking**     | Polling/WebSocket        | Polling/WebSocket + Database       |
| **Best For**              | Simple modules           | Master data, System initialization |

### Architecture Differences

#### Generic Import

```typescript
// Manual configuration
export class ProductsImportService extends BaseImportService<Product> {
  constructor(knex, repository, eventService?) {
    super(knex, ProductsImportService.createConfig(repository), 'products', eventService);
  }

  private static createConfig(repository): ImportModuleConfig<Product> {
    return {
      moduleName: 'products',
      fields: [...],
      maxRows: 10000,
      // ... configuration
    };
  }
}
```

#### System Init Import

```typescript
// Decorator-based auto-discovery
@ImportService({
  module: 'products',
  domain: 'inventory',
  displayName: 'Products (สินค้า)',
  dependencies: ['categories', 'suppliers'],
  priority: 3,
  tags: ['master-data'],
  supportsRollback: true,
})
export class ProductsImportService extends BaseImportService<Product> {
  getTemplateColumns(): TemplateColumn[] {
    /* ... */
  }
  async validateRow(row, rowNumber): Promise<ValidationError[]> {
    /* ... */
  }
  protected async insertBatch(batch, trx, options): Promise<Product[]> {
    /* ... */
  }
  protected async performRollback(batchId, knex): Promise<number> {
    /* ... */
  }
}
```

**Key Differences:**

- **Generic**: Module-specific config, manual setup, isolated import UI
- **System Init**: Decorator-based metadata, auto-discovery, centralized dashboard with dependency graph

**Key Features**:

- ✅ Excel (.xlsx) and CSV (.csv) support
- ✅ Data preview before import
- ✅ Validation with detailed error reporting
- ✅ Session-based review system
- ✅ Progress tracking during processing
- ✅ Configurable import options (skip duplicates, update existing)
- ✅ BaseImportService integration for consistent behavior

**Version 2.0.1 Highlights**:

- ✅ Fixed ImportJob type alignment with BaseImportService
- ✅ Simplified flat property structure (no nested objects)
- ✅ Corrected progress tracking (direct number 0-100)
- ✅ Streamlined error handling (single error string)
- ✅ Removed unsupported 'partial' status

---

## What is `--with-import`?

### Enabling Import Feature

```bash
# Generate CRUD module with import capability
pnpm run crud-gen products \
  --entity Product \
  --with-import

# Or use interactive mode and select "Enterprise" or "Full" package
pnpm run crud-gen products
```

### What Gets Generated

**Backend Files**:

- `{{domain}}.controller.ts` - Import endpoints added
- `{{domain}}.service.ts` - Import logic using BaseImportService
- `{{domain}}.schemas.ts` - Import-related schemas

**Frontend Files**:

- `import-dialog.component.ts` - Complete import UI (v2.0.1 fixed)
- `import-dialog.component.html` - 5-step wizard interface
- `{{domain}}.types.ts` - ImportJob interface aligned with backend

**Import Endpoints**:

- `POST /api/{{domain}}/import/preview` - Upload and preview data
- `POST /api/{{domain}}/import/execute` - Execute import with options
- `GET /api/{{domain}}/import/status/:sessionId` - Check import progress

---

## Import Workflow

### 5-Step User Journey

```
┌─────────────────┐
│ 1. Upload File  │ → User selects Excel/CSV file
└────────┬────────┘
         ↓
┌─────────────────┐
│ 2. Review Data  │ → Preview first 10 rows, see validation results
└────────┬────────┘
         ↓
┌─────────────────┐
│ 3. Set Options  │ → Choose: Skip duplicates? Update existing?
└────────┬────────┘
         ↓
┌─────────────────┐
│ 4. Processing   │ → Progress bar, real-time row count
└────────┬────────┘
         ↓
┌─────────────────┐
│ 5. Complete     │ → Success/failure summary, download error report
└─────────────────┘
```

### Step-by-Step Details

#### Step 1: Upload File

User actions:

- Click "Import" button in list header
- Select Excel (.xlsx) or CSV (.csv) file
- File automatically uploads to backend

Backend process:

- Parse file using `xlsx` library
- Convert to JSON array
- Validate format (columns match schema)
- Store in session for review
- Return session ID + preview data

#### Step 2: Review Data

User sees:

- First 10 rows of data in table
- Total rows count
- Validation warnings (if any)
- Column mapping preview

User actions:

- Review data accuracy
- Check for validation errors
- Decide to proceed or cancel

#### Step 3: Configure Options

User choices:

- **Skip duplicates**: Ignore rows that already exist (based on unique fields)
- **Update existing**: Overwrite existing records with imported data

Default behavior:

- Skip duplicates: `true`
- Update existing: `false`

#### Step 4: Processing

User sees:

- Progress bar (0-100%)
- Rows processed count
- Estimated time remaining (future feature)

Backend process:

- Process rows in batches (configurable size)
- Validate each row against schema
- Insert/update database records
- Track success/failure counts
- Update progress in session

#### Step 5: Complete

User sees:

- Total rows processed
- Success count (green)
- Failure count (red)
- Error details (if any)
- Option to download error report

User actions:

- Review results
- Download error report if failures exist
- Close dialog (auto-refreshes list)

---

## Backend Implementation

### Generic Import (Module-Specific)

**Use Case:** Individual CRUD modules with standalone import functionality

**Generated Files:**

- `{{module}}-import.service.ts` - Import service with module configuration
- `{{module}}-import.routes.ts` - Import endpoints
- Controller methods added to existing controller

#### Generated Import Service

```typescript
// Generated: apps/api/src/modules/products/products-import.service.ts

import { Knex } from 'knex';
import { BaseImportService } from '../../../shared/services/base-import.service';
import { ImportModuleConfig, ImportFieldConfig } from '../../../shared/services/import-config.interface';
import { Product, CreateProduct } from '../types/products.types';
import { ProductsRepository } from '../repositories/products.repository';

export class ProductsImportService extends BaseImportService<Product> {
  constructor(
    knex: Knex,
    private productsRepository: ProductsRepository,
    eventService?: any,
  ) {
    super(knex, ProductsImportService.createConfig(productsRepository), 'products', eventService);
  }

  private static createConfig(repository: ProductsRepository): ImportModuleConfig<Product> {
    const fields: ImportFieldConfig[] = [
      {
        name: 'code',
        label: 'Product Code',
        required: true,
        type: 'string',
        maxLength: 20,
        description: 'Unique product code',
        defaultExample: 'PRD-001',
        validators: [ProductsImportService.validateCodeUniqueness(repository)],
      },
      {
        name: 'name',
        label: 'Product Name',
        required: true,
        type: 'string',
        maxLength: 100,
        description: 'Product name',
        defaultExample: 'Sample Product',
      },
      // ... more fields
    ];

    return {
      moduleName: 'products',
      displayName: 'Products',
      fields,
      maxRows: 10000,
      allowWarnings: true,
      sessionExpirationMinutes: 30,
      batchSize: 100,
      rowTransformer: ProductsImportService.transformRow,
    };
  }

  // Custom validators
  private static validateCodeUniqueness(repository: ProductsRepository) {
    return async (value: any, _row: any, _index: number) => {
      if (!value) return null;
      const existing = await repository.findByCode(value);
      if (existing) {
        return {
          field: 'code',
          message: `Product code '${value}' already exists`,
          severity: 'ERROR' as const,
          code: 'DUPLICATE_CODE',
        };
      }
      return null;
    };
  }

  // Row transformer
  private static transformRow(row: any): CreateProduct {
    return {
      code: row.code?.trim(),
      name: row.name?.trim(),
      price: parseFloat(row.price) || 0,
      // ... transform other fields
    };
  }
}
```

---

### System Init Import (Auto-Discovery)

**Use Case:** Master data modules that need centralized import management

**Generated Files:**

- `{{module}}-import.service.ts` - Decorated import service
- Auto-discovered and registered in System Init dashboard
- No separate routes needed (uses centralized System Init API)

#### Generated Import Service

```typescript
// Generated: apps/api/src/layers/platform/products/products-import.service.ts

import { Knex } from 'knex';
import { ImportService, BaseImportService, TemplateColumn, ValidationError, ImportOptions } from '../import';
import { Product, CreateProduct } from './products.schemas';
import { ProductsRepository } from './products.repository';

/**
 * Products Import Service (Auto-Discovery)
 * Automatically discovered by System Init on server startup
 */
@ImportService({
  module: 'products',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Products (สินค้า)',
  description: 'Product master data',
  dependencies: ['categories', 'suppliers'], // Import after these modules
  priority: 3, // Import order (1 = first)
  tags: ['master-data', 'inventory'],
  supportsRollback: true,
  version: '1.0.0',
})
export class ProductsImportService extends BaseImportService<Product> {
  private repository: ProductsRepository;

  constructor(knex: Knex) {
    super(knex);
    this.repository = new ProductsRepository(knex);
    this.moduleName = 'products';
  }

  /**
   * Get service metadata (required by BaseImportService)
   */
  getMetadata() {
    return {
      module: 'products',
      domain: 'inventory',
      subdomain: 'master-data',
      displayName: 'Products (สินค้า)',
      description: 'Product master data',
      dependencies: ['categories', 'suppliers'],
      priority: 3,
      tags: ['master-data', 'inventory'],
      supportsRollback: true,
      version: '1.0.0',
    };
  }

  /**
   * Define import template structure
   * Controls CSV/Excel template generation
   */
  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'code',
        displayName: 'Product Code',
        required: true,
        type: 'string',
        maxLength: 20,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique product code (uppercase letters, numbers, hyphens, underscores)',
        example: 'PRD-001',
      },
      {
        name: 'name',
        displayName: 'Product Name',
        required: true,
        type: 'string',
        maxLength: 100,
        description: 'Product name in Thai or English',
        example: 'Sample Product Name',
      },
      {
        name: 'price',
        displayName: 'Price',
        required: true,
        type: 'number',
        minValue: 0,
        description: 'Product price in THB',
        example: '1500.00',
      },
      {
        name: 'category_code',
        displayName: 'Category Code',
        required: true,
        type: 'string',
        description: 'Category code (must exist in categories table)',
        example: 'CAT-001',
      },
      // ... more columns
    ];
  }

  /**
   * Validate single row during batch validation
   * Called for each row in uploaded file
   */
  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Required field validation
    if (!row.code || !row.code.trim()) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'Product code is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    // Format validation
    if (row.code && !/^[A-Z0-9_-]+$/.test(row.code)) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores',
        severity: 'ERROR',
        code: 'INVALID_FORMAT',
      });
    }

    // Duplicate check
    if (row.code) {
      const existing = await this.knex('products').where('product_code', row.code.trim()).first();

      if (existing) {
        errors.push({
          row: rowNumber,
          field: 'code',
          message: `Product code '${row.code}' already exists`,
          severity: 'ERROR',
          code: 'DUPLICATE_CODE',
        });
      }
    }

    // Foreign key validation
    if (row.category_code) {
      const categoryExists = await this.knex('categories').where('category_code', row.category_code.trim()).first();

      if (!categoryExists) {
        errors.push({
          row: rowNumber,
          field: 'category_code',
          message: `Category '${row.category_code}' does not exist`,
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
        });
      }
    }

    return errors;
  }

  /**
   * Insert batch of records into database
   * Called during import execution with transaction support
   */
  protected async insertBatch(batch: any[], trx: Knex.Transaction, options: ImportOptions): Promise<Product[]> {
    const results: Product[] = [];

    for (const row of batch) {
      try {
        // Transform row to database format
        const dbData = await this.transformRowToDb(row, trx);

        // Include batch_id for rollback support
        if (row.import_batch_id) {
          dbData.import_batch_id = row.import_batch_id;
        }

        // Insert into database
        const [inserted] = await trx('products').insert(dbData).returning('*');

        results.push(this.transformDbToEntity(inserted));
      } catch (error) {
        console.error(`Failed to insert product:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Rollback imported records
   * Uses batch_id for precise rollback
   */
  protected async performRollback(batchId: string, knex: Knex): Promise<number> {
    try {
      const deleted = await knex('products').where({ import_batch_id: batchId }).delete();

      return deleted;
    } catch (error) {
      throw new Error(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transform uploaded row to database format
   */
  private async transformRowToDb(row: any, trx: Knex.Transaction): Promise<any> {
    // Lookup category_id from category_code
    let categoryId: number | null = null;
    if (row.category_code) {
      const category = await trx('categories').select('id').where('category_code', row.category_code.trim()).first();

      if (category) {
        categoryId = category.id;
      }
    }

    return {
      product_code: row.code?.trim(),
      product_name: row.name?.trim(),
      price: parseFloat(row.price) || 0,
      category_id: categoryId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Transform database row to entity
   */
  private transformDbToEntity(dbRow: any): Product {
    return {
      id: dbRow.id,
      product_code: dbRow.product_code,
      product_name: dbRow.product_name,
      price: dbRow.price,
      category_id: dbRow.category_id,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }
}
```

**Key Benefits of System Init Import:**

- ✅ Auto-discovered on server start (<100ms for 30+ modules)
- ✅ Centralized dashboard shows all import modules
- ✅ Dependency management ensures correct import order
- ✅ Database-backed sessions (survives server restart)
- ✅ Complete import history and audit trail
- ✅ Precise rollback using `batch_id`
- ✅ No need to manually register routes

---

### Generic Import Controller Integration

```typescript
// Generated: apps/api/src/domains/products/products.controller.ts

import { BaseImportService } from '@shared/services/base-import.service';

export class ProductsController {
  async importPreview(request: FastifyRequest<{ Body: ImportPreviewRequest }>, reply: FastifyReply) {
    const { file, delimiter } = request.body;

    const result = await BaseImportService.preview<CreateProduct>(
      file,
      'products',
      async (data) => {
        // Validate each row against CreateProduct schema
        return this.service.validateImportRow(data);
      },
      { delimiter },
    );

    return reply.send(result);
  }

  async importExecute(request: FastifyRequest<{ Body: ImportExecuteRequest }>, reply: FastifyReply) {
    const { sessionId, options } = request.body;

    const result = await BaseImportService.execute(
      sessionId,
      async (rows) => {
        // Process rows using service
        return this.service.bulkCreate(rows, options);
      },
      options,
    );

    return reply.send(result);
  }

  async importStatus(request: FastifyRequest<{ Params: ImportStatusParams }>, reply: FastifyReply) {
    const { sessionId } = request.params;

    const status = await BaseImportService.getStatus(sessionId);

    if (!status) {
      return reply.code(404).send({
        error: 'Import session not found',
      });
    }

    return reply.send(status);
  }
}
```

### Generated Service

```typescript
// Generated: apps/api/src/domains/products/products.service.ts

export class ProductsService {
  async validateImportRow(data: any): Promise<{
    isValid: boolean;
    errors?: string[];
    data?: CreateProduct;
  }> {
    try {
      // Validate against CreateProduct schema
      const validated = await this.validateCreate(data);

      return {
        isValid: true,
        data: validated,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
      };
    }
  }

  async bulkCreate(
    rows: CreateProduct[],
    options: ImportOptions,
  ): Promise<{
    successCount: number;
    failedCount: number;
    errors?: Array<{ row: number; error: string }>;
  }> {
    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];

        // Check for duplicates if skipDuplicates enabled
        if (options.skipDuplicates) {
          const existing = await this.repository.findByUniqueField(row);
          if (existing) {
            if (options.updateExisting) {
              await this.repository.update(existing.id, row);
            }
            continue;
          }
        }

        // Create new record
        await this.repository.create(row);
        results.successCount++;
      } catch (error) {
        results.failedCount++;
        results.errors.push({
          row: i + 1,
          error: error.message,
        });
      }
    }

    return results;
  }
}
```

### BaseImportService Integration

```typescript
// Pre-existing: apps/api/src/shared/services/base-import.service.ts

export class BaseImportService {
  private static sessions = new Map<string, ImportSession>();

  static async preview<T>(
    fileContent: string,
    resourceName: string,
    validator: (row: any) => Promise<ValidationResult>,
    options?: { delimiter?: string },
  ): Promise<{
    sessionId: string;
    preview: T[];
    totalRows: number;
    validationSummary: {
      valid: number;
      invalid: number;
    };
  }> {
    // Parse file (Excel or CSV)
    const rows = this.parseFile(fileContent, options);

    // Validate each row
    const validationResults = await Promise.all(rows.map((row) => validator(row)));

    // Create session
    const sessionId = generateUUID();
    this.sessions.set(sessionId, {
      id: sessionId,
      resourceName,
      rows: rows.filter((_, i) => validationResults[i].isValid),
      totalRows: rows.length,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    });

    return {
      sessionId,
      preview: rows.slice(0, 10),
      totalRows: rows.length,
      validationSummary: {
        valid: validationResults.filter((r) => r.isValid).length,
        invalid: validationResults.filter((r) => !r.isValid).length,
      },
    };
  }

  static async execute(sessionId: string, processor: (rows: any[]) => Promise<ProcessResult>, options: ImportOptions): Promise<ImportJob> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Import session not found');
    }

    // Update status to processing
    session.status = 'processing';
    session.progress = 0;

    try {
      // Process rows in batches
      const batchSize = 100;
      let processed = 0;
      const results = {
        successCount: 0,
        failedCount: 0,
        errors: [],
      };

      for (let i = 0; i < session.rows.length; i += batchSize) {
        const batch = session.rows.slice(i, i + batchSize);
        const batchResult = await processor(batch);

        results.successCount += batchResult.successCount;
        results.failedCount += batchResult.failedCount;
        if (batchResult.errors) {
          results.errors.push(...batchResult.errors);
        }

        processed += batch.length;
        session.progress = Math.round((processed / session.rows.length) * 100);

        // Emit progress event (if EventService available)
        this.emitProgress(session);
      }

      // Mark as completed
      session.status = results.failedCount === 0 ? 'completed' : 'failed';
      session.progress = 100;
      session.successCount = results.successCount;
      session.failedCount = results.failedCount;
      session.error = results.errors.length > 0 ? `${results.errors.length} rows failed validation` : null;

      return this.sessionToJob(session);
    } catch (error) {
      session.status = 'failed';
      session.error = error.message;
      throw error;
    }
  }

  static async getStatus(sessionId: string): Promise<ImportJob | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return this.sessionToJob(session);
  }

  private static sessionToJob(session: ImportSession): ImportJob {
    return {
      id: session.id,
      status: session.status,
      progress: session.progress,
      successCount: session.successCount || 0,
      failedCount: session.failedCount || 0,
      error: session.error || null,
    };
  }
}
```

---

## Frontend Implementation

### Generated Import Dialog (v2.0.1 Fixed)

```typescript
// Generated: apps/web/src/app/modules/products/components/import-dialog.component.ts

export interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // ✅ v2.0.1: Direct number (0-100)
  successCount: number; // ✅ v2.0.1: Flat property
  failedCount: number; // ✅ v2.0.1: Flat property
  error: string | null; // ✅ v2.0.1: Simple string
}

@Component({
  selector: 'app-products-import-dialog',
  templateUrl: './import-dialog.component.html',
})
export class ProductsImportDialogComponent {
  currentStep = signal<number>(1);
  selectedFile = signal<File | null>(null);
  sessionId = signal<string | null>(null);
  previewData = signal<any[]>([]);
  importJob = signal<ImportJob | null>(null);

  importOptions = signal({
    skipDuplicates: true,
    updateExisting: false,
  });

  // Step 1: Upload file
  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    await this.uploadAndPreview(file);
  }

  private async uploadAndPreview(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const result = await this.service.importPreview(formData).toPromise();

    this.sessionId.set(result.sessionId);
    this.previewData.set(result.preview);
    this.currentStep.set(2); // Move to review step
  }

  // Step 2: Review data (user clicks "Continue")
  confirmReview() {
    this.currentStep.set(3); // Move to options step
  }

  // Step 3: Configure options (user clicks "Start Import")
  async startImport() {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.currentStep.set(4); // Move to processing step

    // Execute import
    const result = await this.service.importExecute(sessionId, this.importOptions()).toPromise();

    this.importJob.set(result);

    // Poll for progress (v2.0.1: polling, v2.1.0: WebSocket)
    this.pollImportStatus(sessionId);
  }

  // Step 4: Poll for progress
  private pollImportStatus(sessionId: string) {
    const pollInterval = setInterval(async () => {
      const status = await this.service.getImportStatus(sessionId).toPromise();

      this.importJob.set(status);

      // ✅ v2.0.1: Direct property access
      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(pollInterval);
        this.currentStep.set(5); // Move to completion step
      }
    }, 2000); // Poll every 2 seconds
  }

  // Step 5: Complete (user clicks "Close")
  close() {
    this.dialogRef.close(true); // Triggers list refresh
  }
}
```

### Generated Template (v2.0.1 Fixed)

```html
<!-- Generated: apps/web/src/app/modules/products/components/import-dialog.component.html -->

<h2 mat-dialog-title>Import Products</h2>

<mat-dialog-content>
  <!-- Step 1: Upload -->
  @if (currentStep() === 1) {
  <div class="upload-section">
    <input type="file" accept=".xlsx,.csv" (change)="onFileSelected($event)" #fileInput />
    <button mat-raised-button (click)="fileInput.click()">Choose File</button>
    @if (selectedFile()) {
    <p>Selected: {{ selectedFile()?.name }}</p>
    }
  </div>
  }

  <!-- Step 2: Review -->
  @if (currentStep() === 2) {
  <div class="review-section">
    <h3>Preview Data (First 10 Rows)</h3>
    <table mat-table [dataSource]="previewData()">
      <!-- Dynamic columns based on data -->
    </table>
    <p>Total rows: {{ previewData().length }}</p>
  </div>
  }

  <!-- Step 3: Options -->
  @if (currentStep() === 3) {
  <div class="options-section">
    <h3>Import Options</h3>
    <mat-checkbox [(ngModel)]="importOptions().skipDuplicates"> Skip duplicate records </mat-checkbox>
    <mat-checkbox [(ngModel)]="importOptions().updateExisting"> Update existing records </mat-checkbox>
  </div>
  }

  <!-- Step 4: Processing -->
  @if (currentStep() === 4) {
  <div class="processing-section">
    <h3>Processing Import...</h3>
    <!-- ✅ v2.0.1: Direct property access -->
    <mat-progress-bar mode="determinate" [value]="importJob()?.progress || 0"></mat-progress-bar>
    <p>{{ importJob()?.progress || 0 }}% complete</p>
  </div>
  }

  <!-- Step 5: Complete -->
  @if (currentStep() === 5) {
  <div class="complete-section">
    <h3>Import Complete</h3>
    <!-- ✅ v2.0.1: Flat properties -->
    <p class="success">Successfully imported: {{ importJob()?.successCount || 0 }} records</p>
    @if ((importJob()?.failedCount || 0) > 0) {
    <p class="error">Failed: {{ importJob()?.failedCount }} records</p>
    <!-- ✅ v2.0.1: Simple error string -->
    @if (importJob()?.error) {
    <p class="error-details">{{ importJob()?.error }}</p>
    } }
  </div>
  }
</mat-dialog-content>

<mat-dialog-actions>
  @if (currentStep() === 2) {
  <button mat-button (click)="currentStep.set(1)">Back</button>
  <button mat-raised-button color="primary" (click)="confirmReview()">Continue</button>
  } @if (currentStep() === 3) {
  <button mat-button (click)="currentStep.set(2)">Back</button>
  <button mat-raised-button color="primary" (click)="startImport()">Start Import</button>
  } @if (currentStep() === 5) {
  <button mat-raised-button color="primary" (click)="close()">Close</button>
  }
</mat-dialog-actions>
```

---

## Excel/CSV Format

### Required Format

Your Excel/CSV file must have:

1. **Header row** - Column names matching entity fields
2. **Data rows** - Values for each field
3. **Correct data types** - Strings, numbers, dates, booleans

### Example: Products Import

**Excel/CSV Structure**:

| name      | description   | price  | stock | categoryId | active |
| --------- | ------------- | ------ | ----- | ---------- | ------ |
| Product A | Description A | 99.99  | 100   | uuid-here  | true   |
| Product B | Description B | 149.99 | 50    | uuid-here  | true   |
| Product C | Description C | 199.99 | 25    | uuid-here  | false  |

### Column Mapping

**Generated schema validation ensures columns map to entity fields**:

```typescript
// CreateProduct schema
{
  name: string;           // Required
  description?: string;   // Optional
  price: number;          // Required
  stock: number;          // Required
  categoryId: string;     // Required (UUID)
  active: boolean;        // Required
}
```

### Data Type Validation

| Field Type  | Excel Format       | Valid Examples                       | Invalid Examples |
| ----------- | ------------------ | ------------------------------------ | ---------------- |
| **String**  | Text               | "Product Name"                       | -                |
| **Number**  | Number             | 99.99, 100                           | "ninety-nine"    |
| **Boolean** | TRUE/FALSE         | true, false, TRUE, FALSE             | yes, no, 1, 0    |
| **UUID**    | Text (UUID format) | 123e4567-e89b-12d3-a456-426614174000 | "invalid-uuid"   |
| **Date**    | Date               | 2025-10-26, 10/26/2025               | "yesterday"      |

### CSV Delimiter

Default: Comma (`,`)

Custom delimiter:

```typescript
await this.service.importPreview(formData, { delimiter: ';' });
```

---

## Validation & Error Handling

### Row-Level Validation

Each row is validated against the CreateEntity schema:

```typescript
async validateImportRow(data: any): Promise<ValidationResult> {
  const errors = [];

  // Required field validation
  if (!data.name) {
    errors.push('Name is required');
  }

  // Type validation
  if (typeof data.price !== 'number') {
    errors.push('Price must be a number');
  }

  // Range validation
  if (data.price < 0) {
    errors.push('Price must be positive');
  }

  // UUID validation
  if (!isValidUUID(data.categoryId)) {
    errors.push('Invalid category ID (must be UUID)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: errors.length === 0 ? data : undefined
  };
}
```

### Error Reporting

**Preview Stage** - Shows validation errors before import:

```json
{
  "sessionId": "uuid",
  "preview": [...],
  "validationSummary": {
    "valid": 95,
    "invalid": 5
  },
  "errors": [
    { "row": 3, "field": "price", "error": "Price must be a number" },
    { "row": 7, "field": "categoryId", "error": "Invalid category ID" }
  ]
}
```

**Execution Stage** - Tracks per-row failures:

```json
{
  "id": "session-uuid",
  "status": "completed",
  "progress": 100,
  "successCount": 95,
  "failedCount": 5,
  "error": "5 rows failed validation"
}
```

### Error Recovery

**Skip Invalid Rows**:

```typescript
// Default behavior: Skip invalid rows, continue processing
for (const row of rows) {
  try {
    await this.create(row);
    successCount++;
  } catch (error) {
    failedCount++;
    errors.push({ row: i, error: error.message });
    // Continue to next row
  }
}
```

**Transaction Rollback** (Future Feature):

```typescript
// v2.1.0: Option to rollback entire import if any row fails
if (options.allOrNothing) {
  await knex.transaction(async (trx) => {
    for (const row of rows) {
      await this.create(row, trx);
    }
  });
}
```

---

## Session Management

### Session Lifecycle

```
┌──────────────────────────────────────────────────────┐
│ 1. Create Session (POST /import/preview)            │
│    - Parse file                                      │
│    - Store rows in session                           │
│    - Return sessionId                                │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│ 2. Execute Import (POST /import/execute)             │
│    - Retrieve session by ID                          │
│    - Process rows                                    │
│    - Update progress                                 │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│ 3. Poll Status (GET /import/status/:sessionId)       │
│    - Return current progress                         │
│    - Return success/failure counts                   │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│ 4. Session Cleanup (after 1 hour)                    │
│    - Auto-delete expired sessions                    │
│    - Free up memory                                  │
└──────────────────────────────────────────────────────┘
```

### Session Storage

**In-Memory Storage** (Current):

```typescript
private static sessions = new Map<string, ImportSession>();
```

**Redis Storage** (Future):

```typescript
// v2.2.0: Redis for distributed session management
await redis.setex(`import:${sessionId}`, 3600, JSON.stringify(session));
```

### Session Expiration

```typescript
// Auto-cleanup after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [id, session] of this.sessions.entries()) {
    if (session.createdAt.getTime() < oneHourAgo) {
      this.sessions.delete(id);
    }
  }
}, 600000); // Check every 10 minutes
```

---

## Progress Tracking

### Current Implementation (v2.0.1): Polling

```typescript
// Frontend polls backend every 2 seconds
private pollImportStatus(sessionId: string) {
  const pollInterval = setInterval(async () => {
    const status = await this.service.getImportStatus(sessionId).toPromise();

    // ✅ v2.0.1: Direct property access
    this.importJob.set(status);

    if (status.status === 'completed' || status.status === 'failed') {
      clearInterval(pollInterval);
      this.currentStep.set(5);
    }
  }, 2000);
}
```

**Pros**:

- ✅ Simple implementation
- ✅ Works reliably
- ✅ No WebSocket required

**Cons**:

- ❌ Higher server load (repeated requests)
- ❌ 2-second delay in updates
- ❌ Not truly real-time

### Future Implementation (v2.1.0): WebSocket

```typescript
// Frontend listens to WebSocket events
private setupImportProgress(sessionId: string) {
  this.wsService.listen<ImportProgressEvent>(`products:import-progress`)
    .pipe(
      filter(event => event.sessionId === sessionId),
      takeUntil(this.destroy$)
    )
    .subscribe(event => {
      // ✅ Real-time updates (no polling)
      this.importJob.update(job => ({
        ...job,
        progress: event.progress,
        processedRows: event.processedRows
      }));
    });

  this.wsService.listen<ImportCompletedEvent>(`products:import-completed`)
    .pipe(
      filter(event => event.sessionId === sessionId),
      take(1)
    )
    .subscribe(event => {
      this.importJob.set(event.result);
      this.currentStep.set(5);
    });
}
```

**Pros**:

- ✅ True real-time updates
- ✅ Lower server load
- ✅ Instant progress updates

**Requires**:

- Backend WebSocket integration
- Frontend WebSocket listeners
- Event emission during processing

---

## Migration Guide

### Migrating from Generic Import to System Init Import

**When to Migrate:**

- You have multiple modules with import functionality
- You want centralized import dashboard
- You need dependency management (import order)
- You want import history and rollback support

**Migration Steps:**

#### Step 1: Add Required Database Tables

```sql
-- Import sessions table (database-backed sessions)
CREATE TABLE IF NOT EXISTS import_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('csv', 'excel')),
  validated_data JSONB NOT NULL,
  validation_result JSONB NOT NULL,
  can_proceed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_sessions_module ON import_sessions(module_name);
CREATE INDEX idx_import_sessions_expires ON import_sessions(expires_at);

-- Import history table
CREATE TABLE IF NOT EXISTS import_history (
  id SERIAL PRIMARY KEY,
  job_id UUID UNIQUE NOT NULL,
  session_id UUID,
  module_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  error_message TEXT,
  can_rollback BOOLEAN NOT NULL DEFAULT false,
  imported_by UUID,
  imported_by_name VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  batch_id UUID NOT NULL,
  rolled_back_at TIMESTAMP,
  rolled_back_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_history_job_id ON import_history(job_id);
CREATE INDEX idx_import_history_module ON import_history(module_name);
CREATE INDEX idx_import_history_status ON import_history(status);
CREATE INDEX idx_import_history_batch_id ON import_history(batch_id);
```

#### Step 2: Add import_batch_id Column to Tables

```sql
-- Add to each table that supports import
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_batch_id UUID DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_products_import_batch ON products(import_batch_id);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS import_batch_id UUID DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_import_batch ON categories(import_batch_id);

-- Repeat for other tables...
```

#### Step 3: Convert Import Service

**Before (Generic Import):**

```typescript
export class ProductsImportService extends BaseImportService<Product> {
  constructor(knex: Knex, repository: ProductsRepository, eventService?: any) {
    super(knex, ProductsImportService.createConfig(repository), 'products', eventService);
  }

  private static createConfig(repository: ProductsRepository): ImportModuleConfig<Product> {
    // Config object...
  }
}
```

**After (System Init Import):**

```typescript
@ImportService({
  module: 'products',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Products (สินค้า)',
  dependencies: ['categories'],
  priority: 2,
  tags: ['master-data'],
  supportsRollback: true,
  version: '1.0.0',
})
export class ProductsImportService extends BaseImportService<Product> {
  private repository: ProductsRepository;

  constructor(knex: Knex) {
    super(knex);
    this.repository = new ProductsRepository(knex);
    this.moduleName = 'products';
  }

  getMetadata() {
    /* ... */
  }
  getTemplateColumns(): TemplateColumn[] {
    /* ... */
  }
  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    /* ... */
  }
  protected async insertBatch(batch: any[], trx: Knex.Transaction, options: ImportOptions): Promise<Product[]> {
    /* ... */
  }
  protected async performRollback(batchId: string, knex: Knex): Promise<number> {
    /* ... */
  }
}
```

#### Step 4: Update Imports

**Before:**

```typescript
import { BaseImportService } from '../../../shared/services/base-import.service';
```

**After:**

```typescript
import { ImportService, BaseImportService, TemplateColumn, ValidationError, ImportOptions } from '../import'; // or correct path to platform/import
```

#### Step 5: Implement Required Methods

**getMetadata():**

```typescript
getMetadata() {
  return {
    module: 'products',
    domain: 'inventory',
    displayName: 'Products (สินค้า)',
    dependencies: ['categories'],
    priority: 2,
    tags: ['master-data'],
    supportsRollback: true,
    version: '1.0.0',
  };
}
```

**getTemplateColumns():**
Convert field config to template columns:

```typescript
// Before (Generic)
const fields: ImportFieldConfig[] = [
  {
    name: 'code',
    label: 'Product Code',
    required: true,
    type: 'string',
    maxLength: 20,
  }
];

// After (System Init)
getTemplateColumns(): TemplateColumn[] {
  return [
    {
      name: 'code',
      displayName: 'Product Code',
      required: true,
      type: 'string',
      maxLength: 20,
      pattern: '^[A-Z0-9_-]+$',
      description: 'Unique product code',
      example: 'PRD-001',
    }
  ];
}
```

**validateRow():**
Convert field validators to row-level validation:

```typescript
async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Required fields
  if (!row.code || !row.code.trim()) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'Product code is required',
      severity: 'ERROR',
      code: 'REQUIRED_FIELD',
    });
  }

  // Custom validation
  if (row.code) {
    const existing = await this.knex('products')
      .where('product_code', row.code.trim())
      .first();

    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: `Product code '${row.code}' already exists`,
        severity: 'ERROR',
        code: 'DUPLICATE_CODE',
      });
    }
  }

  return errors;
}
```

**insertBatch():**

```typescript
protected async insertBatch(
  batch: any[],
  trx: Knex.Transaction,
  options: ImportOptions,
): Promise<Product[]> {
  const results: Product[] = [];

  for (const row of batch) {
    const dbData = {
      product_code: row.code?.trim(),
      product_name: row.name?.trim(),
      price: parseFloat(row.price) || 0,
      import_batch_id: row.import_batch_id, // IMPORTANT: For rollback
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [inserted] = await trx('products').insert(dbData).returning('*');
    results.push(inserted);
  }

  return results;
}
```

**performRollback():**

```typescript
protected async performRollback(batchId: string, knex: Knex): Promise<number> {
  const deleted = await knex('products')
    .where({ import_batch_id: batchId })
    .delete();

  return deleted;
}
```

#### Step 6: Remove Old Routes (Optional)

If migrating to System Init, you can remove module-specific import routes since System Init provides centralized endpoints:

```typescript
// Can remove these routes:
// - POST /api/products/import/preview
// - POST /api/products/import/execute
// - GET /api/products/import/status/:sessionId

// Now use centralized routes:
// - GET /api/admin/system-init/module/products/template
// - POST /api/admin/system-init/module/products/validate
// - POST /api/admin/system-init/module/products/import
// - GET /api/admin/system-init/module/products/status/:jobId
// - DELETE /api/admin/system-init/module/products/rollback/:jobId
```

#### Step 7: Update Frontend (Optional)

**Before (Generic Import Dialog):**

```typescript
// Module-specific import dialog
<app-products-import-dialog></app-products-import-dialog>
```

**After (System Init Dashboard):**

```typescript
// Access via centralized System Init dashboard
// Navigate to: /admin/system-init
// Import modules from dashboard UI
```

**Or keep module-specific dialog but update API endpoints:**

```typescript
// Update service to use System Init endpoints
validateFile(file: File) {
  return this.http.post(`/api/admin/system-init/module/products/validate`, formData);
}

executeImport(sessionId: string, options: ImportOptions) {
  return this.http.post(`/api/admin/system-init/module/products/import`, { sessionId, options });
}
```

---

### Comparison: Before & After

| Aspect                | Generic Import      | System Init Import              |
| --------------------- | ------------------- | ------------------------------- |
| **Setup**             | Config object       | Decorator metadata              |
| **BaseImportService** | `@shared/services/` | `@layers/platform/import/base/` |
| **Discovery**         | Manual              | Automatic on server start       |
| **Routes**            | Module-specific     | Centralized System Init API     |
| **Session Storage**   | In-memory Map       | Database (`import_sessions`)    |
| **History Tracking**  | Not included        | Database (`import_history`)     |
| **Rollback**          | Not included        | Precise with `batch_id`         |
| **Dashboard**         | None                | Centralized UI                  |

---

## Best Practices

### 1. File Size Limits

```typescript
// Backend: Set reasonable file size limit
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Frontend: Validate before upload
if (file.size > 10 * 1024 * 1024) {
  this.showError('File too large (max 10MB)');
  return;
}
```

### 2. Batch Processing

```typescript
// Process large files in batches
const batchSize = 100;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  await this.processBatch(batch);

  // Update progress
  session.progress = Math.round(((i + batch.length) / rows.length) * 100);
}
```

### 3. Transaction Management

```typescript
// Use transactions for data consistency
await knex.transaction(async (trx) => {
  for (const row of batch) {
    await this.repository.create(row, trx);
  }
});
```

### 4. User Feedback

```typescript
// Show clear progress and error messages
@if (importJob()?.status === 'processing') {
  <p>Processing row {{ processedRows() }} of {{ totalRows() }}</p>
  <mat-progress-bar [value]="importJob()?.progress"></mat-progress-bar>
}

@if (importJob()?.status === 'failed') {
  <mat-error>
    Import failed: {{ importJob()?.error }}
  </mat-error>
}
```

### 5. Error Export

```typescript
// Allow users to download error report
downloadErrors() {
  const errors = this.importJob()?.errors || [];
  const csv = this.convertErrorsToCSV(errors);
  const blob = new Blob([csv], { type: 'text/csv' });
  saveAs(blob, 'import-errors.csv');
}
```

---

## Troubleshooting

### File Upload Fails

**Symptoms**: Upload returns 400 or 500 error

**Solutions**:

1. **Check file size**:

   ```typescript
   // Ensure file is under limit
   if (file.size > 10 * 1024 * 1024) {
     throw new Error('File too large');
   }
   ```

2. **Verify file format**:

   ```typescript
   // Accept only .xlsx and .csv
   if (!file.name.match(/\.(xlsx|csv)$/)) {
     throw new Error('Invalid file format');
   }
   ```

3. **Check multipart config**:
   ```typescript
   // Ensure multipart is registered
   fastify.register(multipart);
   ```

### Validation Errors

**Symptoms**: All rows marked as invalid

**Solutions**:

1. **Check column names**:

   ```
   Excel: name, price, stock
   Schema: name, price, stock ✅

   Excel: Name, Price, Stock
   Schema: name, price, stock ❌ (case mismatch)
   ```

2. **Verify data types**:

   ```
   Excel: "99.99" (text)
   Schema: price: number ❌

   Excel: 99.99 (number)
   Schema: price: number ✅
   ```

3. **Check required fields**:
   ```typescript
   // Ensure all required fields have values
   if (!row.name || !row.price) {
     return { isValid: false, errors: ['Missing required fields'] };
   }
   ```

### Import Hangs at Processing

**Symptoms**: Progress stuck at 0%

**Solutions**:

1. **Check session exists**:

   ```typescript
   const session = await this.getImportSession(sessionId);
   if (!session) {
     throw new Error('Session not found');
   }
   ```

2. **Verify batch processing**:

   ```typescript
   // Ensure progress is updated
   session.progress = Math.round((processed / total) * 100);
   ```

3. **Check for errors in logs**:
   ```bash
   # Check API logs
   tail -f apps/api/logs/error.log
   ```

### Session Not Found

**Symptoms**: 404 error when executing import

**Solutions**:

1. **Check session expiration**:

   ```typescript
   // Sessions expire after 1 hour
   // Upload and execute within time limit
   ```

2. **Verify sessionId**:

   ```typescript
   // Ensure sessionId from preview is used in execute
   console.log('Session ID:', sessionId);
   ```

3. **Check server restart**:
   ```
   // In-memory sessions lost on restart
   // Use Redis for persistent sessions (future feature)
   ```

### Type Mismatch Errors (v2.0.1 Fix)

**Symptoms**: `Cannot read property 'percentage' of undefined`

**Solution**: Regenerate module with v2.0.1 templates:

```bash
pnpm run crud-gen products --with-import --force
```

**What Changed**:

```typescript
// ❌ Before (v2.0.0):
progress: {
  percentage: number;
  current: number;
  total: number;
}

// ✅ After (v2.0.1):
progress: number; // 0-100
```

---

## Example: Complete Import Flow

### 1. User Uploads File

```typescript
// Frontend
async onFileSelected(event: Event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  const result = await this.service.importPreview(formData).toPromise();
  this.sessionId.set(result.sessionId);
  this.previewData.set(result.preview);
}
```

### 2. Backend Parses and Validates

```typescript
// Backend
async importPreview(request, reply) {
  const file = request.body.file;

  const result = await BaseImportService.preview(
    file,
    'products',
    async (row) => await this.service.validateImportRow(row)
  );

  return reply.send(result);
}
```

### 3. User Reviews and Confirms

```html
<!-- Frontend Template -->
<table mat-table [dataSource]="previewData()">
  <!-- Preview table -->
</table>
<button (click)="startImport()">Start Import</button>
```

### 4. Backend Processes Rows

```typescript
// Backend
async importExecute(request, reply) {
  const { sessionId, options } = request.body;

  const result = await BaseImportService.execute(
    sessionId,
    async (rows) => await this.service.bulkCreate(rows, options),
    options
  );

  return reply.send(result);
}
```

### 5. Frontend Polls Progress

```typescript
// Frontend
private pollImportStatus(sessionId: string) {
  const interval = setInterval(async () => {
    const status = await this.service.getImportStatus(sessionId).toPromise();
    this.importJob.set(status);

    if (status.status === 'completed' || status.status === 'failed') {
      clearInterval(interval);
      this.showResults();
    }
  }, 2000);
}
```

### 6. User Views Results

```html
<!-- Frontend Template -->
<div class="results">
  <p class="success">Successfully imported: {{ importJob()?.successCount }} records</p>
  @if (importJob()?.failedCount > 0) {
  <p class="error">Failed: {{ importJob()?.failedCount }} records</p>
  <button (click)="downloadErrors()">Download Error Report</button>
  }
</div>
```

---

## Summary

**What You Get with `--with-import`**:

- ✅ Complete 5-step import wizard
- ✅ Excel and CSV support
- ✅ Data preview and validation
- ✅ Configurable import options
- ✅ Progress tracking
- ✅ Error reporting
- ✅ Session-based workflow
- ✅ BaseImportService integration
- ✅ v2.0.1 type alignment fixes

**What's Coming in v2.1.0**:

- 🚧 WebSocket-based progress (no polling)
- 🚧 Real-time row-by-row updates
- 🚧 Import history and audit trail
- 🚧 Template-based validation rules

**Best Practices**:

- Set reasonable file size limits
- Process in batches for performance
- Use transactions for consistency
- Provide clear error messages
- Allow error report downloads

**Related Guides**:

- [Events Guide](./EVENTS_GUIDE.md) - Real-time event emission
- [User Guide](./USER_GUIDE.md) - Complete feature overview
- [API Reference](./API_REFERENCE.md) - Technical specifications
