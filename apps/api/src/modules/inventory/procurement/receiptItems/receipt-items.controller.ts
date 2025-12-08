import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ReceiptItemsService } from './receipt-items.service';
import { CreateReceiptItems, UpdateReceiptItems } from './receipt-items.types';
import {
  CreateReceiptItemsSchema,
  UpdateReceiptItemsSchema,
  ReceiptItemsIdParamSchema,
  GetReceiptItemsQuerySchema,
  ListReceiptItemsQuerySchema,
} from './receipt-items.schemas';

/**
 * ReceiptItems Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ReceiptItemsController {
  constructor(private receiptItemsService: ReceiptItemsService) {}

  /**
   * Create new receiptItems
   * POST /receiptItems
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateReceiptItemsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating receiptItems');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const receiptItems = await this.receiptItemsService.create(createData);

    request.log.info(
      { receiptItemsId: receiptItems.id },
      'ReceiptItems created successfully',
    );

    return reply
      .code(201)
      .success(receiptItems, 'ReceiptItems created successfully');
  }

  /**
   * Get receiptItems by ID
   * GET /receiptItems/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptItemsIdParamSchema>;
      Querystring: Static<typeof GetReceiptItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ receiptItemsId: id }, 'Fetching receiptItems');

    const receiptItems = await this.receiptItemsService.findById(
      id,
      request.query,
    );

    return reply.success(receiptItems);
  }

  /**
   * Get paginated list of receiptItemss
   * GET /receiptItems
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListReceiptItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching receiptItems list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'receipt_id', 'created_at'],
      user: [
        'id',
        'receipt_id',
        'id',
        'receipt_id',
        'po_item_id',
        'generic_id',
        'quantity_ordered',
        'quantity_received',
        'quantity_accepted',
        'quantity_rejected',
        'rejection_reason',
        'unit_price',
        'total_price',
        'lot_number',
        'manufacture_date',
        'expiry_date',
        'notes',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'receipt_id',
        'po_item_id',
        'generic_id',
        'quantity_ordered',
        'quantity_received',
        'quantity_accepted',
        'quantity_rejected',
        'rejection_reason',
        'unit_price',
        'total_price',
        'lot_number',
        'manufacture_date',
        'expiry_date',
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

    // Get receiptItems list with field filtering
    const result = await this.receiptItemsService.findMany({
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
      'ReceiptItems list fetched',
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
   * Update receiptItems
   * PUT /receiptItems/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptItemsIdParamSchema>;
      Body: Static<typeof UpdateReceiptItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { receiptItemsId: id, body: request.body },
      'Updating receiptItems',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const receiptItems = await this.receiptItemsService.update(id, updateData);

    request.log.info(
      { receiptItemsId: id },
      'ReceiptItems updated successfully',
    );

    return reply.success(receiptItems, 'ReceiptItems updated successfully');
  }

  /**
   * Delete receiptItems
   * DELETE /receiptItems/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptItemsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ receiptItemsId: id }, 'Deleting receiptItems');

    const deleted = await this.receiptItemsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ReceiptItems not found');
    }

    request.log.info(
      { receiptItemsId: id },
      'ReceiptItems deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ReceiptItems deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateReceiptItemsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      receipt_id: schema.receipt_id,
      po_item_id: schema.po_item_id,
      generic_id: schema.generic_id,
      quantity_ordered: schema.quantity_ordered,
      quantity_received: schema.quantity_received,
      quantity_accepted: schema.quantity_accepted,
      quantity_rejected: schema.quantity_rejected,
      rejection_reason: schema.rejection_reason,
      unit_price: schema.unit_price,
      total_price: schema.total_price,
      lot_number: schema.lot_number,
      manufacture_date: schema.manufacture_date,
      expiry_date: schema.expiry_date,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateReceiptItemsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.receipt_id !== undefined) {
      updateData.receipt_id = schema.receipt_id;
    }
    if (schema.po_item_id !== undefined) {
      updateData.po_item_id = schema.po_item_id;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.quantity_ordered !== undefined) {
      updateData.quantity_ordered = schema.quantity_ordered;
    }
    if (schema.quantity_received !== undefined) {
      updateData.quantity_received = schema.quantity_received;
    }
    if (schema.quantity_accepted !== undefined) {
      updateData.quantity_accepted = schema.quantity_accepted;
    }
    if (schema.quantity_rejected !== undefined) {
      updateData.quantity_rejected = schema.quantity_rejected;
    }
    if (schema.rejection_reason !== undefined) {
      updateData.rejection_reason = schema.rejection_reason;
    }
    if (schema.unit_price !== undefined) {
      updateData.unit_price = schema.unit_price;
    }
    if (schema.total_price !== undefined) {
      updateData.total_price = schema.total_price;
    }
    if (schema.lot_number !== undefined) {
      updateData.lot_number = schema.lot_number;
    }
    if (schema.manufacture_date !== undefined) {
      updateData.manufacture_date = schema.manufacture_date;
    }
    if (schema.expiry_date !== undefined) {
      updateData.expiry_date = schema.expiry_date;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
