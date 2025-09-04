# Error Handling & Monitoring

## Error Classification System

### Error Types and HTTP Status Codes

```typescript
// apps/api/src/errors/error.types.ts
export enum ErrorType {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export interface ErrorContext {
  errorId: string;
  userId?: string;
  correlationId?: string;
  requestId?: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  ip: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface DetailedError {
  type: ErrorType;
  message: string;
  statusCode: number;
  context: ErrorContext;
  cause?: Error;
  retryable: boolean;
  sensitive: boolean; // Don't log full details for sensitive errors
}
```

### Custom Error Classes

```typescript
// apps/api/src/errors/custom.errors.ts
import { randomUUID } from 'crypto';

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly context: ErrorContext;
  public readonly retryable: boolean;
  public readonly sensitive: boolean;
  public readonly errorId: string;

  constructor(type: ErrorType, message: string, statusCode: number, context: Partial<ErrorContext> = {}, options: { retryable?: boolean; sensitive?: boolean; cause?: Error } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = options.retryable || false;
    this.sensitive = options.sensitive || false;
    this.errorId = randomUUID();

    this.context = {
      errorId: this.errorId,
      timestamp: new Date(),
      endpoint: '',
      method: '',
      ip: '',
      ...context,
    };

    if (options.cause) {
      this.cause = options.cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      errorId: this.errorId,
      retryable: this.retryable,
      timestamp: this.context.timestamp,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
      }),
    };
  }
}

// Specific error classes
export class ValidationError extends AppError {
  public readonly validationDetails: any[];

  constructor(message: string, details: any[] = [], context: Partial<ErrorContext> = {}) {
    super(ErrorType.VALIDATION_ERROR, message, 400, context);
    this.validationDetails = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context: Partial<ErrorContext> = {}) {
    super(ErrorType.AUTHENTICATION_ERROR, message, 401, context, { sensitive: true });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context: Partial<ErrorContext> = {}) {
    super(ErrorType.AUTHORIZATION_ERROR, message, 403, context, { sensitive: true });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', context: Partial<ErrorContext> = {}) {
    super(ErrorType.NOT_FOUND_ERROR, `${resource} not found`, 404, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(ErrorType.CONFLICT_ERROR, message, 409, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error, context: Partial<ErrorContext> = {}) {
    super(ErrorType.DATABASE_ERROR, message, 500, context, {
      retryable: true,
      sensitive: true,
      cause,
    });
  }
}

export class ExternalServiceError extends AppError {
  public readonly serviceName: string;

  constructor(serviceName: string, message: string, cause?: Error, context: Partial<ErrorContext> = {}) {
    super(ErrorType.EXTERNAL_SERVICE_ERROR, message, 503, context, {
      retryable: true,
      cause,
    });
    this.serviceName = serviceName;
  }
}
```

## Comprehensive Error Handler Plugin

### Global Error Handler

```typescript
// apps/api/src/plugins/error-handler.plugin.ts
import fp from 'fastify-plugin';
import { AppError, ErrorType } from '../errors/custom.errors';

export default fp(
  async function errorHandlerPlugin(fastify: FastifyInstance) {
    fastify.setErrorHandler(async (error, request, reply) => {
      const errorId = randomUUID();
      const isDevelopment = process.env.NODE_ENV === 'development';

      // Build error context
      const context = {
        errorId,
        userId: (request.user as any)?.id,
        correlationId: request.correlationId,
        requestId: request.id,
        timestamp: new Date(),
        endpoint: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      let appError: AppError;

      // Convert various error types to AppError
      if (error instanceof AppError) {
        appError = error;
        appError.context = { ...appError.context, ...context };
      } else if (error.validation) {
        // Fastify validation errors
        appError = new ValidationError('Invalid request data', error.validation, context);
      } else if (error.statusCode === 429) {
        // Rate limiting errors
        appError = new AppError(ErrorType.RATE_LIMIT_ERROR, 'Too many requests', 429, context, { retryable: true });
      } else if (error.code?.startsWith('23')) {
        // PostgreSQL constraint violations
        appError = new DatabaseError('Database constraint violation', error, context);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        // Database connection errors
        appError = new DatabaseError('Database connection failed', error, context);
      } else {
        // Generic internal server errors
        appError = new AppError(ErrorType.INTERNAL_SERVER_ERROR, isDevelopment ? error.message : 'Internal server error', 500, context, { cause: error });
      }

      // Log error with appropriate level
      const logData = {
        errorId: appError.errorId,
        type: appError.type,
        message: appError.message,
        statusCode: appError.statusCode,
        userId: context.userId,
        endpoint: context.endpoint,
        method: context.method,
        ip: context.ip,
        correlationId: context.correlationId,
        retryable: appError.retryable,
        ...(appError.cause && { cause: appError.cause.message }),
        ...(isDevelopment && { stack: appError.stack }),
      };

      // Log based on severity
      if (appError.statusCode >= 500) {
        fastify.log.error(logData, 'Server error occurred');

        // Notify monitoring systems for server errors
        if (fastify.monitoring) {
          await fastify.monitoring.recordError(appError);
        }
      } else if (appError.statusCode >= 400) {
        fastify.log.warn(logData, 'Client error occurred');
      } else {
        fastify.log.info(logData, 'Request error');
      }

      // Store in database for critical errors
      if (appError.statusCode >= 500 && fastify.errorStorage) {
        await fastify.errorStorage.store(appError);
      }

      // Send appropriate response
      const response = {
        success: false,
        error: appError.type,
        message: appError.message,
        errorId: appError.errorId,
        ...(appError.retryable && { retryable: true }),
        ...(isDevelopment &&
          appError instanceof ValidationError && {
            details: appError.validationDetails,
          }),
      };

      return reply.error(appError.code, appError.message, appError.statusCode, appError.details);
    });
  },
  {
    name: 'error-handler-plugin',
  },
);
```

### Error Storage Service

