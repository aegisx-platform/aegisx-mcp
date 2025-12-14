import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import { Redis } from 'ioredis';
import { LoginAttemptsService } from '../../audit/login-attempts';

/**
 * Account Lockout Service
 *
 * Purpose: Prevent brute force attacks by tracking failed login attempts
 * and temporarily locking accounts after too many failures.
 *
 * Features:
 * - Track failed login attempts in Redis (fast) and PostgreSQL (persistent)
 * - Lock account after 5 failed attempts within 15 minutes
 * - Auto-unlock after lockout duration (15 minutes)
 * - Log all attempts to database using LoginAttemptsService for comprehensive audit
 * - Support both email and username login methods
 * - Integration with comprehensive audit system for statistics, export, and security monitoring
 */

export interface LoginAttemptRecord {
  id?: string;
  user_id?: string | null;
  email?: string | null;
  username?: string | null;
  ip_address: string;
  user_agent?: string | null;
  success: boolean;
  failure_reason?: string | null;
  created_at?: Date;
}

export interface LockoutStatus {
  isLocked: boolean;
  lockoutEndsAt?: Date;
  attemptsRemaining: number;
  totalAttempts: number;
}

export class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly TRACKING_WINDOW_MINUTES = 15;

  private readonly REDIS_KEY_PREFIX = 'auth:lockout:';
  private readonly REDIS_ATTEMPT_KEY_PREFIX = 'auth:attempts:';

  private readonly loginAttemptsService: LoginAttemptsService;

  constructor(
    private readonly fastify: FastifyInstance,
    private readonly db: Knex,
    private readonly redis: Redis,
  ) {
    this.loginAttemptsService = new LoginAttemptsService(db);
  }

  /**
   * Check if an account is currently locked
   */
  async isAccountLocked(identifier: string): Promise<LockoutStatus> {
    // identifier can be email or username
    const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;
    const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;

    // Check Redis for lockout status
    const lockoutData = await this.redis.get(redisKey);

    if (lockoutData) {
      const { lockedUntil } = JSON.parse(lockoutData);
      const lockoutEndsAt = new Date(lockedUntil);

      if (lockoutEndsAt > new Date()) {
        // Still locked
        const attemptCount = await this.getAttemptCount(identifier);
        return {
          isLocked: true,
          lockoutEndsAt,
          attemptsRemaining: 0,
          totalAttempts: attemptCount,
        };
      } else {
        // Lockout expired, clean up
        await this.redis.del(redisKey);
        await this.redis.del(attemptKey);
      }
    }

    // Not locked, check attempt count
    const attemptCount = await this.getAttemptCount(identifier);
    const attemptsRemaining = Math.max(0, this.MAX_ATTEMPTS - attemptCount);

    return {
      isLocked: false,
      attemptsRemaining,
      totalAttempts: attemptCount,
    };
  }

  /**
   * Record a login attempt (success or failure)
   *
   * Performance Notes:
   * - Database audit logging: Fire-and-forget (doesn't block)
   * - Redis counter clearing: Fire-and-forget (doesn't block on success)
   * - Redis failed attempt tracking: Synchronous (security-critical)
   * - Account locking: Synchronous (security-critical)
   *
   * This design ensures successful logins are fast while maintaining
   * security for failed attempts and account lockouts.
   */
  async recordAttempt(
    identifier: string,
    params: {
      userId?: string | null;
      email?: string | null;
      username?: string | null;
      ipAddress: string;
      userAgent?: string | null;
      success: boolean;
      failureReason?: string | null;
    },
  ): Promise<void> {
    const {
      userId = null,
      email = null,
      username = null,
      ipAddress,
      userAgent = null,
      success,
      failureReason = null,
    } = params;

    // Log to database (async, fire-and-forget - doesn't block request)
    this.logAttemptToDatabase({
      user_id: userId,
      email,
      username,
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
      failure_reason: failureReason,
    }).catch((error) => {
      this.fastify.log.error({
        msg: 'Failed to log login attempt to database',
        error,
        identifier,
      });
    });

    if (success) {
      // Successful login - clear attempts asynchronously (fire-and-forget)
      // This doesn't block successful login response
      this.clearAttempts(identifier).catch((error) => {
        this.fastify.log.error({
          msg: 'Failed to clear login attempts from Redis',
          error,
          identifier,
        });
      });
      return;
    }

    // Failed attempt - increment counter (MUST await - security critical)
    await this.incrementFailedAttempts(identifier);

    // Check if should lock account (MUST await - security critical)
    const attemptCount = await this.getAttemptCount(identifier);

    if (attemptCount >= this.MAX_ATTEMPTS) {
      await this.lockAccount(identifier);
    }
  }

  /**
   * Get current failed attempt count from Redis
   */
  private async getAttemptCount(identifier: string): Promise<number> {
    const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;
    const count = await this.redis.get(attemptKey);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Increment failed attempt counter in Redis
   */
  private async incrementFailedAttempts(identifier: string): Promise<void> {
    const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;
    const windowSeconds = this.TRACKING_WINDOW_MINUTES * 60;

    await this.redis
      .multi()
      .incr(attemptKey)
      .expire(attemptKey, windowSeconds)
      .exec();
  }

  /**
   * Lock account in Redis
   */
  private async lockAccount(identifier: string): Promise<void> {
    const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;
    const lockoutDurationSeconds = this.LOCKOUT_DURATION_MINUTES * 60;
    const lockedUntil = new Date(Date.now() + lockoutDurationSeconds * 1000);

    const lockoutData = JSON.stringify({
      lockedAt: new Date().toISOString(),
      lockedUntil: lockedUntil.toISOString(),
      attempts: await this.getAttemptCount(identifier),
    });

    await this.redis.setex(redisKey, lockoutDurationSeconds, lockoutData);

    this.fastify.log.warn({
      msg: 'Account locked due to too many failed login attempts',
      identifier,
      lockedUntil,
      attempts: await this.getAttemptCount(identifier),
    });
  }

  /**
   * Clear all failed attempts (on successful login)
   */
  private async clearAttempts(identifier: string): Promise<void> {
    const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;
    const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;

    await this.redis.del(attemptKey);
    await this.redis.del(redisKey);
  }

  /**
   * Manually unlock an account (admin function)
   */
  async unlockAccount(identifier: string): Promise<void> {
    const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;
    const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;

    await this.redis.del(attemptKey);
    await this.redis.del(redisKey);

    this.fastify.log.info({
      msg: 'Account manually unlocked',
      identifier,
    });
  }

  /**
   * Log attempt to PostgreSQL database using LoginAttemptsService
   *
   * This provides comprehensive audit logging with:
   * - Statistics and trend analysis
   * - Export capabilities
   * - Advanced security monitoring
   * - Brute force detection
   * - Proper repository/service pattern
   */
  private async logAttemptToDatabase(
    record: LoginAttemptRecord,
  ): Promise<void> {
    await this.loginAttemptsService.logLoginAttempt({
      userId: record.user_id || undefined,
      email: record.email || undefined,
      username: record.username || undefined,
      ipAddress: record.ip_address,
      userAgent: record.user_agent || undefined,
      success: record.success,
      failureReason: record.failure_reason || undefined,
    });
  }

  /**
   * Get login attempt history for a user (admin/security audit)
   * Delegates to LoginAttemptsService for comprehensive querying
   */
  async getAttemptHistory(
    identifier: string,
    options: {
      limit?: number;
      offset?: number;
      successOnly?: boolean;
      failedOnly?: boolean;
    } = {},
  ): Promise<LoginAttemptRecord[]> {
    const {
      limit = 50,
      offset = 0,
      successOnly = false,
      failedOnly = false,
    } = options;

    // Use LoginAttemptsService for querying
    const page = Math.floor(offset / limit) + 1;

    const result = await this.loginAttemptsService.findAll({
      email: identifier.includes('@') ? identifier : undefined,
      username: !identifier.includes('@') ? identifier : undefined,
      success: successOnly ? true : failedOnly ? false : undefined,
      page,
      limit,
    });

    // Convert to old interface format for backward compatibility
    return result.data.map((attempt) => ({
      id: attempt.id,
      user_id: attempt.userId || null,
      email: attempt.email || null,
      username: attempt.username || null,
      ip_address: attempt.ipAddress,
      user_agent: attempt.userAgent || null,
      success: attempt.success,
      failure_reason: (attempt.failureReason as string) || null,
      created_at: new Date(attempt.createdAt),
    }));
  }

  /**
   * Clean up old login attempts (run periodically, e.g., daily)
   * Delegates to LoginAttemptsService for cleanup operations
   */
  async cleanupOldAttempts(daysToKeep: number = 30): Promise<number> {
    const result = await this.loginAttemptsService.cleanup({
      olderThan: daysToKeep,
    });

    this.fastify.log.info({
      msg: 'Cleaned up old login attempts',
      deletedCount: result.deletedCount,
      daysToKeep,
    });

    return result.deletedCount;
  }

  /**
   * Get lockout statistics (for monitoring/dashboard)
   * Delegates to LoginAttemptsService for comprehensive statistics
   */
  async getLockoutStats(since?: Date): Promise<{
    totalAttempts: number;
    failedAttempts: number;
    successfulAttempts: number;
    uniqueIPs: number;
    currentlyLocked: number;
  }> {
    // Calculate days for LoginAttemptsService.getStats()
    const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h
    const days = Math.ceil(
      (Date.now() - sinceDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    // Get comprehensive statistics from LoginAttemptsService
    const stats = await this.loginAttemptsService.getStats(days);

    // Count currently locked accounts in Redis
    const lockoutKeys = await this.redis.keys(`${this.REDIS_KEY_PREFIX}*`);
    const currentlyLocked = lockoutKeys.length;

    return {
      totalAttempts: stats.total,
      failedAttempts: stats.failureCount,
      successfulAttempts: stats.successCount,
      uniqueIPs: stats.uniqueIPs,
      currentlyLocked,
    };
  }
}
