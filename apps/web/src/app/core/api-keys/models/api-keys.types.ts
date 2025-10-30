// API Key Scope interface
export interface ApiKeyScope {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

// API Key entity (matches database table)
export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: ApiKeyScope[] | null;
  last_used_at: string | null;
  last_used_ip: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Key with preview (masked key)
export interface ApiKeyWithPreview extends ApiKey {
  preview: string; // e.g., "***...abc4"
}

// Request types
export interface GenerateApiKeyRequest {
  name: string;
  description?: string;
  scopes?: ApiKeyScope[];
  expiryDays?: number;
}

export interface ValidateApiKeyRequest {
  apiKey: string;
  resource?: string;
  action?: string;
}

export interface RevokeApiKeyRequest {
  reason?: string;
}

export interface RotateApiKeyRequest {
  reason?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  user_id: string;
  scopes?: ApiKeyScope[];
  expires_at?: string;
  is_active?: boolean;
}

export interface UpdateApiKeyRequest {
  name?: string;
  scopes?: ApiKeyScope[];
  expires_at?: string;
  is_active?: boolean;
}

export interface ListApiKeysQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserApiKeysQuery {
  active?: boolean;
  page?: number;
  limit?: number;
}

// Response types
export interface GeneratedApiKey {
  apiKey: ApiKey;
  fullKey: string; // Full key shown only once
  preview: string;
}

export interface ValidationResult {
  isValid: boolean;
  keyData?: ApiKey;
  hasRequiredScope?: boolean;
  error?: string;
}

export interface RevokeApiKeyResponse {
  success: boolean;
  message: string;
  revokedAt: string;
}

export interface RotateApiKeyResponse {
  newApiKey: ApiKey;
  fullKey: string; // New full key shown only once
  preview: string;
  message: string;
}

export interface ApiKeyResponse {
  success: boolean;
  data: ApiKey;
  message?: string;
}

// Standard paginated response (matches reply.paginated() helper)
export interface ApiKeysListResponse {
  success: boolean;
  data: ApiKeyWithPreview[]; // FLAT structure at root level
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    environment: string;
  };
}

export interface GenerateApiKeyResponse {
  success: boolean;
  data: GeneratedApiKey;
  message: string;
}

export interface ValidateApiKeyResponse {
  success: boolean;
  data: ValidationResult;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// State management
export interface ApiKeysState {
  keys: ApiKeyWithPreview[];
  loading: boolean;
  error: string | null;
  selectedKey: ApiKey | null;
  totalKeys: number;
  activeKeys: number;
}