```typescript
// apps/api/src/services/error-storage.service.ts
export class ErrorStorageService {
  constructor(
    private knex: Knex,
    private logger: FastifyBaseLogger,
  ) {}

  async store(error: AppError): Promise<void> {
    try {
      await this.knex('error_logs').insert({
        id: error.errorId,
        type: error.type,
        message: error.message,
        status_code: error.statusCode,
        stack_trace: error.stack,
        user_id: error.context.userId,
        correlation_id: error.context.correlationId,
        request_id: error.context.requestId,
        endpoint: error.context.endpoint,
        method: error.context.method,
        ip_address: error.context.ip,
        user_agent: error.context.userAgent,
        retryable: error.retryable,
        sensitive: error.sensitive,
        metadata: JSON.stringify(error.context.metadata),
        cause: error.cause?.message,
        created_at: error.context.timestamp,
      });
    } catch (storageError) {
      // Never let error storage failure crash the app
      this.logger.error(
        {
          error: storageError.message,
          originalError: error.errorId,
        },
        'Failed to store error in database',
      );
    }
  }

  async getErrors(filters: { type?: ErrorType; statusCode?: number; userId?: string; endpoint?: string; dateFrom?: Date; dateTo?: Date; page?: number; limit?: number }) {
    const query = this.knex('error_logs').select('*');

    // Apply filters
    if (filters.type) query.where('type', filters.type);
    if (filters.statusCode) query.where('status_code', filters.statusCode);
    if (filters.userId) query.where('user_id', filters.userId);
    if (filters.endpoint) query.where('endpoint', 'like', `%${filters.endpoint}%`);
    if (filters.dateFrom) query.where('created_at', '>=', filters.dateFrom);
    if (filters.dateTo) query.where('created_at', '<=', filters.dateTo);

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);

    const [errors, [{ total }]] = await Promise.all([
      query
        .orderBy('created_at', 'desc')
        .offset((page - 1) * limit)
        .limit(limit),
      query.clone().count('* as total'),
    ]);

    return {
      data: errors,
      total: parseInt(total as string),
      page,
      limit,
    };
  }

  async getErrorStats(days: number = 7) {
    const stats = await this.knex('error_logs')
      .select('type', 'status_code', this.knex.raw('COUNT(*) as count'), this.knex.raw('DATE(created_at) as date'))
      .where('created_at', '>=', this.knex.raw(`CURRENT_DATE - INTERVAL '${days} days'`))
      .groupBy('type', 'status_code', this.knex.raw('DATE(created_at)'))
      .orderBy('date', 'desc');

    return stats;
  }

  async cleanupOldErrors(retentionDays: number = 90): Promise<number> {
    const deleted = await this.knex('error_logs')
      .where('created_at', '<', this.knex.raw(`CURRENT_DATE - INTERVAL '${retentionDays} days'`))
      .del();

    this.logger.info(
      {
        deletedCount: deleted,
        retentionDays,
      },
      'Cleaned up old error logs',
    );

    return deleted;
  }
}
```

## Monitoring Integration

### Health Check System

```typescript
// apps/api/src/plugins/health-check.plugin.ts
export default fp(
  async function healthCheckPlugin(fastify: FastifyInstance) {
    // Detailed health check endpoint
    fastify.route({
      method: 'GET',
      url: '/health/detailed',
      schema: {
        description: 'Detailed health check with all service statuses',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              timestamp: { type: 'string', format: 'date-time' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              environment: { type: 'string' },
              services: {
                type: 'object',
                properties: {
                  database: { type: 'object' },
                  redis: { type: 'object' },
                  external: { type: 'object' },
                },
              },
              metrics: { type: 'object' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        const startTime = process.hrtime.bigint();
        const checks = [];

        // Database health check
        const dbHealth = await checkDatabaseHealth(fastify);
        checks.push(dbHealth);

        // Redis health check
        const redisHealth = await checkRedisHealth(fastify);
        checks.push(redisHealth);

        // External services health check
        const externalHealth = await checkExternalServices(fastify);
        checks.push(externalHealth);

        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // ms

        // Determine overall status
        const hasUnhealthy = checks.some((check) => check.status === 'unhealthy');
        const hasDegraded = checks.some((check) => check.status === 'degraded');

        const overallStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

        const health = {
          status: overallStatus,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV,
          responseTime: `${duration.toFixed(2)}ms`,
          services: {
            database: dbHealth,
            redis: redisHealth,
            external: externalHealth,
          },
          metrics: {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            activeConnections: fastify.server.connections || 0,
          },
        };

        // Log health check results
        fastify.log.info(
          {
            type: 'health_check',
            status: overallStatus,
            duration: `${duration.toFixed(2)}ms`,
            checks: checks.length,
          },
          'Health check completed',
        );

        // Return appropriate status code
        const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

        return statusCode === 200 ? reply.success(health) : reply.error('HEALTH_DEGRADED', 'Some services are degraded', statusCode, health);
      },
    });

    // Simple health check for load balancers
    fastify.route({
      method: 'GET',
      url: '/health',
      schema: {
        description: 'Simple health check for load balancers',
        tags: ['Health'],
        response: {
          200: { type: 'object', properties: { status: { type: 'string' } } },
        },
      },
      handler: async (request, reply) => {
        // Quick database check
        try {
          await fastify.knex.raw('SELECT 1');
          return reply.success({ status: 'ok' });
        } catch (error) {
          return reply.error('HEALTH_CHECK_FAILED', 'Database connection failed', 503);
        }
      },
    });

    // Readiness check for Kubernetes
    fastify.route({
      method: 'GET',
      url: '/ready',
      schema: {
        description: 'Readiness check for container orchestration',
        tags: ['Health'],
      },
      handler: async (request, reply) => {
        try {
          // Check if all critical services are ready
          await Promise.all([
            fastify.knex.raw('SELECT 1'), // Database
            // Add other critical service checks
          ]);

          return reply.success({ ready: true });
        } catch (error) {
          return reply.error('NOT_READY', error.message, 503);
        }
      },
    });
  },
  {
    name: 'health-check-plugin',
  },
);

// Health check helper functions
async function checkDatabaseHealth(fastify: FastifyInstance) {
  const startTime = process.hrtime.bigint();

  try {
    // Test basic connectivity
    await fastify.knex.raw('SELECT 1');

    // Test connection pool
    const poolStats = fastify.knex.client.pool;

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000;

    return {
      status: duration < 100 ? 'healthy' : 'degraded',
      responseTime: `${duration.toFixed(2)}ms`,
      pool: {
        used: poolStats.numUsed(),
        free: poolStats.numFree(),
        pending: poolStats.numPendingAcquires(),
        max: poolStats.max,
        min: poolStats.min,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkRedisHealth(fastify: FastifyInstance) {
  if (!fastify.redis) {
    return { status: 'not_configured' };
  }

  const startTime = process.hrtime.bigint();

  try {
    await fastify.redis.ping();

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000;

    return {
      status: duration < 50 ? 'healthy' : 'degraded',
      responseTime: `${duration.toFixed(2)}ms`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkExternalServices(fastify: FastifyInstance) {
  const services = [];

  // Check email service
  if (process.env.EMAIL_SERVICE_API_KEY) {
    try {
      // Implement email service health check
      services.push({ name: 'email', status: 'healthy' });
    } catch (error) {
      services.push({ name: 'email', status: 'unhealthy', error: error.message });
    }
  }

  // Check other external APIs
  // Add more service checks as needed

  const hasUnhealthy = services.some((s) => s.status === 'unhealthy');

  return {
    status: hasUnhealthy ? 'degraded' : 'healthy',
    services,
  };
}
```

