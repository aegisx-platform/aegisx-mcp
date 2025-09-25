import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationsSchema,
  UpdateNotificationsSchema,
  NotificationsIdParamSchema,
  GetNotificationsQuerySchema,
  ListNotificationsQuerySchema
} from './notifications.schemas';

/**
 * Notifications Controller
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
    reply: FastifyReply
  ) {
    try {
      request.log.info({ body: request.body }, 'Creating notifications');

      // Transform API schema to domain model
      const createData = this.transformCreateSchema(request.body);
      
      const notifications = await this.notificationsService.create(createData);
      
      request.log.info({ notificationsId: notifications.id }, 'Notifications created successfully');

      return reply.status(201).send({
        success: true,
        data: notifications,
        message: 'Notifications created successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error creating notifications');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create notifications'
        }
      });
    }
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
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ notificationsId: id }, 'Fetching notifications');

      const notifications = await this.notificationsService.findById(id, request.query);

      if (!notifications) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notifications not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: notifications
      });
    } catch (error) {
      request.log.error({ error, notificationsId: request.params.id }, 'Error fetching notifications');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch notifications'
        }
      });
    }
  }

  /**
   * Get paginated list of notificationss
   * GET /notifications
   */
  async findMany(
    request: FastifyRequest<{ Querystring: Static<typeof ListNotificationsQuerySchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching notifications list');

      const result = await this.notificationsService.findMany(request.query);

      request.log.info({ count: result.data.length, total: result.pagination.total }, 'Notifications list fetched');

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error({ error, query: request.query }, 'Error fetching notifications list');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'LIST_FETCH_FAILED',
          message: 'Failed to fetch notifications list'
        }
      });
    }
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
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ notificationsId: id, body: request.body }, 'Updating notifications');

      // Transform API schema to domain model
      const updateData = this.transformUpdateSchema(request.body);
      
      const notifications = await this.notificationsService.update(id, updateData);

      if (!notifications) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notifications not found'
          }
        });
      }

      request.log.info({ notificationsId: id }, 'Notifications updated successfully');

      return reply.send({
        success: true,
        data: notifications,
        message: 'Notifications updated successfully'
      });
    } catch (error) {
      request.log.error({ error, notificationsId: request.params.id }, 'Error updating notifications');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update notifications'
        }
      });
    }
  }

  /**
   * Delete notifications
   * DELETE /notifications/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof NotificationsIdParamSchema> }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ notificationsId: id }, 'Deleting notifications');

      const deleted = await this.notificationsService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notifications not found'
          }
        });
      }

      request.log.info({ notificationsId: id }, 'Notifications deleted successfully');

      return reply.send({
        success: true,
        message: 'Notifications deleted successfully',
        data: { id, deleted: true }
      });
    } catch (error) {
      request.log.error({ error, notificationsId: request.params.id }, 'Error deleting notifications');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete notifications'
        }
      });
    }
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(schema: Static<typeof CreateNotificationsSchema>) {
    return {
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
  }

  /**
   * Transform API update schema to domain model  
   */
  private transformUpdateSchema(schema: Static<typeof UpdateNotificationsSchema>) {
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
    
    return updateData;
  }
}