import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { DefaultController } from './default.controller';
import { SchemaRefs } from '../../schemas/registry';
import {
  createApiKeyAuth,
  createHybridAuth,
} from '../../core/api-keys/middleware/apiKeys.middleware';
import { ApiKeysService } from '../../core/api-keys/services/apiKeys.service';

export interface DefaultRoutesOptions {
  controller: DefaultController;
}

export async function defaultRoutes(
  fastify: FastifyInstance,
  options: DefaultRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Initialize API key service for middleware (if available)
  let apiKeysService: ApiKeysService | null = null;
  try {
    // Try to get API keys service from the registry
    if (fastify.hasDecorator('apiKeysService')) {
      apiKeysService = (fastify as any).apiKeysService;
      fastify.log.info(
        '✅ API Keys service found - protected routes will be enabled',
      );
    } else {
      fastify.log.warn(
        '⚠️ API Keys service not available - protected routes will be skipped',
      );
    }
  } catch (error) {
    fastify.log.warn(
      'API Keys service not available for authentication middleware',
    );
  }

  // GET /api/info - API Information endpoint
  typedFastify.route({
    method: 'GET',
    url: '/info',
    schema: {
      description:
        'Get API information including version, environment, and basic statistics',
      tags: ['System'],
      summary: 'Get API information',
      response: {
        200: SchemaRefs.module('default', 'api-info-response'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getApiInfo.bind(controller),
  });

  // GET /api/status - Detailed system status endpoint
  typedFastify.route({
    method: 'GET',
    url: '/status',
    schema: {
      description:
        'Get detailed system status including database, memory, and service health',
      tags: ['System'],
      summary: 'Get system status',
      response: {
        200: SchemaRefs.module('default', 'system-status-response'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getSystemStatus.bind(controller),
  });

  // GET /api/health - Simple health check endpoint
  typedFastify.route({
    method: 'GET',
    url: '/health',
    schema: {
      description:
        'Simple health check endpoint for load balancers and monitoring systems',
      tags: ['System'],
      summary: 'Health check',
      response: {
        200: SchemaRefs.module('default', 'health-check-response'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getHealthStatus.bind(controller),
  });

  // GET /api/ping - Simple ping endpoint
  typedFastify.route({
    method: 'GET',
    url: '/ping',
    schema: {
      description: 'Simple ping endpoint that returns pong',
      tags: ['System'],
      summary: 'Ping endpoint',
      response: {
        200: SchemaRefs.module('default', 'ping-response-data'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getPing.bind(controller),
  });

  // ===== API KEY AUTHENTICATION EXAMPLES =====

  // GET /api/protected-data - Example endpoint protected by API key authentication
  if (apiKeysService) {
    const apiKeyAuth = createApiKeyAuth(apiKeysService, {
      resource: 'system',
      action: 'read',
      onSuccess: async (keyData, request) => {
        request.log.info(
          {
            keyId: keyData.id,
            userId: keyData.user_id,
            prefix: keyData.key_prefix,
          },
          'API key authentication successful',
        );
      },
    });

    typedFastify.route({
      method: 'GET',
      url: '/protected-data',
      schema: {
        description:
          'Example endpoint that requires API key authentication with system:read scope',
        tags: ['System', 'API Key Demo'],
        summary: 'Get protected data (API key required)',
        headers: Type.Object({
          'x-api-key': Type.Optional(
            Type.String({ description: 'API key for authentication' }),
          ),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Object({
              message: Type.String(),
              timestamp: Type.String(),
              authenticatedWith: Type.String(),
              keyInfo: Type.Object({
                id: Type.String(),
                name: Type.String(),
                prefix: Type.String(),
                userId: Type.String(),
              }),
            }),
          }),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
        security: [{ apiKey: [] }],
      },
      preHandler: [apiKeyAuth],
      handler: async (request, reply) => {
        const authData = (request as any).apiKeyAuth;
        return reply.send({
          success: true,
          data: {
            message: 'This data is protected by API key authentication!',
            timestamp: new Date().toISOString(),
            authenticatedWith: 'API Key',
            keyInfo: {
              id: authData.keyData.id,
              name: authData.keyData.name,
              prefix: authData.keyData.key_prefix,
              userId: authData.keyData.user_id,
            },
          },
        });
      },
    });

    // GET /api/hybrid-protected - Example endpoint with hybrid authentication (JWT OR API key)
    const hybridAuth = createHybridAuth(apiKeysService, {
      resource: 'system',
      action: 'read',
    });

    typedFastify.route({
      method: 'GET',
      url: '/hybrid-protected',
      schema: {
        description:
          'Example endpoint that accepts both JWT and API key authentication',
        tags: ['System', 'API Key Demo'],
        summary: 'Get hybrid protected data (JWT or API key)',
        headers: Type.Object({
          authorization: Type.Optional(
            Type.String({ description: 'Bearer JWT token' }),
          ),
          'x-api-key': Type.Optional(
            Type.String({ description: 'API key for authentication' }),
          ),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Object({
              message: Type.String(),
              timestamp: Type.String(),
              authenticatedWith: Type.String(),
              userInfo: Type.Optional(
                Type.Object({
                  id: Type.String(),
                  username: Type.Optional(Type.String()),
                }),
              ),
              keyInfo: Type.Optional(
                Type.Object({
                  id: Type.String(),
                  name: Type.String(),
                  prefix: Type.String(),
                  userId: Type.String(),
                }),
              ),
            }),
          }),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
        security: [{ bearerAuth: [] }, { apiKey: [] }],
      },
      preHandler: [hybridAuth],
      handler: async (request, reply) => {
        const jwtUser = (request as any).user;
        const apiKeyAuth = (request as any).apiKeyAuth;

        let authMethod = 'Unknown';
        let userInfo = undefined;
        let keyInfo = undefined;

        if (jwtUser) {
          authMethod = 'JWT Token';
          userInfo = {
            id: jwtUser.id,
            username: jwtUser.username,
          };
        } else if (apiKeyAuth) {
          authMethod = 'API Key';
          keyInfo = {
            id: apiKeyAuth.keyData.id,
            name: apiKeyAuth.keyData.name,
            prefix: apiKeyAuth.keyData.key_prefix,
            userId: apiKeyAuth.keyData.user_id,
          };
        }

        return reply.send({
          success: true,
          data: {
            message:
              'This endpoint accepts both JWT and API key authentication!',
            timestamp: new Date().toISOString(),
            authenticatedWith: authMethod,
            userInfo,
            keyInfo,
          },
        });
      },
    });

    fastify.log.info('📋 API Key protected routes registered successfully');
  } else {
    fastify.log.warn(
      '⚠️ API Keys service not available - demo protected routes will be skipped',
    );
  }
}
