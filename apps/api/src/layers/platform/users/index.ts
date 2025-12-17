import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { DepartmentsRepository } from '../departments/departments.repository';
import { UserDepartmentsRepository } from './user-departments.repository';
import { UserDepartmentsService } from './user-departments.service';
import { UserDepartmentsController } from './user-departments.controller';
import { usersRoutes } from './users.routes';
import { userDepartmentsRoutes } from './user-departments.routes';
import { usersSchemas } from './users.schemas';
import { userDepartmentsSchemas } from './user-departments.schemas';

/**
 * Platform Users Plugin
 *
 * Central plugin for managing user accounts and authentication.
 * Provides CRUD operations for users with real-time WebSocket events.
 *
 * Features:
 * - Standard CRUD operations (Create, Read, Update, Delete)
 * - User authentication and password management
 * - Department assignment for users
 * - Real-time WebSocket events for all operations
 * - Dropdown endpoints for user selection
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping (plain async function, no fp wrapper)
 * - Lifecycle management with hooks
 *
 * Note: This is a leaf module plugin (routes + controllers only), so it uses
 * a plain async function without fp() wrapper, following the plugin pattern specification.
 */
export default async function platformUsersPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas(
      'users',
      usersSchemas,
    );
    (fastify as any).schemaRegistry.registerModuleSchemas(
      'user-departments',
      userDepartmentsSchemas,
    );
  }

  // Create repositories with Knex connection
  const usersRepository = new UsersRepository((fastify as any).knex);
  const departmentsRepository = new DepartmentsRepository(
    (fastify as any).knex,
  );
  const userDepartmentsRepository = new UserDepartmentsRepository(
    (fastify as any).knex,
  );

  // Create services with repositories
  const usersService = new UsersService(usersRepository, departmentsRepository);
  const userDepartmentsService = new UserDepartmentsService(
    userDepartmentsRepository,
    departmentsRepository,
    (fastify as any).knex,
  );

  // Verify event service is available (should be decorated by websocket plugin)
  if (!(fastify as any).eventService) {
    throw new Error(
      'EventService not available - websocket plugin must load first',
    );
  }

  // Create controllers
  const usersController = new UsersController(
    usersService,
    (fastify as any).eventService,
  );
  const userDepartmentsController = new UserDepartmentsController(
    userDepartmentsService,
  );

  // Register routes under the specified prefix or /api/v1/platform
  const basePrefix = options.prefix || '/v1/platform';

  await fastify.register(usersRoutes, {
    controller: usersController,
    prefix: `${basePrefix}/users`,
  });

  await fastify.register(userDepartmentsRoutes, {
    controller: userDepartmentsController,
    prefix: basePrefix,
  });

  // Decorate fastify instance with services for other plugins
  fastify.decorate('usersService', usersService);
  fastify.decorate('userDepartmentsService', userDepartmentsService);

  // Lifecycle hooks for monitoring
  fastify.addHook('onReady', async () => {
    fastify.log.info(`Platform users module registered successfully`);
  });
}

// ===== RE-EXPORTS FOR EXTERNAL CONSUMERS =====

// Schemas - All TypeBox schema definitions
export * from './users.schemas';

// Types - All TypeScript interfaces and types (excluding duplicates from schemas)
export type {
  User,
  UserWithRole,
  UserCreateData,
  UserUpdateData,
  UserListOptions,
} from './users.types';

// Classes - Core service classes
export { UsersRepository } from './users.repository';
export { UsersService } from './users.service';
export { UsersController } from './users.controller';

// Department assignment services
export { UserDepartmentsService } from './user-departments.service';
export { UserDepartmentsRepository } from './user-departments.repository';

// Routes - Export routes for custom mounting
export { usersRoutes } from './users.routes';

// Department assignment types
export type {
  UserDepartment,
  AssignUserToDepartmentData,
} from './user-departments.repository';

// Module name constant
export const MODULE_NAME = 'users' as const;
