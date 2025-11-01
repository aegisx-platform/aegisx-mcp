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
          // Generous rate limiting to allow fixing validation errors
          // While still preventing spam and enumeration attacks
          max: 100, // 100 total registration attempts
          timeWindow: '5 minutes', // per 5 minutes per IP
          keyGenerator: (req) => req.ip || 'unknown',
          errorResponseBuilder: () => ({
            success: false,
            error: {
              code: 'TOO_MANY_ATTEMPTS',
              message:
                'Too many registration attempts. Please try again in a few minutes.',
              statusCode: 429,
            },
          }),
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
        // Balanced rate limiting for better UX while preventing brute force
        max: 15, // 15 login attempts
        timeWindow: '5 minutes', // per 5 minutes
        keyGenerator: (req) => {
          // Rate limit by IP + email combination to prevent brute force on specific users
          const email =
            (req.body as any)?.email ||
            (req.body as any)?.username ||
            'unknown';
          return `${req.ip}:${email}`;
        },
        errorResponseBuilder: () => ({
          success: false,
          error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS',
            message:
              'Too many login attempts. Please try again in a few minutes.',
            statusCode: 429,
          },
        }),
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
      description:
        'Logs out user by clearing refresh token cookie. ' +
        'Does not require valid JWT token - allows logout even if token is expired/invalid.',
      response: {
        200: SchemaRefs.module('auth', 'logoutResponse'),
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
    // No authentication required - allow logout even with expired/invalid token
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

  // POST /api/auth/verify-email - Verify email address
  typedFastify.route({
    method: 'POST',
    url: '/auth/verify-email',
    schema: {
      tags: ['Authentication'],
      summary: 'Verify email address using verification token',
      description:
        'Verifies user email address using the token sent via email during registration. ' +
        'Tokens expire after 24 hours.',
      body: SchemaRefs.module('auth', 'verifyEmailRequest'),
      response: {
        200: SchemaRefs.module('auth', 'verifyEmailResponse'),
        400: SchemaRefs.ValidationError,
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.verifyEmail,
  });

  // POST /api/auth/resend-verification - Resend verification email
  typedFastify.route({
    method: 'POST',
    url: '/auth/resend-verification',
    schema: {
      tags: ['Authentication'],
      summary: 'Resend email verification',
      description:
        'Resends the email verification link to authenticated user. ' +
        'Creates a new verification token and invalidates the old one.',
      security: [{ bearerAuth: [] }],
      body: SchemaRefs.module('auth', 'resendVerificationRequest'),
      response: {
        200: SchemaRefs.module('auth', 'resendVerificationResponse'),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preHandler: [fastify.authenticateJWT],
    handler: authController.resendVerification,
  });

  // POST /api/auth/request-password-reset - Request password reset
  typedFastify.route({
    method: 'POST',
    url: '/auth/request-password-reset',
    config: {
      rateLimit: {
        max: 3, // 3 reset requests
        timeWindow: '1 hour', // per hour per IP
        keyGenerator: (req) => req.ip || 'unknown',
      },
    },
    schema: {
      tags: ['Authentication'],
      summary: 'Request password reset',
      description:
        'Sends a password reset email with a secure token. ' +
        'Always returns success for security (does not reveal if email exists). ' +
        'Tokens expire after 1 hour.',
      body: SchemaRefs.module('auth', 'requestPasswordResetRequest'),
      response: {
        200: SchemaRefs.module('auth', 'requestPasswordResetResponse'),
        429: SchemaRefs.ServerError, // Rate limit exceeded
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.requestPasswordReset,
  });

  // POST /api/auth/verify-reset-token - Verify password reset token
  typedFastify.route({
    method: 'POST',
    url: '/auth/verify-reset-token',
    schema: {
      tags: ['Authentication'],
      summary: 'Verify password reset token',
      description:
        'Checks if a password reset token is valid and not expired. ' +
        'Used by frontend to validate token before showing reset form.',
      body: SchemaRefs.module('auth', 'verifyResetTokenRequest'),
      response: {
        200: SchemaRefs.module('auth', 'verifyResetTokenResponse'),
        400: SchemaRefs.ValidationError,
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.verifyResetToken,
  });

  // POST /api/auth/reset-password - Reset password using token
  typedFastify.route({
    method: 'POST',
    url: '/auth/reset-password',
    config: {
      rateLimit: {
        // Generous limit to allow password validation retries
        max: 10, // 10 reset attempts
        timeWindow: '5 minutes', // per 5 minutes per IP
        keyGenerator: (req) => req.ip || 'unknown',
        errorResponseBuilder: () => ({
          success: false,
          error: {
            code: 'TOO_MANY_RESET_ATTEMPTS',
            message:
              'Too many password reset attempts. Please try again in a few minutes.',
            statusCode: 429,
          },
        }),
      },
    },
    schema: {
      tags: ['Authentication'],
      summary: 'Reset password',
      description:
        'Resets user password using a valid reset token. ' +
        'Invalidates all existing sessions for security. ' +
        'Token can only be used once.',
      body: SchemaRefs.module('auth', 'resetPasswordRequest'),
      response: {
        200: SchemaRefs.module('auth', 'resetPasswordResponse'),
        400: SchemaRefs.ValidationError,
        429: SchemaRefs.ServerError, // Rate limit exceeded
        500: SchemaRefs.ServerError,
      },
    },
    handler: authController.resetPassword,
  });
}
