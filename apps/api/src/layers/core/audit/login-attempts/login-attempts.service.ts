import { Knex } from 'knex';
import { BaseAuditService } from '../base/base.service';
import { LoginAttemptsRepository } from './login-attempts.repository';
import {
  LoginAttempt,
  LoginAttemptsQuery,
  LoginAttemptsStats,
  CreateLoginAttempt,
  AccountLockoutStatus,
  BruteForceResult,
} from './login-attempts.schemas';

/**
 * Login Attempts Service
 *
 * Business logic layer for login attempt tracking and security monitoring.
 *
 * Features:
 * - Full CRUD operations with validation
 * - Login attempt tracking (success and failure)
 * - Account lockout detection and management
 * - Brute force attack detection
 * - IP-based security monitoring
 * - User login history
 * - CSV/JSON export
 *
 * Usage:
 * ```typescript
 * const service = new LoginAttemptsService(knex);
 *
 * // Log login attempt
 * await service.logLoginAttempt({
 *   email: 'user@example.com',
 *   ipAddress: '192.168.1.1',
 *   success: false,
 *   failureReason: 'invalid_credentials',
 * });
 *
 * // Check account lockout
 * const status = await service.checkAccountLockout('user@example.com');
 * if (status.isLocked) {
 *   throw new Error(`Account locked. ${status.lockoutTimeRemaining}s remaining`);
 * }
 *
 * // Detect brute force
 * const bruteForce = await service.detectBruteForce('192.168.1.100');
 * if (bruteForce.isSuspicious) {
 *   // Block IP or trigger alert
 * }
 * ```
 */
export class LoginAttemptsService extends BaseAuditService<
  LoginAttempt,
  LoginAttemptsQuery,
  LoginAttemptsStats,
  LoginAttemptsRepository
> {
  constructor(knex: Knex) {
    super(knex, 'Login attempt');
  }

  /**
   * Create repository instance
   */
  protected createRepository(knex: Knex): LoginAttemptsRepository {
    return new LoginAttemptsRepository(knex);
  }

  /**
   * Get CSV export headers
   */
  protected getExportHeaders(): string[] {
    return [
      'ID',
      'Timestamp',
      'User ID',
      'Email',
      'Username',
      'IP Address',
      'User Agent',
      'Success',
      'Failure Reason',
    ];
  }

  /**
   * Get CSV export row
   */
  protected getExportRow(log: LoginAttempt): any[] {
    return [
      log.id,
      this.formatTimestamp(log.createdAt),
      log.userId || 'N/A',
      log.email || '',
      log.username || '',
      log.ipAddress,
      this.truncate(log.userAgent, 100),
      log.success ? 'Yes' : 'No',
      log.failureReason || '',
    ];
  }

  /**
   * Validate data before create
   */
  protected async validateCreate(data: Partial<LoginAttempt>): Promise<void> {
    if (!data.ipAddress) {
      throw new Error('IP address is required');
    }

    // At least one identifier required (email or username)
    if (!data.email && !data.username) {
      throw new Error('Either email or username is required');
    }

    // If success is true, userId should be provided
    if (data.success === true && !data.userId) {
      throw new Error('User ID is required for successful login attempts');
    }

    // If success is false, failureReason should be provided
    if (data.success === false && !data.failureReason) {
      throw new Error('Failure reason is required for failed login attempts');
    }
  }

  // ==================== SECURITY-SPECIFIC METHODS ====================

  /**
   * Log login attempt
   *
   * Convenience method for logging login attempts
   */
  async logLoginAttempt(data: CreateLoginAttempt): Promise<string> {
    return this.create({
      ...data,
      createdAt: new Date().toISOString(),
    } as Partial<LoginAttempt>);
  }

  /**
   * Check account lockout status
   *
   * Determines if an account should be locked based on recent failed attempts
   *
   * @param identifier - Email, username, or IP address
   * @param timeWindowMinutes - Time window to check (default: 15)
   * @param maxAttempts - Maximum allowed attempts (default: 5)
   */
  async checkAccountLockout(
    identifier: string,
    timeWindowMinutes: number = 15,
    maxAttempts: number = 5,
  ): Promise<AccountLockoutStatus> {
    return this.repository.checkAccountLockout(
      identifier,
      timeWindowMinutes,
      maxAttempts,
    );
  }

  /**
   * Detect brute force attempts from IP
   *
   * @param ipAddress - IP address to check
   * @param timeWindowMinutes - Time window to check (default: 60)
   * @param threshold - Number of attempts considered suspicious (default: 20)
   */
  async detectBruteForce(
    ipAddress: string,
    timeWindowMinutes: number = 60,
    threshold: number = 20,
  ): Promise<BruteForceResult> {
    return this.repository.detectBruteForce(
      ipAddress,
      timeWindowMinutes,
      threshold,
    );
  }

  /**
   * Get recent login attempts for identifier
   *
   * @param identifier - Email, username, or IP address
   * @param minutes - Time window in minutes (default: 60)
   */
  async getRecentAttempts(
    identifier: string,
    minutes: number = 60,
  ): Promise<LoginAttempt[]> {
    return this.repository.getRecentAttempts(identifier, minutes);
  }

  /**
   * Get failed login attempts count
   *
   * @param identifier - Email, username, or IP address
   * @param minutes - Time window in minutes (default: 15)
   */
  async getFailedAttemptsCount(
    identifier: string,
    minutes: number = 15,
  ): Promise<number> {
    return this.repository.getFailedAttemptsCount(identifier, minutes);
  }

  /**
   * Get login attempts by user ID
   */
  async getByUserId(
    userId: string,
    query?: Partial<LoginAttemptsQuery>,
  ): Promise<LoginAttempt[]> {
    const finalQuery: LoginAttemptsQuery = {
      ...query,
      userId,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }

  /**
   * Get successful login attempts
   */
  async getSuccessfulAttempts(
    query?: Partial<LoginAttemptsQuery>,
  ): Promise<LoginAttempt[]> {
    const finalQuery: LoginAttemptsQuery = {
      ...query,
      success: true,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }

  /**
   * Get failed login attempts
   */
  async getFailedAttempts(
    query?: Partial<LoginAttemptsQuery>,
  ): Promise<LoginAttempt[]> {
    const finalQuery: LoginAttemptsQuery = {
      ...query,
      success: false,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }

  /**
   * Get attempts by failure reason
   */
  async getByFailureReason(
    failureReason: string,
    query?: Partial<LoginAttemptsQuery>,
  ): Promise<LoginAttempt[]> {
    const finalQuery: LoginAttemptsQuery = {
      ...query,
      failureReason,
      success: false,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }

  /**
   * Get attempts from IP address
   */
  async getByIpAddress(
    ipAddress: string,
    query?: Partial<LoginAttemptsQuery>,
  ): Promise<LoginAttempt[]> {
    const finalQuery: LoginAttemptsQuery = {
      ...query,
      ipAddress,
      page: query?.page || 1,
      limit: query?.limit || 100,
    };

    const result = await this.findAll(finalQuery);
    return result.data;
  }
}
