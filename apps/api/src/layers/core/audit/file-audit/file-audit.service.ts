import { Knex } from 'knex';
import { BaseAuditService } from '../base/base.service';
import { FileAuditRepository } from './file-audit.repository';
import {
  FileAuditLog,
  FileAuditQuery,
  FileAuditStats,
  FileAuditSummary,
  CreateFileAuditLog,
} from './file-audit.schemas';

/**
 * File Audit Service
 *
 * Business logic layer for file audit logging.
 *
 * Features:
 * - Full CRUD operations with validation
 * - File history tracking
 * - User activity monitoring
 * - File access statistics
 * - Suspicious activity detection
 * - CSV/JSON export
 *
 * Usage:
 * ```typescript
 * const service = new FileAuditService(knex);
 *
 * // Log file operation
 * await service.logFileOperation({
 *   fileId: file.id,
 *   userId: user.id,
 *   operation: 'upload',
 *   success: true,
 *   fileName: 'report.pdf',
 *   fileSize: 2048000,
 * });
 *
 * // Get file history
 * const history = await service.getFileHistory(fileId);
 *
 * // Get file summary
 * const summary = await service.getFileSummary(fileId);
 * ```
 */
export class FileAuditService extends BaseAuditService<
  FileAuditLog,
  FileAuditQuery,
  FileAuditStats,
  FileAuditRepository
> {
  constructor(knex: Knex) {
    super(knex, 'File audit log');
  }

  /**
   * Create repository instance
   */
  protected createRepository(knex: Knex): FileAuditRepository {
    return new FileAuditRepository(knex);
  }

  /**
   * Get CSV export headers
   */
  protected getExportHeaders(): string[] {
    return [
      'ID',
      'Timestamp',
      'File ID',
      'File Name',
      'User ID',
      'Operation',
      'Access Method',
      'Success',
      'Access Granted',
      'HTTP Status',
      'Duration (ms)',
      'File Size',
      'Category',
      'IP Address',
      'Error Message',
    ];
  }

  /**
   * Get CSV export row
   */
  protected getExportRow(log: FileAuditLog): any[] {
    return [
      log.id,
      this.formatTimestamp(log.timestamp),
      log.fileId,
      log.fileName || '',
      log.userId || 'Anonymous',
      log.operation,
      log.accessMethod || '',
      log.success ? 'Yes' : 'No',
      log.accessGranted === true
        ? 'Yes'
        : log.accessGranted === false
          ? 'No'
          : '',
      log.httpStatus || '',
      log.durationMs || '',
      log.fileSize || '',
      log.category || '',
      log.ipAddress || '',
      this.truncate(log.errorMessage, 200),
    ];
  }

  /**
   * Validate data before create
   */
  protected async validateCreate(data: Partial<FileAuditLog>): Promise<void> {
    if (!data.fileId) {
      throw new Error('File ID is required');
    }
    if (!data.operation) {
      throw new Error('Operation is required');
    }
  }

  // ==================== FILE-SPECIFIC METHODS ====================

  /**
   * Log file operation
   *
   * Convenience method for logging file operations
   */
  async logFileOperation(data: CreateFileAuditLog): Promise<string> {
    return this.create({
      ...data,
      timestamp: new Date().toISOString(),
    } as Partial<FileAuditLog>);
  }

  /**
   * Get file access history
   */
  async getFileHistory(
    fileId: string,
    limit: number = 50,
  ): Promise<FileAuditLog[]> {
    return this.repository.getFileHistory(fileId, limit);
  }

  /**
   * Get user file activity
   */
  async getUserFileActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FileAuditLog[]> {
    return this.repository.getUserFileActivity(userId, startDate, endDate);
  }

  /**
   * Get file summary
   */
  async getFileSummary(fileId: string): Promise<FileAuditSummary> {
    const summary = await this.repository.getFileSummary(fileId);

    if (!summary) {
      throw new Error('FILE_NOT_FOUND');
    }

    return summary;
  }

  /**
   * Detect suspicious activity
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
    return this.repository.detectSuspiciousActivity(fileId, timeWindowMinutes);
  }

  /**
   * Get operation statistics by file
   */
  async getFileOperationStats(fileId: string): Promise<{
    total: number;
    byOperation: Record<string, number>;
    byAccessMethod: Record<string, number>;
    successRate: number;
  }> {
    const history = await this.getFileHistory(fileId, 1000);

    const byOperation: Record<string, number> = {};
    const byAccessMethod: Record<string, number> = {};
    let successCount = 0;

    history.forEach((log) => {
      // Count by operation
      const operation = log.operation as string;
      byOperation[operation] = (byOperation[operation] || 0) + 1;

      // Count by access method
      if (log.accessMethod) {
        const accessMethod = log.accessMethod as string;
        byAccessMethod[accessMethod] = (byAccessMethod[accessMethod] || 0) + 1;
      }

      // Count successes
      if (log.success) {
        successCount++;
      }
    });

    const total = history.length;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    return {
      total,
      byOperation,
      byAccessMethod,
      successRate,
    };
  }

  /**
   * Get files accessed by user
   */
  async getFilesAccessedByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<{ fileId: string; fileName: string; count: number }>> {
    const activity = await this.getUserFileActivity(userId, startDate, endDate);

    // Group by file
    const fileMap = new Map<
      string,
      { fileId: string; fileName: string; count: number }
    >();

    activity.forEach((log) => {
      const existing = fileMap.get(log.fileId);
      if (existing) {
        existing.count++;
      } else {
        fileMap.set(log.fileId, {
          fileId: log.fileId,
          fileName: log.fileName || 'Unknown',
          count: 1,
        });
      }
    });

    // Convert to array and sort by count
    return Array.from(fileMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Get access denied logs
   */
  async getAccessDeniedLogs(
    query?: Partial<FileAuditQuery>,
  ): Promise<FileAuditLog[]> {
    const finalQuery: FileAuditQuery = {
      ...query,
      accessGranted: false,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }

  /**
   * Get failed operations
   */
  async getFailedOperations(
    query?: Partial<FileAuditQuery>,
  ): Promise<FileAuditLog[]> {
    const finalQuery: FileAuditQuery = {
      ...query,
      success: false,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }
}