### Metrics Collection Plugin

```typescript
// apps/api/src/plugins/metrics.plugin.ts
export default fp(
  async function metricsPlugin(fastify: FastifyInstance) {
    // Metrics storage
    const metrics = {
      requests: {
        total: 0,
        byStatus: new Map<number, number>(),
        byEndpoint: new Map<string, number>(),
        byMethod: new Map<string, number>(),
      },
      performance: {
        responseTimeP50: 0,
        responseTimeP95: 0,
        responseTimeP99: 0,
        responseTimes: [] as number[],
      },
      errors: {
        total: 0,
        byType: new Map<ErrorType, number>(),
        last24Hours: 0,
      },
      database: {
        queriesTotal: 0,
        slowQueries: 0,
        connectionPoolUsage: 0,
      },
    };

    // Collect request metrics
    fastify.addHook('onRequest', async (request) => {
      request.startTime = process.hrtime.bigint();
      metrics.requests.total++;

      const method = request.method;
      metrics.requests.byMethod.set(method, (metrics.requests.byMethod.get(method) || 0) + 1);
    });

    fastify.addHook('onResponse', async (request, reply) => {
      if (!request.startTime) return;

      const duration = Number(process.hrtime.bigint() - request.startTime) / 1000000;

      // Response time tracking
      metrics.performance.responseTimes.push(duration);

      // Keep only last 1000 response times for percentile calculation
      if (metrics.performance.responseTimes.length > 1000) {
        metrics.performance.responseTimes.shift();
      }

      // Status code tracking
      const statusCode = reply.statusCode;
      metrics.requests.byStatus.set(statusCode, (metrics.requests.byStatus.get(statusCode) || 0) + 1);

      // Endpoint tracking (simplified path)
      const endpoint = request.url.split('?')[0].replace(/\/\d+/g, '/:id');
      metrics.requests.byEndpoint.set(endpoint, (metrics.requests.byEndpoint.get(endpoint) || 0) + 1);
    });

    // Collect error metrics
    fastify.addHook('onError', async (request, reply, error) => {
      metrics.errors.total++;

      if (error instanceof AppError) {
        const currentCount = metrics.errors.byType.get(error.type) || 0;
        metrics.errors.byType.set(error.type, currentCount + 1);
      }
    });

    // Metrics endpoint
    fastify.route({
      method: 'GET',
      url: '/metrics',
      schema: {
        description: 'Application metrics endpoint',
        tags: ['Metrics'],
        response: {
          200: {
            type: 'object',
            properties: {
              requests: { type: 'object' },
              performance: { type: 'object' },
              errors: { type: 'object' },
              database: { type: 'object' },
              system: { type: 'object' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        // Calculate percentiles
        const sortedTimes = metrics.performance.responseTimes.sort((a, b) => a - b);
        const len = sortedTimes.length;

        if (len > 0) {
          metrics.performance.responseTimeP50 = sortedTimes[Math.floor(len * 0.5)];
          metrics.performance.responseTimeP95 = sortedTimes[Math.floor(len * 0.95)];
          metrics.performance.responseTimeP99 = sortedTimes[Math.floor(len * 0.99)];
        }

        // Database metrics
        const poolStats = fastify.knex.client.pool;
        metrics.database.connectionPoolUsage = (poolStats.numUsed() / poolStats.max) * 100;

        return reply.success({
          requests: {
            total: metrics.requests.total,
            byStatus: Object.fromEntries(metrics.requests.byStatus),
            byEndpoint: Object.fromEntries(metrics.requests.byEndpoint),
            byMethod: Object.fromEntries(metrics.requests.byMethod),
          },
          performance: {
            responseTimeP50: Number(metrics.performance.responseTimeP50.toFixed(2)),
            responseTimeP95: Number(metrics.performance.responseTimeP95.toFixed(2)),
            responseTimeP99: Number(metrics.performance.responseTimeP99.toFixed(2)),
            averageResponseTime: len > 0 ? Number((sortedTimes.reduce((a, b) => a + b, 0) / len).toFixed(2)) : 0,
          },
          errors: {
            total: metrics.errors.total,
            byType: Object.fromEntries(metrics.errors.byType),
            errorRate: metrics.requests.total > 0 ? Number(((metrics.errors.total / metrics.requests.total) * 100).toFixed(2)) : 0,
          },
          database: {
            connectionPoolUsage: Number(metrics.database.connectionPoolUsage.toFixed(2)),
            poolStats: {
              used: poolStats.numUsed(),
              free: poolStats.numFree(),
              pending: poolStats.numPendingAcquires(),
              max: poolStats.max,
            },
          },
          system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            nodeVersion: process.version,
            platform: process.platform,
          },
        });
      },
    });
  },
  {
    name: 'metrics-plugin',
  },
);
```

## External Monitoring Integration

### Sentry Integration

