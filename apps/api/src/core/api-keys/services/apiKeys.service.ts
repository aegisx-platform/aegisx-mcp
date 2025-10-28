import { BaseService } from '../../../shared/services/base.service';
import { ApiKeysRepository } from '../repositories/apiKeys.repository';
import { EventService } from '../../../shared/websocket/event.service';
import { CrudEventHelper } from '../../../shared/websocket/crud-event-helper';
import { ApiKeyCacheService } from './apiKeys-cache.service';
import { FastifyInstance } from 'fastify';
import {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type GetApiKeysQuery,
  type ListApiKeysQuery,
} from '../types/apiKeys.types';
import {
  generateApiKey,
  generateScopedApiKey,
  validateApiKey,
  validateApiKeyFormat,
  validateScope,
  generatePreview,
  isKeyExpired,
  calculateExpiration,
  createAuditHash,
  type ApiKeyComponents,
  type ApiKeyScope,
  type ApiKeyValidationResult,
  API_KEY_CONSTANTS,
} from '../utils/apiKeys.crypto';

/**
 * ApiKeys Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ApiKeysService extends BaseService<
  ApiKeys,
  CreateApiKeys,
  UpdateApiKeys
> {
  private eventHelper?: CrudEventHelper;
  private cacheService?: ApiKeyCacheService;

  constructor(
    private apiKeysRepository: ApiKeysRepository,
    private eventService?: EventService,
    private fastify?: FastifyInstance,
  ) {
    super(apiKeysRepository);

    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('apiKeys', 'apiKeys');
    }

    // Initialize cache service if Fastify instance is available
    if (fastify) {
      this.cacheService = new ApiKeyCacheService(fastify);
    }
  }

  /**
   * Get apiKeys by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetApiKeysQuery = {},
  ): Promise<ApiKeys | null> {
    const apiKeys = await this.getById(id);

    if (apiKeys) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }

      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', apiKeys);
      }
    }

    return apiKeys;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListApiKeysQuery = {}): Promise<{
    data: ApiKeys[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);

    // Emit bulk read event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('bulk_read', {
        count: result.data.length,
        filters: options,
      });
    }

    return result;
  }

  /**
   * Create new apiKeys
   */
  async create(data: CreateApiKeys): Promise<ApiKeys> {
    const apiKeys = await super.create(data);

    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(apiKeys);
    }

    return apiKeys;
  }

  /**
   * Update existing apiKeys
   */
  async update(
    id: string | number,
    data: UpdateApiKeys,
  ): Promise<ApiKeys | null> {
    const apiKeys = await super.update(id, data);

    if (apiKeys && this.eventHelper) {
      await this.eventHelper.emitUpdated(apiKeys);
    }

    return apiKeys;
  }

  /**
   * Delete apiKeys
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const apiKeys = await this.getById(id);

    const deleted = await super.delete(id);

    if (deleted && apiKeys && this.eventHelper) {
      await this.eventHelper.emitDeleted(apiKeys.id);
    }

    return deleted;
  }

  // ===== API KEY BUSINESS LOGIC METHODS =====

  /**
   * Generate a new API key for a user
   */
  async generateKey(
    userId: string,
    name: string,
    options: {
      scopes?: ApiKeyScope[];
      expiryDays?: number;
      isActive?: boolean;
    } = {},
  ): Promise<{ apiKey: ApiKeys; fullKey: string; preview: string }> {
    // Check user's key limit
    const userKeysCount = await this.countUserKeys(userId);
    if (userKeysCount >= API_KEY_CONSTANTS.MAX_KEYS_PER_USER) {
      throw new Error(
        `Maximum API keys limit (${API_KEY_CONSTANTS.MAX_KEYS_PER_USER}) reached for user`,
      );
    }

    // Generate key components
    let keyComponents: ApiKeyComponents;
    if (options.scopes && options.scopes.length > 0) {
      const scopedKey = generateScopedApiKey(options.scopes);
      keyComponents = {
        fullKey: scopedKey.fullKey,
        prefix: scopedKey.prefix,
        hash: scopedKey.hash,
        preview: scopedKey.preview,
      };
    } else {
      keyComponents = generateApiKey();
    }

    // Calculate expiration
    const expiresAt = options.expiryDays
      ? calculateExpiration(options.expiryDays)
      : calculateExpiration();

    // Create API key record
    const createData: CreateApiKeys = {
      user_id: userId,
      name,
      key_hash: keyComponents.hash,
      key_prefix: keyComponents.prefix,
      scopes: options.scopes || null,
      expires_at: expiresAt.toISOString(),
      is_active: options.isActive !== false,
    };

    const apiKey = await this.create(createData);

    // Emit key generated event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('key_generated', {
        id: apiKey.id,
        userId,
        name,
        prefix: keyComponents.prefix,
        preview: keyComponents.preview,
      });
    }

    return {
      apiKey,
      fullKey: keyComponents.fullKey,
      preview: keyComponents.preview,
    };
  }

  /**
   * Validate API key and return associated data
   * Uses cache-first strategy for improved performance
   */
  async validateKey(apiKey: string): Promise<{
    isValid: boolean;
    keyData?: ApiKeys;
    error?: string;
  }> {
    // Validate format first
    const formatValidation = validateApiKeyFormat(apiKey);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        error: formatValidation.error,
      };
    }

    const keyPrefix = formatValidation.prefix!;

    // Try cache first
    if (this.cacheService) {
      const cachedData = await this.cacheService.getCachedValidation(keyPrefix);
      if (cachedData) {
        // Check if cached key is still active and not expired
        if (!cachedData.is_active) {
          return {
            isValid: false,
            error: 'API key is disabled',
          };
        }

        if (
          isKeyExpired(
            cachedData.expires_at ? new Date(cachedData.expires_at) : null,
          )
        ) {
          // Remove expired key from cache
          await this.cacheService.invalidateValidation(keyPrefix);
          return {
            isValid: false,
            error: 'API key has expired',
          };
        }

        // Still need to validate the hash against the actual key
        // But we need the hash from database for this
        const keyData = await this.findByPrefix(keyPrefix);
        if (!keyData) {
          // Key was deleted, remove from cache
          await this.cacheService.invalidateValidation(keyPrefix);
          return {
            isValid: false,
            error: 'API key not found',
          };
        }

        // Validate hash
        const isValidHash = validateApiKey(apiKey, keyData.key_hash);
        if (!isValidHash) {
          return {
            isValid: false,
            error: 'Invalid API key',
          };
        }

        // Return success with full key data (cache doesn't include hash)
        return {
          isValid: true,
          keyData,
        };
      }
    }

    // Cache miss - fall back to database
    const keyData = await this.findByPrefix(keyPrefix);
    if (!keyData) {
      return {
        isValid: false,
        error: 'API key not found',
      };
    }

    // Check if key is active
    if (!keyData.is_active) {
      return {
        isValid: false,
        error: 'API key is disabled',
      };
    }

    // Check if key is expired
    if (
      isKeyExpired(keyData.expires_at ? new Date(keyData.expires_at) : null)
    ) {
      return {
        isValid: false,
        error: 'API key has expired',
      };
    }

    // Validate hash
    const isValidHash = validateApiKey(apiKey, keyData.key_hash);
    if (!isValidHash) {
      return {
        isValid: false,
        error: 'Invalid API key',
      };
    }

    // Cache the successful validation result (exclude sensitive hash)
    if (this.cacheService) {
      await this.cacheService.setCachedValidation(keyPrefix, keyData);
    }

    return {
      isValid: true,
      keyData,
    };
  }

  /**
   * Update key usage tracking
   */
  async updateUsage(keyId: string | number, ipAddress?: string): Promise<void> {
    const updateData: UpdateApiKeys = {
      last_used_at: new Date().toISOString(),
    };

    if (ipAddress) {
      updateData.last_used_ip = ipAddress;
    }

    await this.update(keyId, updateData);

    // Emit usage event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('key_used', {
        keyId,
        usedAt: updateData.last_used_at,
        ipAddress,
      });
    }
  }

  /**
   * Check if API key has required scope
   * Uses cache-first strategy for improved performance
   */
  async checkScope(
    keyData: ApiKeys,
    resource: string,
    action: string,
  ): Promise<boolean> {
    if (!keyData.scopes) {
      // No scopes means full access (legacy compatibility)
      return true;
    }

    // Try cache first
    if (this.cacheService) {
      const cachedResult = await this.cacheService.getCachedScopeValidation(
        keyData.id,
        resource,
        action,
      );

      if (cachedResult !== null) {
        return cachedResult;
      }
    }

    // Cache miss - validate scope
    const isValid = validateScope(keyData.scopes, resource, action);

    // Cache the result
    if (this.cacheService) {
      await this.cacheService.setCachedScopeValidation(
        keyData.id,
        resource,
        action,
        isValid,
        keyData.user_id,
      );
    }

    return isValid;
  }

  /**
   * Find API key by prefix
   */
  async findByPrefix(prefix: string): Promise<ApiKeys | null> {
    const result = await this.findMany({
      key_prefix: prefix,
      limit: 1,
    });

    return result.data.length > 0 ? result.data[0] : null;
  }

  /**
   * Count user's API keys
   */
  async countUserKeys(userId: string): Promise<number> {
    const result = await this.findMany({
      user_id: userId,
      limit: API_KEY_CONSTANTS.MAX_KEYS_PER_USER + 1, // Just to count
    });

    return result.data.length;
  }

  /**
   * Revoke (deactivate) API key
   */
  async revokeKey(keyId: string | number, userId?: string): Promise<boolean> {
    const existing = await this.getById(keyId);
    if (!existing) {
      return false;
    }

    // Optional: Check if user owns the key
    if (userId && existing.user_id !== userId) {
      throw new Error(
        'Permission denied: You can only revoke your own API keys',
      );
    }

    const updated = await this.update(keyId, { is_active: false });
    if (updated && this.eventHelper) {
      await this.eventHelper.emitCustom('key_revoked', {
        keyId,
        userId: existing.user_id,
        revokedBy: userId || 'system',
        prefix: existing.key_prefix,
      });
    }

    return !!updated;
  }

  /**
   * Rotate API key (generate new key with same settings)
   */
  async rotateKey(
    keyId: string | number,
    userId?: string,
  ): Promise<{
    newApiKey: ApiKeys;
    fullKey: string;
    preview: string;
  }> {
    const existing = await this.getById(keyId);
    if (!existing) {
      throw new Error('API key not found');
    }

    // Optional: Check if user owns the key
    if (userId && existing.user_id !== userId) {
      throw new Error(
        'Permission denied: You can only rotate your own API keys',
      );
    }

    // Deactivate old key
    await this.update(keyId, { is_active: false });

    // Create new key with same settings
    const expiryDays = existing.expires_at
      ? Math.ceil(
          (new Date(existing.expires_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : API_KEY_CONSTANTS.DEFAULT_EXPIRY_DAYS;

    const result = await this.generateKey(
      existing.user_id,
      `${existing.name} (Rotated)`,
      {
        scopes: existing.scopes
          ? JSON.parse(JSON.stringify(existing.scopes))
          : undefined,
        expiryDays: Math.max(1, expiryDays),
        isActive: true,
      },
    );

    // Emit rotation event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('key_rotated', {
        oldKeyId: keyId,
        newKeyId: result.apiKey.id,
        userId: existing.user_id,
        rotatedBy: userId || 'system',
      });
    }

    return {
      newApiKey: result.apiKey,
      fullKey: result.fullKey,
      preview: result.preview,
    };
  }

  /**
   * Get user's API keys with preview
   */
  async getUserKeys(
    userId: string,
    options: ListApiKeysQuery = {},
  ): Promise<{
    data: (ApiKeys & { preview: string })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.findMany({
      ...options,
      user_id: userId,
    });

    // Add preview to each key
    const keysWithPreview = result.data.map((key) => ({
      ...key,
      preview: generatePreview(`${key.key_prefix}_dummy`), // Generate preview from prefix
    }));

    return {
      data: keysWithPreview,
      pagination: result.pagination,
    };
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating apiKeys
   */
  protected async validateCreate(data: CreateApiKeys): Promise<void> {
    // Validate required fields
    if (!data.user_id) {
      throw new Error('User ID is required');
    }
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('API key name is required');
    }
    if (data.name.length > 100) {
      throw new Error('API key name must be less than 100 characters');
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateApiKeys): Promise<CreateApiKeys> {
    // Add default values
    return {
      ...data,
      name: data.name.trim(),
      is_active: data.is_active !== false,
      expires_at: data.expires_at || calculateExpiration().toISOString(),
    };
  }

  /**
   * Execute logic after apiKeys creation
   */
  protected async afterCreate(
    apiKeys: ApiKeys,
    _originalData: CreateApiKeys,
  ): Promise<void> {
    // Log key creation for audit
    const auditHash = createAuditHash(
      'create',
      apiKeys.key_prefix,
      apiKeys.user_id,
    );
    console.log(
      `API Key created: ${apiKeys.id} (${apiKeys.key_prefix}) - Audit: ${auditHash}`,
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: ApiKeys,
  ): Promise<void> {
    // Log deletion attempt for audit
    const auditHash = createAuditHash(
      'delete',
      existing.key_prefix,
      existing.user_id,
    );
    console.log(
      `API Key deletion requested: ${existing.id} (${existing.key_prefix}) - Audit: ${auditHash}`,
    );
  }
}
