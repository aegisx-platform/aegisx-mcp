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

/**
 * Load and validate application configuration
 */
export function loadAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';

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
      prefix: process.env.API_PREFIX || '/api',
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
  };
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
  };
}
