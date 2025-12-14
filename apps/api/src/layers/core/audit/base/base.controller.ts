import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseAuditService, CleanupQuery, ExportOptions } from './base.service';
import {
  BaseAuditLog,
  BaseAuditQuery,
  PaginationResult,
  BaseStats,
} from './base.repository';
import type { IdParam, ExportQuery } from './base.schemas';

/**
 * Stats Query Interface
 */
export interface StatsQuery {
  days?: number;
}

/**
 * BaseAuditController
 *
 * Abstract base class for all audit log controllers.
 * Provides common REST endpoint handlers.
 *
 * Features:
 * - CRUD endpoints with error handling
 * - Pagination responses
 * - Statistics endpoints
 * - Export endpoints (CSV/JSON)
 * - Cleanup endpoints
 * - Standardized error responses
 *
 * Usage:
 * ```typescript
 * class ErrorLogsController extends BaseAuditController<
 *   ErrorLog,
 *   ErrorQuery,
 *   ErrorStats,
 *   ErrorLogsService
 * > {
 *   constructor(service: ErrorLogsService) {
 *     super(service, 'Error log');
 *   }
 *
 *   protected getExportFilename(): string {
 *     return 'error-logs';
 *   }
 * }
 * ```
 */
export abstract class BaseAuditController<
  T extends BaseAuditLog,
  Q extends BaseAuditQuery,
  S extends BaseStats,
  SVC extends BaseAuditService<T, Q, S, any>,
