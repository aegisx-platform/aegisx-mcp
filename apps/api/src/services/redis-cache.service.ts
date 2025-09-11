import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import crypto from 'crypto';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  compress?: boolean;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
}

export class RedisCacheService {
  private redis?: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    hitRate: 0,
  };
  private defaultTTL = 3600; // 1 hour
  private defaultPrefix = 'cache:';
  private logger: any;

  constructor(
    private fastify: FastifyInstance,
    private serviceName: string,
  ) {
    this.redis = fastify.redis;
    this.logger = fastify.log;
  }

  /**
   * Get value from cache with automatic deserialization
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.redis) return null;

    const cacheKey = this.buildKey(key, options?.prefix);

    try {
      const value = await this.redis.get(cacheKey);

      if (!value) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      // Handle compressed values
      if (options?.compress && value.startsWith('COMPRESSED:')) {
        return this.decompress(value.substring(11));
      }

      return JSON.parse(value);
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache get error',
        key: cacheKey,
        error,
      });
      return null;
    }
  }

  /**
   * Set value in cache with automatic serialization
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<boolean> {
    if (!this.redis) return false;

    const cacheKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl || this.defaultTTL;

    try {
      let serialized = JSON.stringify(value);

      // Compress large values
      if (options?.compress && serialized.length > 1024) {
        serialized = 'COMPRESSED:' + this.compress(serialized);
      }

      await this.redis.setex(cacheKey, ttl, serialized);

      // Handle tags for bulk invalidation
      if (options?.tags && options.tags.length > 0) {
        await this.addToTags(cacheKey, options.tags, ttl);
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache set error',
        key: cacheKey,
        error,
      });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string, prefix?: string): Promise<boolean> {
    if (!this.redis) return false;

    const cacheKey = this.buildKey(key, prefix);

    try {
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache delete error',
        key: cacheKey,
        error,
      });
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string, prefix?: string): Promise<number> {
    if (!this.redis) return 0;

    const searchPattern = this.buildKey(pattern, prefix);

    try {
      const keys = await this.redis.keys(searchPattern);

      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache pattern delete error',
        pattern: searchPattern,
        error,
      });
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    if (!this.redis || tags.length === 0) return 0;

    try {
      const pipeline = this.redis.pipeline();
      const allKeys = new Set<string>();

      // Get all keys for each tag
      for (const tag of tags) {
        const tagKey = `${this.defaultPrefix}tags:${tag}`;
        const keys = await this.redis.smembers(tagKey);
        keys.forEach((key) => allKeys.add(key));
        pipeline.del(tagKey);
      }

      // Delete all found keys
      if (allKeys.size > 0) {
        allKeys.forEach((key) => pipeline.del(key));
      }

      await pipeline.exec();
      return allKeys.size;
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache tag invalidation error',
        tags,
        error,
      });
      return 0;
    }
  }

  /**
   * Get or set cache (read-through caching)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - get from factory
    try {
      const value = await factory();

      // Set in cache for next time
      await this.set(key, value, options);

      return value;
    } catch (error) {
      this.logger.error({
        msg: 'Cache factory error',
        key,
        error,
      });
      throw error;
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget<T>(
    keys: string[],
    prefix?: string,
  ): Promise<Map<string, T | null>> {
    if (!this.redis || keys.length === 0) {
      return new Map();
    }

    const cacheKeys = keys.map((key) => this.buildKey(key, prefix));

    try {
      const values = await this.redis.mget(...cacheKeys);
      const result = new Map<string, T | null>();

      keys.forEach((key, index) => {
        const value = values[index];
        if (value) {
          this.stats.hits++;
          try {
            result.set(key, JSON.parse(value));
          } catch {
            result.set(key, null);
          }
        } else {
          this.stats.misses++;
          result.set(key, null);
        }
      });

      this.updateHitRate();
      return result;
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache mget error',
        keys: cacheKeys,
        error,
      });
      return new Map();
    }
  }

  /**
   * Batch set multiple keys
   */
  async mset<T>(
    items: Map<string, T>,
    options?: CacheOptions,
  ): Promise<boolean> {
    if (!this.redis || items.size === 0) return false;

    const ttl = options?.ttl || this.defaultTTL;
    const pipeline = this.redis.pipeline();

    try {
      for (const [key, value] of items) {
        const cacheKey = this.buildKey(key, options?.prefix);
        const serialized = JSON.stringify(value);
        pipeline.setex(cacheKey, ttl, serialized);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error({
        msg: 'Cache mset error',
        error,
      });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      hitRate: 0,
    };
  }

  /**
   * Flush all cache keys for this service
   */
  async flush(): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const pattern = `${this.defaultPrefix}${this.serviceName}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      return true;
    } catch (error) {
      this.logger.error({
        msg: 'Cache flush error',
        error,
      });
      return false;
    }
  }

  /**
   * Build cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || `${this.defaultPrefix}${this.serviceName}:`;
    return `${finalPrefix}${key}`;
  }

  /**
   * Add key to tags for bulk invalidation
   */
  private async addToTags(
    key: string,
    tags: string[],
    ttl: number,
  ): Promise<void> {
    if (!this.redis) return;

    const pipeline = this.redis.pipeline();

    for (const tag of tags) {
      const tagKey = `${this.defaultPrefix}tags:${tag}`;
      pipeline.sadd(tagKey, key);
      pipeline.expire(tagKey, ttl + 60); // Expire slightly after the key
    }

    await pipeline.exec();
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    if (total > 0) {
      this.stats.hitRate = (this.stats.hits / total) * 100;
    }
  }

  /**
   * Simple compression using base64 encoding
   * In production, consider using zlib or lz4
   */
  private compress(data: string): string {
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decompress base64 encoded data
   */
  private decompress(data: string): any {
    const decompressed = Buffer.from(data, 'base64').toString('utf-8');
    return JSON.parse(decompressed);
  }

  /**
   * Generate cache key from object (for complex keys)
   */
  static generateKey(obj: any): string {
    const str = JSON.stringify(obj);
    return crypto.createHash('md5').update(str).digest('hex');
  }
}
