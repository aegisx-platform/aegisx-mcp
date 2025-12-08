import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ReceiptsController } from './receipts.controller';
import {
  CreateReceiptsSchema,
  UpdateReceiptsSchema,
  ReceiptsIdParamSchema,
  GetReceiptsQuerySchema,
  ListReceiptsQuerySchema,
  ReceiptsResponseSchema,
  ReceiptsListResponseSchema,
  FlexibleReceiptsListResponseSchema,
} from './receipts.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ReceiptsRoutesOptions extends FastifyPluginOptions {
  controller: ReceiptsController;
}

export async function receiptsRoutes(
  fastify: FastifyInstance,
  options: ReceiptsRoutesOptions,
) {
  const { controller } = options;

  // Create receipts
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Receipts'],
      summary: 'Create a new receipts',
      description: 'Create a new receipts with the provided data',
      body: CreateReceiptsSchema,
      response: {
        201: ReceiptsResponseSchema,
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
      fastify.verifyPermission('receipts', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get receipts by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Receipts'],
      summary: 'Get receipts by ID',
      description: 'Retrieve a receipts by its unique identifier',
      params: ReceiptsIdParamSchema,
      querystring: GetReceiptsQuerySchema,
      response: {
        200: ReceiptsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('receipts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all receiptss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Receipts'],
      summary: 'Get all receiptss with pagination and formats',
      description:
        'Retrieve receiptss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListReceiptsQuerySchema,
      response: {
        200: FlexibleReceiptsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('receipts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update receipts
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Receipts'],
      summary: 'Update receipts by ID',
      description: 'Update an existing receipts with new data',
      params: ReceiptsIdParamSchema,
      body: UpdateReceiptsSchema,
      response: {
        200: ReceiptsResponseSchema,
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
      fastify.verifyPermission('receipts', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete receipts
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Receipts'],
      summary: 'Delete receipts by ID',
      description: 'Delete a receipts by its unique identifier',
      params: ReceiptsIdParamSchema,
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
      fastify.verifyPermission('receipts', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