```typescript
// apps/api/src/plugins/sentry.plugin.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export default fp(
  async function sentryPlugin(fastify: FastifyInstance) {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION,

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      integrations: [nodeProfilingIntegration(), new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Postgres({ tracing: true })],

      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof AppError && error.statusCode < 500) {
            return null; // Don't send client errors to Sentry
          }
        }

        return event;
      },
    });

    // Add Sentry context to requests
    fastify.addHook('onRequest', async (request) => {
      Sentry.addBreadcrumb({
        message: `${request.method} ${request.url}`,
        category: 'http',
        level: 'info',
        data: {
          url: request.url,
          method: request.method,
          headers: request.headers,
          query: request.query,
        },
      });

      // Set user context if authenticated
      if (request.user) {
        Sentry.setUser({
          id: (request.user as any).id,
          email: (request.user as any).email,
          username: (request.user as any).username,
        });
      }

      // Set request context
      Sentry.setTag('endpoint', request.url);
      Sentry.setTag('method', request.method);
      Sentry.setContext('request', {
        id: request.id,
        correlationId: request.correlationId,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
    });

    // Capture errors in Sentry
    fastify.addHook('onError', async (request, reply, error) => {
      if (error instanceof AppError && error.statusCode >= 500) {
        Sentry.captureException(error, {
          tags: {
            errorType: error.type,
            endpoint: request.url,
            method: request.method,
          },
          extra: {
            errorId: error.errorId,
            context: error.context,
            retryable: error.retryable,
          },
        });
      }
    });

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      await Sentry.close(2000);
    });
  },
  {
    name: 'sentry-plugin',
  },
);
```

### Application Performance Monitoring

```typescript
// apps/api/src/plugins/apm.plugin.ts
export default fp(
  async function apmPlugin(fastify: FastifyInstance) {
    // Performance monitoring state
    const apm = {
      transactions: new Map<string, any>(),
      spans: new Map<string, any>(),
    };

    // Start transaction for each request
    fastify.addHook('onRequest', async (request) => {
      const transactionName = `${request.method} ${request.url.split('?')[0]}`;

      request.transaction = {
        id: randomUUID(),
        name: transactionName,
        startTime: process.hrtime.bigint(),
        spans: [],
      };

      apm.transactions.set(request.transaction.id, request.transaction);
    });

    // End transaction on response
    fastify.addHook('onResponse', async (request, reply) => {
      if (!request.transaction) return;

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - request.transaction.startTime) / 1000000;

      const transaction = {
        ...request.transaction,
        endTime,
        duration,
        statusCode: reply.statusCode,
        success: reply.statusCode < 400,
      };

      // Log slow transactions
      if (duration > 1000) {
        fastify.log.warn(
          {
            type: 'slow_transaction',
            transactionId: transaction.id,
            name: transaction.name,
            duration: `${duration.toFixed(2)}ms`,
            statusCode: reply.statusCode,
            spans: transaction.spans.length,
          },
          'Slow transaction detected',
        );
      }

      // Send to APM if configured
      if (fastify.apmService) {
        await fastify.apmService.recordTransaction(transaction);
      }

      apm.transactions.delete(request.transaction.id);
    });

    // Database query monitoring
    if (fastify.knex) {
      fastify.knex.on('query', (query) => {
        const spanId = randomUUID();
        const span = {
          id: spanId,
          type: 'db.query',
          startTime: process.hrtime.bigint(),
          sql: query.sql,
          bindings: query.bindings,
        };

        apm.spans.set(spanId, span);
      });

      fastify.knex.on('query-response', (response, query) => {
        const span = Array.from(apm.spans.values()).find((s) => s.sql === query.sql);

        if (span) {
          const endTime = process.hrtime.bigint();
          const duration = Number(endTime - span.startTime) / 1000000;

          span.endTime = endTime;
          span.duration = duration;

          // Log slow queries
          if (duration > 500) {
            fastify.log.warn(
              {
                type: 'slow_query',
                spanId: span.id,
                duration: `${duration.toFixed(2)}ms`,
                sql: span.sql,
              },
              'Slow database query detected',
            );
          }

          apm.spans.delete(span.id);
        }
      });
    }

    // APM metrics endpoint
    fastify.route({
      method: 'GET',
      url: '/apm/metrics',
      schema: {
        description: 'Application performance metrics',
        tags: ['APM'],
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        return reply.success({
          activeTransactions: apm.transactions.size,
          activeSpans: apm.spans.size,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          uptime: process.uptime(),
        });
      },
    });
  },
  {
    name: 'apm-plugin',
  },
);

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    transaction?: {
      id: string;
      name: string;
      startTime: bigint;
      spans: any[];
    };
  }
}
```

## Alerting System

### Alert Service

