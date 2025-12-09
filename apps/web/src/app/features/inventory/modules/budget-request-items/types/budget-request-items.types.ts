// ===== CORE ENTITY TYPES =====

export interface BudgetRequestItem {
  id: number;
  budget_request_id: number;
  budget_id: number;
  requested_amount?: number | null;
  q1_qty: number;
  q2_qty: number;
  q3_qty: number;
  q4_qty: number;
  item_justification?: string | null;
  created_at: string;
  updated_at: string;
  drug_id?: number | null;
  generic_id?: number | null;
  generic_code?: string | null;
  generic_name?: string | null;
  package_size?: string | null;
  unit?: string | null;
  line_number?: number | null;
  avg_usage?: number | null;
  estimated_usage_2569?: number | null;
  current_stock?: number | null;
  estimated_purchase?: number | null;
  unit_price?: number | null;
  requested_qty?: number | null;
  budget_type_id?: number | null;
  budget_category_id?: number | null;
  historical_usage?: Record<string, any> | null;
}

export interface CreateBudgetRequestItemRequest {
  budget_request_id: number;
  budget_id: number;
  requested_amount?: number | null;
  q1_qty: number;
  q2_qty: number;
  q3_qty: number;
  q4_qty: number;
  item_justification?: string | null;
  drug_id?: number | null;
  generic_id?: number | null;
  generic_code?: string | null;
  generic_name?: string | null;
  package_size?: string | null;
  unit?: string | null;
  line_number?: number | null;
  avg_usage?: number | null;
  estimated_usage_2569?: number | null;
  current_stock?: number | null;
  estimated_purchase?: number | null;
  unit_price?: number | null;
  requested_qty?: number | null;
  budget_type_id?: number | null;
  budget_category_id?: number | null;
  historical_usage?: Record<string, any> | null;
}

export interface UpdateBudgetRequestItemRequest {
  budget_request_id?: number;
  budget_id?: number;
  requested_amount?: number | null;
  q1_qty?: number;
  q2_qty?: number;
  q3_qty?: number;
  q4_qty?: number;
  item_justification?: string | null;
  drug_id?: number | null;
  generic_id?: number | null;
  generic_code?: string | null;
  generic_name?: string | null;
  package_size?: string | null;
  unit?: string | null;
  line_number?: number | null;
  avg_usage?: number | null;
  estimated_usage_2569?: number | null;
  current_stock?: number | null;
  estimated_purchase?: number | null;
  unit_price?: number | null;
  requested_qty?: number | null;
  budget_type_id?: number | null;
  budget_category_id?: number | null;
  historical_usage?: Record<string, any> | null;
}

// ===== QUERY TYPES =====

export interface ListBudgetRequestItemQuery {
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
  // Numeric filtering for budget_request_id
  budget_request_id?: number; // Exact match
  budget_request_id_min?: number; // Range start
  budget_request_id_max?: number; // Range end
  // Numeric filtering for budget_id
  budget_id?: number; // Exact match
  budget_id_min?: number; // Range start
  budget_id_max?: number; // Range end
  // Numeric filtering for requested_amount
  requested_amount?: number; // Exact match
  requested_amount_min?: number; // Range start
  requested_amount_max?: number; // Range end
  // Numeric filtering for q1_qty
  q1_qty?: number; // Exact match
  q1_qty_min?: number; // Range start
  q1_qty_max?: number; // Range end
  // Numeric filtering for q2_qty
  q2_qty?: number; // Exact match
  q2_qty_min?: number; // Range start
  q2_qty_max?: number; // Range end
  // Numeric filtering for q3_qty
  q3_qty?: number; // Exact match
  q3_qty_min?: number; // Range start
  q3_qty_max?: number; // Range end
  // Numeric filtering for q4_qty
  q4_qty?: number; // Exact match
  q4_qty_min?: number; // Range start
  q4_qty_max?: number; // Range end
  // String filtering for item_justification
  item_justification?: string; // Exact match
  // Date/DateTime filtering for created_at
  created_at?: string; // ISO date string for exact match
  created_at_min?: string; // ISO date string for range start
  created_at_max?: string; // ISO date string for range end
  // Date/DateTime filtering for updated_at
  updated_at?: string; // ISO date string for exact match
  updated_at_min?: string; // ISO date string for range start
  updated_at_max?: string; // ISO date string for range end
  // Numeric filtering for drug_id
  drug_id?: number; // Exact match
  drug_id_min?: number; // Range start
  drug_id_max?: number; // Range end
  // Numeric filtering for generic_id
  generic_id?: number; // Exact match
  generic_id_min?: number; // Range start
  generic_id_max?: number; // Range end
  // String filtering for generic_code
  generic_code?: string; // Exact match
  // String filtering for generic_name
  generic_name?: string; // Exact match
  // String filtering for package_size
  package_size?: string; // Exact match
  // String filtering for unit
  unit?: string; // Exact match
  // Numeric filtering for line_number
  line_number?: number; // Exact match
  line_number_min?: number; // Range start
  line_number_max?: number; // Range end
  // Numeric filtering for avg_usage
  avg_usage?: number; // Exact match
  avg_usage_min?: number; // Range start
  avg_usage_max?: number; // Range end
  // Numeric filtering for estimated_usage_2569
  estimated_usage_2569?: number; // Exact match
  estimated_usage_2569_min?: number; // Range start
  estimated_usage_2569_max?: number; // Range end
  // Numeric filtering for current_stock
  current_stock?: number; // Exact match
  current_stock_min?: number; // Range start
  current_stock_max?: number; // Range end
  // Numeric filtering for estimated_purchase
  estimated_purchase?: number; // Exact match
  estimated_purchase_min?: number; // Range start
  estimated_purchase_max?: number; // Range end
  // Numeric filtering for unit_price
  unit_price?: number; // Exact match
  unit_price_min?: number; // Range start
  unit_price_max?: number; // Range end
  // Numeric filtering for requested_qty
  requested_qty?: number; // Exact match
  requested_qty_min?: number; // Range start
  requested_qty_max?: number; // Range end
  // Numeric filtering for budget_type_id
  budget_type_id?: number; // Exact match
  budget_type_id_min?: number; // Range start
  budget_type_id_max?: number; // Range end
  // Numeric filtering for budget_category_id
  budget_category_id?: number; // Exact match
  budget_category_id_min?: number; // Range start
  budget_category_id_max?: number; // Range end
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

export interface ImportRowPreview extends Partial<BudgetRequestItem> {
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

export type BudgetRequestItemField = keyof BudgetRequestItem;
export type BudgetRequestItemSortField = BudgetRequestItemField;

export interface BudgetRequestItemListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: BudgetRequestItemField[];
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
