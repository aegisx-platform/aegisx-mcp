import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ApiKeysService } from '../services/apiKeys.service';
import {
  CreateApiKeysSchema,
  UpdateApiKeysSchema,
  ApiKeysIdParamSchema,
  GetApiKeysQuerySchema,
  ListApiKeysQuerySchema,
  GenerateApiKeySchema,
  ValidateApiKeySchema,
  RevokeApiKeySchema,
  RotateApiKeySchema,
  UserApiKeysQuerySchema,
} from '../schemas/apiKeys.schemas';
import { AuthenticatedRequest } from '../middleware/apiKeys.middleware';

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
    reply: FastifyReply,
  ) {
    try {
      request.log.info({ body: request.body }, 'Creating apiKeys');

      // Transform API schema to domain model
      const createData = this.transformCreateSchema(request.body);

      const apiKeys = await this.apiKeysService.create(createData);

      request.log.info(
        { apiKeysId: apiKeys.id },
        'ApiKeys created successfully',
      );

      return reply.status(201).send({
        success: true,
        data: apiKeys,
        message: 'ApiKeys created successfully',
      });
    } catch (error) {
      request.log.error(error, 'Error creating apiKeys');

      return reply.status(500).send({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message:
            error instanceof Error ? error.message : 'Failed to create apiKeys',
        },
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
    reply: FastifyReply,
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
            message: 'ApiKeys not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: apiKeys,
      });
    } catch (error) {
      request.log.error(
        { error, apiKeysId: request.params.id },
        'Error fetching apiKeys',
      );

      return reply.status(500).send({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch apiKeys',
        },
      });
    }
  }

  /**
   * Get paginated list of apiKeyss
   * GET /apiKeys
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListApiKeysQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching apiKeys list');

      const result = await this.apiKeysService.findMany(request.query);

      request.log.info(
        { count: result.data.length, total: result.pagination.total },
        'ApiKeys list fetched',
      );

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      request.log.error(
        { error, query: request.query },
        'Error fetching apiKeys list',
      );

      return reply.status(500).send({
        success: false,
        error: {
          code: 'LIST_FETCH_FAILED',
          message: 'Failed to fetch apiKeys list',
        },
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
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      request.log.info(
        { apiKeysId: id, body: request.body },
        'Updating apiKeys',
      );

      // Transform API schema to domain model
      const updateData = this.transformUpdateSchema(request.body);

      const apiKeys = await this.apiKeysService.update(id, updateData);

      if (!apiKeys) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'ApiKeys not found',
          },
        });
      }

      request.log.info({ apiKeysId: id }, 'ApiKeys updated successfully');

      return reply.send({
        success: true,
        data: apiKeys,
        message: 'ApiKeys updated successfully',
      });
    } catch (error) {
      request.log.error(
        { error, apiKeysId: request.params.id },
        'Error updating apiKeys',
      );

      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message:
            error instanceof Error ? error.message : 'Failed to update apiKeys',
        },
      });
    }
  }

  /**
   * Delete apiKeys
   * DELETE /apiKeys/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ApiKeysIdParamSchema> }>,
    reply: FastifyReply,
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
            message: 'ApiKeys not found',
          },
        });
      }

      request.log.info({ apiKeysId: id }, 'ApiKeys deleted successfully');

      return reply.send({
        success: true,
        message: 'ApiKeys deleted successfully',
        data: { id, deleted: true },
      });
    } catch (error) {
      request.log.error(
        { error, apiKeysId: request.params.id },
        'Error deleting apiKeys',
      );

      return reply.status(500).send({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message:
            error instanceof Error ? error.message : 'Failed to delete apiKeys',
        },
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

  // ===== NEW API KEY MANAGEMENT ENDPOINTS =====

  /**
   * Generate a new API key
   * POST /apiKeys/generate
   */
  async generateKey(
    request: FastifyRequest<{ Body: Static<typeof GenerateApiKeySchema> }> & {
      user?: any;
    },
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
        });
      }

      request.log.info({ userId, body: request.body }, 'Generating API key');

      const { name, scopes, expiryDays, isActive } = request.body;

      const result = await this.apiKeysService.generateKey(userId, name, {
        scopes: scopes || undefined,
        expiryDays,
        isActive,
      });

      request.log.info(
        {
          userId,
          keyId: result.apiKey.id,
          prefix: result.apiKey.key_prefix,
        },
        'API key generated successfully',
      );

      return reply.status(201).send({
        success: true,
        data: {
          id: result.apiKey.id,
          name: result.apiKey.name,
          key: result.fullKey, // ⚠️ Only shown once!
          prefix: result.apiKey.key_prefix,
          preview: result.preview,
          scopes: result.apiKey.scopes,
          expires_at: result.apiKey.expires_at,
          is_active: result.apiKey.is_active,
          created_at: result.apiKey.created_at,
        },
        message:
          'API key generated successfully. Store it securely - it will not be shown again!',
      });
    } catch (error) {
      request.log.error(error, 'Error generating API key');

      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to generate API key',
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Validate API key
   * POST /apiKeys/validate
   */
  async validateKey(
    request: FastifyRequest<{ Body: Static<typeof ValidateApiKeySchema> }>,
    reply: FastifyReply,
  ) {
    try {
      const { key, resource, action } = request.body;

      request.log.info({ resource, action }, 'Validating API key');

      const validation = await this.apiKeysService.validateKey(key);

      let hasAccess: boolean | undefined;
      if (validation.isValid && validation.keyData && resource && action) {
        hasAccess = await this.apiKeysService.checkScope(
          validation.keyData,
          resource,
          action,
        );
      }

      return reply.send({
        success: true,
        data: {
          valid: validation.isValid,
          keyData: validation.keyData
            ? {
                id: validation.keyData.id,
                name: validation.keyData.name,
                prefix: validation.keyData.key_prefix,
                user_id: validation.keyData.user_id,
                scopes: validation.keyData.scopes,
                expires_at: validation.keyData.expires_at,
                is_active: validation.keyData.is_active,
              }
            : undefined,
          hasAccess,
          error: validation.error,
        },
      });
    } catch (error) {
      request.log.error(error, 'Error validating API key');

      return reply.status(500).send({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'API key validation failed',
        },
      });
    }
  }

  /**
   * Get current user's API keys
   * GET /apiKeys/my-keys
   */
  async getMyKeys(
    request: FastifyRequest<{
      Querystring: Static<typeof UserApiKeysQuerySchema>;
    }> & { user?: any },
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
        });
      }

      request.log.info(
        { userId, query: request.query },
        'Fetching user API keys',
      );

      const result = await this.apiKeysService.getUserKeys(
        userId,
        request.query,
      );

      request.log.info(
        {
          userId,
          count: result.data.length,
          total: result.pagination.total,
        },
        'User API keys fetched',
      );

      // Transform data to match ApiKeyPreviewSchema
      const transformedData = result.data.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.key_prefix, // Transform key_prefix → prefix
        preview: key.preview,
        scopes: key.scopes,
        last_used_at: key.last_used_at,
        last_used_ip: key.last_used_ip,
        expires_at: key.expires_at,
        is_active: key.is_active,
        created_at: key.created_at,
        updated_at: key.updated_at,
      }));

      // Use standard paginated response (same as users module)
      return reply.paginated(
        transformedData,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
      );
    } catch (error) {
      request.log.error(error, 'Error fetching user API keys');

      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch API keys',
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Revoke (deactivate) API key
   * POST /apiKeys/:id/revoke
   */
  async revokeKey(
    request: FastifyRequest<{
      Params: Static<typeof ApiKeysIdParamSchema>;
      Body: Static<typeof RevokeApiKeySchema>;
    }> & { user?: any },
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      const { id } = request.params;
      const { reason } = request.body;

      request.log.info({ userId, keyId: id, reason }, 'Revoking API key');

      const revoked = await this.apiKeysService.revokeKey(id, userId);

      if (!revoked) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found or access denied',
          },
        });
      }

      request.log.info({ userId, keyId: id }, 'API key revoked successfully');

      return reply.send({
        success: true,
        data: {
          success: true,
          keyId: id,
          revokedAt: new Date().toISOString(),
        },
        message: 'API key revoked successfully',
      });
    } catch (error) {
      request.log.error(error, 'Error revoking API key');

      return reply.status(500).send({
        success: false,
        error: {
          code: 'REVOCATION_FAILED',
          message:
            error instanceof Error ? error.message : 'Failed to revoke API key',
        },
      });
    }
  }

  /**
   * Rotate API key (generate new key with same settings)
   * POST /apiKeys/:id/rotate
   */
  async rotateKey(
    request: FastifyRequest<{
      Params: Static<typeof ApiKeysIdParamSchema>;
      Body: Static<typeof RotateApiKeySchema>;
    }> & { user?: any },
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      const { id } = request.params;
      const { newName } = request.body;

      request.log.info({ userId, keyId: id, newName }, 'Rotating API key');

      const result = await this.apiKeysService.rotateKey(id, userId);

      // Update name if provided
      if (newName) {
        await this.apiKeysService.update(result.newApiKey.id, {
          name: newName,
        });
        result.newApiKey.name = newName;
      }

      request.log.info(
        {
          userId,
          oldKeyId: id,
          newKeyId: result.newApiKey.id,
        },
        'API key rotated successfully',
      );

      return reply.status(201).send({
        success: true,
        data: {
          id: result.newApiKey.id,
          name: result.newApiKey.name,
          key: result.fullKey, // ⚠️ Only shown once!
          prefix: result.newApiKey.key_prefix,
          preview: result.preview,
          scopes: result.newApiKey.scopes,
          expires_at: result.newApiKey.expires_at,
          is_active: result.newApiKey.is_active,
          created_at: result.newApiKey.created_at,
        },
        message:
          'API key rotated successfully. Store the new key securely - it will not be shown again!',
        warning:
          'The old API key has been deactivated. The new key will only be displayed once.',
      });
    } catch (error) {
      request.log.error(error, 'Error rotating API key');

      return reply.status(500).send({
        success: false,
        error: {
          code: 'ROTATION_FAILED',
          message:
            error instanceof Error ? error.message : 'Failed to rotate API key',
        },
      });
    }
  }
}
