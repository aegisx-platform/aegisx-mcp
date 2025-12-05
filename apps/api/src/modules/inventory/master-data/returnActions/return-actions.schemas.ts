import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base ReturnActions Schema
export const ReturnActionsSchema = Type.Object({
  id: Type.Integer(),
  action_code: Type.String(),
  action_name: Type.String(),
  action_type: Type.Optional(Type.Any()),
  requires_vendor_approval: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateReturnActionsSchema = Type.Object({
  action_code: Type.String(),
  action_name: Type.String(),
  action_type: Type.Optional(Type.Any()),
  requires_vendor_approval: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateReturnActionsSchema = Type.Partial(
  Type.Object({
    action_code: Type.String(),
    action_name: Type.String(),
    action_type: Type.Optional(Type.Any()),
    requires_vendor_approval: Type.Optional(Type.Boolean()),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const ReturnActionsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetReturnActionsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListReturnActionsQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  // Modern multiple sort support
  sort: Type.Optional(
    Type.String({
      pattern:
        '^[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?(,[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?)*$',
      description:
        'Multiple sort: field1:desc,field2:asc,field3:desc. Example: id:asc,created_at:desc',
      examples: [
        'id:asc',
        'created_at:desc',
        'action_code:asc,created_at:desc',
      ],
    }),
  ),

  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),

  // 🛡️ Secure field selection with validation
  fields: Type.Optional(
    Type.Array(
      Type.String({
        pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', // Only alphanumeric + underscore
        minLength: 1,
        maxLength: 50,
      }),
      {
        minItems: 1,
        maxItems: 20, // Prevent excessive field requests
        description:
          'Specific fields to return. Example: ["id", "action_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  action_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  action_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  requires_vendor_approval: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const ReturnActionsResponseSchema =
  ApiSuccessResponseSchema(ReturnActionsSchema);
export const ReturnActionsListResponseSchema =
  PaginatedResponseSchema(ReturnActionsSchema);

// Partial Schemas for field selection support
export const PartialReturnActionsSchema = Type.Partial(ReturnActionsSchema);
export const FlexibleReturnActionsListResponseSchema =
  PartialPaginatedResponseSchema(ReturnActionsSchema);

// Export types
export type ReturnActions = Static<typeof ReturnActionsSchema>;
export type CreateReturnActions = Static<typeof CreateReturnActionsSchema>;
export type UpdateReturnActions = Static<typeof UpdateReturnActionsSchema>;
export type ReturnActionsIdParam = Static<typeof ReturnActionsIdParamSchema>;
export type GetReturnActionsQuery = Static<typeof GetReturnActionsQuerySchema>;
export type ListReturnActionsQuery = Static<
  typeof ListReturnActionsQuerySchema
>;

// Partial types for field selection
export type PartialReturnActions = Static<typeof PartialReturnActionsSchema>;
export type FlexibleReturnActionsList = Static<
  typeof FlexibleReturnActionsListResponseSchema
>;
