import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserDepartmentsController } from './user-departments.controller';
import { userDepartmentsRoutes } from './user-departments.route';
import { UserDepartmentsService } from '../../../core/users/user-departments.service';
import { UserDepartmentsRepository } from '../../../core/users/user-departments.repository';
import { UsersRepository } from '../../../core/users/users.repository';
import { DepartmentsRepository } from '../../inventory/master-data/departments/departments.repository';

/**
 * User-Departments Plugin
 *
 * Registers REST API routes for managing user-department relationships.
 * Supports multi-department users, granular permissions, and temporal assignments.
 *
 * Dependencies:
 * - knex-plugin (database)
 * - jwt-auth-plugin (authentication)
 * - users-plugin (UsersService)
 * - inventory-plugin (DepartmentsRepository)
 */
export default fp(
  async function userDepartmentsPlugin(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions,
  ) {
    // Initialize repositories
    const knex = (fastify as any).knex;
    const userDepartmentsRepository = new UserDepartmentsRepository(knex);
    const usersRepository = new UsersRepository(knex);
    const departmentsRepository = new DepartmentsRepository(knex);

    // Initialize service
    const userDepartmentsService = new UserDepartmentsService(
      userDepartmentsRepository,
      usersRepository,
      departmentsRepository,
    );

    // Initialize controller
    const userDepartmentsController = new UserDepartmentsController(
      userDepartmentsService,
    );

    // Register routes
    await fastify.register(userDepartmentsRoutes, {
      controller: userDepartmentsController,
    });

    // Decorate fastify instance for other plugins
    fastify.decorate('userDepartmentsService', userDepartmentsService);
  },
  {
    name: 'user-departments-plugin',
    dependencies: [
      'knex-plugin',
      'jwt-auth-plugin',
      'users-plugin',
      'inventory-plugin',
    ],
  },
);

// TypeScript module augmentation for decorator
declare module 'fastify' {
  interface FastifyInstance {
    userDepartmentsService: UserDepartmentsService;
  }
}
