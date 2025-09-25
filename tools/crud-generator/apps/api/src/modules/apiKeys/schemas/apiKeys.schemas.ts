import { Type, Static } from '@sinclair/typebox';
import { 
  UuidParamSchema, 
  PaginationQuerySchema, 
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema 
} from '../../../schemas/base.schemas';

// Base ApiKeys Schema
export const ApiKeysSchema = Type.Object({
});

// Create Schema (without auto-generated fields)
export const CreateApiKeysSchema = Type.Object({
});

// Update Schema (partial, without auto-generated fields)
export const UpdateApiKeysSchema = Type.Partial(
  Type.Object({
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

