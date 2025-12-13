# Import Service Types Reference

Complete type definitions for the Auto-Discovery Import System. All types are exported from `@/core/import`.

## Table of Contents

1. [Main Interfaces](#main-interfaces)
2. [Metadata Interfaces](#metadata-interfaces)
3. [Validation Types](#validation-types)
4. [Status Types](#status-types)
5. [Enums](#enums)
6. [Type Constraints](#type-constraints)

## Main Interfaces

### IImportService<T>

The main interface that all import services must implement.

```typescript
interface IImportService<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Get metadata about this import service
   */
  getMetadata(): ImportServiceMetadata;

  /**
   * Generate download template in CSV or Excel format
   * @param format - Output format: 'csv' or 'excel'
   * @returns Buffer containing the generated template
   */
  generateTemplate(format: 'csv' | 'excel'): Promise<Buffer>;

  /**
   * Get column definitions for the template
   * @returns Array of column definitions
   */
  getTemplateColumns(): TemplateColumn[];

  /**
   * Validate uploaded file and create session
   * Performs row-by-row validation and creates a validation session
   *
   * @param buffer - File contents as Buffer
   * @param fileName - Original file name
   * @param fileType - File format: 'csv' or 'excel'
   * @returns Validation result with session ID and errors
   */
  validateFile(buffer: Buffer, fileName: string, fileType: 'csv' | 'excel'): Promise<ValidationResult>;

  /**
   * Validate a single row during batch validation
   * @param row - Row data as object
   * @param rowNumber - 1-indexed row number
   * @returns Array of validation errors (empty if row is valid)
   */
  validateRow(row: any, rowNumber: number): Promise<ValidationError[]>;

  /**
   * Execute import from a validated session
   * @param sessionId - ID from validation session
   * @param options - Import execution options
   * @returns Job ID and status
   */
  importData(
    sessionId: string,
    options: ImportOptions,
  ): Promise<{
    jobId: string;
    status: 'queued' | 'running';
  }>;

  /**
   * Get current status of an import job
   * @param jobId - Job ID from importData()
   * @returns Current job status and progress
   */
  getImportStatus(jobId: string): Promise<ImportStatus>;

  /**
   * Check if an import job can be rolled back
   * @param jobId - Job ID to check
   * @returns true if rollback is supported and job is rollbackable
   */
  canRollback(jobId: string): Promise<boolean>;

  /**
   * Rollback a completed import job
   * @param jobId - Job ID to rollback
   * @throws Error if rollback not supported or job cannot be rolled back
   */
  rollback(jobId: string): Promise<void>;

  /**
   * Get import history for this module
   * @param limit - Maximum number of records (default: 50)
   * @returns Historical import records
   */
  getImportHistory(limit?: number): Promise<ImportHistoryRecord[]>;
}
```

**Type Parameter:**

- `T` - The entity type being imported
  - Constraint: `extends Record<string, unknown>`
  - Default: `Record<string, unknown>`
  - Example: `IImportService<DrugGeneric>`

## Metadata Interfaces

### ImportServiceMetadata

Metadata stored for each registered import service.

```typescript
interface ImportServiceMetadata {
  /** Unique module identifier (e.g., 'drug_generics') */
  module: string;

  /** Domain/area (e.g., 'inventory', 'core', 'hr') */
  domain: string;

  /** Subdomain/category within domain (e.g., 'master-data', 'operations') */
  subdomain?: string;

  /** Display name for UI (e.g., 'Drug Generics (ยาหลัก)') */
  displayName: string;

  /** Optional description of what this module imports */
  description?: string;

  /** Module dependencies - list of module names that must be imported first */
  dependencies: string[];

  /** Import priority (1 = highest priority, import first) */
  priority: number;

  /** Tags for categorization and filtering (e.g., ['master-data', 'required']) */
  tags: string[];

  /** Whether this module supports rollback of completed imports */
  supportsRollback: boolean;

  /** Version of the import service (semantic versioning: x.y.z) */
  version: string;

  /** Service class constructor (for instantiation) */
  target?: new (...args: any[]) => IImportService;

  /** File path where service is defined */
  filePath?: string;
}
```

### ImportServiceOptions

Options passed to the @ImportService decorator.

```typescript
interface ImportServiceOptions {
  /** Unique module identifier (e.g., 'drug_generics') */
  module: string;

  /** Domain/area (e.g., 'inventory') */
  domain: string;

  /** Subdomain/category (e.g., 'master-data') */
  subdomain?: string;

  /** Display name for UI (e.g., 'Drug Generics (ยาหลัก)') */
  displayName: string;

  /** Optional description */
  description?: string;

  /** Module dependencies (list of module names) */
  dependencies: string[];

  /** Import priority (1 = highest) */
  priority: number;

  /** Tags for categorization */
  tags: string[];

  /** Whether rollback is supported */
  supportsRollback: boolean;

  /** Service version (semantic versioning) */
  version: string;
}
```

### RegisteredImportService

A service with all its metadata and instance.

```typescript
interface RegisteredImportService {
  /** Service metadata */
  metadata: ImportServiceMetadata;

  /** Service instance (after initialization) */
  instance: IImportService;

  /** File path where service is defined */
  filePath: string;
}
```

## Validation Types

### TemplateColumn

Definition of a single column in an import template.

```typescript
interface TemplateColumn {
  /** Field name in database/entity */
  name: string;

  /** Display name for Excel/CSV header */
  displayName?: string;

  /** Whether field is required */
  required: boolean;

  /** Field data type */
  type: 'string' | 'number' | 'boolean' | 'date';

  /** Maximum length for string fields */
  maxLength?: number;

  /** Minimum value for number fields */
  minValue?: number;

  /** Maximum value for number fields */
  maxValue?: number;

  /** Regex pattern for validation */
  pattern?: string;

  /** Allowed enum values */
  enumValues?: string[];

  /** Description/help text */
  description?: string;

  /** Example value */
  example?: string;
}
```

### ValidationError

An error or warning from validation.

```typescript
interface ValidationError {
  /** Row number in file (1-indexed) */
  row: number;

  /** Field name that caused the error */
  field: string;

  /** Error message */
  message: string;

  /** Severity level */
  severity: 'ERROR' | 'WARNING' | 'INFO';

  /** Error code for machine-readable identification */
  code: string;
}
```

### ValidationWarning

A warning from validation (extends ValidationError).

```typescript
interface ValidationWarning extends ValidationError {
  severity: 'WARNING';
}
```

### ValidationResult

Result from validating an import file.

```typescript
interface ValidationResult {
  /** Unique session ID for this validation */
  sessionId: string;

  /** Whether validation passed (true if only warnings) */
  isValid: boolean;

  /** List of validation errors */
  errors: ValidationError[];

  /** List of validation warnings */
  warnings: ValidationWarning[];

  /** Validation statistics */
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };

  /** When this validation session expires */
  expiresAt?: Date;

  /** Whether import can proceed (no errors, or only warnings if skipWarnings=true) */
  canProceed: boolean;
}
```

## Status Types

### ImportOptions

Options for executing an import.

```typescript
interface ImportOptions {
  /** Skip warnings and proceed with import */
  skipWarnings?: boolean;

  /** Batch size for database inserts (default: 100) */
  batchSize?: number;

  /** How to handle conflicts: skip, update, or error (default: 'skip') */
  onConflict?: 'skip' | 'update' | 'error';
}
```

### ImportStatus

Status of an import job.

```typescript
interface ImportStatus {
  /** Job ID */
  jobId: string;

  /** Current job status */
  status: ImportJobStatus;

  /** Import progress information */
  progress?: {
    totalRows: number;
    importedRows: number;
    errorRows: number;
    currentRow: number;
    percentComplete: number;
  };

  /** When job started */
  startedAt?: Date;

  /** Estimated completion time */
  estimatedCompletion?: Date;

  /** Error message if failed */
  error?: string;
}
```

### ImportHistoryRecord

Historical record of a completed import.

```typescript
interface ImportHistoryRecord {
  /** Unique job ID */
  jobId: string;

  /** Module name that was imported */
  moduleName: string;

  /** Job status (completed, failed, rolled_back) */
  status: ImportJobStatus;

  /** Number of records imported */
  recordsImported: number;

  /** When import completed */
  completedAt: Date;

  /** User who performed the import */
  importedBy: {
    id: string;
    name: string;
  };
}
```

## Enums

### ImportJobStatus

Status of an import job throughout its lifecycle.

```typescript
enum ImportJobStatus {
  /** Job is queued waiting to be processed */
  PENDING = 'pending',

  /** Job is currently running */
  RUNNING = 'running',

  /** Job completed successfully */
  COMPLETED = 'completed',

  /** Job failed with error */
  FAILED = 'failed',

  /** Job was rolled back */
  ROLLED_BACK = 'rolled_back',
}
```

### ImportValidationSeverity

Severity level for validation messages.

```typescript
enum ImportValidationSeverity {
  /** Critical error - import cannot proceed */
  ERROR = 'ERROR',

  /** Warning - import can proceed but should be reviewed */
  WARNING = 'WARNING',

  /** Informational message */
  INFO = 'INFO',
}
```

### ImportServiceStatus

Status of a service in the registry.

```typescript
type ImportServiceStatus =
  | 'not_started' // No import has been run
  | 'in_progress' // Import is currently running
  | 'completed' // Import completed successfully
  | 'error'; // Last import failed
```

## Type Constraints

### No `any` Types

All types are properly constrained with no `any` usage:

#### IImportService<T>

```typescript
// ✓ Proper constraint
interface IImportService<T extends Record<string, unknown> = Record<string, unknown>> {
  // ...
}

// ✓ Usage
class MyService extends BaseImportService<DrugGeneric> {}
const service: IImportService<DrugGeneric> = myService;
```

#### ImportServiceMetadata.target

```typescript
// ✓ Proper constructor typing
target?: new (...args: any[]) => IImportService;

// ✓ Usage
const instance = new metadata.target(db, fastify);
```

### Generic Bounds

All generics have explicit bounds:

```typescript
// Service type parameter bound to Record
interface IImportService<T extends Record<string, unknown> = Record<string, unknown>>

// Example usage
interface DrugGeneric extends Record<string, unknown> {
  id: string;
  code: string;
  nameEn: string;
  nameTh: string;
}

class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  // T is now properly typed as DrugGeneric
}
```

## Type Inference Examples

### Inferring from Service Instance

```typescript
import { getServiceInstance } from '@/core/import';

const service = getServiceInstance('drug_generics');
if (service) {
  // service is typed as IImportService<unknown>
  const metadata = service.getMetadata();
  const columns = service.getTemplateColumns();
}
```

### Inferring from Metadata

```typescript
import { getServiceMetadata } from '@/core/import';

const metadata = getServiceMetadata('drug_generics');
if (metadata) {
  // metadata is properly typed as ImportServiceMetadata
  console.log(metadata.module); // string
  console.log(metadata.priority); // number
  console.log(metadata.dependencies); // string[]
}
```

### Type Guards

```typescript
import { isImportService, getImportServiceMetadata } from '@/core/import';

function processService(cls: any) {
  if (!isImportService(cls)) {
    return; // cls is not an import service
  }

  const metadata = getImportServiceMetadata(cls);
  // metadata is now known to be ImportServiceMetadata (not undefined)
  console.log(metadata.module);
}
```

## Common Type Patterns

### Validating Dependencies

```typescript
async function validateDependencies(service: ImportServiceMetadata): Promise<string[]> {
  const missingDeps: string[] = [];

  for (const dep of service.dependencies) {
    const depService = getServiceMetadata(dep);
    if (!depService) {
      missingDeps.push(dep);
    }
  }

  return missingDeps;
}
```

### Filtering by Status

```typescript
function getCompletedServices(services: RegisteredImportService[]): RegisteredImportService[] {
  return services.filter((s) => s.metadata.displayName && s.instance !== undefined);
}
```

### Building Dependency Graph

```typescript
function buildDependencyGraph(services: ImportServiceMetadata[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  for (const service of services) {
    graph.set(service.module, new Set(service.dependencies));
  }

  return graph;
}
```

## Type Safety Benefits

1. **Compile-Time Checking** - TypeScript catches errors before runtime
2. **IDE Support** - Full autocomplete and type hints
3. **Refactoring Safety** - Type changes propagate throughout code
4. **Self-Documenting** - Types serve as documentation
5. **Zero Runtime Overhead** - Types are erased at compile time

## Export Statements

```typescript
// Import from core module
import { IImportService, ImportServiceMetadata, ImportServiceOptions, TemplateColumn, ValidationError, ValidationWarning, ValidationResult, ImportStatus, ImportOptions, ImportHistoryRecord, RegisteredImportService, ImportJobStatus, ImportValidationSeverity, ImportServiceStatus, ImportService, getImportServiceMetadata, isImportService, getImportServiceRegistry, getServiceMetadata, getServiceInstance, getAllRegisteredServices, ImportServiceRegistry } from '@/core/import';
```

---

**For more information:**

- See `README.md` for architecture overview
- See `USAGE_EXAMPLES.md` for practical examples
- Check design doc for complete system design
