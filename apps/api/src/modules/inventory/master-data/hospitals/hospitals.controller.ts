import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { HospitalsService } from './hospitals.service';
import { CreateHospitals, UpdateHospitals } from './hospitals.types';
import {
  CreateHospitalsSchema,
  UpdateHospitalsSchema,
  HospitalsIdParamSchema,
  GetHospitalsQuerySchema,
  ListHospitalsQuerySchema,
} from './hospitals.schemas';

/**
 * Hospitals Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class HospitalsController {
  constructor(private hospitalsService: HospitalsService) {}

  /**
   * Create new hospitals
   * POST /hospitals
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateHospitalsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating hospitals');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const hospitals = await this.hospitalsService.create(createData);

    request.log.info(
      { hospitalsId: hospitals.id },
      'Hospitals created successfully',
    );

    return reply.code(201).success(hospitals, 'Hospitals created successfully');
  }

  /**
   * Get hospitals by ID
   * GET /hospitals/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof HospitalsIdParamSchema>;
      Querystring: Static<typeof GetHospitalsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ hospitalsId: id }, 'Fetching hospitals');

    const hospitals = await this.hospitalsService.findById(id, request.query);

    return reply.success(hospitals);
  }

  /**
   * Get paginated list of hospitalss
   * GET /hospitals
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListHospitalsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching hospitals list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'hospital_code', 'created_at'],
      user: [
        'id',
        'hospital_code',
        'id',
        'hospital_code',
        'hospital_name',
        'hospital_type',
        'province',
        'region',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'hospital_code',
        'hospital_name',
        'hospital_type',
        'province',
        'region',
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

    // Get hospitals list with field filtering
    const result = await this.hospitalsService.findMany({
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
      'Hospitals list fetched',
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
   * Update hospitals
   * PUT /hospitals/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof HospitalsIdParamSchema>;
      Body: Static<typeof UpdateHospitalsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { hospitalsId: id, body: request.body },
      'Updating hospitals',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const hospitals = await this.hospitalsService.update(id, updateData);

    request.log.info({ hospitalsId: id }, 'Hospitals updated successfully');

    return reply.success(hospitals, 'Hospitals updated successfully');
  }

  /**
   * Delete hospitals
   * DELETE /hospitals/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof HospitalsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ hospitalsId: id }, 'Deleting hospitals');

    const deleted = await this.hospitalsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Hospitals not found');
    }

    request.log.info({ hospitalsId: id }, 'Hospitals deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Hospitals deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateHospitalsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      hospital_code: schema.hospital_code,
      hospital_name: schema.hospital_name,
      hospital_type: schema.hospital_type,
      province: schema.province,
      region: schema.region,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateHospitalsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.hospital_code !== undefined) {
      updateData.hospital_code = schema.hospital_code;
    }
    if (schema.hospital_name !== undefined) {
      updateData.hospital_name = schema.hospital_name;
    }
    if (schema.hospital_type !== undefined) {
      updateData.hospital_type = schema.hospital_type;
    }
    if (schema.province !== undefined) {
      updateData.province = schema.province;
    }
    if (schema.region !== undefined) {
      updateData.region = schema.region;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