```typescript
// apps/api/src/services/alert.service.ts
export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  timeWindow: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[]; // email, slack, webhook
}

export interface AlertEvent {
  ruleId: string;
  value: number;
  threshold: number;
  severity: string;
  message: string;
  context: Record<string, any>;
  timestamp: Date;
}

export class AlertService {
  private rules: AlertRule[] = [];
  private lastAlerts = new Map<string, Date>();

  constructor(
    private logger: FastifyBaseLogger,
    private notificationService: NotificationService,
  ) {
    this.loadAlertRules();
  }

  private loadAlertRules() {
    // Load from configuration or database
    this.rules = [
      {
        id: 'error_rate_high',
        name: 'High Error Rate',
        condition: 'error_rate > threshold',
        threshold: 5, // 5% error rate
        timeWindow: 5,
        severity: 'high',
        enabled: true,
        channels: ['email', 'slack'],
      },
      {
        id: 'response_time_slow',
        name: 'Slow Response Time',
        condition: 'avg_response_time > threshold',
        threshold: 2000, // 2 seconds
        timeWindow: 10,
        severity: 'medium',
        enabled: true,
        channels: ['slack'],
      },
      {
        id: 'database_connections_high',
        name: 'High Database Connection Usage',
        condition: 'db_pool_usage > threshold',
        threshold: 80, // 80% pool usage
        timeWindow: 5,
        severity: 'medium',
        enabled: true,
        channels: ['email'],
      },
      {
        id: 'memory_usage_critical',
        name: 'Critical Memory Usage',
        condition: 'memory_usage > threshold',
        threshold: 90, // 90% memory usage
        timeWindow: 2,
        severity: 'critical',
        enabled: true,
        channels: ['email', 'slack', 'webhook'],
      },
    ];
  }

  async checkAlerts(metrics: any): Promise<void> {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const alertKey = `${rule.id}_${Math.floor(Date.now() / (rule.timeWindow * 60 * 1000))}`;

      // Check if already alerted in this time window
      const lastAlert = this.lastAlerts.get(rule.id);
      const now = new Date();
      const timeWindowMs = rule.timeWindow * 60 * 1000;

      if (lastAlert && now.getTime() - lastAlert.getTime() < timeWindowMs) {
        continue; // Skip to avoid alert spam
      }

      let shouldAlert = false;
      let currentValue = 0;
      let context = {};

      // Evaluate alert conditions
      switch (rule.id) {
        case 'error_rate_high':
          const totalRequests = metrics.requests.total;
          const totalErrors = metrics.errors.total;
          currentValue = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
          shouldAlert = currentValue > rule.threshold;
          context = { totalRequests, totalErrors, errorRate: currentValue };
          break;

        case 'response_time_slow':
          currentValue = metrics.performance.responseTimeP95;
          shouldAlert = currentValue > rule.threshold;
          context = { p95ResponseTime: currentValue };
          break;

        case 'database_connections_high':
          currentValue = metrics.database.connectionPoolUsage;
          shouldAlert = currentValue > rule.threshold;
          context = { poolUsage: currentValue };
          break;

        case 'memory_usage_critical':
          const memUsage = process.memoryUsage();
          currentValue = (memUsage.heapUsed / memUsage.heapTotal) * 100;
          shouldAlert = currentValue > rule.threshold;
          context = { memoryUsage: memUsage };
          break;
      }

      if (shouldAlert) {
        await this.triggerAlert({
          ruleId: rule.id,
          value: currentValue,
          threshold: rule.threshold,
          severity: rule.severity,
          message: `${rule.name}: ${currentValue.toFixed(2)} > ${rule.threshold}`,
          context,
          timestamp: now,
        });

        this.lastAlerts.set(rule.id, now);
      }
    }
  }

  private async triggerAlert(event: AlertEvent): Promise<void> {
    this.logger.warn(
      {
        type: 'alert_triggered',
        alertRule: event.ruleId,
        severity: event.severity,
        value: event.value,
        threshold: event.threshold,
        message: event.message,
      },
      'Alert triggered',
    );

    // Store alert in database
    await this.storeAlert(event);

    // Send notifications
    const rule = this.rules.find((r) => r.id === event.ruleId);
    if (rule) {
      await this.notificationService.sendAlert(event, rule.channels);
    }
  }

  private async storeAlert(event: AlertEvent): Promise<void> {
    // Store in database for historical tracking
    // Implementation depends on your database schema
  }
}
```

### Notification Service

```typescript
// apps/api/src/services/notification.service.ts
export class NotificationService {
  constructor(
    private logger: FastifyBaseLogger,
    private config: AppConfig,
  ) {}

  async sendAlert(event: AlertEvent, channels: string[]): Promise<void> {
    const promises = channels.map((channel) => this.sendToChannel(event, channel));
    await Promise.allSettled(promises);
  }

  private async sendToChannel(event: AlertEvent, channel: string): Promise<void> {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmailAlert(event);
          break;
        case 'slack':
          await this.sendSlackAlert(event);
          break;
        case 'webhook':
          await this.sendWebhookAlert(event);
          break;
        default:
          this.logger.warn({ channel }, 'Unknown alert channel');
      }
    } catch (error) {
      this.logger.error(
        {
          error: error.message,
          channel,
          alertRule: event.ruleId,
        },
        'Failed to send alert',
      );
    }
  }

  private async sendEmailAlert(event: AlertEvent): Promise<void> {
    const emailContent = {
      to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
      subject: `[${event.severity.toUpperCase()}] ${event.message}`,
      html: `
        <h2>Alert: ${event.message}</h2>
        <p><strong>Severity:</strong> ${event.severity}</p>
        <p><strong>Value:</strong> ${event.value}</p>
        <p><strong>Threshold:</strong> ${event.threshold}</p>
        <p><strong>Time:</strong> ${event.timestamp.toISOString()}</p>
        <pre>${JSON.stringify(event.context, null, 2)}</pre>
      `,
    };

    // Send via email service
    // await this.emailService.send(emailContent);
  }

  private async sendSlackAlert(event: AlertEvent): Promise<void> {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) return;

    const color = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8B0000',
    }[event.severity];

    const slackMessage = {
      text: `Alert: ${event.message}`,
      attachments: [
        {
          color,
          fields: [
            { title: 'Severity', value: event.severity, short: true },
            { title: 'Value', value: event.value.toString(), short: true },
            { title: 'Threshold', value: event.threshold.toString(), short: true },
            { title: 'Environment', value: process.env.NODE_ENV, short: true },
          ],
          footer: 'API Monitoring',
          ts: Math.floor(event.timestamp.getTime() / 1000),
        },
      ],
    };

    // Send to Slack
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  private async sendWebhookAlert(event: AlertEvent): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;

    const payload = {
      type: 'alert',
      event,
      service: 'api',
      environment: process.env.NODE_ENV,
      timestamp: event.timestamp.toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.WEBHOOK_API_KEY || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  }
}
```

## Error Recovery Patterns

### Circuit Breaker Pattern

```typescript
// apps/api/src/utils/circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private name: string = 'circuit-breaker',
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new ExternalServiceError(this.name, 'Circuit breaker is OPEN - service unavailable');
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();

      // Success - reset circuit breaker
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
      }
      this.failures = 0;

      return result;
    } catch (error) {
      this.failures++;

      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.timeout;
      }

      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt,
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
}
```

### Retry Pattern with Exponential Backoff

