import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import fastifyAuth from '@fastify/auth';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';


// Import plugins
import knexPlugin from './plugins/knex.plugin';
import redisPlugin from './plugins/redis.plugin';
import responseHandlerPlugin from './plugins/response-handler.plugin';
import errorHandlerPlugin from './plugins/error-handler.plugin';
import schemasPlugin from './plugins/schemas.plugin';
import schemaEnforcementPlugin from './plugins/schema-enforcement.plugin';
import authStrategiesPlugin from './modules/auth/strategies/auth.strategies';
import authPlugin from './modules/auth/auth.plugin';
import navigationPlugin from './modules/navigation/navigation.plugin';
import userProfilePlugin from './modules/user-profile/user-profile.plugin';
import defaultPlugin from './modules/default/default.plugin';
import settingsPlugin from './modules/settings/settings.plugin';
import staticFilesPlugin from './plugins/static-files.plugin';
import jwtAuthPlugin from './plugins/jwt-auth.plugin';
import swaggerPlugin from './plugins/swagger.plugin';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // 1. Essential utilities and sensible defaults
  await app.register(fastifySensible);

  // 2. Infrastructure plugins
  await app.register(fastifyCors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com', 'https://admin.yourdomain.com']
      : true,
    credentials: true
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "http://localhost:3333", "http://127.0.0.1:3333"],
        workerSrc: ["'self'", "blob:"]
      }
    }
  });

  await app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute'
  });

  // 3. Database connection
  await app.register(knexPlugin);

  // 3.5. Redis connection (optional)
  await app.register(redisPlugin);

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
      sameSite: 'strict'
    }
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

  // 10. Schema enforcement (ensures all routes have schemas)
  await app.register(schemaEnforcementPlugin);

  // 11. Auth strategies
  await app.register(authStrategiesPlugin);

  // 12. Swagger documentation (before routes so it can capture them)
  await app.register(swaggerPlugin);

  // 13. Static files (before feature modules)
  await app.register(staticFilesPlugin);

  // 14. Feature modules
  // Default/System module (info, status, health endpoints)
  await app.register(defaultPlugin);
  
  // Auth module
  await app.register(authPlugin);
  
  // Navigation module
  await app.register(navigationPlugin);
  
  // User Profile module
  await app.register(userProfilePlugin);
  
  // Settings module
  await app.register(settingsPlugin);


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