import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { PermissionCacheService } from './services/permission-cache.service';

/**
 * Permission Cache Plugin
 *
 * Registers PermissionCacheService as a Fastify decorator
 * for caching user permissions to reduce database load.
 *
 * This plugin MUST load before auth-strategies plugin so that
 * verifyPermission middleware can use the cache.
 *
 * Dependencies:
 * - redis-plugin (for Redis connection)
 *
 * Usage:
 * ```typescript
 * // In middleware or routes
 * const permissions = await fastify.permissionCache.get(userId);
 * await fastify.permissionCache.set(userId, permissions);
 * await fastify.permissionCache.invalidate(userId);
 * ```
 */
async function permissionCachePlugin(fastify: FastifyInstance) {
  // Create permission cache service instance
  const permissionCache = new PermissionCacheService(fastify);

  // Register as decorator
  fastify.decorate('permissionCache', permissionCache);

  fastify.log.info('Permission cache plugin registered');
}

export default fp(permissionCachePlugin, {
  name: 'permission-cache-plugin',
  dependencies: ['redis-plugin'], // Requires Redis to be loaded first
});
