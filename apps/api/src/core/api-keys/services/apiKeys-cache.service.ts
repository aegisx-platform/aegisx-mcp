import { FastifyInstance } from 'fastify';
import {
  RedisCacheService,
  type CacheOptions,
  type CacheStats,
} from '../../../services/redis-cache.service';
import { ApiKeys } from '../types/apiKeys.types';
import { type ApiKeyScope } from '../utils/apiKeys.crypto';
import { Redis } from 'ioredis';

/**
 * Cached API Key Data Structure
 * NOTE: Excludes sensitive key_hash for security
 */
export interface CachedApiKeyData {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes: ApiKeyScope[];
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Cache configuration constants
 */
export const API_KEY_CACHE_CONFIG = {
  // TTL values in seconds
  VALIDATION_TTL: 300, // 5 minutes - balance between performance and security
  SCOPE_TTL: 600, // 10 minutes - permissions change less frequently
  USER_LIST_TTL: 1800, // 30 minutes - user key lists change less often
  USAGE_BATCH_TTL: 60, // 1 minute - for batching usage updates

  // Cache key prefixes
  PREFIXES: {
    VALIDATION: 'apikey:validation:',
    SCOPE: 'apikey:scope:',
    USER_LIST: 'apikey:user:',
    USAGE: 'apikey:usage:',
    STATS: 'apikey:stats:',
  },

  // Cache tags for bulk invalidation
  TAGS: {
    USER: 'apikey-user-',
    KEY: 'apikey-',
    VALIDATION: 'apikey-validation',
    SCOPES: 'apikey-scopes',
  },
} as const;

/**
 * API Key Cache Service
 *
 * Provides high-performance caching for API key operations:
 * - Validation result caching (excludes sensitive hash)
 * - Scope permission caching
 * - User API key listing cache
 * - Usage statistics optimization
 *
 * Security considerations:
 * - Never caches actual API key or hash
 * - Short TTL for security-critical data
 * - Immediate invalidation on security events
 * - Tag-based bulk invalidation
 */
export class ApiKeyCacheService {
  private cache: RedisCacheService;
  private redis?: Redis;
  private logger: any;

  constructor(fastify: FastifyInstance) {
    this.cache = new RedisCacheService(fastify, 'apikeys');
    this.redis = fastify.redis;
    this.logger = fastify.log;
  }

  // ===== VALIDATION CACHING =====

  /**
   * Get cached API key validation data by key prefix
   * Returns null if not cached or cache miss
   */
  async getCachedValidation(
    keyPrefix: string,
  ): Promise<CachedApiKeyData | null> {
    return this.cache.get<CachedApiKeyData>(keyPrefix, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION,
      ttl: API_KEY_CACHE_CONFIG.VALIDATION_TTL,
    });
  }

