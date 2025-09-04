# Environment & Configuration Management

## @fastify/env Plugin Setup

```typescript
// apps/api/src/app.ts
await app.register(import('@fastify/env'), {
  schema: {
    type: 'object',
    required: ['NODE_ENV', 'DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'],
    properties: {
      // Environment
      NODE_ENV: {
        type: 'string',
        enum: ['development', 'staging', 'production'],
        default: 'development',
      },

      // Server Configuration
      PORT: {
        type: 'integer',
        minimum: 1,
        maximum: 65535,
        default: 3000,
      },
      HOST: {
        type: 'string',
        default: '0.0.0.0',
      },
      API_PREFIX: {
        type: 'string',
        default: '/api',
      },

      // Database
      DATABASE_URL: {
        type: 'string',
        format: 'uri',
      },
      DB_POOL_MIN: {
        type: 'integer',
        minimum: 0,
        default: 2,
      },
      DB_POOL_MAX: {
        type: 'integer',
        minimum: 1,
        default: 10,
      },
      DB_CONNECTION_TIMEOUT: {
        type: 'integer',
        default: 30000,
      },

      // JWT Configuration
      JWT_ACCESS_SECRET: {
        type: 'string',
        minLength: 32,
      },
      JWT_REFRESH_SECRET: {
        type: 'string',
        minLength: 32,
      },
      JWT_ACCESS_EXPIRES_IN: {
        type: 'string',
        default: '15m',
      },
      JWT_REFRESH_EXPIRES_IN: {
        type: 'string',
        default: '7d',
      },

      // Redis Configuration
      REDIS_HOST: {
        type: 'string',
        default: 'localhost',
      },
      REDIS_PORT: {
        type: 'integer',
        minimum: 1,
        maximum: 65535,
        default: 6379,
      },
      REDIS_PASSWORD: {
        type: 'string',
      },
      REDIS_DB: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },

      // Security
      BCRYPT_ROUNDS: {
        type: 'integer',
        minimum: 8,
        maximum: 15,
        default: 12,
      },
      RATE_LIMIT_MAX: {
        type: 'integer',
        minimum: 1,
        default: 100,
      },
      RATE_LIMIT_TIMEWINDOW: {
        type: 'integer',
        default: 60000,
      },

      // CORS
      CORS_ORIGIN: {
        type: 'string',
        default: 'http://localhost:4200',
      },
      CORS_CREDENTIALS: {
        type: 'boolean',
        default: true,
      },

      // File Upload
      UPLOAD_MAX_SIZE: {
        type: 'integer',
        default: 10485760, // 10MB
      },
      UPLOAD_MAX_FILES: {
        type: 'integer',
        default: 5,
      },
      UPLOAD_PATH: {
        type: 'string',
        default: './uploads',
      },

      // Logging
      LOG_LEVEL: {
        type: 'string',
        enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
        default: 'info',
      },
      LOG_FILE_ENABLED: {
        type: 'boolean',
        default: false,
      },
      LOG_FILE_PATH: {
        type: 'string',
        default: '/var/log/api',
      },

      // Monitoring
      HEALTH_CHECK_ENABLED: {
        type: 'boolean',
        default: true,
      },
      METRICS_ENABLED: {
        type: 'boolean',
        default: true,
      },

      // External Services
      EMAIL_SERVICE_API_KEY: {
        type: 'string',
      },
      EMAIL_FROM: {
        type: 'string',
        format: 'email',
        default: 'noreply@yourdomain.com',
      },

      // Feature Flags
      FEATURE_WEBSOCKET_ENABLED: {
        type: 'boolean',
        default: true,
      },
      FEATURE_FILE_UPLOAD_ENABLED: {
        type: 'boolean',
        default: true,
      },
      FEATURE_AUDIT_LOGGING_ENABLED: {
        type: 'boolean',
        default: true,
      },
    },
  },
  dotenv: true, // Load from .env file
});
```

## Environment Configuration Plugin

