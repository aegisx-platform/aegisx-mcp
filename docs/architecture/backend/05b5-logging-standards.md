# Logging Standards

## Fastify Built-in Logger (Pino)

```typescript
// apps/api/src/app.ts
const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: true,
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});
```

## Standard Log Levels & Usage

```typescript
// Log levels (ascending importance)
fastify.log.trace('Detailed debugging information');
fastify.log.debug('Debug information');
fastify.log.info('General information');
fastify.log.warn('Warning conditions');
fastify.log.error('Error conditions');
fastify.log.fatal('Critical errors that cause application exit');
```

## Request/Response Logging Plugin

```typescript
// apps/api/src/plugins/request-logger.plugin.ts
export default fp(
  async function requestLoggerPlugin(fastify: FastifyInstance) {
    // Log all incoming requests
    fastify.addHook('onRequest', async (request, reply) => {
      request.startTime = process.hrtime.bigint();

      fastify.log.info(
        {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
          userId: (request.user as any)?.id,
          requestId: request.id,
        },
        'Incoming request',
      );
    });

    // Log all responses
    fastify.addHook('onResponse', async (request, reply) => {
      const duration = Number(process.hrtime.bigint() - request.startTime!) / 1000000; // ms

      fastify.log.info(
        {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          responseTime: `${duration.toFixed(2)}ms`,
          userId: (request.user as any)?.id,
          requestId: request.id,
        },
        'Request completed',
      );
    });

    // Log errors with full context
    fastify.addHook('onError', async (request, reply, error) => {
      fastify.log.error(
        {
          error: {
            message: error.message,
            stack: error.stack,
            code: error.code,
          },
          request: {
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
            params: request.params,
            query: request.query,
          },
          userId: (request.user as any)?.id,
          requestId: request.id,
        },
        'Request error occurred',
      );
    });
  },
  {
    name: 'request-logger-plugin',
  },
);

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: bigint;
  }
}
```

## Business Logic Logging

```typescript
// apps/api/src/services/user.service.ts
export class UserService extends BaseService<User, CreateUserRequest, UpdateUserRequest> {
  constructor(
    userRepository: UserRepository,
    private logger: FastifyBaseLogger,
  ) {
    super(userRepository);
  }

  async create(data: CreateUserRequest): Promise<User> {
    this.logger.info(
      {
        action: 'user_create_start',
        email: data.email,
        username: data.username,
      },
      'Starting user creation',
    );

    try {
      await this.validateCreate(data);

      this.logger.debug(
        {
          action: 'user_create_validation_passed',
          email: data.email,
        },
        'User creation validation passed',
      );

      const user = await this.repository.create(data);

      this.logger.info(
        {
          action: 'user_created',
          userId: user.id,
          email: user.email,
          role: user.role.name,
        },
        'User created successfully',
      );

      return user;
    } catch (error) {
      this.logger.error(
        {
          action: 'user_create_failed',
          error: error.message,
          email: data.email,
        },
        'Failed to create user',
      );

      throw error;
    }
  }

  async update(id: string, data: UpdateUserRequest): Promise<User | null> {
    this.logger.info(
      {
        action: 'user_update_start',
        userId: id,
        fields: Object.keys(data),
      },
      'Starting user update',
    );

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        this.logger.warn(
          {
            action: 'user_update_not_found',
            userId: id,
          },
          'User not found for update',
        );
        return null;
      }

      await this.validateUpdate(id, data);
      const user = await this.repository.update(id, data);

      this.logger.info(
        {
          action: 'user_updated',
          userId: id,
          updatedFields: Object.keys(data),
        },
        'User updated successfully',
      );

      return user;
    } catch (error) {
      this.logger.error(
        {
          action: 'user_update_failed',
          userId: id,
          error: error.message,
        },
        'Failed to update user',
      );

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info(
      {
        action: 'user_delete_start',
        userId: id,
      },
      'Starting user deletion',
    );

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        this.logger.warn(
          {
            action: 'user_delete_not_found',
            userId: id,
          },
          'User not found for deletion',
        );
        return false;
      }

      await this.validateDelete(id);
      const deleted = await this.repository.delete(id);

      this.logger.warn(
        {
          action: 'user_deleted',
          userId: id,
          email: existing.email,
        },
        'User deleted successfully',
      );

      return deleted;
    } catch (error) {
      this.logger.error(
        {
          action: 'user_delete_failed',
          userId: id,
          error: error.message,
        },
        'Failed to delete user',
      );

      throw error;
    }
  }
}
```

