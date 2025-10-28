# Bulk Import Guide

**Complete guide to bulk Excel/CSV import in CRUD Generator v2.0+**

## Table of Contents

- [Overview](#overview)
- [What is `--with-import`?](#what-is---with-import)
- [Import Workflow](#import-workflow)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Excel/CSV Format](#excelcsv-format)
- [Validation & Error Handling](#validation--error-handling)
- [Session Management](#session-management)
- [Progress Tracking](#progress-tracking)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The `--with-import` flag enables **bulk data import from Excel/CSV files** with a complete 5-step workflow: Upload → Review → Configure → Process → Complete.

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

### Generated Controller (v2.0.1)

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
