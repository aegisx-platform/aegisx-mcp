/**
 * Application Configuration
 *
 * Centralized configuration management for the Fastify application
 */

export interface AppConfig {
  server: ServerConfig;
  api: ApiConfig;
  logging: LoggingConfig;
  performance: PerformanceConfig;
  features: FeaturesConfig;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

export interface ApiConfig {
  prefix: string;
  version: string;
  title: string;
  description: string;
}

export interface LoggingConfig {
  level: string;
  directory: string;
  enableRequestLogging: boolean;
  enableFileRotation: boolean;
}

export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableResourceMonitoring: boolean;
  metricsPrefix: string;
}

export interface FeaturesConfig {
  enableNewRoutes: boolean;
  enableOldRoutes: boolean;
}

/**
 * Load and validate application configuration
 */
export function loadAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Load feature flags with sensible defaults (both true during migration phase)
  const enableNewRoutes = process.env.ENABLE_NEW_ROUTES !== 'false';
  const enableOldRoutes = process.env.ENABLE_OLD_ROUTES !== 'false';

  // Validate feature flags - prevent invalid states (both cannot be false)
  validateFeatureFlags(enableNewRoutes, enableOldRoutes);

  return {
    server: {
      port: Number(process.env.PORT) || 3333,
      host: process.env.HOST || '0.0.0.0',
      environment: nodeEnv,
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
      isTest: nodeEnv === 'test',
    },

    api: {
      prefix: process.env.API_PREFIX ?? '/api',
      version: process.env.API_VERSION || 'v1',
      title: 'AegisX Platform API',
      description: 'Enterprise-grade API for AegisX Platform',
    },

    logging: {
      level:
        process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
      directory: process.env.LOG_DIRECTORY || 'logs',
      enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
      enableFileRotation: nodeEnv === 'production',
    },

    performance: {
      enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
      enableResourceMonitoring:
        process.env.ENABLE_RESOURCE_MONITORING !== 'false',
      metricsPrefix: process.env.METRICS_PREFIX || 'aegisx_api_',
    },

    features: {
      enableNewRoutes,
      enableOldRoutes,
    },
  };
}

/**
 * Validate feature flag configuration
 *
 * Rules:
 * - At least one route set must be enabled (cannot have both false)
 * - During migration: both true (serving both old and new routes)
 * - Post-migration: only new routes enabled
 *
 * @throws Error if configuration is invalid
 */
function validateFeatureFlags(
  enableNewRoutes: boolean,
  enableOldRoutes: boolean,
): void {
  if (!enableNewRoutes && !enableOldRoutes) {
    throw new Error(
      'Invalid feature flag configuration: At least one of ENABLE_NEW_ROUTES or ENABLE_OLD_ROUTES must be true. ' +
        'Both routes cannot be disabled simultaneously as this would prevent all API access.',
    );
  }
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary(config: AppConfig) {
  return {
    server: `${config.server.host}:${config.server.port}`,
    environment: config.server.environment,
    apiPrefix: config.api.prefix,
    loggingLevel: config.logging.level,
    monitoringEnabled: config.performance.enableMonitoring,
    featuresNewRoutesEnabled: config.features.enableNewRoutes,
    featuresOldRoutesEnabled: config.features.enableOldRoutes,
  };
}
