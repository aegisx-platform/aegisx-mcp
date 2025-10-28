/**
 * Plugin Loader
 *
 * Manages the loading and registration of Fastify plugins in proper order
 */

import type { FastifyInstance } from 'fastify';
import type { AppConfig, DatabaseConfig, SecurityConfig } from '../config';

// Import plugins
import fastifyAuth from '@fastify/auth';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';

import { activityLoggingPlugin } from '../plugins/activity-logging';
import errorHandlerPlugin from '../plugins/error-handler.plugin';
import healthCheckPlugin from '../plugins/health-check.plugin';
import jwtAuthPlugin from '../plugins/jwt-auth.plugin';
import knexPlugin from '../plugins/knex.plugin';
import loggingPlugin from '../plugins/logging.plugin';
import pluginMonitoring from '../plugins/monitoring.plugin';
import multipartPlugin from '../plugins/multipart.plugin';
import pdfExportPlugin from '../core/pdf-export';
import redisPlugin from '../plugins/redis.plugin';
import responseHandlerPlugin from '../plugins/response-handler.plugin';
import schemasPlugin from '../plugins/schemas.plugin';
import staticFilesPlugin from '../plugins/static-files.plugin';
import swaggerPlugin from '../plugins/swagger.plugin';

// Core infrastructure modules
import authPlugin from '../core/auth/auth.plugin';
import authStrategiesPlugin from '../core/auth/strategies/auth.strategies';
import { monitoringPlugin as monitoringModulePlugin } from '../core/monitoring';
import rbacPlugin from '../core/rbac/rbac.plugin';
import systemPlugin from '../core/system/default.plugin';
import { usersPlugin } from '../core/users';

// Core platform modules (now in core/)
import apiKeysPlugin from '../core/api-keys';
import fileUploadPlugin from '../core/file-upload/file-upload.plugin';
import navigationPlugin from '../core/navigation/navigation.plugin';
import settingsPlugin from '../core/settings/settings.plugin';
import systemSettingsPlugin from '../core/system-settings';
import userProfilePlugin from '../core/user-profile/user-profile.plugin';

// Business feature modules (ready for HIS, Inventory, etc.)
import websocketPlugin from '../shared/websocket/websocket.plugin';

/**
 * Plugin registration group interface
 */
export interface PluginGroup {
  name: string;
  description: string;
  plugins: PluginRegistration[];
}

export interface PluginRegistration {
  name: string;
  plugin: any;
  options?: any;
  required?: boolean;
}

/**
 * Create plugin groups with configurations
 */
