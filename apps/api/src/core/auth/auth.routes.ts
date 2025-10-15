import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { authController } from './auth.controller';
import { SchemaRefs } from '../../schemas/registry';

export default async function authRoutes(fastify: FastifyInstance) {
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // POST /api/auth/register
  try {
    const bodySchema = SchemaRefs.module('auth', 'registerRequest');
    const responseSchema = SchemaRefs.module('auth', 'registerResponse');

    typedFastify.route({
      method: 'POST',
      url: '/auth/register',
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        body: bodySchema,
        response: {
          201: responseSchema,
          400: SchemaRefs.ValidationError,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
        // activityLog: {
        //   enabled: true,
        //   action: 'register',
        //   description: 'User attempted to register a new account',
        //   severity: 'info',
        //   includeRequestData: false, // Don't log password
        //   async: false, // Ensure registration events are logged synchronously
        // },
      },
      handler: authController.register,
    });
    // Register route configured
  } catch (error) {
    console.error('[AUTH_ROUTES] Error registering register route:', error);
    throw error;
  }

  // POST /api/auth/login
  typedFastify.route({
    method: 'POST',
    url: '/auth/login',
    schema: {
      tags: ['Authentication'],
      summary: 'Login with email and password',
      body: SchemaRefs.module('auth', 'loginRequest'),
      response: {
        200: SchemaRefs.module('auth', 'authResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
      // activityLog: {
      //   enabled: true,
      //   action: 'login_attempt',
      //   description: 'User attempted to log in',
      //   severity: 'info',
      //   includeRequestData: false, // Don't log password
      //   async: false, // Ensure login events are logged synchronously
      //   shouldLog: (request, reply) => true, // Log both success and failure
      // },
    },
    handler: authController.login,
  });

  // POST /api/auth/refresh
  typedFastify.route({
    method: 'POST',
    url: '/auth/refresh',
    schema: {
      tags: ['Authentication'],
      summary: 'Refresh access token using refresh token',
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
    url: '/auth/logout',
    schema: {
      tags: ['Authentication'],
      summary: 'Logout and clear session',
      security: [{ bearerAuth: [] }],
      response: {
        200: SchemaRefs.module('auth', 'logoutResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
      // activityLog: {
      //   enabled: true,
      //   action: 'logout',
      //   description: 'User logged out',
      //   severity: 'info',
      //   async: true, // Logout events can be async
      // },
    },
    preHandler: [fastify.authenticateJWT],
    handler: authController.logout,
  });

  // GET /api/auth/me - Get current user profile
  typedFastify.route({
    method: 'GET',
    url: '/auth/me',
    schema: {
      tags: ['Authentication'],
      summary: 'Get current authenticated user profile',
      security: [{ bearerAuth: [] }],
      response: {
        200: SchemaRefs.module('auth', 'profileResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preHandler: [fastify.authenticateJWT],
    handler: authController.me,
  });
}
