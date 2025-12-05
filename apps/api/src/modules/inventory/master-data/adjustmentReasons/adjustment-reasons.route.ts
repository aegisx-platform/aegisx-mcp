import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { AdjustmentReasonsController } from './adjustment-reasons.controller';
import {
  CreateAdjustmentReasonsSchema,
  UpdateAdjustmentReasonsSchema,
  AdjustmentReasonsIdParamSchema,
  GetAdjustmentReasonsQuerySchema,
  ListAdjustmentReasonsQuerySchema,
  AdjustmentReasonsResponseSchema,
  AdjustmentReasonsListResponseSchema,
  FlexibleAdjustmentReasonsListResponseSchema,
} from './adjustment-reasons.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface AdjustmentReasonsRoutesOptions extends FastifyPluginOptions {
  controller: AdjustmentReasonsController;
}

export async function adjustmentReasonsRoutes(
  fastify: FastifyInstance,
  options: AdjustmentReasonsRoutesOptions,
) {
  const { controller } = options;

  // Create adjustmentReasons
  fastify.post('/', {
    schema: {
      tags: ['AdjustmentReasons'],
      summary: 'Create a new adjustmentReasons',
      description: 'Create a new adjustmentReasons with the provided data',
      body: CreateAdjustmentReasonsSchema,
      response: {
        201: AdjustmentReasonsResponseSchema,
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
      fastify.verifyPermission('adjustmentReasons', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get adjustmentReasons by ID
  fastify.get('/:id', {
    schema: {
      tags: ['AdjustmentReasons'],
      summary: 'Get adjustmentReasons by ID',
      description: 'Retrieve a adjustmentReasons by its unique identifier',
      params: AdjustmentReasonsIdParamSchema,
      querystring: GetAdjustmentReasonsQuerySchema,
      response: {
        200: AdjustmentReasonsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('adjustmentReasons', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all adjustmentReasonss
  fastify.get('/', {
    schema: {
      tags: ['AdjustmentReasons'],
      summary: 'Get all adjustmentReasonss with pagination and formats',
      description:
        'Retrieve adjustmentReasonss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListAdjustmentReasonsQuerySchema,
      response: {
        200: FlexibleAdjustmentReasonsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('adjustmentReasons', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update adjustmentReasons
  fastify.put('/:id', {
    schema: {
      tags: ['AdjustmentReasons'],
      summary: 'Update adjustmentReasons by ID',
      description: 'Update an existing adjustmentReasons with new data',
      params: AdjustmentReasonsIdParamSchema,
      body: UpdateAdjustmentReasonsSchema,
      response: {
        200: AdjustmentReasonsResponseSchema,
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
      fastify.verifyPermission('adjustmentReasons', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete adjustmentReasons
  fastify.delete('/:id', {
    schema: {
      tags: ['AdjustmentReasons'],
      summary: 'Delete adjustmentReasons by ID',
      description: 'Delete a adjustmentReasons by its unique identifier',
      params: AdjustmentReasonsIdParamSchema,
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
      fastify.verifyPermission('adjustmentReasons', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
