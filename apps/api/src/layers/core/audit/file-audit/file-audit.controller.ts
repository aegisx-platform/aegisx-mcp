import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseAuditController } from '../base/base.controller';
import { FileAuditService } from './file-audit.service';
import {
  FileAuditLog,
  FileAuditQuery,
  FileAuditStats,
  FileHistoryQuery,
  UserFileActivityQuery,
} from './file-audit.schemas';

/**
 * File Audit Controller
 *
 * HTTP request handlers for file audit log endpoints.
 *
 * Endpoints:
 * - GET    /                    - List all file audit logs
 * - GET    /:id                 - Get single file audit log
 * - POST   /                    - Create file audit log
 * - DELETE /:id                 - Delete file audit log
 * - GET    /stats               - Get statistics
 * - DELETE /cleanup             - Cleanup old logs
 * - GET    /export              - Export to CSV/JSON
 * - GET    /file/:fileId        - Get file history
 * - GET    /file/:fileId/summary - Get file summary
 * - GET    /file/:fileId/suspicious - Check suspicious activity
 * - GET    /user/:userId        - Get user file activity
 * - GET    /access-denied       - Get access denied logs
 * - GET    /failed              - Get failed operations
 */
export class FileAuditController extends BaseAuditController<
  FileAuditLog,
  FileAuditQuery,
  FileAuditStats,
  FileAuditService
> {
  constructor(service: FileAuditService) {
    super(service, 'File audit log');
  }

  /**
   * Get export filename
   */
  protected getExportFilename(): string {
    return 'file-audit-logs';
  }

  // ==================== FILE-SPECIFIC ENDPOINTS ====================

  /**
   * GET /file/:fileId
   * Get file access history
   */
  async getFileHistory(
    request: FastifyRequest<{
      Params: { fileId: string };
      Querystring: FileHistoryQuery;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { fileId } = request.params;
      const { limit = 50 } = request.query;

      const history = await this.service.getFileHistory(fileId, limit);

      return reply.success(history);
    } catch (error: any) {
      this.logError(request, 'getFileHistory', error, {
        fileId: request.params.fileId,
      });

      return reply.error('FETCH_ERROR', 'Failed to fetch file history', 500);
    }
  }

  /**
   * GET /file/:fileId/summary
   * Get file audit summary
   */
  async getFileSummary(
    request: FastifyRequest<{ Params: { fileId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { fileId } = request.params;
      const summary = await this.service.getFileSummary(fileId);

      return reply.success(summary);
    } catch (error: any) {
      if (error.message === 'FILE_NOT_FOUND') {
        return reply.notFound('File not found in audit logs');
      }

      this.logError(request, 'getFileSummary', error, {
        fileId: request.params.fileId,
      });

      return reply.error('FETCH_ERROR', 'Failed to fetch file summary', 500);
    }
  }

  /**
   * GET /file/:fileId/suspicious
   * Detect suspicious activity
   */
  async detectSuspicious(
    request: FastifyRequest<{
      Params: { fileId: string };
      Querystring: { timeWindow?: number };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { fileId } = request.params;
      const timeWindow = request.query.timeWindow || 60;

      const result = await this.service.detectSuspiciousActivity(
        fileId,
        timeWindow,
      );

      return reply.success(result);
    } catch (error: any) {
      this.logError(request, 'detectSuspicious', error, {
        fileId: request.params.fileId,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to detect suspicious activity',
        500,
      );
    }
  }

  /**
   * GET /file/:fileId/stats
   * Get file operation statistics
   */
  async getFileOperationStats(
    request: FastifyRequest<{ Params: { fileId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { fileId } = request.params;
      const stats = await this.service.getFileOperationStats(fileId);

      return reply.success(stats);
    } catch (error: any) {
      this.logError(request, 'getFileOperationStats', error, {
        fileId: request.params.fileId,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch file operation statistics',
        500,
      );
    }
  }

  /**
   * GET /user/:userId/files
   * Get files accessed by user
   */
  async getUserFiles(
    request: FastifyRequest<{
      Params: { userId: string };
      Querystring: UserFileActivityQuery;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const { startDate, endDate } = request.query;

      const files = await this.service.getFilesAccessedByUser(
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );

      return reply.success(files);
    } catch (error: any) {
      this.logError(request, 'getUserFiles', error, {
        userId: request.params.userId,
      });

      return reply.error('FETCH_ERROR', 'Failed to fetch user files', 500);
    }
  }

  /**
   * GET /access-denied
   * Get access denied logs
   */
  async getAccessDenied(
    request: FastifyRequest<{ Querystring: Partial<FileAuditQuery> }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const logs = await this.service.getAccessDeniedLogs(request.query);

      return reply.success(logs);
    } catch (error: any) {
      this.logError(request, 'getAccessDenied', error, {
        query: request.query,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch access denied logs',
        500,
      );
    }
  }

  /**
   * GET /failed
   * Get failed operations
   */
  async getFailedOperations(
    request: FastifyRequest<{ Querystring: Partial<FileAuditQuery> }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const logs = await this.service.getFailedOperations(request.query);

      return reply.success(logs);
    } catch (error: any) {
      this.logError(request, 'getFailedOperations', error, {
        query: request.query,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch failed operations',
        500,
      );
    }
  }
}
