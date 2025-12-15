import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { usersRoutes } from './users.routes';
import { usersSchemas } from './users.schemas';

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
    (fastify as any).schemaRegistry.registerModuleSchemas('users', usersSchemas);
  }

  // Create repository with Knex connection
  const usersRepository = new UsersRepository((fastify as any).knex);

  // Create service with repository
  const usersService = new UsersService(usersRepository);

  // Verify event service is available (should be decorated by websocket plugin)
  if (!(fastify as any).eventService) {
    throw new Error(
      'EventService not available - websocket plugin must load first',
    );
  }

  // Create controller with service and event service for real-time updates
  const usersController = new UsersController(
    usersService,
    (fastify as any).eventService,
  );

  // Register routes under the specified prefix or /api/v1/platform/users
  await fastify.register(usersRoutes, {
    controller: usersController,
    prefix: options.prefix || '/v1/platform/users',
  });

  // Decorate fastify instance with service for other plugins
  fastify.decorate('usersService', usersService);

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
