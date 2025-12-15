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

// DISABLED: Activity logging plugin depends on deleted user-profile module
// import { activityLoggingPlugin } from '../plugins/activity-logging';
import errorHandlerPlugin from '../plugins/error-handler.plugin';
import globalErrorHooksPlugin from '../plugins/global-error-hooks.plugin';
import healthCheckPlugin from '../plugins/health-check.plugin';
import jwtAuthPlugin from '../plugins/jwt-auth.plugin';
import knexPlugin from '../plugins/knex.plugin';
import loggingPlugin from '../plugins/logging.plugin';
import pluginMonitoring from '../plugins/monitoring.plugin';
import multipartPlugin from '../plugins/multipart.plugin';
import redisPlugin from '../plugins/redis.plugin';
import responseHandlerPlugin from '../plugins/response-handler.plugin';
import schemasPlugin from '../plugins/schemas.plugin';
import staticFilesPlugin from '../plugins/static-files.plugin';
import swaggerPlugin from '../plugins/swagger.plugin';

// Core infrastructure modules (kept from layers/)
import authPlugin from '../layers/core/auth/auth.plugin';
import permissionCachePlugin from '../layers/core/auth/permission-cache.plugin';
import authStrategiesPlugin from '../layers/core/auth/strategies/auth.strategies';
import { fileAuditPlugin } from '../layers/core/audit/file-audit';
import { loginAttemptsPlugin } from '../layers/core/audit/login-attempts';
import { monitoringPlugin as monitoringModulePlugin } from '../layers/core/monitoring';

// Platform layer modules (migrated to layers/platform/)
import platformDepartmentsPlugin from '../layers/platform/departments';
import { settingsPlugin as platformSettingsPlugin } from '../layers/platform/settings';
import { navigationPlugin as platformNavigationPlugin } from '../layers/platform/navigation';
import platformUsersPlugin from '../layers/platform/users';
import { platformRbacPlugin } from '../layers/platform/rbac';
import { platformFileUploadPlugin } from '../layers/platform/file-upload';
import { platformAttachmentPlugin } from '../layers/platform/attachments';
import platformPdfExportPlugin from '../layers/platform/pdf-export';
import { importDiscoveryPlugin as platformImportDiscoveryPlugin } from '../layers/platform/import';

