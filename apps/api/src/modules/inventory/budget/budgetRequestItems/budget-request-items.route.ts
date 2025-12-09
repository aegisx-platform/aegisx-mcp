import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { BudgetRequestItemsController } from './budget-request-items.controller';
import {
  CreateBudgetRequestItemsSchema,
  UpdateBudgetRequestItemsSchema,
  BudgetRequestItemsIdParamSchema,
  GetBudgetRequestItemsQuerySchema,
  ListBudgetRequestItemsQuerySchema,
  BudgetRequestItemsResponseSchema,
  BudgetRequestItemsListResponseSchema,
  FlexibleBudgetRequestItemsListResponseSchema,
  BatchUpdateBudgetRequestItemsSchema,
  BatchUpdateResponseSchema,
} from './budget-request-items.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface BudgetRequestItemsRoutesOptions extends FastifyPluginOptions {
  controller: BudgetRequestItemsController;
}

export async function budgetRequestItemsRoutes(
  fastify: FastifyInstance,
  options: BudgetRequestItemsRoutesOptions,
) {
  const { controller } = options;

  // Create budgetRequestItems
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Budget Request Items'],
      summary: 'Create a new budgetRequestItems',
      description: 'Create a new budgetRequestItems with the provided data',
      body: CreateBudgetRequestItemsSchema,
      response: {
        201: BudgetRequestItemsResponseSchema,
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
      fastify.verifyPermission('budgetRequestItems', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get budgetRequestItems by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Budget Request Items'],
      summary: 'Get budgetRequestItems by ID',
      description: 'Retrieve a budgetRequestItems by its unique identifier',
      params: BudgetRequestItemsIdParamSchema,
      querystring: GetBudgetRequestItemsQuerySchema,
      response: {
        200: BudgetRequestItemsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequestItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all budgetRequestItemss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Budget Request Items'],
      summary: 'Get all budgetRequestItemss with pagination and formats',
      description:
        'Retrieve budgetRequestItemss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListBudgetRequestItemsQuerySchema,
      response: {
        200: FlexibleBudgetRequestItemsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequestItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update budgetRequestItems
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Budget Request Items'],
      summary: 'Update budgetRequestItems by ID',
      description: 'Update an existing budgetRequestItems with new data',
      params: BudgetRequestItemsIdParamSchema,
      body: UpdateBudgetRequestItemsSchema,
      response: {
        200: BudgetRequestItemsResponseSchema,
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
      fastify.verifyPermission('budgetRequestItems', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete budgetRequestItems
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Budget Request Items'],
      summary: 'Delete budgetRequestItems by ID',
      description: 'Delete a budgetRequestItems by its unique identifier',
      params: BudgetRequestItemsIdParamSchema,
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
      fastify.verifyPermission('budgetRequestItems', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // Batch update budget request items
  fastify.post('/batch-update', {
    schema: {
      tags: ['Inventory: Budget Request Items'],
      summary: 'Batch update multiple budget request items',
      description:
        'Update multiple budget items at once (max 100 per request). Only works on items in DRAFT status.',
      body: BatchUpdateBudgetRequestItemsSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: BatchUpdateResponseSchema,
          message: Type.String(),
          meta: Type.Any(),
        }),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequestItems', 'update'),
    ], // Authentication & authorization required
    handler: controller.batchUpdate.bind(controller),
  });
}
