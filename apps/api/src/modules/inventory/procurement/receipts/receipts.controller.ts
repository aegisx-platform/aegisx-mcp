import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ReceiptsService } from './receipts.service';
import { CreateReceipts, UpdateReceipts } from './receipts.types';
import {
  CreateReceiptsSchema,
  UpdateReceiptsSchema,
  ReceiptsIdParamSchema,
  GetReceiptsQuerySchema,
  ListReceiptsQuerySchema,
} from './receipts.schemas';

/**
 * Receipts Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ReceiptsController {
  constructor(private receiptsService: ReceiptsService) {}

  /**
   * Create new receipts
   * POST /receipts
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateReceiptsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating receipts');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const receipts = await this.receiptsService.create(createData);

    request.log.info(
      { receiptsId: receipts.id },
      'Receipts created successfully',
    );

    return reply.code(201).success(receipts, 'Receipts created successfully');
  }

  /**
   * Get receipts by ID
   * GET /receipts/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptsIdParamSchema>;
      Querystring: Static<typeof GetReceiptsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ receiptsId: id }, 'Fetching receipts');

    const receipts = await this.receiptsService.findById(id, request.query);

    return reply.success(receipts);
  }

  /**
   * Get paginated list of receiptss
   * GET /receipts
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListReceiptsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching receipts list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'receipt_number', 'created_at'],
      user: [
        'id',
        'receipt_number',
        'id',
        'receipt_number',
        'po_id',
        'location_id',
        'receipt_date',
        'delivery_note_number',
        'invoice_number',
        'invoice_date',
        'status',
        'total_amount',
        'notes',
        'received_by',
        'inspected_by',
        'inspected_at',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'receipt_number',
        'po_id',
        'location_id',
        'receipt_date',
        'delivery_note_number',
        'invoice_number',
        'invoice_date',
        'status',
        'total_amount',
        'notes',
        'received_by',
        'inspected_by',
        'inspected_at',
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

    // Get receipts list with field filtering
    const result = await this.receiptsService.findMany({
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
      'Receipts list fetched',
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
   * Update receipts
   * PUT /receipts/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptsIdParamSchema>;
      Body: Static<typeof UpdateReceiptsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { receiptsId: id, body: request.body },
      'Updating receipts',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const receipts = await this.receiptsService.update(id, updateData);

    request.log.info({ receiptsId: id }, 'Receipts updated successfully');

    return reply.success(receipts, 'Receipts updated successfully');
  }

  /**
   * Delete receipts
   * DELETE /receipts/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ReceiptsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ receiptsId: id }, 'Deleting receipts');

    const deleted = await this.receiptsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Receipts not found');
    }

    request.log.info({ receiptsId: id }, 'Receipts deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Receipts deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateReceiptsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      receipt_number: schema.receipt_number,
      po_id: schema.po_id,
      location_id: schema.location_id,
      receipt_date: schema.receipt_date,
      delivery_note_number: schema.delivery_note_number,
      invoice_number: schema.invoice_number,
      invoice_date: schema.invoice_date,
      status: schema.status,
      total_amount: schema.total_amount,
      notes: schema.notes,
      received_by: schema.received_by,
      inspected_by: schema.inspected_by,
      inspected_at: schema.inspected_at,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateReceiptsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.receipt_number !== undefined) {
      updateData.receipt_number = schema.receipt_number;
    }
    if (schema.po_id !== undefined) {
      updateData.po_id = schema.po_id;
    }
    if (schema.location_id !== undefined) {
      updateData.location_id = schema.location_id;
    }
    if (schema.receipt_date !== undefined) {
      updateData.receipt_date = schema.receipt_date;
    }
    if (schema.delivery_note_number !== undefined) {
      updateData.delivery_note_number = schema.delivery_note_number;
    }
    if (schema.invoice_number !== undefined) {
      updateData.invoice_number = schema.invoice_number;
    }
    if (schema.invoice_date !== undefined) {
      updateData.invoice_date = schema.invoice_date;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.total_amount !== undefined) {
      updateData.total_amount = schema.total_amount;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }
    if (schema.received_by !== undefined) {
      updateData.received_by = schema.received_by;
    }
    if (schema.inspected_by !== undefined) {
      updateData.inspected_by = schema.inspected_by;
    }
    if (schema.inspected_at !== undefined) {
      updateData.inspected_at = schema.inspected_at;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
