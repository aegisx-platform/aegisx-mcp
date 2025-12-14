import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Audit Category Types
 */
export type AuditCategory =
  | 'error'
  | 'activity'
  | 'file'
  | 'security'
  | 'system';

/**
 * Audit Log Entry
 *
 * Unified interface for logging audit events across all categories
 */
export interface AuditLogEntry {
  category: AuditCategory;
  action: string;
  userId?: string | null;
  entityType?: string;
  entityId?: string;
  success?: boolean;
  error?: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Audit Plugin Configuration
 */
export interface AuditPluginConfig {
  /**
   * Enable/disable audit logging globally
   */
  enabled?: boolean;

  /**
   * Which categories to enable
   */
  categories?: {
    error?: boolean;
    activity?: boolean;
    file?: boolean;
    security?: boolean;
    system?: boolean;
  };

  /**
   * Batch processing settings
   */
  batch?: {
    enabled?: boolean;
    size?: number;
    flushInterval?: number; // milliseconds
  };

  /**
   * Auto-log HTTP requests
   */
  autoLogRequests?: boolean;

  /**
   * Auto-log authentication events
   */
  autoLogAuth?: boolean;
}

/**
 * Default Configuration
 */
const defaultConfig: Required<AuditPluginConfig> = {
  enabled: true,
  categories: {
    error: true,
    activity: true,
    file: true,
    security: true,
    system: true,
  },
  batch: {
    enabled: false,
    size: 100,
    flushInterval: 5000,
  },
  autoLogRequests: false,
  autoLogAuth: true,
};

/**
 * Audit Plugin
 *
 * Provides unified audit logging interface for Fastify applications.
 *
 * Features:
 * - Unified API for all audit categories
 * - Automatic request context extraction
 * - Optional batch processing
 * - Auto-logging for auth events
 * - Category-based filtering
 *
 * Usage:
 * ```typescript
 * // Register plugin
 * await fastify.register(auditPlugin, {
 *   enabled: true,
 *   categories: { error: true, activity: true },
 *   autoLogAuth: true,
 * });
 *
 * // Use in routes
 * await fastify.audit.log({
 *   category: 'activity',
 *   action: 'user_login',
 *   userId: user.id,
 *   metadata: { method: 'password' },
 * }, request);
 *
 * // Or use category-specific methods
 * await fastify.audit.logError({
 *   message: 'Database connection failed',
 *   level: 'error',
 *   type: 'system',
 * }, request);
 * ```
 */
async function auditPlugin(
  fastify: FastifyInstance,
  options: AuditPluginConfig = {},
) {
  const config = { ...defaultConfig, ...options };

  // Merge category configs
  config.categories = { ...defaultConfig.categories, ...options.categories };

  // Batch queue (if enabled)
  const batchQueue: Array<{
    entry: AuditLogEntry;
    request?: FastifyRequest;
  }> = [];

  /**
   * Flush batch queue
   */
  async function flushBatchQueue(): Promise<void> {
    if (batchQueue.length === 0) return;

    const batch = batchQueue.splice(0, batchQueue.length);

    // Process batch (implement actual logging here)
    fastify.log.debug({ count: batch.length }, 'Flushing audit log batch');

    // TODO: Implement actual batch insert to database
    // This would call the appropriate service based on category
  }

  /**
   * Schedule batch flush
   */
  if (config.batch?.enabled) {
    const flushInterval = setInterval(
      flushBatchQueue,
      config.batch.flushInterval,
    );

    // Clean up on close
    fastify.addHook('onClose', async () => {
      clearInterval(flushInterval);
      await flushBatchQueue();
    });
  }

  /**
   * Extract request context
   */
  function extractRequestContext(request?: FastifyRequest): {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    userId?: string;
  } {
    if (!request) return {};

    return {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string,
      sessionId: (request as any).session?.id,
      userId: (request as any).user?.id,
    };
  }

  /**
   * Main audit logging function
   */
  async function log(
    entry: AuditLogEntry,
    request?: FastifyRequest,
  ): Promise<void> {
    if (!config.enabled) return;

    // Check if category is enabled
    if (!config.categories?.[entry.category]) {
      return;
    }

    // Extract request context
    const context = extractRequestContext(request);

    // Merge entry with context
    const fullEntry: AuditLogEntry = {
      ...entry,
      userId: entry.userId || context.userId,
      metadata: {
        ...entry.metadata,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
      },
    };

    // Batch or immediate processing
    if (config.batch?.enabled) {
      batchQueue.push({ entry: fullEntry, request });

      // Flush if batch size reached
      if (batchQueue.length >= (config.batch.size || 100)) {
        await flushBatchQueue();
      }
    } else {
      // Immediate processing
      await processAuditLog(fullEntry, request);
    }
  }

  /**
   * Process single audit log
   */
  async function processAuditLog(
    entry: AuditLogEntry,
    request?: FastifyRequest,
  ): Promise<void> {
    try {
      // Route to appropriate service based on category
      switch (entry.category) {
        case 'error':
          // TODO: Call ErrorLogsService
          fastify.log.debug({ entry }, 'Audit: Error log');
          break;

        case 'activity':
          // TODO: Call ActivityLogsService
          fastify.log.debug({ entry }, 'Audit: Activity log');
          break;

        case 'file':
          // TODO: Call FileAuditService
          fastify.log.debug({ entry }, 'Audit: File audit log');
          break;

        case 'security':
          // TODO: Call SecurityAuditService
          fastify.log.debug({ entry }, 'Audit: Security log');
          break;

        case 'system':
          // TODO: Call SystemAuditService
          fastify.log.debug({ entry }, 'Audit: System log');
          break;

        default:
          fastify.log.warn(
            { category: entry.category },
            'Unknown audit category',
          );
      }
    } catch (error: any) {
      fastify.log.error(
        { error: error.message, entry },
        'Failed to process audit log',
      );
    }
  }

  /**
   * Category-specific logging helpers
   */

  /**
   * Log error
   */
  async function logError(
    error: {
      message: string;
      level: 'error' | 'warn' | 'info';
      type: 'javascript' | 'http' | 'angular' | 'custom' | 'backend' | 'system';
      stack?: string;
      url?: string;
      context?: any;
    },
    request?: FastifyRequest,
  ): Promise<void> {
    return log(
      {
        category: 'error',
        action: `error_${error.level}`,
        success: false,
        error: error.message,
        metadata: {
          level: error.level,
          type: error.type,
          stack: error.stack,
          url: error.url,
          context: error.context,
        },
      },
      request,
    );
  }

  /**
   * Log user activity
   */
  async function logActivity(
    action: string,
    userId: string,
    metadata?: Record<string, any>,
    request?: FastifyRequest,
  ): Promise<void> {
    return log(
      {
        category: 'activity',
        action,
        userId,
        success: true,
        metadata,
      },
      request,
    );
  }

  /**
   * Log file operation
   */
  async function logFile(
    operation: string,
    fileId: string,
    userId: string | null,
    success: boolean,
    metadata?: Record<string, any>,
    request?: FastifyRequest,
  ): Promise<void> {
    return log(
      {
        category: 'file',
        action: operation,
        entityType: 'file',
        entityId: fileId,
        userId,
        success,
        metadata,
      },
      request,
    );
  }

  /**
   * Log security event
   */
  async function logSecurity(
    event: string,
    userId: string | null,
    success: boolean,
    metadata?: Record<string, any>,
    request?: FastifyRequest,
  ): Promise<void> {
    return log(
      {
        category: 'security',
        action: event,
        userId,
        success,
        severity: success ? 'info' : 'warning',
        metadata,
      },
      request,
    );
  }

  /**
   * Log system event
   */
  async function logSystem(
    event: string,
    metadata?: Record<string, any>,
    request?: FastifyRequest,
  ): Promise<void> {
    return log(
      {
        category: 'system',
        action: event,
        success: true,
        metadata,
      },
      request,
    );
  }

  /**
   * Decorate fastify with audit interface
   */
  fastify.decorate('audit', {
    log,
    logError,
    logActivity,
    logFile,
    logSecurity,
    logSystem,
    config,
  });

  /**
   * Auto-log authentication events (if enabled)
   */
  if (config.autoLogAuth) {
    // Login success hook
    fastify.addHook('onRequest', async (request, reply) => {
      const user = (request as any).user;
      if (user && !(request as any).__authLogged) {
        (request as any).__authLogged = true;
        await logSecurity('auth_verified', user.id, true, {}, request);
      }
    });
  }

  /**
   * Auto-log HTTP requests (if enabled)
   */
  if (config.autoLogRequests) {
    fastify.addHook('onResponse', async (request, reply) => {
      const user = (request as any).user;

      // Only log authenticated requests
      if (!user) return;

      // Skip GET requests (too noisy)
      if (request.method === 'GET') return;

      // Skip health check endpoints
      if (request.url.includes('/health') || request.url.includes('/ping')) {
        return;
      }

      await logActivity(
        `http_${request.method.toLowerCase()}`,
        user.id,
        {
          url: request.url,
          method: request.method,
          statusCode: reply.statusCode,
        },
        request,
      );
    });
  }

  fastify.log.info({ config }, 'Audit plugin registered');
}

/**
 * Export plugin
 */
export default fp(auditPlugin, {
  name: 'audit',
  fastify: '4.x',
});

/**
 * TypeScript declarations
 */
declare module 'fastify' {
  interface FastifyInstance {
    audit: {
      log: (entry: AuditLogEntry, request?: FastifyRequest) => Promise<void>;
      logError: (
        error: {
          message: string;
          level: 'error' | 'warn' | 'info';
          type:
            | 'javascript'
            | 'http'
            | 'angular'
            | 'custom'
            | 'backend'
            | 'system';
          stack?: string;
          url?: string;
          context?: any;
        },
        request?: FastifyRequest,
      ) => Promise<void>;
      logActivity: (
        action: string,
        userId: string,
        metadata?: Record<string, any>,
        request?: FastifyRequest,
      ) => Promise<void>;
      logFile: (
        operation: string,
        fileId: string,
        userId: string | null,
        success: boolean,
        metadata?: Record<string, any>,
        request?: FastifyRequest,
      ) => Promise<void>;
      logSecurity: (
        event: string,
        userId: string | null,
        success: boolean,
        metadata?: Record<string, any>,
        request?: FastifyRequest,
      ) => Promise<void>;
      logSystem: (
        event: string,
        metadata?: Record<string, any>,
        request?: FastifyRequest,
      ) => Promise<void>;
      config: Required<AuditPluginConfig>;
    };
  }
}
