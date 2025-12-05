import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base AdjustmentReasons Schema
export const AdjustmentReasonsSchema = Type.Object({
  id: Type.Integer(),
  reason_code: Type.String(),
  reason_name: Type.String(),
  adjustment_type: Type.Optional(Type.Any()),
  requires_approval: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateAdjustmentReasonsSchema = Type.Object({
  reason_code: Type.String(),
  reason_name: Type.String(),
  adjustment_type: Type.Optional(Type.Any()),
  requires_approval: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateAdjustmentReasonsSchema = Type.Partial(
  Type.Object({
    reason_code: Type.String(),
    reason_name: Type.String(),
    adjustment_type: Type.Optional(Type.Any()),
    requires_approval: Type.Optional(Type.Boolean()),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const AdjustmentReasonsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetAdjustmentReasonsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListAdjustmentReasonsQuerySchema = Type.Object({
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
        'reason_code:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "reason_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  reason_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  reason_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  requires_approval: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const AdjustmentReasonsResponseSchema = ApiSuccessResponseSchema(
  AdjustmentReasonsSchema,
);
export const AdjustmentReasonsListResponseSchema = PaginatedResponseSchema(
  AdjustmentReasonsSchema,
);

// Partial Schemas for field selection support
export const PartialAdjustmentReasonsSchema = Type.Partial(
  AdjustmentReasonsSchema,
);
export const FlexibleAdjustmentReasonsListResponseSchema =
  PartialPaginatedResponseSchema(AdjustmentReasonsSchema);

// Export types
export type AdjustmentReasons = Static<typeof AdjustmentReasonsSchema>;
export type CreateAdjustmentReasons = Static<
  typeof CreateAdjustmentReasonsSchema
>;
export type UpdateAdjustmentReasons = Static<
  typeof UpdateAdjustmentReasonsSchema
>;
export type AdjustmentReasonsIdParam = Static<
  typeof AdjustmentReasonsIdParamSchema
>;
export type GetAdjustmentReasonsQuery = Static<
  typeof GetAdjustmentReasonsQuerySchema
>;
export type ListAdjustmentReasonsQuery = Static<
  typeof ListAdjustmentReasonsQuerySchema
>;

// Partial types for field selection
export type PartialAdjustmentReasons = Static<
  typeof PartialAdjustmentReasonsSchema
>;
export type FlexibleAdjustmentReasonsList = Static<
  typeof FlexibleAdjustmentReasonsListResponseSchema
>;