  /**
   * Cache API key validation data (excludes sensitive hash)
   * Uses key prefix as cache key for security
   */
  async setCachedValidation(
    keyPrefix: string,
    apiKeyData: ApiKeys,
  ): Promise<boolean> {
    // Convert to cached format (exclude sensitive data)
    const cachedData: CachedApiKeyData = {
      id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      name: apiKeyData.name,
      key_prefix: apiKeyData.key_prefix,
      scopes: apiKeyData.scopes as ApiKeyScope[],
      is_active: apiKeyData.is_active,
      expires_at: apiKeyData.expires_at,
      created_at: apiKeyData.created_at,
      updated_at: apiKeyData.updated_at,
    };

    return this.cache.set(keyPrefix, cachedData, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION,
      ttl: API_KEY_CACHE_CONFIG.VALIDATION_TTL,
      tags: [
        `${API_KEY_CACHE_CONFIG.TAGS.KEY}${apiKeyData.id}`,
        `${API_KEY_CACHE_CONFIG.TAGS.USER}${apiKeyData.user_id}`,
        API_KEY_CACHE_CONFIG.TAGS.VALIDATION,
      ],
    });
  }

  /**
   * Invalidate cached validation data for specific key
   */
  async invalidateValidation(keyPrefix: string): Promise<boolean> {
    return this.cache.del(keyPrefix, API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION);
  }

  // ===== SCOPE PERMISSION CACHING =====

  /**
   * Get cached scope validation result
   */
  async getCachedScopeValidation(
    keyId: string,
    resource: string,
    action: string,
  ): Promise<boolean | null> {
    const cacheKey = `${keyId}:${resource}:${action}`;
    return this.cache.get<boolean>(cacheKey, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.SCOPE,
      ttl: API_KEY_CACHE_CONFIG.SCOPE_TTL,
    });
  }

  /**
   * Cache scope validation result
   */
  async setCachedScopeValidation(
    keyId: string,
    resource: string,
    action: string,
    isValid: boolean,
    userId: string,
  ): Promise<boolean> {
    const cacheKey = `${keyId}:${resource}:${action}`;
    return this.cache.set(cacheKey, isValid, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.SCOPE,
      ttl: API_KEY_CACHE_CONFIG.SCOPE_TTL,
      tags: [
        `${API_KEY_CACHE_CONFIG.TAGS.KEY}${keyId}`,
        `${API_KEY_CACHE_CONFIG.TAGS.USER}${userId}`,
        API_KEY_CACHE_CONFIG.TAGS.SCOPES,
      ],
    });
  }

  /**
   * Invalidate all scope caches for a specific key
   */
  async invalidateKeyScopes(keyId: string): Promise<number> {
    const pattern = `${keyId}:*`;
    return this.cache.delPattern(pattern, API_KEY_CACHE_CONFIG.PREFIXES.SCOPE);
  }

  // ===== USER API KEY LISTING CACHE =====

  /**
   * Get cached user API key list
   */
  async getCachedUserKeys(userId: string): Promise<CachedApiKeyData[] | null> {
    const cacheKey = `${userId}:list`;
    return this.cache.get<CachedApiKeyData[]>(cacheKey, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.USER_LIST,
      ttl: API_KEY_CACHE_CONFIG.USER_LIST_TTL,
    });
  }

  /**
   * Cache user API key list
   */
  async setCachedUserKeys(
    userId: string,
    apiKeys: ApiKeys[],
  ): Promise<boolean> {
    // Convert to cached format
    const cachedKeys: CachedApiKeyData[] = apiKeys.map((key) => ({
      id: key.id,
      user_id: key.user_id,
      name: key.name,
      key_prefix: key.key_prefix,
      scopes: key.scopes as ApiKeyScope[],
      is_active: key.is_active,
      expires_at: key.expires_at,
      created_at: key.created_at,
      updated_at: key.updated_at,
    }));

    const cacheKey = `${userId}:list`;
    return this.cache.set(cacheKey, cachedKeys, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.USER_LIST,
      ttl: API_KEY_CACHE_CONFIG.USER_LIST_TTL,
      tags: [`${API_KEY_CACHE_CONFIG.TAGS.USER}${userId}`],
    });
  }

  /**
   * Invalidate user API key list cache
   */
  async invalidateUserKeys(userId: string): Promise<boolean> {
    const cacheKey = `${userId}:list`;
    return this.cache.del(cacheKey, API_KEY_CACHE_CONFIG.PREFIXES.USER_LIST);
  }

  // ===== USAGE STATISTICS CACHING =====

  /**
   * Increment usage counter (for batching)
   */
  async incrementUsage(keyId: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const cacheKey = `cache:apikeys:${API_KEY_CACHE_CONFIG.PREFIXES.USAGE}${keyId}:count`;

      const count = await this.redis.incr(cacheKey);

      // Set expiration if this is the first increment
      if (count === 1) {
        await this.redis.expire(cacheKey, API_KEY_CACHE_CONFIG.USAGE_BATCH_TTL);
      }

      return count;
    } catch (error) {
      this.logger.error({
        msg: 'Usage increment error',
        keyId,
        error,
      });
      return 0;
    }
  }

  /**
   * Get and reset usage count (for batch processing)
   */
  async getAndResetUsage(keyId: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const cacheKey = `cache:apikeys:${API_KEY_CACHE_CONFIG.PREFIXES.USAGE}${keyId}:count`;

      const pipeline = this.redis.pipeline();
      pipeline.get(cacheKey);
      pipeline.del(cacheKey);

      const results = await pipeline.exec();
      const count = results?.[0]?.[1] as string;

      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this.logger.error({
        msg: 'Usage get and reset error',
        keyId,
        error,
      });
      return 0;
    }
  }

  // ===== BULK INVALIDATION METHODS =====

  /**
   * Invalidate all cache data for a specific API key
   * Called when key is updated, revoked, or rotated
   */
  async invalidateKeyData(keyId: string, userId: string): Promise<void> {
    try {
      // Invalidate by tags
      await this.cache.invalidateByTags([
        `${API_KEY_CACHE_CONFIG.TAGS.KEY}${keyId}`,
      ]);

      // Also invalidate user cache since key list changed
      await this.invalidateUserKeys(userId);

      this.logger.info({
        msg: 'API key cache invalidated',
        keyId,
        userId,
      });
    } catch (error) {
      this.logger.error({
        msg: 'API key cache invalidation error',
        keyId,
        userId,
        error,
      });
    }
  }

  /**
   * Invalidate all cache data for a specific user
   * Called when user is deleted or roles change
   */
  async invalidateUserData(userId: string): Promise<void> {
    try {
      await this.cache.invalidateByTags([
        `${API_KEY_CACHE_CONFIG.TAGS.USER}${userId}`,
      ]);

      this.logger.info({
        msg: 'User API key cache invalidated',
        userId,
      });
    } catch (error) {
      this.logger.error({
        msg: 'User API key cache invalidation error',
        userId,
        error,
      });
    }
  }

  /**
   * Invalidate all validation caches
   * Called for security events or system maintenance
   */
  async invalidateAllValidation(): Promise<number> {
    return this.cache.invalidateByTags([API_KEY_CACHE_CONFIG.TAGS.VALIDATION]);
  }

  /**
   * Invalidate all scope caches
   * Called when permission system changes
   */
  async invalidateAllScopes(): Promise<number> {
    return this.cache.invalidateByTags([API_KEY_CACHE_CONFIG.TAGS.SCOPES]);
  }

  // ===== CACHE WARMING =====

  /**
   * Warm cache for frequently used API keys
   * Called on service startup or scheduled refresh
   */
  async warmCache(
    frequentKeys: { prefix: string; data: ApiKeys }[],
  ): Promise<void> {
    if (frequentKeys.length === 0) return;

    try {
      const cacheItems = new Map<string, CachedApiKeyData>();

      for (const { prefix, data } of frequentKeys) {
        const cachedData: CachedApiKeyData = {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          key_prefix: data.key_prefix,
          scopes: data.scopes as ApiKeyScope[],
          is_active: data.is_active,
          expires_at: data.expires_at,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        cacheItems.set(prefix, cachedData);
      }

      await this.cache.mset(cacheItems, {
        prefix: API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION,
        ttl: API_KEY_CACHE_CONFIG.VALIDATION_TTL,
      });

      this.logger.info({
        msg: 'API key cache warmed',
        count: frequentKeys.length,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Cache warming error',
        error,
      });
    }
  }

  // ===== MONITORING & HEALTH =====

  /**
   * Get API key cache health and statistics
   */
  async getCacheHealth(): Promise<{
    stats: any;
    validationCacheSize: number;
    scopeCacheSize: number;
    userListCacheSize: number;
    usageCacheSize: number;
  }> {
    if (!this.redis) {
      return {
        stats: this.cache.getStats(),
        validationCacheSize: 0,
        scopeCacheSize: 0,
        userListCacheSize: 0,
        usageCacheSize: 0,
      };
    }

    try {
      const [validationKeys, scopeKeys, userKeys, usageKeys] =
        await Promise.all([
          this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION}*`),
          this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.SCOPE}*`),
          this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.USER_LIST}*`),
          this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.USAGE}*`),
        ]);

      return {
        stats: this.cache.getStats(),
        validationCacheSize: validationKeys.length,
        scopeCacheSize: scopeKeys.length,
        userListCacheSize: userKeys.length,
        usageCacheSize: usageKeys.length,
      };
    } catch (error) {
      this.logger.error({
        msg: 'Cache health check error',
        error,
      });

      return {
        stats: this.cache.getStats(),
        validationCacheSize: -1,
        scopeCacheSize: -1,
        userListCacheSize: -1,
        usageCacheSize: -1,
      };
    }
  }
}
