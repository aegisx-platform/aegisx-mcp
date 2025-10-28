import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
} from '../../../schemas/base.schemas';

// Base ApiKeys Schema
export const ApiKeysSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  key_hash: Type.String(),
  key_prefix: Type.String(),
  scopes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  last_used_at: Type.Optional(Type.String({ format: 'date-time' })),
  last_used_ip: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateApiKeysSchema = Type.Object({
  user_id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  key_hash: Type.String(),
  key_prefix: Type.String(),
  scopes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  last_used_at: Type.Optional(Type.String({ format: 'date-time' })),
  last_used_ip: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateApiKeysSchema = Type.Partial(
  Type.Object({
    user_id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    key_hash: Type.String(),
    key_prefix: Type.String(),
    scopes: Type.Optional(Type.Record(Type.String(), Type.Any())),
    last_used_at: Type.Optional(Type.String({ format: 'date-time' })),
    last_used_ip: Type.Optional(Type.String()),
    expires_at: Type.Optional(Type.String({ format: 'date-time' })),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const ApiKeysIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetApiKeysQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListApiKeysQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], {
      default: 'desc',
    }),
  ),

  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),

  // Include related data
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Add column-specific filters dynamically
  user_id: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  key_hash: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  key_prefix: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  last_used_ip: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const ApiKeysResponseSchema = ApiSuccessResponseSchema(ApiKeysSchema);
export const ApiKeysListResponseSchema = PaginatedResponseSchema(ApiKeysSchema);

// Export types
export type ApiKeys = Static<typeof ApiKeysSchema>;
export type CreateApiKeys = Static<typeof CreateApiKeysSchema>;
export type UpdateApiKeys = Static<typeof UpdateApiKeysSchema>;
export type ApiKeysIdParam = Static<typeof ApiKeysIdParamSchema>;
export type GetApiKeysQuery = Static<typeof GetApiKeysQuerySchema>;
export type ListApiKeysQuery = Static<typeof ListApiKeysQuerySchema>;

// WebSocket Event Schemas
export const ApiKeysCreatedEventSchema = Type.Object({
  type: Type.Literal('apiKeys.created'),
  data: ApiKeysSchema,
});

export const ApiKeysUpdatedEventSchema = Type.Object({
  type: Type.Literal('apiKeys.updated'),
  data: ApiKeysSchema,
});

export const ApiKeysDeletedEventSchema = Type.Object({
  type: Type.Literal('apiKeys.deleted'),
  data: Type.Object({
    id: Type.Union([Type.String(), Type.Number()]),
  }),
});

export type ApiKeysCreatedEvent = Static<typeof ApiKeysCreatedEventSchema>;
export type ApiKeysUpdatedEvent = Static<typeof ApiKeysUpdatedEventSchema>;
export type ApiKeysDeletedEvent = Static<typeof ApiKeysDeletedEventSchema>;

// ===== API KEY GENERATION SCHEMAS =====

// API Key Scope Schema
export const ApiKeyScopeSchema = Type.Object({
  resource: Type.String({
    minLength: 1,
    maxLength: 50,
    description: "Resource type (e.g., 'users', 'files')",
  }),
  actions: Type.Array(Type.String({ minLength: 1, maxLength: 20 }), {
    minItems: 1,
    description: "Allowed actions (e.g., ['read'], ['read', 'write'], ['*'])",
  }),
  conditions: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

// Generate API Key Request Schema
export const GenerateApiKeySchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Human-readable name for the API key',
  }),
  scopes: Type.Optional(Type.Array(ApiKeyScopeSchema)),
  expiryDays: Type.Optional(
    Type.Number({
      minimum: 1,
      maximum: 3650,
      default: 365,
    }),
  ),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

// Generated API Key Response Schema
export const GeneratedApiKeySchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  key: Type.String({ description: 'Full API key - ONLY shown once!' }),
  prefix: Type.String({ description: 'Key prefix for identification' }),
  preview: Type.String({ description: 'Masked key preview for display' }),
  scopes: Type.Optional(Type.Array(ApiKeyScopeSchema)),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
});

// API Key Validation Request Schema
export const ValidateApiKeySchema = Type.Object({
  key: Type.String({
    minLength: 10,
    description: 'API key to validate',
  }),
  resource: Type.Optional(
    Type.String({ description: 'Resource to check access for' }),
  ),
  action: Type.Optional(
    Type.String({ description: 'Action to check permission for' }),
  ),
});

// API Key Validation Response Schema
export const ApiKeyValidationResponseSchema = Type.Object({
  valid: Type.Boolean(),
  keyData: Type.Optional(ApiKeysSchema),
  hasAccess: Type.Optional(
    Type.Boolean({ description: 'Whether key has required scope' }),
  ),
  error: Type.Optional(Type.String()),
});

// Revoke API Key Schema
export const RevokeApiKeySchema = Type.Object({
  keyId: Type.String({ format: 'uuid' }),
  reason: Type.Optional(Type.String({ maxLength: 255 })),
});

// Rotate API Key Schema
export const RotateApiKeySchema = Type.Object({
  keyId: Type.String({ format: 'uuid' }),
  newName: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 100,
      description: 'Optional new name for rotated key',
    }),
  ),
});

// User API Keys Query Schema
export const UserApiKeysQuerySchema = Type.Object({
  // Inherit from base list query
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], {
      default: 'desc',
    }),
  ),

  // API key specific filters
  isActive: Type.Optional(Type.Boolean()),
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  includeExpired: Type.Optional(Type.Boolean({ default: false })),
});

// API Key Preview Response Schema (for lists)
export const ApiKeyPreviewSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  prefix: Type.String(),
  preview: Type.String(),
  scopes: Type.Optional(Type.Array(ApiKeyScopeSchema)),
  last_used_at: Type.Optional(Type.String({ format: 'date-time' })),
  last_used_ip: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

export const UserApiKeysResponseSchema = Type.Object({
  data: Type.Array(ApiKeyPreviewSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
  }),
});

// Response Schemas
export const GenerateApiKeyResponseSchema = ApiSuccessResponseSchema(
  GeneratedApiKeySchema,
);
export const ValidateApiKeyResponseSchema = ApiSuccessResponseSchema(
  ApiKeyValidationResponseSchema,
);
export const UserApiKeysListResponseSchema = ApiSuccessResponseSchema(
  UserApiKeysResponseSchema,
);
export const RevokeApiKeyResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    success: Type.Boolean(),
    keyId: Type.String(),
    revokedAt: Type.String({ format: 'date-time' }),
  }),
);
export const RotateApiKeyResponseSchema = ApiSuccessResponseSchema(
  GeneratedApiKeySchema,
);

// Export new types
export type ApiKeyScope = Static<typeof ApiKeyScopeSchema>;
export type GenerateApiKey = Static<typeof GenerateApiKeySchema>;
export type GeneratedApiKey = Static<typeof GeneratedApiKeySchema>;
export type ValidateApiKey = Static<typeof ValidateApiKeySchema>;
export type ApiKeyValidationResponse = Static<
  typeof ApiKeyValidationResponseSchema
>;
export type RevokeApiKey = Static<typeof RevokeApiKeySchema>;
export type RotateApiKey = Static<typeof RotateApiKeySchema>;
export type UserApiKeysQuery = Static<typeof UserApiKeysQuerySchema>;
export type ApiKeyPreview = Static<typeof ApiKeyPreviewSchema>;
export type UserApiKeysResponse = Static<typeof UserApiKeysResponseSchema>;
