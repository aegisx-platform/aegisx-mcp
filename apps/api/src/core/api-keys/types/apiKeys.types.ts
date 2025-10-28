// Import and re-export types from schemas for convenience
import {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type ApiKeysIdParam,
  type GetApiKeysQuery,
  type ListApiKeysQuery,
  type ApiKeysCreatedEvent,
  type ApiKeysUpdatedEvent,
  type ApiKeysDeletedEvent,
  // New API key management types
  type ApiKeyScope,
  type GenerateApiKey,
  type GeneratedApiKey,
  type ValidateApiKey,
  type ApiKeyValidationResponse,
  type RevokeApiKey,
  type RotateApiKey,
  type UserApiKeysQuery,
  type ApiKeyPreview,
  type UserApiKeysResponse,
} from '../schemas/apiKeys.schemas';

export {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type ApiKeysIdParam,
  type GetApiKeysQuery,
  type ListApiKeysQuery,
  type ApiKeysCreatedEvent,
  type ApiKeysUpdatedEvent,
  type ApiKeysDeletedEvent,
  // New API key management types
  type ApiKeyScope,
  type GenerateApiKey,
  type GeneratedApiKey,
  type ValidateApiKey,
  type ApiKeyValidationResponse,
  type RevokeApiKey,
  type RotateApiKey,
  type UserApiKeysQuery,
  type ApiKeyPreview,
  type UserApiKeysResponse,
};

// Additional type definitions
export interface ApiKeysRepository {
  create(data: CreateApiKeys): Promise<ApiKeys>;
  findById(id: number | string): Promise<ApiKeys | null>;
  findMany(query: ListApiKeysQuery): Promise<{
    data: ApiKeys[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateApiKeys): Promise<ApiKeys | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface ApiKeysEventHandlers {
  onCreated?: (data: ApiKeys) => void | Promise<void>;
  onUpdated?: (data: ApiKeys) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface ApiKeysWebSocketSubscription {
  subscribe(handlers: ApiKeysEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface ApiKeysEntity {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: Record<string, any> | null;
  last_used_at: Date | null;
  last_used_ip: string | null;
  expires_at: Date | null;
  is_active: boolean | null;
  created_at: Date;
  updated_at: Date;
}

// API Key Management Service interface
export interface ApiKeyManagementService {
  generateKey(
    userId: string,
    name: string,
    options?: {
      scopes?: ApiKeyScope[];
      expiryDays?: number;
      isActive?: boolean;
    },
  ): Promise<{ apiKey: ApiKeys; fullKey: string; preview: string }>;

  validateKey(apiKey: string): Promise<{
    isValid: boolean;
    keyData?: ApiKeys;
    error?: string;
  }>;

  updateUsage(keyId: string | number, ipAddress?: string): Promise<void>;
  checkScope(
    keyData: ApiKeys,
    resource: string,
    action: string,
  ): Promise<boolean>;
  revokeKey(keyId: string | number, userId?: string): Promise<boolean>;
  rotateKey(
    keyId: string | number,
    userId?: string,
  ): Promise<{
    newApiKey: ApiKeys;
    fullKey: string;
    preview: string;
  }>;
  getUserKeys(
    userId: string,
    options?: UserApiKeysQuery,
  ): Promise<{
    data: (ApiKeys & { preview: string })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
}

// API Key Authentication Result
export interface ApiKeyAuthResult {
  isAuthenticated: boolean;
  keyData?: ApiKeys;
  error?: string;
  hasRequiredScope?: boolean;
}

// API Key Usage Statistics
export interface ApiKeyUsageStats {
  keyId: string;
  totalRequests: number;
  requestsLastDay: number;
  requestsLastWeek: number;
  requestsLastMonth: number;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
  uniqueIpCount: number;
  errorRate: number;
  averageResponseTime: number;
}
