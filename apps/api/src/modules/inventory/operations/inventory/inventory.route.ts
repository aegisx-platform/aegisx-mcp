import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { InventoryController } from './inventory.controller';
import {
  CreateInventorySchema,
  UpdateInventorySchema,
  InventoryIdParamSchema,
  GetInventoryQuerySchema,
  ListInventoryQuerySchema,
  InventoryResponseSchema,
  InventoryListResponseSchema,
  FlexibleInventoryListResponseSchema,
} from './inventory.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface InventoryRoutesOptions extends FastifyPluginOptions {
  controller: InventoryController;
}

export async function inventoryRoutes(
  fastify: FastifyInstance,
  options: InventoryRoutesOptions,
) {
  const { controller } = options;

  // Create inventory
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Inventory'],
      summary: 'Create a new inventory',
      description: 'Create a new inventory with the provided data',
      body: CreateInventorySchema,
      response: {
        201: InventoryResponseSchema,
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
      fastify.verifyPermission('inventory', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get inventory by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Inventory'],
      summary: 'Get inventory by ID',
      description: 'Retrieve a inventory by its unique identifier',
      params: InventoryIdParamSchema,
      querystring: GetInventoryQuerySchema,
      response: {
        200: InventoryResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('inventory', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all inventorys
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Inventory'],
      summary: 'Get all inventorys with pagination and formats',
      description:
        'Retrieve inventorys with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListInventoryQuerySchema,
      response: {
        200: FlexibleInventoryListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('inventory', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update inventory
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Inventory'],
      summary: 'Update inventory by ID',
      description: 'Update an existing inventory with new data',
      params: InventoryIdParamSchema,
      body: UpdateInventorySchema,
      response: {
        200: InventoryResponseSchema,
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
      fastify.verifyPermission('inventory', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete inventory
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Inventory'],
      summary: 'Delete inventory by ID',
      description: 'Delete a inventory by its unique identifier',
      params: InventoryIdParamSchema,
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
      fastify.verifyPermission('inventory', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
