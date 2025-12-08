import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ReceiptItemsController } from './receipt-items.controller';
import {
  CreateReceiptItemsSchema,
  UpdateReceiptItemsSchema,
  ReceiptItemsIdParamSchema,
  GetReceiptItemsQuerySchema,
  ListReceiptItemsQuerySchema,
  ReceiptItemsResponseSchema,
  ReceiptItemsListResponseSchema,
  FlexibleReceiptItemsListResponseSchema,
} from './receipt-items.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ReceiptItemsRoutesOptions extends FastifyPluginOptions {
  controller: ReceiptItemsController;
}

export async function receiptItemsRoutes(
  fastify: FastifyInstance,
  options: ReceiptItemsRoutesOptions,
) {
  const { controller } = options;

  // Create receiptItems
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Receipt Items'],
      summary: 'Create a new receiptItems',
      description: 'Create a new receiptItems with the provided data',
      body: CreateReceiptItemsSchema,
      response: {
        201: ReceiptItemsResponseSchema,
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
      fastify.verifyPermission('receiptItems', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get receiptItems by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Receipt Items'],
      summary: 'Get receiptItems by ID',
      description: 'Retrieve a receiptItems by its unique identifier',
      params: ReceiptItemsIdParamSchema,
      querystring: GetReceiptItemsQuerySchema,
      response: {
        200: ReceiptItemsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('receiptItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all receiptItemss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Receipt Items'],
      summary: 'Get all receiptItemss with pagination and formats',
      description:
        'Retrieve receiptItemss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListReceiptItemsQuerySchema,
      response: {
        200: FlexibleReceiptItemsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('receiptItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update receiptItems
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Receipt Items'],
      summary: 'Update receiptItems by ID',
      description: 'Update an existing receiptItems with new data',
      params: ReceiptItemsIdParamSchema,
      body: UpdateReceiptItemsSchema,
      response: {
        200: ReceiptItemsResponseSchema,
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
      fastify.verifyPermission('receiptItems', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete receiptItems
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Receipt Items'],
      summary: 'Delete receiptItems by ID',
      description: 'Delete a receiptItems by its unique identifier',
      params: ReceiptItemsIdParamSchema,
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
      fastify.verifyPermission('receiptItems', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
