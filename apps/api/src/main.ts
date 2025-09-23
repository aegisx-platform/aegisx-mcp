import fastifyAuth from '@fastify/auth';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';
import * as dotenv from 'dotenv';
import Fastify from 'fastify';
import 'reflect-metadata'; // Required for tsyringe
// import fastifySensible from '@fastify/sensible'; // Removed - using custom response format

// Import plugins
import errorHandlerPlugin from './plugins/error-handler.plugin';
import healthCheckPlugin from './plugins/health-check.plugin';
import knexPlugin from './plugins/knex.plugin';
import loggingPlugin from './plugins/logging.plugin';
import pluginMonitoring from './plugins/monitoring.plugin';
import redisPlugin from './plugins/redis.plugin';
import responseHandlerPlugin from './plugins/response-handler.plugin';
import schemasPlugin from './plugins/schemas.plugin';
// import schemaEnforcementPlugin from './plugins/schema-enforcement.plugin';
import multipartPlugin from './plugins/multipart.plugin';
import { activityLoggingPlugin } from './plugins/activity-logging';
import authPlugin from './modules/auth/auth.plugin';
import authStrategiesPlugin from './modules/auth/strategies/auth.strategies';
import defaultPlugin from './modules/default/default.plugin';
import fileUploadPlugin from './modules/file-upload/file-upload.plugin';
import { monitoringPlugin as monitoringModulePlugin } from './modules/monitoring';
import navigationPlugin from './modules/navigation/navigation.plugin';
import settingsPlugin from './modules/settings/settings.plugin';
import userProfilePlugin from './modules/user-profile/user-profile.plugin';
import { usersPlugin } from './modules/users';
import rbacPlugin from './modules/rbac/rbac.plugin';
import jwtAuthPlugin from './plugins/jwt-auth.plugin';
import staticFilesPlugin from './plugins/static-files.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import websocketPlugin from './shared/websocket/websocket.plugin';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = Fastify({
    // Disable default logger - we'll use Winston instead
    logger: true,
  });

  // 1. Logging (must be first to capture all logs)
  await app.register(loggingPlugin, {
    enableRequestLogging: true,
    enableFileRotation: process.env.NODE_ENV === 'production',
    logDirectory: process.env.LOG_DIRECTORY || 'logs',
  });

  // 2. Infrastructure plugins
  const corsOrigins =
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [];

  await app.register(fastifyCors, {
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Dynamic CSP configuration based on environment
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4200';
  const webUrl = process.env.WEB_URL || 'http://localhost:4200';
  const apiUrl = process.env.API_URL || 'http://localhost:3333';

  // Parse URLs to extract hosts and origins for CSP
  const getOriginFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch {
      return url; // fallback for invalid URLs
    }
  };

  const apiOrigin = getOriginFromUrl(apiUrl);
  const webOrigin = getOriginFromUrl(webUrl);
  const baseOrigin = getOriginFromUrl(apiBaseUrl);

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdn.jsdelivr.net',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https:',
          'blob:',
          // Allow images from all configured origins
          webOrigin,
          baseOrigin,
          ...(webOrigin !== baseOrigin ? [baseOrigin] : []),
        ],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: [
          "'self'",
          // Allow connections to all configured API endpoints
          apiOrigin,
          webOrigin,
          ...(apiOrigin !== webOrigin ? [webOrigin] : []),
        ],
        workerSrc: ["'self'", 'blob:'],
      },
    },
  });

  await app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  });

  // 3. Database connection
  await app.register(knexPlugin);

  // 3.5. Redis connection (optional)
  await app.register(redisPlugin);

  // 3.6. Monitoring (after infrastructure)
  await app.register(pluginMonitoring, {
    enableDefaultMetrics: true,
    enableResourceMonitoring: true,
    metricsPrefix: 'aegisx_api_',
  });

  // 3.7. Health checks (after monitoring for dependencies)
  await app.register(healthCheckPlugin, {
    enableDetailedChecks: process.env.NODE_ENV !== 'production',
    databaseTimeout: 5000,
    redisTimeout: 3000,
  });

  // 4. Authentication
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
  });

  // 5. Cookie support (for refresh tokens)
  await app.register(fastifyCookie, {
    secret: process.env.SESSION_SECRET || 'my-secret',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });

  // 6. Authentication strategies
  await app.register(fastifyAuth);

  // 6.5. JWT Auth wrapper plugin
  await app.register(jwtAuthPlugin);

  // 7. Response handler
  await app.register(responseHandlerPlugin);

  // 8. Error handler
  await app.register(errorHandlerPlugin);

  // 9. Common schemas
  await app.register(schemasPlugin);

  // 10. Multipart support (global)
  await app.register(multipartPlugin, {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    maxFieldSize: 10 * 1024 * 1024, // 10MB
    maxFields: 20,
  });

  // 11. Schema enforcement (ensures all routes have schemas)
  // TODO: Re-enable after fixing all route schemas
  // await app.register(schemaEnforcementPlugin);

  // 12. Auth strategies
  await app.register(authStrategiesPlugin);

  // 12.5. Activity logging (after auth but before feature modules)
  await app.register(activityLoggingPlugin, {
    config: {
      enabled: process.env.ACTIVITY_LOGGING_ENABLED !== 'false',
      autoLogErrors: true,
      enableBatching: process.env.NODE_ENV === 'production',
      batchSize: 20,
      batchInterval: 5000,
      defaultConfig: {
        async: true,
        skipSuccessfulGets: true,
      },
    },
  });

  // 13. Swagger documentation (before routes so it can capture them)
  await app.register(swaggerPlugin);

  // 14. Static files (before feature modules)
  await app.register(staticFilesPlugin);

  // 15. WebSocket support (before feature modules that depend on it)
  await app.register(websocketPlugin);

  // 16. Feature modules
  // Default/System module (info, status, health endpoints)
  await app.register(defaultPlugin);

  // Auth module
  await app.register(authPlugin);

  // Navigation module
  await app.register(navigationPlugin);

  // Users management module (must be before user-profile)
  await app.register(usersPlugin);

  // User Profile module
  await app.register(userProfilePlugin);

  // Settings module
  await app.register(settingsPlugin);

  // RBAC module (after users and settings)
  await app.register(rbacPlugin);

  // File Upload module
  await app.register(fileUploadPlugin);

  // Monitoring module (client error logging)
  await app.register(monitoringModulePlugin);

  // Start server
  const port = process.env.PORT || 3333;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port: Number(port), host });
    console.log(`🚀 API is running on http://localhost:${port}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
