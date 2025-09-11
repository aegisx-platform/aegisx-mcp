import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { NavigationService } from './services/navigation.service';
import { navigationSchemas } from './navigation.schemas';
import navigationRoutes from './navigation.routes';

/**
 * Navigation Plugin
 * Registers the navigation module with Fastify
 * Provides navigation service, schemas, and routes
 */
async function navigationPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  fastify.schemaRegistry.registerModuleSchemas('navigation', navigationSchemas);

  // Initialize navigation service
  const navigationService = new NavigationService(fastify);

  // Decorate fastify instance with navigation service
  fastify.decorate('navigationService', navigationService);

  // Register navigation routes with /api prefix
  await fastify.register(navigationRoutes, { prefix: '/api' });

  // Add navigation-specific hooks
  fastify.addHook('onClose', async () => {
    // Cleanup navigation cache on server shutdown
    try {
      await navigationService.invalidateCache();
      fastify.log.info('Navigation cache cleared on server shutdown');
    } catch (error) {
      fastify.log.warn(
        `Failed to clear navigation cache on shutdown: ${error}`,
      );
    }
  });

  // Add health check for navigation module
  fastify.addHook('onReady', async () => {
    try {
      // Verify database connection and basic functionality
      const healthCheck = await navigationService.getNavigation({
        type: 'default',
        includeDisabled: false,
      });

      fastify.log.info('Navigation module initialized successfully');
      fastify.log.debug(
        `Navigation health check passed. Found ${
          Object.keys(healthCheck).length
        } navigation types`,
      );
    } catch (error) {
      fastify.log.error(`Navigation module initialization failed: ${error}`);
      // Don't throw here to prevent server startup failure
      // Let the health endpoint handle the error reporting
    }
  });

  fastify.log.info('Navigation plugin registered successfully');
}

export default fp(navigationPlugin, {
  name: 'navigation-plugin',
  dependencies: [
    'knex-plugin',
    'response-handler-plugin',
    'auth-strategies-plugin',
    'schemas-plugin',
  ],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    navigationService: NavigationService;
  }
}
