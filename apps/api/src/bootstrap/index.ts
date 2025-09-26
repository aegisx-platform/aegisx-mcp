/**
 * Bootstrap Index
 *
 * Main entry point for server bootstrapping with comprehensive error handling
 */

import * as dotenv from 'dotenv';
import 'reflect-metadata'; // Required for tsyringe

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

// Bootstrap imports
import { WelcomeResponseSchema } from '../core/system/default.schemas';
import { loadAllPlugins } from './plugin.loader';
import {
  createServer,
  setupGracefulShutdown,
  startServer,
  type ServerInfo,
} from './server.factory';

/**
 * Bootstrap logging utilities
 */
function logStep(icon: string, message: string): void {
  console.log(`${icon} ${message}...`);
}

function logStepComplete(message: string, duration?: number): void {
  const timeStr = duration ? ` (${duration}ms)` : '';
  console.log(`   ✅ ${message}${timeStr}`);
}

function logDetails(title: string, details: Record<string, any>): void {
  console.log(`   📋 ${title}:`);
  Object.entries(details).forEach(([key, value]) => {
    console.log(`      ${key}: ${value}`);
  });
}

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
    // Display AegisX logo
    console.log('');
    console.log('     █████╗ ███████╗ ██████╗ ██╗███████╗██╗  ██╗');
    console.log('    ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚██╗██╔╝');
    console.log('    ███████║█████╗  ██║  ███╗██║███████╗ ╚███╔╝ ');
    console.log('    ██╔══██║██╔══╝  ██║   ██║██║╚════██║ ██╔██╗ ');
    console.log('    ██║  ██║███████╗╚██████╔╝██║███████║██╔╝ ██╗');
    console.log('    ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝');
    console.log('');
    console.log('    🛡️  Enterprise-Ready Full Stack Application  🛡️');
    console.log('');
    console.log('🚀 AegisX Platform API - Starting Bootstrap Process');
    console.log('================================================');
    console.log('');

    // 1. Load environment variables
    logStep('🔧', 'Loading environment configuration');
    dotenv.config();

    // 2. Validate environment
    const envStartTime = Date.now();
    validateEnvironmentOrThrow();
    const envInfo = getEnvironmentInfo();
    const envTime = Date.now() - envStartTime;

    logStepComplete('Environment loaded & validated', envTime);

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
        apiPrefix: appConfig.api.prefix,
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

    await loadAllPlugins(
      serverInfo.instance,
      appConfig,
      securityConfig,
      databaseConfig,
      !appConfig.server.isDevelopment, // quiet mode for non-dev
    );

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
            health: `${appConfig.api.prefix}/health`,
            info: `${appConfig.api.prefix}/info`,
            status: `${appConfig.api.prefix}/status`,
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
    console.log(`🔗 API Prefix: ${appConfig.api.prefix}`);
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
