import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ContractsService } from './contracts.service';
import { CreateContracts, UpdateContracts } from './contracts.types';
import {
  CreateContractsSchema,
  UpdateContractsSchema,
  ContractsIdParamSchema,
  GetContractsQuerySchema,
  ListContractsQuerySchema,
} from './contracts.schemas';

/**
 * Contracts Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  /**
   * Create new contracts
   * POST /contracts
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateContractsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating contracts');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const contracts = await this.contractsService.create(createData);

    request.log.info(
      { contractsId: contracts.id },
      'Contracts created successfully',
    );

    return reply.code(201).success(contracts, 'Contracts created successfully');
  }

  /**
   * Get contracts by ID
   * GET /contracts/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ContractsIdParamSchema>;
      Querystring: Static<typeof GetContractsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ contractsId: id }, 'Fetching contracts');

    const contracts = await this.contractsService.findById(id, request.query);

    return reply.success(contracts);
  }

  /**
   * Get paginated list of contractss
   * GET /contracts
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListContractsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching contracts list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'contract_number', 'created_at'],
      user: [
        'id',
        'contract_number',
        'id',
        'contract_number',
        'contract_type',
        'vendor_id',
        'start_date',
        'end_date',
        'total_value',
        'remaining_value',
        'fiscal_year',
        'status',
        'egp_number',
        'project_number',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'contract_number',
        'contract_type',
        'vendor_id',
        'start_date',
        'end_date',
        'total_value',
        'remaining_value',
        'fiscal_year',
        'status',
        'egp_number',
        'project_number',
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

    // Get contracts list with field filtering
    const result = await this.contractsService.findMany({
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
      'Contracts list fetched',
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
   * Update contracts
   * PUT /contracts/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ContractsIdParamSchema>;
      Body: Static<typeof UpdateContractsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { contractsId: id, body: request.body },
      'Updating contracts',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const contracts = await this.contractsService.update(id, updateData);

    request.log.info({ contractsId: id }, 'Contracts updated successfully');

    return reply.success(contracts, 'Contracts updated successfully');
  }

  /**
   * Delete contracts
   * DELETE /contracts/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ContractsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ contractsId: id }, 'Deleting contracts');

    const deleted = await this.contractsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Contracts not found');
    }

    request.log.info({ contractsId: id }, 'Contracts deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Contracts deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateContractsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      contract_number: schema.contract_number,
      contract_type: schema.contract_type,
      vendor_id: schema.vendor_id,
      start_date: schema.start_date,
      end_date: schema.end_date,
      total_value: schema.total_value,
      remaining_value: schema.remaining_value,
      fiscal_year: schema.fiscal_year,
      status: schema.status,
      egp_number: schema.egp_number,
      project_number: schema.project_number,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateContractsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.contract_number !== undefined) {
      updateData.contract_number = schema.contract_number;
    }
    if (schema.contract_type !== undefined) {
      updateData.contract_type = schema.contract_type;
    }
    if (schema.vendor_id !== undefined) {
      updateData.vendor_id = schema.vendor_id;
    }
    if (schema.start_date !== undefined) {
      updateData.start_date = schema.start_date;
    }
    if (schema.end_date !== undefined) {
      updateData.end_date = schema.end_date;
    }
    if (schema.total_value !== undefined) {
      updateData.total_value = schema.total_value;
    }
    if (schema.remaining_value !== undefined) {
      updateData.remaining_value = schema.remaining_value;
    }
    if (schema.fiscal_year !== undefined) {
      updateData.fiscal_year = schema.fiscal_year;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.egp_number !== undefined) {
      updateData.egp_number = schema.egp_number;
    }
    if (schema.project_number !== undefined) {
      updateData.project_number = schema.project_number;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