```typescript
// apps/api/src/utils/retry.util.ts
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryIf?: (error: Error) => boolean;
}

export class RetryUtil {
  static async withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30000, backoffFactor = 2, retryIf = (error) => error instanceof ExternalServiceError } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry if not retryable
        if (!retryIf(error) || attempt === maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        const totalDelay = delay + jitter;

        await new Promise((resolve) => setTimeout(resolve, totalDelay));
      }
    }

    throw lastError!;
  }
}

// Usage in services
export class ExternalAPIService {
  private circuitBreaker = new CircuitBreaker(3, 30000, 'external-api');

  async callExternalAPI(data: any): Promise<any> {
    return await this.circuitBreaker.execute(async () => {
      return await RetryUtil.withRetry(
        async () => {
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new ExternalServiceError('external-api', `API call failed: ${response.statusText}`);
          }

          return await response.json();
        },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          retryIf: (error) => error instanceof ExternalServiceError,
        },
      );
    });
  }
}
```

## Database Error Handling

### Database Connection Recovery

```typescript
// apps/api/src/plugins/database-recovery.plugin.ts
export default fp(
  async function databaseRecoveryPlugin(fastify: FastifyInstance) {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000; // 5 seconds

    // Monitor database connection health
    fastify.addHook('onRequest', async (request) => {
      try {
        // Quick health check (cached for 30 seconds)
        const cacheKey = 'db_health_check';
        let isHealthy = fastify.cache?.get(cacheKey);

        if (isHealthy === undefined) {
          await fastify.knex.raw('SELECT 1');
          isHealthy = true;
          fastify.cache?.set(cacheKey, true, 30); // Cache for 30 seconds
        }
      } catch (error) {
        // Database connection issue detected
        fastify.log.error(
          {
            error: error.message,
            reconnectAttempts,
          },
          'Database connection health check failed',
        );

        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;

          setTimeout(async () => {
            try {
              // Attempt to reconnect
              await fastify.knex.raw('SELECT 1');
              reconnectAttempts = 0;
              fastify.log.info('Database connection recovered');
            } catch (reconnectError) {
              fastify.log.error(
                {
                  error: reconnectError.message,
                  attempt: reconnectAttempts,
                },
                'Database reconnection attempt failed',
              );
            }
          }, reconnectDelay * reconnectAttempts); // Exponential backoff
        }

        throw new DatabaseError('Database temporarily unavailable', error);
      }
    });
  },
  {
    name: 'database-recovery-plugin',
  },
);
```

### Query Error Handler

```typescript
// apps/api/src/repositories/error-handler.repository.ts
export class ErrorHandlerRepository {
  constructor(
    protected knex: Knex,
    protected logger: FastifyBaseLogger,
  ) {}

  protected async executeQuery<T>(queryName: string, queryFn: () => Promise<T>, context: Record<string, any> = {}): Promise<T> {
    const startTime = process.hrtime.bigint();

    try {
      const result = await queryFn();

      const duration = Number(process.hrtime.bigint() - startTime) / 1000000;

      // Log slow queries
      if (duration > 1000) {
        this.logger.warn(
          {
            queryName,
            duration: `${duration.toFixed(2)}ms`,
            context,
          },
          'Slow database query detected',
        );
      }

      return result;
    } catch (error) {
      const duration = Number(process.hrtime.bigint() - startTime) / 1000000;

      // Categorize database errors
      let errorType = ErrorType.DATABASE_ERROR;
      let message = 'Database operation failed';
      let retryable = false;

      if (error.code) {
        switch (error.code) {
          case '23505': // Unique constraint violation
            errorType = ErrorType.CONFLICT_ERROR;
            message = 'Record already exists';
            break;
          case '23503': // Foreign key constraint violation
            errorType = ErrorType.VALIDATION_ERROR;
            message = 'Invalid reference';
            break;
          case '23514': // Check constraint violation
            errorType = ErrorType.VALIDATION_ERROR;
            message = 'Invalid data';
            break;
          case 'ECONNREFUSED':
          case 'ETIMEDOUT':
            message = 'Database connection failed';
            retryable = true;
            break;
          default:
            message = isDevelopment ? error.message : 'Database error occurred';
        }
      }

      this.logger.error(
        {
          queryName,
          error: error.message,
          code: error.code,
          duration: `${duration.toFixed(2)}ms`,
          context,
        },
        'Database query failed',
      );

      throw new AppError(
        errorType,
        message,
        500,
        {
          endpoint: context.endpoint || '',
          method: context.method || '',
          ip: context.ip || '',
          metadata: { queryName, errorCode: error.code },
        },
        { retryable, cause: error },
      );
    }
  }
}

// Usage in repositories
export class UserRepository extends ErrorHandlerRepository {
  async findById(id: string): Promise<User | null> {
    return this.executeQuery(
      'user_find_by_id',
      async () => {
        const row = await this.knex('users').leftJoin('roles', 'users.role_id', 'roles.id').select('users.*', 'roles.name as role_name').where('users.id', id).first();

        return row ? this.transformToEntity(row) : null;
      },
      { userId: id },
    );
  }

  async create(data: CreateUserRequest): Promise<User> {
    return this.executeQuery(
      'user_create',
      async () => {
        const dbData = this.transformToDb(data);
        const [row] = await this.knex('users').insert(dbData).returning('*');
        return this.transformToEntity(row);
      },
      { email: data.email, username: data.username },
    );
  }
}
```

## Monitoring Dashboard Data

### Metrics Aggregation Service