## Audit Logging for Security

```typescript
// apps/api/src/plugins/audit-logger.plugin.ts
export default fp(
  async function auditLoggerPlugin(fastify: FastifyInstance) {
    // Audit hook for sensitive operations
    fastify.addHook('onResponse', async (request, reply) => {
      const sensitiveActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
      const sensitiveRoutes = ['/users', '/roles', '/permissions'];

      if (sensitiveActions.includes(request.method) && sensitiveRoutes.some((route) => request.url.includes(route))) {
        await fastify.auditService.logAction({
          userId: (request.user as any)?.id,
          action: `${request.method} ${request.url}`,
          resource: request.url.split('/')[2],
          resourceId: (request.params as any)?.id,
          requestBody: request.body,
          responseStatus: reply.statusCode,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          timestamp: new Date(),
        });
      }
    });
  },
  {
    name: 'audit-logger-plugin',
    dependencies: ['knex-plugin'],
  },
);
```

## Audit Service Implementation

```typescript
// apps/api/src/services/audit.service.ts
interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  requestBody?: any;
  responseStatus: number;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export class AuditService {
  constructor(
    private knex: Knex,
    private logger: FastifyBaseLogger,
  ) {}

  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      // Log to structured logger
      this.logger.info(
        {
          type: 'audit',
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          status: entry.responseStatus,
          ip: entry.ipAddress,
        },
        `Audit: ${entry.action}`,
      );

      // Store in database for compliance
      await this.knex('audit_logs').insert({
        user_id: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        details: JSON.stringify({
          requestBody: entry.requestBody,
          responseStatus: entry.responseStatus,
          userAgent: entry.userAgent,
          ...entry.details,
        }),
        ip_address: entry.ipAddress,
        created_at: entry.timestamp,
      });
    } catch (error) {
      this.logger.error(
        {
          error: error.message,
          auditEntry: entry,
        },
        'Failed to log audit entry',
      );
    }
  }

  async getAuditLogs(filters: { userId?: string; resource?: string; action?: string; dateFrom?: Date; dateTo?: Date; page?: number; limit?: number }) {
    const query = this.knex('audit_logs').leftJoin('users', 'audit_logs.user_id', 'users.id').select('audit_logs.*', 'users.email as user_email', 'users.first_name', 'users.last_name');

    if (filters.userId) query.where('audit_logs.user_id', filters.userId);
    if (filters.resource) query.where('audit_logs.resource', filters.resource);
    if (filters.action) query.where('audit_logs.action', 'ilike', `%${filters.action}%`);
    if (filters.dateFrom) query.where('audit_logs.created_at', '>=', filters.dateFrom);
    if (filters.dateTo) query.where('audit_logs.created_at', '<=', filters.dateTo);

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);

    const [logs, [{ total }]] = await Promise.all([
      query
        .orderBy('audit_logs.created_at', 'desc')
        .offset((page - 1) * limit)
        .limit(limit),
      query.clone().count('* as total'),
    ]);

    return {
      data: logs,
      total: parseInt(total as string),
    };
  }
}
```

## Database Schema for Audit Logs

