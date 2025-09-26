import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { AuthService } from './services/auth.service';
import { authSchemas } from './auth.schemas';
import authRoutes from './auth.routes';

export default fp(
  async function authPlugin(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions,
  ) {
    // Register module schemas using the schema registry
    if ((fastify as any).schemaRegistry) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'auth',
        authSchemas,
      );
    }

    // Initialize auth service
    const authService = new AuthService(fastify);

    // Decorate fastify instance with auth service
    fastify.decorate('authService', authService);

    // Register auth routes
    await fastify.register(authRoutes);
  },
  {
    name: 'auth-plugin',
    dependencies: [
      'knex-plugin',
      'response-handler-plugin',
      'auth-strategies-plugin',
      'schemas-plugin',
    ],
  },
);

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    authService: AuthService;
  }
}
