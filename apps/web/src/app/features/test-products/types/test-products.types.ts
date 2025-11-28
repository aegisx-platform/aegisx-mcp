// ===== CORE ENTITY TYPES =====

export interface TestProduct {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  display_order?: number | null;
  item_count?: number | null;
  discount_rate?: number | null;
  metadata?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  status?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTestProductRequest {
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  display_order?: number | null;
  item_count?: number | null;
  discount_rate?: number | null;
  metadata?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  status?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface UpdateTestProductRequest {
  code?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  display_order?: number | null;
  item_count?: number | null;
  discount_rate?: number | null;
  metadata?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  status?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

// ===== QUERY TYPES =====

export interface ListTestProductQuery {
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
  // String filtering for code
  code?: string; // Exact match
  // String filtering for name
  name?: string; // Exact match
  // String filtering for slug
  slug?: string; // Exact match
  // String filtering for description
  description?: string; // Exact match
  // Boolean filtering for is_active
  is_active?: boolean;
  // Boolean filtering for is_featured
  is_featured?: boolean;
  // Numeric filtering for display_order
  display_order?: number; // Exact match
  display_order_min?: number; // Range start
  display_order_max?: number; // Range end
  // Numeric filtering for item_count
  item_count?: number; // Exact match
  item_count_min?: number; // Range start
  item_count_max?: number; // Range end
  // Numeric filtering for discount_rate
  discount_rate?: number; // Exact match
  discount_rate_min?: number; // Range start
  discount_rate_max?: number; // Range end
  // String filtering for status
  status?: string; // Exact match
  // String filtering for created_by
  created_by?: string; // Exact match
  // String filtering for updated_by
  updated_by?: string; // Exact match
  // Date/DateTime filtering for deleted_at
  deleted_at?: string; // ISO date string for exact match
  deleted_at_min?: string; // ISO date string for range start
  deleted_at_max?: string; // ISO date string for range end
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

// ===== ENHANCED TYPES =====

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownResponse {
  options: DropdownOption[];
  total: number;
}

export interface BulkOperationSummary {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
    data?: any;
  }>;
}

export interface BulkResponse {
  success: boolean;
  data: TestProduct[];
  summary: BulkOperationSummary;
  message: string;
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

export interface ImportRowPreview extends Partial<TestProduct> {
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

export type TestProductField = keyof TestProduct;
export type TestProductSortField = TestProductField;

export interface TestProductListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: TestProductField[];
  search?: string;
}
