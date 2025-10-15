/**
 * Database Configuration
 *
 * Configuration for PostgreSQL and Redis connections
 */

export interface DatabaseConfig {
  postgres: PostgresConfig;
  redis: RedisConfig;
}

export interface PostgresConfig {
  url: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
  healthCheck: {
    timeout: number;
  };
}

export interface RedisConfig {
  url?: string;
  host: string;
  port: number;
  password?: string;
  db: number;
  enabled: boolean;
  healthCheck: {
    timeout: number;
  };
}

/**
 * Load database configuration
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    postgres: {
      url: process.env.DATABASE_URL!,
      // Individual connection params (optional, for direct connection)
      host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST,
      port: process.env.DATABASE_PORT
        ? Number(process.env.DATABASE_PORT)
        : process.env.POSTGRES_PORT
          ? Number(process.env.POSTGRES_PORT)
          : undefined,
      database: process.env.DATABASE_NAME || process.env.POSTGRES_DB,
      user: process.env.DATABASE_USER || process.env.POSTGRES_USER,
      password: process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD,

      pool: {
        min: isTest ? 1 : 2,
        max: isTest ? 5 : isProduction ? 20 : 10,
        idleTimeoutMillis: isTest ? 1000 : 30000,
        acquireTimeoutMillis: 30000,
      },

      healthCheck: {
        timeout: Number(process.env.DATABASE_HEALTH_TIMEOUT) || 5000,
      },
    },

    redis: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB) || 0,
      enabled: !!process.env.REDIS_URL || isProduction,

      healthCheck: {
        timeout: Number(process.env.REDIS_HEALTH_TIMEOUT) || 3000,
      },
    },
  };
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(config: DatabaseConfig): string[] {
  const errors: string[] = [];

  // PostgreSQL validation
  if (!config.postgres.url) {
    errors.push('DATABASE_URL is required');
  } else {
    try {
      new URL(config.postgres.url);
    } catch {
      errors.push('DATABASE_URL is not a valid URL');
    }
  }

  // Redis validation (if enabled)
  if (config.redis.enabled) {
    if (config.redis.url) {
      try {
        new URL(config.redis.url);
      } catch {
        errors.push('REDIS_URL is not a valid URL');
      }
    } else if (!config.redis.host || !config.redis.port) {
      errors.push(
        'REDIS_HOST and REDIS_PORT are required when Redis is enabled',
      );
    }
  }

  return errors;
}

/**
 * Get database configuration summary (without sensitive data)
 */
export function getDatabaseConfigSummary(config: DatabaseConfig) {
  const postgresUrl = config.postgres.url;
  let postgresInfo = 'Not configured';

  try {
    const url = new URL(postgresUrl);
    postgresInfo = `${url.hostname}:${url.port}/${url.pathname.slice(1)}`;
  } catch {
    postgresInfo = 'Invalid URL';
  }

  return {
    postgres: {
      connection: postgresInfo,
      poolSize: `${config.postgres.pool.min}-${config.postgres.pool.max}`,
    },
    redis: {
      enabled: config.redis.enabled,
      connection: config.redis.enabled
        ? config.redis.url
          ? `${new URL(config.redis.url).hostname}:${new URL(config.redis.url).port}`
          : `${config.redis.host}:${config.redis.port}`
        : 'Disabled',
    },
  };
}
