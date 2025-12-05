import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { HospitalPharmaceuticalProductsController } from './hospital-pharmaceutical-products.controller';
import { HospitalPharmaceuticalProductsService } from './hospital-pharmaceutical-products.service';
import { HospitalPharmaceuticalProductsRepository } from './hospital-pharmaceutical-products.repository';
import { hospitalPharmaceuticalProductsRoutes } from './hospital-pharmaceutical-products.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * HospitalPharmaceuticalProducts Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function hospitalPharmaceuticalProductsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'hospitalPharmaceuticalProducts',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const hospitalPharmaceuticalProductsRepository =
      new HospitalPharmaceuticalProductsRepository((fastify as any).knex);
    const hospitalPharmaceuticalProductsService =
      new HospitalPharmaceuticalProductsService(
        hospitalPharmaceuticalProductsRepository,
      );

    // Controller instantiation with proper dependencies
    const hospitalPharmaceuticalProductsController =
      new HospitalPharmaceuticalProductsController(
        hospitalPharmaceuticalProductsService,
      );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('hospitalPharmaceuticalProductsService', hospitalPharmaceuticalProductsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(hospitalPharmaceuticalProductsRoutes, {
      controller: hospitalPharmaceuticalProductsController,
      prefix:
        options.prefix ||
        '/inventory/master-data/hospital-pharmaceutical-products',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `HospitalPharmaceuticalProducts domain module registered successfully`,
      );
    });
  },
  {
    name: 'hospitalPharmaceuticalProducts-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './hospital-pharmaceutical-products.schemas';
export * from './hospital-pharmaceutical-products.types';
export { HospitalPharmaceuticalProductsRepository } from './hospital-pharmaceutical-products.repository';
export { HospitalPharmaceuticalProductsService } from './hospital-pharmaceutical-products.service';
export { HospitalPharmaceuticalProductsController } from './hospital-pharmaceutical-products.controller';

// Re-export commonly used types for external use
export type {
  HospitalPharmaceuticalProducts,
  CreateHospitalPharmaceuticalProducts,
  UpdateHospitalPharmaceuticalProducts,
  HospitalPharmaceuticalProductsIdParam,
  GetHospitalPharmaceuticalProductsQuery,
  ListHospitalPharmaceuticalProductsQuery,
} from './hospital-pharmaceutical-products.schemas';

// Module name constant
export const MODULE_NAME = 'hospitalPharmaceuticalProducts' as const;
