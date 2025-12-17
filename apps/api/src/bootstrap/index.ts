/**
 * Bootstrap Index
 *
 * Main entry point for server bootstrapping with comprehensive error handling
 * Uses Pino for structured logging + visual display for development
 */

import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import 'reflect-metadata'; // Required for tsyringe
import type pino from 'pino';

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

  try {
    // 1. Display banner (development only, before logger)
    displayStartupBanner();

    // 2. Create Pino logger (after banner, before structured logs)
    const logger = createPinoLogger();

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

    // 3. Load configurations
    logStep('⚙️', 'Loading application configurations');
    const configStartTime = Date.now();

    const appConfig = loadAppConfig();
    const securityConfig = loadSecurityConfig();
    const databaseConfig = loadDatabaseConfig();

    // Validate configurations
    const securityErrors = validateSecurityConfig(securityConfig);
    const databaseErrors = validateDatabaseConfig(databaseConfig);

    if (securityErrors.length > 0 || databaseErrors.length > 0) {
      console.error('\n❌ Configuration validation failed:');
      [...securityErrors, ...databaseErrors].forEach((error) => {
        console.error(`   ${error}`);
      });
      throw new Error('Invalid configuration');
    }

    const configLoadTime = Date.now() - configStartTime;
    logStepComplete('Configurations loaded & validated', configLoadTime);

    if (appConfig.server.isDevelopment) {
      logDetails('Configuration Summary', {
        server: `${appConfig.server.host}:${appConfig.server.port}`,
        environment: appConfig.server.environment,
        apiPrefix: appConfig.api.prefix
          ? `"${appConfig.api.prefix}"`
          : '(none - routes at root level)',
        cors: Array.isArray(securityConfig.cors.origin)
          ? `${securityConfig.cors.origin.length} origins`
          : 'configured',
        rateLimit: `${securityConfig.rateLimit.max}/min`,
        database: `PostgreSQL + Redis`,
      });
    }

    // 4. Create server
    logStep('🏗️', 'Creating Fastify server');
    const serverCreateStartTime = Date.now();

    const serverInfo = await createServer({
      config: appConfig,
      enableLogger: false, // Reduce noise
    });

    const serverCreateTime = Date.now() - serverCreateStartTime;
    logStepComplete('Fastify server created', serverCreateTime);

    // 5. Load plugins
    logStep('🔌', 'Loading application plugins');
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
            !appConfig.server.isDevelopment,
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
        !appConfig.server.isDevelopment,
      );
    }

    const pluginLoadTime = Date.now() - pluginLoadStartTime;
    logStepComplete('All plugins loaded successfully', pluginLoadTime);

    // 5.5. Register welcome route at root level with proper TypeBox schema
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

    // 6. Start server
    logStep('🚀', 'Starting HTTP server');
    const serverStartStartTime = Date.now();

    await startServer(serverInfo, appConfig);

    const serverStartTime = Date.now() - serverStartStartTime;
    logStepComplete('HTTP server started', serverStartTime);

    // 7. Setup graceful shutdown
    setupGracefulShutdown(serverInfo);

    // Calculate total time
    const totalTime = Date.now() - bootstrapStartTime;

    const startupMetrics = {
      totalTime,
      configLoadTime,
      serverCreateTime,
      pluginLoadTime,
      serverStartTime,
    };

    // Show final startup summary
    console.log('');
    console.log('🎉 AegisX Platform Ready!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
      `📍 Server: http://${appConfig.server.host}:${appConfig.server.port}`,
    );
    console.log(
      `🔗 API Prefix: ${appConfig.api.prefix ? `"${appConfig.api.prefix}"` : '(none - routes at root level)'}`,
    );
    console.log(`🌍 Environment: ${appConfig.server.environment}`);
    console.log(`📊 Startup Time: ${totalTime}ms`);
    console.log(`📦 Node Version: ${process.version}`);
    console.log(`🔧 Process ID: ${process.pid}`);

    if (!appConfig.server.isProduction) {
      console.log(
        `📚 Swagger UI: http://localhost:${appConfig.server.port}/documentation`,
      );
    }

    if (appConfig.server.isDevelopment) {
      console.log('');
      console.log('📊 Performance Metrics:');
      console.log(`   Environment: ${envTime}ms`);
      console.log(`   Config Load: ${configLoadTime}ms`);
      console.log(`   Server Create: ${serverCreateTime}ms`);
      console.log(`   Plugin Load: ${pluginLoadTime}ms`);
      console.log(`   Server Start: ${serverStartTime}ms`);
      console.log(`   ⏱️ Total: ${totalTime}ms`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Ready to accept connections!');
    console.log('');

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
    await handleBootstrapError(error, Date.now() - bootstrapStartTime);
    throw error;
  }
}

/**
 * Handle bootstrap errors with comprehensive logging
 */
async function handleBootstrapError(
  error: any,
  elapsedTime: number,
): Promise<void> {
  console.log('');
  console.error('💥 BOOTSTRAP FAILED');
  console.error('==================');
  console.error('');

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
