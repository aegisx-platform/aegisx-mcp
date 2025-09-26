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
  GenerateApiKeySchema,
  GenerateApiKeyResponseSchema,
  ValidateApiKeySchema,
  ValidateApiKeyResponseSchema,
  RevokeApiKeySchema,
  RevokeApiKeyResponseSchema,
  RotateApiKeySchema,
  RotateApiKeyResponseSchema,
  UserApiKeysQuerySchema,
  UserApiKeysListResponseSchema,
} from '../schemas/apiKeys.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface ApiKeysRoutesOptions extends FastifyPluginOptions {
  controller: ApiKeysController;
}

export async function apiKeysRoutes(
  fastify: FastifyInstance,
  options: ApiKeysRoutesOptions,
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
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.create.bind(controller),
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
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.findOne.bind(controller),
  });

  // Get all apiKeyss
  fastify.get('/', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get all apiKeyss with pagination',
      description:
        'Retrieve a paginated list of apiKeyss with optional filtering',
      querystring: ListApiKeysQuerySchema,
      response: {
        200: ApiKeysListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.findMany.bind(controller),
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
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.update.bind(controller),
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
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.delete.bind(controller),
  });

  // ===== NEW API KEY MANAGEMENT ROUTES =====

  // Generate new API key
  fastify.post('/generate', {
    schema: {
      tags: ['API Key Management'],
      summary: 'Generate a new API key',
      description:
        'Generate a new API key with optional scopes and expiry. Requires JWT authentication.',
      body: GenerateApiKeySchema,
      response: {
        201: GenerateApiKeyResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate], // JWT authentication required
    handler: controller.generateKey.bind(controller),
  });

  // Validate API key
  fastify.post('/validate', {
    schema: {
      tags: ['API Key Management'],
      summary: 'Validate an API key',
      description:
        'Validate an API key and optionally check resource/action permissions',
      body: ValidateApiKeySchema,
      response: {
        200: ValidateApiKeyResponseSchema,
        400: SchemaRefs.ValidationError,
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.validateKey.bind(controller),
  });

  // Get current user's API keys
  fastify.get('/my-keys', {
    schema: {
      tags: ['API Key Management'],
      summary: 'Get my API keys',
      description:
        "Get the current user's API keys with previews (keys are masked for security)",
      querystring: UserApiKeysQuerySchema,
      response: {
        200: UserApiKeysListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate], // JWT authentication required
    handler: controller.getMyKeys.bind(controller),
  });

  // Revoke API key
  fastify.post('/:id/revoke', {
    schema: {
      tags: ['API Key Management'],
      summary: 'Revoke (deactivate) an API key',
      description:
        'Revoke an API key to permanently disable access. Users can only revoke their own keys.',
      params: ApiKeysIdParamSchema,
      body: RevokeApiKeySchema,
      response: {
        200: RevokeApiKeyResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate], // JWT authentication required
    handler: controller.revokeKey.bind(controller),
  });

  // Rotate API key
  fastify.post('/:id/rotate', {
    schema: {
      tags: ['API Key Management'],
      summary: 'Rotate an API key',
      description:
        'Generate a new API key with the same settings and deactivate the old one',
      params: ApiKeysIdParamSchema,
      body: RotateApiKeySchema,
      response: {
        201: RotateApiKeyResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate], // JWT authentication required
    handler: controller.rotateKey.bind(controller),
  });
}
