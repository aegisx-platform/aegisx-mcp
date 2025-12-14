import { Knex } from 'knex';
import {
  BaseAuditRepository,
  BaseAuditLog,
  BaseAuditQuery,
  PaginationResult,
  BaseStats,
} from './base.repository';

/**
 * Cleanup Query Interface
 */
export interface CleanupQuery {
  olderThan: number; // Days
}

/**
 * Export Options
 */
export interface ExportOptions {
  format?: 'csv' | 'json';
  limit?: number;
  fields?: string[];
}

/**
 * BaseAuditService
 *
 * Abstract base class for all audit log services.
 * Provides common business logic layer on top of repositories.
 *
 * Features:
 * - CRUD operations with error handling
 * - Statistics aggregation
 * - Data export (CSV/JSON)
 * - Cleanup/retention
 * - Validation
 *
 * Usage:
 * ```typescript
 * class ErrorLogsService extends BaseAuditService<
 *   ErrorLog,
 *   ErrorQuery,
 *   ErrorStats,
 *   ErrorLogsRepository
 * > {
 *   constructor(knex: Knex) {
 *     super(knex, 'Error log');
 *   }
 *
 *   protected createRepository(knex: Knex): ErrorLogsRepository {
 *     return new ErrorLogsRepository(knex);
 *   }
 *
 *   protected getExportHeaders(): string[] {
 *     return ['ID', 'Timestamp', 'Level', 'Message', 'Type'];
 *   }
 *
 *   protected getExportRow(log: ErrorLog): any[] {
 *     return [log.id, log.timestamp, log.level, log.message, log.type];
 *   }
 * }
 * ```
 */
export abstract class BaseAuditService<
  T extends BaseAuditLog,
  Q extends BaseAuditQuery,
  S extends BaseStats,
  R extends BaseAuditRepository<T, Q>,
