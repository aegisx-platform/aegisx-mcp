import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TmtMappingsController } from './tmt-mappings.controller';
import { TmtMappingsService } from './tmt-mappings.service';
import { TmtMappingsRepository } from './tmt-mappings.repository';
import { tmtMappingsRoutes } from './tmt-mappings.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * TmtMappings Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function tmtMappingsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'tmtMappings',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const tmtMappingsRepository = new TmtMappingsRepository(
      (fastify as any).knex,
    );
    const tmtMappingsService = new TmtMappingsService(tmtMappingsRepository);

    // Controller instantiation with proper dependencies
    const tmtMappingsController = new TmtMappingsController(tmtMappingsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('tmtMappingsService', tmtMappingsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(tmtMappingsRoutes, {
      controller: tmtMappingsController,
      prefix: options.prefix || '/inventory/master-data/tmt-mappings',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`TmtMappings domain module registered successfully`);
    });
  },
  {
    name: 'tmtMappings-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './tmt-mappings.schemas';
export * from './tmt-mappings.types';
export { TmtMappingsRepository } from './tmt-mappings.repository';
export { TmtMappingsService } from './tmt-mappings.service';
export { TmtMappingsController } from './tmt-mappings.controller';

// Re-export commonly used types for external use
export type {
  TmtMappings,
  CreateTmtMappings,
  UpdateTmtMappings,
  TmtMappingsIdParam,
  GetTmtMappingsQuery,
  ListTmtMappingsQuery,
} from './tmt-mappings.schemas';

// Module name constant
export const MODULE_NAME = 'tmtMappings' as const;
