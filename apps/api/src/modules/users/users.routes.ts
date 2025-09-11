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
    '/api/users',
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
    '/api/users/:id',
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
    '/api/users',
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
    '/api/users/:id',
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
    '/api/users/:id/password',
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
    '/api/users/:id',
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
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.deleteUser.bind(controller),
  );

  // Get all roles (admin/manager only)
  typedFastify.get(
    '/api/roles',
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
}
