import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { NotificationsController } from '../controllers/notifications.controller';
import {
  CreateNotificationsSchema,
  UpdateNotificationsSchema,
  NotificationsIdParamSchema,
  GetNotificationsQuerySchema,
  ListNotificationsQuerySchema,
  NotificationsResponseSchema,
  NotificationsListResponseSchema,
  FlexibleNotificationsListResponseSchema,
} from '../schemas/notifications.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface NotificationsRoutesOptions extends FastifyPluginOptions {
  controller: NotificationsController;
}

export async function notificationsRoutes(
  fastify: FastifyInstance,
  options: NotificationsRoutesOptions,
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
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['notifications', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
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
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['notifications.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all notificationss
  fastify.get('/', {
    schema: {
      tags: ['Notifications'],
      summary: 'Get all notificationss with pagination and formats',
      description:
        'Retrieve notificationss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListNotificationsQuerySchema,
      response: {
        200: FlexibleNotificationsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['notifications.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
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
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['notifications.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete notifications
  fastify.delete('/:id', {
    schema: {
      tags: ['Notifications'],
      summary: 'Delete notifications by ID',
      description: 'Delete a notifications by its unique identifier',
      params: NotificationsIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['notifications.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