export function createPluginGroups(
  appConfig: AppConfig,
  securityConfig: SecurityConfig,
  databaseConfig: DatabaseConfig,
): PluginGroup[] {
  return [
    {
      name: 'infrastructure',
      description: 'Core infrastructure plugins (logging, CORS, security)',
      plugins: [
        {
          name: 'logging',
          plugin: loggingPlugin,
          options: {
            enableRequestLogging: appConfig.logging.enableRequestLogging,
            enableFileRotation: appConfig.logging.enableFileRotation,
            logDirectory: appConfig.logging.directory,
          },
          required: true,
        },
        {
          name: 'cors',
          plugin: fastifyCors,
          options: securityConfig.cors,
          required: true,
        },
        {
          name: 'helmet',
          plugin: fastifyHelmet,
          options: securityConfig.helmet,
          required: true,
        },
        {
          name: 'rate-limit',
          plugin: fastifyRateLimit,
          options: {
            ...securityConfig.rateLimit,
            global: true,
          },
          required: true,
        },
      ],
    },

    {
      name: 'database',
      description: 'Database connections (PostgreSQL, Redis)',
      plugins: [
        {
          name: 'knex',
          plugin: knexPlugin,
          required: true,
        },
        {
          name: 'redis',
          plugin: redisPlugin,
          required: false, // Optional in development
        },
      ],
    },

    {
      name: 'monitoring',
      description: 'Monitoring and health check plugins',
      plugins: [
        {
          name: 'monitoring',
          plugin: pluginMonitoring,
          options: {
            enableDefaultMetrics: appConfig.performance.enableMonitoring,
            enableResourceMonitoring:
              appConfig.performance.enableResourceMonitoring,
            metricsPrefix: appConfig.performance.metricsPrefix,
          },
          required: true,
        },
        {
          name: 'health-check',
          plugin: healthCheckPlugin,
          options: {
            enableDetailedChecks: !appConfig.server.isProduction,
            databaseTimeout: databaseConfig.postgres.healthCheck.timeout,
            redisTimeout: databaseConfig.redis.healthCheck.timeout,
          },
          required: true,
        },
      ],
    },

    {
      name: 'authentication',
      description: 'Authentication and authorization plugins',
      plugins: [
        {
          name: 'jwt',
          plugin: fastifyJwt,
          options: {
            secret: securityConfig.jwt.secret,
            sign: {
              expiresIn: securityConfig.jwt.expiresIn,
            },
            cookie: {
              cookieName: securityConfig.jwt.cookieName,
              signed: false,
            },
          },
          required: true,
        },
        {
          name: 'cookie',
          plugin: fastifyCookie,
          options: {
            secret: securityConfig.session.secret,
            parseOptions: {
              httpOnly: securityConfig.session.httpOnly,
              secure: securityConfig.session.secure,
              sameSite: securityConfig.session.sameSite,
            },
          },
          required: true,
        },
        {
          name: 'auth',
          plugin: fastifyAuth,
          required: true,
        },
        {
          name: 'jwt-auth',
          plugin: jwtAuthPlugin,
          required: true,
        },
      ],
    },

    {
      name: 'middleware',
      description: 'Request/Response handling middleware',
      plugins: [
        {
          name: 'response-handler',
          plugin: responseHandlerPlugin,
          required: true,
        },
        {
          name: 'error-handler',
          plugin: errorHandlerPlugin,
          required: true,
        },
        {
          name: 'schemas',
          plugin: schemasPlugin,
          required: true,
        },
        {
          name: 'multipart',
          plugin: multipartPlugin,
          options: {
            maxFileSize: 100 * 1024 * 1024, // 100MB
            maxFiles: 10,
            maxFieldSize: 10 * 1024 * 1024, // 10MB
            maxFields: 20,
          },
          required: true,
        },
      ],
    },

    {
      name: 'application',
      description: 'Application-specific plugins',
      plugins: [
        {
          name: 'auth-strategies',
          plugin: authStrategiesPlugin,
          required: true,
        },
        {
          name: 'activity-logging',
          plugin: activityLoggingPlugin,
          options: {
            config: {
              enabled: process.env.ACTIVITY_LOGGING_ENABLED !== 'false',
              autoLogErrors: true,
              enableBatching: appConfig.server.isProduction,
              batchSize: 20,
              batchInterval: 5000,
              defaultConfig: {
                async: true,
                skipSuccessfulGets: true,
              },
            },
          },
          required: false,
        },
        {
          name: 'swagger',
          plugin: swaggerPlugin,
          required: !appConfig.server.isProduction,
        },
        {
          name: 'static-files',
          plugin: staticFilesPlugin,
          required: true,
        },
      ],
    },
  ];
}

/**
 * Create core infrastructure plugin group
 */
export function createCorePluginGroup(apiPrefix: string): PluginGroup {
  return {
    name: 'core-infrastructure',
    description: 'Core infrastructure modules (auth, users, rbac, monitoring)',
    plugins: [
      {
        name: 'system',
        plugin: systemPlugin,
        required: true,
      },
      {
        name: 'websocket',
        plugin: websocketPlugin,
        required: true,
      },
      {
        name: 'auth',
        plugin: authPlugin,
        required: true,
      },
      {
        name: 'users',
        plugin: usersPlugin,
        required: true,
      },
      {
        name: 'rbac',
        plugin: rbacPlugin,
        required: true,
      },
      {
        name: 'monitoring-module',
        plugin: monitoringModulePlugin,
        required: true,
      },
    ],
  };
}

/**
 * Create business feature plugin group
 */
export function createFeaturePluginGroup(apiPrefix: string): PluginGroup {
  return {
    name: 'business-features',
    description: 'Business feature modules (ready for HIS, Inventory, etc.)',
    plugins: [
      // Core platform plugins (used by business features)
      {
        name: 'api-keys',
        plugin: apiKeysPlugin,
        required: true,
      },
      {
        name: 'navigation',
        plugin: navigationPlugin,
        required: true,
      },
      {
        name: 'user-profile',
        plugin: userProfilePlugin,
        required: true,
      },
      {
        name: 'settings',
        plugin: settingsPlugin,
        required: true,
      },
      {
        name: 'system-settings',
        plugin: systemSettingsPlugin,
        required: true,
      },
      {
        name: 'file-upload',
        plugin: fileUploadPlugin,
        required: true,
      },
      {
        name: 'pdf-export',
        plugin: pdfExportPlugin,
        required: true,
      },
      // Business feature plugins will be added here by CRUD generator
    ],
  };
}

/**
 * Load a plugin group
 */
