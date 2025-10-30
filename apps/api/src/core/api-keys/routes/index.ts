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
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'create'),
    ],
    schema: {
      tags: ['ApiKeys'],
      summary: 'Create a new apiKeys',
      description: 'Create a new apiKeys with the provided data',
      security: [{ bearerAuth: [] }],
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

  // Get all apiKeyss
  fastify.get('/', {
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'read'),
    ],
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get all apiKeyss with pagination',
      description:
        'Retrieve a paginated list of apiKeyss with optional filtering',
      security: [{ bearerAuth: [] }],
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

  // ===== API KEY MANAGEMENT ROUTES (before parameterized routes) =====

  // Generate new API key
  fastify.post('/generate', {
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'generate'),
    ],
    schema: {
      tags: ['API Key Management'],
      summary: 'Generate a new API key',
      description:
        'Generate a new API key with optional scopes and expiry. Requires JWT authentication.',
      security: [{ bearerAuth: [] }],
      body: GenerateApiKeySchema,
      response: {
        201: GenerateApiKeyResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
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
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'read:own'),
    ],
    schema: {
      tags: ['API Key Management'],
      summary: 'Get my API keys',
      description:
        "Get the current user's API keys with previews (keys are masked for security)",
      security: [{ bearerAuth: [] }],
      querystring: UserApiKeysQuerySchema,
      response: {
        200: UserApiKeysListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getMyKeys.bind(controller),
  });

  // ===== PARAMETERIZED ROUTES (must come after specific routes) =====

  // Get apiKeys by ID
  fastify.get('/:id', {
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'read'),
    ],
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get apiKeys by ID',
      description: 'Retrieve a apiKeys by its unique identifier',
      security: [{ bearerAuth: [] }],
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

  // Update apiKeys
  fastify.put('/:id', {
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'update'),
    ],
    schema: {
      tags: ['ApiKeys'],
      summary: 'Update apiKeys by ID',
      description: 'Update an existing apiKeys with new data',
      security: [{ bearerAuth: [] }],
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
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'delete'),
    ],
    schema: {
      tags: ['ApiKeys'],
      summary: 'Delete apiKeys by ID',
      description: 'Delete a apiKeys by its unique identifier',
      security: [{ bearerAuth: [] }],
      params: ApiKeysIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.delete.bind(controller),
  });

  // Revoke API key
  fastify.post('/:id/revoke', {
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'revoke'),
    ],
    schema: {
      tags: ['API Key Management'],
      summary: 'Revoke (deactivate) an API key',
      description:
        'Revoke an API key to permanently disable access. Users can only revoke their own keys.',
      security: [{ bearerAuth: [] }],
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
    },
    handler: controller.revokeKey.bind(controller),
  });

  // Rotate API key
  fastify.post('/:id/rotate', {
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('api-keys', 'rotate'),
    ],
    schema: {
      tags: ['API Key Management'],
      summary: 'Rotate an API key',
      description:
        'Generate a new API key with the same settings and deactivate the old one',
      security: [{ bearerAuth: [] }],
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
    },
    handler: controller.rotateKey.bind(controller),
  });
}
