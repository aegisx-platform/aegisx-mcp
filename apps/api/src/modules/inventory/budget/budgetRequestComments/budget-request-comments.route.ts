import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { BudgetRequestCommentsController } from './budget-request-comments.controller';
import {
  CreateBudgetRequestCommentsSchema,
  UpdateBudgetRequestCommentsSchema,
  BudgetRequestCommentsIdParamSchema,
  GetBudgetRequestCommentsQuerySchema,
  ListBudgetRequestCommentsQuerySchema,
  BudgetRequestCommentsResponseSchema,
  BudgetRequestCommentsListResponseSchema,
  FlexibleBudgetRequestCommentsListResponseSchema,
} from './budget-request-comments.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface BudgetRequestCommentsRoutesOptions
  extends FastifyPluginOptions {
  controller: BudgetRequestCommentsController;
}

export async function budgetRequestCommentsRoutes(
  fastify: FastifyInstance,
  options: BudgetRequestCommentsRoutesOptions,
) {
  const { controller } = options;

  // Create budgetRequestComments
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Budget Request Comments'],
      summary: 'Create a new budgetRequestComments',
      description: 'Create a new budgetRequestComments with the provided data',
      body: CreateBudgetRequestCommentsSchema,
      response: {
        201: BudgetRequestCommentsResponseSchema,
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
      fastify.verifyPermission('budgetRequestComments', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get budgetRequestComments by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Budget Request Comments'],
      summary: 'Get budgetRequestComments by ID',
      description: 'Retrieve a budgetRequestComments by its unique identifier',
      params: BudgetRequestCommentsIdParamSchema,
      querystring: GetBudgetRequestCommentsQuerySchema,
      response: {
        200: BudgetRequestCommentsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequestComments', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all budgetRequestCommentss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Budget Request Comments'],
      summary: 'Get all budgetRequestCommentss with pagination and formats',
      description:
        'Retrieve budgetRequestCommentss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListBudgetRequestCommentsQuerySchema,
      response: {
        200: FlexibleBudgetRequestCommentsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequestComments', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update budgetRequestComments
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Budget Request Comments'],
      summary: 'Update budgetRequestComments by ID',
      description: 'Update an existing budgetRequestComments with new data',
      params: BudgetRequestCommentsIdParamSchema,
      body: UpdateBudgetRequestCommentsSchema,
      response: {
        200: BudgetRequestCommentsResponseSchema,
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
      fastify.verifyPermission('budgetRequestComments', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete budgetRequestComments
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Budget Request Comments'],
      summary: 'Delete budgetRequestComments by ID',
      description: 'Delete a budgetRequestComments by its unique identifier',
      params: BudgetRequestCommentsIdParamSchema,
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
      fastify.verifyPermission('budgetRequestComments', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
