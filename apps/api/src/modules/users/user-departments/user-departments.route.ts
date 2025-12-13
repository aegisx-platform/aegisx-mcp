import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserDepartmentsController } from './user-departments.controller';
import {
  UserDepartmentResponseSchema,
  UserDepartmentsListResponseSchema,
  DepartmentUsersListResponseSchema,
  AssignUserToDepartmentSchema,
  UserIdParamSchema,
  DepartmentIdParamSchema,
  UserDepartmentParamSchema,
  GetUserDepartmentsQuerySchema,
  GetDepartmentUsersQuerySchema,
  PermissionCheckResponseSchema,
  UserPrimaryDepartmentResponseSchema,
} from './user-departments.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface UserDepartmentsRoutesOptions extends FastifyPluginOptions {
  controller: UserDepartmentsController;
}

/**
 * User-Departments Routes
 *
 * REST API endpoints for managing user-department relationships.
 * Supports multi-department users, granular permissions, and temporal assignments.
 *
 * Endpoints:
 * 1. GET /users/:userId/departments - List user's departments
 * 2. POST /users/:userId/departments - Assign user to department
 * 3. DELETE /users/:userId/departments/:deptId - Remove assignment
 * 4. PUT /users/:userId/departments/:deptId/primary - Set as primary
 * 5. GET /departments/:deptId/users - List department users
 * 6. GET /users/:userId/departments/:deptId/permissions - Check permissions
 * 7. GET /users/:userId/departments/primary - Get primary department
 */
