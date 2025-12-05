import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { LocationsService } from './locations.service';
import { CreateLocations, UpdateLocations } from './locations.types';
import {
  CreateLocationsSchema,
  UpdateLocationsSchema,
  LocationsIdParamSchema,
  GetLocationsQuerySchema,
  ListLocationsQuerySchema,
} from './locations.schemas';

/**
 * Locations Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  /**
   * Create new locations
   * POST /locations
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateLocationsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating locations');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const locations = await this.locationsService.create(createData);

    request.log.info(
      { locationsId: locations.id },
      'Locations created successfully',
    );

    return reply.code(201).success(locations, 'Locations created successfully');
  }

  /**
   * Get locations by ID
   * GET /locations/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof LocationsIdParamSchema>;
      Querystring: Static<typeof GetLocationsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ locationsId: id }, 'Fetching locations');

    const locations = await this.locationsService.findById(id, request.query);

    return reply.success(locations);
  }

  /**
   * Get paginated list of locationss
   * GET /locations
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListLocationsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching locations list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'location_code', 'created_at'],
      user: [
        'id',
        'location_code',
        'id',
        'location_code',
        'location_name',
        'location_type',
        'parent_id',
        'address',
        'responsible_person',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'location_code',
        'location_name',
        'location_type',
        'parent_id',
        'address',
        'responsible_person',
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

    // Get locations list with field filtering
    const result = await this.locationsService.findMany({
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
      'Locations list fetched',
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
   * Update locations
   * PUT /locations/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof LocationsIdParamSchema>;
      Body: Static<typeof UpdateLocationsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { locationsId: id, body: request.body },
      'Updating locations',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const locations = await this.locationsService.update(id, updateData);

    request.log.info({ locationsId: id }, 'Locations updated successfully');

    return reply.success(locations, 'Locations updated successfully');
  }

  /**
   * Delete locations
   * DELETE /locations/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof LocationsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ locationsId: id }, 'Deleting locations');

    const deleted = await this.locationsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Locations not found');
    }

    request.log.info({ locationsId: id }, 'Locations deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Locations deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateLocationsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      location_code: schema.location_code,
      location_name: schema.location_name,
      location_type: schema.location_type,
      parent_id: schema.parent_id,
      address: schema.address,
      responsible_person: schema.responsible_person,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateLocationsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.location_code !== undefined) {
      updateData.location_code = schema.location_code;
    }
    if (schema.location_name !== undefined) {
      updateData.location_name = schema.location_name;
    }
    if (schema.location_type !== undefined) {
      updateData.location_type = schema.location_type;
    }
    if (schema.parent_id !== undefined) {
      updateData.parent_id = schema.parent_id;
    }
    if (schema.address !== undefined) {
      updateData.address = schema.address;
    }
    if (schema.responsible_person !== undefined) {
      updateData.responsible_person = schema.responsible_person;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
