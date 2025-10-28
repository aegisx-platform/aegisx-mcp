import { Type, Static } from '@sinclair/typebox';
import { 
  UuidParamSchema, 
  PaginationQuerySchema, 
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema 
} from '../../schemas/base.schemas';

// Base SystemSettings Schema
export const SystemSettingsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  category: Type.String(),
  key: Type.String(),
  value: Type.String(),
  data_type: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  is_public: Type.Optional(Type.Boolean()),
  requires_restart: Type.Optional(Type.Boolean()),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" })
});

// Create Schema (without auto-generated fields)
export const CreateSystemSettingsSchema = Type.Object({
  category: Type.String(),
  key: Type.String(),
  value: Type.String(),
  data_type: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  is_public: Type.Optional(Type.Boolean()),
  requires_restart: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateSystemSettingsSchema = Type.Partial(
  Type.Object({
    category: Type.String(),
    key: Type.String(),
    value: Type.String(),
    data_type: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    is_public: Type.Optional(Type.Boolean()),
    requires_restart: Type.Optional(Type.Boolean()),
  })
);

// ID Parameter Schema
export const SystemSettingsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()])
});

// Query Schemas
export const GetSystemSettingsQuerySchema = Type.Object({
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ]))
});

export const ListSystemSettingsQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'), 
    Type.Literal('desc')
  ], { default: 'desc' })),
  
  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  
  // Include related data
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ])),
  
  // Add column-specific filters dynamically
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  key: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  value: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  data_type: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  is_public: Type.Optional(Type.Boolean()),
  requires_restart: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const SystemSettingsResponseSchema = ApiSuccessResponseSchema(SystemSettingsSchema);
export const SystemSettingsListResponseSchema = PaginatedResponseSchema(SystemSettingsSchema);

// Export types
export type SystemSettings = Static<typeof SystemSettingsSchema>;
export type CreateSystemSettings = Static<typeof CreateSystemSettingsSchema>;
export type UpdateSystemSettings = Static<typeof UpdateSystemSettingsSchema>;
export type SystemSettingsIdParam = Static<typeof SystemSettingsIdParamSchema>;
export type GetSystemSettingsQuery = Static<typeof GetSystemSettingsQuerySchema>;
export type ListSystemSettingsQuery = Static<typeof ListSystemSettingsQuerySchema>;

// WebSocket Event Schemas
export const SystemSettingsCreatedEventSchema = Type.Object({
  type: Type.Literal('systemSettings.created'),
  data: SystemSettingsSchema
});

export const SystemSettingsUpdatedEventSchema = Type.Object({
  type: Type.Literal('systemSettings.updated'),
  data: SystemSettingsSchema
});

export const SystemSettingsDeletedEventSchema = Type.Object({
  type: Type.Literal('systemSettings.deleted'),
  data: Type.Object({
    id: Type.Union([Type.String(), Type.Number()])
  })
});

export type SystemSettingsCreatedEvent = Static<typeof SystemSettingsCreatedEventSchema>;
export type SystemSettingsUpdatedEvent = Static<typeof SystemSettingsUpdatedEventSchema>;
export type SystemSettingsDeletedEvent = Static<typeof SystemSettingsDeletedEventSchema>;
