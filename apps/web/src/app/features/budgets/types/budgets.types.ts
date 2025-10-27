// ===== CORE ENTITY TYPES =====

export interface Budget {
  id: number;
  budget_code: string;
  budget_type: string;
  budget_category: string;
  budget_description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateBudgetRequest {
  budget_code: string;
  budget_type: string;
  budget_category: string;
  budget_description?: string | null;
  is_active: boolean;
}

export interface UpdateBudgetRequest {
  budget_code?: string;
  budget_type?: string;
  budget_category?: string;
  budget_description?: string | null;
  is_active?: boolean;
}

// ===== QUERY TYPES =====

export interface ListBudgetQuery {
  // Pagination
  page?: number;
  limit?: number;
  
  // Search
  search?: string;
  
  // Sort
  sort?: string; // Multiple sort support: field1:desc,field2:asc
  
  // Field selection
  fields?: string[]; // Array of field names to return
  
  // Include related data
  include?: string | string[];
  
  // Smart field-based filters
  // String filtering for budget_code
  budget_code?: string; // Exact match
    // String filtering for budget_type
  budget_type?: string; // Exact match
    // String filtering for budget_category
  budget_category?: string; // Exact match
    // String filtering for budget_description
  budget_description?: string; // Exact match
    // Boolean filtering for is_active
  is_active?: boolean;
  // Date/DateTime filtering for created_at
  created_at?: string; // ISO date string for exact match
  created_at_min?: string; // ISO date string for range start
  created_at_max?: string; // ISO date string for range end
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    environment: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    environment: string;
  };
}



// ===== IMPORT TYPES =====

export interface ImportOptions {
  skipDuplicates?: boolean;
  continueOnError?: boolean;
  updateExisting?: boolean;
  dryRun?: boolean;
}

export interface ImportError {
  field: string;
  message: string;
  code?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ImportRowPreview extends Partial<Budget> {
  rowNumber: number;
  status: 'valid' | 'warning' | 'error' | 'duplicate';
  action: 'create' | 'update' | 'skip';
  errors: ImportError[];
  warnings: ImportError[];
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  warnings?: number;
  willCreate?: number;
  willUpdate?: number;
  willSkip?: number;
  successful?: number;
  failed?: number;
  skipped?: number;
  created?: number;
  updated?: number;
}

export interface ValidateImportResponse {
  sessionId: string;
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  summary: ImportSummary;
  preview: ImportRowPreview[];
  expiresAt: string;
}

export interface ExecuteImportRequest {
  sessionId: string;
  options?: ImportOptions;
}

export interface ImportProgress {
  total: number;
  current: number;
  percentage: number;
}

export interface ImportJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // Progress percentage (0-100)
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// ===== UTILITY TYPES =====

export type BudgetField = keyof Budget;
export type BudgetSortField = BudgetField;

export interface BudgetListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: BudgetField[];
  search?: string;
}

// ===== BASIC BULK OPERATIONS =====

export interface BulkResponse {
  success: boolean;
  created?: number;
  updated?: number;
  deleted?: number;
  errors?: any[];
  message?: string;
}
