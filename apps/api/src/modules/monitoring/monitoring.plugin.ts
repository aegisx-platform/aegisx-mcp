import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import monitoringRoutes from './monitoring.routes';
import { monitoringSchemas } from './monitoring.schemas';

async function monitoringPlugin(fastify: FastifyInstance) {
  // Register monitoring schemas
  fastify.schemaRegistry.registerModuleSchemas('monitoring', monitoringSchemas);

  // Register monitoring routes (prefix handled by main.ts)
  await fastify.register(monitoringRoutes);
}

export default fp(monitoringPlugin, {
  name: 'monitoring-module',
  dependencies: ['logging-plugin', 'schemas-plugin'],
  fastify: '>=4.x',
});
