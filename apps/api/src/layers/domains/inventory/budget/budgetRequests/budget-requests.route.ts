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
  BudgetRequestValidationResultSchema,
  GetBudgetRequestsStatsQuerySchema,
  BudgetRequestsStatsSchema,
  MyPendingActionsResponseSchema,
  RecentBudgetRequestsQuerySchema,
  RecentBudgetRequestsResponseSchema,
  CheckDrugsInPlanBodySchema,
  CheckDrugsInPlanResponseSchema,
  CheckBudgetAvailabilityResponseSchema,
  BudgetItemsStatusResponseSchema,
} from './budget-requests.schemas';
import {
  ApiErrorResponseSchema,
  ApiMetaSchema,
} from '../../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../../schemas/registry';

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
      description:
        'Create a new budgetRequests with the provided data. Supports both department-specific requests (with department_id) and central/hospital-wide requests (with department_id = null). For central requests, no budget allocations are created until items are distributed to departments at the PO/PR stage.',
      body: {
        ...CreateBudgetRequestsSchema,
        examples: [
          {
            summary: 'Department-specific budget request',
            value: {
              fiscal_year: 2568,
              department_id: 5,
              justification: 'Annual budget request for pharmacy department',
            },
          },
          {
            summary:
              'Central hospital-wide budget request (department_id = null)',
            value: {
              fiscal_year: 2568,
              department_id: null,
              justification:
                'Central budget request covering all hospital departments',
            },
          },
        ],
      },
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

  // Validate budget request before submitting
  fastify.post('/:id/validate', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Validate budget request before submit',
      description:
        'Runs a pre-submission check to validate required fields, item integrity, and budget impact.',
      params: BudgetRequestsIdParamSchema,
      response: {
        200: BudgetRequestValidationResultSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'validate'),
    ],
    handler: controller.validate.bind(controller),
  });

  // ===== BUDGET INTEGRATION ENDPOINTS =====

  // Check if drugs in this request are included in the budget plan
  fastify.post('/:id/check-drugs-in-plan', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Check drugs in budget plan',
      description:
        'Check if requested drugs are included in the budget plan. Returns list of drugs not in plan.',
      params: BudgetRequestsIdParamSchema,
      body: CheckDrugsInPlanBodySchema,
      response: {
        200: CheckDrugsInPlanResponseSchema,
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
    ],
    handler: controller.checkDrugsInPlan.bind(controller),
  });

  // Check budget availability for the request
  fastify.post('/:id/check-budget-availability', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Check budget availability',
      description:
        'Check if sufficient budget is available for this request. Calculates allocated, used, reserved, and available amounts.',
      params: BudgetRequestsIdParamSchema,
      response: {
        200: CheckBudgetAvailabilityResponseSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'read'),
    ],
    handler: controller.checkBudgetAvailability.bind(controller),
  });

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
        'Approve a budget request as finance manager (DEPT_APPROVED → FINANCE_APPROVED). For central requests (department_id = null), budget allocations are skipped and will be created at the PO/PR stage when items are distributed to specific departments.',
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

  // Reopen budget request
  fastify.post('/:id/reopen', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Reopen budget request',
      description:
        'Send budget request back to DRAFT status for editing. Business rules: REJECTED→DRAFT (auto-allow), SUBMITTED→DRAFT (allowed), DEPT_APPROVED→DRAFT (allowed), FINANCE_APPROVED→Not allowed (budget locked)',
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'update'),
    ],
    handler: controller.reopen.bind(controller),
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
        400: ApiErrorResponseSchema, // Use flexible error schema (details is optional)
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

  // Initialize from Drug Master (no calculation)
  fastify.post('/:id/initialize-from-master', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Initialize from Drug Master (no calculation)',
      description:
        'Pull all active drug generics WITHOUT historical calculation. Creates items with default values (qty=0, price=0). Status must be DRAFT.',
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
        400: ApiErrorResponseSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'create'),
    ],
    handler: controller.initializeFromMaster.bind(controller),
  });

  // Import Excel/CSV file (main endpoint)
  const importExcelSchema = {
    tags: ['Inventory: Budget Requests'],
    summary: 'Import Excel/CSV file for budget request items',
    description:
      'Import budget request items from Excel (.xlsx, .xls) or CSV (.csv) file. Status must be DRAFT. ' +
      'Supports modes: append, replace, update. File columns: รหัสยา, ชื่อยา, หน่วย, ราคาต่อหน่วย, จำนวน',
    params: BudgetRequestsIdParamSchema,
    consumes: ['multipart/form-data'],
    response: {
      200: Type.Object({
        success: Type.Boolean(),
        data: Type.Object({
          imported: Type.Number(),
          updated: Type.Number(),
          skipped: Type.Number(),
          errors: Type.Array(
            Type.Object({
              row: Type.Number(),
              field: Type.String(),
              message: Type.String(),
            }),
          ),
        }),
        message: Type.String(),
        meta: Type.Object({
          timestamp: Type.String(),
          version: Type.String(),
          requestId: Type.String(),
          environment: Type.String(),
        }),
      }),
      400: ApiErrorResponseSchema,
      401: SchemaRefs.Unauthorized,
      403: SchemaRefs.Forbidden,
      404: SchemaRefs.NotFound,
      422: SchemaRefs.UnprocessableEntity,
      500: SchemaRefs.ServerError,
    },
  };

  const importExcelPreValidation = [
    fastify.authenticate,
    fastify.verifyPermission('budgetRequests', 'create'),
  ];

  // Register both /import and /import-excel endpoints (alias)
  fastify.post('/:id/import', {
    schema: importExcelSchema,
    preValidation: importExcelPreValidation,
    handler: controller.importExcel.bind(controller),
  });

  fastify.post('/:id/import-excel', {
    schema: importExcelSchema,
    preValidation: importExcelPreValidation,
    handler: controller.importExcel.bind(controller),
  });

  // Export SSCJ Excel format
  fastify.get('/:id/export-sscj', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Export budget request to SSCJ Excel format',
      description:
        'Export budget request items to SSCJ (Provincial Public Health Office) Excel format for submission. ' +
        'Generates a formatted Excel file with 34 columns including line items, historical usage, quarterly distribution, and calculated amounts.',
      params: BudgetRequestsIdParamSchema,
      querystring: Type.Object({
        format: Type.Optional(
          Type.Union([Type.Literal('xlsx'), Type.Literal('csv')], {
            default: 'xlsx',
            description: 'Export format (default: xlsx)',
          }),
        ),
      }),
      response: {
        200: {
          type: 'string',
          format: 'binary',
          description: 'Excel file download',
        },
        404: SchemaRefs.NotFound,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'read'), // Using read permission for export
    ],
    handler: controller.exportSSCJ.bind(controller),
  });

  // ===== ITEM MANAGEMENT METHODS =====

  // ===== DASHBOARD ENDPOINTS =====

  // Get total request counts by status
  fastify.get('/stats/total', {
    schema: {
      tags: ['Inventory: Budget Requests Dashboard'],
      summary: 'Get total request counts by status',
      description:
        'Retrieves aggregated counts of budget requests, categorized by their status, for dashboard widgets. Query parameters can filter by fiscal year or department.',
      querystring: GetBudgetRequestsStatsQuerySchema,
      response: {
        200: BudgetRequestsStatsSchema,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate], // Permission is handled in the service
    handler: controller.getStats.bind(controller),
  });

  // Get requests pending the current user's action
  fastify.get('/my-pending-actions', {
    schema: {
      tags: ['Inventory: Budget Requests Dashboard'],
      summary: "Get requests pending the current user's action",
      description:
        'Retrieves a list of budget requests that are awaiting approval or action from the currently authenticated user, based on their role and permissions.',
      response: {
        200: MyPendingActionsResponseSchema,
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate],
    handler: controller.getMyPendingActions.bind(controller),
  });

  // Get most recent requests
  fastify.get('/recent', {
    schema: {
      tags: ['Inventory: Budget Requests Dashboard'],
      summary: 'Get most recent budget requests',
      description:
        'Retrieves a list of the most recently created or updated budget requests, based on user permissions.',
      querystring: RecentBudgetRequestsQuerySchema,
      response: {
        200: RecentBudgetRequestsResponseSchema,
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate],
    handler: controller.getRecent.bind(controller),
  });

  // ===== ITEM MANAGEMENT ENDPOINTS =====
  fastify.post('/:id/items', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Add drug item to budget request',
      description:
        'Add a new drug item to the budget request. Only allowed when status = DRAFT.',
      params: BudgetRequestsIdParamSchema,
      body: Type.Object({
        generic_id: Type.Number(),
        estimated_usage_2569: Type.Optional(Type.Number()),
        requested_qty: Type.Number(),
        unit_price: Type.Optional(Type.Number()),
        budget_qty: Type.Optional(Type.Number()),
        fund_qty: Type.Optional(Type.Number()),
        q1_qty: Type.Optional(Type.Number()),
        q2_qty: Type.Optional(Type.Number()),
        q3_qty: Type.Optional(Type.Number()),
        q4_qty: Type.Optional(Type.Number()),
        notes: Type.Optional(Type.String()),
      }),
      response: {
        201: Type.Object({
          success: Type.Boolean(),
          data: Type.Any(),
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'create'),
    ],
    handler: controller.addItem.bind(controller),
  });

  // Update budget request item
  fastify.put('/:id/items/:itemId', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Update budget request item',
      description:
        'Update an existing budget request item. Only allowed when status = DRAFT.',
      params: Type.Object({
        id: Type.Union([Type.String(), Type.Number()]),
        itemId: Type.Union([Type.String(), Type.Number()]),
      }),
      body: Type.Object({
        estimated_usage_2569: Type.Optional(Type.Number()),
        requested_qty: Type.Optional(Type.Number()),
        unit_price: Type.Optional(Type.Number()),
        budget_qty: Type.Optional(Type.Number()),
        fund_qty: Type.Optional(Type.Number()),
        q1_qty: Type.Optional(Type.Number()),
        q2_qty: Type.Optional(Type.Number()),
        q3_qty: Type.Optional(Type.Number()),
        q4_qty: Type.Optional(Type.Number()),
        notes: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Any(),
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'update'),
    ],
    handler: controller.updateItem.bind(controller),
  });

  // Batch update budget request items
  fastify.put('/:id/items/batch', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Batch update budget request items',
      description:
        'Update multiple budget request items at once. Only allowed when status = DRAFT. Max 100 items per request.',
      params: BudgetRequestsIdParamSchema,
      body: Type.Object({
        items: Type.Array(
          Type.Object({
            id: Type.Number(),
            estimated_usage_2569: Type.Optional(Type.Number()),
            requested_qty: Type.Optional(Type.Number()),
            unit_price: Type.Optional(Type.Number()),
            budget_qty: Type.Optional(Type.Number()),
            fund_qty: Type.Optional(Type.Number()),
            q1_qty: Type.Optional(Type.Number()),
            q2_qty: Type.Optional(Type.Number()),
            q3_qty: Type.Optional(Type.Number()),
            q4_qty: Type.Optional(Type.Number()),
            notes: Type.Optional(Type.String()),
            // Historical usage fields (editable)
            historical_usage: Type.Optional(
              Type.Record(Type.String(), Type.Number()),
            ),
            avg_usage: Type.Optional(Type.Number()),
            current_stock: Type.Optional(Type.Number()),
          }),
          { minItems: 1, maxItems: 100 },
        ),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            updated: Type.Number(),
            failed: Type.Number(),
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'update'),
    ],
    handler: controller.batchUpdateItems.bind(controller),
  });

  // Bulk delete selected items
  fastify.post('/:id/items/bulk-delete', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Bulk delete selected budget request items',
      description:
        'Delete selected items by IDs. Only allowed when status = DRAFT.',
      params: BudgetRequestsIdParamSchema,
      body: Type.Object({
        itemIds: Type.Array(Type.Number()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            deletedCount: Type.Number(),
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'delete'),
    ],
    handler: controller.bulkDeleteItems.bind(controller),
  });

  // Delete ALL budget request items (bulk delete)
  fastify.delete('/:id/items', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Delete ALL budget request items',
      description:
        'Delete ALL items in a budget request (reset). Only allowed when status = DRAFT. Uses efficient single SQL query.',
      params: BudgetRequestsIdParamSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            deletedCount: Type.Number(),
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'delete'),
    ],
    handler: controller.deleteAllItems.bind(controller),
  });

  // Delete budget request item
  fastify.delete('/:id/items/:itemId', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Delete budget request item',
      description:
        'Delete a budget request item. Only allowed when status = DRAFT.',
      params: Type.Object({
        id: Type.Union([Type.String(), Type.Number()]),
        itemId: Type.Union([Type.String(), Type.Number()]),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Any(),
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('budgetRequests', 'delete'),
    ],
    handler: controller.deleteItem.bind(controller),
  });

  // Get budget items status for dashboard
  fastify.get('/:id/items-status', {
    schema: {
      tags: ['Inventory: Budget Requests'],
      summary: 'Get budget items status for dashboard',
      description:
        'Get comprehensive status for all items in a budget request including usage percentages, control settings, and status determination (normal/warning/exceeded). Used for budget dashboard visualization.',
      params: BudgetRequestsIdParamSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: BudgetItemsStatusResponseSchema,
          message: Type.String(),
          meta: ApiMetaSchema,
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
      fastify.verifyPermission('budgetRequests', 'read'),
    ],
    handler: controller.getItemsStatus.bind(controller),
  });
}
