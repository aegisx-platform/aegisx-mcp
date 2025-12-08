import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { PurchaseOrderItemsService } from './purchase-order-items.service';
import {
  CreatePurchaseOrderItems,
  UpdatePurchaseOrderItems,
} from './purchase-order-items.types';
import {
  CreatePurchaseOrderItemsSchema,
  UpdatePurchaseOrderItemsSchema,
  PurchaseOrderItemsIdParamSchema,
  GetPurchaseOrderItemsQuerySchema,
  ListPurchaseOrderItemsQuerySchema,
} from './purchase-order-items.schemas';

/**
 * PurchaseOrderItems Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class PurchaseOrderItemsController {
  constructor(private purchaseOrderItemsService: PurchaseOrderItemsService) {}

  /**
   * Create new purchaseOrderItems
   * POST /purchaseOrderItems
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreatePurchaseOrderItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating purchaseOrderItems');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const purchaseOrderItems =
      await this.purchaseOrderItemsService.create(createData);

    request.log.info(
      { purchaseOrderItemsId: purchaseOrderItems.id },
      'PurchaseOrderItems created successfully',
    );

    return reply
      .code(201)
      .success(purchaseOrderItems, 'PurchaseOrderItems created successfully');
  }

  /**
   * Get purchaseOrderItems by ID
   * GET /purchaseOrderItems/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseOrderItemsIdParamSchema>;
      Querystring: Static<typeof GetPurchaseOrderItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { purchaseOrderItemsId: id },
      'Fetching purchaseOrderItems',
    );

    const purchaseOrderItems = await this.purchaseOrderItemsService.findById(
      id,
      request.query,
    );

    return reply.success(purchaseOrderItems);
  }

  /**
   * Get paginated list of purchaseOrderItemss
   * GET /purchaseOrderItems
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListPurchaseOrderItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching purchaseOrderItems list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'po_id', 'created_at'],
      user: [
        'id',
        'po_id',
        'id',
        'po_id',
        'pr_item_id',
        'generic_id',
        'quantity',
        'unit',
        'unit_price',
        'discount_percent',
        'discount_amount',
        'total_price',
        'notes',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'po_id',
        'pr_item_id',
        'generic_id',
        'quantity',
        'unit',
        'unit_price',
        'discount_percent',
        'discount_amount',
        'total_price',
        'notes',
        'created_at',
        'updated_at',
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

    // Get purchaseOrderItems list with field filtering
    const result = await this.purchaseOrderItemsService.findMany({
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
      'PurchaseOrderItems list fetched',
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
   * Update purchaseOrderItems
   * PUT /purchaseOrderItems/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseOrderItemsIdParamSchema>;
      Body: Static<typeof UpdatePurchaseOrderItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { purchaseOrderItemsId: id, body: request.body },
      'Updating purchaseOrderItems',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const purchaseOrderItems = await this.purchaseOrderItemsService.update(
      id,
      updateData,
    );

    request.log.info(
      { purchaseOrderItemsId: id },
      'PurchaseOrderItems updated successfully',
    );

    return reply.success(
      purchaseOrderItems,
      'PurchaseOrderItems updated successfully',
    );
  }

  /**
   * Delete purchaseOrderItems
   * DELETE /purchaseOrderItems/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseOrderItemsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { purchaseOrderItemsId: id },
      'Deleting purchaseOrderItems',
    );

    const deleted = await this.purchaseOrderItemsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'PurchaseOrderItems not found');
    }

    request.log.info(
      { purchaseOrderItemsId: id },
      'PurchaseOrderItems deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'PurchaseOrderItems deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreatePurchaseOrderItemsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      po_id: schema.po_id,
      pr_item_id: schema.pr_item_id,
      generic_id: schema.generic_id,
      quantity: schema.quantity,
      unit: schema.unit,
      unit_price: schema.unit_price,
      discount_percent: schema.discount_percent,
      discount_amount: schema.discount_amount,
      total_price: schema.total_price,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdatePurchaseOrderItemsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.po_id !== undefined) {
      updateData.po_id = schema.po_id;
    }
    if (schema.pr_item_id !== undefined) {
      updateData.pr_item_id = schema.pr_item_id;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.quantity !== undefined) {
      updateData.quantity = schema.quantity;
    }
    if (schema.unit !== undefined) {
      updateData.unit = schema.unit;
    }
    if (schema.unit_price !== undefined) {
      updateData.unit_price = schema.unit_price;
    }
    if (schema.discount_percent !== undefined) {
      updateData.discount_percent = schema.discount_percent;
    }
    if (schema.discount_amount !== undefined) {
      updateData.discount_amount = schema.discount_amount;
    }
    if (schema.total_price !== undefined) {
      updateData.total_price = schema.total_price;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
