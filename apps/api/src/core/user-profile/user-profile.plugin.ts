import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserProfileRepository } from './user-profile.repository';
import { AvatarService } from './services/avatar.service';
import { UserProfileService } from './services/user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserActivityRepository } from './user-activity.repository';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';
import { DeleteAccountController } from './delete-account.controller';
import { userProfileRoutes } from './user-profile.routes';
import activityLogsRoutes from './activity-logs.routes';
import { userProfileSchemas } from './user-profile.schemas';
import { UsersService } from '../../core/users/users.service';

declare module 'fastify' {
  interface FastifyInstance {
    usersService: UsersService;
  }
}

export interface UserProfilePluginOptions extends FastifyPluginOptions {
  prefix?: string;
}

async function userProfilePlugin(
  fastify: FastifyInstance,
  options: UserProfilePluginOptions,
) {
  // Register module schemas using the schema registry
  fastify.schemaRegistry.registerModuleSchemas(
    'user-profile',
    userProfileSchemas,
  );

  // Multipart support is provided by global multipart plugin

  // Initialize dependencies
  const repository = new UserProfileRepository(fastify.knex);
  const activityRepository = new UserActivityRepository(fastify.knex);

  const avatarService = new AvatarService({
    logger: fastify.log,
  });

  const service = new UserProfileService({
    repository,
    avatarService,
    logger: fastify.log,
  });

  const activityService = new UserActivityService(activityRepository);

  const controller = new UserProfileController({
    userProfileService: service,
  });

  const activityController = new UserActivityController(activityService);

  const deleteAccountController = new DeleteAccountController(
    fastify.usersService,
    activityService,
  );

  // Register routes (no prefix needed as global prefix is handled by plugin loader)
  await fastify.register(userProfileRoutes, {
    controller,
    activityController,
    deleteAccountController,
    prefix: options.prefix,
  });

  // Register admin activity logs routes at /activity-logs
  await fastify.register(activityLogsRoutes, {
    controller: activityController,
    prefix: '/activity-logs',
  });

  // Decorate fastify instance with services (optional, for testing or other modules)
  fastify.decorate('userProfileService', service);
  fastify.decorate('userActivityService', activityService);
  fastify.decorate('avatarService', avatarService);

  fastify.log.info('User Profile plugin registered successfully');
}

export default fp(userProfilePlugin, {
  name: 'user-profile',
  dependencies: [
    'knex-plugin',
    'jwt-auth-plugin',
    'schemas-plugin',
    'users-plugin',
    'multipart-plugin',
  ],
});
