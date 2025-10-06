// ===== CORE ENTITY TYPES =====

export interface Article {
  id: string;
  title: string;
  content?: string | null;
  author_id: string;
  published?: boolean | null;
  published_at?: string | null;
  view_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleRequest {
  title: string;
  content?: string | null;
  author_id: string;
  published?: boolean | null;
  published_at?: string | null;
  view_count?: number | null;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string | null;
  author_id?: string;
  published?: boolean | null;
  published_at?: string | null;
  view_count?: number | null;
}

// ===== QUERY TYPES =====

export interface ListArticleQuery {
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
  // String filtering for content
  content?: string; // Exact match
  // String filtering for author_id
  author_id?: string; // Exact match
  // Boolean filtering for published
  published?: boolean;
  // Date/DateTime filtering for published_at
  published_at?: string; // ISO date string for exact match
  published_at_min?: string; // ISO date string for range start
  published_at_max?: string; // ISO date string for range end
  // Numeric filtering for view_count
  view_count?: number; // Exact match
  view_count_min?: number; // Range start
  view_count_max?: number; // Range end
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
  data: Article[];
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

export type ArticleField = keyof Article;
export type ArticleSortField = ArticleField;

export interface ArticleListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: ArticleField[];
  search?: string;
}
