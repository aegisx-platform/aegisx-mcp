import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { authController } from './auth.controller';
import { SchemaRefs } from '../../schemas/registry';

export default async function authRoutes(fastify: FastifyInstance) {
  console.log('[AUTH_ROUTES] Registering auth routes...');
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // POST /api/auth/register
  console.log('[AUTH_ROUTES] Registering POST /api/auth/register...');

  try {
    console.log('[AUTH_ROUTES] Getting schema refs...');
    const bodySchema = SchemaRefs.module('auth', 'registerRequest');
    const responseSchema = SchemaRefs.module('auth', 'registerResponse');

    console.log('[AUTH_ROUTES] Body schema:', typeof bodySchema);
    console.log('[AUTH_ROUTES] Response schema:', typeof responseSchema);

    typedFastify.route({
      method: 'POST',
      url: '/api/auth/register',
      schema: {
        body: bodySchema,
        response: {
          201: responseSchema,
          400: SchemaRefs.ValidationError,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
      },
      handler: authController.register,
    });
    console.log('[AUTH_ROUTES] Register route registered successfully');
  } catch (error) {
    console.error('[AUTH_ROUTES] Error registering register route:', error);
    throw error;
  }

  // POST /api/auth/login
  typedFastify.route({
    method: 'POST',
    url: '/api/auth/login',
    schema: {
      body: SchemaRefs.module('auth', 'loginRequest'),
      response: {
        200: SchemaRefs.module('auth', 'authResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.login,
  });

  // POST /api/auth/refresh
  typedFastify.route({
    method: 'POST',
    url: '/api/auth/refresh',
    schema: {
      body: SchemaRefs.module('auth', 'refreshRequest'),
      response: {
        200: SchemaRefs.module('auth', 'refreshResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.refresh,
  });

  // POST /api/auth/logout
  typedFastify.route({
    method: 'POST',
    url: '/api/auth/logout',
    schema: {
      response: {
        200: SchemaRefs.module('auth', 'logoutResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.logout,
  });

  // TODO: Implement profile endpoint
  // GET /api/auth/profile - Requires authController.profile implementation
}
