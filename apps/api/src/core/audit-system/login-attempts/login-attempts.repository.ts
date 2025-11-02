import { Knex } from 'knex';
import { BaseAuditRepository, FieldMapping } from '../base/base.repository';
import {
  LoginAttempt,
  LoginAttemptsQuery,
  LoginAttemptsStats,
  AccountLockoutStatus,
  BruteForceResult,
} from './login-attempts.schemas';

/**
 * Login Attempts Repository
 *
 * Manages login attempt data access.
 *
 * Features:
 * - Track all login attempts (success and failure)
 * - Account lockout detection
 * - Brute force attack detection
 * - IP-based security monitoring
 * - User login history
 *
 * Usage:
 * ```typescript
 * const repository = new LoginAttemptsRepository(knex);
 *
 * // Log login attempt
 * await repository.create({
 *   email: 'user@example.com',
 *   ipAddress: '192.168.1.1',
 *   success: false,
 *   failureReason: 'invalid_credentials',
 * });
 *
 * // Check account lockout
 * const status = await repository.checkAccountLockout('user@example.com', 15, 5);
 * ```
 */
export class LoginAttemptsRepository extends BaseAuditRepository<
  LoginAttempt,
  LoginAttemptsQuery
> {
  /**
   * Field mappings for snake_case ↔ camelCase conversion
   */
  private static readonly FIELD_MAPPINGS: FieldMapping[] = [
    { database: 'user_id', typescript: 'userId' },
    { database: 'ip_address', typescript: 'ipAddress' },
    { database: 'user_agent', typescript: 'userAgent' },
    { database: 'failure_reason', typescript: 'failureReason' },
    { database: 'created_at', typescript: 'createdAt' },
  ];

  constructor(knex: Knex) {
    super(knex, 'login_attempts', LoginAttemptsRepository.FIELD_MAPPINGS);
  }

  /**
   * Get fields to select in queries
   */
  protected getSelectFields(): any[] {
    return [
      'id',
      this.knex.raw('user_id as "userId"'),
      'email',
      'username',
      this.knex.raw('ip_address as "ipAddress"'),
      this.knex.raw('user_agent as "userAgent"'),
      'success',
      this.knex.raw('failure_reason as "failureReason"'),
      'timestamp',
      this.knex.raw('created_at as "createdAt"'),
    ];
  }

  /**
   * Apply custom filters specific to login attempts
   */
  protected applyCustomFilters(
    query: Knex.QueryBuilder,
    filters: LoginAttemptsQuery,
  ): void {
    if (filters.userId) {
      query.where('user_id', filters.userId);
    }
    if (filters.email) {
      query.where('email', 'ilike', `%${filters.email}%`);
    }
    if (filters.username) {
      query.where('username', 'ilike', `%${filters.username}%`);
    }
    if (filters.ipAddress) {
      query.where('ip_address', filters.ipAddress);
    }
    if (filters.success !== undefined) {
      const success =
        typeof filters.success === 'string'
          ? filters.success === 'true'
          : filters.success;
      query.where('success', success);
    }
    if (filters.failureReason) {
      query.where('failure_reason', filters.failureReason);
    }
    if (filters.startDate) {
      query.where('created_at', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query.where('created_at', '<=', filters.endDate);
    }
  }

  /**
   * Get fields to search in
   */
  protected getSearchFields(): string[] {
    return ['email', 'username', 'ip_address', 'failure_reason'];
  }

  /**
   * Get custom statistics for login attempts
   */
  protected async getCustomStats(
    days: number,
  ): Promise<Partial<LoginAttemptsStats>> {
    const startDate = this.knex.raw(`NOW() - INTERVAL '${days} days'`);

    // Success/failure
    const successResult = await this.knex(this.tableName)
      .count('* as count')
      .where('created_at', '>=', startDate)
      .where('success', true)
      .first();
    const successCount = parseInt(successResult?.count as string) || 0;

    const failureResult = await this.knex(this.tableName)
      .count('* as count')
      .where('created_at', '>=', startDate)
      .where('success', false)
      .first();
    const failureCount = parseInt(failureResult?.count as string) || 0;

    const total = successCount + failureCount;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    // By failure reason
    const byFailureReasonResults = await this.knex(this.tableName)
      .select('failure_reason')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .whereNotNull('failure_reason')
      .groupBy('failure_reason');

    const byFailureReason: Record<string, number> = {};
    byFailureReasonResults.forEach((row: any) => {
      byFailureReason[row.failure_reason] = parseInt(row.count);
    });

    // Unique entities
    const uniqueIPsResult = await this.knex(this.tableName)
      .countDistinct('ip_address as count')
      .where('created_at', '>=', startDate)
      .first();
    const uniqueIPs = parseInt(uniqueIPsResult?.count as string) || 0;

    const uniqueUsersResult = await this.knex(this.tableName)
      .countDistinct('user_id as count')
      .where('created_at', '>=', startDate)
      .whereNotNull('user_id')
      .first();
    const uniqueUsers = parseInt(uniqueUsersResult?.count as string) || 0;

    // Security metrics
    const blockedAccountsResult = await this.knex(this.tableName)
      .count('* as count')
      .where('created_at', '>=', startDate)
      .where('failure_reason', 'account_locked')
      .first();
    const blockedAccountsCount =
      parseInt(blockedAccountsResult?.count as string) || 0;

    const rateLimitResult = await this.knex(this.tableName)
      .count('* as count')
      .where('created_at', '>=', startDate)
      .where('failure_reason', 'rate_limit_exceeded')
      .first();
    const rateLimitExceededCount =
      parseInt(rateLimitResult?.count as string) || 0;

    // Trend data
    const trend = await this.getTrendData(days);

    // Top IPs
    const topIPs = await this.getTopItems('ip_address', 10);

    // Top emails
    const topEmails = await this.knex(this.tableName)
      .select('email')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .whereNotNull('email')
      .groupBy('email')
      .orderBy('count', 'desc')
      .limit(10);

    const topEmailsFormatted = topEmails.map((row: any) => ({
      value: row.email,
      count: parseInt(row.count),
    }));

    // Top users
    const topUsers = await this.knex(this.tableName)
      .select('user_id')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .whereNotNull('user_id')
      .groupBy('user_id')
      .orderBy('count', 'desc')
      .limit(10);

    const topUsersFormatted = topUsers.map((row: any) => ({
      value: row.user_id,
      count: parseInt(row.count),
    }));

    return {
      successCount,
      failureCount,
      successRate,
      byFailureReason,
      uniqueIPs,
      uniqueUsers,
      blockedAccountsCount,
      rateLimitExceededCount,
      trend,
      topIPs,
      topEmails: topEmailsFormatted,
      topUsers: topUsersFormatted,
    };
  }

  // ==================== SECURITY-SPECIFIC METHODS ====================

  /**
   * Check account lockout status
   *
   * Determines if an account should be locked based on recent failed attempts
   */
  async checkAccountLockout(
    identifier: string,
    timeWindowMinutes: number = 15,
    maxAttempts: number = 5,
  ): Promise<AccountLockoutStatus> {
    const startDate = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    // Check by email, username, or IP
    const attempts = await this.knex(this.tableName)
      .select('*')
      .where((builder) => {
        builder
          .where('email', identifier)
          .orWhere('username', identifier)
          .orWhere('ip_address', identifier);
      })
      .where('created_at', '>=', startDate)
      .where('success', false)
      .orderBy('created_at', 'desc');

    const attemptCount = attempts.length;
    const isLocked = attemptCount >= maxAttempts;
    const remainingAttempts = Math.max(0, maxAttempts - attemptCount);

    let lockoutTimeRemaining: number | undefined;
    let lastAttemptAt: string | undefined;

    if (attempts.length > 0) {
      lastAttemptAt = attempts[0].created_at;

      if (isLocked) {
        const lastAttempt = new Date(attempts[0].created_at);
        const lockoutEnd = new Date(
          lastAttempt.getTime() + timeWindowMinutes * 60 * 1000,
        );
        lockoutTimeRemaining = Math.max(
          0,
          Math.floor((lockoutEnd.getTime() - Date.now()) / 1000),
        );
      }
    }

    return {
      isLocked,
      attemptCount,
      maxAttempts,
      remainingAttempts,
      lockoutTimeRemaining,
      lastAttemptAt,
    };
  }

  /**
   * Detect brute force attempts from IP
   */
  async detectBruteForce(
    ipAddress: string,
    timeWindowMinutes: number = 60,
    threshold: number = 20,
  ): Promise<BruteForceResult> {
    const startDate = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const attempts = await this.knex(this.tableName)
      .select('*')
      .where('ip_address', ipAddress)
      .where('created_at', '>=', startDate);

    const attemptCount = attempts.length;
    const isSuspicious = attemptCount >= threshold;

    // Count unique accounts attempted
    const uniqueEmails = new Set(
      attempts.filter((a) => a.email).map((a) => a.email),
    );
    const uniqueUsernames = new Set(
      attempts.filter((a) => a.username).map((a) => a.username),
    );
    const uniqueAccounts = uniqueEmails.size + uniqueUsernames.size;

    // Calculate failure rate
    const failureCount = attempts.filter((a) => !a.success).length;
    const failureRate =
      attemptCount > 0 ? (failureCount / attemptCount) * 100 : 0;

    const reasons: string[] = [];

    if (attemptCount >= threshold) {
      reasons.push(
        `High attempt count: ${attemptCount} in ${timeWindowMinutes} minutes`,
      );
    }

    if (uniqueAccounts > 10) {
      reasons.push(`Multiple accounts targeted: ${uniqueAccounts}`);
    }

    if (failureRate > 80 && attemptCount > 10) {
      reasons.push(`High failure rate: ${failureRate.toFixed(1)}%`);
    }

    return {
      isSuspicious,
      attemptCount,
      threshold,
      uniqueAccounts,
      failureRate,
      reasons,
    };
  }

  /**
   * Get recent attempts for identifier
   */
  async getRecentAttempts(
    identifier: string,
    minutes: number = 60,
  ): Promise<LoginAttempt[]> {
    const startDate = new Date(Date.now() - minutes * 60 * 1000);
    const selectFields = this.getSelectFields();

    const results = await this.knex(this.tableName)
      .select(selectFields)
      .where((builder) => {
        builder
          .where('email', identifier)
          .orWhere('username', identifier)
          .orWhere('ip_address', identifier);
      })
      .where('created_at', '>=', startDate)
      .orderBy('created_at', 'desc');

    return results as LoginAttempt[];
  }

  /**
   * Get failed attempts count
   */
  async getFailedAttemptsCount(
    identifier: string,
    minutes: number = 15,
  ): Promise<number> {
    const startDate = new Date(Date.now() - minutes * 60 * 1000);

    const result = await this.knex(this.tableName)
      .count('* as count')
      .where((builder) => {
        builder
          .where('email', identifier)
          .orWhere('username', identifier)
          .orWhere('ip_address', identifier);
      })
      .where('created_at', '>=', startDate)
      .where('success', false)
      .first();

    return parseInt(result?.count as string) || 0;
  }
}
