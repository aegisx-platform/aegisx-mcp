import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';
import { rbacRoutes } from './rbac.routes';
import * as rbacSchemas from './rbac.schemas';
import { PermissionCacheInvalidationService } from '../../core/auth/services/permission-cache-invalidation.service';

/**
 * Platform RBAC Plugin
 *
 * Central plugin for Role-Based Access Control (RBAC) management.
 * Provides comprehensive CRUD operations for roles, permissions, and user-role assignments.
 *
 * Features:
 * - Role management with hierarchical structure
 * - Permission management with resource-action mapping
 * - User-role assignments with expiration support
 * - Bulk operations for roles and permissions
 * - Role assignment history tracking
 * - RBAC statistics and analytics
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping (plain async function, no fp wrapper)
 * - Lifecycle management with hooks
 *
 * Note: This is a leaf module plugin (routes + controllers only), so it uses
 * a plain async function without fp() wrapper, following the plugin pattern specification.
 */
export default async function platformRbacPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas('rbac', rbacSchemas);
  }

  // Get database instance from global decorators
  const db = (fastify as any).db || (fastify as any).knex;
  if (!db) {
    throw new Error(
      'Database connection not found. Make sure database plugin is registered first.',
    );
  }

  // Get permission cache from global decorators
  const permissionCache = (fastify as any).permissionCache;
  if (!permissionCache) {
    throw new Error(
      'Permission cache not found. Make sure permission-cache plugin is registered first.',
    );
  }

  // Create cache invalidation service
  const cacheInvalidation = new PermissionCacheInvalidationService(
    permissionCache,
    db,
    fastify,
  );

  // Create repository, service, and controller instances
  const rbacRepository = new RbacRepository(db);
  const rbacService = new RbacService(rbacRepository, cacheInvalidation);
  const rbacController = new RbacController(rbacService);

  // Register routes under the specified prefix or /v1/platform
  await fastify.register(rbacRoutes, {
    controller: rbacController,
    prefix: options.prefix || '/v1/platform',
  });

  // Decorate fastify instance with RBAC services for use in other plugins
  fastify.decorate('rbacService', rbacService);
  fastify.decorate('rbacRepository', rbacRepository);

  // Lifecycle hooks for monitoring
  fastify.addHook('onReady', async () => {
    fastify.log.info('Platform RBAC module registered successfully');
  });
}