// Business feature modules
import websocketPlugin from '../shared/websocket/websocket.plugin';
import inventoryDomainPlugin from '../layers/domains/inventory';
import adminPlugin from '../layers/domains/admin';

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
          name: 'global-error-hooks',
          plugin: globalErrorHooksPlugin,
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
          name: 'websocket',
          plugin: websocketPlugin,
          required: true,
        },
        {
          name: 'permission-cache',
          plugin: permissionCachePlugin,
          required: true,
        },
        {
          name: 'auth-strategies',
          plugin: authStrategiesPlugin,
          required: true,
        },
        // DISABLED: Activity logging plugin depends on deleted user-profile module
        // {
        //   name: 'activity-logging',
        //   plugin: activityLoggingPlugin,
        //   options: {
        //     config: {
        //       enabled: process.env.ACTIVITY_LOGGING_ENABLED !== 'false',
        //       autoLogErrors: true,
        //       enableBatching: appConfig.server.isProduction,
        //       batchSize: 20,
        //       batchInterval: 5000,
        //       defaultConfig: {
        //         async: true,
        //         skipSuccessfulGets: true,
        //       },
        //     },
        //   },
        //   required: false,
        // },
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
    description:
      'Core infrastructure modules (auth, users, rbac, monitoring, error-logs, login-attempts)',
    plugins: [
      // DISABLED: Old core system plugin removed
      // {
      //   name: 'system',
      //   plugin: systemPlugin,
      //   required: true,
      // },
      // NOTE: websocket plugin is loaded in "application" group, not here
      // to avoid duplicate registration when both old and new routes are enabled
      // DISABLED: authPlugin now loaded in createCoreLayerGroup (NEW layer-based architecture)
      // to avoid duplicate "authService" decorator error when both enableNewRoutes and enableOldRoutes are true
      // {
      //   name: 'auth',
      //   plugin: authPlugin,
      //   required: true,
      // },
      // OLD CORE USERS PLUGIN REMOVED - Now using layer-based plugin in createPlatformPluginGroup
      // {
      //   name: 'users',
      //   plugin: usersPlugin,
      //   required: true,
      // },
      // DISABLED: Old core departments plugin removed - Now using platformDepartmentsPlugin in createPlatformPluginGroup
      // {
      //   name: 'departments',
      //   plugin: departmentsPlugin,
      //   required: true,
      // },
      // DISABLED: Duplicate registration - Now only in createPlatformLayerGroup
      // {
      //   name: 'rbac',
      //   plugin: platformRbacPlugin,
      //   required: true,
      // },
      // DISABLED: These plugins now loaded in createCoreLayerGroup (NEW layer-based architecture)
      // to avoid duplicate route errors when both enableNewRoutes and enableOldRoutes are true
      // {
      //   name: 'monitoring-module',
      //   plugin: monitoringModulePlugin,
      //   required: true,
      // },
      // DISABLED: Old core error-logs plugin removed - Error logging now handled in monitoringModulePlugin
      // {
      //   name: 'error-logs',
      //   plugin: errorLogsPlugin,
      //   required: true,
      // },
      // {
      //   name: 'file-audit',
      //   plugin: fileAuditPlugin,
      //   required: true,
      // },
      // {
      //   name: 'login-attempts',
      //   plugin: loginAttemptsPlugin,
      //   required: true,
      // },
      // DISABLED: Duplicate registration - Now only in createPlatformLayerGroup
      // {
      //   name: 'import-discovery-plugin',
      //   plugin: platformImportDiscoveryPlugin,
      //   required: false, // Optional - system can run without import discovery
      // },
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
      // {
      //   name: 'testUsers',
      //   plugin: testUsersPlugin,
      //   required: true,
      // },
      // {
      //   name: 'testAuth',
      //   plugin: testAuthPlugin,
      //   required: true,
      // },
      // DISABLED: Admin Module - Now registered in createDomainsLayerGroup
      // {
      //   name: 'admin',
      //   plugin: adminPlugin,
      //   required: true,
      // },
      // DISABLED: Inventory Domain - Now registered in createDomainsLayerGroup
      // {
      //   name: 'inventory-domain',
      //   plugin: inventoryDomainPlugin,
      //   required: true,
      // },
      // User-Departments - depends on inventory-domain (uses DepartmentsRepository)
      // DISABLED: Plugin not imported
      // {
      //   name: 'user-departments',
      //   plugin: userDepartmentsPlugin,
      //   required: true,
      // },
      // DISABLED: Plugin not imported
      // {
      //   name: 'test-products',
      //   plugin: testProductsPlugin,
      //   required: true,
      // },
      // Core platform plugins (used by business features)
      // OLD CORE PLUGINS REMOVED - Now using layer-based plugins loaded in createPlatformPluginGroup
      // {
      //   name: 'api-keys',
      //   plugin: apiKeysPlugin,
      //   required: true,
      // },
      // DISABLED: navigation plugin now loaded in createPlatformLayerGroup (NEW layer-based architecture)
      // to avoid duplicate route errors when both enableNewRoutes and enableOldRoutes are true
      // {
      //   name: 'navigation',
      //   plugin: platformNavigationPlugin,
      //   required: true,
      // },
      // {
      //   name: 'user-profile',
      //   plugin: userProfilePlugin,
      //   required: true,
      // },
      // {
      //   name: 'settings',
      //   plugin: settingsPlugin,
      //   required: true,
      // },
      // {
      //   name: 'file-upload',
      //   plugin: fileUploadPlugin,
      //   required: true,
      // },
      // {
      //   name: 'attachments',
      //   plugin: attachmentPlugin,
      //   required: true,
      // },
      // {
      //   name: 'pdf-export',
      //   plugin: pdfExportPlugin,
      //   required: true,
      // },
      // Business feature plugins will be added here by CRUD generator
    ],
  };
}

/**
 * Create Core Layer plugin group
 *
 * Core layer contains infrastructure plugins (auth, monitoring, audit, security)
 * These plugins provide foundational capabilities used by all other layers
 */
export function createCoreLayerGroup(): PluginGroup {
  return {
    name: 'core-layer',
    description:
      'Core infrastructure layer (auth, monitoring, audit, security)',
    plugins: [
      // Auth module - authentication and authorization
      {
        name: 'core-auth',
        plugin: authPlugin,
        required: true,
      },
      // NOTE: auth-strategies is already loaded in "application" plugin group (old architecture)
      // Don't duplicate it here to avoid "decorator already added" error

      // Monitoring module - system monitoring
      {
        name: 'core-monitoring',
        plugin: monitoringModulePlugin,
        required: true,
      },
      // Audit modules - audit logging
      {
        name: 'core-file-audit',
        plugin: fileAuditPlugin,
        required: true,
      },
      {
        name: 'core-login-attempts',
        plugin: loginAttemptsPlugin,
        required: true,
      },
    ],
  };
}

/**
 * Create Platform Layer plugin group
 *
 * Platform layer contains shared service plugins (users, rbac, files, settings, departments)
 * These plugins are used by multiple business domains
 */
