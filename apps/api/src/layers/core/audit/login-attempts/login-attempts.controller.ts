import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseAuditController } from '../base/base.controller';
import { LoginAttemptsService } from './login-attempts.service';
import {
  LoginAttempt,
  LoginAttemptsQuery,
  LoginAttemptsStats,
  AccountLockoutCheck,
  BruteForceDetection,
} from './login-attempts.schemas';

/**
 * Login Attempts Controller
 *
 * HTTP request handlers for login attempts endpoints.
 *
 * Endpoints:
 * - GET    /                           - List all login attempts
 * - GET    /:id                        - Get single login attempt
 * - POST   /                           - Create login attempt
 * - DELETE /:id                        - Delete login attempt
 * - GET    /stats                      - Get statistics
 * - DELETE /cleanup                    - Cleanup old logs
 * - GET    /export                     - Export to CSV/JSON
 * - POST   /check-lockout              - Check account lockout status
 * - POST   /detect-brute-force         - Detect brute force attempts
 * - GET    /recent/:identifier         - Get recent attempts
 * - GET    /user/:userId               - Get user login history
 * - GET    /successful                 - Get successful attempts
 * - GET    /failed                     - Get failed attempts
 * - GET    /by-reason/:reason          - Get attempts by failure reason
 * - GET    /by-ip/:ipAddress           - Get attempts from IP
 */
export class LoginAttemptsController extends BaseAuditController<
  LoginAttempt,
  LoginAttemptsQuery,
  LoginAttemptsStats,
  LoginAttemptsService
> {
  constructor(service: LoginAttemptsService) {
    super(service, 'Login attempt');
  }

  /**
   * Get export filename
   */
  protected getExportFilename(): string {
    return 'login-attempts';
  }

  // ==================== SECURITY ENDPOINTS ====================

  /**
   * POST /check-lockout
   * Check account lockout status
   */
  async checkLockout(
    request: FastifyRequest<{
      Body: AccountLockoutCheck;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { identifier, timeWindowMinutes, maxAttempts } = request.body;

      const status = await this.service.checkAccountLockout(
        identifier,
        timeWindowMinutes,
        maxAttempts,
      );

      return reply.success(status);
    } catch (error: any) {
      this.logError(request, 'checkLockout', error, {
        identifier: request.body.identifier,
      });

      return reply.error(
        'CHECK_ERROR',
        'Failed to check account lockout status',
        500,
      );
    }
  }

  /**
   * POST /detect-brute-force
   * Detect brute force attempts
   */
  async detectBruteForce(
    request: FastifyRequest<{
      Body: BruteForceDetection;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { ipAddress, timeWindowMinutes, threshold } = request.body;

      const result = await this.service.detectBruteForce(
        ipAddress,
        timeWindowMinutes,
        threshold,
      );

      return reply.success(result);
    } catch (error: any) {
      this.logError(request, 'detectBruteForce', error, {
        ipAddress: request.body.ipAddress,
      });

      return reply.error(
        'DETECTION_ERROR',
        'Failed to detect brute force attempts',
        500,
      );
    }
  }

  /**
   * GET /recent/:identifier
   * Get recent login attempts by identifier
   */
  async getRecentByIdentifier(
    request: FastifyRequest<{
      Params: { identifier: string };
      Querystring: { minutes?: number };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { identifier } = request.params;
      const minutes = request.query.minutes || 60;

      const attempts = await this.service.getRecentAttempts(
        identifier,
        minutes,
      );

      return reply.success(attempts);
    } catch (error: any) {
      this.logError(request, 'getRecentByIdentifier', error, {
        identifier: request.params.identifier,
      });

      return reply.error('FETCH_ERROR', 'Failed to fetch recent attempts', 500);
    }
  }

  /**
   * GET /user/:userId
   * Get user login history
   */
  async getByUserId(
    request: FastifyRequest<{
      Params: { userId: string };
      Querystring: Partial<LoginAttemptsQuery>;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const attempts = await this.service.getByUserId(userId, request.query);

      return reply.success(attempts);
    } catch (error: any) {
      this.logError(request, 'getByUserId', error, {
        userId: request.params.userId,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch user login history',
        500,
      );
    }
  }

  /**
   * GET /successful
   * Get successful login attempts
   */
  async getSuccessful(
    request: FastifyRequest<{
      Querystring: Partial<LoginAttemptsQuery>;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const attempts = await this.service.getSuccessfulAttempts(request.query);

      return reply.success(attempts);
    } catch (error: any) {
      this.logError(request, 'getSuccessful', error, {
        query: request.query,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch successful attempts',
        500,
      );
    }
  }

  /**
   * GET /failed
   * Get failed login attempts
   */
  async getFailed(
    request: FastifyRequest<{
      Querystring: Partial<LoginAttemptsQuery>;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const attempts = await this.service.getFailedAttempts(request.query);

      return reply.success(attempts);
    } catch (error: any) {
      this.logError(request, 'getFailed', error, {
        query: request.query,
      });

      return reply.error('FETCH_ERROR', 'Failed to fetch failed attempts', 500);
    }
  }

  /**
   * GET /by-reason/:reason
   * Get attempts by failure reason
   */
  async getByReason(
    request: FastifyRequest<{
      Params: { reason: string };
      Querystring: Partial<LoginAttemptsQuery>;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { reason } = request.params;
      const attempts = await this.service.getByFailureReason(
        reason,
        request.query,
      );

      return reply.success(attempts);
    } catch (error: any) {
      this.logError(request, 'getByReason', error, {
        reason: request.params.reason,
      });

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch attempts by reason',
        500,
      );
    }
  }

  /**
   * GET /by-ip/:ipAddress
   * Get attempts from IP address
   */
  async getByIp(
    request: FastifyRequest<{
      Params: { ipAddress: string };
      Querystring: Partial<LoginAttemptsQuery>;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { ipAddress } = request.params;
      const attempts = await this.service.getByIpAddress(
        ipAddress,
        request.query,
      );

      return reply.success(attempts);
    } catch (error: any) {
      this.logError(request, 'getByIp', error, {
        ipAddress: request.params.ipAddress,
      });

      return reply.error('FETCH_ERROR', 'Failed to fetch attempts by IP', 500);
    }
  }
}
