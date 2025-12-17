import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../../schemas/base.schemas';

/**
 * User Department Schemas
 *
 * TypeBox schemas for user-department relationship endpoints.
 *
 * Note: These schemas represent organizational structure only.
 * Department permissions are managed through the RBAC system.
 * See /rbac endpoints for permission management.
 */

// ==================== BASE SCHEMAS ====================

/**
 * User Department Schema (Base)
 *
 * Represents a user-department assignment with core organizational details.
 * This schema defines organizational structure only - permissions are managed
 * through the RBAC system. See /rbac endpoints for permission management.
 */
export const UserDepartmentSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
      description: 'Assignment unique identifier',
    }),
    userId: Type.String({
      format: 'uuid',
      description: 'User ID',
    }),
    departmentId: Type.Number({
      description: 'Department ID',
    }),
    isPrimary: Type.Boolean({
      description: 'Whether this is the primary department for the user',
    }),
    assignedRole: Type.Union([Type.String(), Type.Null()], {
      description:
        'Organizational role/title within this department (e.g., "Manager", "Staff")',
    }),
    validFrom: Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
      description: 'Assignment start date (null means active immediately)',
    }),
    validUntil: Type.Union(
      [Type.String({ format: 'date-time' }), Type.Null()],
      {
        description:
          'Assignment end date (null means no expiration, setting to NOW() performs soft delete)',
      },
    ),
    assignedAt: Type.String({
      format: 'date-time',
      description: 'Timestamp when the assignment was created',
    }),
  },
  {
    $id: 'UserDepartment',
    description:
      'User-department assignment (organizational structure only). Permissions are managed via RBAC system.',
  },
);

export type UserDepartment = Static<typeof UserDepartmentSchema>;

/**
 * Department Detail Schema (Extended)
 *
 * Extended version with department code and name.
 * Used when department details are joined and returned with the assignment.
 */
export const DepartmentDetailSchema = Type.Intersect(
  [
    UserDepartmentSchema,
    Type.Object({
      departmentCode: Type.String({
        description: 'Department code',
      }),
      departmentName: Type.String({
        description: 'Department name',
      }),
    }),
  ],
  {
    $id: 'DepartmentDetail',
    description:
      'Department assignment with full department details (organizational structure only). Permissions are managed via RBAC system.',
  },
);

export type DepartmentDetail = Static<typeof DepartmentDetailSchema>;

// ==================== REQUEST SCHEMAS ====================

/**
 * Assign Department Request Schema
 *
 * Request body for assigning a user to a department.
 * Only handles organizational structure - permissions are managed via RBAC.
 */
export const AssignDepartmentRequestSchema = Type.Object(
  {
    departmentId: Type.Number({
      description: 'ID of the department to assign the user to',
    }),
    isPrimary: Type.Optional(
      Type.Boolean({
        description:
          'Whether this should be the primary department (defaults to false)',
        default: false,
      }),
    ),
    assignedRole: Type.Optional(
      Type.Union([Type.String(), Type.Null()], {
        description:
          'Organizational role/title within the department (e.g., "Manager", "Staff")',
      }),
    ),
    validFrom: Type.Optional(
      Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
        description:
          'Assignment start date (omit or null for immediate activation)',
      }),
    ),
    validUntil: Type.Optional(
      Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
        description: 'Assignment end date (omit or null for no expiration)',
      }),
    ),
  },
  {
    $id: 'AssignDepartmentRequest',
    description:
      'Request to assign a user to a department. Note: Department permissions are managed through RBAC system. See /rbac endpoints for permission management.',
  },
);

export type AssignDepartmentRequest = Static<
  typeof AssignDepartmentRequestSchema
>;

/**
 * Update Department Assignment Request Schema
 *
 * Request body for updating a user's department assignment.
 * Only handles organizational structure - permissions are managed via RBAC.
 */
export const UpdateDepartmentRequestSchema = Type.Object(
  {
    isPrimary: Type.Optional(
      Type.Boolean({
        description: 'Update whether this is the primary department',
      }),
    ),
    assignedRole: Type.Optional(
      Type.Union([Type.String(), Type.Null()], {
        description:
          'Update the organizational role/title within the department',
      }),
    ),
    validFrom: Type.Optional(
      Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
        description: 'Update the assignment start date',
      }),
    ),
    validUntil: Type.Optional(
      Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
        description: 'Update the assignment end date',
      }),
    ),
  },
  {
    $id: 'UpdateDepartmentRequest',
    description:
      'Request to update a user-department assignment. Note: Department permissions are managed through RBAC system. See /rbac endpoints for permission management.',
  },
);

export type UpdateDepartmentRequest = Static<
  typeof UpdateDepartmentRequestSchema
>;

// ==================== RESPONSE SCHEMAS ====================

/**
 * User Departments Response Schema
 *
 * Response for GET /users/me/departments
 * Returns all active department assignments (without department details).
 * Use GET /users/me/departments/primary for full department details.
 * Permissions are managed through RBAC system.
 */
export const UserDepartmentsResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    departments: Type.Array(UserDepartmentSchema, {
      description:
        'Array of active department assignments (organizational structure only, use departmentId to fetch details)',
    }),
    count: Type.Number({
      description: 'Number of active department assignments',
    }),
  }),
);

export type UserDepartmentsResponse = Static<
  typeof UserDepartmentsResponseSchema
>;

/**
 * Primary Department Response Schema
 *
 * Response for GET /users/me/departments/primary
 * Returns the user's primary department with organizational details only.
 * Permissions are managed through RBAC system.
 */
export const PrimaryDepartmentResponseSchema = ApiSuccessResponseSchema(
  DepartmentDetailSchema,
);

export type PrimaryDepartmentResponse = Static<
  typeof PrimaryDepartmentResponseSchema
>;

/**
 * Department Assignment Response Schema
 *
 * Response for POST/PUT operations on department assignments.
 * Returns the created or updated assignment details.
 */
export const DepartmentAssignmentResponseSchema = ApiSuccessResponseSchema(
  DepartmentDetailSchema,
);

export type DepartmentAssignmentResponse = Static<
  typeof DepartmentAssignmentResponseSchema
>;

// ==================== EXPORT ALL SCHEMAS ====================

export const userDepartmentsSchemas = {
  // Base schemas
  'user-department': UserDepartmentSchema,
  'department-detail': DepartmentDetailSchema,
  // Response schemas
  'user-departments-response': UserDepartmentsResponseSchema,
  'primary-department-response': PrimaryDepartmentResponseSchema,
  'department-assignment-response': DepartmentAssignmentResponseSchema,
  // Request schemas
  'assign-department-request': AssignDepartmentRequestSchema,
  'update-department-request': UpdateDepartmentRequestSchema,
};
