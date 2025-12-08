import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrders,
  UpdatePurchaseOrders,
} from './purchase-orders.types';
import {
  CreatePurchaseOrdersSchema,
  UpdatePurchaseOrdersSchema,
  PurchaseOrdersIdParamSchema,
  GetPurchaseOrdersQuerySchema,
  ListPurchaseOrdersQuerySchema,
} from './purchase-orders.schemas';

/**
 * PurchaseOrders Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class PurchaseOrdersController {
  constructor(private purchaseOrdersService: PurchaseOrdersService) {}

  /**
   * Create new purchaseOrders
   * POST /purchaseOrders
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreatePurchaseOrdersSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating purchaseOrders');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const purchaseOrders = await this.purchaseOrdersService.create(createData);

    request.log.info(
      { purchaseOrdersId: purchaseOrders.id },
      'PurchaseOrders created successfully',
    );

    return reply
      .code(201)
      .success(purchaseOrders, 'PurchaseOrders created successfully');
  }

  /**
   * Get purchaseOrders by ID
   * GET /purchaseOrders/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseOrdersIdParamSchema>;
      Querystring: Static<typeof GetPurchaseOrdersQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ purchaseOrdersId: id }, 'Fetching purchaseOrders');

    const purchaseOrders = await this.purchaseOrdersService.findById(
      id,
      request.query,
    );

    return reply.success(purchaseOrders);
  }

  /**
   * Get paginated list of purchaseOrderss
   * GET /purchaseOrders
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListPurchaseOrdersQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching purchaseOrders list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'po_number', 'created_at'],
      user: [
        'id',
        'po_number',
        'id',
        'po_number',
        'pr_id',
        'vendor_id',
        'contract_id',
        'po_date',
        'delivery_date',
        'total_amount',
        'vat_amount',
        'grand_total',
        'status',
        'payment_terms',
        'shipping_address',
        'billing_address',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'po_number',
        'pr_id',
        'vendor_id',
        'contract_id',
        'po_date',
        'delivery_date',
        'total_amount',
        'vat_amount',
        'grand_total',
        'status',
        'payment_terms',
        'shipping_address',
        'billing_address',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'is_active',
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

    // Get purchaseOrders list with field filtering
    const result = await this.purchaseOrdersService.findMany({
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
      'PurchaseOrders list fetched',
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
   * Update purchaseOrders
   * PUT /purchaseOrders/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseOrdersIdParamSchema>;
      Body: Static<typeof UpdatePurchaseOrdersSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { purchaseOrdersId: id, body: request.body },
      'Updating purchaseOrders',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const purchaseOrders = await this.purchaseOrdersService.update(
      id,
      updateData,
    );

    request.log.info(
      { purchaseOrdersId: id },
      'PurchaseOrders updated successfully',
    );

    return reply.success(purchaseOrders, 'PurchaseOrders updated successfully');
  }

  /**
   * Delete purchaseOrders
   * DELETE /purchaseOrders/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseOrdersIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ purchaseOrdersId: id }, 'Deleting purchaseOrders');

    const deleted = await this.purchaseOrdersService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'PurchaseOrders not found');
    }

    request.log.info(
      { purchaseOrdersId: id },
      'PurchaseOrders deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'PurchaseOrders deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreatePurchaseOrdersSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      po_number: schema.po_number,
      pr_id: schema.pr_id,
      vendor_id: schema.vendor_id,
      contract_id: schema.contract_id,
      po_date: schema.po_date,
      delivery_date: schema.delivery_date,
      total_amount: schema.total_amount,
      vat_amount: schema.vat_amount,
      grand_total: schema.grand_total,
      status: schema.status,
      payment_terms: schema.payment_terms,
      shipping_address: schema.shipping_address,
      billing_address: schema.billing_address,
      notes: schema.notes,
      approved_by: schema.approved_by,
      approved_at: schema.approved_at,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field
    if (request.user?.id) {
      result.created_by = request.user.id;
    }

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdatePurchaseOrdersSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.po_number !== undefined) {
      updateData.po_number = schema.po_number;
    }
    if (schema.pr_id !== undefined) {
      updateData.pr_id = schema.pr_id;
    }
    if (schema.vendor_id !== undefined) {
      updateData.vendor_id = schema.vendor_id;
    }
    if (schema.contract_id !== undefined) {
      updateData.contract_id = schema.contract_id;
    }
    if (schema.po_date !== undefined) {
      updateData.po_date = schema.po_date;
    }
    if (schema.delivery_date !== undefined) {
      updateData.delivery_date = schema.delivery_date;
    }
    if (schema.total_amount !== undefined) {
      updateData.total_amount = schema.total_amount;
    }
    if (schema.vat_amount !== undefined) {
      updateData.vat_amount = schema.vat_amount;
    }
    if (schema.grand_total !== undefined) {
      updateData.grand_total = schema.grand_total;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.payment_terms !== undefined) {
      updateData.payment_terms = schema.payment_terms;
    }
    if (schema.shipping_address !== undefined) {
      updateData.shipping_address = schema.shipping_address;
    }
    if (schema.billing_address !== undefined) {
      updateData.billing_address = schema.billing_address;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }
    if (schema.approved_by !== undefined) {
      updateData.approved_by = schema.approved_by;
    }
    if (schema.approved_at !== undefined) {
      updateData.approved_at = schema.approved_at;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
