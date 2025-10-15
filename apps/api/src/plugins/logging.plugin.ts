import fp from 'fastify-plugin';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyInstance {
    logger: winston.Logger;
  }

  interface FastifyRequest {
    id: string;
    correlationId: string;
  }
}

interface LoggingOptions {
  level?: string;
  enableRequestLogging?: boolean;
  enableFileRotation?: boolean;
  logDirectory?: string;
}

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      correlationId,
      requestId,
      method,
      url,
      statusCode,
      responseTime,
      stack,
      ...meta
    }) => {
      const logEntry: any = {
        timestamp,
        level: level.toUpperCase(),
        message,
        service: 'aegisx-api',
        environment: process.env.NODE_ENV || 'development',
        ...(correlationId && { correlationId }),
        ...(requestId && { requestId }),
        ...(method && { method }),
        ...(url && { url }),
        ...(statusCode && { statusCode }),
        ...(responseTime && { responseTime }),
        ...(stack && { stack }),
        ...meta,
      };

      return JSON.stringify(logEntry);
    },
  ),
);

function createLogger(options: LoggingOptions): winston.Logger {
  const logLevel =
    options.level ||
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  const logDirectory = options.logDirectory || 'logs';

  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      level: logLevel,
      format:
        process.env.NODE_ENV === 'production'
          ? structuredFormat
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.printf(
                ({ timestamp, level, message, correlationId, method, url }) => {
                  const correlation = correlationId
                    ? `[${(correlationId as string).slice(0, 8)}]`
                    : '';
                  const request = method && url ? `${method} ${url}` : '';
                  return `${timestamp} ${level} ${correlation} ${request} ${message}`;
                },
              ),
            ),
    }),
  ];

  // Add file rotation transports in production or when explicitly enabled
  if (options.enableFileRotation || process.env.NODE_ENV === 'production') {
    // Application logs
    transports.push(
      new DailyRotateFile({
        filename: `${logDirectory}/application-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: logLevel,
        format: structuredFormat,
        auditFile: `${logDirectory}/audit.json`,
      }),
    );

    // Error logs
    transports.push(
      new DailyRotateFile({
        filename: `${logDirectory}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: structuredFormat,
        auditFile: `${logDirectory}/error-audit.json`,
      }),
    );

    // Request logs (separate file for easier analysis)
    transports.push(
      new DailyRotateFile({
        filename: `${logDirectory}/requests-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '50m',
        maxFiles: '7d',
        level: 'info',
        format: structuredFormat,
        auditFile: `${logDirectory}/requests-audit.json`,
      }),
    );
  }

  return winston.createLogger({
    level: logLevel,
    format: structuredFormat,
    transports,
    // Don't exit on handled exceptions
    exitOnError: false,
    // Handle uncaught exceptions and rejections
    handleExceptions: true,
    handleRejections: true,
  });
}

async function loggingPlugin(
  fastify: FastifyInstance,
  options: LoggingOptions = {},
) {
  // Create Winston logger
  const logger = createLogger(options);

  // Replace Fastify's logger with Winston
  fastify.decorate('logger', logger);

  // Add correlation ID to requests
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Generate correlation ID if not present in headers
      const correlationId =
        (request.headers['x-correlation-id'] as string) || randomUUID();
      request.correlationId = correlationId;

      // Generate unique request ID
      request.id = randomUUID();

      // Add correlation ID to response headers
      reply.header('x-correlation-id', correlationId);
    },
  );

  // Request/Response logging middleware
  if (options.enableRequestLogging !== false) {
    fastify.addHook('onRequest', async (request: FastifyRequest) => {
      const startTime = Date.now();
      (request as any).startTime = startTime;

      logger.info('Incoming request', {
        correlationId: request.correlationId,
        requestId: request.id,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        headers:
          process.env.LOG_HEADERS === 'true' ? request.headers : undefined,
      });
    });

    fastify.addHook(
      'onResponse',
      async (request: FastifyRequest, reply: FastifyReply) => {
        const responseTime =
          Date.now() - ((request as any).startTime || Date.now());

        const logLevel =
          reply.statusCode >= 400
            ? 'error'
            : reply.statusCode >= 300
              ? 'warn'
              : 'info';

        logger.log(logLevel, 'Request completed', {
          correlationId: request.correlationId,
          requestId: request.id,
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          responseTime: `${responseTime}ms`,
          contentLength: reply.getHeader('content-length'),
        });
      },
    );

    // Log errors with full context
    fastify.addHook(
      'onError',
      async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
        logger.error('Request error', {
          correlationId: request.correlationId,
          requestId: request.id,
          method: request.method,
          url: request.url,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            statusCode: (error as any).statusCode,
          },
        });
      },
    );
  }

  // Logging plugin initialized (silent startup)
}

export default fp(loggingPlugin, {
  name: 'logging-plugin',
  fastify: '>=4.x',
});

export { LoggingOptions };
