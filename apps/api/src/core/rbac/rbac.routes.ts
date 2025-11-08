import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { RbacController } from './rbac.controller';
import { SchemaRefs } from '../../schemas/registry';
import {
  RoleQuerySchema,
  RoleResponseSchema,
  RoleListResponseSchema,
  CreateRoleRequestSchema,
  UpdateRoleRequestSchema,
  PermissionQuerySchema,
  PermissionResponseSchema,
  PermissionListResponseSchema,
  CreatePermissionRequestSchema,
  UpdatePermissionRequestSchema,
  UserRoleQuerySchema,
  UserRoleResponseSchema,
  UserRoleListResponseSchema,
  AssignRoleRequestSchema,
  UpdateUserRoleExpiryRequestSchema,
  BulkAssignRolesRequestSchema,
  BulkRoleUpdateRequestSchema,
  BulkPermissionUpdateRequestSchema,
  BulkOperationSuccessResponseSchema,
  RbacStatsResponseSchema,
  BulkAssignRolesToUserRequestSchema,
  ReplaceUserRolesRequestSchema,
  RoleAssignmentHistoryQuerySchema,
  RoleAssignmentHistoryListResponseSchema,
} from './rbac.schemas';
import { Type } from '@sinclair/typebox';

export interface RbacRoutesOptions {
  controller: RbacController;
}

