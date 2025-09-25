import { Type, Static } from '@sinclair/typebox';
import { 
  UuidParamSchema, 
  PaginationQuerySchema, 
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema 
} from '../../schemas/base.schemas';

// Base ApiKeys Schema
export const ApiKeysSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  user_id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key_hash: Type.String(),
  key_prefix: Type.String(),
  scopes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  last_used_at: Type.Optional(Type.String({ format: "date-time" })),
  last_used_ip: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: "date-time" })),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" })
});

// Create Schema (without auto-generated fields)
export const CreateApiKeysSchema = Type.Object({
  user_id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key_hash: Type.String(),
  key_prefix: Type.String(),
  scopes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  last_used_at: Type.Optional(Type.String({ format: "date-time" })),
  last_used_ip: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: "date-time" })),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateApiKeysSchema = Type.Partial(
  Type.Object({
    user_id: Type.String({ format: "uuid" }),
    name: Type.String(),
    key_hash: Type.String(),
    key_prefix: Type.String(),
    scopes: Type.Optional(Type.Record(Type.String(), Type.Any())),
    last_used_at: Type.Optional(Type.String({ format: "date-time" })),
    last_used_ip: Type.Optional(Type.String()),
    expires_at: Type.Optional(Type.String({ format: "date-time" })),
    is_active: Type.Optional(Type.Boolean()),
  })
);

// ID Parameter Schema
export const ApiKeysIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()])
});

// Query Schemas
export const GetApiKeysQuerySchema = Type.Object({
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ]))
});

export const ListApiKeysQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(Type.Union([
    Type.Literal('asc'), 
    Type.Literal('desc')
  ], { default: 'asc' })),
  
  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  
  // Include related data
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ])),
  
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

