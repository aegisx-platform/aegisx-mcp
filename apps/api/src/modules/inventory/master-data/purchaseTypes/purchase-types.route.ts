import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { PurchaseTypesController } from './purchase-types.controller';
import {
  CreatePurchaseTypesSchema,
  UpdatePurchaseTypesSchema,
  PurchaseTypesIdParamSchema,
  GetPurchaseTypesQuerySchema,
  ListPurchaseTypesQuerySchema,
  PurchaseTypesResponseSchema,
  PurchaseTypesListResponseSchema,
  FlexiblePurchaseTypesListResponseSchema,
} from './purchase-types.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface PurchaseTypesRoutesOptions extends FastifyPluginOptions {
  controller: PurchaseTypesController;
}

export async function purchaseTypesRoutes(
  fastify: FastifyInstance,
  options: PurchaseTypesRoutesOptions,
) {
  const { controller } = options;

  // Create purchaseTypes
  fastify.post('/', {
    schema: {
      tags: ['PurchaseTypes'],
      summary: 'Create a new purchaseTypes',
      description: 'Create a new purchaseTypes with the provided data',
      body: CreatePurchaseTypesSchema,
      response: {
        201: PurchaseTypesResponseSchema,
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
      fastify.verifyPermission('purchaseTypes', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get purchaseTypes by ID
  fastify.get('/:id', {
    schema: {
      tags: ['PurchaseTypes'],
      summary: 'Get purchaseTypes by ID',
      description: 'Retrieve a purchaseTypes by its unique identifier',
      params: PurchaseTypesIdParamSchema,
      querystring: GetPurchaseTypesQuerySchema,
      response: {
        200: PurchaseTypesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('purchaseTypes', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all purchaseTypess
  fastify.get('/', {
    schema: {
      tags: ['PurchaseTypes'],
      summary: 'Get all purchaseTypess with pagination and formats',
      description:
        'Retrieve purchaseTypess with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListPurchaseTypesQuerySchema,
      response: {
        200: FlexiblePurchaseTypesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('purchaseTypes', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update purchaseTypes
  fastify.put('/:id', {
    schema: {
      tags: ['PurchaseTypes'],
      summary: 'Update purchaseTypes by ID',
      description: 'Update an existing purchaseTypes with new data',
      params: PurchaseTypesIdParamSchema,
      body: UpdatePurchaseTypesSchema,
      response: {
        200: PurchaseTypesResponseSchema,
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
      fastify.verifyPermission('purchaseTypes', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete purchaseTypes
  fastify.delete('/:id', {
    schema: {
      tags: ['PurchaseTypes'],
      summary: 'Delete purchaseTypes by ID',
      description: 'Delete a purchaseTypes by its unique identifier',
      params: PurchaseTypesIdParamSchema,
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
      fastify.verifyPermission('purchaseTypes', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