```sql
-- database/migrations/[timestamp]_create_audit_logs.js
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

## Error Logging Standards

```typescript
// apps/api/src/plugins/error-logger.plugin.ts
export default fp(
  async function errorLoggerPlugin(fastify: FastifyInstance) {
    fastify.setErrorHandler(async (error, request, reply) => {
      const errorId = randomUUID();

      // Structured error logging
      const errorLog = {
        errorId,
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          statusCode: error.statusCode || 500,
          stack: error.stack,
        },
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
          params: request.params,
          query: request.query,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        user: {
          id: (request.user as any)?.id,
          email: (request.user as any)?.email,
          role: (request.user as any)?.role,
        },
        timestamp: new Date().toISOString(),
      };

      // Log based on severity
      if (error.statusCode && error.statusCode < 500) {
        // Client errors (4xx) - info level
        fastify.log.info(errorLog, `Client error: ${error.message}`);
      } else {
        // Server errors (5xx) - error level
        fastify.log.error(errorLog, `Server error: ${error.message}`);
      }

      // Send appropriate response
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (error.validation) {
        return reply.error('VALIDATION_ERROR', 'Invalid request data', 400, isDevelopment ? { errorId, details: error.validation } : { errorId });
      }

      if (error.statusCode && error.statusCode < 500) {
        return reply.error(error.code || 'CLIENT_ERROR', error.message, error.statusCode, { errorId });
      }

      // Server errors - don't expose details in production
      return reply.error('INTERNAL_SERVER_ERROR', isDevelopment ? error.message : 'An unexpected error occurred', 500, isDevelopment ? { errorId, stack: error.stack } : { errorId });
    });
  },
  {
    name: 'error-logger-plugin',
  },
);
```

## Performance Logging

```typescript
// apps/api/src/plugins/performance-logger.plugin.ts
export default fp(
  async function performanceLoggerPlugin(fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request) => {
      request.startTime = process.hrtime.bigint();
    });

    fastify.addHook('onResponse', async (request, reply) => {
      const duration = Number(process.hrtime.bigint() - request.startTime!) / 1000000; // ms

      // Log slow requests (>1000ms)
      if (duration > 1000) {
        fastify.log.warn(
          {
            type: 'slow_request',
            method: request.method,
            url: request.url,
            duration: `${duration.toFixed(2)}ms`,
            userId: (request.user as any)?.id,
            statusCode: reply.statusCode,
          },
          'Slow request detected',
        );
      }

      // Log all database operations that took too long
      if (duration > 500) {
        fastify.log.info(
          {
            type: 'performance',
            method: request.method,
            url: request.url,
            duration: `${duration.toFixed(2)}ms`,
            statusCode: reply.statusCode,
          },
          'Performance metrics',
        );
      }
    });
  },
  {
    name: 'performance-logger-plugin',
  },
);
```

## Security Event Logging

```typescript
// apps/api/src/plugins/security-logger.plugin.ts
export default fp(
  async function securityLoggerPlugin(fastify: FastifyInstance) {
    // Log authentication events
    fastify.addHook('onRequest', async (request) => {
      const authHeader = request.headers.authorization;
      const isAuthRoute = request.url.includes('/auth/');

      if (isAuthRoute || authHeader) {
        fastify.log.info(
          {
            type: 'security',
            event: 'auth_attempt',
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            hasAuthHeader: !!authHeader,
          },
          'Authentication attempt',
        );
      }
    });

    // Log authorization failures
    fastify.addHook('onError', async (request, reply, error) => {
      const securityErrors = ['UNAUTHORIZED', 'FORBIDDEN', 'INVALID_TOKEN', 'INSUFFICIENT_PERMISSIONS'];

      if (securityErrors.some((code) => error.message.includes(code))) {
        fastify.log.warn(
          {
            type: 'security',
            event: 'authorization_failed',
            error: error.message,
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            userId: (request.user as any)?.id,
          },
          'Security violation detected',
        );
      }
    });

    // Log successful sensitive operations
    fastify.addHook('onResponse', async (request, reply) => {
      const sensitiveOperations = ['DELETE', 'PATCH'];
      const sensitiveRoutes = ['/users/', '/roles/', '/permissions/'];

      if (sensitiveOperations.includes(request.method) && sensitiveRoutes.some((route) => request.url.includes(route)) && reply.statusCode >= 200 && reply.statusCode < 300) {
        fastify.log.warn(
          {
            type: 'security',
            event: 'sensitive_operation',
            action: `${request.method} ${request.url}`,
            userId: (request.user as any)?.id,
            ip: request.ip,
            statusCode: reply.statusCode,
          },
          'Sensitive operation completed',
        );
      }
    });
  },
  {
    name: 'security-logger-plugin',
  },
);
```

## Standard Log Message Format

```typescript
// Consistent log structure across all services
interface StandardLogContext {
  // Required fields
  action: string; // What happened (user_created, order_updated)