```typescript
// apps/api/src/plugins/config.plugin.ts
import fp from 'fastify-plugin';

interface AppConfig {
  // Server
  port: number;
  host: string;
  apiPrefix: string;

  // Database
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
      timeout: number;
    };
  };

  // JWT
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };

  // Security
  security: {
    bcryptRounds: number;
    rateLimit: {
      max: number;
      timeWindow: number;
    };
  };

  // CORS
  cors: {
    origin: string | string[];
    credentials: boolean;
  };

  // File Upload
  upload: {
    maxSize: number;
    maxFiles: number;
    path: string;
  };

  // Logging
  logging: {
    level: string;
    fileEnabled: boolean;
    filePath: string;
  };

  // Features
  features: {
    websocket: boolean;
    fileUpload: boolean;
    auditLogging: boolean;
  };
}

export default fp(
  async function configPlugin(fastify: FastifyInstance) {
    // Build configuration object from environment
    const config: AppConfig = {
      port: fastify.config.PORT,
      host: fastify.config.HOST,
      apiPrefix: fastify.config.API_PREFIX,

      database: {
        url: fastify.config.DATABASE_URL,
        pool: {
          min: fastify.config.DB_POOL_MIN,
          max: fastify.config.DB_POOL_MAX,
          timeout: fastify.config.DB_CONNECTION_TIMEOUT,
        },
      },

      jwt: {
        accessSecret: fastify.config.JWT_ACCESS_SECRET,
        refreshSecret: fastify.config.JWT_REFRESH_SECRET,
        accessExpiresIn: fastify.config.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: fastify.config.JWT_REFRESH_EXPIRES_IN,
      },

      redis: {
        host: fastify.config.REDIS_HOST,
        port: fastify.config.REDIS_PORT,
        password: fastify.config.REDIS_PASSWORD,
        db: fastify.config.REDIS_DB,
      },

      security: {
        bcryptRounds: fastify.config.BCRYPT_ROUNDS,
        rateLimit: {
          max: fastify.config.RATE_LIMIT_MAX,
          timeWindow: fastify.config.RATE_LIMIT_TIMEWINDOW,
        },
      },

      cors: {
        origin: fastify.config.NODE_ENV === 'production' ? fastify.config.CORS_ORIGIN.split(',') : fastify.config.CORS_ORIGIN,
        credentials: fastify.config.CORS_CREDENTIALS,
      },

      upload: {
        maxSize: fastify.config.UPLOAD_MAX_SIZE,
        maxFiles: fastify.config.UPLOAD_MAX_FILES,
        path: fastify.config.UPLOAD_PATH,
      },

      logging: {
        level: fastify.config.LOG_LEVEL,
        fileEnabled: fastify.config.LOG_FILE_ENABLED,
        filePath: fastify.config.LOG_FILE_PATH,
      },

      features: {
        websocket: fastify.config.FEATURE_WEBSOCKET_ENABLED,
        fileUpload: fastify.config.FEATURE_FILE_UPLOAD_ENABLED,
        auditLogging: fastify.config.FEATURE_AUDIT_LOGGING_ENABLED,
      },
    };

    // Decorate fastify with config
    fastify.decorate('appConfig', config);

    // Log configuration on startup (without secrets)
    fastify.log.info(
      {
        environment: fastify.config.NODE_ENV,
        port: config.port,
        apiPrefix: config.apiPrefix,
        features: config.features,
        database: {
          pool: config.database.pool,
        },
        cors: config.cors,
      },
      'Application configuration loaded',
    );
  },
  {
    name: 'config-plugin',
    dependencies: ['env-plugin'],
  },
);

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    appConfig: AppConfig;
  }
}
```

## Environment File Templates

### Development (.env.development)

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/myapp_dev
DB_POOL_MIN=2
DB_POOL_MAX=5
DB_CONNECTION_TIMEOUT=30000

# JWT (Use different secrets for each environment)
JWT_ACCESS_SECRET=dev-access-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=dev-refresh-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_MAX=1000
RATE_LIMIT_TIMEWINDOW=60000

# CORS
CORS_ORIGIN=http://localhost:4200,http://localhost:4201
CORS_CREDENTIALS=true

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_MAX_FILES=5
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=debug
LOG_FILE_ENABLED=false
LOG_FILE_PATH=./logs

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# External Services
EMAIL_SERVICE_API_KEY=
EMAIL_FROM=dev@localhost

# Feature Flags
FEATURE_WEBSOCKET_ENABLED=true
FEATURE_FILE_UPLOAD_ENABLED=true
FEATURE_AUDIT_LOGGING_ENABLED=true
```

### Staging (.env.staging)

```bash
# Server Configuration
NODE_ENV=staging
PORT=3000
HOST=0.0.0.0
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://admin:staging_password@staging-db:5432/myapp_staging
DB_POOL_MIN=5
DB_POOL_MAX=15
DB_CONNECTION_TIMEOUT=30000

