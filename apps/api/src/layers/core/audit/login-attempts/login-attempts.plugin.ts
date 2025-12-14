import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { LoginAttemptsController } from './login-attempts.controller';
import { LoginAttemptsService } from './login-attempts.service';
import { LoginAttemptsRepository } from './login-attempts.repository';
import { loginAttemptsRoutes } from './login-attempts.routes';

/**
 * Login Attempts Plugin
 *
 * Registers the login attempts tracking and security monitoring system.
 *
 * Features:
 * - Track all login attempts (success and failure)
 * - Account lockout detection
 * - Brute force attack detection
 * - IP-based security monitoring
 * - User login history
 * - Statistical analysis
 * - CSV/JSON export
 *
 * Dependencies:
 * - knex-plugin: Database connection
 * - jwt-auth-plugin: JWT authentication
 * - auth-strategies-plugin: RBAC permissions
 *
 * Usage:
 * ```typescript
 * await fastify.register(loginAttemptsPlugin, {
 *   prefix: '/api/login-attempts', // Optional, defaults to '/login-attempts'
 * });
 *
 * // Use the service from anywhere in the app
 * await fastify.loginAttemptsService.logLoginAttempt({
 *   email: 'user@example.com',
 *   ipAddress: request.ip,
 *   success: false,
 *   failureReason: 'invalid_credentials',
 * });
 * ```
 */
export default fp(
  async function loginAttemptsPlugin(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
  ) {
    // 1. Create service instances with dependency injection
    const loginAttemptsRepository = new LoginAttemptsRepository(fastify.knex);
    const loginAttemptsService = new LoginAttemptsService(fastify.knex);
    const loginAttemptsController = new LoginAttemptsController(
      loginAttemptsService,
    );

    // 2. Register routes with controller
    await fastify.register(loginAttemptsRoutes, {
      prefix: opts.prefix || '/login-attempts',
    });

    // 3. Decorate Fastify instance for cross-module access
    fastify.decorate('loginAttemptsService', loginAttemptsService);
    fastify.decorate('loginAttemptsRepository', loginAttemptsRepository);

    // 4. Lifecycle hooks
    fastify.addHook('onReady', async () => {
      fastify.log.info('Login Attempts module registered successfully');
    });
  },
  {
    name: 'login-attempts-plugin',
    dependencies: ['knex-plugin', 'jwt-auth-plugin', 'auth-strategies-plugin'],
  },
);

// Fastify module declaration for TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    loginAttemptsService: LoginAttemptsService;
    loginAttemptsRepository: LoginAttemptsRepository;
  }
}
