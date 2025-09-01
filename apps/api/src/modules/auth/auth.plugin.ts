import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { AuthService } from './services/auth.service';
import { registerAuthSchemas } from './auth.schemas';
import authRoutes from './auth.routes';

export default fp(async function authPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Register auth schemas
  registerAuthSchemas(fastify);

  // Initialize auth service
  const authService = new AuthService(fastify);
  
  // Decorate fastify instance with auth service
  fastify.decorate('authService', authService);

  // Register auth routes
  await fastify.register(authRoutes);
}, {
  name: 'auth-plugin',
  dependencies: ['knex-plugin', 'response-handler', 'auth-strategies-plugin']
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    authService: AuthService;
  }
}