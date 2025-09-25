import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersController } from './users.controller';
import {
  CreateUsersSchema,
  UpdateUsersSchema,
  UsersIdParamSchema,
  GetUsersQuerySchema,
  ListUsersQuerySchema,
  UsersResponseSchema,
  UsersListResponseSchema,
} from './users.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../schemas/base.schemas';
import { SchemaRefs } from '../../schemas/registry';

export interface UsersRoutesOptions extends FastifyPluginOptions {
  controller: UsersController;
}

export async function usersRoutes(
  fastify: FastifyInstance,
  options: UsersRoutesOptions
) {
  const { controller } = options;

  // Create users
  fastify.post('/', {
    schema: {
      tags: ['Users'],
      summary: 'Create a new users',
      description: 'Create a new users with the provided data',
      body: CreateUsersSchema,
      response: {
        201: UsersResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get users by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Get users by ID',
      description: 'Retrieve a users by its unique identifier',
      params: UsersIdParamSchema,
      querystring: GetUsersQuerySchema,
      response: {
        200: UsersResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all userss
  fastify.get('/', {
    schema: {
      tags: ['Users'],
      summary: 'Get all userss with pagination',
      description: 'Retrieve a paginated list of userss with optional filtering',
      querystring: ListUsersQuerySchema,
      response: {
        200: UsersListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update users
  fastify.put('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Update users by ID',
      description: 'Update an existing users with new data',
      params: UsersIdParamSchema,
      body: UpdateUsersSchema,
      response: {
        200: UsersResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.update.bind(controller)
  });

  // Delete users
  fastify.delete('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Delete users by ID',
      description: 'Delete a users by its unique identifier',
      params: UsersIdParamSchema,
      response: {
        200: SchemaRefs.SuccessMessage,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.delete.bind(controller)
  });

}