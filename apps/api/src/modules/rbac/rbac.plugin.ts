import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Knex } from 'knex';
import { rbacRoutes } from './rbac.routes';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';

export type RbacPluginOptions = FastifyPluginOptions;

async function rbacPlugin(
  fastify: FastifyInstance,
  options: RbacPluginOptions,
) {
  // Get database instance from global decorators
  const db = fastify.db as Knex;
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

  fastify.log.info('RBAC plugin registered successfully');
}

export default fp(rbacPlugin, {
  name: 'rbac',
  dependencies: ['knex-plugin', 'auth-plugin'], // Ensure database and auth plugins are loaded first
});
