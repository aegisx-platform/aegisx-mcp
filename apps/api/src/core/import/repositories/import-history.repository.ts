/**
 * Import History Repository
 * Database persistence layer for import job tracking and audit trail
 *
 * Replaces in-memory Map storage with database-backed job management
 * Part of Fix #3: In-Memory Storage migration
 *
 * Features:
 * - Database-persistent job storage
 * - Real-time progress updates
 * - Audit trail with user context
 * - Rollback tracking
 * - Historical analytics
 */

import { Knex } from 'knex';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { ImportJobStatus } from '../types/import-service.types';

/**
 * Import history database record
 * Matches import_history table structure
 */
export interface ImportHistory {
  id?: number;
  job_id: string;
  session_id: string | null;
  module_name: string;
  status: string; // 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'
  total_rows: number | null;
  imported_rows: number;
  error_rows: number;
  warning_count: number;
  started_at: Date | null;
  completed_at: Date | null;
  duration_ms: number | null;
  error_message: string | null;
  error_details: any | null; // JSONB
  can_rollback: boolean;
  batch_id?: string | null; // Unique batch identifier for precise rollback (Fix #4)
  rolled_back_at: Date | null;
  rolled_back_by: string | null;
  imported_by: string;
  imported_by_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Data for creating a new import history record
 */
export interface CreateImportHistoryData {
  job_id: string;
  session_id?: string | null;
  module_name: string;
  status: string;
  total_rows?: number | null;
  imported_rows?: number;
  error_rows?: number;
  warning_count?: number;
  started_at?: Date | null;
  can_rollback?: boolean;
  batch_id?: string | null; // Unique batch identifier for precise rollback (Fix #4)
  imported_by: string;
  imported_by_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  file_name?: string | null;
  file_size_bytes?: number | null;
}

/**
 * Import History Repository
 * Manages database operations for import job tracking
 */
export class ImportHistoryRepository extends BaseRepository<ImportHistory> {
  constructor(db: Knex) {
    super(db, 'import_history', [], [], {
      hasCreatedAt: true,
      hasUpdatedAt: true,
      hasCreatedBy: false,
    });
  }

  // Override base methods not needed for this repository
  transformToEntity?(dbRow: any): ImportHistory {
    return dbRow;
  }

  transformToDb?(dto: any): any {
    return dto;
  }

  getJoinQuery?(): any {
    return this.knex(this.tableName);
  }

  /**
   * Find import history record by job ID
   *
   * @param jobId - Job ID
   * @returns Import history record or null
   */
  async findByJobId(jobId: string): Promise<ImportHistory | null> {
    const record = await this.knex(this.tableName)
      .where({ job_id: jobId })
      .first<ImportHistory>();

    return record || null;
  }

  /**
   * Update import history record by job ID
   * Used for updating progress and status during import execution
   *
   * @param jobId - Job ID
   * @param data - Partial data to update
   */
  async updateByJobId(
    jobId: string,
    data: Partial<ImportHistory>,
  ): Promise<void> {
    await this.knex(this.tableName)
      .where({ job_id: jobId })
      .update({
        ...data,
        updated_at: new Date(),
      });
  }

  /**
   * Get recent import history
   * Sorted by most recent first
   *
   * @param limit - Maximum number of records to return
   * @returns Array of import history records
   */
  async getRecentImports(limit: number = 10): Promise<ImportHistory[]> {
    return this.knex(this.tableName).orderBy('created_at', 'desc').limit(limit);
  }

  /**
   * Get import history for a specific module
   *
   * @param moduleName - Module name
   * @param limit - Maximum number of records to return
   * @returns Array of import history records
   */
  async getImportsByModule(
    moduleName: string,
    limit: number = 10,
  ): Promise<ImportHistory[]> {
    return this.knex(this.tableName)
      .where({ module_name: moduleName })
      .orderBy('started_at', 'desc')
      .limit(limit);
  }

  /**
   * Get import history for a specific user
   *
   * @param userId - User ID
   * @param limit - Maximum number of records to return
   * @returns Array of import history records
   */
  async getImportsByUser(
    userId: string,
    limit: number = 10,
  ): Promise<ImportHistory[]> {
    return this.knex(this.tableName)
      .where({ imported_by: userId })
      .orderBy('started_at', 'desc')
      .limit(limit);
  }

