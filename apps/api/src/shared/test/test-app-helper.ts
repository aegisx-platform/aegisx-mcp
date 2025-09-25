import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import knexPlugin from '../../plugins/knex.plugin';
import responseHandlerPlugin from '../../plugins/response-handler.plugin';

/**
 * Create Test App Helper
 * 
 * Creates a minimal Fastify app instance for testing
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false // Disable logging in tests
  });

  // Register essential plugins for testing
  await app.register(knexPlugin);
  await app.register(responseHandlerPlugin);

  // Add basic ready handler
  await app.ready();

  return app;
}