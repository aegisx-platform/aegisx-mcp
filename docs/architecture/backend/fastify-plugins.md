# Fastify Plugin Architecture & Configuration

## Plugin Registration Order

### Complete App Setup

```typescript
// apps/api/src/app.ts
import fastify from 'fastify';

const app = fastify({
  logger: process.env.NODE_ENV === 'production',
});

// 1. Configuration and environment
await app.register(import('@fastify/env'), {
  schema: {
    type: 'object',
    required: ['DATABASE_URL', 'JWT_ACCESS_SECRET'],
    properties: {
      DATABASE_URL: { type: 'string' },
      JWT_ACCESS_SECRET: { type: 'string' },
      JWT_REFRESH_SECRET: { type: 'string' },
      NODE_ENV: { type: 'string', default: 'development' },
    },
  },
});

// 2. Essential utilities and sensible defaults
await app.register(import('@fastify/sensible'));

// 3. Infrastructure plugins
await app.register(import('@fastify/cors'), {
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com', 'https://admin.yourdomain.com'] : true,
  credentials: true,
});

await app.register(import('@fastify/helmet'), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.yourdomain.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

await app.register(import('@fastify/rate-limit'), {
  global: true,
  max: 100,
  timeWindow: '1 minute',
});

await app.register(import('@fastify/under-pressure'), {
  maxEventLoopDelay: 1000,
  maxHeapUsedBytes: 100000000,
  maxRssBytes: 100000000,
  maxEventLoopUtilization: 0.98,
});

// 4. Database connection (Knex)
await app.register(import('./plugins/knex.plugin.js'));

// 5. Authentication
await app.register(import('@fastify/jwt'), {
  secret: {
    private: process.env.JWT_ACCESS_SECRET,
    public: process.env.JWT_ACCESS_SECRET,
  },
  sign: { expiresIn: '15m' },
});

// 6. Cookie support (for refresh tokens)
await app.register(import('@fastify/cookie'), {
  secret: process.env.JWT_REFRESH_SECRET,
  parseOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// 6.1. Authentication strategies
await app.register(import('@fastify/auth'));

// 6.2. Redis for caching & sessions
await app.register(import('@fastify/redis'), {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
});

// 6.3. File upload support
await app.register(import('@fastify/multipart'), {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
});

// 6.4. Form data parsing
await app.register(import('@fastify/formbody'), {
  bodyLimit: 1048576, // 1MB
});

// 6.5. Static file serving
await app.register(import('@fastify/static'), {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

// 6.6. WebSocket support
await app.register(import('@fastify/websocket'), {
  connectionOptions: {
    heartbeatInterval: 30000,
  },
});

// 7. Error handling
await app.register(import('./plugins/error-handler.plugin.js'));

// 8. Schema enforcement (ensures all routes have schemas)
await app.register(import('./plugins/schema-enforcement.plugin.js'));

// 9. Schemas and type providers
await app.register(import('./schemas/index.js'));

// 10. Feature modules (auto-loaded)
await app.register(import('@fastify/autoload'), {
  dir: path.join(__dirname, 'modules'),
  options: { prefix: '/api' },
});

// 11. Swagger documentation (last)
await app.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'Enterprise API',
      description: 'Enterprise monorepo API documentation',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development server' },
      { url: 'https://api.yourdomain.com', description: 'Production server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

await app.register(import('@fastify/swagger-ui'), {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});
```

## Essential Fastify Plugins

**Essential Fastify Plugins:**

```typescript
// package.json dependencies
{
  "@fastify/env": "^4.x",           // Environment configuration
  "@fastify/sensible": "^5.x",      // HTTP utilities & errors
  "@fastify/cors": "^9.x",          // CORS handling
  "@fastify/helmet": "^11.x",       // Security headers
  "@fastify/rate-limit": "^9.x",    // Rate limiting
  "@fastify/under-pressure": "^8.x", // Health monitoring
  "knex": "^3.x",                   // Query builder & migrations
  "pg": "^8.x",                     // PostgreSQL driver for Knex
  "@fastify/jwt": "^8.x",           // JWT authentication
  "@fastify/cookie": "^9.x",        // Cookie handling
  "@fastify/auth": "^4.x",          // Composite authentication strategies
  "@fastify/redis": "^6.x",         // Redis integration
  "@fastify/static": "^7.x",        // Static file serving
  "@fastify/websocket": "^10.x",    // WebSocket support
  "@fastify/multipart": "^8.x",     // File upload handling
  "@fastify/formbody": "^7.x",      // Form data parsing
  "@fastify/swagger": "^8.x",       // OpenAPI generation
  "@fastify/swagger-ui": "^4.x",    // API documentation UI
  "@fastify/autoload": "^5.x"       // Auto plugin loading
}
```