export async function rbacRoutes(
  fastify: FastifyInstance,
  options: RbacRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // ===== ROLE ROUTES =====

  // List roles
  typedFastify.get(
    '/rbac/roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'roles:list'),
      ],
      schema: {
        description: 'List all roles with filtering and pagination',
        tags: ['RBAC', 'Roles'],
        summary: 'Get paginated list of roles',
        security: [{ bearerAuth: [] }],
        querystring: RoleQuerySchema,
        response: {
          200: RoleListResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
      onError: (request, _reply, error) => {
        request.log.error({ err: error }, 'Error in roles list endpoint');
      },
    },
    controller.getRoles.bind(controller),
  );

  // Get role by ID
  typedFastify.get(
    '/rbac/roles/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'roles:read'),
      ],
      schema: {
        description: 'Get a role by ID with permissions',
        tags: ['RBAC', 'Roles'],
        summary: 'Get role details',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        querystring: Type.Object({
          include_permissions: Type.Optional(Type.Boolean({ default: true })),
        }),
        response: {
          200: RoleResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getRoleById.bind(controller),
  );

  // Create role
  typedFastify.post(
    '/rbac/roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'roles:create'),
      ],
      schema: {
        description: 'Create a new role',
        tags: ['RBAC', 'Roles'],
        summary: 'Create role with permissions',
        security: [{ bearerAuth: [] }],
        body: CreateRoleRequestSchema,
        response: {
          201: RoleResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.createRole.bind(controller),
  );

  // Update role
  typedFastify.put(
    '/rbac/roles/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'roles:update'),
      ],
      schema: {
        description: 'Update a role',
        tags: ['RBAC', 'Roles'],
        summary: 'Update role details and permissions',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: UpdateRoleRequestSchema,
        response: {
          200: RoleResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updateRole.bind(controller),
  );

  // Delete role
  typedFastify.delete(
    '/rbac/roles/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'roles:delete'),
      ],
      schema: {
        description: 'Delete a role',
        tags: ['RBAC', 'Roles'],
        summary: 'Delete role (if not in use)',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: SchemaRefs.OperationResult,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.deleteRole.bind(controller),
  );

  // ===== PERMISSION ROUTES =====

  // List permissions
  typedFastify.get(
    '/rbac/permissions',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'permissions:list'),
      ],
      schema: {
        description: 'List all permissions with filtering and pagination',
        tags: ['RBAC', 'Permissions'],
        summary: 'Get paginated list of permissions',
        security: [{ bearerAuth: [] }],
        querystring: PermissionQuerySchema,
        response: {
          200: PermissionListResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getPermissions.bind(controller),
  );

  // Get permission by ID
  typedFastify.get(
    '/rbac/permissions/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'permissions:read'),
      ],
      schema: {
        description: 'Get a permission by ID',
        tags: ['RBAC', 'Permissions'],
        summary: 'Get permission details',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: PermissionResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getPermissionById.bind(controller),
  );

  // Create permission
  typedFastify.post(
    '/rbac/permissions',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'permissions:create'),
      ],
      schema: {
        description: 'Create a new permission',
        tags: ['RBAC', 'Permissions'],
        summary: 'Create custom permission',
        security: [{ bearerAuth: [] }],
        body: CreatePermissionRequestSchema,
        response: {
          201: PermissionResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.createPermission.bind(controller),
  );

  // Update permission
  typedFastify.put(
    '/rbac/permissions/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'permissions:update'),
      ],
      schema: {
        description: 'Update a permission',
        tags: ['RBAC', 'Permissions'],
        summary: 'Update permission details',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: UpdatePermissionRequestSchema,
        response: {
          200: PermissionResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updatePermission.bind(controller),
  );

  // Delete permission
  typedFastify.delete(
    '/rbac/permissions/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'permissions:delete'),
      ],
      schema: {
        description: 'Delete a permission',
        tags: ['RBAC', 'Permissions'],
        summary: 'Delete custom permission',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: SchemaRefs.OperationResult,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.deletePermission.bind(controller),
  );

  // ===== USER-ROLE ROUTES =====

  // List user roles
  typedFastify.get(
    '/rbac/user-roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-roles:list'),
      ],
      schema: {
        description: 'List user role assignments with filtering',
        tags: ['RBAC', 'User Roles'],
        summary: 'Get paginated list of user role assignments',
        security: [{ bearerAuth: [] }],
        querystring: UserRoleQuerySchema,
        response: {
          200: UserRoleListResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserRoles.bind(controller),
  );

  // Assign role to user
  typedFastify.post(
    '/rbac/users/:id/roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-roles:assign'),
      ],
      schema: {
        description: 'Assign a role to a user',
        tags: ['RBAC', 'User Roles'],
        summary: 'Assign role to user with optional expiration',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: AssignRoleRequestSchema,
        response: {
          201: UserRoleResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.assignRoleToUser.bind(controller),
  );

  // Remove role from user
  typedFastify.delete(
    '/rbac/users/:userId/roles/:roleId',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-roles:remove'),
      ],
      schema: {
        description: 'Remove a role from a user',
        tags: ['RBAC', 'User Roles'],
        summary: 'Remove role assignment from user',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          userId: Type.String({ format: 'uuid' }),
          roleId: Type.String({ format: 'uuid' }),
        }),
        response: {
          200: SchemaRefs.OperationResult,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.removeRoleFromUser.bind(controller),
  );

  // Update user role expiry
  typedFastify.put(
    '/rbac/users/:userId/roles/:roleId/expiry',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-roles:update-expiry'),
      ],
      schema: {
        description: 'Update expiry date for a user role assignment',
        tags: ['RBAC', 'User Roles'],
        summary: 'Set or update expiry date for user role',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          userId: Type.String({ format: 'uuid' }),
          roleId: Type.String({ format: 'uuid' }),
        }),
        body: UpdateUserRoleExpiryRequestSchema,
        response: {
          200: UserRoleResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updateUserRoleExpiry.bind(controller),
  );

  // ===== MULTI-ROLE MANAGEMENT ROUTES =====

  // Bulk assign multiple roles to a single user
  typedFastify.post(
    '/rbac/users/:id/roles/bulk',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-roles:assign'),
      ],
      schema: {
        description: 'Assign multiple roles to a single user',
        tags: ['RBAC', 'User Roles'],
        summary: 'Assign multiple roles to user in one request',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: BulkAssignRolesToUserRequestSchema,
        response: {
          201: {
            type: 'array',
            items: UserRoleResponseSchema,
          },
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.bulkAssignRolesToUser.bind(controller),
  );

  // Replace all user roles with a new set
  typedFastify.put(
    '/rbac/users/:id/roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-roles:assign'),
      ],
      schema: {
        description: 'Replace all user roles with a new set',
        tags: ['RBAC', 'User Roles'],
        summary: 'Replace user roles (removes all existing, assigns new ones)',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: ReplaceUserRolesRequestSchema,
        response: {
          200: {
            type: 'array',
            items: UserRoleResponseSchema,
          },
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.replaceUserRoles.bind(controller),
  );

  // ===== BULK OPERATIONS =====

  // Bulk assign roles
  typedFastify.post(
    '/rbac/bulk/assign-roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'bulk:assign-roles'),
      ],
      schema: {
        description: 'Bulk assign role to multiple users',
        tags: ['RBAC', 'Bulk Operations'],
        summary: 'Assign same role to multiple users',
        security: [{ bearerAuth: [] }],
        body: BulkAssignRolesRequestSchema,
        response: {
          200: BulkOperationSuccessResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.bulkAssignRoles.bind(controller),
  );

  // Bulk update roles
  typedFastify.post(
    '/rbac/bulk/update-roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'bulk:update-roles'),
      ],
      schema: {
        description: 'Bulk update multiple roles',
        tags: ['RBAC', 'Bulk Operations'],
        summary: 'Update multiple roles at once',
        security: [{ bearerAuth: [] }],
        body: BulkRoleUpdateRequestSchema,
        response: {
          200: BulkOperationSuccessResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.bulkUpdateRoles.bind(controller),
  );

  // Bulk update permissions
  typedFastify.post(
    '/rbac/bulk/update-permissions',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'bulk:update-permissions'),
      ],
      schema: {
        description: 'Bulk update multiple permissions',
        tags: ['RBAC', 'Bulk Operations'],
        summary: 'Update multiple permissions at once',
        security: [{ bearerAuth: [] }],
        body: BulkPermissionUpdateRequestSchema,
        response: {
          200: BulkOperationSuccessResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.bulkUpdatePermissions.bind(controller),
  );

  // ===== UTILITY ROUTES =====

  // Get RBAC statistics
  typedFastify.get(
    '/rbac/stats',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'stats:read'),
      ],
      schema: {
        description: 'Get RBAC system statistics',
        tags: ['RBAC', 'Statistics'],
        summary: 'Get overview of roles, permissions, and assignments',
        security: [{ bearerAuth: [] }],
        response: {
          200: RbacStatsResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getRbacStats.bind(controller),
  );

  // Get role hierarchy
  typedFastify.get(
    '/rbac/roles/hierarchy',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'roles:read-hierarchy'),
      ],
      schema: {
        description: 'Get role hierarchy as tree structure',
        tags: ['RBAC', 'Roles'],
        summary: 'Get roles organized by hierarchy',
        security: [{ bearerAuth: [] }],
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Array(Type.Any()), // Role with children
            meta: Type.Object({
              requestId: Type.String(),
              timestamp: Type.String(),
              version: Type.String(),
            }),
          }),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getRoleHierarchy.bind(controller),
  );

  // Get permissions by category
  typedFastify.get(
    '/rbac/permissions/by-category',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'permissions:read-by-category'),
      ],
      schema: {
        description: 'Get permissions grouped by category',
        tags: ['RBAC', 'Permissions'],
        summary: 'Get permissions organized by category',
        security: [{ bearerAuth: [] }],
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Record(Type.String(), Type.Array(Type.Any())), // Category -> Permissions
            meta: Type.Object({
              requestId: Type.String(),
              timestamp: Type.String(),
              version: Type.String(),
            }),
          }),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getPermissionsByCategory.bind(controller),
  );

  // Get user effective permissions
  typedFastify.get(
    '/rbac/users/:id/effective-permissions',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'user-permissions:read'),
      ],
      schema: {
        description: 'Get all effective permissions for a user',
        tags: ['RBAC', 'User Roles'],
        summary: 'Get combined permissions from all user roles',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Array(Type.Any()), // Permissions
            meta: Type.Object({
              requestId: Type.String(),
              timestamp: Type.String(),
              version: Type.String(),
            }),
          }),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserEffectivePermissions.bind(controller),
  );

  // ===== ROLE ASSIGNMENT HISTORY ROUTES =====

  // Get role assignment history (paginated)
  typedFastify.get(
    '/rbac/history',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'history:read'),
      ],
      schema: {
        description: 'Get role assignment audit history',
        tags: ['RBAC', 'History'],
        summary: 'Get paginated role assignment history',
        security: [{ bearerAuth: [] }],
        querystring: RoleAssignmentHistoryQuerySchema,
        response: {
          200: RoleAssignmentHistoryListResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getRoleAssignmentHistory.bind(controller),
  );

  // Get user's role assignment history
  typedFastify.get(
    '/rbac/users/:id/history',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('rbac', 'history:read'),
      ],
      schema: {
        description: 'Get role assignment history for a specific user',
        tags: ['RBAC', 'History'],
        summary: 'Get role assignment history for user',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Array(Type.Any()), // RoleAssignmentHistory array
            meta: Type.Object({
              requestId: Type.String(),
              timestamp: Type.String(),
              version: Type.String(),
            }),
          }),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserRoleHistory.bind(controller),
  );
}
