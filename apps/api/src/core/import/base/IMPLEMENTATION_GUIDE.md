# BaseImportService Implementation Guide

## Overview

The `BaseImportService` is an abstract class that implements the `IImportService` interface. It provides a complete foundation for building import services with template generation, file validation, import execution, transaction support, and rollback capabilities.

**Location**: `/apps/api/src/core/import/base/base-import.service.ts`

## Key Features

### 1. Template Generation

- **CSV Template**: Simple text-based format with headers and example rows
- **Excel Template**: Rich format with:
  - Formatted headers (bold, blue background)
  - Data validation with dropdown lists for enum fields
  - Column width optimization
  - Inline hints/notes for field constraints
  - Example data rows

### 2. File Validation (Session-Based Workflow)

- **Session Management**: Creates 30-minute expiring sessions for validated files
- **Row-by-Row Validation**: Accumulates errors and warnings
- **Error Categorization**:
  - `ERROR`: Block import
  - `WARNING`: Allow import with option to skip
  - `INFO`: Informational messages
- **Statistics**: Tracks total rows, valid rows, error rows

### 3. File Parsing

- **Excel Support**: Using ExcelJS library
- **CSV Support**: Using PapaParse library
- **Header Mapping**: Automatically maps column headers to field names

### 4. Import Execution

- **Transaction Support**: Database transactions using Knex
- **Batch Processing**: Configurable batch size for database inserts
- **Conflict Handling**: Options to skip, update, or error on conflicts
- **Non-blocking**: Uses `setImmediate` for background processing
- **Job Tracking**: Stores progress in database

### 5. Status Tracking

- **import_history Table**: Records all imports with metadata
- **Progress Updates**: Real-time status tracking
- **Duration Metrics**: Tracks start, completion, and duration
- **Error Logging**: Stores error messages and details

### 6. Rollback Capability

- **Conditional Support**: Based on metadata `supportsRollback` flag
- **Rollback Validation**: Only allows rollback on completed imports
- **Child Implementation**: Calls `performRollback()` for custom logic

### 7. Import History

- **Retrieval**: Gets import history with limit parameter
- **Sorting**: Orders by most recent first
- **User Info**: Includes imported by user details

## Architecture

```
BaseImportService (Abstract)
├── Template Generation
│   ├── generateTemplate(format)
│   ├── generateExcelTemplate(columns)
│   └── generateCsvTemplate(columns)
├── File Validation
│   ├── validateFile(buffer, fileName, fileType)
│   ├── parseFile(buffer, fileType)
│   ├── parseExcelFile(buffer)
│   └── parseCsvFile(buffer)
├── Row Validation
│   └── validateRow(row, rowNumber) [ABSTRACT - implement in child]
├── Import Execution
│   ├── importData(sessionId, options)
│   ├── executeImportJob(jobId, session, options)
│   └── insertBatch(batch, trx, options) [ABSTRACT - implement in child]
├── Status Tracking
│   ├── getImportStatus(jobId)
│   ├── storeImportHistory(job)
│   └── updateImportHistory(job)
├── Rollback
│   ├── canRollback(jobId)
│   ├── rollback(jobId)
│   └── performRollback(jobId, job) [ABSTRACT - implement in child]
└── History
    └── getImportHistory(limit)
```

## Implementation Example

### Minimal Implementation

