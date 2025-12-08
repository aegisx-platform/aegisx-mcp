import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { PurchaseRequestsController } from './purchase-requests.controller';
import {
  CreatePurchaseRequestsSchema,
  UpdatePurchaseRequestsSchema,
  PurchaseRequestsIdParamSchema,
  GetPurchaseRequestsQuerySchema,
  ListPurchaseRequestsQuerySchema,
  PurchaseRequestsResponseSchema,
  PurchaseRequestsListResponseSchema,
  FlexiblePurchaseRequestsListResponseSchema,
} from './purchase-requests.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface PurchaseRequestsRoutesOptions extends FastifyPluginOptions {
  controller: PurchaseRequestsController;
}

export async function purchaseRequestsRoutes(
  fastify: FastifyInstance,
  options: PurchaseRequestsRoutesOptions,
) {
  const { controller } = options;

  // Create purchaseRequests
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Purchase Requests'],
      summary: 'Create a new purchaseRequests',
      description: 'Create a new purchaseRequests with the provided data',
      body: CreatePurchaseRequestsSchema,
      response: {
        201: PurchaseRequestsResponseSchema,
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
      fastify.verifyPermission('purchaseRequests', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get purchaseRequests by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Purchase Requests'],
      summary: 'Get purchaseRequests by ID',
      description: 'Retrieve a purchaseRequests by its unique identifier',
      params: PurchaseRequestsIdParamSchema,
      querystring: GetPurchaseRequestsQuerySchema,
      response: {
        200: PurchaseRequestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('purchaseRequests', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all purchaseRequestss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Purchase Requests'],
      summary: 'Get all purchaseRequestss with pagination and formats',
      description:
        'Retrieve purchaseRequestss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListPurchaseRequestsQuerySchema,
      response: {
        200: FlexiblePurchaseRequestsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('purchaseRequests', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update purchaseRequests
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Purchase Requests'],
      summary: 'Update purchaseRequests by ID',
      description: 'Update an existing purchaseRequests with new data',
      params: PurchaseRequestsIdParamSchema,
      body: UpdatePurchaseRequestsSchema,
      response: {
        200: PurchaseRequestsResponseSchema,
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
      fastify.verifyPermission('purchaseRequests', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete purchaseRequests
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Purchase Requests'],
      summary: 'Delete purchaseRequests by ID',
      description: 'Delete a purchaseRequests by its unique identifier',
      params: PurchaseRequestsIdParamSchema,
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
      fastify.verifyPermission('purchaseRequests', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
