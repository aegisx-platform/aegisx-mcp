/**
 * Security Configuration
 *
 * Configuration for CORS, Helmet, Rate Limiting, and other security measures
 */

import type { FastifyHelmetOptions } from '@fastify/helmet';
import type { RateLimitOptions } from '@fastify/rate-limit';
import type { FastifyCorsOptions } from '@fastify/cors';

export interface SecurityConfig {
  cors: FastifyCorsOptions;
  helmet: FastifyHelmetOptions;
  rateLimit: RateLimitOptions;
  jwt: JwtConfig;
  session: SessionConfig;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  cookieName: string;
}

export interface SessionConfig {
  secret: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

/**
 * Parse URL to extract origin safely
 */
function getOriginFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    return url; // fallback for invalid URLs
  }
}

/**
 * Load security configuration
 */
export function loadSecurityConfig(): SecurityConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  // Parse CORS origins
  const corsOrigins =
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [];

  // URL configurations for CSP
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4200';
  const webUrl = process.env.WEB_URL || 'http://localhost:4200';
  const apiUrl = process.env.API_URL || 'http://localhost:3333';

  const apiOrigin = getOriginFromUrl(apiUrl);
  const webOrigin = getOriginFromUrl(webUrl);
  const baseOrigin = getOriginFromUrl(apiBaseUrl);

  return {
    cors: {
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },

    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://cdn.jsdelivr.net',
          ],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'blob:',
            webOrigin,
            baseOrigin,
            ...(webOrigin !== baseOrigin ? [baseOrigin] : []),
          ],
          fontSrc: ["'self'", 'https:', 'data:'],
          connectSrc: [
            "'self'",
            apiOrigin,
            webOrigin,
            ...(apiOrigin !== webOrigin ? [webOrigin] : []),
          ],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    },

    rateLimit: {
      max: isProduction ? 100 : 1000,
      timeWindow: '1 minute',
      errorResponseBuilder: (request, context) => ({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          retryAfter: Math.round(context.ttl / 1000),
        },
      }),
    },

    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      cookieName: 'refreshToken',
    },

    session: {
      secret: process.env.SESSION_SECRET!,
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict',
    },
  };
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const errors: string[] = [];

  // JWT validation
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Session validation
  if (!config.session.secret || config.session.secret.length < 32) {
    errors.push('SESSION_SECRET must be at least 32 characters long');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (config.jwt.secret === 'supersecret') {
      errors.push('JWT_SECRET should not use default value in production');
    }

    if (config.session.secret === 'my-secret') {
      errors.push('SESSION_SECRET should not use default value in production');
    }

    if (Array.isArray(config.cors.origin) && config.cors.origin.includes('*')) {
      errors.push('CORS should not allow all origins in production');
    }
  }

  return errors;
}

/**
 * Get security configuration summary (without sensitive data)
 */
export function getSecurityConfigSummary(config: SecurityConfig) {
  const corsOrigins = Array.isArray(config.cors.origin)
    ? config.cors.origin.length
    : config.cors.origin === true
      ? 'All origins'
      : 'Single origin';

  return {
    cors: {
      origins: corsOrigins,
      credentials: config.cors.credentials,
    },
    rateLimit: {
      max: config.rateLimit.max,
      window: config.rateLimit.timeWindow,
    },
    jwt: {
      expiresIn: config.jwt.expiresIn,
      hasCustomSecret: config.jwt.secret !== 'supersecret',
    },
    session: {
      secure: config.session.secure,
      sameSite: config.session.sameSite,
    },
  };
}
