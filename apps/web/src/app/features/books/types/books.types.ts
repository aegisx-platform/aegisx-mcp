// ===== CORE ENTITY TYPES =====

export interface Book {
  id: string;
  title: string;
  description?: string | null;
  author_id: string;
  isbn?: string | null;
  pages?: number | null;
  published_date?: string | null;
  price?: number | null;
  genre?: string | null;
  available?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookRequest {
  title: string;
  description?: string | null;
  author_id: string;
  isbn?: string | null;
  pages?: number | null;
  published_date?: string | null;
  price?: number | null;
  genre?: string | null;
  available?: boolean | null;
}

export interface UpdateBookRequest {
  title?: string;
  description?: string | null;
  author_id?: string;
  isbn?: string | null;
  pages?: number | null;
  published_date?: string | null;
  price?: number | null;
  genre?: string | null;
  available?: boolean | null;
}

// ===== QUERY TYPES =====

export interface ListBookQuery {
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
    // String filtering for author_id
  author_id?: string; // Exact match
    // String filtering for isbn
  isbn?: string; // Exact match
    // Numeric filtering for pages
  pages?: number; // Exact match
  pages_min?: number; // Range start
  pages_max?: number; // Range end
  // Numeric filtering for price
  price?: number; // Exact match
  price_min?: number; // Range start
  price_max?: number; // Range end
  // String filtering for genre
  genre?: string; // Exact match
    // Boolean filtering for available
  available?: boolean;
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
  data: Book[];
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

export type BookField = keyof Book;
export type BookSortField = BookField;

export interface BookListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: BookField[];
  search?: string;
}

