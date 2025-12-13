/**
 * Import Service Types and Interfaces
 * Type-safe definitions for the Auto-Discovery Import System
 * Supports 30+ modules with dependency-aware ordering and comprehensive audit trails
 */

/**
 * Context information about the authenticated user performing an import operation
 * Used to track who performed each import for complete audit trails
 */
export interface ImportContext {
  /** User ID from authentication token */
  userId: string;

  /** User's display name (optional) */
  userName?: string;

  /** Client IP address (optional) */
  ipAddress?: string;

  /** User-Agent header (optional) */
  userAgent?: string;
}

/**
 * Severity level for import validation messages
 */
export enum ImportValidationSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/**
 * Status of an import job
 */
export enum ImportJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

/**
 * Status of an import service in the registry
 */
export type ImportServiceStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'error';

/**
 * Template column definition for import file
 */
export interface TemplateColumn {
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

/**
 * Validation error details
 */
export interface ValidationError {
  /** Row number in file (1-indexed) */
  row: number;

  /** Field name */
  field: string;

  /** Error message */
  message: string;

  /** Severity level */
  severity: 'ERROR' | 'WARNING' | 'INFO';

  /** Error code for machine-readable identification */
  code: string;
}

/**
 * Warning from validation (extends ValidationError structure)
 */
export interface ValidationWarning extends ValidationError {
  severity: 'WARNING';
}

/**
 * Validation result for a file
 */
export interface ValidationResult {
  /** Unique session ID for this validation */
  sessionId: string;

  /** Whether validation passed */
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

  /** Whether import can proceed */
  canProceed: boolean;
}

/**
 * Options for import execution
 */
export interface ImportOptions {
  /** Skip warnings and proceed with import */
  skipWarnings?: boolean;

  /** Batch size for database inserts */
  batchSize?: number;

  /** How to handle conflicts: skip, update, or error */
  onConflict?: 'skip' | 'update' | 'error';
}

/**
 * Status of an import job
 */
export interface ImportStatus {
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

/**
 * Historical record of an import
 */
export interface ImportHistoryRecord {
  /** Unique job ID */
  jobId: string;

  /** Module name that was imported */
  moduleName: string;

  /** Job status */
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

/**
 * Metadata stored for an import service
 */
export interface ImportServiceMetadata {
  /** Unique module identifier (e.g., 'drug_generics') */
  module: string;

  /** Domain/area (e.g., 'inventory') */
  domain: string;

  /** Subdomain/category within domain (e.g., 'master-data') */
  subdomain?: string;

  /** Display name for UI (e.g., 'Drug Generics (ยาหลัก)') */
  displayName: string;

  /** Optional description of this module */
  description?: string;

  /** Module dependencies (list of module names) */
  dependencies: string[];

  /** Import priority (1 = highest, import first) */
  priority: number;

  /** Tags for categorization and filtering */
  tags: string[];

  /** Whether this module supports rollback */
  supportsRollback: boolean;

  /** Version of the import service */
  version: string;

  /** Service class constructor (for instantiation) */
  target?: new (...args: any[]) => IImportService;

  /** File path where service is defined */
  filePath?: string;
}

/**
 * Interface that import services must implement
 * Generic parameter T represents the entity type being imported
 */
export interface IImportService<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Get metadata about this import service
   */
  getMetadata(): ImportServiceMetadata;

  /**
   * Generate download template in CSV or Excel format
   */
  generateTemplate(format: 'csv' | 'excel'): Promise<Buffer>;

  /**
   * Get column definitions for the template
   */
  getTemplateColumns(): TemplateColumn[];

  /**
   * Validate uploaded file and create session
   */
  validateFile(
    buffer: Buffer,
    fileName: string,
    fileType: 'csv' | 'excel',
    context: ImportContext,
  ): Promise<ValidationResult>;

  /**
   * Validate a single row during batch validation
   */
  validateRow(row: any, rowNumber: number): Promise<ValidationError[]>;

  /**
   * Execute import from a validated session
   */
  importData(
    sessionId: string,
    options: ImportOptions,
    context: ImportContext,
  ): Promise<{
    jobId: string;
    status: 'queued' | 'running';
  }>;

  /**
   * Get current status of an import job
   */
  getImportStatus(jobId: string): Promise<ImportStatus>;

  /**
   * Check if an import job can be rolled back
   */
  canRollback(jobId: string): Promise<boolean>;

  /**
   * Rollback a completed import job
   */
  rollback(jobId: string, context: ImportContext): Promise<void>;

  /**
   * Get import history for this module
   */
  getImportHistory(limit?: number): Promise<ImportHistoryRecord[]>;
}

/**
 * Registered import service with metadata and instance
 */
export interface RegisteredImportService {
  /** Service metadata */
  metadata: ImportServiceMetadata;

  /** Service instance */
  instance: IImportService;

  /** File path where service is defined */
  filePath: string;
}

/**
 * Options for @ImportService decorator
 */
export interface ImportServiceOptions {
  /** Unique module identifier */
  module: string;

  /** Domain/area */
  domain: string;

  /** Subdomain/category */
  subdomain?: string;

  /** Display name for UI */
  displayName: string;

  /** Optional description */
  description?: string;

  /** Module dependencies */
  dependencies: string[];

  /** Import priority (1 = highest) */
  priority: number;

  /** Tags for categorization */
  tags: string[];

  /** Whether rollback is supported */
  supportsRollback: boolean;

  /** Service version */
  version: string;
}
