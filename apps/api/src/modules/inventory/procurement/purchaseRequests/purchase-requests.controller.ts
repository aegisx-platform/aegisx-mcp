import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { PurchaseRequestsService } from './purchase-requests.service';
import {
  CreatePurchaseRequests,
  UpdatePurchaseRequests,
} from './purchase-requests.types';
import {
  CreatePurchaseRequestsSchema,
  UpdatePurchaseRequestsSchema,
  PurchaseRequestsIdParamSchema,
  GetPurchaseRequestsQuerySchema,
  ListPurchaseRequestsQuerySchema,
} from './purchase-requests.schemas';

/**
 * PurchaseRequests Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class PurchaseRequestsController {
  constructor(private purchaseRequestsService: PurchaseRequestsService) {}

  /**
   * Create new purchaseRequests
   * POST /purchaseRequests
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreatePurchaseRequestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating purchaseRequests');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const purchaseRequests =
      await this.purchaseRequestsService.create(createData);

    request.log.info(
      { purchaseRequestsId: purchaseRequests.id },
      'PurchaseRequests created successfully',
    );

    return reply
      .code(201)
      .success(purchaseRequests, 'PurchaseRequests created successfully');
  }

  /**
   * Get purchaseRequests by ID
   * GET /purchaseRequests/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseRequestsIdParamSchema>;
      Querystring: Static<typeof GetPurchaseRequestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ purchaseRequestsId: id }, 'Fetching purchaseRequests');

    const purchaseRequests = await this.purchaseRequestsService.findById(
      id,
      request.query,
    );

    return reply.success(purchaseRequests);
  }

  /**
   * Get paginated list of purchaseRequestss
   * GET /purchaseRequests
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListPurchaseRequestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching purchaseRequests list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'pr_number', 'created_at'],
      user: [
        'id',
        'pr_number',
        'id',
        'pr_number',
        'department_id',
        'budget_id',
        'fiscal_year',
        'request_date',
        'required_date',
        'requested_by',
        'total_amount',
        'status',
        'priority',
        'purpose',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'pr_number',
        'department_id',
        'budget_id',
        'fiscal_year',
        'request_date',
        'required_date',
        'requested_by',
        'total_amount',
        'status',
        'priority',
        'purpose',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
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

    // Get purchaseRequests list with field filtering
    const result = await this.purchaseRequestsService.findMany({
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
      'PurchaseRequests list fetched',
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
   * Update purchaseRequests
   * PUT /purchaseRequests/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseRequestsIdParamSchema>;
      Body: Static<typeof UpdatePurchaseRequestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { purchaseRequestsId: id, body: request.body },
      'Updating purchaseRequests',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const purchaseRequests = await this.purchaseRequestsService.update(
      id,
      updateData,
    );

    request.log.info(
      { purchaseRequestsId: id },
      'PurchaseRequests updated successfully',
    );

    return reply.success(
      purchaseRequests,
      'PurchaseRequests updated successfully',
    );
  }

  /**
   * Delete purchaseRequests
   * DELETE /purchaseRequests/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseRequestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ purchaseRequestsId: id }, 'Deleting purchaseRequests');

    const deleted = await this.purchaseRequestsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'PurchaseRequests not found');
    }

    request.log.info(
      { purchaseRequestsId: id },
      'PurchaseRequests deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'PurchaseRequests deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreatePurchaseRequestsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      pr_number: schema.pr_number,
      department_id: schema.department_id,
      budget_id: schema.budget_id,
      fiscal_year: schema.fiscal_year,
      request_date: schema.request_date,
      required_date: schema.required_date,
      requested_by: schema.requested_by,
      total_amount: schema.total_amount,
      status: schema.status,
      priority: schema.priority,
      purpose: schema.purpose,
      approved_by: schema.approved_by,
      approved_at: schema.approved_at,
      rejected_by: schema.rejected_by,
      rejected_at: schema.rejected_at,
      rejection_reason: schema.rejection_reason,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdatePurchaseRequestsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.pr_number !== undefined) {
      updateData.pr_number = schema.pr_number;
    }
    if (schema.department_id !== undefined) {
      updateData.department_id = schema.department_id;
    }
    if (schema.budget_id !== undefined) {
      updateData.budget_id = schema.budget_id;
    }
    if (schema.fiscal_year !== undefined) {
      updateData.fiscal_year = schema.fiscal_year;
    }
    if (schema.request_date !== undefined) {
      updateData.request_date = schema.request_date;
    }
    if (schema.required_date !== undefined) {
      updateData.required_date = schema.required_date;
    }
    if (schema.requested_by !== undefined) {
      updateData.requested_by = schema.requested_by;
    }
    if (schema.total_amount !== undefined) {
      updateData.total_amount = schema.total_amount;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.priority !== undefined) {
      updateData.priority = schema.priority;
    }
    if (schema.purpose !== undefined) {
      updateData.purpose = schema.purpose;
    }
    if (schema.approved_by !== undefined) {
      updateData.approved_by = schema.approved_by;
    }
    if (schema.approved_at !== undefined) {
      updateData.approved_at = schema.approved_at;
    }
    if (schema.rejected_by !== undefined) {
      updateData.rejected_by = schema.rejected_by;
    }
    if (schema.rejected_at !== undefined) {
      updateData.rejected_at = schema.rejected_at;
    }
    if (schema.rejection_reason !== undefined) {
      updateData.rejection_reason = schema.rejection_reason;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