```typescript
import { ImportService, BaseImportService, TemplateColumn, ValidationError } from '@aegisx/core/import';
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';

interface DrugGeneric {
  id: string;
  code: string;
  name: string;
  venClassification?: string;
}

@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics',
  dependencies: [],
  priority: 1,
  tags: ['master-data', 'required'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  constructor(
    private knex: Knex,
    private fastify: FastifyInstance,
  ) {
    super(knex);
    this.moduleName = 'drug_generics';
  }

  getMetadata() {
    return {
      module: 'drug_generics',
      domain: 'inventory',
      subdomain: 'master-data',
      displayName: 'Drug Generics',
      dependencies: [],
      priority: 1,
      tags: ['master-data', 'required'],
      supportsRollback: true,
      version: '1.0.0',
    };
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'code',
        displayName: 'Generic Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code for the generic drug',
        example: 'PARA500',
      },
      {
        name: 'name',
        displayName: 'Generic Name',
        required: true,
        type: 'string',
        maxLength: 255,
        example: 'Paracetamol',
      },
      {
        name: 'venClassification',
        displayName: 'VEN Classification',
        required: false,
        type: 'string',
        enumValues: ['V', 'E', 'N'],
        example: 'E',
      },
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check for duplicates
    const existing = await this.knex('drug_generics').where('code', row.code).first();

    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: `Code '${row.code}' already exists`,
        severity: 'ERROR',
        code: 'DUPLICATE_CODE',
      });
    }

    // Validate enum
    if (row.venClassification && !['V', 'E', 'N'].includes(row.venClassification)) {
      errors.push({
        row: rowNumber,
        field: 'venClassification',
        message: 'Invalid VEN classification',
        severity: 'ERROR',
        code: 'INVALID_ENUM',
      });
    }

    return errors;
  }

  protected async insertBatch(batch: any[], trx: Knex.Transaction, options: any): Promise<DrugGeneric[]> {
    return trx('drug_generics').insert(batch).returning('*');
  }

  protected async performRollback(jobId: string, job: any): Promise<void> {
    // Delete records inserted by this job
    await this.knex('drug_generics').where('imported_from_job', jobId).del();
  }
}
```

### Usage in Controller

```typescript
export class SystemInitController {
  constructor(private importService: DrugGenericsImportService) {}

  // 1. Download template
  async getTemplate(req: FastifyRequest, reply: FastifyReply) {
    const buffer = await this.importService.generateTemplate('excel');
    reply.type('application/octet-stream');
    reply.header('Content-Disposition', 'attachment; filename="template.xlsx"');
    return buffer;
  }

  // 2. Validate file
  async validateFile(req: FastifyRequest, reply: FastifyReply) {
    const { file } = req;
    const result = await this.importService.validateFile(file.buffer, file.filename, 'excel');
    return result;
  }

  // 3. Execute import
  async importData(req: FastifyRequest, reply: FastifyReply) {
    const { sessionId, options } = req.body;
    const result = await this.importService.importData(sessionId, options);
    return result;
  }

  // 4. Check status
  async getStatus(req: FastifyRequest, reply: FastifyReply) {
    const { jobId } = req.params;
    const status = await this.importService.getImportStatus(jobId);
    return status;
  }

  // 5. Rollback (if supported)
  async rollback(req: FastifyRequest, reply: FastifyReply) {
    const { jobId } = req.params;
    await this.importService.rollback(jobId);
    return { success: true };
  }
}
```

## Child Class Requirements

### Abstract Methods to Implement

1. **getMetadata()**: Return service metadata

   ```typescript
   getMetadata(): ImportServiceMetadata {
     return { /* ... */ };
   }
   ```

2. **getTemplateColumns()**: Define import structure

   ```typescript
   getTemplateColumns(): TemplateColumn[] {
     return [ /* column definitions */ ];
   }
   ```

3. **validateRow()**: Custom row validation

   ```typescript
   async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
     // Check for duplicates, invalid values, etc.
     return errors;
   }
   ```

4. **insertBatch()**: Insert records into database

   ```typescript
   protected async insertBatch(
     batch: any[],
     trx: Knex.Transaction,
     options: ImportOptions
   ): Promise<T[]> {
     return trx('table_name').insert(batch).returning('*');
   }
   ```

5. **performRollback()**: Delete records on rollback (optional)
   ```typescript
   protected async performRollback(jobId: string, job: ImportJob): Promise<void> {
     await this.knex('table_name')
       .where('job_id', jobId)
       .del();
   }
   ```

## Database Schema

Required tables (created by migrations):

### import_history

Stores all import jobs and their status

