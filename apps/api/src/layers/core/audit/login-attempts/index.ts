/**
 * Login Attempts System
 *
 * Complete login attempt tracking and security monitoring system.
 *
 * Features:
 * - Track all login attempts (success and failure)
 * - Account lockout detection
 * - Brute force attack detection
 * - IP-based security monitoring
 * - User login history
 * - Statistical analysis
 * - CSV/JSON export
 *
 * Usage:
 * ```typescript
 * import { LoginAttemptsService, LoginFailureReason } from '@/core/audit-system/login-attempts';
 * import { loginAttemptsRoutes } from '@/core/audit-system/login-attempts';
 *
 * // Register routes
 * await fastify.register(loginAttemptsRoutes, { prefix: '/api/login-attempts' });
 *
 * // Use service
 * const service = new LoginAttemptsService(knex);
 * await service.logLoginAttempt({
 *   email: 'user@example.com',
 *   ipAddress: request.ip,
 *   success: false,
 *   failureReason: LoginFailureReason.INVALID_CREDENTIALS,
 * });
 *
 * // Check account lockout
 * const lockout = await service.checkAccountLockout('user@example.com');
 * if (lockout.isLocked) {
 *   throw new Error('Account locked');
 * }
 *
 * // Detect brute force
 * const bruteForce = await service.detectBruteForce(request.ip);
 * if (bruteForce.isSuspicious) {
 *   // Block IP or trigger alert
 * }
 * ```
 */

// Repository
export { LoginAttemptsRepository } from './login-attempts.repository';

// Service
export { LoginAttemptsService } from './login-attempts.service';

// Controller
export { LoginAttemptsController } from './login-attempts.controller';

// Routes
export { loginAttemptsRoutes } from './login-attempts.routes';

// Plugin
export { default as loginAttemptsPlugin } from './login-attempts.plugin';

// Schemas & Types
export * from './login-attempts.schemas';
export { LoginAttemptsSchemas } from './login-attempts.schemas';
