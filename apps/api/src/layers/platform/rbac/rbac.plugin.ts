import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';
import { rbacRoutes } from './rbac.routes';

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
  // Get database instance from global decorators
  const db = (fastify as any).db || (fastify as any).knex;
  if (!db) {
    throw new Error(
      'Database connection not found. Make sure database plugin is registered first.',
    );
  }

  // Create repository, service, and controller instances
  const rbacRepository = new RbacRepository(db);
  const rbacService = new RbacService(rbacRepository);
  const rbacController = new RbacController(rbacService);

  // Register routes
  await fastify.register(rbacRoutes, {
    controller: rbacController,
  });

  // Decorate fastify instance with RBAC services for use in other plugins
  fastify.decorate('rbacService', rbacService);
  fastify.decorate('rbacRepository', rbacRepository);

  // Lifecycle hooks for monitoring
  fastify.addHook('onReady', async () => {
    fastify.log.info('Platform RBAC module registered successfully');
  });
}