## Plugin Configuration Examples

### @fastify/helmet - Security Headers

```typescript
await app.register(import('@fastify/helmet'), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.yourdomain.com'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding
});
```

### @fastify/redis - Caching & Sessions

```typescript
await app.register(import('@fastify/redis'), {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  family: 4,
  lazyConnect: true,
});

// Usage in services
export class CacheService {
  constructor(private redis: Redis) {}

  async getUserCache(userId: string) {
    const cached = await this.redis.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setUserCache(userId: string, data: any, ttl: number = 300) {
    await this.redis.setex(`user:${userId}`, ttl, JSON.stringify(data));
  }
}
```

### @fastify/static - File Serving

```typescript
await app.register(import('@fastify/static'), {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
  decorateReply: false,
  schemaHide: true,
  serve: true,
  acceptRanges: true,
  cacheControl: true,
  dotfiles: 'ignore',
  etag: true,
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'],
  immutable: true,
  index: false,
  lastModified: true,
  maxAge: '1d',
});
```

### @fastify/websocket - Real-time Features

```typescript
await app.register(import('@fastify/websocket'), {
  connectionOptions: {
    heartbeatInterval: 30000,
    maxPayload: 1048576, // 1MB
  },
});

// WebSocket route
app.register(async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/ws/notifications',
    websocket: true,
    schema: {
      description: 'Real-time notifications websocket',
      tags: ['WebSocket'],
    },
    preHandler: [fastify.auth([fastify.verifyJWT])],
    wsHandler: (connection, request) => {
      const user = request.user as any;

      // Subscribe to user-specific notifications
      fastify.redis.subscribe(`notifications:${user.id}`);

      connection.socket.on('message', (message) => {
        // Handle incoming messages
      });

      connection.socket.on('close', () => {
        fastify.redis.unsubscribe(`notifications:${user.id}`);
      });
    },
  });
});
```

### @fastify/multipart - File Upload

```typescript
await app.register(import('@fastify/multipart'), {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
    headerPairs: 2000,
  },
  attachFieldsToBody: 'keyValues',
});

// File upload route
fastify.route({
  method: 'POST',
  url: '/upload',
  schema: {
    description: 'Upload files',
    tags: ['Files'],
    consumes: ['multipart/form-data'],
    body: {
      type: 'object',
      properties: {
        file: { type: 'object' },
        description: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              url: { type: 'string' },
              size: { type: 'number' },
            },
          },
        },
      },
    },
  },
  preHandler: [fastify.auth([fastify.verifyJWT])],
  handler: async (request, reply) => {
    const data = await request.file();
    const buffer = await data.file.toBuffer();

    // Save file logic
    const filename = `${Date.now()}-${data.filename}`;
    const filepath = path.join('./uploads', filename);

    await fs.writeFile(filepath, buffer);

    return reply.success(
      {
        filename,
        url: `/uploads/${filename}`,
        size: buffer.length,
      },
      'File uploaded successfully',
    );
  },
});
```

### @fastify/formbody - Form Data Parsing

```typescript
await app.register(import('@fastify/formbody'), {
  bodyLimit: 1048576, // 1MB
  parser: (str) => querystring.parse(str),
});

// Form submission route
fastify.route({
  method: 'POST',
  url: '/contact',
  schema: {
    description: 'Contact form submission',
    tags: ['Forms'],
    consumes: ['application/x-www-form-urlencoded'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        message: { type: 'string', minLength: 10 },
      },
      required: ['name', 'email', 'message'],
    },
  },
  handler: async (request, reply) => {
    const { name, email, message } = request.body as any;

    // Process form submission
    await fastify.emailService.sendContactForm({ name, email, message });

    return reply.success({}, 'Message sent successfully');
  },
});
```
