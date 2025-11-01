import { FastifyRequest, FastifyReply } from 'fastify';
import {
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  UnlockAccountRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RequestPasswordResetRequest,
  VerifyResetTokenRequest,
  ResetPasswordRequest,
} from './auth.types';

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    console.log('[AUTH_CONTROLLER] Register request received');
    console.log(
      '[AUTH_CONTROLLER] Request body:',
      JSON.stringify(request.body, null, 2),
    );

    const result = await request.server.authService.register(
      request.body as RegisterRequest,
    );

    // Set refresh token in httpOnly cookie (same as login)
    (reply as any).setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'test' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.code(201).send({
      success: true,
      data: result,
      message: 'User registered successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: 'req-' + Math.random().toString(36).substr(2, 9),
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await request.server.authService.login(
      request.body as LoginRequest,
      request.headers['user-agent'],
      request.ip,
    );

    // Set refresh token in httpOnly cookie
    (reply as any).setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'test' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.send({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
      message: 'Login successful',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken =
      (request as any).cookies.refreshToken ||
      (request.body as RefreshRequest).refreshToken;

    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN_NOT_FOUND');
    }

    const result = await request.server.authService.refreshToken(refreshToken);

    return reply.send({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
      message: 'Token refreshed successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = (request as any).cookies.refreshToken;

    if (refreshToken) {
      await request.server.authService.logout(refreshToken);
    }

    (reply as any).clearCookie('refreshToken');

    return reply.send({
      success: true,
      data: {},
      message: 'Logged out successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const profile = await request.server.authService.getProfile(userId);

    return reply.send({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    });
  },

  async getPermissions(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const permissions = await request.server.authService.getPermissions(userId);

    return reply.send({
      success: true,
      data: {
        permissions,
      },
      message: 'Permissions retrieved successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async unlockAccount(request: FastifyRequest, reply: FastifyReply) {
    const { identifier } = request.body as UnlockAccountRequest;

    await request.server.authService.unlockAccount(identifier);

    return reply.send({
      success: true,
      data: {
        message: 'Account unlocked successfully',
        identifier,
      },
      message: 'Account unlocked successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.body as VerifyEmailRequest;

    const result = await request.server.authService.verifyEmail(
      token,
      request.ip,
    );

    if (!result.success) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: result.message,
          details: [
            {
              field: 'token',
              message: result.message,
              code: 'EMAIL_VERIFICATION_FAILED',
            },
          ],
          statusCode: 400,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
          environment: ['development', 'staging', 'production'].includes(
            process.env.NODE_ENV || '',
          )
            ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
            : 'development',
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        emailVerified: result.emailVerified || false,
      },
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async resendVerification(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;

    const result = await request.server.authService.resendVerification(userId);

    return reply.send({
      success: true,
      data: {
        message: result.message,
      },
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async requestPasswordReset(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.body as RequestPasswordResetRequest;

    const result = await request.server.authService.requestPasswordReset(email);

    return reply.send({
      success: true,
      data: {
        message: result.message,
      },
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async verifyResetToken(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.body as VerifyResetTokenRequest;

    const result = await request.server.authService.verifyResetToken(token);

    if (!result.success) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: result.message,
          details: [
            {
              field: 'token',
              message: result.message,
              code: 'INVALID_TOKEN',
            },
          ],
          statusCode: 400,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
          environment: ['development', 'staging', 'production'].includes(
            process.env.NODE_ENV || '',
          )
            ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
            : 'development',
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        message: result.message,
        valid: true,
      },
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const { token, newPassword } = request.body as ResetPasswordRequest;
    const ipAddress = request.ip;

    const result = await request.server.authService.resetPassword(
      token,
      newPassword,
      ipAddress,
    );

    if (!result.success) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: result.message,
          details: [
            {
              field: 'token',
              message: result.message,
              code: 'PASSWORD_RESET_FAILED',
            },
          ],
          statusCode: 400,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
          environment: ['development', 'staging', 'production'].includes(
            process.env.NODE_ENV || '',
          )
            ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
            : 'development',
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        message: result.message,
      },
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: ['development', 'staging', 'production'].includes(
          process.env.NODE_ENV || '',
        )
          ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
          : 'development',
      },
    });
  },
};
