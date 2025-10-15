import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
} from '../../schemas/base.schemas';

// ===== ROLE SCHEMAS =====

export const RoleSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  category: Type.String(),
  parent_role_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  hierarchy_level: Type.Number({ minimum: 0 }),
  is_system_role: Type.Boolean(),
  is_active: Type.Boolean(),
  permissions: Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      resource: Type.String(),
      action: Type.String(),
      description: Type.String(),
    }),
  ),
  user_count: Type.Number({ minimum: 0 }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

export const CreateRoleRequestSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 500 })),
  category: Type.String({ minLength: 1, maxLength: 50 }),
  parent_role_id: Type.Optional(Type.String({ format: 'uuid' })),
  permission_ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export const UpdateRoleRequestSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(
    Type.Union([Type.String({ minLength: 1, maxLength: 500 }), Type.Null()]),
  ),
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  parent_role_id: Type.Optional(
    Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  ),
  is_active: Type.Optional(Type.Boolean()),
  permission_ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export const RoleQuerySchema = Type.Object({
  // Pagination parameters (inline instead of using PaginationQuerySchema)
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'asc' }),
  ),
  // RBAC specific parameters
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
  is_system_role: Type.Optional(Type.Boolean()),
  parent_role_id: Type.Optional(
    Type.Union([Type.String({ format: 'uuid' }), Type.Literal('null')]),
  ),
  include_permissions: Type.Optional(Type.Boolean()),
  include_user_count: Type.Optional(Type.Boolean()),
});

// ===== PERMISSION SCHEMAS =====

export const PermissionSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  description: Type.String(),
  resource: Type.String(),
  action: Type.String(),
  category: Type.String(),
  is_system_permission: Type.Boolean(),
  is_active: Type.Boolean(),
  conditions: Type.Union([Type.String(), Type.Null()]),
  role_count: Type.Number({ minimum: 0 }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

export const CreatePermissionRequestSchema = Type.Object({
  description: Type.String({ minLength: 1, maxLength: 500 }),
  resource: Type.String({ minLength: 1, maxLength: 50 }),
  action: Type.String({ minLength: 1, maxLength: 50 }),
  category: Type.String({ minLength: 1, maxLength: 50 }),
  conditions: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const UpdatePermissionRequestSchema = Type.Object({
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 500 })),
  resource: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  action: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
  conditions: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const PermissionQuerySchema = Type.Object({
  // Pagination parameters (inline instead of using PaginationQuerySchema)
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'asc' }),
  ),
  // Permission specific parameters
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  resource: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  action: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
  is_system_permission: Type.Optional(Type.Boolean()),
  include_role_count: Type.Optional(Type.Boolean()),
});

// ===== USER-ROLE SCHEMAS =====

export const UserRoleSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  role_id: Type.String({ format: 'uuid' }),
  role: RoleSchema,
  assigned_at: Type.String({ format: 'date-time' }),
  assigned_by: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  expires_at: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  is_active: Type.Boolean(),
});

export const AssignRoleRequestSchema = Type.Object({
  role_id: Type.String({ format: 'uuid' }),
  expires_at: Type.Optional(
    Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  ),
});

export const UpdateUserRoleExpiryRequestSchema = Type.Object({
  expires_at: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});

export const BulkAssignRolesRequestSchema = Type.Object({
  user_ids: Type.Array(Type.String({ format: 'uuid' }), {
    minItems: 1,
    maxItems: 100,
  }),
  role_id: Type.String({ format: 'uuid' }),
  expires_at: Type.Optional(
    Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  ),
});

export const UserRoleQuerySchema = Type.Object({
  // Pagination parameters (inline instead of using PaginationQuerySchema)
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'asc' }),
  ),
  // UserRole specific parameters
  user_id: Type.Optional(Type.String({ format: 'uuid' })),
  role_id: Type.Optional(Type.String({ format: 'uuid' })),
  is_active: Type.Optional(Type.Boolean()),
  expires_before: Type.Optional(Type.String({ format: 'date-time' })),
  expires_after: Type.Optional(Type.String({ format: 'date-time' })),
  include_role: Type.Optional(Type.Boolean()),
});

