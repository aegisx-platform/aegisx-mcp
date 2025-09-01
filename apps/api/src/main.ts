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
import responseHandlerPlugin from './plugins/response-handler.plugin';
import errorHandlerPlugin from './plugins/error-handler.plugin';
import schemasPlugin from './plugins/schemas.plugin';
import authStrategiesPlugin from './modules/auth/strategies/auth.strategies';
import authPlugin from './modules/auth/auth.plugin';

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
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
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

  // 7. Response handler
  await app.register(responseHandlerPlugin);

  // 8. Error handler
  await app.register(errorHandlerPlugin);

  // 9. Common schemas
  await app.register(schemasPlugin);

  // 10. Auth strategies
  await app.register(authStrategiesPlugin);

  // 11. Feature modules
  // Auth module
  await app.register(authPlugin);

  // Health check
  app.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  });

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