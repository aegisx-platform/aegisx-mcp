import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NavigationService } from './services/navigation.service';
import { navigationSchemas } from './navigation.schemas';
import navigationRoutes from './navigation.routes';
import navigationItemsRoutes from './navigation-items.routes';

/**
 * Navigation Plugin (Platform Layer)
 * Registers the navigation module with Fastify
 * Provides navigation service, schemas, and routes
 *
 * Note: This is a leaf module (not infrastructure), so it uses plain async function
 * instead of fastify-plugin wrapper. The plugin is scoped to its own context.
 */
export async function navigationPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  fastify.schemaRegistry.registerModuleSchemas('navigation', navigationSchemas);

  // Initialize navigation service
  const navigationService = new NavigationService(fastify);

  // Decorate fastify instance with navigation service
  // (Enabled after old core/navigation module was removed in Phase 8)
  if (!fastify.hasDecorator('navigationService')) {
    fastify.decorate('navigationService', navigationService);
  }

  // Register navigation routes with platform layer prefix
  // Pass navigationService as option to avoid type conflicts with old module
  await fastify.register(navigationRoutes, {
    prefix: '/v1/platform/navigation',
    navigationService,
  });
  await fastify.register(navigationItemsRoutes, {
    prefix: '/v1/platform/navigation',
    navigationService,
  }); // Navigation items CRUD routes

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

export default navigationPlugin;

// NOTE: TypeScript declarations removed during migration to avoid type conflicts
// The old core/navigation module already declares fastify.navigationService
// This declaration will be restored after old module is removed (Phase 8)