  /**
   * Get imports that can be rolled back
   *
   * @param limit - Maximum number of records to return
   * @returns Array of rollback-eligible import history records
   */
  async getRollbackEligibleImports(
    limit: number = 10,
  ): Promise<ImportHistory[]> {
    return this.knex(this.tableName)
      .where({ can_rollback: true })
      .whereNull('rolled_back_at')
      .whereIn('status', ['completed', 'failed'])
      .orderBy('started_at', 'desc')
      .limit(limit);
  }

  /**
   * Get imports by status
   *
   * @param status - Import status
   * @param limit - Maximum number of records to return
   * @returns Array of import history records
   */
  async getImportsByStatus(
    status: string,
    limit: number = 10,
  ): Promise<ImportHistory[]> {
    return this.knex(this.tableName)
      .where({ status })
      .orderBy('started_at', 'desc')
      .limit(limit);
  }

  /**
   * Get running imports (for monitoring)
   *
   * @returns Array of currently running import jobs
   */
  async getRunningImports(): Promise<ImportHistory[]> {
    return this.knex(this.tableName)
      .where({ status: 'running' })
      .orderBy('started_at', 'asc');
  }

  /**
   * Get failed imports (for troubleshooting)
   *
   * @param limit - Maximum number of records to return
   * @returns Array of failed import jobs
   */
  async getFailedImports(limit: number = 10): Promise<ImportHistory[]> {
    return this.knex(this.tableName)
      .where({ status: 'failed' })
      .orderBy('started_at', 'desc')
      .limit(limit);
  }

  /**
   * Get import statistics for a module
   *
   * @param moduleName - Module name
   * @returns Statistics object
   */
  async getModuleStats(moduleName: string): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalRowsImported: number;
    totalRowsFailed: number;
    averageDuration: number | null;
  }> {
    const result = await this.knex(this.tableName)
      .where({ module_name: moduleName })
      .select(
        this.knex.raw('COUNT(*) as total_imports'),
        this.knex.raw(
          "COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_imports",
        ),
        this.knex.raw(
          "COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_imports",
        ),
        this.knex.raw('SUM(imported_rows) as total_rows_imported'),
        this.knex.raw('SUM(error_rows) as total_rows_failed'),
        this.knex.raw('AVG(duration_ms) as average_duration'),
      )
      .first<any>();

    const stats = result || {};

    return {
      totalImports: parseInt(stats.total_imports || '0', 10),
      successfulImports: parseInt(stats.successful_imports || '0', 10),
      failedImports: parseInt(stats.failed_imports || '0', 10),
      totalRowsImported: parseInt(stats.total_rows_imported || '0', 10),
      totalRowsFailed: parseInt(stats.total_rows_failed || '0', 10),
      averageDuration: stats.average_duration
        ? parseFloat(stats.average_duration)
        : null,
    };
  }

  /**
   * Check if a job exists
   *
   * @param jobId - Job ID
   * @returns true if job exists
   */
  async jobExists(jobId: string): Promise<boolean> {
    const count = await this.knex(this.tableName)
      .where({ job_id: jobId })
      .count('* as count')
      .first();

    return (count?.count as number) > 0;
  }

  /**
   * Mark a job as rolled back
   *
   * @param jobId - Job ID
   * @param rolledBackBy - User ID who performed rollback
   */
  async markAsRolledBack(jobId: string, rolledBackBy: string): Promise<void> {
    await this.knex(this.tableName).where({ job_id: jobId }).update({
      status: 'rolled_back',
      rolled_back_at: new Date(),
      rolled_back_by: rolledBackBy,
      updated_at: new Date(),
    });
  }

  /**
   * Delete old import history records (for cleanup/archival)
   *
   * @param olderThanDays - Delete records older than this many days
   * @returns Number of deleted records
   */
  async deleteOldRecords(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return this.knex(this.tableName)
      .where('created_at', '<', cutoffDate)
      .delete();
  }
}
