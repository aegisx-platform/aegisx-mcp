import { Knex } from 'knex';
import { BaseAuditRepository, FieldMapping } from '../base/base.repository';
import {
  FileAuditLog,
  FileAuditQuery,
  FileAuditStats,
  FileAuditSummary,
} from './file-audit.schemas';

/**
 * File Audit Repository
 *
 * Manages file audit log data access using BaseAuditRepository.
 *
 * Features:
 * - Full CRUD operations
 * - File history tracking
 * - User file activity
 * - File access statistics
 * - Suspicious activity detection
 *
 * Usage:
 * ```typescript
 * const repository = new FileAuditRepository(knex);
 *
 * // Log file upload
 * await repository.create({
 *   fileId: file.id,
 *   userId: user.id,
 *   operation: 'upload',
 *   success: true,
 *   fileName: 'report.pdf',
 *   fileSize: 2048000,
 * });
 *
 * // Get file history
 * const history = await repository.getFileHistory(fileId, 50);
 *
 * // Get user file activity
 * const activity = await repository.getUserFileActivity(userId);
 * ```
 */
export class FileAuditRepository extends BaseAuditRepository<
  FileAuditLog,
  FileAuditQuery
> {
  /**
   * Field mappings for snake_case ↔ camelCase conversion
   */
  private static readonly FIELD_MAPPINGS: FieldMapping[] = [
    { database: 'file_id', typescript: 'fileId' },
    { database: 'user_id', typescript: 'userId' },
    { database: 'access_method', typescript: 'accessMethod' },
    { database: 'access_granted', typescript: 'accessGranted' },
    { database: 'denial_reason', typescript: 'denialReason' },
    { database: 'http_status', typescript: 'httpStatus' },
    { database: 'auth_method', typescript: 'authMethod' },
    { database: 'duration_ms', typescript: 'durationMs' },
    { database: 'ip_address', typescript: 'ipAddress' },
    { database: 'user_agent', typescript: 'userAgent' },
    { database: 'session_id', typescript: 'sessionId' },
    { database: 'file_name', typescript: 'fileName' },
    { database: 'file_size', typescript: 'fileSize' },
    { database: 'error_message', typescript: 'errorMessage' },
    { database: 'created_at', typescript: 'createdAt' },
  ];

  constructor(knex: Knex) {
    super(knex, 'file_audit_logs', FileAuditRepository.FIELD_MAPPINGS);
  }

  /**
   * Get fields to select in queries
   */
  protected getSelectFields(): any[] {
    return [
      'id',
      this.knex.raw('file_id as "fileId"'),
      this.knex.raw('user_id as "userId"'),
      'operation',
      this.knex.raw('access_method as "accessMethod"'),
      'timestamp',
      this.knex.raw('duration_ms as "durationMs"'),
      'success',
      this.knex.raw('error_message as "errorMessage"'),
      this.knex.raw('access_granted as "accessGranted"'),
      this.knex.raw('denial_reason as "denialReason"'),
      this.knex.raw('http_status as "httpStatus"'),
      this.knex.raw('auth_method as "authMethod"'),
      this.knex.raw('ip_address as "ipAddress"'),
      this.knex.raw('user_agent as "userAgent"'),
      'referer',
      this.knex.raw('session_id as "sessionId"'),
      this.knex.raw('file_name as "fileName"'),
      this.knex.raw('file_size as "fileSize"'),
      'category',
      'metadata',
      this.knex.raw('created_at as "createdAt"'),
    ];
  }

  /**
   * Apply custom filters specific to file audit logs
   */
  protected applyCustomFilters(
    query: Knex.QueryBuilder,
    filters: FileAuditQuery,
  ): void {
    if (filters.fileId) {
      query.where('file_id', filters.fileId);
    }
    if (filters.operation) {
      query.where('operation', filters.operation);
    }
    if (filters.success !== undefined) {
      const success =
        typeof filters.success === 'string'
          ? filters.success === 'true'
          : filters.success;
      query.where('success', success);
    }
    if (filters.accessGranted !== undefined) {
      const accessGranted =
        typeof filters.accessGranted === 'string'
          ? filters.accessGranted === 'true'
          : filters.accessGranted;
      query.where('access_granted', accessGranted);
    }
    if (filters.httpStatus) {
      query.where('http_status', filters.httpStatus);
    }
    if (filters.authMethod) {
      query.where('auth_method', filters.authMethod);
    }
    if (filters.accessMethod) {
      query.where('access_method', filters.accessMethod);
    }
    if (filters.category) {
      query.where('category', filters.category);
    }
  }

  /**
   * Get fields to search in
   */
  protected getSearchFields(): string[] {
    return ['file_name', 'error_message', 'denial_reason'];
  }

  /**
   * Get custom statistics for file audit logs
   */
  protected async getCustomStats(
    days: number,
  ): Promise<Partial<FileAuditStats>> {
    const startDate = this.knex.raw(`NOW() - INTERVAL '${days} days'`);

    // By operation
    const byOperationResults = await this.knex(this.tableName)
      .select('operation')
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .groupBy('operation');

    const byOperation: Record<string, number> = {};
    byOperationResults.forEach((row: any) => {
      byOperation[row.operation] = parseInt(row.count);
    });

    // By access method
    const byAccessMethodResults = await this.knex(this.tableName)
      .select('access_method')
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .whereNotNull('access_method')
      .groupBy('access_method');

    const byAccessMethod: Record<string, number> = {};
    byAccessMethodResults.forEach((row: any) => {
      byAccessMethod[row.access_method] = parseInt(row.count);
    });

    // By category
    const byCategoryResults = await this.knex(this.tableName)
      .select('category')
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .whereNotNull('category')
      .groupBy('category');

    const byCategory: Record<string, number> = {};
    byCategoryResults.forEach((row: any) => {
      byCategory[row.category] = parseInt(row.count);
    });

    // Success/failure
    const successResult = await this.knex(this.tableName)
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .where('success', true)
      .first();
    const successCount = parseInt(successResult?.count as string) || 0;

    const failureResult = await this.knex(this.tableName)
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .where('success', false)
      .first();
    const failureCount = parseInt(failureResult?.count as string) || 0;

    const total = successCount + failureCount;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    // Access granted/denied
    const accessGrantedResult = await this.knex(this.tableName)
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .where('access_granted', true)
      .first();
    const accessGrantedCount =
      parseInt(accessGrantedResult?.count as string) || 0;

    const accessDeniedResult = await this.knex(this.tableName)
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .where('access_granted', false)
      .first();
    const accessDeniedCount =
      parseInt(accessDeniedResult?.count as string) || 0;

    // Performance
    const perfResult = await this.knex(this.tableName)
      .avg('duration_ms as avg')
      .sum('file_size as total_bytes')
      .where('timestamp', '>=', startDate)
      .first();

    const averageDurationMs = parseFloat(perfResult?.avg as string) || 0;
    const totalBytesTransferred =
      parseInt(perfResult?.total_bytes as string) || 0;

    // Unique entities
    const uniqueFilesResult = await this.knex(this.tableName)
      .countDistinct('file_id as count')
      .where('timestamp', '>=', startDate)
      .first();
    const uniqueFiles = parseInt(uniqueFilesResult?.count as string) || 0;

    const uniqueUsersResult = await this.knex(this.tableName)
      .countDistinct('user_id as count')
      .where('timestamp', '>=', startDate)
      .whereNotNull('user_id')
      .first();
    const uniqueUsers = parseInt(uniqueUsersResult?.count as string) || 0;

    // Trend data
    const trend = await this.getTrendData(days);

    // Top files
    const topFiles = await this.getTopItems('file_name', 10);

    // Top users (by user_id)
    const topUsers = await this.knex(this.tableName)
      .select('user_id')
      .count('* as count')
      .where('timestamp', '>=', startDate)
      .whereNotNull('user_id')
      .groupBy('user_id')
      .orderBy('count', 'desc')
      .limit(10);

    const topUsersFormatted = topUsers.map((row: any) => ({
      value: row.user_id,
      count: parseInt(row.count),
    }));

    return {
      byOperation,
      byAccessMethod,
      byCategory,
      successCount,
      failureCount,
      successRate,
      accessGrantedCount,
      accessDeniedCount,
      averageDurationMs,
      totalBytesTransferred,
      uniqueFiles,
      uniqueUsers,
      trend,
      topFiles,
      topUsers: topUsersFormatted,
    };
  }

  // ==================== FILE-SPECIFIC METHODS ====================

  /**
   * Get file access history
   */
  async getFileHistory(
    fileId: string,
    limit: number = 50,
  ): Promise<FileAuditLog[]> {
    const selectFields = this.getSelectFields();
    const results = await this.knex(this.tableName)
      .select(selectFields)
      .where('file_id', fileId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    return results as FileAuditLog[];
  }

  /**
   * Get user file activity
   */
  async getUserFileActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<FileAuditLog[]> {
    const selectFields = this.getSelectFields();
    let query = this.knex(this.tableName)
      .select(selectFields)
      .where('user_id', userId);

    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }

    const results = await query.orderBy('timestamp', 'desc').limit(limit);

    return results as FileAuditLog[];
  }

  /**
   * Get file audit summary
   */
  async getFileSummary(fileId: string): Promise<FileAuditSummary | null> {
    // Get file info
    const fileInfo = await this.knex(this.tableName)
      .select('file_name')
      .where('file_id', fileId)
      .orderBy('timestamp', 'desc')
      .first();

    if (!fileInfo) {
      return null;
    }

    // Get statistics
    const stats = await this.knex(this.tableName)
      .count('* as total')
      .countDistinct('user_id as unique_users')
      .max('timestamp as last_accessed')
      .where('file_id', fileId)
      .first();

    // Get operation counts
    const operations = await this.knex(this.tableName)
      .select('operation')
      .count('* as count')
      .where('file_id', fileId)
      .groupBy('operation');

    const operationCounts: Record<string, number> = {};
    operations.forEach((row: any) => {
      operationCounts[row.operation] = parseInt(row.count);
    });

    // Get access denied count
    const accessDenied = await this.knex(this.tableName)
      .count('* as count')
      .where('file_id', fileId)
      .where('access_granted', false)
      .first();

    return {
      fileId,
      fileName: fileInfo.file_name || 'Unknown',
      totalOperations: parseInt(stats?.total as string) || 0,
      lastAccessed: stats?.last_accessed || new Date().toISOString(),
      uniqueUsers: parseInt(stats?.unique_users as string) || 0,
      uploads: operationCounts['upload'] || 0,
      downloads: operationCounts['download'] || 0,
      views: operationCounts['view'] || 0,
      updates: operationCounts['update'] || 0,
      deletions: operationCounts['delete'] || 0,
      accessDenied: parseInt(accessDenied?.count as string) || 0,
    };
  }

  /**
   * Detect suspicious file activity
   *
   * Identifies potentially suspicious patterns:
   * - High failure rates
   * - Multiple access denials
   * - Unusual access patterns
   */
  async detectSuspiciousActivity(
    fileId: string,
    timeWindowMinutes: number = 60,
  ): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    failureRate: number;
    accessDenialCount: number;
    operationCount: number;
  }> {
    const startDate = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const logs = await this.knex(this.tableName)
      .select('*')
      .where('file_id', fileId)
      .where('timestamp', '>=', startDate);

    const reasons: string[] = [];
    const failureCount = logs.filter((l) => !l.success).length;
    const failureRate = logs.length > 0 ? failureCount / logs.length : 0;

    // High failure rate (>30%)
    if (failureRate > 0.3 && logs.length > 5) {
      reasons.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
    }

    // Multiple access denials
    const accessDenialCount = logs.filter(
      (l) => l.access_granted === false,
    ).length;
    if (accessDenialCount > 5) {
      reasons.push(`Multiple access denials: ${accessDenialCount}`);
    }

    // Excessive operations (>50 in time window)
    if (logs.length > 50) {
      reasons.push(
        `Excessive operations: ${logs.length} in ${timeWindowMinutes} minutes`,
      );
    }

    // Multiple failed downloads
    const failedDownloads = logs.filter(
      (l) => l.operation === 'download' && !l.success,
    ).length;
    if (failedDownloads > 5) {
      reasons.push(`Multiple failed downloads: ${failedDownloads}`);
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      failureRate,
      accessDenialCount,
      operationCount: logs.length,
    };
  }
}
