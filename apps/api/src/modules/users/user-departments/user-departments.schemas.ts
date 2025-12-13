import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../schemas/base.schemas';

/**
 * User-Department Assignment Schema
 *
 * Represents a user's assignment to a department with granular permissions
 * and temporal validity dates.
 */
export const UserDepartmentAssignmentSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'Unique assignment identifier',
  }),
  userId: Type.String({ format: 'uuid', description: 'User ID' }),
  departmentId: Type.Number({ description: 'Department ID' }),
  hospitalId: Type.Optional(
    Type.Number({ description: 'Hospital ID (for multi-hospital support)' }),
  ),
  isPrimary: Type.Boolean({
    description: "Whether this is the user's primary department",
  }),
  assignedRole: Type.Optional(
    Type.String({ description: 'Role assigned in this department' }),
  ),
  canCreateRequests: Type.Boolean({
    description: 'Permission to create requests in this department',
  }),
  canEditRequests: Type.Boolean({
    description: 'Permission to edit requests in this department',
  }),
  canSubmitRequests: Type.Boolean({
    description: 'Permission to submit requests in this department',
  }),
  canApproveRequests: Type.Boolean({
    description: 'Permission to approve requests in this department',
  }),
  canViewReports: Type.Boolean({
    description: 'Permission to view reports in this department',
  }),
  validFrom: Type.Optional(
    Type.String({
      format: 'date',
      description: 'Date when assignment becomes valid',
    }),
  ),
  validUntil: Type.Optional(
    Type.String({
      format: 'date',
      description: 'Date when assignment expires (soft delete)',
    }),
  ),
  assignedBy: Type.Optional(
    Type.String({
      format: 'uuid',
      description: 'User who made this assignment',
    }),
  ),
  assignedAt: Type.String({
    format: 'date-time',
    description: 'When this assignment was made',
  }),
  notes: Type.Optional(
    Type.String({ description: 'Additional notes about this assignment' }),
  ),
  createdAt: Type.String({
    format: 'date-time',
    description: 'When record was created',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'When record was last updated',
  }),
});

/**
 * User's Department with Department Details
 *
 * Extended schema that includes department information (code, name)
 */
export const UserDepartmentWithDetailsSchema = Type.Intersect([
  UserDepartmentAssignmentSchema,
  Type.Object({
    departmentCode: Type.Optional(
      Type.String({ description: 'Department code' }),
    ),
    departmentName: Type.Optional(
      Type.String({ description: 'Department name' }),
    ),
  }),
]);

/**
 * Department User with User Details
 *
 * Department member info with user details (email, name)
 */
export const DepartmentUserSchema = Type.Intersect([
  UserDepartmentAssignmentSchema,
  Type.Object({
    userEmail: Type.String({ format: 'email', description: 'User email' }),
    userFirstName: Type.Optional(
      Type.String({ description: 'User first name' }),
    ),
    userLastName: Type.Optional(Type.String({ description: 'User last name' })),
  }),
]);

/**
 * Permission Flags Schema
 *
 * Granular permissions for a user in a department
 */
export const PermissionFlagsSchema = Type.Object({
  canCreateRequests: Type.Boolean({ description: 'Can create requests' }),
  canEditRequests: Type.Boolean({ description: 'Can edit requests' }),
  canSubmitRequests: Type.Boolean({ description: 'Can submit requests' }),
  canApproveRequests: Type.Boolean({ description: 'Can approve requests' }),
  canViewReports: Type.Boolean({ description: 'Can view reports' }),
});

// ============================================================================
// REQUEST SCHEMAS (for POST, PUT operations)
// ============================================================================

/**
 * Assign User to Department Request
 *
 * POST /users/:userId/departments
 */
export const AssignUserToDepartmentSchema = Type.Object({
  departmentId: Type.Number({ description: 'Department to assign to' }),
  isPrimary: Type.Optional(
    Type.Boolean({
      description: 'Set as primary department (default: false)',
      default: false,
    }),
  ),
  assignedRole: Type.Optional(
    Type.String({ maxLength: 50, description: 'Role in this department' }),
  ),
  permissions: Type.Optional(PermissionFlagsSchema),
  validFrom: Type.Optional(
    Type.String({
      format: 'date',
      description: 'Date assignment becomes valid',
    }),
  ),
  validUntil: Type.Optional(
    Type.String({ format: 'date', description: 'Date assignment expires' }),
  ),
  notes: Type.Optional(
    Type.String({ maxLength: 500, description: 'Notes about this assignment' }),
  ),
});

/**
 * Update Assignment to Set as Primary
 *
 * PUT /users/:userId/departments/:deptId/primary
 */
export const SetPrimaryDepartmentSchema = Type.Object({
  // Empty body - the operation is determined by the URL
});

/**
 * Remove User from Department Request
 *
 * DELETE /users/:userId/departments/:deptId
 * (no body required)
 */

