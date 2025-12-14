import { Knex } from 'knex';

/**
 * Base Query Interface
 *
 * Common query parameters for all audit logs
 *
 * Note: Dates can be either Date objects or ISO 8601 strings to support
 * both TypeBox schemas (string) and runtime conversions (Date).
 */
export interface BaseAuditQuery {
  page?: number;
  limit?: number;
  userId?: string;
  startDate?: Date | string;
  endDate?: Date | string; // Support both string and Date
  search?: string;
}

/**
 * Base Audit Log Interface
 *
 * Common fields across all audit log types
 *
 * Note: timestamp and createdAt are strings (ISO 8601) to match TypeBox schemas.
 * TypeBox serializes dates as strings, and HTTP APIs return JSON with string dates.
 * Database repositories handle conversion between string and Date objects.
 */
export interface BaseAuditLog {
  id: string;
  userId?: string | null;
  timestamp: string; // ISO 8601 date-time string
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: string; // ISO 8601 date-time string
  [key: string]: any; // Allow additional fields
}

/**
 * Pagination Result
 */
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Base Statistics Interface
 */
export interface BaseStats {
  total: number;
  recent24h: number;
  [key: string]: any; // Allow additional stats
}

/**
 * Field Mapping Configuration
 *
 * Maps snake_case database fields to camelCase TypeScript fields
 */
export interface FieldMapping {
  database: string; // Database column name (snake_case)
  typescript: string; // TypeScript property name (camelCase)
}

/**
 * BaseAuditRepository
 *
 * Abstract base class for all audit log repositories.
 * Provides common CRUD operations and query patterns.
 *
 * Features:
 * - Pagination with filtering
 * - Date range queries
 * - Search functionality
 * - Statistics aggregation
 * - Cleanup/retention
 * - Automatic field mapping (snake_case ↔ camelCase)
 *
 * Usage:
 * ```typescript
 * class ErrorLogsRepository extends BaseAuditRepository<ErrorLog, ErrorQuery> {
 *   constructor(knex: Knex) {
 *     super(knex, 'error_logs', [
 *       { database: 'user_id', typescript: 'userId' },
 *       { database: 'session_id', typescript: 'sessionId' },
 *       // ... more mappings
 *     ]);
 *   }
 *
 *   protected getSelectFields(): string[] {
 *     return ['id', 'message', 'level', 'type', ...];
 *   }
 *
 *   protected applyCustomFilters(query: Knex.QueryBuilder, filters: ErrorQuery) {
 *     if (filters.level) {
 *       query.where('level', filters.level);
 *     }
 *     if (filters.type) {
 *       query.where('type', filters.type);
 *     }
 *   }
 *
 *   protected getSearchFields(): string[] {
 *     return ['message', 'stack', 'url'];
 *   }
 * }
 * ```
 */
export abstract class BaseAuditRepository<
  T extends BaseAuditLog,
  Q extends BaseAuditQuery,
