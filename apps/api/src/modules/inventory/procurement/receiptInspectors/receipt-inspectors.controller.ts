import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ReceiptInspectorsService } from './receipt-inspectors.service';
import {
  CreateReceiptInspectors,
  UpdateReceiptInspectors,
} from './receipt-inspectors.types';
import {
  CreateReceiptInspectorsSchema,
  UpdateReceiptInspectorsSchema,
  ReceiptInspectorsIdParamSchema,
  GetReceiptInspectorsQuerySchema,
  ListReceiptInspectorsQuerySchema,
} from './receipt-inspectors.schemas';

/**
 * ReceiptInspectors Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ReceiptInspectorsController {
  constructor(private receiptInspectorsService: ReceiptInspectorsService) {}

  /**
   * Create new receiptInspectors
   * POST /receiptInspectors
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateReceiptInspectorsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating receiptInspectors');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const receiptInspectors =
      await this.receiptInspectorsService.create(createData);

    request.log.info(
      { receiptInspectorsId: receiptInspectors.id },
      'ReceiptInspectors created successfully',
    );

    return reply
      .code(201)
      .success(receiptInspectors, 'ReceiptInspectors created successfully');
  }

  /**
   * Get receiptInspectors by ID
   * GET /receiptInspectors/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptInspectorsIdParamSchema>;
      Querystring: Static<typeof GetReceiptInspectorsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ receiptInspectorsId: id }, 'Fetching receiptInspectors');

    const receiptInspectors = await this.receiptInspectorsService.findById(
      id,
      request.query,
    );

    return reply.success(receiptInspectors);
  }

  /**
   * Get paginated list of receiptInspectorss
   * GET /receiptInspectors
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListReceiptInspectorsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching receiptInspectors list',
    );

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
        'inspector_id',
        'inspector_role',
        'inspected_at',
        'notes',
        'created_at',
        'created_at',
      ],
      admin: [
        'id',
        'receipt_id',
        'inspector_id',
        'inspector_role',
        'inspected_at',
        'notes',
        'created_at',
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

    // Get receiptInspectors list with field filtering
    const result = await this.receiptInspectorsService.findMany({
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
      'ReceiptInspectors list fetched',
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
   * Update receiptInspectors
   * PUT /receiptInspectors/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptInspectorsIdParamSchema>;
      Body: Static<typeof UpdateReceiptInspectorsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { receiptInspectorsId: id, body: request.body },
      'Updating receiptInspectors',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const receiptInspectors = await this.receiptInspectorsService.update(
      id,
      updateData,
    );

    request.log.info(
      { receiptInspectorsId: id },
      'ReceiptInspectors updated successfully',
    );

    return reply.success(
      receiptInspectors,
      'ReceiptInspectors updated successfully',
    );
  }

  /**
   * Delete receiptInspectors
   * DELETE /receiptInspectors/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ReceiptInspectorsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ receiptInspectorsId: id }, 'Deleting receiptInspectors');

    const deleted = await this.receiptInspectorsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ReceiptInspectors not found');
    }

    request.log.info(
      { receiptInspectorsId: id },
      'ReceiptInspectors deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ReceiptInspectors deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateReceiptInspectorsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      receipt_id: schema.receipt_id,
      inspector_id: schema.inspector_id,
      inspector_role: schema.inspector_role,
      inspected_at: schema.inspected_at,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateReceiptInspectorsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.receipt_id !== undefined) {
      updateData.receipt_id = schema.receipt_id;
    }
    if (schema.inspector_id !== undefined) {
      updateData.inspector_id = schema.inspector_id;
    }
    if (schema.inspector_role !== undefined) {
      updateData.inspector_role = schema.inspector_role;
    }
    if (schema.inspected_at !== undefined) {
      updateData.inspected_at = schema.inspected_at;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
