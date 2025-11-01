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
      config: {
        rateLimit: {
          max: 3, // 3 registrations
          timeWindow: '1 hour', // per hour per IP
          keyGenerator: (req) => req.ip || 'unknown',
        },
      },
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        body: bodySchema,
        response: {
          201: responseSchema,
          400: SchemaRefs.ValidationError,
          409: SchemaRefs.Conflict,
          429: SchemaRefs.ServerError, // Rate limit exceeded
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
    config: {
      rateLimit: {
        max: 5, // 5 login attempts
        timeWindow: '1 minute', // per minute
        keyGenerator: (req) => {
          // Rate limit by IP + email combination to prevent brute force on specific users
          const email =
            (req.body as any)?.email ||
            (req.body as any)?.username ||
            'unknown';
          return `${req.ip}:${email}`;
        },
      },
    },
    schema: {
      tags: ['Authentication'],
      summary: 'Login with email and password',
      body: SchemaRefs.module('auth', 'loginRequest'),
      response: {
        200: SchemaRefs.module('auth', 'authResponse'),
        401: SchemaRefs.Unauthorized,
        429: SchemaRefs.ServerError, // Rate limit exceeded
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
    config: {
      rateLimit: {
        max: 10, // 10 refresh attempts
        timeWindow: '1 minute', // per minute per IP
        keyGenerator: (req) => req.ip || 'unknown',
      },
    },
    schema: {
      tags: ['Authentication'],
      summary: 'Refresh access token using refresh token',
      body: SchemaRefs.module('auth', 'refreshRequest'),
      response: {
        200: SchemaRefs.module('auth', 'refreshResponse'),
        401: SchemaRefs.Unauthorized,
        429: SchemaRefs.ServerError, // Rate limit exceeded
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

  // GET /api/auth/permissions - Get user permissions
  typedFastify.route({
    method: 'GET',
    url: '/auth/permissions',
    schema: {
      tags: ['Authentication'],
      summary: 'Get current user permissions (aggregated from all roles)',
      description:
        'Returns array of permissions in format "resource:action" aggregated from all active user roles. ' +
        'Real-time query from database - always up-to-date.',
      security: [{ bearerAuth: [] }],
      response: {
        200: SchemaRefs.module('auth', 'permissionsResponse'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preHandler: [fastify.authenticateJWT],
    handler: authController.getPermissions,
  });

  // POST /api/auth/unlock-account - Manually unlock a locked account (Admin only)
  typedFastify.route({
    method: 'POST',
    url: '/auth/unlock-account',
    schema: {
      tags: ['Authentication'],
      summary: 'Manually unlock a locked account',
      description:
        'Admin endpoint to manually unlock an account that has been locked due to failed login attempts. ' +
        'Requires admin permission.',
      security: [{ bearerAuth: [] }],
      body: SchemaRefs.module('auth', 'unlockAccountRequest'),
      response: {
        200: SchemaRefs.module('auth', 'unlockAccountResponse'),
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preHandler: [
      fastify.authenticateJWT,
      fastify.verifyPermission('auth', 'unlock'),
    ],
    handler: authController.unlockAccount,
  });
}
