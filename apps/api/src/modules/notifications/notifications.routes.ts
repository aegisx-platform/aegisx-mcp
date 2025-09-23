import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NotificationsController } from './notifications.controller';
import {
  CreateNotificationsSchema,
  UpdateNotificationsSchema,
  NotificationsIdParamSchema,
  GetNotificationsQuerySchema,
  ListNotificationsQuerySchema,
  NotificationsResponseSchema,
  NotificationsListResponseSchema,
  ErrorResponseSchema
} from './notifications.schemas';

export interface NotificationsRoutesOptions extends FastifyPluginOptions {
  controller: NotificationsController;
}

export async function notificationsRoutes(
  fastify: FastifyInstance,
  options: NotificationsRoutesOptions
) {
  const { controller } = options;

  // Create notifications
  fastify.post('/', {
    schema: {
      tags: ['Notifications'],
      summary: 'Create a new notifications',
      body: CreateNotificationsSchema,
      response: {
        201: NotificationsResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get notifications by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Get notifications by ID',
      params: NotificationsIdParamSchema,
      querystring: GetNotificationsQuerySchema,
      response: {
        200: NotificationsResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all notificationss
  fastify.get('/', {
    schema: {
      tags: ['Notifications'],
      summary: 'Get all notificationss with pagination',
      querystring: ListNotificationsQuerySchema,
      response: {
        200: NotificationsListResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update notifications
  fastify.put('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Update notifications by ID',
      params: NotificationsIdParamSchema,
      body: UpdateNotificationsSchema,
      response: {
        200: NotificationsResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.update.bind(controller)
  });

  // Delete notifications
  fastify.delete('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Delete notifications by ID',
      params: NotificationsIdParamSchema,
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

}