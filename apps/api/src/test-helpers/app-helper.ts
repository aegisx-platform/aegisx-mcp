import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyAuth from '@fastify/auth';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
// import fastifySensible from '@fastify/sensible'; // Removed - using custom response format

// Import plugins
import knexPlugin from '../plugins/knex.plugin';
import redisPlugin from '../plugins/redis.plugin';
import responseHandlerPlugin from '../plugins/response-handler.plugin';
import errorHandlerPlugin from '../plugins/error-handler.plugin';
import schemasPlugin from '../plugins/schemas.plugin';
import jwtAuthPlugin from '../plugins/jwt-auth.plugin';
import schemaEnforcementPlugin from '../plugins/schema-enforcement.plugin';
import authStrategiesPlugin from '../core/auth/strategies/auth.strategies';
import authPlugin from '../core/auth/auth.plugin';
import navigationPlugin from '../modules/navigation/navigation.plugin';
import userProfilePlugin from '../modules/user-profile/user-profile.plugin';
import settingsPlugin from '../modules/settings/settings.plugin';
import swaggerPlugin from '../plugins/swagger.plugin';

/**
 * Build a Fastify app instance for testing
 * @param options Fastify server options
 * @returns Promise<FastifyInstance>
 */
export async function build(
  options: FastifyServerOptions = {},
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    ...options,
  });

  // 1. Response and error handlers (first to set up reply decorators)
  await app.register(responseHandlerPlugin);
  await app.register(errorHandlerPlugin);

  // 2. Infrastructure plugins
  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  // 3. Database connection
  await app.register(knexPlugin);

  // 3.5. Redis connection (optional for caching)
  await app.register(redisPlugin);

  // 4. Authentication
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'test-secret',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
  });

  // 5. Cookie support (for refresh tokens)
  await app.register(fastifyCookie, {
    secret: process.env.SESSION_SECRET || 'test-secret',
    parseOptions: {
      httpOnly: true,
      secure: false, // Disable for tests
      sameSite: 'strict',
    },
  });

  // 6. Authentication strategies
  await app.register(fastifyAuth);

  // 6.5. JWT Auth wrapper plugin
  await app.register(jwtAuthPlugin);

  // Response and error handlers already registered at top

  // 9. Common schemas
  await app.register(schemasPlugin);

  // 10. Schema enforcement (ensures all routes have schemas)
  await app.register(schemaEnforcementPlugin);

  // 10.5. Swagger (needed for schema tags)
  await app.register(swaggerPlugin);

  // 11. Auth strategies
  await app.register(authStrategiesPlugin);

  // 12. Feature modules
  await app.register(authPlugin);
  await app.register(navigationPlugin);
  await app.register(userProfilePlugin);
  await app.register(settingsPlugin);

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'test',
    };
  });

  // Wait for app to be ready
  await app.ready();

  return app;
}