```typescript
// apps/api/src/services/metrics-aggregation.service.ts
export class MetricsAggregationService {
  constructor(
    private knex: Knex,
    private logger: FastifyBaseLogger,
  ) {}

  async getSystemMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
    const intervals = {
      '1h': { interval: '5 minutes', duration: '1 hour' },
      '24h': { interval: '1 hour', duration: '24 hours' },
      '7d': { interval: '6 hours', duration: '7 days' },
      '30d': { interval: '1 day', duration: '30 days' },
    };

    const { interval, duration } = intervals[timeRange];

    // Error rates over time
    const errorRates = await this.knex.raw(`
      SELECT 
        date_trunc('${interval}', created_at) as time_bucket,
        COUNT(*) as total_errors,
        COUNT(CASE WHEN status_code >= 500 THEN 1 END) as server_errors,
        COUNT(CASE WHEN status_code BETWEEN 400 AND 499 THEN 1 END) as client_errors
      FROM error_logs 
      WHERE created_at >= NOW() - INTERVAL '${duration}'
      GROUP BY time_bucket
      ORDER BY time_bucket
    `);

    // Response time percentiles
    const responseTimes = await this.knex.raw(`
      SELECT 
        date_trunc('${interval}', created_at) as time_bucket,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY response_time) as p50,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time) as p99,
        AVG(response_time) as avg_response_time
      FROM request_logs 
      WHERE created_at >= NOW() - INTERVAL '${duration}'
      GROUP BY time_bucket
      ORDER BY time_bucket
    `);

    // Top errors by frequency
    const topErrors = await this.knex('error_logs')
      .select('type', 'message')
      .count('* as count')
      .where('created_at', '>=', this.knex.raw(`NOW() - INTERVAL '${duration}'`))
      .groupBy('type', 'message')
      .orderBy('count', 'desc')
      .limit(10);

    // Endpoint performance
    const endpointStats = await this.knex.raw(`
      SELECT 
        endpoint,
        method,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
      FROM request_logs 
      WHERE created_at >= NOW() - INTERVAL '${duration}'
      GROUP BY endpoint, method
      ORDER BY request_count DESC
      LIMIT 20
    `);

    return {
      timeRange,
      interval,
      errorRates: errorRates.rows,
      responseTimes: responseTimes.rows,
      topErrors,
      endpointStats: endpointStats.rows,
      summary: await this.getMetricsSummary(duration),
    };
  }

  private async getMetricsSummary(duration: string) {
    const summary = await this.knex.raw(`
      SELECT 
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as total_errors,
        AVG(response_time) as avg_response_time,
        MAX(response_time) as max_response_time
      FROM request_logs 
      WHERE created_at >= NOW() - INTERVAL '${duration}'
    `);

    const errorBreakdown = await this.knex('error_logs')
      .select('type')
      .count('* as count')
      .where('created_at', '>=', this.knex.raw(`NOW() - INTERVAL '${duration}'`))
      .groupBy('type');

    return {
      ...summary.rows[0],
      errorBreakdown: Object.fromEntries(errorBreakdown.map((row) => [row.type, parseInt(row.count)])),
    };
  }

  async getAlertHistory(days: number = 7) {
    return await this.knex('alert_logs')
      .select('*')
      .where('created_at', '>=', this.knex.raw(`NOW() - INTERVAL '${days} days'`))
      .orderBy('created_at', 'desc')
      .limit(100);
  }

  async createMetricsSnapshot(): Promise<void> {
    const snapshot = {
      timestamp: new Date(),
      metrics: await this.getSystemMetrics('1h'),
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };

    await this.knex('metrics_snapshots').insert({
      id: randomUUID(),
      data: JSON.stringify(snapshot),
      created_at: snapshot.timestamp,
    });
  }
}
```

### Error Monitoring Routes

```typescript
// apps/api/src/modules/monitoring/monitoring.routes.ts
async function monitoringRoutes(fastify: FastifyInstance) {
  // Error logs endpoint for admin dashboard
  fastify.route({
    method: 'GET',
    url: '/errors',
    schema: {
      description: 'Get error logs with filtering and pagination',
      tags: ['Monitoring'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          type: { type: 'string', enum: Object.values(ErrorType) },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          endpoint: { type: 'string' },
          userId: { type: 'string', format: 'uuid' },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: { type: 'object' } },
            pagination: { $ref: 'pagination#' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const result = await fastify.errorStorage.getErrors(request.query);
      return reply.paginated(result.data, result.page, result.limit, result.total, 'Error logs retrieved');
    },
  });

  // System metrics dashboard
  fastify.route({
    method: 'GET',
    url: '/metrics/dashboard',
    schema: {
      description: 'Get comprehensive system metrics for dashboard',
      tags: ['Monitoring'],
      querystring: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'string',
            enum: ['1h', '24h', '7d', '30d'],
            default: '24h',
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const { timeRange } = request.query;
      const metrics = await fastify.metricsAggregation.getSystemMetrics(timeRange);
      return reply.success(metrics, 'System metrics retrieved');
    },
  });

  // Alert configuration
  fastify.route({
    method: 'GET',
    url: '/alerts/rules',
    schema: {
      description: 'Get alert rules configuration',
      tags: ['Monitoring'],
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const rules = fastify.alertService.getRules();
      return reply.success(rules, 'Alert rules retrieved');
    },
  });

  // Update alert rule
  fastify.route({
    method: 'PUT',
    url: '/alerts/rules/:id',
    schema: {
      description: 'Update alert rule',
      tags: ['Monitoring'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          threshold: { type: 'number' },
          timeWindow: { type: 'integer' },
          channels: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const { id } = request.params;
      const updated = await fastify.alertService.updateRule(id, request.body);
      return reply.success(updated, 'Alert rule updated');
    },
  });

  // Test alert
  fastify.route({
    method: 'POST',
    url: '/alerts/test',
    schema: {
      description: 'Trigger test alert',
      tags: ['Monitoring'],
      body: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const { ruleId, message } = request.body;
      await fastify.alertService.testAlert(ruleId, message);
      return reply.success({}, 'Test alert sent');
    },
  });
}
```

## Database Schema for Monitoring

### Error and Metrics Tables

```sql
-- Error logging table
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  correlation_id VARCHAR(255),
  request_id VARCHAR(255),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  retryable BOOLEAN DEFAULT false,
  sensitive BOOLEAN DEFAULT false,
  metadata JSONB,
  cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for error logs
CREATE INDEX idx_error_logs_type ON error_logs(type);
CREATE INDEX idx_error_logs_status_code ON error_logs(status_code);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_endpoint ON error_logs(endpoint);
CREATE INDEX idx_error_logs_correlation_id ON error_logs(correlation_id);

-- Request logs for performance monitoring
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time DECIMAL(10,2) NOT NULL, -- milliseconds
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  request_size INTEGER, -- bytes
  response_size INTEGER, -- bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for request logs
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at DESC);
CREATE INDEX idx_request_logs_endpoint ON request_logs(endpoint);
CREATE INDEX idx_request_logs_status_code ON request_logs(status_code);
CREATE INDEX idx_request_logs_response_time ON request_logs(response_time DESC);
CREATE INDEX idx_request_logs_correlation_id ON request_logs(correlation_id);

-- Alert logs
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  threshold DECIMAL(15,2) NOT NULL,
  context JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Metrics snapshots for historical data
CREATE TABLE metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_alert_logs_rule_id ON alert_logs(rule_id);
CREATE INDEX idx_alert_logs_severity ON alert_logs(severity);
CREATE INDEX idx_alert_logs_created_at ON alert_logs(created_at DESC);
CREATE INDEX idx_metrics_snapshots_created_at ON metrics_snapshots(created_at DESC);
```

