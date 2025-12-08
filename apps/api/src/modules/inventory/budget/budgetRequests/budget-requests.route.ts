import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { BudgetRequestsController } from './budget-requests.controller';
import {
  CreateBudgetRequestsSchema,
  UpdateBudgetRequestsSchema,
  BudgetRequestsIdParamSchema,
  GetBudgetRequestsQuerySchema,
  ListBudgetRequestsQuerySchema,
  BudgetRequestsResponseSchema,
  BudgetRequestsListResponseSchema,
  FlexibleBudgetRequestsListResponseSchema,
} from './budget-requests.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface BudgetRequestsRoutesOptions extends FastifyPluginOptions {
  controller: BudgetRequestsController;
}

export async function budgetRequestsRoutes(
  fastify: FastifyInstance,
  options: BudgetRequestsRoutesOptions,
) {
  const { controller } = options;

  // Create budgetRequests
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Create a new budgetRequests',
      description: 'Create a new budgetRequests with the provided data',
      body: CreateBudgetRequestsSchema,
      response: {
        201: BudgetRequestsResponseSchema,
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
      fastify.verifyPermission('budgetRequests', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get budgetRequests by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Get budgetRequests by ID',
      description: 'Retrieve a budgetRequests by its unique identifier',
      params: BudgetRequestsIdParamSchema,
      querystring: GetBudgetRequestsQuerySchema,
      response: {
        200: BudgetRequestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all budgetRequestss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Get all budgetRequestss with pagination and formats',
      description:
        'Retrieve budgetRequestss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListBudgetRequestsQuerySchema,
      response: {
        200: FlexibleBudgetRequestsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update budgetRequests
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Update budgetRequests by ID',
      description: 'Update an existing budgetRequests with new data',
      params: BudgetRequestsIdParamSchema,
      body: UpdateBudgetRequestsSchema,
      response: {
        200: BudgetRequestsResponseSchema,
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
      fastify.verifyPermission('budgetRequests', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete budgetRequests
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Delete budgetRequests by ID',
      description: 'Delete a budgetRequests by its unique identifier',
      params: BudgetRequestsIdParamSchema,
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
      fastify.verifyPermission('budgetRequests', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== WORKFLOW ENDPOINTS =====

  // Submit budget request for approval
  fastify.post('/:id/submit', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Submit budget request for approval',
      description:
        'Submit a budget request for department approval (DRAFT → SUBMITTED)',
      params: BudgetRequestsIdParamSchema,
      response: {
        200: BudgetRequestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'submit'),
    ],
    handler: controller.submit.bind(controller),
  });

  // Approve budget request by department head
  fastify.post('/:id/approve-dept', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Approve budget request by department head',
      description:
        'Approve a budget request as department head (SUBMITTED → DEPT_APPROVED)',
      params: BudgetRequestsIdParamSchema,
      body: Type.Object({
        comments: Type.Optional(Type.String()),
      }),
      response: {
        200: BudgetRequestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'approve_dept'),
    ],
    handler: controller.approveDept.bind(controller),
  });

  // Approve budget request by finance manager
  fastify.post('/:id/approve-finance', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Approve budget request by finance manager',
      description:
        'Approve a budget request as finance manager (DEPT_APPROVED → FINANCE_APPROVED)',
      params: BudgetRequestsIdParamSchema,
      body: Type.Object({
        comments: Type.Optional(Type.String()),
      }),
      response: {
        200: BudgetRequestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'approve_finance'),
    ],
    handler: controller.approveFinance.bind(controller),
  });

  // Reject budget request
  fastify.post('/:id/reject', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Reject budget request',
      description:
        'Reject a budget request at any approval stage (requires reason)',
      params: BudgetRequestsIdParamSchema,
      body: Type.Object({
        reason: Type.String({ minLength: 1 }),
      }),
      response: {
        200: BudgetRequestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'reject'),
    ],
    handler: controller.reject.bind(controller),
  });

  // Initialize budget request with drug generics
  fastify.post('/:id/initialize', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Initialize budget request with drug generics',
      description:
        'Pull all active drug generics and calculate historical usage data (3 years) to create budget request items. Status must be DRAFT.',
      params: BudgetRequestsIdParamSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            success: Type.Boolean(),
            itemsCreated: Type.Number(),
            message: Type.String(),
          }),
          message: Type.String(),
          meta: Type.Object({
            timestamp: Type.String(),
            version: Type.String(),
            requestId: Type.String(),
            environment: Type.String(),
          }),
        }),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'create'), // Using create permission for initialization
    ],
    handler: controller.initialize.bind(controller),
  });
}
