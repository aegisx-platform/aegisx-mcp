import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugReturns Schema
export const DrugReturnsSchema = Type.Object({
  id: Type.Number(),
  return_number: Type.String(),
  department_id: Type.Integer(),
  return_date: Type.String({ format: 'date' }),
  return_reason_id: Type.Optional(Type.Integer()),
  return_reason: Type.Optional(Type.String()),
  action_taken: Type.Optional(Type.String()),
  status: Type.Optional(Type.Any()),
  total_items: Type.Optional(Type.Integer()),
  total_amount: Type.Optional(Type.Number()),
  received_by: Type.Optional(Type.String()),
  verified_by: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugReturnsSchema = Type.Object({
  return_number: Type.String(),
  department_id: Type.Integer(),
  return_date: Type.String({ format: 'date' }),
  return_reason_id: Type.Optional(Type.Integer()),
  return_reason: Type.Optional(Type.String()),
  action_taken: Type.Optional(Type.String()),
  status: Type.Optional(Type.Any()),
  total_items: Type.Optional(Type.Integer()),
  total_amount: Type.Optional(Type.Number()),
  received_by: Type.Optional(Type.String()),
  verified_by: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugReturnsSchema = Type.Partial(
  Type.Object({
    return_number: Type.String(),
    department_id: Type.Integer(),
    return_date: Type.String({ format: 'date' }),
    return_reason_id: Type.Optional(Type.Integer()),
    return_reason: Type.Optional(Type.String()),
    action_taken: Type.Optional(Type.String()),
    status: Type.Optional(Type.Any()),
    total_items: Type.Optional(Type.Integer()),
    total_amount: Type.Optional(Type.Number()),
    received_by: Type.Optional(Type.String()),
    verified_by: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const DrugReturnsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugReturnsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugReturnsQuerySchema = Type.Object({
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
        'return_number:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "return_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  return_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  department_id: Type.Optional(Type.Number({ minimum: 0 })),
  department_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  department_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  return_reason_id: Type.Optional(Type.Number({ minimum: 0 })),
  return_reason_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  return_reason_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  return_reason: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  action_taken: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  total_items: Type.Optional(Type.Number({ minimum: 0 })),
  total_items_min: Type.Optional(Type.Number({ minimum: 0 })),
  total_items_max: Type.Optional(Type.Number({ minimum: 0 })),
  total_amount: Type.Optional(Type.Number({})),
  total_amount_min: Type.Optional(Type.Number({})),
  total_amount_max: Type.Optional(Type.Number({})),
  received_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  verified_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const DrugReturnsResponseSchema =
  ApiSuccessResponseSchema(DrugReturnsSchema);
export const DrugReturnsListResponseSchema =
  PaginatedResponseSchema(DrugReturnsSchema);

// Partial Schemas for field selection support
export const PartialDrugReturnsSchema = Type.Partial(DrugReturnsSchema);
export const FlexibleDrugReturnsListResponseSchema =
  PartialPaginatedResponseSchema(DrugReturnsSchema);

// Export types
export type DrugReturns = Static<typeof DrugReturnsSchema>;
export type CreateDrugReturns = Static<typeof CreateDrugReturnsSchema>;
export type UpdateDrugReturns = Static<typeof UpdateDrugReturnsSchema>;
export type DrugReturnsIdParam = Static<typeof DrugReturnsIdParamSchema>;
export type GetDrugReturnsQuery = Static<typeof GetDrugReturnsQuerySchema>;
export type ListDrugReturnsQuery = Static<typeof ListDrugReturnsQuerySchema>;

// Partial types for field selection
export type PartialDrugReturns = Static<typeof PartialDrugReturnsSchema>;
export type FlexibleDrugReturnsList = Static<
  typeof FlexibleDrugReturnsListResponseSchema
>;
