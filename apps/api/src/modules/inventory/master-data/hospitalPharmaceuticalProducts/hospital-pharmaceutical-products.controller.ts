import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { HospitalPharmaceuticalProductsService } from './hospital-pharmaceutical-products.service';
import {
  CreateHospitalPharmaceuticalProducts,
  UpdateHospitalPharmaceuticalProducts,
} from './hospital-pharmaceutical-products.types';
import {
  CreateHospitalPharmaceuticalProductsSchema,
  UpdateHospitalPharmaceuticalProductsSchema,
  HospitalPharmaceuticalProductsIdParamSchema,
  GetHospitalPharmaceuticalProductsQuerySchema,
  ListHospitalPharmaceuticalProductsQuerySchema,
} from './hospital-pharmaceutical-products.schemas';

/**
 * HospitalPharmaceuticalProducts Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class HospitalPharmaceuticalProductsController {
  constructor(
    private hospitalPharmaceuticalProductsService: HospitalPharmaceuticalProductsService,
  ) {}

  /**
   * Create new hospitalPharmaceuticalProducts
   * POST /hospitalPharmaceuticalProducts
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateHospitalPharmaceuticalProductsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { body: request.body },
      'Creating hospitalPharmaceuticalProducts',
    );

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const hospitalPharmaceuticalProducts =
      await this.hospitalPharmaceuticalProductsService.create(createData);

    request.log.info(
      { hospitalPharmaceuticalProductsId: hospitalPharmaceuticalProducts.id },
      'HospitalPharmaceuticalProducts created successfully',
    );

    return reply
      .code(201)
      .success(
        hospitalPharmaceuticalProducts,
        'HospitalPharmaceuticalProducts created successfully',
      );
  }

  /**
   * Get hospitalPharmaceuticalProducts by ID
   * GET /hospitalPharmaceuticalProducts/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof HospitalPharmaceuticalProductsIdParamSchema>;
      Querystring: Static<typeof GetHospitalPharmaceuticalProductsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { hospitalPharmaceuticalProductsId: id },
      'Fetching hospitalPharmaceuticalProducts',
    );

    const hospitalPharmaceuticalProducts =
      await this.hospitalPharmaceuticalProductsService.findById(
        id,
        request.query,
      );

    return reply.success(hospitalPharmaceuticalProducts);
  }

  /**
   * Get paginated list of hospitalPharmaceuticalProductss
   * GET /hospitalPharmaceuticalProducts
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListHospitalPharmaceuticalProductsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching hospitalPharmaceuticalProducts list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'hpp_code', 'created_at'],
      user: [
        'id',
        'hpp_code',
        'id',
        'hpp_code',
        'hpp_type',
        'product_name',
        'generic_id',
        'drug_id',
        'base_product_id',
        'tmt_code',
        'is_outsourced',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'hpp_code',
        'hpp_type',
        'product_name',
        'generic_id',
        'drug_id',
        'base_product_id',
        'tmt_code',
        'is_outsourced',
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

    // Get hospitalPharmaceuticalProducts list with field filtering
    const result = await this.hospitalPharmaceuticalProductsService.findMany({
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
      'HospitalPharmaceuticalProducts list fetched',
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
   * Update hospitalPharmaceuticalProducts
   * PUT /hospitalPharmaceuticalProducts/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof HospitalPharmaceuticalProductsIdParamSchema>;
      Body: Static<typeof UpdateHospitalPharmaceuticalProductsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { hospitalPharmaceuticalProductsId: id, body: request.body },
      'Updating hospitalPharmaceuticalProducts',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const hospitalPharmaceuticalProducts =
      await this.hospitalPharmaceuticalProductsService.update(id, updateData);

    request.log.info(
      { hospitalPharmaceuticalProductsId: id },
      'HospitalPharmaceuticalProducts updated successfully',
    );

    return reply.success(
      hospitalPharmaceuticalProducts,
      'HospitalPharmaceuticalProducts updated successfully',
    );
  }

  /**
   * Delete hospitalPharmaceuticalProducts
   * DELETE /hospitalPharmaceuticalProducts/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof HospitalPharmaceuticalProductsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { hospitalPharmaceuticalProductsId: id },
      'Deleting hospitalPharmaceuticalProducts',
    );

    const deleted = await this.hospitalPharmaceuticalProductsService.delete(id);

    if (!deleted) {
      return reply
        .code(404)
        .error('NOT_FOUND', 'HospitalPharmaceuticalProducts not found');
    }

    request.log.info(
      { hospitalPharmaceuticalProductsId: id },
      'HospitalPharmaceuticalProducts deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'HospitalPharmaceuticalProducts deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateHospitalPharmaceuticalProductsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      hpp_code: schema.hpp_code,
      hpp_type: schema.hpp_type,
      product_name: schema.product_name,
      generic_id: schema.generic_id,
      drug_id: schema.drug_id,
      base_product_id: schema.base_product_id,
      tmt_code: schema.tmt_code,
      is_outsourced: schema.is_outsourced,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateHospitalPharmaceuticalProductsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.hpp_code !== undefined) {
      updateData.hpp_code = schema.hpp_code;
    }
    if (schema.hpp_type !== undefined) {
      updateData.hpp_type = schema.hpp_type;
    }
    if (schema.product_name !== undefined) {
      updateData.product_name = schema.product_name;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.base_product_id !== undefined) {
      updateData.base_product_id = schema.base_product_id;
    }
    if (schema.tmt_code !== undefined) {
      updateData.tmt_code = schema.tmt_code;
    }
    if (schema.is_outsourced !== undefined) {
      updateData.is_outsourced = schema.is_outsourced;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
