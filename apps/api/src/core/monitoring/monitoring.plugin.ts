import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';
import monitoringRoutes from './monitoring.routes';
import { monitoringSchemas } from './monitoring.schemas';
import metricsPlugin from './plugins/metrics.plugin';
import { createSessionTracker } from './services/session-tracker.service';

async function monitoringPlugin(fastify: FastifyInstance) {
  // Register metrics plugin FIRST (before routes, to collect metrics on all requests)
  await fastify.register(metricsPlugin);

  // Initialize session tracker
  const sessionTracker = createSessionTracker(fastify);

  // Add hook to track user sessions on every authenticated request
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    // Check if request has authenticated user
    if (request.user && request.user.id) {
      // Update session activity (non-blocking - fire and forget)
      sessionTracker.updateActivity(
        request.user.id,
        request.user.email,
        request.id, // Use request ID as session ID
      );
    }
  });

  // Register monitoring schemas
  fastify.schemaRegistry.registerModuleSchemas('monitoring', monitoringSchemas);

  // Register monitoring routes under /monitoring
  await fastify.register(monitoringRoutes, { prefix: '/monitoring' });
}

export default fp(monitoringPlugin, {
  name: 'monitoring-module',
  dependencies: ['logging-plugin', 'schemas-plugin', 'redis-plugin'],
  fastify: '>=4.x',
});