export async function userDepartmentsRoutes(
  fastify: FastifyInstance,
  options: UserDepartmentsRoutesOptions,
) {
  const { controller } = options;

  /**
   * 1. GET /users/:userId/departments
   *
   * List all active department assignments for a user.
   * Returns departments with their permissions and validity dates.
   *
   * Query Parameters:
   * - activeOnly (boolean): Return only active assignments (default: true)
   * - page (number): Pagination page (default: 1)
   * - limit (number): Items per page (default: 20, max: 100)
   * - sort (string): Sort fields (e.g., isPrimary:desc)
   *
   * Response: 200 - List of user's departments with pagination
   * Error Responses:
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: User not found
   * - 500: Server error
   */
  fastify.get('/users/:userId/departments', {
    schema: {
      tags: ['User Management: Departments'],
      summary: "List user's department assignments",
      description:
        'Get all active department assignments for a user with their permissions',
      params: UserIdParamSchema,
      querystring: GetUserDepartmentsQuerySchema,
      response: {
        200: UserDepartmentsListResponseSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('userDepartments', 'read'),
    ],
    handler: controller.listUserDepartments.bind(controller),
  });

  /**
   * 2. POST /users/:userId/departments
   *
   * Assign a user to a department.
   * Supports multiple departments per user with granular permissions.
   *
   * Request Body:
   * - departmentId (number, required): Department to assign
   * - isPrimary (boolean, optional): Set as primary (default: false)
   * - assignedRole (string, optional): Role name
   * - permissions (object, optional): Granular permission flags
   * - validFrom (date, optional): When assignment becomes valid
   * - validUntil (date, optional): When assignment expires
   * - notes (string, optional): Additional notes
   *
   * Response: 201 - Assignment created
   * Error Responses:
   * - 400: Invalid request
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: User or department not found
   * - 409: User already assigned to this department
   * - 422: Validation failed (e.g., invalid date range)
   * - 500: Server error
   */
  fastify.post('/users/:userId/departments', {
    schema: {
      tags: ['User Management: Departments'],
      summary: 'Assign user to department',
      description:
        'Assign a user to a department with optional granular permissions and temporal validity',
      params: UserIdParamSchema,
      body: AssignUserToDepartmentSchema,
      response: {
        201: UserDepartmentResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('userDepartments', 'create'),
    ],
    handler: controller.assignUserToDepartment.bind(controller),
  });

  /**
   * 3. DELETE /users/:userId/departments/:deptId
   *
   * Remove a user from a department (soft delete).
   * Sets valid_until to NOW() to mark assignment as inactive.
   * Preserves assignment history for audit purposes.
   *
   * Cannot remove user from their only primary department.
   * Must reassign primary first.
   *
   * Response: 200 - Assignment removed
   * Error Responses:
   * - 400: Cannot remove only primary
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: User or assignment not found
   * - 500: Server error
   */
  fastify.delete('/users/:userId/departments/:deptId', {
    schema: {
      tags: ['User Management: Departments'],
      summary: 'Remove user from department',
      description: 'Soft delete: marks user-department assignment as inactive',
      params: UserDepartmentParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('userDepartments', 'delete'),
    ],
    handler: controller.removeUserFromDepartment.bind(controller),
  });

  /**
   * 4. PUT /users/:userId/departments/:deptId/primary
   *
   * Set a department as the user's primary department.
   * Automatically unsets other departments as primary.
   *
   * Primary department is used for:
   * - Default department for budget request creation
   * - User's "home" department context
   *
   * Response: 200 - Primary department updated
   * Error Responses:
   * - 400: Assignment not yet valid or expired
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: User or assignment not found
   * - 500: Server error
   */
  fastify.put('/users/:userId/departments/:deptId/primary', {
    schema: {
      tags: ['User Management: Departments'],
      summary: 'Set department as primary',
      description:
        "Set a user's primary department. Automatically unsets other primaries.",
      params: UserDepartmentParamSchema,
      response: {
        200: UserDepartmentResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('userDepartments', 'update'),
    ],
    handler: controller.setPrimaryDepartment.bind(controller),
  });

  /**
   * 5. GET /departments/:deptId/users
   *
   * List all users assigned to a department.
   * Returns user details along with their assignment information and permissions.
   *
   * Query Parameters:
   * - activeOnly (boolean): Return only active assignments (default: true)
   * - page (number): Pagination page (default: 1)
   * - limit (number): Items per page (default: 20, max: 100)
   * - sort (string): Sort fields (e.g., isPrimary:desc,userEmail:asc)
   *
   * Response: 200 - List of department users with pagination
   * Error Responses:
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: Department not found
   * - 500: Server error
   */
  fastify.get('/departments/:deptId/users', {
    schema: {
      tags: ['User Management: Departments'],
      summary: 'List department users',
      description:
        'Get all users assigned to a department with their assignment details',
      params: DepartmentIdParamSchema,
      querystring: GetDepartmentUsersQuerySchema,
      response: {
        200: DepartmentUsersListResponseSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('userDepartments', 'read'),
    ],
    handler: controller.listDepartmentUsers.bind(controller),
  });

  /**
   * 6. GET /users/:userId/departments/:deptId/permissions
   *
   * Check user's permissions in a specific department.
   * Returns individual permission flags for the assignment.
   *
   * Permissions checked:
   * - canCreateRequests: Can create requests in department
   * - canEditRequests: Can edit requests in department
   * - canSubmitRequests: Can submit requests in department
   * - canApproveRequests: Can approve requests in department
   * - canViewReports: Can view department reports
   *
   * Response: 200 - Permission flags
   * Error Responses:
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 500: Server error
   */
  fastify.get('/users/:userId/departments/:deptId/permissions', {
    schema: {
      tags: ['User Management: Departments'],
      summary: 'Check user permissions in department',
      description:
        'Get granular permission flags for user in a specific department',
      params: UserDepartmentParamSchema,
      response: {
        200: PermissionCheckResponseSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate],
    handler: controller.checkPermissions.bind(controller),
  });

  /**
   * 7. GET /users/:userId/departments/primary
   *
   * Get user's primary department.
   * Useful for operations that need the primary department context,
   * such as budget request creation.
   *
   * Response: 200 - Primary department info
   * Error Responses:
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: User has no primary department
   * - 500: Server error
   */
  fastify.get('/users/:userId/departments/primary', {
    schema: {
      tags: ['User Management: Departments'],
      summary: "Get user's primary department",
      description: 'Retrieve the primary department for a user',
      params: UserIdParamSchema,
      response: {
        200: UserPrimaryDepartmentResponseSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate],
    handler: controller.getUserPrimaryDepartment.bind(controller),
  });
}
