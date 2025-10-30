import { FastifyInstance } from 'fastify';
import { RedisCacheService } from '../../../services/redis-cache.service';

/**
 * Permission Cache Service
 *
 * Caches user permissions to reduce database queries.
 * Uses RedisCacheService for robust caching with tag-based invalidation.
 *
 * Features:
 * - 15-minute TTL (matches JWT expiry)
 * - Tag-based invalidation (by user, by role)
 * - Automatic fallback to DB on cache miss
 * - Statistics tracking
 */
export class PermissionCacheService {
  private cache: RedisCacheService;
  private readonly TTL = 900; // 15 minutes (same as JWT)

  constructor(fastify: FastifyInstance) {
    this.cache = new RedisCacheService(fastify, 'permissions');
  }

  /**
   * Get user permissions from cache
   * @param userId User ID
   * @returns Permissions array or null if not cached
   */
  async get(userId: string): Promise<string[] | null> {
    return this.cache.get<string[]>(userId, { ttl: this.TTL });
  }

  /**
   * Set user permissions in cache
   * @param userId User ID
   * @param permissions Array of permissions in format "resource:action"
   * @returns Success boolean
   */
  async set(userId: string, permissions: string[]): Promise<boolean> {
    return this.cache.set(userId, permissions, {
      ttl: this.TTL,
      tags: ['permissions', `user:${userId}`],
    });
  }

  /**
   * Invalidate specific user's permissions
   * Call this when:
   * - Admin assigns/removes role from user
   * - User's role is updated
   *
   * @param userId User ID
   * @returns Success boolean
   */
  async invalidate(userId: string): Promise<boolean> {
    return this.cache.del(userId);
  }

  /**
   * Invalidate all cached permissions
   * Call this when:
   * - Role permissions are updated (affects all users with that role)
   * - System-wide permission changes
   *
   * @returns Number of keys deleted
   */
  async invalidateAll(): Promise<number> {
    return this.cache.delPattern('*');
  }

  /**
   * Invalidate permissions by tags
   * Useful for invalidating all users with specific role
   *
   * @param tags Tags to invalidate (e.g., ['role:admin', 'role:doctor'])
   * @returns Number of keys deleted
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    return this.cache.invalidateByTags(tags);
  }

  /**
   * Get cache statistics
   * Useful for monitoring cache performance
   *
   * @returns Cache stats (hits, misses, hit rate, errors)
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    return this.cache.resetStats();
  }

  /**
   * Flush all permission cache
   * Useful for testing or maintenance
   */
  async flush(): Promise<boolean> {
    return this.cache.flush();
  }
}
