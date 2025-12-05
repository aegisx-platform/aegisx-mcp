import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugFocusListsService } from './drug-focus-lists.service';
import {
  CreateDrugFocusLists,
  UpdateDrugFocusLists,
} from './drug-focus-lists.types';
import {
  CreateDrugFocusListsSchema,
  UpdateDrugFocusListsSchema,
  DrugFocusListsIdParamSchema,
  GetDrugFocusListsQuerySchema,
  ListDrugFocusListsQuerySchema,
} from './drug-focus-lists.schemas';

/**
 * DrugFocusLists Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugFocusListsController {
  constructor(private drugFocusListsService: DrugFocusListsService) {}

  /**
   * Create new drugFocusLists
   * POST /drugFocusLists
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateDrugFocusListsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugFocusLists');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugFocusLists = await this.drugFocusListsService.create(createData);

    request.log.info(
      { drugFocusListsId: drugFocusLists.id },
      'DrugFocusLists created successfully',
    );

    return reply
      .code(201)
      .success(drugFocusLists, 'DrugFocusLists created successfully');
  }

  /**
   * Get drugFocusLists by ID
   * GET /drugFocusLists/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugFocusListsIdParamSchema>;
      Querystring: Static<typeof GetDrugFocusListsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugFocusListsId: id }, 'Fetching drugFocusLists');

    const drugFocusLists = await this.drugFocusListsService.findById(
      id,
      request.query,
    );

    return reply.success(drugFocusLists);
  }

  /**
   * Get paginated list of drugFocusListss
   * GET /drugFocusLists
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugFocusListsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugFocusLists list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'list_code', 'created_at'],
      user: [
        'id',
        'list_code',
        'id',
        'list_code',
        'list_name',
        'description',
        'generic_id',
        'drug_id',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'list_code',
        'list_name',
        'description',
        'generic_id',
        'drug_id',
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

    // Get drugFocusLists list with field filtering
    const result = await this.drugFocusListsService.findMany({
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
      'DrugFocusLists list fetched',
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
   * Update drugFocusLists
   * PUT /drugFocusLists/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugFocusListsIdParamSchema>;
      Body: Static<typeof UpdateDrugFocusListsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugFocusListsId: id, body: request.body },
      'Updating drugFocusLists',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugFocusLists = await this.drugFocusListsService.update(
      id,
      updateData,
    );

    request.log.info(
      { drugFocusListsId: id },
      'DrugFocusLists updated successfully',
    );

    return reply.success(drugFocusLists, 'DrugFocusLists updated successfully');
  }

  /**
   * Delete drugFocusLists
   * DELETE /drugFocusLists/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugFocusListsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugFocusListsId: id }, 'Deleting drugFocusLists');

    const deleted = await this.drugFocusListsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugFocusLists not found');
    }

    request.log.info(
      { drugFocusListsId: id },
      'DrugFocusLists deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugFocusLists deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugFocusListsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      list_code: schema.list_code,
      list_name: schema.list_name,
      description: schema.description,
      generic_id: schema.generic_id,
      drug_id: schema.drug_id,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugFocusListsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.list_code !== undefined) {
      updateData.list_code = schema.list_code;
    }
    if (schema.list_name !== undefined) {
      updateData.list_name = schema.list_name;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