/**
 * Update Department Permissions Request
 *
 * PUT /users/:userId/departments/:deptId
 */
export const UpdateDepartmentPermissionsSchema = Type.Partial(
  Type.Object({
    isPrimary: Type.Boolean({ description: 'Update primary status' }),
    assignedRole: Type.String({ maxLength: 50, description: 'Update role' }),
    permissions: PermissionFlagsSchema,
    validFrom: Type.String({
      format: 'date',
      description: 'Update valid from date',
    }),
    validUntil: Type.String({
      format: 'date',
      description: 'Update valid until date',
    }),
    notes: Type.String({ maxLength: 500, description: 'Update notes' }),
  }),
);

// ============================================================================
// PARAMETER SCHEMAS
// ============================================================================

/**
 * User ID parameter
 */
export const UserIdParamSchema = Type.Object({
  userId: Type.String({ format: 'uuid', description: 'User ID' }),
});

/**
 * Department ID parameter
 */
export const DepartmentIdParamSchema = Type.Object({
  deptId: Type.Number({ description: 'Department ID' }),
});

/**
 * User and Department ID parameters
 */
export const UserDepartmentParamSchema = Type.Intersect([
  UserIdParamSchema,
  DepartmentIdParamSchema,
]);

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Get user departments - list query
 */
export const GetUserDepartmentsQuerySchema = Type.Object({
  activeOnly: Type.Optional(
    Type.Boolean({
      default: true,
      description: 'Return only active assignments (default: true)',
    }),
  ),
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  sort: Type.Optional(
    Type.String({
      pattern:
        '^[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?(,[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?)*$',
      description: 'Sort by field(s): field1:asc,field2:desc',
      examples: ['isPrimary:desc', 'departmentId:asc'],
    }),
  ),
});

/**
 * Get department users - list query
 */
export const GetDepartmentUsersQuerySchema = Type.Object({
  activeOnly: Type.Optional(
    Type.Boolean({
      default: true,
      description: 'Return only active assignments (default: true)',
    }),
  ),
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  sort: Type.Optional(
    Type.String({
      pattern:
        '^[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?(,[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?)*$',
      description: 'Sort by field(s): field1:asc,field2:desc',
      examples: ['isPrimary:desc', 'userEmail:asc'],
    }),
  ),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Single assignment response
 */
export const UserDepartmentResponseSchema = ApiSuccessResponseSchema(
  UserDepartmentAssignmentSchema,
);

/**
 * Assignment with details response
 */
export const UserDepartmentWithDetailsResponseSchema = ApiSuccessResponseSchema(
  UserDepartmentWithDetailsSchema,
);

/**
 * List of user's departments response
 */
export const UserDepartmentsListResponseSchema = PaginatedResponseSchema(
  UserDepartmentAssignmentSchema,
);

/**
 * List of department users response
 */
export const DepartmentUsersListResponseSchema =
  PaginatedResponseSchema(DepartmentUserSchema);

/**
 * Permission check response
 */
export const PermissionCheckResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    hasPermission: Type.Boolean(),
    permission: Type.String(),
  }),
);

/**
 * User primary department response
 */
export const UserPrimaryDepartmentResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    departmentId: Type.Number(),
    departmentCode: Type.Optional(Type.String()),
    departmentName: Type.Optional(Type.String()),
    isPrimary: Type.Boolean(),
  }),
);

// ============================================================================
// ERROR RESPONSE SCHEMAS (for reference)
// ============================================================================

/**
 * Generic error response (reference only - imported from base schemas)
 */
export const ErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Any()),
  }),
});

// ============================================================================
// TYPE EXPORTS (TypeScript types derived from schemas)
// ============================================================================

export type UserDepartmentAssignment = Static<
  typeof UserDepartmentAssignmentSchema
>;
export type UserDepartmentWithDetails = Static<
  typeof UserDepartmentWithDetailsSchema
>;
export type DepartmentUser = Static<typeof DepartmentUserSchema>;
export type PermissionFlags = Static<typeof PermissionFlagsSchema>;

export type AssignUserToDepartment = Static<
  typeof AssignUserToDepartmentSchema
>;
export type SetPrimaryDepartment = Static<typeof SetPrimaryDepartmentSchema>;
export type UpdateDepartmentPermissions = Static<
  typeof UpdateDepartmentPermissionsSchema
>;

export type UserIdParam = Static<typeof UserIdParamSchema>;
export type DepartmentIdParam = Static<typeof DepartmentIdParamSchema>;
export type UserDepartmentParam = Static<typeof UserDepartmentParamSchema>;

export type GetUserDepartmentsQuery = Static<
  typeof GetUserDepartmentsQuerySchema
>;
export type GetDepartmentUsersQuery = Static<
  typeof GetDepartmentUsersQuerySchema
>;
