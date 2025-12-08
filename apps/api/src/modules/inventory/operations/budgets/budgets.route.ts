import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { BudgetsController } from './budgets.controller';
import {
  CreateBudgetsSchema,
  UpdateBudgetsSchema,
  BudgetsIdParamSchema,
  GetBudgetsQuerySchema,
  ListBudgetsQuerySchema,
  BudgetsResponseSchema,
  BudgetsListResponseSchema,
  FlexibleBudgetsListResponseSchema,
} from './budgets.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface BudgetsRoutesOptions extends FastifyPluginOptions {
  controller: BudgetsController;
}

export async function budgetsRoutes(
  fastify: FastifyInstance,
  options: BudgetsRoutesOptions,
) {
  const { controller } = options;

  // Create budgets
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Budgets'],
      summary: 'Create a new budgets',
      description: 'Create a new budgets with the provided data',
      body: CreateBudgetsSchema,
      response: {
        201: BudgetsResponseSchema,
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
      fastify.verifyPermission('budgets', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get budgets by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Budgets'],
      summary: 'Get budgets by ID',
      description: 'Retrieve a budgets by its unique identifier',
      params: BudgetsIdParamSchema,
      querystring: GetBudgetsQuerySchema,
      response: {
        200: BudgetsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgets', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all budgetss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Budgets'],
      summary: 'Get all budgetss with pagination and formats',
      description:
        'Retrieve budgetss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListBudgetsQuerySchema,
      response: {
        200: FlexibleBudgetsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgets', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update budgets
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Budgets'],
      summary: 'Update budgets by ID',
      description: 'Update an existing budgets with new data',
      params: BudgetsIdParamSchema,
      body: UpdateBudgetsSchema,
      response: {
        200: BudgetsResponseSchema,
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
      fastify.verifyPermission('budgets', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete budgets
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Budgets'],
      summary: 'Delete budgets by ID',
      description: 'Delete a budgets by its unique identifier',
      params: BudgetsIdParamSchema,
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
      fastify.verifyPermission('budgets', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
