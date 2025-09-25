import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApiKeysController } from '../controllers/apiKeys.controller';
import {
  CreateApiKeysSchema,
  UpdateApiKeysSchema,
  ApiKeysIdParamSchema,
  GetApiKeysQuerySchema,
  ListApiKeysQuerySchema,
  ApiKeysResponseSchema,
  ApiKeysListResponseSchema,
} from '../schemas/apiKeys.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface ApiKeysRoutesOptions extends FastifyPluginOptions {
  controller: ApiKeysController;
}

export async function apiKeysRoutes(
  fastify: FastifyInstance,
  options: ApiKeysRoutesOptions
) {
  const { controller } = options;

  // Create apiKeys
  fastify.post('/', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Create a new apiKeys',
      description: 'Create a new apiKeys with the provided data',
      body: CreateApiKeysSchema,
      response: {
        201: ApiKeysResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get apiKeys by ID
  fastify.get('/:id', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get apiKeys by ID',
      description: 'Retrieve a apiKeys by its unique identifier',
      params: ApiKeysIdParamSchema,
      querystring: GetApiKeysQuerySchema,
      response: {
        200: ApiKeysResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all apiKeyss
  fastify.get('/', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get all apiKeyss with pagination',
      description: 'Retrieve a paginated list of apiKeyss with optional filtering',
      querystring: ListApiKeysQuerySchema,
      response: {
        200: ApiKeysListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update apiKeys
  fastify.put('/:id', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Update apiKeys by ID',
      description: 'Update an existing apiKeys with new data',
      params: ApiKeysIdParamSchema,
      body: UpdateApiKeysSchema,
      response: {
        200: ApiKeysResponseSchema,
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

  // Delete apiKeys
  fastify.delete('/:id', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Delete apiKeys by ID',
      description: 'Delete a apiKeys by its unique identifier',
      params: ApiKeysIdParamSchema,
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