// ===== BULK OPERATIONS =====

export const BulkRoleUpdateRequestSchema = Type.Object({
  role_ids: Type.Array(Type.String({ format: 'uuid' }), {
    minItems: 1,
    maxItems: 100,
  }),
  updates: Type.Object({
    is_active: Type.Optional(Type.Boolean()),
    category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  }),
});

export const BulkPermissionUpdateRequestSchema = Type.Object({
  permission_ids: Type.Array(Type.String({ format: 'uuid' }), {
    minItems: 1,
    maxItems: 100,
  }),
  updates: Type.Object({
    is_active: Type.Optional(Type.Boolean()),
    category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  }),
});

export const BulkOperationResponseSchema = Type.Object({
  success_count: Type.Number({ minimum: 0 }),
  error_count: Type.Number({ minimum: 0 }),
  total_count: Type.Number({ minimum: 0 }),
  errors: Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      error: Type.String(),
    }),
  ),
});

// ===== RESPONSE SCHEMAS =====

export const RoleResponseSchema = ApiSuccessResponseSchema(RoleSchema);
export const RoleListResponseSchema = PaginatedResponseSchema(RoleSchema);

export const PermissionResponseSchema =
  ApiSuccessResponseSchema(PermissionSchema);
export const PermissionListResponseSchema =
  PaginatedResponseSchema(PermissionSchema);

export const UserRoleResponseSchema = ApiSuccessResponseSchema(UserRoleSchema);
export const UserRoleListResponseSchema =
  PaginatedResponseSchema(UserRoleSchema);

export const BulkOperationSuccessResponseSchema = ApiSuccessResponseSchema(
  BulkOperationResponseSchema,
);

// ===== STATISTICS SCHEMAS =====

export const RbacStatsSchema = Type.Object({
  total_roles: Type.Number({ minimum: 0 }),
  active_roles: Type.Number({ minimum: 0 }),
  system_roles: Type.Number({ minimum: 0 }),
  custom_roles: Type.Number({ minimum: 0 }),
  total_permissions: Type.Number({ minimum: 0 }),
  active_permissions: Type.Number({ minimum: 0 }),
  system_permissions: Type.Number({ minimum: 0 }),
  custom_permissions: Type.Number({ minimum: 0 }),
  total_user_roles: Type.Number({ minimum: 0 }),
  expiring_user_roles: Type.Number({ minimum: 0 }),
});

export const RbacStatsResponseSchema =
  ApiSuccessResponseSchema(RbacStatsSchema);

// ===== TYPE EXPORTS =====

export type Role = Static<typeof RoleSchema>;
export type CreateRoleRequest = Static<typeof CreateRoleRequestSchema>;
export type UpdateRoleRequest = Static<typeof UpdateRoleRequestSchema>;
export type RoleQuery = Static<typeof RoleQuerySchema>;

export type Permission = Static<typeof PermissionSchema>;
export type CreatePermissionRequest = Static<
  typeof CreatePermissionRequestSchema
>;
export type UpdatePermissionRequest = Static<
  typeof UpdatePermissionRequestSchema
>;
export type PermissionQuery = Static<typeof PermissionQuerySchema>;

export type UserRole = Static<typeof UserRoleSchema>;
export type AssignRoleRequest = Static<typeof AssignRoleRequestSchema>;
export type UpdateUserRoleExpiryRequest = Static<
  typeof UpdateUserRoleExpiryRequestSchema
>;
export type BulkAssignRolesRequest = Static<
  typeof BulkAssignRolesRequestSchema
>;
export type UserRoleQuery = Static<typeof UserRoleQuerySchema>;

export type BulkRoleUpdateRequest = Static<typeof BulkRoleUpdateRequestSchema>;
export type BulkPermissionUpdateRequest = Static<
  typeof BulkPermissionUpdateRequestSchema
>;
export type BulkOperationResponse = Static<typeof BulkOperationResponseSchema>;

export type RbacStats = Static<typeof RbacStatsSchema>;