# JWT (Different secrets from dev/prod)
JWT_ACCESS_SECRET=staging-access-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=staging-refresh-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=staging-redis
REDIS_PORT=6379
REDIS_PASSWORD=staging_redis_password
REDIS_DB=0

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=500
RATE_LIMIT_TIMEWINDOW=60000

# CORS
CORS_ORIGIN=https://staging.yourdomain.com,https://admin-staging.yourdomain.com
CORS_CREDENTIALS=true

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_MAX_FILES=5
UPLOAD_PATH=/app/uploads

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/api

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# External Services
EMAIL_SERVICE_API_KEY=staging_email_api_key
EMAIL_FROM=noreply@staging.yourdomain.com

# Feature Flags
FEATURE_WEBSOCKET_ENABLED=true
FEATURE_FILE_UPLOAD_ENABLED=true
FEATURE_AUDIT_LOGGING_ENABLED=true
```

### Production (.env.production)

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
API_PREFIX=/api

# Database (Use secrets management in production)
DATABASE_URL=postgresql://admin:${DB_PASSWORD}@prod-db:5432/myapp_prod
DB_POOL_MIN=10
DB_POOL_MAX=30
DB_CONNECTION_TIMEOUT=30000

# JWT (Use secrets management)
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=prod-redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=60000

# CORS
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
CORS_CREDENTIALS=true

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_MAX_FILES=5
UPLOAD_PATH=/app/uploads

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/api

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# External Services
EMAIL_SERVICE_API_KEY=${EMAIL_API_KEY}
EMAIL_FROM=noreply@yourdomain.com

# Feature Flags
FEATURE_WEBSOCKET_ENABLED=true
FEATURE_FILE_UPLOAD_ENABLED=true
FEATURE_AUDIT_LOGGING_ENABLED=true
```

## Secrets Management

### Development Secrets

```typescript
// apps/api/src/utils/secrets.util.ts
export class SecretsManager {
  private static instance: SecretsManager;

  static getInstance(): SecretsManager {
    if (!this.instance) {
      this.instance = new SecretsManager();
    }
    return this.instance;
  }

  // Development: Use environment variables
  async getSecret(key: string): Promise<string> {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Secret ${key} not found`);
    }
    return value;
  }

  // Production: Integrate with secrets management service
  async getSecretFromVault(key: string): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
      // Integrate with AWS Secrets Manager, HashiCorp Vault, etc.
      // return await this.awsSecretsManager.getSecretValue(key);
      // return await this.vaultClient.read(key);
    }

    return this.getSecret(key);
  }
}
```

### AWS Secrets Manager Integration

```typescript
// apps/api/src/utils/aws-secrets.util.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class AWSSecretsManager {
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async getSecret(secretName: string): Promise<any> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.client.send(command);

      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      }

      throw new Error(`Secret ${secretName} not found`);
    } catch (error) {
      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }
}

// Usage in app startup
const secretsManager = new AWSSecretsManager();
const dbSecrets = await secretsManager.getSecret('prod/database');
const jwtSecrets = await secretsManager.getSecret('prod/jwt');

process.env.DATABASE_URL = dbSecrets.url;
process.env.JWT_ACCESS_SECRET = jwtSecrets.accessSecret;
process.env.JWT_REFRESH_SECRET = jwtSecrets.refreshSecret;
```

## Configuration Validation Plugin

```typescript
// apps/api/src/plugins/config-validation.plugin.ts
export default fp(
  async function configValidationPlugin(fastify: FastifyInstance) {
    // Validate configuration on startup
    fastify.addHook('onReady', async () => {
      const config = fastify.appConfig;

      // Validate database connection
      try {
        await fastify.knex.raw('SELECT 1');
        fastify.log.info('Database connection validated');
      } catch (error) {
        fastify.log.fatal('Database connection failed');
        throw error;
      }

      // Validate Redis connection (if enabled)
      if (config.redis.host) {
        try {
          await fastify.redis.ping();
          fastify.log.info('Redis connection validated');
        } catch (error) {
          fastify.log.error('Redis connection failed');
          // Don't fail startup for Redis in development
          if (process.env.NODE_ENV === 'production') {
            throw error;
          }
        }
      }

      // Validate JWT secrets
      if (config.jwt.accessSecret.length < 32) {
        throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
      }

      if (config.jwt.refreshSecret.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
      }

      // Validate upload directory exists
      if (config.features.fileUpload) {
        const fs = await import('fs/promises');
        try {
          await fs.access(config.upload.path);
        } catch {
          await fs.mkdir(config.upload.path, { recursive: true });
          fastify.log.info(`Created upload directory: ${config.upload.path}`);
        }
      }

      fastify.log.info('All configuration validated successfully');
    });
  },
  {
    name: 'config-validation-plugin',
    dependencies: ['config-plugin', 'knex-plugin'],
  },
);
```

## Feature Flag System

```typescript
// apps/api/src/services/feature-flag.service.ts
export class FeatureFlagService {
  constructor(private config: AppConfig) {}

  isEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  requireFeature(feature: keyof AppConfig['features']): void {
    if (!this.isEnabled(feature)) {
      throw new Error(`Feature ${feature} is not enabled`);
    }
  }
}

// Usage in routes
fastify.route({
  method: 'POST',
  url: '/upload',
  preHandler: [
    (request, reply, done) => {
      fastify.featureFlagService.requireFeature('fileUpload');
      done();
    },
    fastify.authenticate,
  ],
  handler: async (request, reply) => {
    // File upload logic
  },
});
```

## Environment-Specific Plugin Registration

```typescript
// apps/api/src/app.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Development-only plugins
if (isDevelopment) {
  await app.register(import('./plugins/dev-tools.plugin.js'));

  // More verbose logging in development
  await app.register(import('./plugins/debug-logger.plugin.js'));
}

// Production-only plugins
if (isProduction) {
  await app.register(import('./plugins/production-monitoring.plugin.js'));

  // Production security headers
  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });
}

// Feature-based plugin registration
if (fastify.appConfig.features.websocket) {
  await app.register(import('@fastify/websocket'));
  await app.register(import('./plugins/websocket.plugin.js'));
}

if (fastify.appConfig.features.fileUpload) {
  await app.register(import('@fastify/multipart'));
  await app.register(import('./plugins/file-upload.plugin.js'));
}

if (fastify.appConfig.features.auditLogging) {
  await app.register(import('./plugins/audit-logger.plugin.js'));
}
```

## Configuration Testing

```typescript
// apps/api/src/tests/config.test.ts
import { test, expect } from 'vitest';
import fastify from 'fastify';

test('should load development configuration', async () => {
  process.env.NODE_ENV = 'development';

  const app = fastify();
  await app.register(import('../plugins/env.plugin.js'));
  await app.register(import('../plugins/config.plugin.js'));

  await app.ready();

  expect(app.appConfig.port).toBe(3000);
  expect(app.appConfig.database.pool.min).toBe(2);
  expect(app.appConfig.logging.level).toBe('debug');

  await app.close();
});

test('should validate required environment variables', async () => {
  // Remove required env var
  delete process.env.DATABASE_URL;

  const app = fastify();

  await expect(app.register(import('../plugins/env.plugin.js'))).rejects.toThrow('DATABASE_URL is required');

  await app.close();
});

test('should validate JWT secret length', async () => {
  process.env.JWT_ACCESS_SECRET = 'short'; // Too short

  const app = fastify();
  await app.register(import('../plugins/env.plugin.js'));
  await app.register(import('../plugins/config.plugin.js'));

  await expect(app.ready()).rejects.toThrow('JWT_ACCESS_SECRET must be at least 32 characters');

  await app.close();
});
```

## Docker Environment Configuration

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS runtime

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Create directories
RUN mkdir -p /app/uploads /var/log/api && chown -R nodejs:nodejs /app /var/log/api

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs dist ./dist

# Environment defaults (can be overridden)
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
ENV UPLOAD_PATH=/app/uploads

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

CMD ["node", "dist/main.js"]
```

## Configuration Best Practices

### 1. Environment Variable Naming

```bash
# Use consistent prefixes
DATABASE_URL          # Infrastructure
DB_POOL_MIN          # Database specific
JWT_ACCESS_SECRET    # Authentication
REDIS_HOST           # External service
FEATURE_WEBSOCKET    # Feature flags
LOG_LEVEL            # Application behavior
```

### 2. Default Values Strategy

```typescript
// Provide sensible defaults for non-critical settings
const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  bcryptRounds: process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS) : 12,
};
```

