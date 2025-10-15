/**
 * Server Factory
 *
 * Creates and configures Fastify server instances with proper error handling
 */

import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import type { AppConfig } from '../config/app.config';

export interface ServerCreationOptions {
  config: AppConfig;
  enableLogger?: boolean;
  customOptions?: Partial<FastifyServerOptions>;
}

export interface ServerInfo {
  instance: FastifyInstance;
  startTime: number;
  environment: string;
  version: string;
}

/**
 * Create Fastify server instance with proper configuration
 */
export async function createServer(
  options: ServerCreationOptions,
): Promise<ServerInfo> {
  const { config, enableLogger = true, customOptions = {} } = options;

  console.log('🏗️ Creating Fastify server instance...');
  const startTime = Date.now();

  // Build Fastify options
  const fastifyOptions: FastifyServerOptions = {
    // Disable default Fastify logger - we'll use Winston instead
    logger: enableLogger,

    // Request ID generation
    genReqId: (request) => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Body parsing limits
    bodyLimit: 100 * 1024 * 1024, // 100MB

    // Plugin timeout
    pluginTimeout: 30000, // 30 seconds

    // Connection timeout
    connectionTimeout: 60000, // 60 seconds

    // Keep alive timeout
    keepAliveTimeout: 65000, // 65 seconds (should be higher than connectionTimeout)

    // Development vs Production settings
    ...(config.server.isDevelopment
      ? {
          // Development settings
          disableRequestLogging: false,
          requestIdHeader: 'x-request-id',
          requestIdLogLabel: 'reqId',
        }
      : {
          // Production settings
          disableRequestLogging: false, // We handle this via our logging plugin
          trustProxy: true, // Trust proxy headers in production
          requestIdHeader: 'x-request-id',
        }),

    // Custom options override
    ...customOptions,
  };

  // Create Fastify instance
  const fastify = Fastify(fastifyOptions);

  // Add server info to instance
  fastify.decorate('serverInfo', {
    startTime,
    environment: config.server.environment,
    version: config.api.version,
    apiPrefix: config.api.prefix,
  });

  // Set up server-level error handlers
  await setupServerErrorHandlers(fastify, config);

  // Set up development helpers
  if (config.server.isDevelopment) {
    await setupDevelopmentHelpers(fastify);
  }

  const creationTime = Date.now() - startTime;
  // Log moved to bootstrap for cleaner output

  return {
    instance: fastify,
    startTime,
    environment: config.server.environment,
    version: config.api.version,
  };
}

/**
 * Set up server-level error handlers
 */
async function setupServerErrorHandlers(
  fastify: FastifyInstance,
  config: AppConfig,
) {
  // Global uncaught exception handler
  process.on('uncaughtException', (error: Error) => {
    fastify.log.fatal({ err: error }, 'Uncaught exception');

    if (config.server.isProduction) {
      // In production, try to gracefully shutdown
      gracefulShutdown(fastify, 1);
    } else {
      // In development, exit immediately for debugging
      process.exit(1);
    }
  });

  // Global unhandled promise rejection
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    fastify.log.fatal({ reason, promise }, 'Unhandled promise rejection');

    if (config.server.isProduction) {
      gracefulShutdown(fastify, 1);
    } else {
      process.exit(1);
    }
  });

  // Server error event
  fastify.server.on('error', (error: Error) => {
    fastify.log.fatal({ err: error }, 'Server error');
  });

  // Connection error handling
  fastify.server.on('clientError', (error: Error, socket: any) => {
    fastify.log.warn({ err: error }, 'Client error');

    if (socket.writable && !socket.destroyed) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });
}

/**
 * Set up development helpers
 */
async function setupDevelopmentHelpers(fastify: FastifyInstance) {
  // Map to store request start times
  const requestTimes = new Map<string, number>();

  // Add request logging for development
  fastify.addHook('onRequest', async (request) => {
    const requestId = request.id;
    requestTimes.set(requestId, Date.now());
    request.log.info(`→ ${request.method} ${request.url}`);
  });

  // Add response time logging
  fastify.addHook('onSend', async (request, reply, payload) => {
    const requestId = request.id;
    const startTime = requestTimes.get(requestId) || Date.now();
    const responseTime = Date.now() - startTime;
    requestTimes.delete(requestId); // Cleanup
    request.log.info(`← ${reply.statusCode} (${responseTime}ms)`);
    return payload;
  });

  // Add plugin loading notifications
  fastify.addHook('onReady', async () => {
    console.log('🚀 Development server ready for connections');
  });
}

/**
 * Start the server
 */
export async function startServer(
  serverInfo: ServerInfo,
  config: AppConfig,
): Promise<void> {
  const { instance: fastify } = serverInfo;

  try {
    // Listen on configured host and port
    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    // Success logging moved to bootstrap for cleaner output
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(fastify: FastifyInstance, exitCode: number = 0) {
  console.log('⏳ Initiating graceful shutdown...');

  const shutdownTimeout = setTimeout(() => {
    console.log('⚠️ Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 10000); // 10 second timeout

  fastify.close(() => {
    clearTimeout(shutdownTimeout);
    console.log('✅ Server closed gracefully');
    process.exit(exitCode);
  });
}

/**
 * Set up graceful shutdown signal handlers
 */
export function setupGracefulShutdown(serverInfo: ServerInfo) {
  const { instance: fastify } = serverInfo;

  // Handle SIGTERM (e.g., from Docker, Kubernetes)
  process.on('SIGTERM', () => {
    console.log('📡 Received SIGTERM signal');
    gracefulShutdown(fastify, 0);
  });

  // Handle SIGINT (e.g., Ctrl+C)
  process.on('SIGINT', () => {
    console.log('📡 Received SIGINT signal');
    gracefulShutdown(fastify, 0);
  });
}

/**
 * Get server status information
 */
export function getServerStatus(serverInfo: ServerInfo) {
  const { instance: fastify, startTime } = serverInfo;
  const uptime = Date.now() - startTime;

  return {
    status: 'running',
    uptime: uptime,
    environment: serverInfo.environment,
    version: serverInfo.version,
    nodeVersion: process.version,
    processId: process.pid,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  };
}
