import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ReturnReasonsController } from './return-reasons.controller';
import {
  CreateReturnReasonsSchema,
  UpdateReturnReasonsSchema,
  ReturnReasonsIdParamSchema,
  GetReturnReasonsQuerySchema,
  ListReturnReasonsQuerySchema,
  ReturnReasonsResponseSchema,
  ReturnReasonsListResponseSchema,
  FlexibleReturnReasonsListResponseSchema,
} from './return-reasons.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ReturnReasonsRoutesOptions extends FastifyPluginOptions {
  controller: ReturnReasonsController;
}

export async function returnReasonsRoutes(
  fastify: FastifyInstance,
  options: ReturnReasonsRoutesOptions,
) {
  const { controller } = options;

  // Create returnReasons
  fastify.post('/', {
    schema: {
      tags: ['ReturnReasons'],
      summary: 'Create a new returnReasons',
      description: 'Create a new returnReasons with the provided data',
      body: CreateReturnReasonsSchema,
      response: {
        201: ReturnReasonsResponseSchema,
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
      fastify.verifyPermission('returnReasons', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get returnReasons by ID
  fastify.get('/:id', {
    schema: {
      tags: ['ReturnReasons'],
      summary: 'Get returnReasons by ID',
      description: 'Retrieve a returnReasons by its unique identifier',
      params: ReturnReasonsIdParamSchema,
      querystring: GetReturnReasonsQuerySchema,
      response: {
        200: ReturnReasonsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnReasons', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all returnReasonss
  fastify.get('/', {
    schema: {
      tags: ['ReturnReasons'],
      summary: 'Get all returnReasonss with pagination and formats',
      description:
        'Retrieve returnReasonss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListReturnReasonsQuerySchema,
      response: {
        200: FlexibleReturnReasonsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('returnReasons', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update returnReasons
  fastify.put('/:id', {
    schema: {
      tags: ['ReturnReasons'],
      summary: 'Update returnReasons by ID',
      description: 'Update an existing returnReasons with new data',
      params: ReturnReasonsIdParamSchema,
      body: UpdateReturnReasonsSchema,
      response: {
        200: ReturnReasonsResponseSchema,
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
      fastify.verifyPermission('returnReasons', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete returnReasons
  fastify.delete('/:id', {
    schema: {
      tags: ['ReturnReasons'],
      summary: 'Delete returnReasons by ID',
      description: 'Delete a returnReasons by its unique identifier',
      params: ReturnReasonsIdParamSchema,
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
      fastify.verifyPermission('returnReasons', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
