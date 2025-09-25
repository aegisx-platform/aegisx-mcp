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
} from './notifications.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../schemas/base.schemas';
import { SchemaRefs } from '../../schemas/registry';

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
      description: 'Create a new notifications with the provided data',
      body: CreateNotificationsSchema,
      response: {
        201: NotificationsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get notifications by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Get notifications by ID',
      description: 'Retrieve a notifications by its unique identifier',
      params: NotificationsIdParamSchema,
      querystring: GetNotificationsQuerySchema,
      response: {
        200: NotificationsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all notificationss
  fastify.get('/', {
    schema: {
      tags: ['Notifications'],
      summary: 'Get all notificationss with pagination',
      description: 'Retrieve a paginated list of notificationss with optional filtering',
      querystring: ListNotificationsQuerySchema,
      response: {
        200: NotificationsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update notifications
  fastify.put('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Update notifications by ID',
      description: 'Update an existing notifications with new data',
      params: NotificationsIdParamSchema,
      body: UpdateNotificationsSchema,
      response: {
        200: NotificationsResponseSchema,
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

  // Delete notifications
  fastify.delete('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Delete notifications by ID',
      description: 'Delete a notifications by its unique identifier',
      params: NotificationsIdParamSchema,
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