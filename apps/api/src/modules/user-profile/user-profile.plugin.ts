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
import { userProfileSchemas } from './user-profile.schemas';
import { UsersService } from '../users/users.service';

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

  // Register multipart support for file uploads (shared across modules)
  await fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB per file
      files: 10, // Allow up to 10 files for file-upload module
      fieldSize: 1024 * 1024, // 1MB for form fields
      fields: 10, // Maximum number of non-file fields
    },
    throwFileSizeLimit: true,
    addToBody: false, // Don't add files to request.body
  });

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

  // Register routes
  await fastify.register(userProfileRoutes, {
    controller,
    activityController,
    deleteAccountController,
    prefix: options.prefix || '/api',
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
  ],
});
