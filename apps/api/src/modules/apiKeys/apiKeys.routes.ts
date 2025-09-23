import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApiKeysController } from './apiKeys.controller';
import {
  CreateApiKeysSchema,
  UpdateApiKeysSchema,
  ApiKeysIdParamSchema,
  GetApiKeysQuerySchema,
  ListApiKeysQuerySchema,
  ApiKeysResponseSchema,
  ApiKeysListResponseSchema,
  ErrorResponseSchema
} from './apiKeys.schemas';

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
      body: CreateApiKeysSchema,
      response: {
        201: ApiKeysResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get apiKeys by ID
  fastify.get('/:id', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get apiKeys by ID',
      params: ApiKeysIdParamSchema,
      querystring: GetApiKeysQuerySchema,
      response: {
        200: ApiKeysResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all apiKeyss
  fastify.get('/', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Get all apiKeyss with pagination',
      querystring: ListApiKeysQuerySchema,
      response: {
        200: ApiKeysListResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update apiKeys
  fastify.put('/:id', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Update apiKeys by ID',
      params: ApiKeysIdParamSchema,
      body: UpdateApiKeysSchema,
      response: {
        200: ApiKeysResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.update.bind(controller)
  });

  // Delete apiKeys
  fastify.delete('/:id', {
    schema: {
      tags: ['ApiKeys'],
      summary: 'Delete apiKeys by ID',
      params: ApiKeysIdParamSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.delete.bind(controller)
  });

  // WebSocket endpoints for real-time updates
  fastify.get('/ws/subscribe', {
    websocket: true,
    schema: {
      tags: ['ApiKeys WebSocket'],
      summary: 'Subscribe to apiKeys real-time updates'
    },
    wsHandler: async (socket, request) => {
      // Join the apiKeys room for real-time updates
      const eventService = fastify.diContainer?.cradle?.eventService;
      if (eventService) {
        await eventService.joinRoom(socket, 'apiKeys-updates');
        
        socket.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            // Handle client messages if needed
            fastify.log.info('ApiKeys WebSocket message:', data);
          } catch (error) {
            fastify.log.error('Invalid WebSocket message:', error);
          }
        });

        socket.on('close', () => {
          fastify.log.info('ApiKeys WebSocket connection closed');
        });
      }
    }
  });
}