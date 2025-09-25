import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ApiKeysService } from './apiKeys.service';
import {
  CreateApiKeysSchema,
  UpdateApiKeysSchema,
  ApiKeysIdParamSchema,
  GetApiKeysQuerySchema,
  ListApiKeysQuerySchema
} from './apiKeys.schemas';

/**
 * ApiKeys Controller
 * 
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  /**
   * Create new apiKeys
   * POST /apiKeys
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateApiKeysSchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ body: request.body }, 'Creating apiKeys');

      // Transform API schema to domain model
      const createData = this.transformCreateSchema(request.body);
      
      const apiKeys = await this.apiKeysService.create(createData);
      
      request.log.info({ apiKeysId: apiKeys.id }, 'ApiKeys created successfully');

      return reply.status(201).send({
        success: true,
        data: apiKeys,
        message: 'ApiKeys created successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error creating apiKeys');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create apiKeys'
        }
      });
    }
  }

  /**
   * Get apiKeys by ID
   * GET /apiKeys/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ApiKeysIdParamSchema>;
      Querystring: Static<typeof GetApiKeysQuerySchema>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ apiKeysId: id }, 'Fetching apiKeys');

      const apiKeys = await this.apiKeysService.findById(id, request.query);

      if (!apiKeys) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'ApiKeys not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      request.log.error({ error, apiKeysId: request.params.id }, 'Error fetching apiKeys');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch apiKeys'
        }
      });
    }
  }

  /**
   * Get paginated list of apiKeyss
   * GET /apiKeys
   */
  async findMany(
    request: FastifyRequest<{ Querystring: Static<typeof ListApiKeysQuerySchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching apiKeys list');

      const result = await this.apiKeysService.findMany(request.query);

      request.log.info({ count: result.data.length, total: result.pagination.total }, 'ApiKeys list fetched');

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error({ error, query: request.query }, 'Error fetching apiKeys list');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'LIST_FETCH_FAILED',
          message: 'Failed to fetch apiKeys list'
        }
      });
    }
  }

  /**
   * Update apiKeys
   * PUT /apiKeys/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ApiKeysIdParamSchema>;
      Body: Static<typeof UpdateApiKeysSchema>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ apiKeysId: id, body: request.body }, 'Updating apiKeys');

      // Transform API schema to domain model
      const updateData = this.transformUpdateSchema(request.body);
      
      const apiKeys = await this.apiKeysService.update(id, updateData);

      if (!apiKeys) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'ApiKeys not found'
          }
        });
      }

      request.log.info({ apiKeysId: id }, 'ApiKeys updated successfully');

      return reply.send({
        success: true,
        data: apiKeys,
        message: 'ApiKeys updated successfully'
      });
    } catch (error) {
      request.log.error({ error, apiKeysId: request.params.id }, 'Error updating apiKeys');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update apiKeys'
        }
      });
    }
  }

  /**
   * Delete apiKeys
   * DELETE /apiKeys/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ApiKeysIdParamSchema> }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ apiKeysId: id }, 'Deleting apiKeys');

      const deleted = await this.apiKeysService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'ApiKeys not found'
          }
        });
      }

      request.log.info({ apiKeysId: id }, 'ApiKeys deleted successfully');

      return reply.send({
        success: true,
        message: 'ApiKeys deleted successfully',
        data: { id, deleted: true }
      });
    } catch (error) {
      request.log.error({ error, apiKeysId: request.params.id }, 'Error deleting apiKeys');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete apiKeys'
        }
      });
    }
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(schema: Static<typeof CreateApiKeysSchema>) {
    return {
      // Transform snake_case API fields to camelCase domain fields
      user_id: schema.user_id,
      name: schema.name,
      key_hash: schema.key_hash,
      key_prefix: schema.key_prefix,
      scopes: schema.scopes,
      last_used_at: schema.last_used_at,
      last_used_ip: schema.last_used_ip,
      expires_at: schema.expires_at,
      is_active: schema.is_active,
    };
  }

  /**
   * Transform API update schema to domain model  
   */
  private transformUpdateSchema(schema: Static<typeof UpdateApiKeysSchema>) {
    const updateData: any = {};
    
    if (schema.user_id !== undefined) {
      updateData.user_id = schema.user_id;
    }
    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.key_hash !== undefined) {
      updateData.key_hash = schema.key_hash;
    }
    if (schema.key_prefix !== undefined) {
      updateData.key_prefix = schema.key_prefix;
    }
    if (schema.scopes !== undefined) {
      updateData.scopes = schema.scopes;
    }
    if (schema.last_used_at !== undefined) {
      updateData.last_used_at = schema.last_used_at;
    }
    if (schema.last_used_ip !== undefined) {
      updateData.last_used_ip = schema.last_used_ip;
    }
    if (schema.expires_at !== undefined) {
      updateData.expires_at = schema.expires_at;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    
    return updateData;
  }
}