/**
 * Import Configuration Interfaces
 * Shared configuration types for module-specific bulk import functionality
 */

/**
 * Severity level for validation errors
 */
export enum ImportValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Import validation error details
 */
export interface ImportValidationError {
  field: string;
  message: string;
  code: string;
  severity: ImportValidationSeverity;
  value?: any;
}

/**
 * Import row validation result
 */
export interface ImportRowValidation {
  row: number;
  isValid: boolean;
  errors: ImportValidationError[];
  warnings: ImportValidationError[];
  data?: any;
}

/**
 * Import validation summary
 */
export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalErrors: number;
  totalWarnings: number;
  canProceed: boolean;
}

/**
 * Import session data stored in memory/Redis
 */
export interface ImportSession {
  sessionId: string;
  fileName: string;
  fileType: 'excel' | 'csv';
  uploadedAt: Date;
  validatedRows: ImportRowValidation[];
  summary: ImportValidationSummary;
  expiresAt: Date;
}

/**
 * Import job status
 */
export enum ImportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Import job data for background processing
 */
export interface ImportJobData {
  jobId: string;
  sessionId: string;
  status: ImportJobStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  results?: any[];
}

/**
 * Field validator function type
 * Can be synchronous or asynchronous
 */
export type FieldValidator = (
  value: any,
  row: any,
  index: number,
) => ImportValidationError | null | Promise<ImportValidationError | null>;

/**
 * Field transformer function type (for preprocessing values)
 */
export type FieldTransformer = (value: any, row: any) => any;

/**
 * Example data generator function type
 */
export type ExampleGenerator = () => any;

/**
 * Configuration for a single field in import
 */
export interface ImportFieldConfig {
  /**
   * Field name in database/entity
   */
  name: string;

  /**
   * Display label for Excel/CSV header
   */
  label: string;

  /**
   * Whether field is required
   */
  required: boolean;

  /**
   * Field data type
   */
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'uuid' | 'url';

  /**
   * Custom validators for this field
   */
  validators?: FieldValidator[];

  /**
   * Transform value before validation
   */
  transformer?: FieldTransformer;

  /**
   * Example value generator for template
   */
  exampleGenerator?: ExampleGenerator;

  /**
   * Default example value if no generator provided
   */
  defaultExample?: any;

  /**
   * Description/help text for this field
   */
  description?: string;

  /**
   * Maximum length for string fields
   */
  maxLength?: number;

  /**
   * Minimum value for number fields
   */
  minValue?: number;

  /**
   * Maximum value for number fields
   */
  maxValue?: number;

  /**
   * Whether field is unique (will check for duplicates)
   */
  unique?: boolean;

  /**
   * Whether to allow null values (even if not required)
   */
  allowNull?: boolean;

  /**
   * Enum values if field is restricted to specific options
   */
  enumValues?: string[];

  /**
   * Custom error messages
   */
  errorMessages?: {
    required?: string;
    invalid?: string;
    unique?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Module-specific import configuration
 */
export interface ImportModuleConfig<T> {
  /**
   * Module name (e.g., 'authors', 'books')
   */
  moduleName: string;

  /**
   * Display name for UI (e.g., 'Authors', 'Books')
   */
  displayName: string;

  /**
   * Field configurations
   */
  fields: ImportFieldConfig[];

  /**
   * Maximum rows allowed in single import
   */
  maxRows?: number;

  /**
   * Whether to allow warnings (import with warnings)
   */
  allowWarnings?: boolean;

  /**
   * Custom row validator (validates entire row)
   */
  rowValidator?: (row: any, index: number) => ImportValidationError[];

  /**
   * Transform row data before database insert
   */
  rowTransformer?: (row: any) => Partial<T>;

  /**
   * Additional validation logic that runs after field validation
   */
  customValidation?: (
    rows: any[],
  ) => Promise<Map<number, ImportValidationError[]>>;

  /**
   * Pre-insert hook (e.g., check for existing records)
   */
  preInsertHook?: (rows: Partial<T>[]) => Promise<void>;

  /**
   * Post-insert hook (e.g., send notifications)
   */
  postInsertHook?: (results: T[]) => Promise<void>;

  /**
   * Custom error handler
   */
  errorHandler?: (error: Error, row: any, index: number) => void;

  /**
   * Session expiration time in minutes
   */
  sessionExpirationMinutes?: number;

  /**
   * Batch size for database inserts
   */
  batchSize?: number;
}

/**
 * Import template download options
 */
export interface ImportTemplateOptions {
  format: 'excel' | 'csv';
  includeExamples?: boolean;
  exampleRowCount?: number;
}

/**
 * Import validation request
 */
export interface ImportValidationRequest {
  file: Buffer;
  fileName: string;
  fileType: 'excel' | 'csv';
}

/**
 * Import validation response
 */
export interface ImportValidationResponse {
  sessionId: string;
  fileName: string;
  summary: ImportValidationSummary;
  errors: ImportRowValidation[];
  canProceed: boolean;
  expiresAt: Date;
}

/**
 * Import execution request
 */
export interface ImportExecutionRequest {
  sessionId: string;
  skipWarnings?: boolean;
}

/**
 * Import execution response
 */
export interface ImportExecutionResponse {
  jobId: string;
  status: ImportJobStatus;
  message: string;
}

/**
 * Import job status response
 */
export interface ImportJobStatusResponse {
  jobId: string;
  status: ImportJobStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}
