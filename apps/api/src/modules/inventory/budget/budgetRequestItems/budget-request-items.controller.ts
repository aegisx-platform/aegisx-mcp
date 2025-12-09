import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { BudgetRequestItemsService } from './budget-request-items.service';
import {
  CreateBudgetRequestItems,
  UpdateBudgetRequestItems,
} from './budget-request-items.types';
import {
  CreateBudgetRequestItemsSchema,
  UpdateBudgetRequestItemsSchema,
  BudgetRequestItemsIdParamSchema,
  GetBudgetRequestItemsQuerySchema,
  ListBudgetRequestItemsQuerySchema,
  BatchUpdateBudgetRequestItemsSchema,
} from './budget-request-items.schemas';

/**
 * BudgetRequestItems Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class BudgetRequestItemsController {
  constructor(private budgetRequestItemsService: BudgetRequestItemsService) {}

  /**
   * Create new budgetRequestItems
   * POST /budgetRequestItems
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateBudgetRequestItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating budgetRequestItems');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const budgetRequestItems =
      await this.budgetRequestItemsService.create(createData);

    request.log.info(
      { budgetRequestItemsId: budgetRequestItems.id },
      'BudgetRequestItems created successfully',
    );

    return reply
      .code(201)
      .success(budgetRequestItems, 'BudgetRequestItems created successfully');
  }

  /**
   * Get budgetRequestItems by ID
   * GET /budgetRequestItems/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestItemsIdParamSchema>;
      Querystring: Static<typeof GetBudgetRequestItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestItemsId: id },
      'Fetching budgetRequestItems',
    );

    const budgetRequestItems = await this.budgetRequestItemsService.findById(
      id,
      request.query,
    );

    return reply.success(budgetRequestItems);
  }

  /**
   * Get paginated list of budgetRequestItemss
   * GET /budgetRequestItems
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListBudgetRequestItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching budgetRequestItems list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'budget_request_id', 'created_at'],
      user: [
        'id',
        'budget_request_id',
        'id',
        'budget_request_id',
        'budget_id',
        'requested_amount',
        'q1_qty',
        'q2_qty',
        'q3_qty',
        'q4_qty',
        'item_justification',
        'created_at',
        'updated_at',
        'drug_id',
        'generic_id',
        'generic_code',
        'generic_name',
        'package_size',
        'unit',
        'line_number',
        'avg_usage',
        'estimated_usage_2569',
        'current_stock',
        'estimated_purchase',
        'unit_price',
        'requested_qty',
        'budget_type_id',
        'budget_category_id',
        'historical_usage',
        'created_at',
      ],
      admin: [
        'id',
        'budget_request_id',
        'budget_id',
        'requested_amount',
        'q1_qty',
        'q2_qty',
        'q3_qty',
        'q4_qty',
        'item_justification',
        'created_at',
        'updated_at',
        'drug_id',
        'generic_id',
        'generic_code',
        'generic_name',
        'package_size',
        'unit',
        'line_number',
        'avg_usage',
        'estimated_usage_2569',
        'current_stock',
        'estimated_purchase',
        'unit_price',
        'requested_qty',
        'budget_type_id',
        'budget_category_id',
        'historical_usage',
      ],
    };

    // 🛡️ Security: Get user role (default to public for safety)
    const userRole = request.user?.role || 'public';
    const allowedFields = SAFE_FIELDS[userRole] || SAFE_FIELDS.public;

    // 🛡️ Security: Filter requested fields against whitelist
    const safeFields = fields
      ? fields.filter((field) => allowedFields.includes(field))
      : undefined;

    // 🛡️ Security: Log suspicious requests
    if (fields && fields.some((field) => !allowedFields.includes(field))) {
      request.log.warn(
        {
          user: request.user?.id,
          requestedFields: fields,
          allowedFields,
          ip: request.ip,
        },
        'Suspicious field access attempt detected',
      );
    }

    // Get budgetRequestItems list with field filtering
    const result = await this.budgetRequestItemsService.findMany({
      ...queryParams,
      fields: safeFields,
    });

    request.log.info(
      {
        count: result.data.length,
        total: result.pagination.total,
        fieldsRequested: fields?.length || 0,
        fieldsAllowed: safeFields?.length || 'all',
      },
      'BudgetRequestItems list fetched',
    );

    // Use raw send to match FlexibleSchema
    return reply.send({
      success: true,
      data: result.data,
      pagination: result.pagination,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  /**
   * Update budgetRequestItems
   * PUT /budgetRequestItems/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestItemsIdParamSchema>;
      Body: Static<typeof UpdateBudgetRequestItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestItemsId: id, body: request.body },
      'Updating budgetRequestItems',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const budgetRequestItems = await this.budgetRequestItemsService.update(
      id,
      updateData,
    );

    request.log.info(
      { budgetRequestItemsId: id },
      'BudgetRequestItems updated successfully',
    );

    return reply.success(
      budgetRequestItems,
      'BudgetRequestItems updated successfully',
    );
  }

  /**
   * Delete budgetRequestItems
   * DELETE /budgetRequestItems/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestItemsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestItemsId: id },
      'Deleting budgetRequestItems',
    );

    const deleted = await this.budgetRequestItemsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'BudgetRequestItems not found');
    }

    request.log.info(
      { budgetRequestItemsId: id },
      'BudgetRequestItems deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'BudgetRequestItems deleted successfully',
    );
  }

  /**
   * Batch update multiple budget request items
   * POST /budgetRequestItems/batch-update
   */
  async batchUpdate(
    request: FastifyRequest<{
      Body: Static<typeof BatchUpdateBudgetRequestItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { itemCount: request.body.items.length },
      'Batch updating budget request items',
    );

    const result = await this.budgetRequestItemsService.batchUpdate(
      request.body.items,
    );

    request.log.info(
      { updated: result.updated, failed: result.failed },
      'Batch update complete',
    );

    return reply.success(result, 'Batch update completed');
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateBudgetRequestItemsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      budget_request_id: schema.budget_request_id,
      budget_id: schema.budget_id,
      requested_amount: schema.requested_amount,
      q1_qty: schema.q1_qty,
      q2_qty: schema.q2_qty,
      q3_qty: schema.q3_qty,
      q4_qty: schema.q4_qty,
      item_justification: schema.item_justification,
      drug_id: schema.drug_id,
      generic_id: schema.generic_id,
      generic_code: schema.generic_code,
      generic_name: schema.generic_name,
      package_size: schema.package_size,
      unit: schema.unit,
      line_number: schema.line_number,
      avg_usage: schema.avg_usage,
      estimated_usage_2569: schema.estimated_usage_2569,
      current_stock: schema.current_stock,
      estimated_purchase: schema.estimated_purchase,
      unit_price: schema.unit_price,
      requested_qty: schema.requested_qty,
      budget_type_id: schema.budget_type_id,
      budget_category_id: schema.budget_category_id,
      historical_usage: schema.historical_usage,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateBudgetRequestItemsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.budget_request_id !== undefined) {
      updateData.budget_request_id = schema.budget_request_id;
    }
    if (schema.budget_id !== undefined) {
      updateData.budget_id = schema.budget_id;
    }
    if (schema.requested_amount !== undefined) {
      updateData.requested_amount = schema.requested_amount;
    }
    if (schema.q1_qty !== undefined) {
      updateData.q1_qty = schema.q1_qty;
    }
    if (schema.q2_qty !== undefined) {
      updateData.q2_qty = schema.q2_qty;
    }
    if (schema.q3_qty !== undefined) {
      updateData.q3_qty = schema.q3_qty;
    }
    if (schema.q4_qty !== undefined) {
      updateData.q4_qty = schema.q4_qty;
    }
    if (schema.item_justification !== undefined) {
      updateData.item_justification = schema.item_justification;
    }
    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.generic_code !== undefined) {
      updateData.generic_code = schema.generic_code;
    }
    if (schema.generic_name !== undefined) {
      updateData.generic_name = schema.generic_name;
    }
    if (schema.package_size !== undefined) {
      updateData.package_size = schema.package_size;
    }
    if (schema.unit !== undefined) {
      updateData.unit = schema.unit;
    }
    if (schema.line_number !== undefined) {
      updateData.line_number = schema.line_number;
    }
    if (schema.avg_usage !== undefined) {
      updateData.avg_usage = schema.avg_usage;
    }
    if (schema.estimated_usage_2569 !== undefined) {
      updateData.estimated_usage_2569 = schema.estimated_usage_2569;
    }
    if (schema.current_stock !== undefined) {
      updateData.current_stock = schema.current_stock;
    }
    if (schema.estimated_purchase !== undefined) {
      updateData.estimated_purchase = schema.estimated_purchase;
    }
    if (schema.unit_price !== undefined) {
      updateData.unit_price = schema.unit_price;
    }
    if (schema.requested_qty !== undefined) {
      updateData.requested_qty = schema.requested_qty;
    }
    if (schema.budget_type_id !== undefined) {
      updateData.budget_type_id = schema.budget_type_id;
    }
    if (schema.budget_category_id !== undefined) {
      updateData.budget_category_id = schema.budget_category_id;
    }
    if (schema.historical_usage !== undefined) {
      updateData.historical_usage = schema.historical_usage;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
