import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Departments Schema
export const DepartmentsSchema = Type.Object({
  id: Type.Integer(),
  dept_code: Type.String(),
  dept_name: Type.String(),
  his_code: Type.Optional(Type.String()),
  parent_id: Type.Optional(Type.Integer()),
  consumption_group: Type.Optional(Type.Any()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDepartmentsSchema = Type.Object({
  dept_code: Type.String(),
  dept_name: Type.String(),
  his_code: Type.Optional(Type.String()),
  parent_id: Type.Optional(Type.Integer()),
  consumption_group: Type.Optional(Type.Any()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDepartmentsSchema = Type.Partial(
  Type.Object({
    dept_code: Type.String(),
    dept_name: Type.String(),
    his_code: Type.Optional(Type.String()),
    parent_id: Type.Optional(Type.Integer()),
    consumption_group: Type.Optional(Type.Any()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DepartmentsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDepartmentsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDepartmentsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'dept_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "dept_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  dept_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  dept_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  his_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  parent_id: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DepartmentsResponseSchema =
  ApiSuccessResponseSchema(DepartmentsSchema);
export const DepartmentsListResponseSchema =
  PaginatedResponseSchema(DepartmentsSchema);

// Partial Schemas for field selection support
export const PartialDepartmentsSchema = Type.Partial(DepartmentsSchema);
export const FlexibleDepartmentsListResponseSchema =
  PartialPaginatedResponseSchema(DepartmentsSchema);

// Export types
export type Departments = Static<typeof DepartmentsSchema>;
export type CreateDepartments = Static<typeof CreateDepartmentsSchema>;
export type UpdateDepartments = Static<typeof UpdateDepartmentsSchema>;
export type DepartmentsIdParam = Static<typeof DepartmentsIdParamSchema>;
export type GetDepartmentsQuery = Static<typeof GetDepartmentsQuerySchema>;
export type ListDepartmentsQuery = Static<typeof ListDepartmentsQuerySchema>;

// Partial types for field selection
export type PartialDepartments = Static<typeof PartialDepartmentsSchema>;
export type FlexibleDepartmentsList = Static<
  typeof FlexibleDepartmentsListResponseSchema
>;
