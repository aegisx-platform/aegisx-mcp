import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import monitoringRoutes from './monitoring.routes';

async function monitoringPlugin(fastify: FastifyInstance) {
  // Register monitoring routes
  await fastify.register(monitoringRoutes);
}

export default fp(monitoringPlugin, {
  name: 'monitoring-module',
  dependencies: ['logging-plugin'],
  fastify: '4.x',
});