export async function loadPluginGroup(
  fastify: FastifyInstance,
  group: PluginGroup,
  options?: { prefix?: string },
  quiet = false,
): Promise<void> {
  if (!quiet) {
    console.log(
      `   📦 Loading ${group.name} (${group.plugins.length} plugins)...`,
    );
  }

  const startTime = Date.now();
  const results: {
    name: string;
    success: boolean;
    duration: number;
    error?: string;
  }[] = [];

  if (options?.prefix) {
    // Register all feature plugins together in a single context with prefix
    // This allows Fastify to properly resolve plugin dependencies
    await fastify.register(
      async (fastifyContext) => {
        for (const pluginReg of group.plugins) {
          const pluginStart = Date.now();

          try {
            await fastifyContext.register(pluginReg.plugin, pluginReg.options);

            const duration = Date.now() - pluginStart;
            results.push({ name: pluginReg.name, success: true, duration });

            // Suppress individual plugin logs for cleaner output
          } catch (error) {
            const duration = Date.now() - pluginStart;
            const errorMsg =
              error instanceof Error ? error.message : String(error);

            results.push({
              name: pluginReg.name,
              success: false,
              duration,
              error: errorMsg,
            });

            if (pluginReg.required) {
              console.error(
                `  ❌ ${pluginReg.name} FAILED (${duration}ms):`,
                errorMsg,
              );
              throw new Error(
                `Required plugin ${pluginReg.name} failed to load: ${errorMsg}`,
              );
            } else {
              console.warn(
                `  ⚠️ ${pluginReg.name} OPTIONAL FAILED (${duration}ms):`,
                errorMsg,
              );
            }
          }
        }
      },
      { prefix: options.prefix },
    );
  } else {
    // Register other plugins normally
    for (const pluginReg of group.plugins) {
      const pluginStart = Date.now();

      try {
        await fastify.register(pluginReg.plugin, pluginReg.options);

        const duration = Date.now() - pluginStart;
        results.push({ name: pluginReg.name, success: true, duration });

        // Suppress individual plugin logs for cleaner output
      } catch (error) {
        const duration = Date.now() - pluginStart;
        const errorMsg = error instanceof Error ? error.message : String(error);

        results.push({
          name: pluginReg.name,
          success: false,
          duration,
          error: errorMsg,
        });

        if (pluginReg.required) {
          console.error(
            `  ❌ ${pluginReg.name} FAILED (${duration}ms):`,
            errorMsg,
          );
          throw new Error(
            `Required plugin ${pluginReg.name} failed to load: ${errorMsg}`,
          );
        } else {
          console.warn(
            `  ⚠️ ${pluginReg.name} OPTIONAL FAILED (${duration}ms):`,
            errorMsg,
          );
        }
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;

  if (!quiet) {
    const status = successCount === results.length ? '✅' : '⚠️';
    console.log(
      `      ${status} ${group.name} completed - ${successCount}/${results.length} plugins (${totalDuration}ms)`,
    );
  }
}

/**
 * Load all plugin groups
 */
export async function loadAllPlugins(
  fastify: FastifyInstance,
  appConfig: AppConfig,
  securityConfig: SecurityConfig,
  databaseConfig: DatabaseConfig,
  quiet = false,
): Promise<void> {
  const startTime = Date.now();

  // Load core plugin groups
  const pluginGroups = createPluginGroups(
    appConfig,
    securityConfig,
    databaseConfig,
  );

  for (const group of pluginGroups) {
    await loadPluginGroup(fastify, group, undefined, quiet);
  }

  // Load core infrastructure and business features together
  // in single context to resolve dependencies
  const coreGroup = createCorePluginGroup(appConfig.api.prefix);
  const featureGroup = createFeaturePluginGroup(appConfig.api.prefix);

  // Combine plugins in proper dependency order
  const allApiPlugins: PluginGroup = {
    name: 'api-modules',
    description: 'All API modules (core + features) with API prefix',
    plugins: [
      ...coreGroup.plugins, // Core first (users, auth, etc.)
      ...featureGroup.plugins, // Features second (user-profile, etc.)
    ],
  };

  await loadPluginGroup(
    fastify,
    allApiPlugins,
    { prefix: appConfig.api.prefix },
    quiet,
  );

  const totalDuration = Date.now() - startTime;
  const totalPlugins =
    pluginGroups.reduce((sum, g) => sum + g.plugins.length, 0) +
    allApiPlugins.plugins.length;

  if (!quiet) {
    console.log(
      `   ✅ Plugin loading completed - ${totalPlugins} plugins loaded successfully (${totalDuration}ms)`,
    );
  }
}