> {
  constructor(
    protected readonly knex: Knex,
    protected readonly tableName: string,
    protected readonly fieldMappings: FieldMapping[] = [],
  ) {}

  /**
   * Find all records with pagination and filters
   */
  async findAll(query: Q): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, userId, startDate, endDate, search } = query;

    const offset = (page - 1) * limit;

    // Build base query
    let baseQuery = this.knex(this.tableName);

    // Apply common filters
    if (userId) {
      baseQuery = baseQuery.where('user_id', userId);
    }
    if (startDate) {
      baseQuery = baseQuery.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      baseQuery = baseQuery.where('timestamp', '<=', endDate);
    }
    if (search) {
      const searchFields = this.getSearchFields();
      if (searchFields.length > 0) {
        baseQuery = baseQuery.where((builder) => {
          searchFields.forEach((field, index) => {
            if (index === 0) {
              builder.where(field, 'ilike', `%${search}%`);
            } else {
              builder.orWhere(field, 'ilike', `%${search}%`);
            }
          });
        });
      }
    }

    // Apply custom filters (implemented by child classes)
    this.applyCustomFilters(baseQuery, query);

    // Get total count
    const countResult = await baseQuery.clone().count('* as count').first();
    const total = parseInt(countResult?.count as string) || 0;

    // Get paginated data
    const selectFields = this.getSelectFields();
    const data = await baseQuery
      .select(selectFields)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: data as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const selectFields = this.getSelectFields();
    const result = await this.knex(this.tableName)
      .select(selectFields)
      .where('id', id)
      .first();

    return (result as T) || null;
  }

  /**
   * Create new audit log entry
   */
  async create(data: Partial<T>): Promise<string> {
    // Convert camelCase to snake_case for database
    const dbData = this.mapToDatabase(data);

    const [result] = await this.knex(this.tableName)
      .insert(dbData)
      .returning('id');

    return result.id;
  }

  /**
   * Delete single record
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.knex(this.tableName).where('id', id).delete();
    return result > 0;
  }

  /**
   * Delete records older than specified days
   */
  async deleteOlderThan(days: number): Promise<number> {
    const result = await this.knex(this.tableName)
      .where(
        'created_at',
        '<',
        this.knex.raw(`NOW() - INTERVAL '${days} days'`),
      )
      .delete();

    return result;
  }

  /**
   * Get basic statistics
   */
  async getStats(days: number = 7): Promise<BaseStats> {
    // Total count
    const totalResult = await this.knex(this.tableName)
      .count('* as count')
      .first();
    const total = parseInt(totalResult?.count as string) || 0;

    // Recent count (last 24 hours)
    const recentResult = await this.knex(this.tableName)
      .count('* as count')
      .where('timestamp', '>=', this.knex.raw(`NOW() - INTERVAL '24 hours'`))
      .first();
    const recent24h = parseInt(recentResult?.count as string) || 0;

    // Additional stats from child classes
    const customStats = await this.getCustomStats(days);

    return {
      total,
      recent24h,
      ...customStats,
    };
  }

  /**
   * Count records matching query
   */
  async count(query?: Partial<Q>): Promise<number> {
    let baseQuery = this.knex(this.tableName);

    if (query) {
      if (query.userId) {
        baseQuery = baseQuery.where('user_id', query.userId);
      }
      if (query.startDate) {
        baseQuery = baseQuery.where('timestamp', '>=', query.startDate);
      }
      if (query.endDate) {
        baseQuery = baseQuery.where('timestamp', '<=', query.endDate);
      }
      this.applyCustomFilters(baseQuery, query as Q);
    }

    const result = await baseQuery.count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.knex(this.tableName)
      .select('id')
      .where('id', id)
      .first();
    return !!result;
  }

  // ==================== ABSTRACT METHODS ====================
  // These must be implemented by child classes

  /**
   * Get fields to select in queries
   *
   * Override this to specify which fields to return.
   * Use raw() for snake_case to camelCase mapping.
   *
   * Example:
   * ```typescript
   * return [
   *   'id',
   *   'message',
   *   this.knex.raw('user_id as "userId"'),
   *   this.knex.raw('created_at as "createdAt"'),
   * ];
   * ```
   */
  protected abstract getSelectFields(): any[];

  /**
   * Apply custom filters specific to the audit type
   *
   * Override this to add type-specific filtering.
   *
   * Example:
   * ```typescript
   * if (filters.level) {
   *   query.where('level', filters.level);
   * }
   * if (filters.type) {
   *   query.where('type', filters.type);
   * }
   * ```
   */
  protected abstract applyCustomFilters(
    query: Knex.QueryBuilder,
    filters: Q,
  ): void;

  /**
   * Get fields to search in
   *
   * Return array of field names to search.
   *
   * Example:
   * ```typescript
   * return ['message', 'stack', 'url'];
   * ```
   */
  protected abstract getSearchFields(): string[];

  // ==================== OPTIONAL OVERRIDES ====================
  // These can be overridden for custom behavior

  /**
   * Get custom statistics
   *
   * Override this to add type-specific statistics.
   *
   * Example:
   * ```typescript
   * const byLevel = await this.knex(this.tableName)
   *   .select('level')
   *   .count('* as count')
   *   .groupBy('level');
   *
   * return { byLevel };
   * ```
   */
  protected async getCustomStats(_days: number): Promise<Record<string, any>> {
    return {};
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map TypeScript object to database object (camelCase → snake_case)
   */
  protected mapToDatabase(data: Partial<T>): Record<string, any> {
    const result: Record<string, any> = {};

    // Map each field
    for (const [key, value] of Object.entries(data)) {
      // Find mapping for this field
      const mapping = this.fieldMappings.find((m) => m.typescript === key);

      if (mapping) {
        // Use mapped database field name
        result[mapping.database] = value;
      } else {
        // Check if it's a known field that doesn't need mapping
        const knownFields = [
          'id',
          'timestamp',
          'metadata',
          'created_at',
          'updated_at',
        ];
        if (knownFields.includes(key)) {
          result[key] = value;
        } else {
          // Convert camelCase to snake_case
          result[this.camelToSnake(key)] = value;
        }
      }
    }

    // Handle JSONB fields
    if (result.context && typeof result.context === 'object') {
      result.context = JSON.stringify(result.context);
    }
    if (result.metadata && typeof result.metadata === 'object') {
      result.metadata = JSON.stringify(result.metadata);
    }

    return result;
  }

  /**
   * Convert camelCase to snake_case
   */
  protected camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  protected snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Get date range for trending data
   */
  protected async getTrendData(
    days: number,
  ): Promise<Array<{ date: string; count: number }>> {
    const startDate = this.knex.raw(`NOW() - INTERVAL '${days} days'`);

    const results = await this.knex(this.tableName)
      .select(this.knex.raw(`DATE(timestamp) as date`))
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .groupBy(this.knex.raw('DATE(timestamp)'))
      .orderBy('date', 'asc');

    return results.map((row: any) => ({
      date: row.date,
      count: parseInt(row.count),
    }));
  }

  /**
   * Get top items by field
   */
  protected async getTopItems(
    field: string,
    limit: number = 10,
  ): Promise<Array<{ value: string; count: number }>> {
    const results = await this.knex(this.tableName)
      .select(field)
      .count('* as count')
      .groupBy(field)
      .orderBy('count', 'desc')
      .limit(limit);

    return results.map((row: any) => ({
      value: row[field],
      count: parseInt(row.count),
    }));
  }

  /**
   * Get distribution by field
   */
  protected async getDistribution(
    field: string,
  ): Promise<Record<string, number>> {
    const results = await this.knex(this.tableName)
      .select(field)
      .count('* as count')
      .groupBy(field);

    const distribution: Record<string, number> = {};
    results.forEach((row: any) => {
      distribution[row[field]] = parseInt(row.count);
    });

    return distribution;
  }
}
