import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { SystemSettingsService } from './systemSettings.service';
import {
  CreateSystemSettingsSchema,
  UpdateSystemSettingsSchema,
  SystemSettingsIdParamSchema,
  GetSystemSettingsQuerySchema,
  ListSystemSettingsQuerySchema
} from './systemSettings.schemas';

/**
 * SystemSettings Controller
 * 
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class SystemSettingsController {
  constructor(private systemSettingsService: SystemSettingsService) {}

  /**
   * Create new systemSettings
   * POST /systemSettings
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateSystemSettingsSchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ body: request.body }, 'Creating systemSettings');

      // Transform API schema to domain model
      const createData = this.transformCreateSchema(request.body);
      
      const systemSettings = await this.systemSettingsService.create(createData);
      
      request.log.info({ systemSettingsId: systemSettings.id }, 'SystemSettings created successfully');

      return reply.status(201).send({
        success: true,
        data: systemSettings,
        message: 'SystemSettings created successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error creating systemSettings');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create systemSettings'
        }
      });
    }
  }

  /**
   * Get systemSettings by ID
   * GET /systemSettings/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof SystemSettingsIdParamSchema>;
      Querystring: Static<typeof GetSystemSettingsQuerySchema>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ systemSettingsId: id }, 'Fetching systemSettings');

      const systemSettings = await this.systemSettingsService.findById(id, request.query);

      if (!systemSettings) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'SystemSettings not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: systemSettings
      });
    } catch (error) {
      request.log.error({ error, systemSettingsId: request.params.id }, 'Error fetching systemSettings');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch systemSettings'
        }
      });
    }
  }

  /**
   * Get paginated list of systemSettingss
   * GET /systemSettings
   */
  async findMany(
    request: FastifyRequest<{ Querystring: Static<typeof ListSystemSettingsQuerySchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching systemSettings list');

      const result = await this.systemSettingsService.findMany(request.query);

      request.log.info({ count: result.data.length, total: result.pagination.total }, 'SystemSettings list fetched');

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error({ error, query: request.query }, 'Error fetching systemSettings list');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'LIST_FETCH_FAILED',
          message: 'Failed to fetch systemSettings list'
        }
      });
    }
  }

  /**
   * Update systemSettings
   * PUT /systemSettings/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof SystemSettingsIdParamSchema>;
      Body: Static<typeof UpdateSystemSettingsSchema>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ systemSettingsId: id, body: request.body }, 'Updating systemSettings');

      // Transform API schema to domain model
      const updateData = this.transformUpdateSchema(request.body);
      
      const systemSettings = await this.systemSettingsService.update(id, updateData);

      if (!systemSettings) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'SystemSettings not found'
          }
        });
      }

      request.log.info({ systemSettingsId: id }, 'SystemSettings updated successfully');

      return reply.send({
        success: true,
        data: systemSettings,
        message: 'SystemSettings updated successfully'
      });
    } catch (error) {
      request.log.error({ error, systemSettingsId: request.params.id }, 'Error updating systemSettings');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update systemSettings'
        }
      });
    }
  }

  /**
   * Delete systemSettings
   * DELETE /systemSettings/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof SystemSettingsIdParamSchema> }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ systemSettingsId: id }, 'Deleting systemSettings');

      const deleted = await this.systemSettingsService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'SystemSettings not found'
          }
        });
      }

      request.log.info({ systemSettingsId: id }, 'SystemSettings deleted successfully');

      return reply.send({
        success: true,
        message: 'SystemSettings deleted successfully',
        data: { id, deleted: true }
      });
    } catch (error) {
      request.log.error({ error, systemSettingsId: request.params.id }, 'Error deleting systemSettings');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete systemSettings'
        }
      });
    }
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(schema: Static<typeof CreateSystemSettingsSchema>) {
    return {
      // Transform snake_case API fields to camelCase domain fields
      category: schema.category,
      key: schema.key,
      value: schema.value,
      data_type: schema.data_type,
      description: schema.description,
      is_public: schema.is_public,
      requires_restart: schema.requires_restart,
    };
  }

  /**
   * Transform API update schema to domain model  
   */
  private transformUpdateSchema(schema: Static<typeof UpdateSystemSettingsSchema>) {
    const updateData: any = {};
    
    if (schema.category !== undefined) {
      updateData.category = schema.category;
    }
    if (schema.key !== undefined) {
      updateData.key = schema.key;
    }
    if (schema.value !== undefined) {
      updateData.value = schema.value;
    }
    if (schema.data_type !== undefined) {
      updateData.data_type = schema.data_type;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.is_public !== undefined) {
      updateData.is_public = schema.is_public;
    }
    if (schema.requires_restart !== undefined) {
      updateData.requires_restart = schema.requires_restart;
    }
    
    return updateData;
  }
}