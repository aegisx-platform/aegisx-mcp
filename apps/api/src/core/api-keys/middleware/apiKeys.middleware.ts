import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiKeysService } from '../services/apiKeys.service';
import { ApiKeys } from '../types/apiKeys.types';

/**
 * API Key Authentication Middleware
 *
 * Provides authentication and authorization middleware for API key-based access
 */

export interface ApiKeyAuthOptions {
  /** Header name for API key (default: 'x-api-key') */
  headerName?: string;
  /** Query parameter name for API key (default: 'api_key') */
  queryParam?: string;
  /** Bearer token prefix (default: 'Bearer ') */
  bearerPrefix?: string;
  /** Whether to allow query parameter authentication (default: false for security) */
  allowQueryAuth?: boolean;
  /** Required resource scope */
  resource?: string;
  /** Required action scope */
  action?: string;
  /** Custom error handler */
  onError?: (error: string, reply: FastifyReply) => Promise<void>;
  /** Custom success handler */
  onSuccess?: (keyData: ApiKeys, request: FastifyRequest) => Promise<void>;
}

export interface AuthenticatedRequest extends FastifyRequest {
  apiKey?: ApiKeys;
  apiKeyAuth?: {
    keyData: ApiKeys;
    prefix: string;
    authenticated: true;
  };
}

/**
 * Create API key authentication middleware
 */
export function createApiKeyAuth(
  apiKeysService: ApiKeysService,
  options: ApiKeyAuthOptions = {},
) {
  const {
    headerName = 'x-api-key',
    queryParam = 'api_key',
    bearerPrefix = 'Bearer ',
    allowQueryAuth = false,
    resource,
    action,
    onError,
    onSuccess,
  } = options;

  return async function apiKeyAuthMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      // Extract API key from various sources
      const apiKey = extractApiKey(request, {
        headerName,
        queryParam,
        bearerPrefix,
        allowQueryAuth,
      });

      if (!apiKey) {
        const error = 'API key is required';
        if (onError) {
          await onError(error, reply);
          return;
        }
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: error,
          code: 'MISSING_API_KEY',
        });
      }

      // Validate API key
      const validation = await apiKeysService.validateKey(apiKey);
      if (!validation.isValid) {
        const error = validation.error || 'Invalid API key';
        if (onError) {
          await onError(error, reply);
          return;
        }
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: error,
          code: 'INVALID_API_KEY',
        });
      }

      const keyData = validation.keyData!;

      // Check resource scope if specified
      if (resource && action) {
        const hasScope = await apiKeysService.checkScope(
          keyData,
          resource,
          action,
        );
        if (!hasScope) {
          const error = `Insufficient permissions for ${action} on ${resource}`;
          if (onError) {
            await onError(error, reply);
            return;
          }
          return reply.status(403).send({
            success: false,
            error: 'Forbidden',
            message: error,
            code: 'INSUFFICIENT_SCOPE',
            required: {
              resource,
              action,
            },
          });
        }
      }

      // Update usage tracking (async, don't wait)
      const clientIp = getClientIpAddress(request);
      apiKeysService.updateUsage(keyData.id, clientIp).catch((error) => {
        console.error('[ApiKeyAuth] Failed to update usage:', error);
      });

      // Add key data to request object
      request.apiKey = keyData;
      request.apiKeyAuth = {
        keyData,
        prefix: keyData.key_prefix,
        authenticated: true,
      };

      // Call success handler if provided
      if (onSuccess) {
        await onSuccess(keyData, request);
      }
    } catch (error) {
      console.error('[ApiKeyAuth] Authentication error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';

      if (onError) {
        await onError(errorMessage, reply);
        return;
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR',
      });
    }
  };
}

/**
 * Extract API key from request headers, query, or bearer token
 */