### 3. Validation Rules

```typescript
// Validate critical configuration on startup
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (process.env.JWT_ACCESS_SECRET?.length < 32) {
  throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
}
```

### 4. Environment-Specific Behavior

```typescript
// Different behavior per environment
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

// CORS origins
const corsOrigins = isProd ? ['https://yourdomain.com'] : ['http://localhost:4200'];

// Rate limiting
const rateLimit = isProd ? 100 : 1000;

// Log level
const logLevel = isDev ? 'debug' : 'info';
```

## Docker Compose Environment

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ../apps/api
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:password@postgres:5432/myapp
      - JWT_ACCESS_SECRET=dev-access-secret-key-minimum-32-characters
      - JWT_REFRESH_SECRET=dev-refresh-secret-key-minimum-32-characters
      - REDIS_HOST=redis
      - LOG_LEVEL=debug
    env_file:
      - .env.development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ../uploads:/app/uploads
      - ../logs:/var/log/api
    ports:
      - '3000:3000'

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U admin -d myapp']
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'

volumes:
  postgres_data:
  redis_data:
```

## Configuration Loading Order

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  // 1. Load environment variables
  await import('dotenv/config');

  // 2. Create Fastify instance with logger
  const app = fastify({
    logger: getLoggerConfig(),
  });

  // 3. Register environment plugin (validates and provides typed config)
  await app.register(import('@fastify/env'), envOptions);

  // 4. Register configuration plugin (builds typed config object)
  await app.register(import('./plugins/config.plugin.js'));

  // 5. Register configuration validation
  await app.register(import('./plugins/config-validation.plugin.js'));

  // 6. Continue with other plugins...

  return app;
}
```

## Environment Variables Documentation

```typescript
// apps/api/src/types/env.types.ts
export interface EnvironmentVariables {
  // Server
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  HOST: string;
  API_PREFIX: string;

  // Database
  DATABASE_URL: string;
  DB_POOL_MIN: number;
  DB_POOL_MAX: number;
  DB_CONNECTION_TIMEOUT: number;

  // JWT
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;

  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_TIMEWINDOW: number;

  // CORS
  CORS_ORIGIN: string;
  CORS_CREDENTIALS: boolean;

  // File Upload
  UPLOAD_MAX_SIZE: number;
  UPLOAD_MAX_FILES: number;
  UPLOAD_PATH: string;

  // Logging
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  LOG_FILE_ENABLED: boolean;
  LOG_FILE_PATH: string;

  // External Services
  EMAIL_SERVICE_API_KEY?: string;
  EMAIL_FROM: string;

  // Feature Flags
  FEATURE_WEBSOCKET_ENABLED: boolean;
  FEATURE_FILE_UPLOAD_ENABLED: boolean;
  FEATURE_AUDIT_LOGGING_ENABLED: boolean;
}

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    config: EnvironmentVariables;
  }
}
```

## Configuration Best Practices

### 1. **Security First**

- Never commit secrets to version control
- Use different secrets for each environment
- Validate secret strength (minimum length, complexity)
- Rotate secrets regularly

### 2. **Environment Separation**

- Clear separation between dev/staging/prod
- Different database instances
- Different external service endpoints
- Different rate limits and timeouts

### 3. **Validation**

- Validate all configuration on startup
- Fail fast on invalid configuration
- Provide clear error messages
- Test configuration loading

### 4. **Documentation**

- Document all environment variables
- Provide example .env files
- Explain the purpose of each setting
- Include validation rules

### 5. **Feature Flags**

- Use feature flags for new functionality
- Allow disabling features in production
- Gradual rollout capabilities
- A/B testing support

### 6. **Monitoring**

- Log configuration changes
- Monitor configuration drift
- Alert on invalid configurations
- Track feature flag usage

## Development vs Production Differences

| Setting       | Development      | Production       |
| ------------- | ---------------- | ---------------- |
| Log Level     | debug            | info             |
| CORS Origins  | localhost:\*     | specific domains |
| Rate Limits   | High (1000/min)  | Lower (100/min)  |
| bcrypt Rounds | 10               | 12               |
| DB Pool Size  | 2-5              | 10-30            |
| Error Details | Full stack trace | Minimal info     |
| File Logging  | Disabled         | Enabled          |
| Health Checks | Optional         | Required         |
| Secrets       | .env file        | Secrets manager  |
