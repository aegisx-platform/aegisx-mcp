import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { PurchaseOrderItemsController } from './purchase-order-items.controller';
import {
  CreatePurchaseOrderItemsSchema,
  UpdatePurchaseOrderItemsSchema,
  PurchaseOrderItemsIdParamSchema,
  GetPurchaseOrderItemsQuerySchema,
  ListPurchaseOrderItemsQuerySchema,
  PurchaseOrderItemsResponseSchema,
  PurchaseOrderItemsListResponseSchema,
  FlexiblePurchaseOrderItemsListResponseSchema,
} from './purchase-order-items.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface PurchaseOrderItemsRoutesOptions extends FastifyPluginOptions {
  controller: PurchaseOrderItemsController;
}

export async function purchaseOrderItemsRoutes(
  fastify: FastifyInstance,
  options: PurchaseOrderItemsRoutesOptions,
) {
  const { controller } = options;

  // Create purchaseOrderItems
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Purchase Order Items'],
      summary: 'Create a new purchaseOrderItems',
      description: 'Create a new purchaseOrderItems with the provided data',
      body: CreatePurchaseOrderItemsSchema,
      response: {
        201: PurchaseOrderItemsResponseSchema,
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
      fastify.verifyPermission('purchaseOrderItems', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get purchaseOrderItems by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Purchase Order Items'],
      summary: 'Get purchaseOrderItems by ID',
      description: 'Retrieve a purchaseOrderItems by its unique identifier',
      params: PurchaseOrderItemsIdParamSchema,
      querystring: GetPurchaseOrderItemsQuerySchema,
      response: {
        200: PurchaseOrderItemsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('purchaseOrderItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all purchaseOrderItemss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Purchase Order Items'],
      summary: 'Get all purchaseOrderItemss with pagination and formats',
      description:
        'Retrieve purchaseOrderItemss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListPurchaseOrderItemsQuerySchema,
      response: {
        200: FlexiblePurchaseOrderItemsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('purchaseOrderItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update purchaseOrderItems
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Purchase Order Items'],
      summary: 'Update purchaseOrderItems by ID',
      description: 'Update an existing purchaseOrderItems with new data',
      params: PurchaseOrderItemsIdParamSchema,
      body: UpdatePurchaseOrderItemsSchema,
      response: {
        200: PurchaseOrderItemsResponseSchema,
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
      fastify.verifyPermission('purchaseOrderItems', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete purchaseOrderItems
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Purchase Order Items'],
      summary: 'Delete purchaseOrderItems by ID',
      description: 'Delete a purchaseOrderItems by its unique identifier',
      params: PurchaseOrderItemsIdParamSchema,
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
      fastify.verifyPermission('purchaseOrderItems', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
