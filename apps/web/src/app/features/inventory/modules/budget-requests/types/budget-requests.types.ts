// ===== CORE ENTITY TYPES =====

export type BudgetRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DEPT_APPROVED'
  | 'FINANCE_APPROVED'
  | 'REJECTED';

export interface BudgetRequest {
  id: number;
  request_number: string;
  fiscal_year: number;
  department_id: number;
  status: BudgetRequestStatus;
  total_requested_amount: number;
  justification?: string | null;
  submitted_by?: string | null;
  submitted_at?: string | null;
  dept_reviewed_by?: string | null;
  dept_reviewed_at?: string | null;
  dept_comments?: string | null;
  finance_reviewed_by?: string | null;
  finance_reviewed_at?: string | null;
  finance_comments?: string | null;
  rejection_reason?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  is_active?: boolean | null;
  items?: any[]; // Added to fix validation service error
}

export interface CreateBudgetRequestRequest {
  request_number: string;
  fiscal_year: number;
  department_id: number;
  status: string;
  total_requested_amount: number;
  justification?: string | null;
  submitted_by?: string | null;
  submitted_at?: string | null;
  dept_reviewed_by?: string | null;
  dept_reviewed_at?: string | null;
  dept_comments?: string | null;
  finance_reviewed_by?: string | null;
  finance_reviewed_at?: string | null;
  finance_comments?: string | null;
  rejection_reason?: string | null;
  created_by: string;
  deleted_at?: string | null;
  is_active?: boolean | null;
}

export interface UpdateBudgetRequestRequest {
  request_number?: string;
  fiscal_year?: number;
  department_id?: number;
  status?: string;
  total_requested_amount?: number;
  justification?: string | null;
  submitted_by?: string | null;
  submitted_at?: string | null;
  dept_reviewed_by?: string | null;
  dept_reviewed_at?: string | null;
  dept_comments?: string | null;
  finance_reviewed_by?: string | null;
  finance_reviewed_at?: string | null;
  finance_comments?: string | null;
  rejection_reason?: string | null;
  created_by?: string;
  deleted_at?: string | null;
  is_active?: boolean | null;
}

// ===== QUERY TYPES =====

export interface ListBudgetRequestQuery {
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
  // String filtering for request_number
  request_number?: string; // Exact match
  // Numeric filtering for fiscal_year
  fiscal_year?: number; // Exact match
  fiscal_year_min?: number; // Range start
  fiscal_year_max?: number; // Range end
  // Numeric filtering for department_id
  department_id?: number; // Exact match
  department_id_min?: number; // Range start
  department_id_max?: number; // Range end
  // Numeric filtering for total_requested_amount
  total_requested_amount?: number; // Exact match
  total_requested_amount_min?: number; // Range start
  total_requested_amount_max?: number; // Range end
  // String filtering for justification
  justification?: string; // Exact match
  // String filtering for submitted_by
  submitted_by?: string; // Exact match
  // Date/DateTime filtering for submitted_at
  submitted_at?: string; // ISO date string for exact match
  submitted_at_min?: string; // ISO date string for range start
  submitted_at_max?: string; // ISO date string for range end
  // String filtering for dept_reviewed_by
  dept_reviewed_by?: string; // Exact match
  // Date/DateTime filtering for dept_reviewed_at
  dept_reviewed_at?: string; // ISO date string for exact match
  dept_reviewed_at_min?: string; // ISO date string for range start
  dept_reviewed_at_max?: string; // ISO date string for range end
  // String filtering for dept_comments
  dept_comments?: string; // Exact match
  // String filtering for finance_reviewed_by
  finance_reviewed_by?: string; // Exact match
  // Date/DateTime filtering for finance_reviewed_at
  finance_reviewed_at?: string; // ISO date string for exact match
  finance_reviewed_at_min?: string; // ISO date string for range start
  finance_reviewed_at_max?: string; // ISO date string for range end
  // String filtering for finance_comments
  finance_comments?: string; // Exact match
  // String filtering for rejection_reason
  rejection_reason?: string; // Exact match
  // String filtering for created_by
  created_by?: string; // Exact match
  // Date/DateTime filtering for created_at
  created_at?: string; // ISO date string for exact match
  created_at_min?: string; // ISO date string for range start
  created_at_max?: string; // ISO date string for range end
  // Date/DateTime filtering for updated_at
  updated_at?: string; // ISO date string for exact match
  updated_at_min?: string; // ISO date string for range start
  updated_at_max?: string; // ISO date string for range end
  // Date/DateTime filtering for deleted_at
  deleted_at?: string; // ISO date string for exact match
  deleted_at_min?: string; // ISO date string for range start
  deleted_at_max?: string; // ISO date string for range end
  // Boolean filtering for is_active
  is_active?: boolean;
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

export interface ImportRowPreview extends Partial<BudgetRequest> {
  rowNumber: number;
  importStatus: 'valid' | 'warning' | 'error' | 'duplicate';
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

export type BudgetRequestField = keyof BudgetRequest;
export type BudgetRequestSortField = BudgetRequestField;

export interface BudgetRequestListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: BudgetRequestField[];
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
