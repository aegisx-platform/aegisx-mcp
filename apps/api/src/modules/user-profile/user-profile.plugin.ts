import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserProfileRepository } from './user-profile.repository';
import { AvatarService } from './services/avatar.service';
import { UserProfileService } from './services/user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { userProfileRoutes } from './user-profile.routes';
import { userProfileSchemas } from './user-profile.schemas';

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

  // Register multipart support for file uploads
  await fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    },
  });

  // Initialize dependencies
  const repository = new UserProfileRepository(fastify.knex);

  const avatarService = new AvatarService({
    logger: fastify.log,
  });

  const service = new UserProfileService({
    repository,
    avatarService,
    logger: fastify.log,
  });

  const controller = new UserProfileController({
    userProfileService: service,
  });

  // Register routes
  await fastify.register(userProfileRoutes, {
    controller,
    prefix: options.prefix || '/api',
  });

  // Decorate fastify instance with services (optional, for testing or other modules)
  fastify.decorate('userProfileService', service);
  fastify.decorate('avatarService', avatarService);

  fastify.log.info('User Profile plugin registered successfully');
}

export default fp(userProfilePlugin, {
  name: 'user-profile',
  dependencies: ['knex-plugin', 'jwt-auth-plugin', 'schemas-plugin'],
});
