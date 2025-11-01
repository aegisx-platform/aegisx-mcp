import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import { Redis } from 'ioredis';

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
 * - Log all attempts to database for security audit
 * - Support both email and username login methods
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

  constructor(
    private readonly fastify: FastifyInstance,
    private readonly db: Knex,
    private readonly redis: Redis,
  ) {}

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

    // Log to database (async, don't await)
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
      // Successful login - clear all failed attempts
      await this.clearAttempts(identifier);
      return;
    }

    // Failed attempt - increment counter
    await this.incrementFailedAttempts(identifier);

    // Check if should lock account
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
   * Log attempt to PostgreSQL database
   */
  private async logAttemptToDatabase(
    record: LoginAttemptRecord,
  ): Promise<void> {
    await this.db('login_attempts').insert({
      id: this.db.raw('gen_random_uuid()'),
      user_id: record.user_id,
      email: record.email,
      username: record.username,
      ip_address: record.ip_address,
      user_agent: record.user_agent,
      success: record.success,
      failure_reason: record.failure_reason,
      created_at: this.db.fn.now(),
    });
  }

  /**
   * Get login attempt history for a user (admin/security audit)
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

    let query = this.db('login_attempts')
      .where('email', identifier)
      .orWhere('username', identifier)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (successOnly) {
      query = query.where('success', true);
    } else if (failedOnly) {
      query = query.where('success', false);
    }

    return await query;
  }

  /**
   * Clean up old login attempts (run periodically, e.g., daily)
   */
  async cleanupOldAttempts(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await this.db('login_attempts')
      .where('created_at', '<', cutoffDate)
      .del();

    this.fastify.log.info({
      msg: 'Cleaned up old login attempts',
      deletedCount,
      daysToKeep,
    });

    return deletedCount;
  }

  /**
   * Get lockout statistics (for monitoring/dashboard)
   */
  async getLockoutStats(since?: Date): Promise<{
    totalAttempts: number;
    failedAttempts: number;
    successfulAttempts: number;
    uniqueIPs: number;
    currentlyLocked: number;
  }> {
    const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h

    const [stats] = (await this.db('login_attempts')
      .where('created_at', '>=', sinceDate)
      .select(
        this.db.raw('COUNT(*) as total_attempts'),
        this.db.raw(
          'COUNT(*) FILTER (WHERE success = false) as failed_attempts',
        ),
        this.db.raw(
          'COUNT(*) FILTER (WHERE success = true) as successful_attempts',
        ),
        this.db.raw('COUNT(DISTINCT ip_address) as unique_ips'),
      )) as any[];

    // Count currently locked accounts in Redis
    const lockoutKeys = await this.redis.keys(`${this.REDIS_KEY_PREFIX}*`);
    const currentlyLocked = lockoutKeys.length;

    return {
      totalAttempts: parseInt(stats.total_attempts, 10),
      failedAttempts: parseInt(stats.failed_attempts, 10),
      successfulAttempts: parseInt(stats.successful_attempts, 10),
      uniqueIPs: parseInt(stats.unique_ips, 10),
      currentlyLocked,
    };
  }
}
