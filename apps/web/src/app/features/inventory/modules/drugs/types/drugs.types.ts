// ===== CORE ENTITY TYPES =====

export interface Drug {
  id: number;
  drug_code: string;
  trade_name: string;
  generic_id: number;
  manufacturer_id: number;
  tmt_tpu_id?: number | null;
  nlem_status: string;
  drug_status: string;
  product_category: string;
  status_changed_date?: string | null;
  unit_price?: number | null;
  package_size?: number | null;
  package_unit?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateDrugRequest {
  drug_code: string;
  trade_name: string;
  generic_id: number;
  manufacturer_id: number;
  tmt_tpu_id?: number | null;
  nlem_status: string;
  drug_status: string;
  product_category: string;
  status_changed_date?: string | null;
  unit_price?: number | null;
  package_size?: number | null;
  package_unit?: string | null;
  is_active?: boolean | null;
}

export interface UpdateDrugRequest {
  drug_code?: string;
  trade_name?: string;
  generic_id?: number;
  manufacturer_id?: number;
  tmt_tpu_id?: number | null;
  nlem_status?: string;
  drug_status?: string;
  product_category?: string;
  status_changed_date?: string | null;
  unit_price?: number | null;
  package_size?: number | null;
  package_unit?: string | null;
  is_active?: boolean | null;
}

// ===== QUERY TYPES =====

export interface ListDrugQuery {
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
  // String filtering for drug_code
  drug_code?: string; // Exact match
  // String filtering for trade_name
  trade_name?: string; // Exact match
  // Numeric filtering for generic_id
  generic_id?: number; // Exact match
  generic_id_min?: number; // Range start
  generic_id_max?: number; // Range end
  // Numeric filtering for manufacturer_id
  manufacturer_id?: number; // Exact match
  manufacturer_id_min?: number; // Range start
  manufacturer_id_max?: number; // Range end
  // Numeric filtering for tmt_tpu_id
  tmt_tpu_id?: number; // Exact match
  tmt_tpu_id_min?: number; // Range start
  tmt_tpu_id_max?: number; // Range end
  // Date/DateTime filtering for status_changed_date
  status_changed_date?: string; // ISO date string for exact match
  status_changed_date_min?: string; // ISO date string for range start
  status_changed_date_max?: string; // ISO date string for range end
  // Numeric filtering for unit_price
  unit_price?: number; // Exact match
  unit_price_min?: number; // Range start
  unit_price_max?: number; // Range end
  // Numeric filtering for package_size
  package_size?: number; // Exact match
  package_size_min?: number; // Range start
  package_size_max?: number; // Range end
  // String filtering for package_unit
  package_unit?: string; // Exact match
  // Boolean filtering for is_active
  is_active?: boolean;
  // Date/DateTime filtering for created_at
  created_at?: string; // ISO date string for exact match
  created_at_min?: string; // ISO date string for range start
  created_at_max?: string; // ISO date string for range end
  // Date/DateTime filtering for updated_at
  updated_at?: string; // ISO date string for exact match
  updated_at_min?: string; // ISO date string for range start
  updated_at_max?: string; // ISO date string for range end
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

export interface ImportRowPreview extends Partial<Drug> {
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

export type DrugField = keyof Drug;
export type DrugSortField = DrugField;

export interface DrugListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: DrugField[];
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
