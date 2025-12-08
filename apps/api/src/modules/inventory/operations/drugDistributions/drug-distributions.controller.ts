import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugDistributionsService } from './drug-distributions.service';
import {
  CreateDrugDistributions,
  UpdateDrugDistributions,
} from './drug-distributions.types';
import {
  CreateDrugDistributionsSchema,
  UpdateDrugDistributionsSchema,
  DrugDistributionsIdParamSchema,
  GetDrugDistributionsQuerySchema,
  ListDrugDistributionsQuerySchema,
} from './drug-distributions.schemas';

/**
 * DrugDistributions Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugDistributionsController {
  constructor(private drugDistributionsService: DrugDistributionsService) {}

  /**
   * Create new drugDistributions
   * POST /drugDistributions
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateDrugDistributionsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugDistributions');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugDistributions =
      await this.drugDistributionsService.create(createData);

    request.log.info(
      { drugDistributionsId: drugDistributions.id },
      'DrugDistributions created successfully',
    );

    return reply
      .code(201)
      .success(drugDistributions, 'DrugDistributions created successfully');
  }

  /**
   * Get drugDistributions by ID
   * GET /drugDistributions/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugDistributionsIdParamSchema>;
      Querystring: Static<typeof GetDrugDistributionsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugDistributionsId: id }, 'Fetching drugDistributions');

    const drugDistributions = await this.drugDistributionsService.findById(
      id,
      request.query,
    );

    return reply.success(drugDistributions);
  }

  /**
   * Get paginated list of drugDistributionss
   * GET /drugDistributions
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugDistributionsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching drugDistributions list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'distribution_number', 'created_at'],
      user: [
        'id',
        'distribution_number',
        'id',
        'distribution_number',
        'distribution_date',
        'distribution_type_id',
        'from_location_id',
        'to_location_id',
        'requesting_dept_id',
        'requested_by',
        'approved_by',
        'dispensed_by',
        'status',
        'total_items',
        'total_amount',
        'notes',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'distribution_number',
        'distribution_date',
        'distribution_type_id',
        'from_location_id',
        'to_location_id',
        'requesting_dept_id',
        'requested_by',
        'approved_by',
        'dispensed_by',
        'status',
        'total_items',
        'total_amount',
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

    // Get drugDistributions list with field filtering
    const result = await this.drugDistributionsService.findMany({
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
      'DrugDistributions list fetched',
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
   * Update drugDistributions
   * PUT /drugDistributions/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugDistributionsIdParamSchema>;
      Body: Static<typeof UpdateDrugDistributionsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugDistributionsId: id, body: request.body },
      'Updating drugDistributions',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugDistributions = await this.drugDistributionsService.update(
      id,
      updateData,
    );

    request.log.info(
      { drugDistributionsId: id },
      'DrugDistributions updated successfully',
    );

    return reply.success(
      drugDistributions,
      'DrugDistributions updated successfully',
    );
  }

  /**
   * Delete drugDistributions
   * DELETE /drugDistributions/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugDistributionsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugDistributionsId: id }, 'Deleting drugDistributions');

    const deleted = await this.drugDistributionsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugDistributions not found');
    }

    request.log.info(
      { drugDistributionsId: id },
      'DrugDistributions deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugDistributions deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugDistributionsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      distribution_number: schema.distribution_number,
      distribution_date: schema.distribution_date,
      distribution_type_id: schema.distribution_type_id,
      from_location_id: schema.from_location_id,
      to_location_id: schema.to_location_id,
      requesting_dept_id: schema.requesting_dept_id,
      requested_by: schema.requested_by,
      approved_by: schema.approved_by,
      dispensed_by: schema.dispensed_by,
      status: schema.status,
      total_items: schema.total_items,
      total_amount: schema.total_amount,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugDistributionsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.distribution_number !== undefined) {
      updateData.distribution_number = schema.distribution_number;
    }
    if (schema.distribution_date !== undefined) {
      updateData.distribution_date = schema.distribution_date;
    }
    if (schema.distribution_type_id !== undefined) {
      updateData.distribution_type_id = schema.distribution_type_id;
    }
    if (schema.from_location_id !== undefined) {
      updateData.from_location_id = schema.from_location_id;
    }
    if (schema.to_location_id !== undefined) {
      updateData.to_location_id = schema.to_location_id;
    }
    if (schema.requesting_dept_id !== undefined) {
      updateData.requesting_dept_id = schema.requesting_dept_id;
    }
    if (schema.requested_by !== undefined) {
      updateData.requested_by = schema.requested_by;
    }
    if (schema.approved_by !== undefined) {
      updateData.approved_by = schema.approved_by;
    }
    if (schema.dispensed_by !== undefined) {
      updateData.dispensed_by = schema.dispensed_by;
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
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
