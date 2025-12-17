import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { SchemaRefs } from '../../../schemas/registry';
import { UsersController } from './users.controller';

export interface UsersRoutesOptions {
  controller: UsersController;
}

export async function usersRoutes(
  fastify: FastifyInstance,
  options: UsersRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // List all users (admin/manager only)
  typedFastify.get(
    '/users',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'read'),
      ],
      schema: {
        description: 'List all users with pagination and filters',
        tags: ['Users'],
        summary: 'Get a paginated list of users',
        security: [{ bearerAuth: [] }],
        querystring: SchemaRefs.module('users', 'list-users-query'),
        response: {
          200: SchemaRefs.module('users', 'list-users-response'),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.listUsers.bind(controller),
  );

  // Get user by ID (admin/manager only)
  typedFastify.get(
    '/users/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'read'),
      ],
      schema: {
        description: 'Get a user by ID',
        tags: ['Users'],
        summary: 'Get user details',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: SchemaRefs.module('users', 'get-user-response'),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUser.bind(controller),
  );

  // Create user (admin only)
  typedFastify.post(
    '/users',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'create'),
      ],
      schema: {
        description: 'Create a new user',
        tags: ['Users'],
        summary: 'Create user',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'create-user-request'),
        response: {
          201: SchemaRefs.module('users', 'create-user-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          409: SchemaRefs.Conflict,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.createUser.bind(controller),
  );

  // Update user (admin only)
  typedFastify.put(
    '/users/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'update'),
      ],
      schema: {
        description: 'Update a user',
        tags: ['Users'],
        summary: 'Update user details',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: SchemaRefs.module('users', 'update-user-request'),
        response: {
          200: SchemaRefs.module('users', 'update-user-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          409: SchemaRefs.Conflict,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updateUser.bind(controller),
  );

  // Change user password (admin only)
  typedFastify.put(
    '/:id/password',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'update-password'),
      ],
      schema: {
        description: 'Change a user password',
        tags: ['Users'],
        summary: 'Reset user password (admin only)',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: SchemaRefs.module('users', 'change-user-password-request'),
        response: {
          200: SchemaRefs.module('users', 'success-message-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.changeUserPassword.bind(controller),
  );

  // Delete user (admin only)
  typedFastify.delete(
    '/users/:id',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'delete'),
      ],
      schema: {
        description: 'Delete a user',
        tags: ['Users'],
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: SchemaRefs.module('users', 'delete-user-response'),
          400: { $ref: 'api-error-response#' }, // Business logic errors, not validation errors
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: { $ref: 'api-error-response#' }, // Generic not found errors
          500: { $ref: 'api-error-response#' }, // Internal server errors
        },
      },
    },
    controller.deleteUser.bind(controller),
  );

  // Get all roles (admin/manager only)
  typedFastify.get(
    '/roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.authorize(['admin', 'manager']),
      ],
      schema: {
        description: 'Get all available roles',
        tags: ['Users'],
        summary: 'List all roles',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('users', 'list-roles-response'),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.listRoles.bind(controller),
  );

  // ===== PROFILE ROUTES =====
  // NOTE: All profile routes (including password change) moved to user-profile module
  // Use /api/v1/platform/profile/password for user self-service password changes

  // ===== MULTI-ROLE MANAGEMENT =====

  // Get user roles
  typedFastify.get(
    '/users/:id/roles',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'read'),
      ],
      schema: {
        description: 'Get all roles assigned to a user',
        tags: ['Users', 'Multi-Role Management'],
        summary: 'Retrieve user roles',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        response: {
          200: SchemaRefs.module('users', 'get-user-roles-response'),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserRoles.bind(controller),
  );

  // Assign roles to user
  typedFastify.post(
    '/users/:id/roles/assign',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'update'),
      ],
      schema: {
        description: 'Assign one or more roles to a user',
        tags: ['Users', 'Multi-Role Management'],
        summary: 'Assign roles to user',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: SchemaRefs.module('users', 'assign-roles-to-user-request'),
        response: {
          200: SchemaRefs.module('users', 'role-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.assignRolesToUser.bind(controller),
  );

  // Remove role from user
  typedFastify.post(
    '/users/:id/roles/remove',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'update'),
      ],
      schema: {
        description: 'Remove a role from a user',
        tags: ['Users', 'Multi-Role Management'],
        summary: 'Remove role from user',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: SchemaRefs.module('users', 'remove-role-from-user-request'),
        response: {
          200: SchemaRefs.module('users', 'role-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.removeRoleFromUser.bind(controller),
  );

  // Update role expiry
  typedFastify.post(
    '/users/:id/roles/expiry',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'update'),
      ],
      schema: {
        description: 'Update the expiry date of a user role assignment',
        tags: ['Users', 'Multi-Role Management'],
        summary: 'Update role expiry date',
        security: [{ bearerAuth: [] }],
        params: SchemaRefs.UuidParam,
        body: SchemaRefs.module('users', 'update-role-expiry-request'),
        response: {
          200: SchemaRefs.module('users', 'role-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.updateRoleExpiry.bind(controller),
  );

  // ===== BULK OPERATIONS =====

  // Bulk activate users (admin only)
  typedFastify.post(
    '/users/bulk/activate',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'bulk:activate'),
      ],
      schema: {
        description: 'Bulk activate multiple users',
        tags: ['Users', 'Bulk Operations'],
        summary: 'Activate multiple users at once',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'bulk-status-change-request'),
        response: {
          200: SchemaRefs.module('users', 'bulk-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          422: SchemaRefs.ValidationError,
          429: {
            description: 'Rate limit exceeded',
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', const: 'RATE_LIMIT_EXCEEDED' },
                  message: { type: 'string' },
                  retryAfter: { type: 'number' },
                },
              },
            },
          },
          500: SchemaRefs.ServerError,
        },
      },
      onError: (request, _reply, error) => {
        request.log.error({ err: error }, 'Error in bulk activate endpoint');
      },
    },
    controller.bulkActivateUsers.bind(controller),
  );

  // Bulk deactivate users (admin only)
  typedFastify.post(
    '/users/bulk/deactivate',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'bulk:deactivate'),
      ],
      schema: {
        description: 'Bulk deactivate multiple users',
        tags: ['Users', 'Bulk Operations'],
        summary: 'Deactivate multiple users at once',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'bulk-status-change-request'),
        response: {
          200: SchemaRefs.module('users', 'bulk-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          422: SchemaRefs.ValidationError,
          429: {
            description: 'Rate limit exceeded',
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', const: 'RATE_LIMIT_EXCEEDED' },
                  message: { type: 'string' },
                  retryAfter: { type: 'number' },
                },
              },
            },
          },
          500: SchemaRefs.ServerError,
        },
      },
      onError: (request, _reply, error) => {
        request.log.error({ err: error }, 'Error in bulk deactivate endpoint');
      },
    },
    controller.bulkDeactivateUsers.bind(controller),
  );

  // Bulk delete users (admin only)
  typedFastify.post(
    '/users/bulk/delete',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'bulk:delete'),
      ],
      schema: {
        description: 'Bulk soft delete multiple users',
        tags: ['Users', 'Bulk Operations'],
        summary: 'Soft delete multiple users at once',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'bulk-user-ids-request'),
        response: {
          200: SchemaRefs.module('users', 'bulk-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          422: SchemaRefs.ValidationError,
          429: {
            description: 'Rate limit exceeded',
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', const: 'RATE_LIMIT_EXCEEDED' },
                  message: { type: 'string' },
                  retryAfter: { type: 'number' },
                },
              },
            },
          },
          500: SchemaRefs.ServerError,
        },
      },
      onError: (request, _reply, error) => {
        request.log.error({ err: error }, 'Error in bulk delete endpoint');
      },
    },
    controller.bulkDeleteUsers.bind(controller),
  );

  // Bulk role change (admin only)
  typedFastify.post(
    '/users/bulk/role-change',
    {
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
      schema: {
        description: 'Bulk change roles for multiple users',
        tags: ['Users', 'Bulk Operations'],
        summary: 'Change roles for multiple users at once',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'bulk-role-change-request'),
        response: {
          200: SchemaRefs.module('users', 'bulk-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          422: SchemaRefs.ValidationError,
          429: {
            description: 'Rate limit exceeded',
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', const: 'RATE_LIMIT_EXCEEDED' },
                  message: { type: 'string' },
                  retryAfter: { type: 'number' },
                },
              },
            },
          },
          500: SchemaRefs.ServerError,
        },
      },
      onError: (request, _reply, error) => {
        request.log.error({ err: error }, 'Error in bulk role change endpoint');
      },
    },
    controller.bulkChangeUserRoles.bind(controller),
  );

  // Bulk change user status (admin only)
  typedFastify.post(
    '/users/bulk/change-status',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'bulk:change-status'),
      ],
      schema: {
        description: 'Bulk change status for multiple users',
        tags: ['Users', 'Bulk Operations'],
        summary: 'Change status for multiple users at once',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'bulk-change-status-request'),
        response: {
          200: SchemaRefs.module('users', 'bulk-operation-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          422: SchemaRefs.ValidationError,
          429: {
            description: 'Rate limit exceeded',
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', const: 'RATE_LIMIT_EXCEEDED' },
                  message: { type: 'string' },
                  retryAfter: { type: 'number' },
                },
              },
            },
          },
          500: SchemaRefs.ServerError,
        },
      },
      onError: (request, _reply, error) => {
        request.log.error(
          { err: error },
          'Error in bulk change status endpoint',
        );
      },
    },
    controller.bulkChangeUserStatus.bind(controller),
  );

  // Get users dropdown options
  typedFastify.get(
    '/users/dropdown',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('users', 'read'),
      ],
      schema: {
        description: 'Get users dropdown options',
        tags: ['Users'],
        summary: 'Get users options for dropdown/select components',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            search: { type: 'string', minLength: 1, maxLength: 100 },
            limit: { type: 'number', minimum: 1, maximum: 1000, default: 50 },
            active: { type: 'boolean' },
            exclude: { type: 'array', items: { type: 'string' } },
            include_disabled: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        value: { type: 'string' },
                        label: { type: 'string' },
                        disabled: { type: 'boolean' },
                      },
                    },
                  },
                  total: { type: 'number' },
                },
              },
            },
          },
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getDropdownOptions.bind(controller),
  );
}
