# AegisX CLI - Bulk Import Guide

> Excel/CSV import with `--with-import`

---

## Overview

The `--with-import` flag adds bulk import functionality to your CRUD modules, supporting Excel (.xlsx) and CSV file uploads with validation and progress tracking.

---

## Quick Start

```bash
# Backend with import service
aegisx generate budgets --with-import --force

# Frontend with import dialog
aegisx generate budgets --target frontend --with-import --force
```

---

## What Gets Generated

### Backend Files

```
modules/budgets/
├── budgets.routes.ts         # Includes import endpoints
├── budgets.controller.ts     # Import controller methods
├── budgets.service.ts        # Standard CRUD service
├── budgets.import.service.ts # Import processing service
├── budgets.repository.ts     # Database operations
├── budgets.schemas.ts        # Includes import schemas
└── budgets.types.ts          # Import types
```

### Frontend Files

```
features/budgets/
├── budgets.component.ts          # Main component with import button
├── budgets.service.ts            # API service with import methods
├── budgets-dialog.component.ts   # Create/Edit dialog
├── budgets-import-dialog.component.ts  # Import dialog
└── budgets.routes.ts
```

---

## API Endpoints

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| POST   | `/api/budgets/import`               | Upload file for import   |
| GET    | `/api/budgets/import/:jobId`        | Get import job status    |
| GET    | `/api/budgets/import/:jobId/errors` | Get import errors        |
| GET    | `/api/budgets/import/template`      | Download import template |

---

## Backend Usage

### Import Service

```typescript
// budgets.import.service.ts
export class BudgetsImportService extends BaseImportService<Budget> {
  constructor(
    private repository: BudgetsRepository,
    private knex: Knex,
  ) {
    super(repository, knex, {
      tableName: 'budgets',
      requiredColumns: ['name', 'amount', 'category'],
      optionalColumns: ['description', 'start_date', 'end_date'],
    });
  }

  // Override for custom validation
  async validateRow(row: Record<string, unknown>, rowIndex: number): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check required fields
    if (!row.name) {
      errors.push(`Row ${rowIndex}: name is required`);
    }

    if (!row.amount || isNaN(Number(row.amount))) {
      errors.push(`Row ${rowIndex}: amount must be a number`);
    }

    return { valid: errors.length === 0, errors };
  }

  // Override for data transformation
  async transformRow(row: Record<string, unknown>): Promise<CreateBudget> {
    return {
      name: String(row.name),
      amount: Number(row.amount),
      category: String(row.category),
      description: row.description ? String(row.description) : null,
      start_date: row.start_date ? new Date(String(row.start_date)) : null,
      end_date: row.end_date ? new Date(String(row.end_date)) : null,
    };
  }
}
```

### Import Controller

```typescript
// budgets.controller.ts
async importFile(request: FastifyRequest, reply: FastifyReply) {
  const file = await request.file();

  if (!file) {
    return reply.badRequest('No file uploaded');
  }

  const jobId = await this.importService.startImport(file);

  return reply.send({
    jobId,
    status: 'processing',
    message: 'Import started',
  });
}

async getImportStatus(request: FastifyRequest, reply: FastifyReply) {
  const { jobId } = request.params as { jobId: string };
  const status = await this.importService.getJobStatus(jobId);

  return reply.send(status);
}
```

---

## Frontend Usage

### Import Dialog Component

```typescript
// budgets-import-dialog.component.ts
@Component({
  selector: 'app-budgets-import-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title>Import Budgets</h2>

    <mat-dialog-content>
      <!-- File Upload -->
      <div class="upload-area" (drop)="onDrop($event)" (dragover)="onDragOver($event)">
        <input #fileInput type="file" accept=".xlsx,.csv" (change)="onFileSelect($event)" hidden />
        <button mat-stroked-button (click)="fileInput.click()">Select File</button>
        <p>or drag and drop here</p>
      </div>

      <!-- Progress -->
      @if (importing) {
        <mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
        <p>{{ successCount }} successful, {{ failedCount }} failed</p>
      }

      <!-- Errors -->
      @if (errors.length > 0) {
        <div class="errors">
          <h4>Errors:</h4>
          <ul>
            @for (error of errors; track error) {
              <li>{{ error }}</li>
            }
          </ul>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button (click)="downloadTemplate()">Download Template</button>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!file || importing" (click)="startImport()">Import</button>
    </mat-dialog-actions>
  `,
})
export class BudgetsImportDialogComponent {
  file: File | null = null;
  importing = false;
  progress = 0;
  successCount = 0;
  failedCount = 0;
  errors: string[] = [];

