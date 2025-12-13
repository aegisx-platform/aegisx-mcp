/**
 * Session Cleanup Job
 * Automatically cleans up expired import sessions from the database
 *
 * Part of Fix #3: In-Memory Storage migration
 *
 * Features:
 * - Scheduled cleanup of expired sessions
 * - Prevents database bloat
 * - Configurable cleanup interval
 * - Logging for monitoring
 *
 * Usage:
 * ```typescript
 * import { scheduleSessionCleanup } from './cleanup-sessions.job';
 *
 * // Schedule cleanup to run every 30 minutes
 * scheduleSessionCleanup(db, logger);
 * ```
 */

import { Knex } from 'knex';
import { ImportSessionRepository } from '../repositories/import-session.repository';

/**
 * Logger interface
 */
interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Session Cleanup Job
 * Deletes expired import sessions from the database
 */
export class SessionCleanupJob {
  private repository: ImportSessionRepository;

  constructor(
    private db: Knex,
    private logger: Logger = console,
  ) {
    this.repository = new ImportSessionRepository(db);
  }

  /**
   * Execute cleanup job
   * Deletes all sessions that have expired
   *
   * @returns Number of sessions deleted
   */
  async run(): Promise<number> {
    try {
      this.logger.info('[SessionCleanup] Starting cleanup of expired sessions');

      const deletedCount = await this.repository.deleteExpiredSessions();

      if (deletedCount > 0) {
        this.logger.info(
          `[SessionCleanup] Deleted ${deletedCount} expired import sessions`,
        );
      } else {
        this.logger.info('[SessionCleanup] No expired sessions found');
      }

      return deletedCount;
    } catch (error) {
      this.logger.error('[SessionCleanup] Cleanup job failed:', error);
      throw error;
    }
  }

  /**
   * Get statistics about current sessions
   * Useful for monitoring and debugging
   *
   * @returns Session statistics
   */
  async getStats(): Promise<{
    activeCount: number;
    expiredCount: number;
  }> {
    try {
      const activeCount = await this.repository.getActiveSessionCount();
      const expiredCount = await this.repository.getExpiredSessionCount();

      return { activeCount, expiredCount };
    } catch (error) {
      this.logger.error('[SessionCleanup] Failed to get stats:', error);
      return { activeCount: 0, expiredCount: 0 };
    }
  }
}

/**
 * Schedule session cleanup to run periodically
 * Sets up an interval to automatically clean up expired sessions
 *
 * @param db - Knex database instance
 * @param logger - Logger instance
 * @param intervalMinutes - Cleanup interval in minutes (default: 30)
 * @returns Interval ID (can be used with clearInterval to stop)
 */
export function scheduleSessionCleanup(
  db: Knex,
  logger: Logger = console,
  intervalMinutes: number = 30,
): NodeJS.Timeout {
  const job = new SessionCleanupJob(db, logger);

  logger.info(
    `[SessionCleanup] Scheduled to run every ${intervalMinutes} minutes`,
  );

  // Run immediately on startup
  job.run().catch((error) => {
    logger.error('[SessionCleanup] Initial cleanup failed:', error);
  });

  // Schedule periodic cleanup
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    job.run().catch((error) => {
      logger.error('[SessionCleanup] Scheduled cleanup failed:', error);
    });
  }, intervalMs);

  return intervalId;
}

/**
 * Run cleanup once (for manual execution or testing)
 *
 * @param db - Knex database instance
 * @param logger - Logger instance
 * @returns Number of sessions deleted
 */
export async function runSessionCleanup(
  db: Knex,
  logger: Logger = console,
): Promise<number> {
  const job = new SessionCleanupJob(db, logger);
  return job.run();
}

/**
 * Get session statistics (for monitoring)
 *
 * @param db - Knex database instance
 * @param logger - Logger instance
 * @returns Session statistics
 */
export async function getSessionStats(
  db: Knex,
  logger: Logger = console,
): Promise<{ activeCount: number; expiredCount: number }> {
  const job = new SessionCleanupJob(db, logger);
  return job.getStats();
}