```sql
CREATE TABLE import_history (
  job_id UUID PRIMARY KEY,
  session_id UUID,
  module_name VARCHAR(100),
  status VARCHAR(20),
  total_rows INTEGER,
  imported_rows INTEGER,
  error_rows INTEGER,
  warning_count INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  error_message TEXT,
  can_rollback BOOLEAN,
  imported_by UUID,
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### import_sessions

Stores validation sessions (auto-cleanup after 30 minutes)

```sql
CREATE TABLE import_sessions (
  session_id UUID PRIMARY KEY,
  module_name VARCHAR(100),
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  file_type VARCHAR(10),
  validated_data JSONB,
  validation_result JSONB,
  can_proceed BOOLEAN,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID
);
```

## Configuration

### Batch Size

Control how many rows are processed per database transaction:

```typescript
const result = await service.importData(sessionId, {
  batchSize: 100, // Default: 100
});
```

### Conflict Handling

Control behavior when duplicate keys are encountered:

```typescript
const result = await service.importData(sessionId, {
  onConflict: 'skip', // skip, update, or error
});
```

### Skip Warnings

Allow import to proceed with non-blocking warnings:

```typescript
const result = await service.importData(sessionId, {
  skipWarnings: true,
});
```

## Error Handling

### Validation Errors

Returned in `ValidationResult`:

```typescript
{
  errors: [
    {
      row: 5,
      field: 'code',
      message: 'Code must be unique',
      severity: 'ERROR',
      code: 'DUPLICATE_CODE',
    },
  ];
}
```

### Import Errors

Stored in `ImportJob`:

```typescript
{
  status: 'failed',
  errorMessage: 'Database error: ...',
  errorDetails: { /* full error */ }
}
```

## Performance Considerations

1. **Session Expiry**: 30 minutes default (configurable in code)
2. **Batch Processing**: Reduces memory usage for large imports
3. **Non-blocking**: Uses `setImmediate` to prevent blocking event loop
4. **Database Transactions**: Per-batch transactions for consistency
5. **In-memory Caching**: Sessions and jobs stored in-memory (can upgrade to Redis)

## Testing

```typescript
describe('DrugGenericsImportService', () => {
  let service: DrugGenericsImportService;

  beforeEach(() => {
    service = new DrugGenericsImportService(knex, fastify);
  });

  it('should generate Excel template', async () => {
    const buffer = await service.generateTemplate('excel');
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should validate duplicate codes', async () => {
    const result = await service.validateFile(csvBuffer, 'test.csv', 'csv');
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'DUPLICATE_CODE' }));
  });

  it('should import valid data', async () => {
    const validation = await service.validateFile(buffer, 'test.csv', 'csv');
    const import_result = await service.importData(validation.sessionId, {});
    expect(import_result.status).toBe('queued');
  });
});
```

## Integration with Auto-Discovery

The `@ImportService` decorator automatically registers the service:

```typescript
@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics',
  dependencies: [],
  priority: 1,
  tags: ['master-data', 'required'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  // ...
}
```

## File Naming Convention

For auto-discovery to work, files must follow the pattern:

```
apps/api/src/modules/{domain}/{subdomain}/{module}/{module}-import.service.ts
```

Example:

```
apps/api/src/modules/inventory/master-data/drug-generics/drug-generics-import.service.ts
```

## References

- [IImportService Interface](../types/import-service.types.ts)
- [Design Document](../../../../docs/features/system-initialization/AUTO_DISCOVERY_IMPORT_SYSTEM.md)
- [Import Service Decorator](../decorator/import-service.decorator.ts)
- [Registry Pattern](../registry/import-service-registry.ts)

## Future Enhancements

1. **WebSocket Progress**: Real-time progress updates via WebSocket
2. **Redis Sessions**: Persist sessions in Redis for multi-instance deployments
3. **Parallel Processing**: Worker threads for batch processing
4. **Import Scheduling**: Queue jobs for later execution
5. **Import Previews**: Preview transformations before commit
6. **Partial Rollback**: Rollback only failed records
7. **Custom Validation Rules**: Builder pattern for complex validation
8. **Import Templates**: Save and reuse import configurations
