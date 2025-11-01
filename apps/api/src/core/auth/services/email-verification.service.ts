import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import { randomBytes } from 'crypto';
import { EmailService } from '../../email/email.service';

/**
 * Email Verification Service
 *
 * Purpose: Handle email verification for user registration
 *
 * Features:
 * - Generate verification tokens
 * - Send verification emails
 * - Verify tokens
 * - Resend verification emails
 * - Track verification status
 * - Automatic token expiration (24 hours)
 */

export interface EmailVerificationRecord {
  id?: string;
  user_id: string;
  token: string;
  email: string;
  verified: boolean;
  verified_at?: Date | null;
  expires_at: Date;
  ip_address?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  emailVerified?: boolean;
}

export class EmailVerificationService {
  private readonly TOKEN_LENGTH = 32;
  private readonly EXPIRATION_HOURS = 24;
  private emailService: EmailService;

  constructor(
    private readonly fastify: FastifyInstance,
    private readonly db: Knex,
  ) {
    this.emailService = new EmailService(fastify);
  }

  /**
   * Create a new verification token for a user
   */
  async createVerificationToken(
    userId: string,
    email: string,
  ): Promise<string> {
    // Generate secure random token
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex');

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.EXPIRATION_HOURS);

    // Delete any existing unverified tokens for this user
    await this.db('email_verifications')
      .where('user_id', userId)
      .where('verified', false)
      .del();

    // Create new verification record
    await this.db('email_verifications').insert({
      id: this.db.raw('gen_random_uuid()'),
      user_id: userId,
      token,
      email,
      verified: false,
      expires_at: expiresAt,
      created_at: this.db.fn.now(),
      updated_at: this.db.fn.now(),
    });

    this.fastify.log.info({
      msg: 'Email verification token created',
      userId,
      email,
      expiresAt,
    });

    return token;
  }

  /**
   * Verify an email using the verification token
   */
  async verifyEmail(
    token: string,
    ipAddress?: string,
  ): Promise<VerificationResult> {
    // Find verification record
    const verification = await this.db('email_verifications')
      .where('token', token)
      .first();

    if (!verification) {
      return {
        success: false,
        message: 'Invalid verification token',
      };
    }

    // Check if already verified
    if (verification.verified) {
      return {
        success: true,
        message: 'Email already verified',
        emailVerified: true,
      };
    }

    // Check if expired
    if (new Date() > new Date(verification.expires_at)) {
      return {
        success: false,
        message: 'Verification token has expired. Please request a new one.',
      };
    }

    // Mark as verified
    await this.db('email_verifications')
      .where('token', token)
      .update({
        verified: true,
        verified_at: this.db.fn.now(),
        ip_address: ipAddress || null,
        updated_at: this.db.fn.now(),
      });

    // Update user's email_verified status
    await this.db('users').where('id', verification.user_id).update({
      email_verified: true,
      email_verified_at: this.db.fn.now(),
      updated_at: this.db.fn.now(),
    });

    this.fastify.log.info({
      msg: 'Email verified successfully',
      userId: verification.user_id,
      email: verification.email,
    });

    return {
      success: true,
      message: 'Email verified successfully',
      emailVerified: true,
    };
  }

  /**
   * Resend verification email to user
   */
  async resendVerification(userId: string): Promise<string> {
    // Get user details
    const user = await this.db('users').where('id', userId).first();

    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      (error as any).code = 'USER_NOT_FOUND';
      throw error;
    }

    // Check if already verified
    if (user.email_verified) {
      const error = new Error('Email already verified');
      (error as any).statusCode = 400;
      (error as any).code = 'EMAIL_ALREADY_VERIFIED';
      throw error;
    }

    // Create new verification token
    const token = await this.createVerificationToken(userId, user.email);

    this.fastify.log.info({
      msg: 'Verification email resent',
      userId,
      email: user.email,
    });

    return token;
  }

  /**
   * Send verification email using Email Service
   */
  async sendVerificationEmail(
    email: string,
    token: string,
    userName?: string,
  ): Promise<void> {
    await this.emailService.sendVerificationEmail(email, token, userName);
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.db('users')
      .where('id', userId)
      .select('email_verified')
      .first();

    return user?.email_verified || false;
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<{
    emailVerified: boolean;
    verifiedAt: Date | null;
    hasPendingVerification: boolean;
    pendingTokenExpiresAt: Date | null;
  }> {
    const user = await this.db('users').where('id', userId).first();

    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      (error as any).code = 'USER_NOT_FOUND';
      throw error;
    }

    // Check for pending verification
    const pendingVerification = await this.db('email_verifications')
      .where('user_id', userId)
      .where('verified', false)
      .where('expires_at', '>', this.db.fn.now())
      .orderBy('created_at', 'desc')
      .first();

    return {
      emailVerified: user.email_verified || false,
      verifiedAt: user.email_verified_at || null,
      hasPendingVerification: !!pendingVerification,
      pendingTokenExpiresAt: pendingVerification?.expires_at || null,
    };
  }

  /**
   * Clean up expired verification tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const deletedCount = await this.db('email_verifications')
      .where('verified', false)
      .where('expires_at', '<', this.db.fn.now())
      .del();

    this.fastify.log.info({
      msg: 'Cleaned up expired verification tokens',
      deletedCount,
    });

    return deletedCount;
  }
}
