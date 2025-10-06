// ===== CORE ENTITY TYPES =====

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  action_url?: string | null;
  read?: boolean | null;
  read_at?: string | null;
  archived?: boolean | null;
  archived_at?: string | null;
  priority?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  action_url?: string | null;
  read?: boolean | null;
  read_at?: string | null;
  archived?: boolean | null;
  archived_at?: string | null;
  priority?: string | null;
  expires_at?: string | null;
}

export interface UpdateNotificationRequest {
  user_id?: string;
  type?: string;
  title?: string;
  message?: string;
  data?: Record<string, any> | null;
  action_url?: string | null;
  read?: boolean | null;
  read_at?: string | null;
  archived?: boolean | null;
  archived_at?: string | null;
  priority?: string | null;
  expires_at?: string | null;
}

// ===== QUERY TYPES =====

export interface ListNotificationQuery {
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
  // String filtering for user_id
  user_id?: string; // Exact match
  // String filtering for type
  type?: string; // Exact match
  // String filtering for title
  title?: string; // Exact match
  // String filtering for message
  message?: string; // Exact match
  // String filtering for action_url
  action_url?: string; // Exact match
  // Boolean filtering for read
  read?: boolean;
  // Date/DateTime filtering for read_at
  read_at?: string; // ISO date string for exact match
  read_at_min?: string; // ISO date string for range start
  read_at_max?: string; // ISO date string for range end
  // Boolean filtering for archived
  archived?: boolean;
  // Date/DateTime filtering for archived_at
  archived_at?: string; // ISO date string for exact match
  archived_at_min?: string; // ISO date string for range start
  archived_at_max?: string; // ISO date string for range end
  // String filtering for priority
  priority?: string; // Exact match
  // Date/DateTime filtering for expires_at
  expires_at?: string; // ISO date string for exact match
  expires_at_min?: string; // ISO date string for range start
  expires_at_max?: string; // ISO date string for range end
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
  data: Notification[];
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

export type NotificationField = keyof Notification;
export type NotificationSortField = NotificationField;

export interface NotificationListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: NotificationField[];
  search?: string;
}