> {
  protected repository: R;

  constructor(
    protected readonly knex: Knex,
    protected readonly entityName: string = 'Record',
  ) {
    this.repository = this.createRepository(knex);
  }

  /**
   * Find all records with pagination
   */
  async findAll(query: Q): Promise<PaginationResult<T>> {
    const result = await this.repository.findAll(query);

    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Find single record by ID
   *
   * @throws Error if not found
   */
  async findById(id: string): Promise<T> {
    const record = await this.repository.findById(id);

    if (!record) {
      throw new Error(`${this.entityName.toUpperCase()}_NOT_FOUND`);
    }

    return record;
  }

  /**
   * Create new audit log entry
   */
  async create(data: Partial<T>): Promise<string> {
    // Validate before creating (can be overridden)
    await this.validateCreate(data);

    return this.repository.create(data);
  }

  /**
   * Delete single record
   *
   * @throws Error if not found
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new Error(`${this.entityName.toUpperCase()}_NOT_FOUND`);
    }
  }

  /**
   * Get statistics
   */
  async getStats(days: number = 7): Promise<S> {
    return this.repository.getStats(days) as Promise<S>;
  }

  /**
   * Cleanup old records
   */
  async cleanup(query: CleanupQuery): Promise<{ deletedCount: number }> {
    const { olderThan } = query;

    // Validate cleanup query
    if (olderThan <= 0) {
      throw new Error('INVALID_CLEANUP_DAYS');
    }

    const deletedCount = await this.repository.deleteOlderThan(olderThan);

    return { deletedCount };
  }

  /**
   * Export records to CSV
   */
  async exportToCSV(query?: Q): Promise<string> {
    // Get records with increased limit for export
    const exportQuery = {
      ...query,
      limit: this.getExportLimit(),
      page: 1,
    } as Q;

    const { data: records } = await this.repository.findAll(exportQuery);

    // Get headers
    const headers = this.getExportHeaders();

    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (
        stringValue.includes(',') ||
        stringValue.includes('\n') ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV rows
    const rows = records.map((record) => {
      const row = this.getExportRow(record);
      return row.map((value) => escapeCSV(value));
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n',
    );

    return csv;
  }

  /**
   * Export records to JSON
   */
  async exportToJSON(query?: Q): Promise<string> {
    // Get records with increased limit for export
    const exportQuery = {
      ...query,
      limit: this.getExportLimit(),
      page: 1,
    } as Q;

    const { data: records } = await this.repository.findAll(exportQuery);

    return JSON.stringify(records, null, 2);
  }

  /**
   * Export records (supports multiple formats)
   */
  async export(query?: Q, options?: ExportOptions): Promise<string> {
    const format = options?.format || 'csv';

    switch (format) {
      case 'csv':
        return this.exportToCSV(query);
      case 'json':
        return this.exportToJSON(query);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Count records
   */
  async count(query?: Partial<Q>): Promise<number> {
    return this.repository.count(query);
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  /**
   * Bulk create (batch insert)
   */
  async bulkCreate(data: Partial<T>[]): Promise<string[]> {
    const ids: string[] = [];

    // Validate all records first
    for (const record of data) {
      await this.validateCreate(record);
    }

    // Insert in batches (100 at a time to avoid memory issues)
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      for (const record of batch) {
        const id = await this.repository.create(record);
        ids.push(id);
      }
    }

    return ids;
  }

  /**
   * Get recent records
   */
  async getRecent(
    limit: number = 10,
    userId?: string,
  ): Promise<PaginationResult<T>> {
    const query = {
      page: 1,
      limit,
      userId,
    } as Q;

    return this.findAll(query);
  }

  /**
   * Get records by user
   */
  async getByUser(
    userId: string,
    query?: Partial<Q>,
  ): Promise<PaginationResult<T>> {
    const finalQuery = {
      ...query,
      userId,
      page: query?.page || 1,
      limit: query?.limit || 10,
    } as Q;

    return this.findAll(finalQuery);
  }

  /**
   * Get records by date range
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    query?: Partial<Q>,
  ): Promise<PaginationResult<T>> {
    const finalQuery = {
      ...query,
      startDate,
      endDate,
      page: query?.page || 1,
      limit: query?.limit || 10,
    } as Q;

    return this.findAll(finalQuery);
  }

  // ==================== ABSTRACT METHODS ====================
  // These must be implemented by child classes

  /**
   * Create repository instance
   *
   * Example:
   * ```typescript
   * protected createRepository(knex: Knex): ErrorLogsRepository {
   *   return new ErrorLogsRepository(knex);
   * }
   * ```
   */
  protected abstract createRepository(knex: Knex): R;

  /**
   * Get CSV export headers
   *
   * Example:
   * ```typescript
   * protected getExportHeaders(): string[] {
   *   return ['ID', 'Timestamp', 'Level', 'Message'];
   * }
   * ```
   */
  protected abstract getExportHeaders(): string[];

  /**
   * Get CSV export row
   *
   * Example:
   * ```typescript
   * protected getExportRow(log: ErrorLog): any[] {
   *   return [log.id, log.timestamp, log.level, log.message];
   * }
   * ```
   */
  protected abstract getExportRow(record: T): any[];

  // ==================== OPTIONAL OVERRIDES ====================
  // These can be overridden for custom behavior

  /**
   * Validate data before create
   *
   * Override this to add validation logic.
   *
   * Example:
   * ```typescript
   * protected async validateCreate(data: Partial<ErrorLog>): Promise<void> {
   *   if (!data.message) {
   *     throw new Error('Message is required');
   *   }
   *   if (data.level && !['error', 'warn', 'info'].includes(data.level)) {
   *     throw new Error('Invalid level');
   *   }
   * }
   * ```
   */
  protected async validateCreate(_data: Partial<T>): Promise<void> {
    // Default: no validation
    // Override in child class for custom validation
  }

  /**
   * Get export limit
   *
   * Override to customize max records to export.
   *
   * Default: 10,000 records
   */
  protected getExportLimit(): number {
    return 10000;
  }

  /**
   * Transform record before export
   *
   * Override to customize export data transformation.
   */
  protected transformForExport(record: T): T {
    return record;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Format date for export
   */
  protected formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  }

  /**
   * Format timestamp for export (without timezone)
   */
  protected formatTimestamp(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().replace('T', ' ').replace('Z', '');
  }

  /**
   * Truncate long strings for export
   */
  protected truncate(
    str: string | null | undefined,
    maxLength: number = 100,
  ): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }

  /**
   * Get environment info
   */
  protected getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Log audit operation
   *
   * Can be overridden to integrate with logging system
   */
  protected logOperation(
    operation: string,
    details?: Record<string, any>,
  ): void {
    // Default: console log in development only
    if (this.getEnvironment() === 'development') {
      console.log(`[${this.entityName} Audit] ${operation}`, details || '');
    }
  }
}
