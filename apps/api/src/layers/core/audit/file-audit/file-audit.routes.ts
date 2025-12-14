import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { FileAuditService } from './file-audit.service';
import { FileAuditController } from './file-audit.controller';
import {
  FileAuditSchemas,
  FileAuditQuerySchema,
  FileHistoryQuerySchema,
  UserFileActivityQuerySchema,
  CreateFileAuditLogSchema,
} from './file-audit.schemas';
import {
  CommonSchemas,
  IdParamSchema,
  UserIdParamSchema,
} from '../base/base.schemas';

/**
 * File Audit Routes
 *
 * RESTful API endpoints for file audit logging.
 *
 * All routes require authentication and appropriate permissions.
 */
export async function fileAuditRoutes(fastify: FastifyInstance) {
  const service = new FileAuditService(fastify.knex);
  const controller = new FileAuditController(service);

  // ==================== LIST & SEARCH ====================

  /**
   * GET /
   * List all file audit logs with pagination
   */
  fastify.get(
    '/',
    {
      schema: {
        description: 'List file audit logs with pagination and filtering',
        tags: ['File Audit'],
        querystring: FileAuditQuerySchema,
        response: {
          200: FileAuditSchemas.FileAuditLogsResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.findAll.bind(controller),
  );

  /**
   * GET /:id
   * Get single file audit log by ID
   */
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get single file audit log by ID',
        tags: ['File Audit'],
        params: IdParamSchema,
        response: {
          200: FileAuditSchemas.FileAuditLogResponse,
          404: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.findById.bind(controller),
  );

  // ==================== STATISTICS ====================

  /**
   * GET /stats
   * Get file audit statistics
   */
  fastify.get(
    '/stats',
    {
      schema: {
        description: 'Get file audit statistics',
        tags: ['File Audit'],
        querystring: CommonSchemas.DaysParam,
        response: {
          200: FileAuditSchemas.FileAuditStatsResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getStats.bind(controller),
  );

  // ==================== FILE-SPECIFIC ENDPOINTS ====================

  /**
   * GET /file/:fileId
   * Get file access history
   */
  fastify.get(
    '/file/:fileId',
    {
      schema: {
        description: 'Get file access history',
        tags: ['File Audit'],
        params: {
          type: 'object',
          properties: {
            fileId: CommonSchemas.Uuid,
          },
          required: ['fileId'],
        },
        querystring: FileHistoryQuerySchema,
        response: {
          200: FileAuditSchemas.FileHistoryResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getFileHistory.bind(controller),
  );

  /**
   * GET /file/:fileId/summary
   * Get file audit summary
   */
  fastify.get(
    '/file/:fileId/summary',
    {
      schema: {
        description: 'Get file audit summary (operations, users, statistics)',
        tags: ['File Audit'],
        params: {
          type: 'object',
          properties: {
            fileId: CommonSchemas.Uuid,
          },
          required: ['fileId'],
        },
        response: {
          200: FileAuditSchemas.FileAuditSummaryResponse,
          404: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getFileSummary.bind(controller),
  );

  /**
   * GET /file/:fileId/suspicious
   * Detect suspicious activity
   */
  fastify.get(
    '/file/:fileId/suspicious',
    {
      schema: {
        description: 'Detect suspicious file activity patterns',
        tags: ['File Audit'],
        params: {
          type: 'object',
          properties: {
            fileId: CommonSchemas.Uuid,
          },
          required: ['fileId'],
        },
        querystring: {
          type: 'object',
          properties: {
            timeWindow: {
              type: 'integer',
              minimum: 1,
              maximum: 1440,
              default: 60,
              description: 'Time window in minutes',
            },
          },
        },
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Object({
              isSuspicious: Type.Boolean(),
              reasons: Type.Array(Type.String()),
              failureRate: Type.Number(),
              accessDenialCount: Type.Integer(),
              operationCount: Type.Integer(),
            }),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.detectSuspicious.bind(controller),
  );

  /**
   * GET /file/:fileId/stats
   * Get file operation statistics
   */
  fastify.get(
    '/file/:fileId/stats',
    {
      schema: {
        description: 'Get file operation statistics',
        tags: ['File Audit'],
        params: {
          type: 'object',
          properties: {
            fileId: CommonSchemas.Uuid,
          },
          required: ['fileId'],
        },
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Object({
              total: Type.Integer(),
              byOperation: Type.Record(Type.String(), Type.Any()),
              byAccessMethod: Type.Record(Type.String(), Type.Any()),
              successRate: Type.Number(),
            }),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getFileOperationStats.bind(controller),
  );

  // ==================== USER-SPECIFIC ENDPOINTS ====================

  /**
   * GET /user/:userId
   * Get user file activity
   */
  fastify.get(
    '/user/:userId',
    {
      schema: {
        description: 'Get user file activity',
        tags: ['File Audit'],
        params: UserIdParamSchema,
        querystring: UserFileActivityQuerySchema,
        response: {
          200: FileAuditSchemas.UserFileActivityResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getByUser.bind(controller),
  );

  /**
   * GET /user/:userId/files
   * Get files accessed by user
   */
  fastify.get(
    '/user/:userId/files',
    {
      schema: {
        description: 'Get files accessed by user',
        tags: ['File Audit'],
        params: UserIdParamSchema,
        querystring: UserFileActivityQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(
              Type.Object({
                fileId: CommonSchemas.Uuid,
                fileName: Type.String(),
                count: Type.Integer(),
              }),
            ),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getUserFiles.bind(controller),
  );

  // ==================== SECURITY ENDPOINTS ====================

  /**
   * GET /access-denied
   * Get access denied logs
   */
  fastify.get(
    '/access-denied',
    {
      schema: {
        description: 'Get access denied logs',
        tags: ['File Audit'],
        querystring: FileAuditQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(FileAuditSchemas.FileAuditLog),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getAccessDenied.bind(controller),
  );

  /**
   * GET /failed
   * Get failed operations
   */
  fastify.get(
    '/failed',
    {
      schema: {
        description: 'Get failed file operations',
        tags: ['File Audit'],
        querystring: FileAuditQuerySchema,
        response: {
          200: CommonSchemas.ApiSuccessResponse(
            Type.Array(FileAuditSchemas.FileAuditLog),
          ),
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'read'),
      ],
    },
    controller.getFailedOperations.bind(controller),
  );

  // ==================== EXPORT ====================

  /**
   * GET /export
   * Export file audit logs
   */
  fastify.get(
    '/export',
    {
      schema: {
        description: 'Export file audit logs to CSV or JSON',
        tags: ['File Audit'],
        querystring: FileAuditQuerySchema,
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'export'),
      ],
    },
    controller.export.bind(controller),
  );

  // ==================== CLEANUP ====================

  /**
   * DELETE /cleanup
   * Cleanup old file audit logs
   */
  fastify.delete(
    '/cleanup',
    {
      schema: {
        description: 'Delete file audit logs older than specified days',
        tags: ['File Audit'],
        querystring: CommonSchemas.CleanupQuery,
        response: {
          200: CommonSchemas.SuccessCleanupResponse,
          400: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'delete'),
      ],
    },
    controller.cleanup.bind(controller),
  );

  // ==================== CREATE/DELETE (ADMIN ONLY) ====================

  /**
   * POST /
   * Create file audit log (manual logging)
   */
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create file audit log entry (manual logging)',
        tags: ['File Audit'],
        body: CreateFileAuditLogSchema,
        response: {
          201: CommonSchemas.SuccessIdResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'create'),
      ],
    },
    controller.create.bind(controller),
  );

  /**
   * DELETE /:id
   * Delete single file audit log
   */
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete single file audit log',
        tags: ['File Audit'],
        params: IdParamSchema,
        response: {
          200: CommonSchemas.SuccessDeleteResponse,
          404: CommonSchemas.ApiErrorResponse,
        },
      },
      preHandler: [
        fastify.verifyJWT,
        fastify.verifyPermission('file-audit', 'delete'),
      ],
    },
    controller.delete.bind(controller),
  );
}
