import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DosageFormsController } from './dosage-forms.controller';
import { DosageFormsService } from './dosage-forms.service';
import { DosageFormsRepository } from './dosage-forms.repository';
import { dosageFormsRoutes } from './dosage-forms.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DosageForms Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function dosageFormsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'dosageForms',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const dosageFormsRepository = new DosageFormsRepository(
      (fastify as any).knex,
    );
    const dosageFormsService = new DosageFormsService(dosageFormsRepository);

    // Controller instantiation with proper dependencies
    const dosageFormsController = new DosageFormsController(dosageFormsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('dosageFormsService', dosageFormsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(dosageFormsRoutes, {
      controller: dosageFormsController,
      prefix: options.prefix || '/inventory/master-data/dosage-forms',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DosageForms domain module registered successfully`);
    });
  },
  {
    name: 'dosageForms-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './dosage-forms.schemas';
export * from './dosage-forms.types';
export { DosageFormsRepository } from './dosage-forms.repository';
export { DosageFormsService } from './dosage-forms.service';
export { DosageFormsController } from './dosage-forms.controller';

// Re-export commonly used types for external use
export type {
  DosageForms,
  CreateDosageForms,
  UpdateDosageForms,
  DosageFormsIdParam,
  GetDosageFormsQuery,
  ListDosageFormsQuery,
} from './dosage-forms.schemas';

// Module name constant
export const MODULE_NAME = 'dosageForms' as const;
