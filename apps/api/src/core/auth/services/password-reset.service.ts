import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt';
import { EmailService } from '../../email/email.service';

/**
 * Password Reset Service
 *
 * Purpose: Handle secure password reset for users
 *
 * Features:
 * - Generate password reset tokens
 * - Send password reset emails
 * - Verify reset tokens
 * - Reset passwords securely
 * - Track token usage
 * - Automatic token expiration (1 hour)
 * - Invalidate all sessions after password reset
 */

export interface PasswordResetRecord {
  id?: string;
  user_id: string;
  token: string;
  email: string;
  used: boolean;
  used_at?: Date | null;
  expires_at: Date;
  ip_address?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ResetResult {
  success: boolean;
  message: string;
}

export class PasswordResetService {
  private readonly TOKEN_LENGTH = 32;
  private readonly EXPIRATION_HOURS = 1; // 1 hour for security
  private emailService: EmailService;

  constructor(
    private readonly fastify: FastifyInstance,
    private readonly db: Knex,
  ) {
    this.emailService = new EmailService(fastify);
  }

  /**
   * Create a password reset token for a user
   */
  async createResetToken(
    email: string,
  ): Promise<{ token: string; userId: string }> {
    // Find user by email
    const user = await this.db('users')
      .where('email', email)
      .whereNull('deleted_at')
      .first();

    if (!user) {
      // For security, don't reveal if email exists
      // But still generate a fake token to prevent timing attacks
      const fakeToken = randomBytes(this.TOKEN_LENGTH).toString('hex');

      this.fastify.log.info({
        msg: 'Password reset requested for non-existent email',
        email,
      });

      // Return fake data
      return { token: fakeToken, userId: '' };
    }

    // Generate secure random token
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex');

    // Calculate expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.EXPIRATION_HOURS);

    // Delete any existing unused tokens for this user
    await this.db('password_reset_tokens')
      .where('user_id', user.id)
      .where('used', false)
      .del();

    // Create new reset token record
    await this.db('password_reset_tokens').insert({
      id: this.db.raw('gen_random_uuid()'),
      user_id: user.id,
      token,
      email,
      used: false,
      expires_at: expiresAt,
      created_at: this.db.fn.now(),
      updated_at: this.db.fn.now(),
    });

    this.fastify.log.info({
      msg: 'Password reset token created',
      userId: user.id,
      email,
      expiresAt,
    });

    return { token, userId: user.id };
  }

  /**
   * Verify a password reset token
   */
  async verifyResetToken(
    token: string,
  ): Promise<ResetResult & { userId?: string }> {
    // Find reset token record
    const resetRecord = await this.db('password_reset_tokens')
      .where('token', token)
      .first();

    if (!resetRecord) {
      return {
        success: false,
        message: 'Invalid reset token',
      };
    }

    // Check if already used
    if (resetRecord.used) {
      return {
        success: false,
        message: 'Reset token has already been used',
      };
    }

    // Check if expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return {
        success: false,
        message: 'Reset token has expired. Please request a new one.',
      };
    }

    return {
      success: true,
      message: 'Reset token is valid',
      userId: resetRecord.user_id,
    };
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress?: string,
  ): Promise<ResetResult> {
    // Verify token first
    const verification = await this.verifyResetToken(token);
    if (!verification.success || !verification.userId) {
      return {
        success: false,
        message: verification.message,
      };
    }

    const userId = verification.userId;

    try {
      // Hash the new password
      const hashedPassword = await hash(newPassword, 10);

      // Use transaction for atomicity
      await this.db.transaction(async (trx) => {
        // Update user password
        await trx('users').where('id', userId).update({
          password: hashedPassword,
          updated_at: trx.fn.now(),
        });

        // Mark token as used
        await trx('password_reset_tokens')
          .where('token', token)
          .update({
            used: true,
            used_at: trx.fn.now(),
            ip_address: ipAddress || null,
            updated_at: trx.fn.now(),
          });

        // Invalidate all existing sessions for security
        await trx('user_sessions').where('user_id', userId).del();
      });

      this.fastify.log.info({
        msg: 'Password reset successfully',
        userId,
      });

      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      this.fastify.log.error({
        msg: 'Failed to reset password',
        error,
        userId,
      });

      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendResetEmail(
    email: string,
    token: string,
    userName?: string,
  ): Promise<void> {
    await this.emailService.sendPasswordResetEmail(email, token, userName);
  }

  /**
   * Clean up expired reset tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const deletedCount = await this.db('password_reset_tokens')
      .where('used', false)
      .where('expires_at', '<', this.db.fn.now())
      .del();

    this.fastify.log.info({
      msg: 'Cleaned up expired password reset tokens',
      deletedCount,
    });

    return deletedCount;
  }

  /**
   * Request password reset (public method that combines create + send)
   */
  async requestPasswordReset(email: string): Promise<ResetResult> {
    const { token, userId } = await this.createResetToken(email);

    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (userId) {
      // Get user details to personalize email
      const user = await this.db('users').where('id', userId).first();

      if (user) {
        await this.sendResetEmail(
          email,
          token,
          `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        );
      }
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }
}
