// ===== CORE ENTITY TYPES =====

export interface TestProduct {
  id: string;
  sku: string;
  name: string;
  barcode?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  long_description?: string | null;
  specifications?: string | null;
  quantity?: number | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  price: number;
  cost?: number | null;
  weight?: number | null;
  discount_percentage?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_taxable?: boolean | null;
  is_shippable?: boolean | null;
  allow_backorder?: boolean | null;
  status?: string | null;
  condition?: string | null;
  availability?: string | null;
  launch_date?: string | null;
  discontinued_date?: string | null;
  last_stock_check?: string | null;
  next_restock_date?: string | null;
  attributes?: Record<string, any> | null;
  tags?: Record<string, any> | null;
  images?: Record<string, any> | null;
  pricing_tiers?: Record<string, any> | null;
  dimensions?: Record<string, any> | null;
  seo_metadata?: Record<string, any> | null;
  category_id: string;
  parent_product_id?: string | null;
  supplier_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTestProductRequest {
  sku: string;
  name: string;
  barcode?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  long_description?: string | null;
  specifications?: string | null;
  quantity?: number | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  price: number;
  cost?: number | null;
  weight?: number | null;
  discount_percentage?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_taxable?: boolean | null;
  is_shippable?: boolean | null;
  allow_backorder?: boolean | null;
  status?: string | null;
  condition?: string | null;
  availability?: string | null;
  launch_date?: string | null;
  discontinued_date?: string | null;
  last_stock_check?: string | null;
  next_restock_date?: string | null;
  attributes?: Record<string, any> | null;
  tags?: Record<string, any> | null;
  images?: Record<string, any> | null;
  pricing_tiers?: Record<string, any> | null;
  dimensions?: Record<string, any> | null;
  seo_metadata?: Record<string, any> | null;
  category_id: string;
  parent_product_id?: string | null;
  supplier_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface UpdateTestProductRequest {
  sku?: string;
  name?: string;
  barcode?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  long_description?: string | null;
  specifications?: string | null;
  quantity?: number | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  price?: number;
  cost?: number | null;
  weight?: number | null;
  discount_percentage?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_taxable?: boolean | null;
  is_shippable?: boolean | null;
  allow_backorder?: boolean | null;
  status?: string | null;
  condition?: string | null;
  availability?: string | null;
  launch_date?: string | null;
  discontinued_date?: string | null;
  last_stock_check?: string | null;
  next_restock_date?: string | null;
  attributes?: Record<string, any> | null;
  tags?: Record<string, any> | null;
  images?: Record<string, any> | null;
  pricing_tiers?: Record<string, any> | null;
  dimensions?: Record<string, any> | null;
  seo_metadata?: Record<string, any> | null;
  category_id?: string;
  parent_product_id?: string | null;
  supplier_id?: string | null;
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
  // String filtering for sku
  sku?: string; // Exact match
  // String filtering for name
  name?: string; // Exact match
  // String filtering for barcode
  barcode?: string; // Exact match
  // String filtering for manufacturer
  manufacturer?: string; // Exact match
  // String filtering for description
  description?: string; // Exact match
  // String filtering for long_description
  long_description?: string; // Exact match
  // String filtering for specifications
  specifications?: string; // Exact match
  // Numeric filtering for quantity
  quantity?: number; // Exact match
  quantity_min?: number; // Range start
  quantity_max?: number; // Range end
  // Numeric filtering for min_quantity
  min_quantity?: number; // Exact match
  min_quantity_min?: number; // Range start
  min_quantity_max?: number; // Range end
  // Numeric filtering for max_quantity
  max_quantity?: number; // Exact match
  max_quantity_min?: number; // Range start
  max_quantity_max?: number; // Range end
  // Numeric filtering for price
  price?: number; // Exact match
  price_min?: number; // Range start
  price_max?: number; // Range end
  // Numeric filtering for cost
  cost?: number; // Exact match
  cost_min?: number; // Range start
  cost_max?: number; // Range end
  // Numeric filtering for weight
  weight?: number; // Exact match
  weight_min?: number; // Range start
  weight_max?: number; // Range end
  // Numeric filtering for discount_percentage
  discount_percentage?: number; // Exact match
  discount_percentage_min?: number; // Range start
  discount_percentage_max?: number; // Range end
  // Boolean filtering for is_active
  is_active?: boolean;
  // Boolean filtering for is_featured
  is_featured?: boolean;
  // Boolean filtering for is_taxable
  is_taxable?: boolean;
  // Boolean filtering for is_shippable
  is_shippable?: boolean;
  // Boolean filtering for allow_backorder
  allow_backorder?: boolean;
  // String filtering for status
  status?: string; // Exact match
  // String filtering for condition
  condition?: string; // Exact match
  // String filtering for availability
  availability?: string; // Exact match
  // Date/DateTime filtering for launch_date
  launch_date?: string; // ISO date string for exact match
  launch_date_min?: string; // ISO date string for range start
  launch_date_max?: string; // ISO date string for range end
  // Date/DateTime filtering for discontinued_date
  discontinued_date?: string; // ISO date string for exact match
  discontinued_date_min?: string; // ISO date string for range start
  discontinued_date_max?: string; // ISO date string for range end
  // Date/DateTime filtering for last_stock_check
  last_stock_check?: string; // ISO date string for exact match
  last_stock_check_min?: string; // ISO date string for range start
  last_stock_check_max?: string; // ISO date string for range end
  // Date/DateTime filtering for next_restock_date
  next_restock_date?: string; // ISO date string for exact match
  next_restock_date_min?: string; // ISO date string for range start
  next_restock_date_max?: string; // ISO date string for range end
  // String filtering for category_id
  category_id?: string; // Exact match
  // String filtering for parent_product_id
  parent_product_id?: string; // Exact match
  // String filtering for supplier_id
  supplier_id?: string; // Exact match
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

// ===== BASIC BULK OPERATIONS =====

export interface BulkResponse {
  success: boolean;
  created?: number;
  updated?: number;
  deleted?: number;
  errors?: any[];
  message?: string;
}
