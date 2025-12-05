import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ReturnActionsController } from './return-actions.controller';
import {
  CreateReturnActionsSchema,
  UpdateReturnActionsSchema,
  ReturnActionsIdParamSchema,
  GetReturnActionsQuerySchema,
  ListReturnActionsQuerySchema,
  ReturnActionsResponseSchema,
  ReturnActionsListResponseSchema,
  FlexibleReturnActionsListResponseSchema,
} from './return-actions.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ReturnActionsRoutesOptions extends FastifyPluginOptions {
  controller: ReturnActionsController;
}

export async function returnActionsRoutes(
  fastify: FastifyInstance,
  options: ReturnActionsRoutesOptions,
) {
  const { controller } = options;

  // Create returnActions
  fastify.post('/', {
    schema: {
      tags: ['ReturnActions'],
      summary: 'Create a new returnActions',
      description: 'Create a new returnActions with the provided data',
      body: CreateReturnActionsSchema,
      response: {
        201: ReturnActionsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnActions', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get returnActions by ID
  fastify.get('/:id', {
    schema: {
      tags: ['ReturnActions'],
      summary: 'Get returnActions by ID',
      description: 'Retrieve a returnActions by its unique identifier',
      params: ReturnActionsIdParamSchema,
      querystring: GetReturnActionsQuerySchema,
      response: {
        200: ReturnActionsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnActions', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all returnActionss
  fastify.get('/', {
    schema: {
      tags: ['ReturnActions'],
      summary: 'Get all returnActionss with pagination and formats',
      description:
        'Retrieve returnActionss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListReturnActionsQuerySchema,
      response: {
        200: FlexibleReturnActionsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnActions', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update returnActions
  fastify.put('/:id', {
    schema: {
      tags: ['ReturnActions'],
      summary: 'Update returnActions by ID',
      description: 'Update an existing returnActions with new data',
      params: ReturnActionsIdParamSchema,
      body: UpdateReturnActionsSchema,
      response: {
        200: ReturnActionsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnActions', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete returnActions
  fastify.delete('/:id', {
    schema: {
      tags: ['ReturnActions'],
      summary: 'Delete returnActions by ID',
      description: 'Delete a returnActions by its unique identifier',
      params: ReturnActionsIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnActions', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
