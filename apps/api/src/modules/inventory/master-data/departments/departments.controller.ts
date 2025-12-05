import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DepartmentsService } from './departments.service';
import { CreateDepartments, UpdateDepartments } from './departments.types';
import {
  CreateDepartmentsSchema,
  UpdateDepartmentsSchema,
  DepartmentsIdParamSchema,
  GetDepartmentsQuerySchema,
  ListDepartmentsQuerySchema,
} from './departments.schemas';

/**
 * Departments Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  /**
   * Create new departments
   * POST /departments
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDepartmentsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating departments');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const departments = await this.departmentsService.create(createData);

    request.log.info(
      { departmentsId: departments.id },
      'Departments created successfully',
    );

    return reply
      .code(201)
      .success(departments, 'Departments created successfully');
  }

  /**
   * Get departments by ID
   * GET /departments/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DepartmentsIdParamSchema>;
      Querystring: Static<typeof GetDepartmentsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ departmentsId: id }, 'Fetching departments');

    const departments = await this.departmentsService.findById(
      id,
      request.query,
    );

    return reply.success(departments);
  }

  /**
   * Get paginated list of departmentss
   * GET /departments
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDepartmentsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching departments list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'dept_code', 'created_at'],
      user: [
        'id',
        'dept_code',
        'id',
        'dept_code',
        'dept_name',
        'his_code',
        'parent_id',
        'consumption_group',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'dept_code',
        'dept_name',
        'his_code',
        'parent_id',
        'consumption_group',
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

    // Get departments list with field filtering
    const result = await this.departmentsService.findMany({
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
      'Departments list fetched',
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
   * Update departments
   * PUT /departments/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DepartmentsIdParamSchema>;
      Body: Static<typeof UpdateDepartmentsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { departmentsId: id, body: request.body },
      'Updating departments',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const departments = await this.departmentsService.update(id, updateData);

    request.log.info({ departmentsId: id }, 'Departments updated successfully');

    return reply.success(departments, 'Departments updated successfully');
  }

  /**
   * Delete departments
   * DELETE /departments/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DepartmentsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ departmentsId: id }, 'Deleting departments');

    const deleted = await this.departmentsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Departments not found');
    }

    request.log.info({ departmentsId: id }, 'Departments deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Departments deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDepartmentsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      dept_code: schema.dept_code,
      dept_name: schema.dept_name,
      his_code: schema.his_code,
      parent_id: schema.parent_id,
      consumption_group: schema.consumption_group,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDepartmentsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.dept_code !== undefined) {
      updateData.dept_code = schema.dept_code;
    }
    if (schema.dept_name !== undefined) {
      updateData.dept_name = schema.dept_name;
    }
    if (schema.his_code !== undefined) {
      updateData.his_code = schema.his_code;
    }
    if (schema.parent_id !== undefined) {
      updateData.parent_id = schema.parent_id;
    }
    if (schema.consumption_group !== undefined) {
      updateData.consumption_group = schema.consumption_group;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