  constructor(
    private service: BudgetsService,
    private dialogRef: MatDialogRef<BudgetsImportDialogComponent>,
  ) {}

  async startImport() {
    if (!this.file) return;

    this.importing = true;
    this.progress = 0;

    try {
      const { jobId } = await this.service.uploadImport(this.file);

      // Poll for status
      await this.pollStatus(jobId);
    } catch (error) {
      this.errors.push('Import failed');
    }
  }

  private async pollStatus(jobId: string) {
    const status = await this.service.getImportStatus(jobId);

    this.progress = status.progress;
    this.successCount = status.successCount;
    this.failedCount = status.failedCount;

    if (status.status === 'completed') {
      this.importing = false;
      this.dialogRef.close({ success: true, ...status });
    } else if (status.status === 'failed') {
      this.importing = false;
      this.errors.push(status.error || 'Import failed');
    } else {
      // Continue polling
      setTimeout(() => this.pollStatus(jobId), 1000);
    }
  }

  downloadTemplate() {
    this.service.downloadTemplate();
  }
}
```

### Service Methods

```typescript
// budgets.service.ts
@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/budgets';

  uploadImport(file: File): Observable<{ jobId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ jobId: string }>(`${this.apiUrl}/import`, formData);
  }

  getImportStatus(jobId: string): Observable<ImportStatus> {
    return this.http.get<ImportStatus>(`${this.apiUrl}/import/${jobId}`);
  }

  downloadTemplate(): void {
    window.open(`${this.apiUrl}/import/template`, '_blank');
  }
}
```

---

## File Format

### Excel (.xlsx)

First row must be column headers:

| name      | amount | category  | description    |
| --------- | ------ | --------- | -------------- |
| Q1 Budget | 50000  | Marketing | First quarter  |
| Q2 Budget | 75000  | Sales     | Second quarter |

### CSV

```csv
name,amount,category,description
Q1 Budget,50000,Marketing,First quarter
Q2 Budget,75000,Sales,Second quarter
```

---

## Import Status

```typescript
interface ImportStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalRows: number;
  processedRows: number;
  successCount: number;
  failedCount: number;
  error?: string; // Error message if failed
  startedAt: string;
  completedAt?: string;
}
```

---

## Validation

### Built-in Validations

- Required fields check
- Data type validation
- Unique constraint check
- Foreign key validation

### Custom Validation

Override `validateRow` in import service:

```typescript
async validateRow(row: Record<string, unknown>, rowIndex: number): Promise<ValidationResult> {
  const errors: string[] = [];

  // Custom business logic
  if (Number(row.amount) < 0) {
    errors.push(`Row ${rowIndex}: amount cannot be negative`);
  }

  if (row.end_date && row.start_date && row.end_date < row.start_date) {
    errors.push(`Row ${rowIndex}: end_date must be after start_date`);
  }

  return { valid: errors.length === 0, errors };
}
```

---

## Error Handling

### Row-Level Errors

Errors are collected per row and reported in the status:

```json
{
  "jobId": "abc123",
  "status": "completed",
  "successCount": 98,
  "failedCount": 2,
  "errors": [
    { "row": 5, "message": "name is required" },
    { "row": 12, "message": "amount must be a number" }
  ]
}
```

### Get Detailed Errors

```bash
GET /api/budgets/import/:jobId/errors
```

---

## Template Download

Generate a template file with correct columns:

```bash
GET /api/budgets/import/template
```

Returns Excel file with:

- Column headers
- Example row
- Validation notes in comments

---

## Best Practices

### DO

- Validate files before upload (size, type)
- Show progress to users
- Allow users to download error report
- Provide template download
- Handle partial failures gracefully

### DON'T

- Process huge files synchronously
- Skip validation
- Ignore encoding issues
- Allow duplicate imports
- Trust client-side validation alone

---

## Configuration

### File Size Limit

```typescript
// In Fastify config
fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
```

### Batch Size

```typescript
// In import service
const BATCH_SIZE = 100; // Process 100 rows at a time
```

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