> {
  constructor(
    protected readonly service: SVC,
    protected readonly entityName: string = 'Record',
  ) {}

  /**
   * GET /
   * List all records with pagination
   */
  async findAll(
    request: FastifyRequest<{ Querystring: Q }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const result = await this.service.findAll(request.query as Q);

      // Return paginated response
      return reply.send({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      });
    } catch (error: any) {
      this.logError(request, 'findAll', error, { query: request.query });

      return reply.error(
        'FETCH_ERROR',
        `Failed to fetch ${this.entityName.toLowerCase()}s`,
        500,
      );
    }
  }

  /**
   * GET /:id
   * Get single record by ID
   */
  async findById(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const record = await this.service.findById(request.params.id);

      return reply.success(record);
    } catch (error: any) {
      if (this.isNotFoundError(error)) {
        return reply.notFound(`${this.entityName} not found`);
      }

      this.logError(request, 'findById', error, { id: request.params.id });

      return reply.error(
        'FETCH_ERROR',
        `Failed to fetch ${this.entityName.toLowerCase()}`,
        500,
      );
    }
  }

  /**
   * POST /
   * Create new record
   */
  async create(
    request: FastifyRequest<{ Body: Partial<T> }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const id = await this.service.create(request.body as Partial<T>);

      return reply
        .code(201)
        .success({ id, message: `${this.entityName} created successfully` });
    } catch (error: any) {
      this.logError(request, 'create', error, { body: request.body });

      return reply.error(
        'CREATE_ERROR',
        `Failed to create ${this.entityName.toLowerCase()}`,
        500,
      );
    }
  }

  /**
   * DELETE /:id
   * Delete single record
   */
  async delete(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      await this.service.delete(request.params.id);

      return reply.success({
        message: `${this.entityName} deleted successfully`,
      });
    } catch (error: any) {
      if (this.isNotFoundError(error)) {
        return reply.notFound(`${this.entityName} not found`);
      }

      this.logError(request, 'delete', error, { id: request.params.id });

      return reply.error(
        'DELETE_ERROR',
        `Failed to delete ${this.entityName.toLowerCase()}`,
        500,
      );
    }
  }

  /**
   * GET /stats
   * Get statistics
   */
  async getStats(
    request: FastifyRequest<{ Querystring: StatsQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const days = request.query.days || 7;
      const stats = await this.service.getStats(days);

      return reply.success(stats);
    } catch (error: any) {
      this.logError(request, 'getStats', error);

      return reply.error(
        'FETCH_ERROR',
        `Failed to fetch ${this.entityName.toLowerCase()} statistics`,
        500,
      );
    }
  }

  /**
   * DELETE /cleanup
   * Cleanup old records
   */
  async cleanup(
    request: FastifyRequest<{ Querystring: CleanupQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const result = await this.service.cleanup(request.query);

      return reply.success(result);
    } catch (error: any) {
      if (error.message === 'INVALID_CLEANUP_DAYS') {
        return reply.badRequest('Invalid cleanup days parameter');
      }

      this.logError(request, 'cleanup', error, { query: request.query });

      return reply.error(
        'CLEANUP_ERROR',
        `Failed to cleanup old ${this.entityName.toLowerCase()}s`,
        500,
      );
    }
  }

  /**
   * GET /export
   * Export records to CSV or JSON
   */
  async export(
    request: FastifyRequest<{ Querystring: ExportQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const format = request.query.format || 'csv';
      const exportData = await this.service.export(request.query as Q, {
        format,
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFilename = this.getExportFilename();
      const filename = `${baseFilename}-${timestamp}.${format}`;

      // Set appropriate headers based on format
      if (format === 'csv') {
        reply.header('Content-Type', 'text/csv; charset=utf-8');
      } else if (format === 'json') {
        reply.header('Content-Type', 'application/json; charset=utf-8');
      }

      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      return reply.send(exportData);
    } catch (error: any) {
      this.logError(request, 'export', error, { query: request.query });

      return reply.error(
        'EXPORT_ERROR',
        `Failed to export ${this.entityName.toLowerCase()}s`,
        500,
      );
    }
  }

  /**
   * GET /count
   * Count records
   */
  async count(
    request: FastifyRequest<{ Querystring: Partial<Q> }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const count = await this.service.count(request.query as Partial<Q>);

      return reply.success({ count });
    } catch (error: any) {
      this.logError(request, 'count', error, { query: request.query });

      return reply.error(
        'FETCH_ERROR',
        `Failed to count ${this.entityName.toLowerCase()}s`,
        500,
      );
    }
  }

  /**
   * GET /recent
   * Get recent records
   */
  async getRecent(
    request: FastifyRequest<{
      Querystring: { limit?: number; userId?: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const limit = request.query.limit || 10;
      const userId = request.query.userId;
      const result = await this.service.getRecent(limit, userId);

      return reply.success(result.data);
    } catch (error: any) {
      this.logError(request, 'getRecent', error, { query: request.query });

      return reply.error(
        'FETCH_ERROR',
        `Failed to fetch recent ${this.entityName.toLowerCase()}s`,
        500,
      );
    }
  }

  /**
   * GET /user/:userId
   * Get records by user
   */
  async getByUser(
    request: FastifyRequest<{
      Params: { userId: string };
      Querystring: Partial<Q>;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const userId = request.params.userId;
      const result = await this.service.getByUser(
        userId,
        request.query as Partial<Q>,
      );

      return reply.send({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      });
    } catch (error: any) {
      this.logError(request, 'getByUser', error, {
        userId: request.params.userId,
        query: request.query,
      });

      return reply.error(
        'FETCH_ERROR',
        `Failed to fetch user ${this.entityName.toLowerCase()}s`,
        500,
      );
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if error is a "not found" error
   */
  protected isNotFoundError(error: Error): boolean {
    return error.message.includes('NOT_FOUND');
  }

  /**
   * Log error with context
   */
  protected logError(
    request: FastifyRequest,
    operation: string,
    error: Error,
    context?: Record<string, any>,
  ): void {
    request.log.error(
      {
        error: error.message,
        stack: error.stack,
        operation,
        entityName: this.entityName,
        ...context,
      },
      `${this.entityName} ${operation} failed`,
    );
  }

  // ==================== ABSTRACT/OPTIONAL METHODS ====================

  /**
   * Get export filename (without timestamp and extension)
   *
   * Example:
   * ```typescript
   * protected getExportFilename(): string {
   *   return 'error-logs';
   * }
   * ```
   *
   * This will generate: error-logs-2024-11-02T10-30-45.csv
   */
  protected getExportFilename(): string {
    // Default: lowercase entity name with hyphens
    return this.entityName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Hook called before create
   *
   * Override this to add pre-create logic.
   *
   * Example:
   * ```typescript
   * protected async beforeCreate(
   *   request: FastifyRequest,
   *   data: Partial<ErrorLog>
   * ): Promise<Partial<ErrorLog>> {
   *   // Add server timestamp
   *   return {
   *     ...data,
   *     serverTimestamp: new Date(),
   *   };
   * }
   * ```
   */
  protected async beforeCreate(
    _request: FastifyRequest,
    data: Partial<T>,
  ): Promise<Partial<T>> {
    return data;
  }

  /**
   * Hook called after create
   *
   * Override this to add post-create logic.
   *
   * Example:
   * ```typescript
   * protected async afterCreate(
   *   request: FastifyRequest,
   *   id: string
   * ): Promise<void> {
   *   // Emit event
   *   await this.eventService.emit('error-log-created', { id });
   * }
   * ```
   */
  protected async afterCreate(
    _request: FastifyRequest,
    _id: string,
  ): Promise<void> {
    // Default: no action
  }

  /**
   * Hook called before delete
   *
   * Override this to add pre-delete logic.
   *
   * Example:
   * ```typescript
   * protected async beforeDelete(
   *   request: FastifyRequest,
   *   id: string
   * ): Promise<void> {
   *   // Check if user has permission
   *   if (!request.user.isAdmin) {
   *     throw new Error('PERMISSION_DENIED');
   *   }
   * }
   * ```
   */
  protected async beforeDelete(
    _request: FastifyRequest,
    _id: string,
  ): Promise<void> {
    // Default: no action
  }

  /**
   * Hook called after delete
   *
   * Override this to add post-delete logic.
   *
   * Example:
   * ```typescript
   * protected async afterDelete(
   *   request: FastifyRequest,
   *   id: string
   * ): Promise<void> {
   *   // Emit event
   *   await this.eventService.emit('error-log-deleted', { id });
   * }
   * ```
   */
  protected async afterDelete(
    _request: FastifyRequest,
    _id: string,
  ): Promise<void> {
    // Default: no action
  }

  /**
   * Transform query before processing
   *
   * Override this to modify query parameters.
   *
   * Example:
   * ```typescript
   * protected transformQuery(query: ErrorQuery): ErrorQuery {
   *   // Default to last 7 days if no date range
   *   if (!query.startDate) {
   *     query.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
   *   }
   *   return query;
   * }
   * ```
   */
  protected transformQuery(query: Q): Q {
    return query;
  }

  /**
   * Validate query parameters
   *
   * Override this to add custom query validation.
   *
   * Example:
   * ```typescript
   * protected validateQuery(query: ErrorQuery): void {
   *   if (query.page && query.page < 1) {
   *     throw new Error('Page must be >= 1');
   *   }
   *   if (query.limit && (query.limit < 1 || query.limit > 100)) {
   *     throw new Error('Limit must be between 1 and 100');
   *   }
   * }
   * ```
   */
  protected validateQuery(_query: Q): void {
    // Default: no validation
  }
}
