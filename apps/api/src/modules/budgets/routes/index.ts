import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { BudgetsController } from '../controllers/budgets.controller';
import {
  CreateBudgetsSchema,
  UpdateBudgetsSchema,
  BudgetsIdParamSchema,
  GetBudgetsQuerySchema,
  ListBudgetsQuerySchema,
  BudgetsResponseSchema,
  BudgetsListResponseSchema,
  FlexibleBudgetsListResponseSchema,
} from '../schemas/budgets.schemas';
import {
  DropdownQuerySchema,
  DropdownResponseSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkResponseSchema,
  BulkStatusSchema,
  StatusToggleSchema,
  StatisticsResponseSchema,
} from '../../../schemas/base.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

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
      tags: ['Budgets'],
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
      fastify.authorize(['budgets', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // ⚠️ IMPORTANT: Export route must be BEFORE /:id route
  // Export budgets data
  fastify.get('/export', {
    schema: {
      tags: ['Budgets'],
      summary: 'Export budgets data',
      description: 'Export budgets data in various formats (CSV, Excel, PDF)',
      querystring: ExportQuerySchema,
      response: {
        200: {
          description: 'Export file download',
          type: 'string',
          format: 'binary',
        },
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['budgets.read', 'budgets.export', 'admin']),
    ],
    handler: controller.export.bind(controller),
  });

  // Get budgets by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Budgets'],
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
      fastify.authorize(['budgets.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all budgetss
  fastify.get('/', {
    schema: {
      tags: ['Budgets'],
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
      fastify.authorize(['budgets.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update budgets
  fastify.put('/:id', {
    schema: {
      tags: ['Budgets'],
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
      fastify.authorize(['budgets.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete budgets
  fastify.delete('/:id', {
    schema: {
      tags: ['Budgets'],
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
      fastify.authorize(['budgets.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== ENHANCED CRUD ROUTES =====

  // Get dropdown options for UI components
  fastify.get('/dropdown', {
    schema: {
      tags: ['Budgets'],
      summary: 'Get budgets dropdown options',
      description: 'Get budgets options for dropdown/select components',
      querystring: DropdownQuerySchema,
      response: {
        200: DropdownResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['budgets.read', 'admin']),
    ],
    handler: controller.getDropdownOptions.bind(controller),
  });

  // Bulk create budgetss
  fastify.post('/bulk', {
    schema: {
      tags: ['Budgets'],
      summary: 'Bulk create budgetss',
      description: 'Create multiple budgetss in one operation',
      body: BulkCreateSchema(CreateBudgetsSchema),
      response: {
        201: BulkResponseSchema(BudgetsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['budgets.create', 'admin']),
    ],
    handler: controller.bulkCreate.bind(controller),
  });

  // Bulk update budgetss
  fastify.put('/bulk', {
    schema: {
      tags: ['Budgets'],
      summary: 'Bulk update budgetss',
      description: 'Update multiple budgetss in one operation',
      body: BulkUpdateSchema(UpdateBudgetsSchema),
      response: {
        200: BulkResponseSchema(BudgetsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['budgets.update', 'admin']),
    ],
    handler: controller.bulkUpdate.bind(controller),
  });

  // Bulk delete budgetss
  fastify.delete('/bulk', {
    schema: {
      tags: ['Budgets'],
      summary: 'Bulk delete budgetss',
      description: 'Delete multiple budgetss in one operation',
      body: BulkDeleteSchema,
      response: {
        200: BulkResponseSchema(BudgetsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['budgets.delete', 'admin']),
    ],
    handler: controller.bulkDelete.bind(controller),
  });

  // Bulk status update
  fastify.patch('/bulk/status', {
    schema: {
      tags: ['Budgets'],
      summary: 'Bulk update budgets status',
      description: 'Update status of multiple budgetss',
      body: BulkStatusSchema,
      response: {
        200: BulkResponseSchema(BudgetsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['budgets.update', 'admin']),
    ],
    handler: controller.bulkUpdateStatus.bind(controller),
  });

  // Activate budgets
  fastify.patch('/:id/activate', {
    schema: {
      tags: ['Budgets'],
      summary: 'Activate budgets',
      description: 'Activate a budgets by setting is_active to true',
      params: BudgetsIdParamSchema,
      body: StatusToggleSchema,
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
      fastify.authorize(['budgets.update', 'admin']),
    ],
    handler: controller.activate.bind(controller),
  });

  // Deactivate budgets
  fastify.patch('/:id/deactivate', {
    schema: {
      tags: ['Budgets'],
      summary: 'Deactivate budgets',
      description: 'Deactivate a budgets by setting is_active to false',
      params: BudgetsIdParamSchema,
      body: StatusToggleSchema,
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
      fastify.authorize(['budgets.update', 'admin']),
    ],
    handler: controller.deactivate.bind(controller),
  });

  // Toggle budgets status
  fastify.patch('/:id/toggle', {
    schema: {
      tags: ['Budgets'],
      summary: 'Toggle budgets status',
      description: 'Toggle the is_active status of a budgets',
      params: BudgetsIdParamSchema,
      body: StatusToggleSchema,
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
      fastify.authorize(['budgets.update', 'admin']),
    ],
    handler: controller.toggle.bind(controller),
  });
}
