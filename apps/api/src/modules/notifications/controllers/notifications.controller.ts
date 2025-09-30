import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { NotificationsService } from '../services/notifications.service';
import {
  CreateNotifications,
  UpdateNotifications,
} from '../types/notifications.types';
import {
  CreateNotificationsSchema,
  UpdateNotificationsSchema,
  NotificationsIdParamSchema,
  GetNotificationsQuerySchema,
  ListNotificationsQuerySchema,
} from '../schemas/notifications.schemas';
import {
  DropdownQuerySchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  ValidationRequestSchema,
  UniquenessCheckSchema,
} from '../../../schemas/base.schemas';

/**
 * Notifications Controller
 * Package: full
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Create new notifications
   * POST /notifications
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateNotificationsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating notifications');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const notifications = await this.notificationsService.create(createData);

    request.log.info(
      { notificationsId: notifications.id },
      'Notifications created successfully',
    );

    return reply
      .code(201)
      .success(notifications, 'Notifications created successfully');
  }

  /**
   * Get notifications by ID
   * GET /notifications/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof NotificationsIdParamSchema>;
      Querystring: Static<typeof GetNotificationsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ notificationsId: id }, 'Fetching notifications');

    const notifications = await this.notificationsService.findById(
      id,
      request.query,
    );

    return reply.success(notifications);
  }

  /**
   * Get paginated list of notificationss
   * GET /notifications
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListNotificationsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching notifications list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'user_id', 'created_at'],
      user: [
        'id',
        'user_id',
        'id',
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'action_url',
        'read',
        'read_at',
        'archived',
        'archived_at',
        'priority',
        'expires_at',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'action_url',
        'read',
        'read_at',
        'archived',
        'archived_at',
        'priority',
        'expires_at',
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

    // Get notifications list with field filtering
    const result = await this.notificationsService.findMany({
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
      'Notifications list fetched',
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
   * Update notifications
   * PUT /notifications/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof NotificationsIdParamSchema>;
      Body: Static<typeof UpdateNotificationsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { notificationsId: id, body: request.body },
      'Updating notifications',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const notifications = await this.notificationsService.update(
      id,
      updateData,
    );

    request.log.info(
      { notificationsId: id },
      'Notifications updated successfully',
    );

    return reply.success(notifications, 'Notifications updated successfully');
  }

  /**
   * Delete notifications
   * DELETE /notifications/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof NotificationsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ notificationsId: id }, 'Deleting notifications');

    const deleted = await this.notificationsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Notifications not found');
    }

    request.log.info(
      { notificationsId: id },
      'Notifications deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Notifications deleted successfully',
    );
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options
   * GET /notifications/dropdown
   */
  async getDropdownOptions(
    request: FastifyRequest<{
      Querystring: Static<typeof DropdownQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching notifications dropdown options',
    );

    const result = await this.notificationsService.getDropdownOptions(
      request.query,
    );

    return reply.success({
      options: result.options,
      total: result.total,
    });
  }

  /**
   * Bulk create notificationss
   * POST /notifications/bulk
   */
  async bulkCreate(
    request: FastifyRequest<{
      Body: {
        items: CreateNotifications[];
        options?: { skipDuplicates?: boolean; continueOnError?: boolean };
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk creating notificationss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) =>
        this.transformCreateSchema(item, request),
      ),
    };

    const result = await this.notificationsService.bulkCreate(transformedData);

    return reply
      .code(201)
      .success(
        result,
        `Bulk create completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
  }

  /**
   * Bulk update notificationss
   * PUT /notifications/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: {
        items: Array<{ id: string | number; data: UpdateNotifications }>;
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk updating notificationss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) => ({
        id: item.id,
        data: this.transformUpdateSchema(item.data, request),
      })),
    };

    const result = await this.notificationsService.bulkUpdate(transformedData);

    return reply.success(
      result,
      `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk delete notificationss
   * DELETE /notifications/bulk
   */
  async bulkDelete(
    request: FastifyRequest<{ Body: Static<typeof BulkDeleteSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.ids.length },
      'Bulk deleting notificationss',
    );

    const result = await this.notificationsService.bulkDelete(request.body);

    return reply.success(
      result,
      `Bulk delete completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Get statistics
   * GET /notifications/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    request.log.info('Fetching notifications statistics');

    const stats = await this.notificationsService.getStats();

    return reply.success(stats);
  }

  // ===== FULL PACKAGE METHODS =====

  /**
   * Validate data before save
   * POST /notifications/validate
   */
  async validate(
    request: FastifyRequest<{
      Body: { data: Static<typeof CreateNotificationsSchema> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info('Validating notifications data');

    const result = await this.notificationsService.validate(request.body);

    return reply.success(result);
  }

  /**
   * Check field uniqueness
   * GET /notifications/check/:field
   */
  async checkUniqueness(
    request: FastifyRequest<{
      Params: { field: string };
      Querystring: Static<typeof UniquenessCheckSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { field } = request.params;
    request.log.info(
      { field, value: request.query.value },
      'Checking notifications field uniqueness',
    );

    const result = await this.notificationsService.checkUniqueness(field, {
      value: String(request.query.value),
      excludeId: request.query.excludeId,
    });

    return reply.success(result);
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateNotificationsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      user_id: schema.user_id,
      type: schema.type,
      title: schema.title,
      message: schema.message,
      data: schema.data,
      action_url: schema.action_url,
      read: schema.read,
      read_at: schema.read_at,
      archived: schema.archived,
      archived_at: schema.archived_at,
      priority: schema.priority,
      expires_at: schema.expires_at,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateNotificationsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.user_id !== undefined) {
      updateData.user_id = schema.user_id;
    }
    if (schema.type !== undefined) {
      updateData.type = schema.type;
    }
    if (schema.title !== undefined) {
      updateData.title = schema.title;
    }
    if (schema.message !== undefined) {
      updateData.message = schema.message;
    }
    if (schema.data !== undefined) {
      updateData.data = schema.data;
    }
    if (schema.action_url !== undefined) {
      updateData.action_url = schema.action_url;
    }
    if (schema.read !== undefined) {
      updateData.read = schema.read;
    }
    if (schema.read_at !== undefined) {
      updateData.read_at = schema.read_at;
    }
    if (schema.archived !== undefined) {
      updateData.archived = schema.archived;
    }
    if (schema.archived_at !== undefined) {
      updateData.archived_at = schema.archived_at;
    }
    if (schema.priority !== undefined) {
      updateData.priority = schema.priority;
    }
    if (schema.expires_at !== undefined) {
      updateData.expires_at = schema.expires_at;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
