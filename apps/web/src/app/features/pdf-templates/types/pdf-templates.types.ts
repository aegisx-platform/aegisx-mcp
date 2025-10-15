// ===== CORE ENTITY TYPES =====

export interface LogoSettings {
  width?: number;
  height?: number;
  position?: 'header' | 'footer' | 'custom';
  alignment?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

export interface PdfTemplate {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  template_data: Record<string, unknown> | string;
  sample_data?: Record<string, unknown> | null;
  schema?: Record<string, unknown> | null;
  page_size?: string | null;
  orientation?: string | null;
  styles?: Record<string, unknown> | null;
  fonts?: Record<string, unknown> | null;
  version?: string | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
  is_template_starter?: boolean | null;
  usage_count?: number | null;
  assets?: Record<string, unknown> | null;
  permissions?: Record<string, unknown> | null;
  logo_file_id?: string | null;
  logo_settings?: LogoSettings | null;
  asset_file_ids?: string[] | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePdfTemplateRequest {
  name: string;
  display_name: string;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  template_data: Record<string, unknown> | string;
  sample_data?: Record<string, unknown> | null;
  schema?: Record<string, unknown> | null;
  page_size?: string | null;
  orientation?: string | null;
  styles?: Record<string, unknown> | null;
  fonts?: Record<string, unknown> | null;
  version?: string | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
  is_template_starter?: boolean | null;
  usage_count?: number | null;
  assets?: Record<string, unknown> | null;
  permissions?: Record<string, unknown> | null;
  logo_file_id?: string | null;
  logo_settings?: LogoSettings | null;
  asset_file_ids?: string[] | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface UpdatePdfTemplateRequest {
  name?: string;
  display_name?: string;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  template_data?: Record<string, unknown> | string;
  sample_data?: Record<string, unknown> | null;
  schema?: Record<string, unknown> | null;
  page_size?: string | null;
  orientation?: string | null;
  styles?: Record<string, unknown> | null;
  fonts?: Record<string, unknown> | null;
  version?: string | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
  is_template_starter?: boolean | null;
  usage_count?: number | null;
  assets?: Record<string, unknown> | null;
  permissions?: Record<string, unknown> | null;
  logo_file_id?: string | null;
  logo_settings?: LogoSettings | null;
  asset_file_ids?: string[] | null;
  created_by?: string | null;
  updated_by?: string | null;
}

// ===== QUERY TYPES =====

export interface ListPdfTemplateQuery {
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
  // String filtering for name
  name?: string; // Exact match
  // String filtering for display_name
  display_name?: string; // Exact match
  // String filtering for description
  description?: string; // Exact match
  // String filtering for category
  category?: string; // Exact match
  // String filtering for type
  type?: string; // Exact match
  // String filtering for page_size
  page_size?: string; // Exact match
  // String filtering for orientation
  orientation?: string; // Exact match
  // String filtering for version
  version?: string; // Exact match
  // Boolean filtering for is_active
  is_active?: boolean;
  // Boolean filtering for is_default
  is_default?: boolean;
  // Boolean filtering for is_template_starter
  is_template_starter?: boolean;
  // Numeric filtering for usage_count
  usage_count?: number; // Exact match
  usage_count_min?: number; // Range start
  usage_count_max?: number; // Range end
  // String filtering for created_by
  created_by?: string; // Exact match
  // String filtering for updated_by
  updated_by?: string; // Exact match
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
    data?: unknown;
  }>;
}

export interface BulkResponse {
  success: boolean;
  data: PdfTemplate[];
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

export type PdfTemplateField = keyof PdfTemplate;
export type PdfTemplateSortField = PdfTemplateField;

export interface PdfTemplateListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: PdfTemplateField[];
  search?: string;
}

// ===== ADVANCED FEATURE TYPES =====

export interface RenderPdfRequest {
  templateId?: string;
  templateName?: string;
  data: Record<string, unknown>;
  options?: {
    format?: 'buffer' | 'base64' | 'url';
    filename?: string;
  };
}

export interface RenderPdfResponse {
  success: boolean;
  buffer?: ArrayBuffer;
  base64?: string;
  url?: string;
  filename?: string;
  metadata?: {
    templateId: string;
    templateName: string;
    renderedAt: string;
    fileSize: number;
  };
}

export interface PreviewTemplateRequest {
  data?: Record<string, unknown>;
}

export interface PreviewTemplateResponse {
  success: boolean;
  previewUrl?: string;
  buffer?: ArrayBuffer;
  base64?: string;
}

export interface ValidateTemplateRequest {
  template_data: Record<string, unknown>;
}

export interface ValidateTemplateResponse {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
  }>;
}

export interface DuplicateTemplateRequest {
  name: string;
}

export interface SearchTemplateQuery {
  q: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: string;
  template_data: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface TemplateStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  mostUsed: Array<{
    id: string;
    name: string;
    usage_count: number;
  }>;
}

export interface HandlebarsHelper {
  name: string;
  description: string;
  syntax: string;
  example: string;
  category: string;
}