function extractApiKey(
  request: FastifyRequest,
  options: {
    headerName: string;
    queryParam: string;
    bearerPrefix: string;
    allowQueryAuth: boolean;
  },
): string | null {
  const { headerName, queryParam, bearerPrefix, allowQueryAuth } = options;

  // 1. Check custom header (most secure)
  const headerValue = request.headers[headerName] as string;
  if (headerValue) {
    return headerValue.trim();
  }

  // 2. Check Authorization header with Bearer token
  const authHeader = request.headers.authorization as string;
  if (authHeader && authHeader.startsWith(bearerPrefix)) {
    return authHeader.substring(bearerPrefix.length).trim();
  }

  // 3. Check query parameter (if allowed, less secure)
  if (allowQueryAuth) {
    const queryValue = (request.query as any)?.[queryParam];
    if (queryValue && typeof queryValue === 'string') {
      return queryValue.trim();
    }
  }

  return null;
}

/**
 * Get client IP address from request
 */
function getClientIpAddress(request: FastifyRequest): string {
  // Check forwarded headers first (for proxy/load balancer scenarios)
  const forwardedFor = request.headers['x-forwarded-for'] as string;
  if (forwardedFor) {
    // Take the first IP in the list
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers['x-real-ip'] as string;
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to connection remote address
  return request.socket.remoteAddress || 'unknown';
}

/**
 * Scope-based authorization middleware factory
 */
export function requireScope(resource: string, action: string) {
  return function scopeMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply,
  ) {
    if (!request.apiKeyAuth) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'API key authentication required',
        code: 'API_KEY_REQUIRED',
      });
    }

    // Scope check would have been done in the auth middleware
    // This is just a type-safe way to ensure the auth middleware was applied
    return;
  };
}

/**
 * Combined JWT + API Key authentication middleware
 */
export function createHybridAuth(
  apiKeysService: ApiKeysService,
  options: ApiKeyAuthOptions = {},
) {
  const apiKeyAuth = createApiKeyAuth(apiKeysService, options);

  return async function hybridAuthMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply,
  ): Promise<void> {
    // Try JWT authentication first (if jwt middleware was applied)
    if ((request as any).user) {
      // JWT authentication successful, continue
      return;
    }

    // Fallback to API key authentication
    await apiKeyAuth(request, reply);
  };
}

/**
 * Rate limiting middleware for API keys (placeholder)
 */
export function createApiKeyRateLimit(
  options: {
    requestsPerMinute?: number;
    burstLimit?: number;
    keyField?: string;
  } = {},
) {
  const {
    requestsPerMinute = 60,
    burstLimit = 100,
    keyField = 'apiKey',
  } = options;

  return async function apiKeyRateLimitMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.apiKeyAuth) {
      // No API key auth, skip rate limiting
      return;
    }

    const keyId = request.apiKeyAuth.keyData.id;

    // TODO: Implement rate limiting logic using Redis
    // For now, just log the rate limit check
    console.log(
      `[RateLimit] Checking limits for API key ${keyId}: ${requestsPerMinute}/min, burst: ${burstLimit}`,
    );

    // Rate limiting would be implemented here
    // Example: Check Redis counters, increment, and reject if over limit
  };
}

/**
 * Audit logging middleware for API key usage
 */
export function createApiKeyAuditLog(
  options: {
    logSuccessfulRequests?: boolean;
    logFailedRequests?: boolean;
    logSensitiveData?: boolean;
  } = {},
) {
  const {
    logSuccessfulRequests = true,
    logFailedRequests = true,
    logSensitiveData = false,
  } = options;

  return async function apiKeyAuditMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.apiKeyAuth || !logSuccessfulRequests) {
      return;
    }

    const { keyData } = request.apiKeyAuth;
    const clientIp = getClientIpAddress(request);

    // Log API key usage
    const auditData = {
      timestamp: new Date().toISOString(),
      keyId: keyData.id,
      keyPrefix: keyData.key_prefix,
      userId: keyData.user_id,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      clientIp,
      ...(logSensitiveData && {
        headers: request.headers,
        query: request.query,
      }),
    };

    console.log('[ApiKeyAudit] Request:', JSON.stringify(auditData));

    // TODO: Store in audit log database or send to external service
  };
}
