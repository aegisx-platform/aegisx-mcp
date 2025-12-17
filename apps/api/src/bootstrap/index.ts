/**
 * Bootstrap Index
 *
 * Main entry point for server bootstrapping with comprehensive error handling
 * Uses Pino for structured logging + visual display for development
 */

import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import 'reflect-metadata'; // Required for tsyringe
import type { Logger } from 'pino';

// Configuration imports
import { loadAppConfig, type AppConfig } from '../config/app.config';
import {
  loadDatabaseConfig,
  validateDatabaseConfig,
  type DatabaseConfig,
} from '../config/database.config';
import {
  getEnvironmentInfo,
  validateEnvironmentOrThrow,
} from '../config/environment.validator';
import {
  loadSecurityConfig,
  validateSecurityConfig,
  type SecurityConfig,
} from '../config/security.config';
import { createPinoLogger } from '../config/logger.config';

// Bootstrap imports
import { WelcomeResponseSchema } from '../shared/schemas/welcome.schemas';
import { loadAllPlugins } from './plugin.loader';
import {
  createServer,
  setupGracefulShutdown,
  startServer,
  type ServerInfo,
} from './server.factory';
import {
  displayStartupBanner,
  displayStartupSummary,
  displayPerformanceMetrics,
} from './startup-display';

export interface BootstrapResult {
  server: ServerInfo;
  config: {
    app: AppConfig;
    security: SecurityConfig;
    database: DatabaseConfig;
  };
  startupMetrics: {
    totalTime: number;
    envTime: number;
    configLoadTime: number;
    serverCreateTime: number;
    pluginLoadTime: number;
    serverStartTime: number;
  };
}

/**
 * Main bootstrap function
 */