### Data Retention Policies

```typescript
// apps/api/src/jobs/cleanup.job.ts
export class CleanupJob {
  constructor(
    private knex: Knex,
    private logger: FastifyBaseLogger,
  ) {}

  async runCleanup(): Promise<void> {
    this.logger.info('Starting cleanup job');

    try {
      // Clean up old error logs (keep 90 days)
      const errorLogsDeleted = await this.knex('error_logs').where('created_at', '<', this.knex.raw("CURRENT_DATE - INTERVAL '90 days'")).del();

      // Clean up old request logs (keep 30 days)
      const requestLogsDeleted = await this.knex('request_logs').where('created_at', '<', this.knex.raw("CURRENT_DATE - INTERVAL '30 days'")).del();

      // Clean up resolved alerts (keep 180 days)
      const alertsDeleted = await this.knex('alert_logs').whereNotNull('resolved_at').where('created_at', '<', this.knex.raw("CURRENT_DATE - INTERVAL '180 days'")).del();

      // Clean up old metrics snapshots (keep 1 year)
      const snapshotsDeleted = await this.knex('metrics_snapshots').where('created_at', '<', this.knex.raw("CURRENT_DATE - INTERVAL '1 year'")).del();

      this.logger.info(
        {
          errorLogsDeleted,
          requestLogsDeleted,
          alertsDeleted,
          snapshotsDeleted,
        },
        'Cleanup job completed',
      );
    } catch (error) {
      this.logger.error(
        {
          error: error.message,
        },
        'Cleanup job failed',
      );
    }
  }

  // Run vacuum to reclaim space after large deletes
  async runVacuum(): Promise<void> {
    try {
      await this.knex.raw('VACUUM ANALYZE error_logs');
      await this.knex.raw('VACUUM ANALYZE request_logs');
      await this.knex.raw('VACUUM ANALYZE alert_logs');
      await this.knex.raw('VACUUM ANALYZE metrics_snapshots');

      this.logger.info('Database vacuum completed');
    } catch (error) {
      this.logger.error({ error: error.message }, 'Database vacuum failed');
    }
  }
}
```

## Production Monitoring Setup

### Environment Configuration

```bash
# Monitoring environment variables
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# Alert configuration
ALERT_EMAIL_RECIPIENTS=admin@yourdomain.com,ops@yourdomain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ALERT_WEBHOOK_URL=https://your-monitoring-service.com/webhooks/alerts
WEBHOOK_API_KEY=your-webhook-api-key

# Monitoring thresholds
ALERT_ERROR_RATE_THRESHOLD=5
ALERT_RESPONSE_TIME_THRESHOLD=2000
ALERT_MEMORY_THRESHOLD=90
ALERT_DB_CONNECTION_THRESHOLD=80

# Data retention
ERROR_LOG_RETENTION_DAYS=90
REQUEST_LOG_RETENTION_DAYS=30
ALERT_LOG_RETENTION_DAYS=180
METRICS_RETENTION_DAYS=365
```

### Docker Health Checks

```dockerfile
# apps/api/Dockerfile
# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Readiness check script
COPY scripts/ready-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/ready-check.sh
```

```bash
#!/bin/bash
# scripts/ready-check.sh
#!/bin/bash

# Check if API is ready to serve requests
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/ready)

if [ "$response" = "200" ]; then
  exit 0
else
  exit 1
fi
```

### Kubernetes Monitoring

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      containers:
        - name: api
          image: your-api:latest
          ports:
            - containerPort: 3000

          # Health checks
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3

          # Resource limits for monitoring
          resources:
            requests:
              memory: '256Mi'
              cpu: '200m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

## Error Handling Best Practices

### 1. Error Classification

- **Client Errors (4xx)**: User fixable, log as warnings
- **Server Errors (5xx)**: System issues, log as errors, alert immediately
- **Security Errors**: Log with minimal details, alert security team
- **Business Errors**: Expected failures, log as info

### 2. Error Context

- **Always include**: Request ID, user ID, endpoint, timestamp
- **For debugging**: Stack trace (development only)
- **For audit**: IP address, user agent, request data
- **For monitoring**: Error type, retryable flag, correlation ID

### 3. Error Recovery

- **Retryable Errors**: Implement exponential backoff
- **Circuit Breakers**: Prevent cascade failures
- **Graceful Degradation**: Provide fallback responses
- **Dead Letter Queues**: Store failed operations for later processing

### 4. Monitoring Strategy

- **Real-time Alerts**: Critical errors, performance degradation
- **Dashboard Metrics**: Error rates, response times, system health
- **Historical Analysis**: Trends, patterns, capacity planning
- **SLA Monitoring**: Uptime, availability, performance targets

### 5. Privacy and Security

- **Redact Sensitive Data**: Passwords, tokens, PII in logs
- **Access Control**: Restrict monitoring dashboard access
- **Data Retention**: Comply with privacy regulations
- **Audit Trail**: Log all monitoring access and changes

### 6. Performance Considerations

- **Async Logging**: Don't block request processing
- **Batch Operations**: Group log writes for efficiency
- **Index Strategy**: Optimize queries for time-series data
- **Compression**: Use JSONB and compression for large logs

### 7. Integration Points

- **APM Tools**: Sentry, DataDog, New Relic integration
- **Log Aggregation**: ELK Stack, Splunk, CloudWatch
- **Alerting**: PagerDuty, Slack, email notifications
- **Dashboards**: Grafana, Kibana, custom admin panels