  // Optional context
  userId?: string; // Who performed the action
  resourceType?: string; // What resource (user, order, product)
  resourceId?: string; // Which specific resource

  // Performance
  duration?: string; // How long it took

  // Security
  ip?: string; // Source IP
  userAgent?: string; // User agent

  // Error context
  error?: string; // Error message
  errorCode?: string; // Error code

  // Additional metadata
  [key: string]: any;
}

// Usage examples:
fastify.log.info(
  {
    action: 'user_login_success',
    userId: user.id,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  },
  'User logged in successfully',
);

fastify.log.error(
  {
    action: 'database_connection_failed',
    error: error.message,
    duration: '5000ms',
  },
  'Database connection timeout',
);

fastify.log.warn(
  {
    action: 'rate_limit_exceeded',
    ip: request.ip,
    url: request.url,
    attempts: 10,
  },
  'Rate limit exceeded for IP',
);
```

## Log Correlation with Request ID

```typescript
// apps/api/src/plugins/correlation-id.plugin.ts
export default fp(
  async function correlationIdPlugin(fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request) => {
      // Use existing correlation ID or generate new one
      const correlationId = (request.headers['x-correlation-id'] as string) || randomUUID();
      request.correlationId = correlationId;

      // Add to all subsequent logs
      request.log = request.log.child({ correlationId });
    });

    fastify.addHook('onSend', async (request, reply, payload) => {
      // Add correlation ID to response headers
      reply.header('x-correlation-id', request.correlationId);
      return payload;
    });
  },
  {
    name: 'correlation-id-plugin',
  },
);

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    correlationId: string;
  }
}
```

## Environment-Based Configuration

```typescript
// apps/api/src/config/logger.config.ts
export const getLoggerConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

    // Development: Pretty printed logs
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: '{levelLabel} - {msg}',
          },
        }
      : undefined,

    // Production: Structured JSON logs
    formatters: isProduction
      ? {
          level: (label) => ({ level: label }),
          log: (object) => ({
            ...object,
            environment: process.env.NODE_ENV,
            service: 'api',
            version: process.env.APP_VERSION || '1.0.0',
          }),
        }
      : undefined,

    // Redact sensitive information
    redact: {
      paths: ['password', 'token', 'authorization', 'cookie', 'req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.confirmPassword'],
      censor: '[REDACTED]',
    },
  };
};
```

## Log Rotation & Management

```bash
# Production logging dependencies
# package.json
{
  "dependencies": {
    "pino": "^8.x",
    "pino-pretty": "^10.x",
    "pino-http": "^9.x"
  }
}

# Environment variables for log management
# .env
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/api/app.log
LOG_MAX_SIZE=100M
LOG_MAX_FILES=10
LOG_COMPRESSION=true
```

## Example Log Output

```json
// Development (pretty printed)
[2024-08-30 10:30:15] INFO (req-123): Incoming request
  method: "POST"
  url: "/api/users"
  userId: "user-456"
  ip: "192.168.1.100"

