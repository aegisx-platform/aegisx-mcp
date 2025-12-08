import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugReturnsService } from './drug-returns.service';
import { CreateDrugReturns, UpdateDrugReturns } from './drug-returns.types';
import {
  CreateDrugReturnsSchema,
  UpdateDrugReturnsSchema,
  DrugReturnsIdParamSchema,
  GetDrugReturnsQuerySchema,
  ListDrugReturnsQuerySchema,
} from './drug-returns.schemas';

/**
 * DrugReturns Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugReturnsController {
  constructor(private drugReturnsService: DrugReturnsService) {}

  /**
   * Create new drugReturns
   * POST /drugReturns
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDrugReturnsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugReturns');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugReturns = await this.drugReturnsService.create(createData);

    request.log.info(
      { drugReturnsId: drugReturns.id },
      'DrugReturns created successfully',
    );

    return reply
      .code(201)
      .success(drugReturns, 'DrugReturns created successfully');
  }

  /**
   * Get drugReturns by ID
   * GET /drugReturns/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugReturnsIdParamSchema>;
      Querystring: Static<typeof GetDrugReturnsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugReturnsId: id }, 'Fetching drugReturns');

    const drugReturns = await this.drugReturnsService.findById(
      id,
      request.query,
    );

    return reply.success(drugReturns);
  }

  /**
   * Get paginated list of drugReturnss
   * GET /drugReturns
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugReturnsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugReturns list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'return_number', 'created_at'],
      user: [
        'id',
        'return_number',
        'id',
        'return_number',
        'department_id',
        'return_date',
        'return_reason_id',
        'return_reason',
        'action_taken',
        'status',
        'total_items',
        'total_amount',
        'received_by',
        'verified_by',
        'notes',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'return_number',
        'department_id',
        'return_date',
        'return_reason_id',
        'return_reason',
        'action_taken',
        'status',
        'total_items',
        'total_amount',
        'received_by',
        'verified_by',
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

    // Get drugReturns list with field filtering
    const result = await this.drugReturnsService.findMany({
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
      'DrugReturns list fetched',
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
   * Update drugReturns
   * PUT /drugReturns/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugReturnsIdParamSchema>;
      Body: Static<typeof UpdateDrugReturnsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugReturnsId: id, body: request.body },
      'Updating drugReturns',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugReturns = await this.drugReturnsService.update(id, updateData);

    request.log.info({ drugReturnsId: id }, 'DrugReturns updated successfully');

    return reply.success(drugReturns, 'DrugReturns updated successfully');
  }

  /**
   * Delete drugReturns
   * DELETE /drugReturns/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugReturnsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugReturnsId: id }, 'Deleting drugReturns');

    const deleted = await this.drugReturnsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugReturns not found');
    }

    request.log.info({ drugReturnsId: id }, 'DrugReturns deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugReturns deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugReturnsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      return_number: schema.return_number,
      department_id: schema.department_id,
      return_date: schema.return_date,
      return_reason_id: schema.return_reason_id,
      return_reason: schema.return_reason,
      action_taken: schema.action_taken,
      status: schema.status,
      total_items: schema.total_items,
      total_amount: schema.total_amount,
      received_by: schema.received_by,
      verified_by: schema.verified_by,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugReturnsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.return_number !== undefined) {
      updateData.return_number = schema.return_number;
    }
    if (schema.department_id !== undefined) {
      updateData.department_id = schema.department_id;
    }
    if (schema.return_date !== undefined) {
      updateData.return_date = schema.return_date;
    }
    if (schema.return_reason_id !== undefined) {
      updateData.return_reason_id = schema.return_reason_id;
    }
    if (schema.return_reason !== undefined) {
      updateData.return_reason = schema.return_reason;
    }
    if (schema.action_taken !== undefined) {
      updateData.action_taken = schema.action_taken;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.total_items !== undefined) {
      updateData.total_items = schema.total_items;
    }
    if (schema.total_amount !== undefined) {
      updateData.total_amount = schema.total_amount;
    }
    if (schema.received_by !== undefined) {
      updateData.received_by = schema.received_by;
    }
    if (schema.verified_by !== undefined) {
      updateData.verified_by = schema.verified_by;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
