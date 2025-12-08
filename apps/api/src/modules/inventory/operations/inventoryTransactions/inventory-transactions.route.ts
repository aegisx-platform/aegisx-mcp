import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { InventoryTransactionsController } from './inventory-transactions.controller';
import {
  CreateInventoryTransactionsSchema,
  UpdateInventoryTransactionsSchema,
  InventoryTransactionsIdParamSchema,
  GetInventoryTransactionsQuerySchema,
  ListInventoryTransactionsQuerySchema,
  InventoryTransactionsResponseSchema,
  InventoryTransactionsListResponseSchema,
  FlexibleInventoryTransactionsListResponseSchema,
} from './inventory-transactions.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface InventoryTransactionsRoutesOptions
  extends FastifyPluginOptions {
  controller: InventoryTransactionsController;
}

export async function inventoryTransactionsRoutes(
  fastify: FastifyInstance,
  options: InventoryTransactionsRoutesOptions,
) {
  const { controller } = options;

  // Create inventoryTransactions
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Inventory Transactions'],
      summary: 'Create a new inventoryTransactions',
      description: 'Create a new inventoryTransactions with the provided data',
      body: CreateInventoryTransactionsSchema,
      response: {
        201: InventoryTransactionsResponseSchema,
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
      fastify.verifyPermission('inventoryTransactions', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get inventoryTransactions by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Inventory Transactions'],
      summary: 'Get inventoryTransactions by ID',
      description: 'Retrieve a inventoryTransactions by its unique identifier',
      params: InventoryTransactionsIdParamSchema,
      querystring: GetInventoryTransactionsQuerySchema,
      response: {
        200: InventoryTransactionsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('inventoryTransactions', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all inventoryTransactionss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Inventory Transactions'],
      summary: 'Get all inventoryTransactionss with pagination and formats',
      description:
        'Retrieve inventoryTransactionss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListInventoryTransactionsQuerySchema,
      response: {
        200: FlexibleInventoryTransactionsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('inventoryTransactions', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update inventoryTransactions
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Inventory Transactions'],
      summary: 'Update inventoryTransactions by ID',
      description: 'Update an existing inventoryTransactions with new data',
      params: InventoryTransactionsIdParamSchema,
      body: UpdateInventoryTransactionsSchema,
      response: {
        200: InventoryTransactionsResponseSchema,
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
      fastify.verifyPermission('inventoryTransactions', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete inventoryTransactions
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Inventory Transactions'],
      summary: 'Delete inventoryTransactions by ID',
      description: 'Delete a inventoryTransactions by its unique identifier',
      params: InventoryTransactionsIdParamSchema,
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
      fastify.verifyPermission('inventoryTransactions', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