// Production (structured JSON)
{
  "level": "info",
  "time": "2024-08-30T10:30:15.123Z",
  "msg": "User created successfully",
  "correlationId": "req-123-abc",
  "action": "user_created",
  "userId": "user-456",
  "resourceType": "user",
  "resourceId": "user-789",
  "ip": "192.168.1.100",
  "duration": "45.2ms",
  "service": "api",
  "environment": "production",
  "version": "1.2.3"
}
```

## Monitoring Integration

```typescript
// apps/api/src/plugins/monitoring.plugin.ts
export default fp(
  async function monitoringPlugin(fastify: FastifyInstance) {
    // Health check with logging
    fastify.route({
      method: 'GET',
      url: '/health',
      schema: {
        description: 'Health check endpoint',
        tags: ['System'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              memory: { type: 'object' },
              database: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        const startTime = process.hrtime.bigint();

        try {
          // Check database connection
          await fastify.knex.raw('SELECT 1');
          const dbStatus = 'healthy';

          const duration = Number(process.hrtime.bigint() - startTime) / 1000000;

          const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: dbStatus,
            responseTime: `${duration.toFixed(2)}ms`,
          };

          fastify.log.debug(
            {
              type: 'health_check',
              status: 'healthy',
              responseTime: health.responseTime,
            },
            'Health check passed',
          );

          return reply.send(health);
        } catch (error) {
          fastify.log.error(
            {
              type: 'health_check',
              status: 'unhealthy',
              error: error.message,
            },
            'Health check failed',
          );

          return reply.code(503).send({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
          });
        }
      },
    });
  },
  {
    name: 'monitoring-plugin',
  },
);
```

## Plugin Registration Order

```typescript
// apps/api/src/app.ts - Add logging plugins
// 7. Logging plugins (after database, before modules)
await app.register(import('./plugins/correlation-id.plugin.js'));
await app.register(import('./plugins/request-logger.plugin.js'));
await app.register(import('./plugins/performance-logger.plugin.js'));
await app.register(import('./plugins/security-logger.plugin.js'));
await app.register(import('./plugins/audit-logger.plugin.js'));
await app.register(import('./plugins/error-logger.plugin.js'));
await app.register(import('./plugins/monitoring.plugin.js'));

// 8. Error handling (after logging)
await app.register(import('./plugins/error-handler.plugin.js'));
```

## Log Categories

### Application Logs

- **Request/Response**: HTTP traffic
- **Performance**: Slow queries, response times
- **Business Logic**: Service operations
- **Database**: Query execution, connection issues

### Security Logs

- **Authentication**: Login attempts, token validation
- **Authorization**: Permission checks, access denials
- **Audit Trail**: Sensitive operations, data changes
- **Rate Limiting**: Blocked requests, abuse detection

### System Logs

- **Health Checks**: Service health status
- **Resource Usage**: Memory, CPU, connections
- **Errors**: Application exceptions, stack traces
- **Startup/Shutdown**: Service lifecycle events

## Best Practices

1. **Structured Logging**: Always use structured data objects
2. **Correlation IDs**: Track requests across services
3. **Sensitive Data**: Redact passwords, tokens, PII
4. **Log Levels**: Use appropriate levels for different events
5. **Performance**: Log slow operations and bottlenecks
6. **Security**: Audit all sensitive operations
7. **Error Context**: Include full request context in errors
8. **Environment**: Different configs for dev/staging/prod
9. **Storage**: Database for audit, files for application logs
10. **Monitoring**: Integrate with monitoring systems

## Environment Variables

```bash
# Logging configuration
LOG_LEVEL=info                    # trace, debug, info, warn, error, fatal
LOG_FORMAT=json                   # json, pretty
LOG_FILE_ENABLED=true             # Enable file logging
LOG_FILE_PATH=/var/log/api/       # Log file directory
LOG_MAX_SIZE=100M                 # Max file size before rotation
LOG_MAX_FILES=30                  # Number of rotated files to keep
LOG_AUDIT_ENABLED=true            # Enable audit logging
LOG_PERFORMANCE_ENABLED=true      # Enable performance logging
LOG_SECURITY_ENABLED=true         # Enable security event logging

# Sensitive data redaction
LOG_REDACT_PASSWORDS=true
LOG_REDACT_TOKENS=true
LOG_REDACT_PII=true
```
