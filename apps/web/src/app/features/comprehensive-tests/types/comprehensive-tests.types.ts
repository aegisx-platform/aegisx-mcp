// ===== CORE ENTITY TYPES =====

export interface ComprehensiveTest {
  id: string;
  title: string;
  description?: string | null;
  slug?: string | null;
  short_code?: string | null;
  price?: number | null;
  quantity?: number | null;
  weight?: number | null;
  rating?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_available?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  expires_at?: string | null;
  start_time?: string | null;
  metadata?: Record<string, any> | null;
  tags?: string | null;
  ip_address?: string | null;
  website_url?: string | null;
  email_address?: string | null;
  status?: string | null;
  priority?: string | null;
  content?: string | null;
  notes?: string | null;
}

export interface CreateComprehensiveTestRequest {
  title: string;
  description?: string | null;
  slug?: string | null;
  short_code?: string | null;
  price?: number | null;
  quantity?: number | null;
  weight?: number | null;
  rating?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_available?: boolean | null;
  published_at?: string | null;
  expires_at?: string | null;
  start_time?: string | null;
  metadata?: Record<string, any> | null;
  tags?: string | null;
  ip_address?: string | null;
  website_url?: string | null;
  email_address?: string | null;
  status?: string | null;
  priority?: string | null;
  content?: string | null;
  notes?: string | null;
}

export interface UpdateComprehensiveTestRequest {
  title?: string;
  description?: string | null;
  slug?: string | null;
  short_code?: string | null;
  price?: number | null;
  quantity?: number | null;
  weight?: number | null;
  rating?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_available?: boolean | null;
  published_at?: string | null;
  expires_at?: string | null;
  start_time?: string | null;
  metadata?: Record<string, any> | null;
  tags?: string | null;
  ip_address?: string | null;
  website_url?: string | null;
  email_address?: string | null;
  status?: string | null;
  priority?: string | null;
  content?: string | null;
  notes?: string | null;
}

// ===== QUERY TYPES =====

export interface ListComprehensiveTestQuery {
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
  // String filtering for title
  title?: string; // Exact match
  // String filtering for description
  description?: string; // Exact match
  // String filtering for slug
  slug?: string; // Exact match
  // String filtering for short_code
  short_code?: string; // Exact match
  // Numeric filtering for price
  price?: number; // Exact match
  price_min?: number; // Range start
  price_max?: number; // Range end
  // Numeric filtering for quantity
  quantity?: number; // Exact match
  quantity_min?: number; // Range start
  quantity_max?: number; // Range end
  // Numeric filtering for weight
  weight?: number; // Exact match
  weight_min?: number; // Range start
  weight_max?: number; // Range end
  // Numeric filtering for rating
  rating?: number; // Exact match
  rating_min?: number; // Range start
  rating_max?: number; // Range end
  // Boolean filtering for is_active
  is_active?: boolean;
  // Boolean filtering for is_featured
  is_featured?: boolean;
  // Boolean filtering for is_available
  is_available?: boolean;
  // Date/DateTime filtering for created_at
  created_at?: string; // ISO date string for exact match
  created_at_min?: string; // ISO date string for range start
  created_at_max?: string; // ISO date string for range end
  // Date/DateTime filtering for updated_at
  updated_at?: string; // ISO date string for exact match
  updated_at_min?: string; // ISO date string for range start
  updated_at_max?: string; // ISO date string for range end
  // Date/DateTime filtering for published_at
  published_at?: string; // ISO date string for exact match
  published_at_min?: string; // ISO date string for range start
  published_at_max?: string; // ISO date string for range end
  // String filtering for start_time
  start_time?: string; // Exact match
  // String filtering for website_url
  website_url?: string; // Exact match
  // String filtering for email_address
  email_address?: string; // Exact match
  // String filtering for status
  status?: string; // Exact match
  // String filtering for priority
  priority?: string; // Exact match
  // String filtering for content
  content?: string; // Exact match
  // String filtering for notes
  notes?: string; // Exact match
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
  data: ComprehensiveTest[];
  summary: BulkOperationSummary;
  message: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    environment: string;
  };
}

// ===== UTILITY TYPES =====

export type ComprehensiveTestField = keyof ComprehensiveTest;
export type ComprehensiveTestSortField = ComprehensiveTestField;

export interface ComprehensiveTestListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: ComprehensiveTestField[];
  search?: string;
}
