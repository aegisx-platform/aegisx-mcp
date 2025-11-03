import nodemailer, { Transporter } from 'nodemailer';
import { FastifyInstance } from 'fastify';

/**
 * Email Service
 *
 * Purpose: Send emails using SMTP (Gmail, SendGrid, AWS SES, etc.)
 *
 * Features:
 * - Send transactional emails (verification, password reset, etc.)
 * - Template support (HTML & plain text)
 * - SMTP configuration via environment variables
 * - Development mode: console logging instead of sending
 * - Production mode: actual SMTP sending
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private readonly isDevelopment: boolean;

  constructor(private readonly fastify: FastifyInstance) {
    this.isDevelopment =
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

    // Debug: Check what environment variables are loaded
    console.log('[EMAIL_SERVICE] Environment check:', {
      SMTP_USER: process.env.SMTP_USER ? '✅ SET' : '❌ MISSING',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ SET' : '❌ MISSING',
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
    });

    // Initialize SMTP transporter if credentials are provided
    if (this.shouldUseSMTP()) {
      console.log('[EMAIL_SERVICE] SMTP credentials found, initializing...');
      this.fastify.log.info(
        'SMTP credentials found, initializing email service...',
      );
      this.initializeTransporter();
    } else {
      console.log('[EMAIL_SERVICE] No SMTP credentials, using console logging');
      this.fastify.log.warn(
        'SMTP credentials not found, emails will be logged to console only',
      );
    }
  }

  /**
   * Check if SMTP should be used (credentials are configured)
   */
  private shouldUseSMTP(): boolean {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  }

  /**
   * Initialize nodemailer transporter
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      this.fastify.log.info({
        msg: 'Email service initialized with SMTP',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
      });
    } catch (error) {
      this.fastify.log.error({
        msg: 'Failed to initialize email transporter',
        error,
      });
      this.transporter = null;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const {
      to,
      subject,
      text,
      html,
      from = process.env.FROM_EMAIL || 'noreply@aegisx.local',
    } = options;

    console.log('[EMAIL_SERVICE] sendEmail called:', {
      to,
      subject,
      hasTransporter: !!this.transporter,
      isDevelopment: this.isDevelopment,
    });

    // In development/test without SMTP, just log to console
    if (this.isDevelopment && !this.transporter) {
      console.log(
        '[EMAIL_SERVICE] Development mode without SMTP - logging to console',
      );
      this.logEmailToConsole({ to, subject, text, html, from });
      return true;
    }

    // If SMTP is not configured, log warning and return
    if (!this.transporter) {
      console.log('[EMAIL_SERVICE] No transporter configured - email not sent');
      this.fastify.log.warn({
        msg: 'Email service not configured. Email not sent.',
        to,
        subject,
      });
      return false;
    }

    try {
      console.log('[EMAIL_SERVICE] Attempting to send email via SMTP...');
      const info = await this.transporter.sendMail({
        from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
      });

      console.log('[EMAIL_SERVICE] Email sent successfully!', {
        messageId: info.messageId,
        to,
      });
      this.fastify.log.info({
        msg: 'Email sent successfully',
        messageId: info.messageId,
        to,
        subject,
      });

      return true;
    } catch (error) {
      console.error('[EMAIL_SERVICE] Failed to send email:', error);
      this.fastify.log.error({
        msg: 'Failed to send email',
        error,
        to,
        subject,
      });
      return false;
    }
  }

  /**
   * Log email to console (development mode)
   */
  private logEmailToConsole(options: EmailOptions): void {
    console.log('\n=================================');
    console.log('📧 EMAIL (Development Mode)');
    console.log('=================================');
    console.log(`From: ${options.from}`);
    console.log(
      `To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
    );
    console.log(`Subject: ${options.subject}`);
    console.log('---');
    if (options.text) {
      console.log('Text:');
      console.log(options.text);
    }
    if (options.html) {
      console.log('\nHTML:');
      console.log(options.html);
    }
    console.log('=================================\n');
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    to: string,
    token: string,
    userName?: string,
  ): Promise<boolean> {
    const verificationUrl = `${process.env.WEB_URL || 'http://localhost:4200'}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email Address</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              <p>Thank you for registering with AegisX Platform!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AegisX Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${userName || 'there'},

Thank you for registering with AegisX Platform!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} AegisX Platform. All rights reserved.
    `.trim();

    return await this.sendEmail({
      to,
      subject: 'Verify Your Email Address - AegisX Platform',
      text,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    token: string,
    userName?: string,
  ): Promise<boolean> {
    const resetUrl = `${process.env.WEB_URL || 'http://localhost:4200'}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              <p>We received a request to reset your password for your AegisX Platform account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request a password reset, please ignore this email and ensure your account is secure.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AegisX Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${userName || 'there'},

We received a request to reset your password for your AegisX Platform account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

⚠️ SECURITY NOTICE:
If you didn't request a password reset, please ignore this email and ensure your account is secure.

© ${new Date().getFullYear()} AegisX Platform. All rights reserved.
    `.trim();

    return await this.sendEmail({
      to,
      subject: 'Reset Your Password - AegisX Platform',
      text,
      html,
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.fastify.log.info('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.fastify.log.error({
        msg: 'SMTP connection verification failed',
        error,
      });
      return false;
    }
  }
}