export async function bootstrap(): Promise<BootstrapResult> {
  const bootstrapStartTime = Date.now();

  // Store logger reference for error handling
  let logger: Logger | undefined;

  try {
    // 1. Display banner (development only, before logger)
    displayStartupBanner();

    // 2. Create Pino logger (after banner, before structured logs)
    logger = createPinoLogger();

    logger.info({ phase: 'bootstrap' }, 'Bootstrap starting');

    // 3. Load environment variables (.env.local overrides .env)
    logger.info({ phase: 'environment' }, 'Loading environment configuration');

    dotenv.config(); // Load .env first (defaults)
    dotenv.config({ path: '.env.local', override: true }); // Load .env.local (overrides)
    const env = { parsed: process.env };
    dotenvExpand.expand(env);

    // 4. Validate environment
    const envStartTime = Date.now();
    validateEnvironmentOrThrow();
    const envInfo = getEnvironmentInfo();
    const envTime = Date.now() - envStartTime;

    logger.info(
      {
        phase: 'environment',
        duration: envTime,
      },
      'Environment loaded & validated',
    );

    // 5. Load configurations
    logger.info({ phase: 'config' }, 'Loading application configurations');
    const configStartTime = Date.now();

    const appConfig = loadAppConfig();
    const securityConfig = loadSecurityConfig();
    const databaseConfig = loadDatabaseConfig();

    // Validate configurations
    const securityErrors = validateSecurityConfig(securityConfig);
    const databaseErrors = validateDatabaseConfig(databaseConfig);

    if (securityErrors.length > 0 || databaseErrors.length > 0) {
      logger.error(
        {
          phase: 'config',
          securityErrors,
          databaseErrors,
        },
        'Configuration validation failed',
      );
      throw new Error('Invalid configuration');
    }

    const configLoadTime = Date.now() - configStartTime;
    logger.info(
      {
        phase: 'config',
        duration: configLoadTime,
        server: `${appConfig.server.host}:${appConfig.server.port}`,
        environment: appConfig.server.environment,
        apiPrefix: appConfig.api.prefix || 'none',
        corsOrigins: Array.isArray(securityConfig.cors.origin)
          ? securityConfig.cors.origin.length
          : 'configured',
        rateLimit: securityConfig.rateLimit.max,
      },
      'Configurations loaded & validated',
    );

    // 6. Create server
    logger.info({ phase: 'server' }, 'Creating Fastify server');
    const serverCreateStartTime = Date.now();

    const serverInfo = await createServer({
      config: appConfig,
      enableLogger: false, // Using our Pino logger instead
      logger, // Pass our logger to Fastify
    });

    const serverCreateTime = Date.now() - serverCreateStartTime;
    logger.info(
      {
        phase: 'server',
        duration: serverCreateTime,
      },
      'Fastify server created',
    );

    // 7. Load plugins
    logger.info({ phase: 'plugins' }, 'Loading application plugins');
    const pluginLoadStartTime = Date.now();

    // Wrap all plugins with API prefix if configured
    if (appConfig.api.prefix) {
      await serverInfo.instance.register(
        async (app) => {
          await loadAllPlugins(
            app,
            appConfig,
            securityConfig,
            databaseConfig,
            logger,
          );
        },
        { prefix: appConfig.api.prefix },
      );
    } else {
      // No prefix - load plugins directly
      await loadAllPlugins(
        serverInfo.instance,
        appConfig,
        securityConfig,
        databaseConfig,
        logger,
      );
    }

    const pluginLoadTime = Date.now() - pluginLoadStartTime;
    logger.info(
      {
        phase: 'plugins',
        duration: pluginLoadTime,
      },
      'All plugins loaded',
    );

    // 7.5. Register welcome route at root level with proper TypeBox schema
    const typedFastify =
      serverInfo.instance.withTypeProvider<
        import('@fastify/type-provider-typebox').TypeBoxTypeProvider
      >();

    typedFastify.route({
      method: 'GET',
      url: '/',
      schema: {
        description:
          'Welcome to AegisX Platform API with logo and endpoint information',
        tags: ['System'],
        summary: 'Welcome endpoint',
        response: {
          200: WelcomeResponseSchema,
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  version: { type: 'string' },
                  requestId: { type: 'string' },
                  environment: { type: 'string' },
                },
              },
            },
          },
        },
      },
      handler: async (request, reply) => {
        const welcomeMessage = {
          message: 'Welcome to AegisX Platform API',
          description: 'Enterprise-Ready Full Stack Application',
          version: '1.1.1',
          environment: appConfig.server.environment,
          timestamp: new Date().toISOString(),
          endpoints: {
            api: appConfig.api.prefix,
            health: {
              live: `${appConfig.api.prefix}/health/live`,
              ready: `${appConfig.api.prefix}/health/ready`,
            },
            monitoring: {
              metrics: `${appConfig.api.prefix}/monitoring/metrics`,
            },
            documentation: '/documentation',
          },
          logo: [
            '     █████╗ ███████╗ ██████╗ ██╗███████╗██╗  ██╗',
            '    ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚██╗██╔╝',
            '    ███████║█████╗  ██║  ███╗██║███████╗ ╚███╔╝ ',
            '    ██╔══██║██╔══╝  ██║   ██║██║╚════██║ ██╔██╗ ',
            '    ██║  ██║███████╗╚██████╔╝██║███████║██╔╝ ██╗',
            '    ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝',
          ],
        };

        return reply.success(welcomeMessage, 'Welcome to AegisX Platform');
      },
    });

    // 8. Start server
    logger.info({ phase: 'server' }, 'Starting HTTP server');
    const serverStartStartTime = Date.now();

    await startServer(serverInfo, appConfig);

    const serverStartTime = Date.now() - serverStartStartTime;
    logger.info(
      {
        phase: 'server',
        duration: serverStartTime,
        host: appConfig.server.host,
        port: appConfig.server.port,
      },
      'HTTP server started',
    );

    // 9. Setup graceful shutdown
    setupGracefulShutdown(serverInfo);

    // Calculate total time
    const totalTime = Date.now() - bootstrapStartTime;

    const startupMetrics = {
      totalTime,
      envTime,
      configLoadTime,
      serverCreateTime,
      pluginLoadTime,
      serverStartTime,
    };

    // 10. Visual summary (development only)
    displayStartupSummary({
      host: appConfig.server.host,
      port: appConfig.server.port,
      environment: appConfig.server.environment,
      apiPrefix: appConfig.api.prefix,
      totalTime,
      nodeVersion: process.version,
      processId: process.pid,
      swaggerUrl: !appConfig.server.isProduction
        ? `http://localhost:${appConfig.server.port}/documentation`
        : undefined,
    });

    // 11. Performance metrics (development only)
    displayPerformanceMetrics({
      envTime,
      configLoadTime,
      serverCreateTime,
      pluginLoadTime,
      serverStartTime,
      totalTime,
    });

    // 12. Structured log for analytics (all environments)
    logger.info(
      {
        phase: 'bootstrap',
        status: 'completed',
        totalDuration: totalTime,
        server: `http://${appConfig.server.host}:${appConfig.server.port}`,
        environment: appConfig.server.environment,
        metrics: {
          envTime,
          configLoadTime,
          serverCreateTime,
          pluginLoadTime,
          serverStartTime,
        },
      },
      'Bootstrap completed',
    );

    return {
      server: serverInfo,
      config: {
        app: appConfig,
        security: securityConfig,
        database: databaseConfig,
      },
      startupMetrics,
    };
  } catch (error) {
    await handleBootstrapError(error, Date.now() - bootstrapStartTime, logger);
    throw error;
  }
}

/**
 * Handle bootstrap errors with comprehensive logging
 */
async function handleBootstrapError(
  error: any,
  elapsedTime: number,
  logger?: Logger,
): Promise<void> {
  const errorInfo = {
    message: error.message || 'Unknown error',
    stack: error.stack,
    type: error.constructor?.name || 'Error',
    elapsedTime: `${elapsedTime}ms`,
    environment: process.env.NODE_ENV || 'unknown',
    nodeVersion: process.version,
    processId: process.pid,
    timestamp: new Date().toISOString(),
  };

  // Log via Pino if available
  if (logger) {
    logger.error(
      {
        phase: 'bootstrap',
        status: 'failed',
        elapsedTime,
        error: errorInfo,
      },
      'Bootstrap failed',
    );
  }

  // Also output to console for visibility
  console.log('');
  console.error('💥 BOOTSTRAP FAILED');
  console.error('==================');
  console.error('');
  console.error('Error Details:');
  console.error(JSON.stringify(errorInfo, null, 2));
  console.error('');

  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: await sendErrorToMonitoring(errorInfo);
  }

  console.error('Bootstrap process terminated due to error');
  console.error('==========================================');
}

/**
 * Health check for bootstrap status
 */
export function getBootstrapHealth(): { status: string; uptime: number } {
  return {
    status: 'running',
    uptime: process.uptime() * 1000, // Convert to milliseconds
  };
}