export function createPlatformLayerGroup(): PluginGroup {
  return {
    name: 'platform-layer',
    description:
      'Platform shared services layer (users, rbac, files, settings, departments)',
    plugins: [
      // Platform layer plugins loaded from apps/api/src/layers/platform/
      // Phase 3 Batch 1: departments (3.1), settings (3.2), navigation (3.3)
      // Phase 3 Batch 2: users (3.5), rbac (3.6), files (3.7), pdf/import (3.8)
      {
        name: 'platform-departments',
        plugin: platformDepartmentsPlugin,
        required: true,
      },
      {
        name: 'platform-settings',
        plugin: platformSettingsPlugin,
        required: true,
      },
      {
        name: 'platform-navigation',
        plugin: platformNavigationPlugin,
        required: true,
      },
      {
        name: 'platform-users',
        plugin: platformUsersPlugin,
        required: true,
      },
      {
        name: 'platform-rbac',
        plugin: platformRbacPlugin,
        required: true,
      },
      {
        name: 'platform-file-upload',
        plugin: platformFileUploadPlugin,
        required: true,
      },
      {
        name: 'platform-attachments',
        plugin: platformAttachmentPlugin,
        required: true,
      },
      {
        name: 'platform-pdf-export',
        plugin: platformPdfExportPlugin,
        required: true,
      },
      {
        name: 'platform-import-discovery',
        plugin: platformImportDiscoveryPlugin,
        required: false, // Optional - system can run without import discovery
      },
    ],
  };
}

/**
 * Create Domains Layer plugin group
 *
 * Domains layer contains business domain plugins (inventory, admin, hr, finance)
 * Each domain is isolated and does not depend on other domains
 */
export function createDomainsLayerGroup(): PluginGroup {
  return {
    name: 'domains-layer',
    description: 'Business domains layer (inventory, admin, hr, finance)',
    plugins: [
      // Domains layer plugins loaded from apps/api/src/layers/domains/
      // Phase 6: Migrated inventory and admin domains
      {
        name: 'admin',
        plugin: adminPlugin,
        required: true,
      },
      {
        name: 'inventory-domain',
        plugin: inventoryDomainPlugin,
        required: true,
      },
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
 *
 * Note: API prefix ("/api") should be applied at bootstrap level,
 * not here in plugin loader. Each plugin defines its own sub-route prefix.
 */
export async function loadAllPlugins(
  fastify: FastifyInstance,
  appConfig: AppConfig,
  securityConfig: SecurityConfig,
  databaseConfig: DatabaseConfig,
  quiet = false,
): Promise<void> {
  const startTime = Date.now();

  // Load core plugin groups (infrastructure, database, auth, middleware)
  const pluginGroups = createPluginGroups(
    appConfig,
    securityConfig,
    databaseConfig,
  );

  for (const group of pluginGroups) {
    await loadPluginGroup(fastify, group, undefined, quiet);
  }

  // Feature flags control which plugin groups to load
  const { enableNewRoutes, enableOldRoutes } = appConfig.features;

  if (!quiet && enableNewRoutes) {
    console.log('   🔄 New layer-based routes enabled');
  }
  if (!quiet && enableOldRoutes) {
    console.log('   🔄 Legacy routes enabled');
  }

  // Load new layer-based architecture (if enabled)
  if (enableNewRoutes) {
    const coreLayerGroup = createCoreLayerGroup();
    const platformLayerGroup = createPlatformLayerGroup();
    const domainsLayerGroup = createDomainsLayerGroup();

    // Load in layer dependency order: Core → Platform → Domains
    await loadPluginGroup(fastify, coreLayerGroup, undefined, quiet);
    await loadPluginGroup(fastify, platformLayerGroup, undefined, quiet);
    await loadPluginGroup(fastify, domainsLayerGroup, undefined, quiet);
  }

  // Load old plugin architecture (if enabled - backward compatibility)
  if (enableOldRoutes) {
    const coreGroup = createCorePluginGroup(appConfig.api.prefix);
    const featureGroup = createFeaturePluginGroup(appConfig.api.prefix);

    // Combine plugins in proper dependency order
    const allApiPlugins: PluginGroup = {
      name: 'api-modules',
      description: 'All API modules (core + features)',
      plugins: [
        ...coreGroup.plugins, // Core first (users, auth, rbac, etc.)
        ...featureGroup.plugins, // Features second (settings, attachments, etc.)
      ],
    };

    // Load all API plugins without prefix wrapper
    // Each plugin has its own route prefix (/auth, /users, /settings, etc.)
    await loadPluginGroup(fastify, allApiPlugins, undefined, quiet);
  }

  const totalDuration = Date.now() - startTime;

  // Calculate total plugins loaded based on which routes are enabled
  let totalPlugins = pluginGroups.reduce((sum, g) => sum + g.plugins.length, 0);

  if (enableNewRoutes) {
    const coreLayerGroup = createCoreLayerGroup();
    const platformLayerGroup = createPlatformLayerGroup();
    const domainsLayerGroup = createDomainsLayerGroup();
    totalPlugins +=
      coreLayerGroup.plugins.length +
      platformLayerGroup.plugins.length +
      domainsLayerGroup.plugins.length;
  }

  if (enableOldRoutes) {
    const coreGroup = createCorePluginGroup(appConfig.api.prefix);
    const featureGroup = createFeaturePluginGroup(appConfig.api.prefix);
    totalPlugins += coreGroup.plugins.length + featureGroup.plugins.length;
  }

  if (!quiet) {
    console.log(
      `   ✅ Plugin loading completed - ${totalPlugins} plugins loaded successfully (${totalDuration}ms)`,
    );
  }
}
