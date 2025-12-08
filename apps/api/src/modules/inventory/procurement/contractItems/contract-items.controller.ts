import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ContractItemsService } from './contract-items.service';
import {
  CreateContractItems,
  UpdateContractItems,
} from './contract-items.types';
import {
  CreateContractItemsSchema,
  UpdateContractItemsSchema,
  ContractItemsIdParamSchema,
  GetContractItemsQuerySchema,
  ListContractItemsQuerySchema,
} from './contract-items.schemas';

/**
 * ContractItems Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ContractItemsController {
  constructor(private contractItemsService: ContractItemsService) {}

  /**
   * Create new contractItems
   * POST /contractItems
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateContractItemsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating contractItems');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const contractItems = await this.contractItemsService.create(createData);

    request.log.info(
      { contractItemsId: contractItems.id },
      'ContractItems created successfully',
    );

    return reply
      .code(201)
      .success(contractItems, 'ContractItems created successfully');
  }

  /**
   * Get contractItems by ID
   * GET /contractItems/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ContractItemsIdParamSchema>;
      Querystring: Static<typeof GetContractItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ contractItemsId: id }, 'Fetching contractItems');

    const contractItems = await this.contractItemsService.findById(
      id,
      request.query,
    );

    return reply.success(contractItems);
  }

  /**
   * Get paginated list of contractItemss
   * GET /contractItems
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListContractItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching contractItems list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'contract_id', 'created_at'],
      user: [
        'id',
        'contract_id',
        'id',
        'contract_id',
        'generic_id',
        'agreed_unit_price',
        'quantity_limit',
        'quantity_used',
        'notes',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'contract_id',
        'generic_id',
        'agreed_unit_price',
        'quantity_limit',
        'quantity_used',
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

    // Get contractItems list with field filtering
    const result = await this.contractItemsService.findMany({
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
      'ContractItems list fetched',
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
   * Update contractItems
   * PUT /contractItems/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ContractItemsIdParamSchema>;
      Body: Static<typeof UpdateContractItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { contractItemsId: id, body: request.body },
      'Updating contractItems',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const contractItems = await this.contractItemsService.update(
      id,
      updateData,
    );

    request.log.info(
      { contractItemsId: id },
      'ContractItems updated successfully',
    );

    return reply.success(contractItems, 'ContractItems updated successfully');
  }

  /**
   * Delete contractItems
   * DELETE /contractItems/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ContractItemsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ contractItemsId: id }, 'Deleting contractItems');

    const deleted = await this.contractItemsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ContractItems not found');
    }

    request.log.info(
      { contractItemsId: id },
      'ContractItems deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ContractItems deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateContractItemsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      contract_id: schema.contract_id,
      generic_id: schema.generic_id,
      agreed_unit_price: schema.agreed_unit_price,
      quantity_limit: schema.quantity_limit,
      quantity_used: schema.quantity_used,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateContractItemsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.contract_id !== undefined) {
      updateData.contract_id = schema.contract_id;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.agreed_unit_price !== undefined) {
      updateData.agreed_unit_price = schema.agreed_unit_price;
    }
    if (schema.quantity_limit !== undefined) {
      updateData.quantity_limit = schema.quantity_limit;
    }
    if (schema.quantity_used !== undefined) {
      updateData.quantity_used = schema.quantity_used;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
