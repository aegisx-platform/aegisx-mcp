import { FastifyInstance } from 'fastify';
import { LoginAttemptsService } from './login-attempts.service';
import { LoginAttemptsController } from './login-attempts.controller';
import {
  LoginAttemptsSchemas,
  LoginAttemptsQuerySchema,
  AccountLockoutCheckSchema,
  BruteForceDetectionSchema,
  CreateLoginAttemptSchema,
} from './login-attempts.schemas';
import {
  CommonSchemas,
  IdParamSchema,
  UserIdParamSchema,
} from '../base/base.schemas';
import { Type } from '@sinclair/typebox';

/**
 * Login Attempts Routes
 *
 * RESTful API endpoints for login attempt tracking and security monitoring.
 *
 * All routes require authentication and appropriate permissions.
 */
export async function loginAttemptsRoutes(fastify: FastifyInstance) {
  const service = new LoginAttemptsService(fastify.knex);
  const controller = new LoginAttemptsController(service);

  // ==================== LIST & SEARCH ====================

  /**
   * GET /
   * List all login attempts with pagination
   */
  fastify.get(
    '/',
    {
      schema: {
        description: 'List login attempts with pagination and filtering',
        tags: ['Login Attempts'],
        querystring: LoginAttemptsQuerySchema,
        response: {
          200: LoginAttemptsSchemas.LoginAttemptsResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.findAll.bind(controller),
  );

  /**
   * GET /:id
   * Get single login attempt by ID
   */
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get single login attempt by ID',
        tags: ['Login Attempts'],
        params: IdParamSchema,
        response: {
          200: LoginAttemptsSchemas.LoginAttemptResponse,
          404: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.findById.bind(controller),
  );

  // ==================== STATISTICS ====================

  /**
   * GET /stats
   * Get login attempts statistics
   */
  fastify.get(
    '/stats',
    {
      schema: {
        description: 'Get login attempts statistics',
        tags: ['Login Attempts'],
        querystring: CommonSchemas.DaysParam,
        response: {
          200: LoginAttemptsSchemas.LoginAttemptsStatsResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getStats.bind(controller),
  );

  // ==================== SECURITY ENDPOINTS ====================

  /**
   * POST /check-lockout
   * Check account lockout status
   */
  fastify.post(
    '/check-lockout',
    {
      schema: {
        description:
          'Check if account should be locked based on failed attempts',
        tags: ['Login Attempts'],
        body: AccountLockoutCheckSchema,
        response: {
          200: LoginAttemptsSchemas.AccountLockoutStatusResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.checkLockout.bind(controller),
  );

  /**
   * POST /detect-brute-force
   * Detect brute force attempts
   */
  fastify.post(
    '/detect-brute-force',
    {
      schema: {
        description: 'Detect brute force login attempts from IP address',
        tags: ['Login Attempts'],
        body: BruteForceDetectionSchema,
        response: {
          200: LoginAttemptsSchemas.BruteForceResultResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.detectBruteForce.bind(controller),
  );

  /**
   * GET /recent/:identifier
   * Get recent login attempts
   */
  fastify.get(
    '/recent/:identifier',
    {
      schema: {
        description: 'Get recent login attempts for email, username, or IP',
        tags: ['Login Attempts'],
        params: Type.Object({
          identifier: Type.String({
            description: 'Email, username, or IP address',
          }),
        }),
        querystring: Type.Object({
          minutes: Type.Optional(
            Type.Integer({
              minimum: 1,
              maximum: 1440,
              default: 60,
              description: 'Time window in minutes',
            }),
          ),
        }),
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(LoginAttemptsSchemas.LoginAttempt),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getRecentByIdentifier.bind(controller),
  );

  // ==================== USER-SPECIFIC ENDPOINTS ====================

  /**
   * GET /user/:userId
   * Get user login history
   */
  fastify.get(
    '/user/:userId',
    {
      schema: {
        description: 'Get login history for specific user',
        tags: ['Login Attempts'],
        params: UserIdParamSchema,
        querystring: LoginAttemptsQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(LoginAttemptsSchemas.LoginAttempt),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getByUserId.bind(controller),
  );

  // ==================== FILTER ENDPOINTS ====================

  /**
   * GET /successful
   * Get successful login attempts
   */
  fastify.get(
    '/successful',
    {
      schema: {
        description: 'Get successful login attempts',
        tags: ['Login Attempts'],
        querystring: LoginAttemptsQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(LoginAttemptsSchemas.LoginAttempt),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getSuccessful.bind(controller),
  );

  /**
   * GET /failed
   * Get failed login attempts
   */
  fastify.get(
    '/failed',
    {
      schema: {
        description: 'Get failed login attempts',
        tags: ['Login Attempts'],
        querystring: LoginAttemptsQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(LoginAttemptsSchemas.LoginAttempt),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getFailed.bind(controller),
  );

  /**
   * GET /by-reason/:reason
   * Get attempts by failure reason
   */
  fastify.get(
    '/by-reason/:reason',
    {
      schema: {
        description: 'Get login attempts by failure reason',
        tags: ['Login Attempts'],
        params: Type.Object({
          reason: Type.String({
            description:
              'Failure reason (e.g., invalid_credentials, account_locked)',
          }),
        }),
        querystring: LoginAttemptsQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(LoginAttemptsSchemas.LoginAttempt),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getByReason.bind(controller),
  );

  /**
   * GET /by-ip/:ipAddress
   * Get attempts from IP address
   */
  fastify.get(
    '/by-ip/:ipAddress',
    {
      schema: {
        description: 'Get login attempts from specific IP address',
        tags: ['Login Attempts'],
        params: Type.Object({
          ipAddress: CommonSchemas.IpAddress,
        }),
        querystring: LoginAttemptsQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(LoginAttemptsSchemas.LoginAttempt),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'read'),
      ],
    },
    controller.getByIp.bind(controller),
  );

  // ==================== EXPORT ====================

  /**
   * GET /export
   * Export login attempts
   */
  fastify.get(
    '/export',
    {
      schema: {
        description: 'Export login attempts to CSV or JSON',
        tags: ['Login Attempts'],
        querystring: LoginAttemptsQuerySchema,
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'export'),
      ],
    },
    controller.export.bind(controller),
  );

  // ==================== CLEANUP ====================

  /**
   * DELETE /cleanup
   * Cleanup old login attempts
   */
  fastify.delete(
    '/cleanup',
    {
      schema: {
        description: 'Delete login attempts older than specified days',
        tags: ['Login Attempts'],
        querystring: CommonSchemas.CleanupQuery,
        response: {
          200: CommonSchemas.SuccessCleanupResponse,
          400: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'delete'),
      ],
    },
    controller.cleanup.bind(controller),
  );

  // ==================== CREATE/DELETE (ADMIN ONLY) ====================

  /**
   * POST /
   * Create login attempt (manual logging)
   */
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create login attempt entry (manual logging)',
        tags: ['Login Attempts'],
        body: CreateLoginAttemptSchema,
        response: {
          201: CommonSchemas.SuccessIdResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'create'),
      ],
    },
    controller.create.bind(controller),
  );

  /**
   * DELETE /:id
   * Delete single login attempt
   */
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete single login attempt',
        tags: ['Login Attempts'],
        params: IdParamSchema,
        response: {
          200: CommonSchemas.SuccessDeleteResponse,
          404: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('login-attempts', 'delete'),
      ],
    },
    controller.delete.bind(controller),
  );
}
