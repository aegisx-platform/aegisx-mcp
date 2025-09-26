import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { UsersController } from './users.controller';
import { SchemaRefs } from '../../schemas/registry';

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
        fastify.authorize(['admin', 'manager']),
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
      onError: (request, _reply, error) => {
        request.log.error({ err: error }, 'Error in users list endpoint');
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
        fastify.authorize(['admin', 'manager']),
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
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
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
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
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
    '/users/:id/password',
    {
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
      schema: {
        description: 'Change a user password',
        tags: ['Users'],
        summary: 'Reset user password',
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
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
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

  // Change current user password (self)
  typedFastify.post(
    '/profile/password',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Change current user password',
        tags: ['User Profile', 'Users'],
        summary: 'Change user password with current password verification',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('users', 'self-password-change-request'),
        response: {
          200: SchemaRefs.module('users', 'success-message-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.changeSelfPassword.bind(controller),
  );

  // ===== PROFILE ROUTES =====
  // NOTE: Profile routes moved to user-profile module

  // ===== BULK OPERATIONS =====

  // Bulk activate users (admin only)
  typedFastify.post(
    '/users/bulk/activate',
    {
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
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
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
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
      preValidation: [fastify.authenticate, fastify.authorize(['admin'])],
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
}
