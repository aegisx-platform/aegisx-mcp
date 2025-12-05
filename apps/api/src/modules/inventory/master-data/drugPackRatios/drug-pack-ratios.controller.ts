import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugPackRatiosService } from './drug-pack-ratios.service';
import {
  CreateDrugPackRatios,
  UpdateDrugPackRatios,
} from './drug-pack-ratios.types';
import {
  CreateDrugPackRatiosSchema,
  UpdateDrugPackRatiosSchema,
  DrugPackRatiosIdParamSchema,
  GetDrugPackRatiosQuerySchema,
  ListDrugPackRatiosQuerySchema,
} from './drug-pack-ratios.schemas';

/**
 * DrugPackRatios Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugPackRatiosController {
  constructor(private drugPackRatiosService: DrugPackRatiosService) {}

  /**
   * Create new drugPackRatios
   * POST /drugPackRatios
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateDrugPackRatiosSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugPackRatios');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugPackRatios = await this.drugPackRatiosService.create(createData);

    request.log.info(
      { drugPackRatiosId: drugPackRatios.id },
      'DrugPackRatios created successfully',
    );

    return reply
      .code(201)
      .success(drugPackRatios, 'DrugPackRatios created successfully');
  }

  /**
   * Get drugPackRatios by ID
   * GET /drugPackRatios/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugPackRatiosIdParamSchema>;
      Querystring: Static<typeof GetDrugPackRatiosQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugPackRatiosId: id }, 'Fetching drugPackRatios');

    const drugPackRatios = await this.drugPackRatiosService.findById(
      id,
      request.query,
    );

    return reply.success(drugPackRatios);
  }

  /**
   * Get paginated list of drugPackRatioss
   * GET /drugPackRatios
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugPackRatiosQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugPackRatios list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'drug_id', 'created_at'],
      user: [
        'id',
        'drug_id',
        'id',
        'drug_id',
        'company_id',
        'pack_size',
        'pack_unit',
        'unit_per_pack',
        'pack_price',
        'is_default',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'drug_id',
        'company_id',
        'pack_size',
        'pack_unit',
        'unit_per_pack',
        'pack_price',
        'is_default',
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

    // Get drugPackRatios list with field filtering
    const result = await this.drugPackRatiosService.findMany({
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
      'DrugPackRatios list fetched',
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
   * Update drugPackRatios
   * PUT /drugPackRatios/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugPackRatiosIdParamSchema>;
      Body: Static<typeof UpdateDrugPackRatiosSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugPackRatiosId: id, body: request.body },
      'Updating drugPackRatios',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugPackRatios = await this.drugPackRatiosService.update(
      id,
      updateData,
    );

    request.log.info(
      { drugPackRatiosId: id },
      'DrugPackRatios updated successfully',
    );

    return reply.success(drugPackRatios, 'DrugPackRatios updated successfully');
  }

  /**
   * Delete drugPackRatios
   * DELETE /drugPackRatios/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugPackRatiosIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugPackRatiosId: id }, 'Deleting drugPackRatios');

    const deleted = await this.drugPackRatiosService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugPackRatios not found');
    }

    request.log.info(
      { drugPackRatiosId: id },
      'DrugPackRatios deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugPackRatios deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugPackRatiosSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      drug_id: schema.drug_id,
      company_id: schema.company_id,
      pack_size: schema.pack_size,
      pack_unit: schema.pack_unit,
      unit_per_pack: schema.unit_per_pack,
      pack_price: schema.pack_price,
      is_default: schema.is_default,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugPackRatiosSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.company_id !== undefined) {
      updateData.company_id = schema.company_id;
    }
    if (schema.pack_size !== undefined) {
      updateData.pack_size = schema.pack_size;
    }
    if (schema.pack_unit !== undefined) {
      updateData.pack_unit = schema.pack_unit;
    }
    if (schema.unit_per_pack !== undefined) {
      updateData.unit_per_pack = schema.unit_per_pack;
    }
    if (schema.pack_price !== undefined) {
      updateData.pack_price = schema.pack_price;
    }
    if (schema.is_default !== undefined) {
      updateData.is_default = schema.is_default;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
