# API Gateway & Rate Limiting

## API Gateway Plugin Architecture

### Gateway Plugin Setup

```typescript
// apps/api/src/plugins/api-gateway.plugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

interface ApiGatewayOptions {
  version: string;
  rateLimit: {
    global: number;
    perUser: number;
    perEndpoint: { [key: string]: number };
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
}

const apiGatewayPlugin: FastifyPluginAsync<ApiGatewayOptions> = async (fastify, options) => {
  // API versioning middleware
  fastify.addHook('onRequest', async (request, reply) => {
    const version = request.headers['api-version'] || options.version || 'v1';
    request.apiVersion = version;
  });

  // Global rate limiting
  await fastify.register(import('@fastify/rate-limit'), {
    global: true,
    max: options.rateLimit.global || 1000,
    timeWindow: '1 minute',
    skipOnError: false,
    keyGenerator: (request) => {
      return request.user?.id || request.ip;
    },
    errorResponseBuilder: (request, context) => {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Try again in ${Math.round(context.ttl / 1000)} seconds.`,
        retryAfter: context.ttl,
      };
    },
  });

  // Per-endpoint rate limiting
  const endpointLimiter = new Map();
  for (const [endpoint, limit] of Object.entries(options.rateLimit.perEndpoint)) {
    endpointLimiter.set(endpoint, {
      max: limit,
      timeWindow: '1 minute',
    });
  }

  fastify.decorate('endpointLimiter', endpointLimiter);

  // Request tracking
  const requestTracker = new RequestTracker(fastify);
  fastify.decorate('requestTracker', requestTracker);

  // API key validation
  const apiKeyValidator = new ApiKeyValidator(fastify);
  fastify.decorate('apiKeyValidator', apiKeyValidator);
};

export default fp(apiGatewayPlugin, {
  name: 'api-gateway-plugin',
  dependencies: ['redis-plugin'],
});

declare module 'fastify' {
  interface FastifyRequest {
    apiVersion: string;
  }
  interface FastifyInstance {
    endpointLimiter: Map<string, any>;
    requestTracker: RequestTracker;
    apiKeyValidator: ApiKeyValidator;
  }
}
```

### API Versioning Strategy

```typescript
// apps/api/src/middleware/versioning.middleware.ts
export class ApiVersioningMiddleware {
  static createVersionedRoute(fastify: FastifyInstance, baseRoute: string, versions: { [version: string]: any }) {
    fastify.route({
      method: 'GET',
      url: baseRoute,
      preHandler: async (request, reply) => {
        const version = request.apiVersion;
        const handler = versions[version];

        if (!handler) {
          return reply.badRequest(`API version ${version} not supported`);
        }

        request.versionHandler = handler;
      },
      handler: async (request, reply) => {
        return request.versionHandler(request, reply);
      },
    });
  }
}

// Usage example
ApiVersioningMiddleware.createVersionedRoute(fastify, '/api/users', {
  v1: async (request, reply) => {
    // v1 implementation
    const users = await fastify.userService.getUsers();
    return reply.success(users);
  },
  v2: async (request, reply) => {
    // v2 implementation with additional fields
    const users = await fastify.userServiceV2.getUsersWithProfiles();
    return reply.success(users);
  },
});
```

## Advanced Rate Limiting

### Multi-tier Rate Limiting

```typescript
// apps/api/src/services/rate-limiting.service.ts
export class RateLimitingService {
  constructor(private fastify: FastifyInstance) {}

  // Create dynamic rate limiter
  createDynamicLimiter(config: RateLimitConfig) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const key = this.generateKey(request, config.keyStrategy);
      const limit = await this.getLimit(request, config);
      const window = config.timeWindow;

      const current = await this.fastify.redis.incr(key);

      if (current === 1) {
        await this.fastify.redis.expire(key, window);
      }

      if (current > limit) {
        const ttl = await this.fastify.redis.ttl(key);

        reply.header('X-RateLimit-Limit', limit);
        reply.header('X-RateLimit-Remaining', 0);
        reply.header('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000));

        return reply.tooManyRequests(`Rate limit exceeded. Try again in ${ttl} seconds.`);
      }

      reply.header('X-RateLimit-Limit', limit);
      reply.header('X-RateLimit-Remaining', Math.max(0, limit - current));
    };
  }

  private async getLimit(request: FastifyRequest, config: RateLimitConfig): Promise<number> {
    // Different limits based on user tier
    if (request.user) {
      const user = request.user as any;
      const tier = user.tier || 'basic';

      return config.tierLimits[tier] || config.defaultLimit;
    }

    return config.anonymousLimit || config.defaultLimit;
  }

  private generateKey(request: FastifyRequest, strategy: string): string {
    const base = `rate_limit:${request.routerPath}`;

    switch (strategy) {
      case 'ip':
        return `${base}:${request.ip}`;
      case 'user':
        return `${base}:user:${request.user?.id || request.ip}`;
      case 'api_key':
        return `${base}:key:${request.headers['x-api-key'] || request.ip}`;
      default:
        return `${base}:${request.ip}`;
    }
  }
}

interface RateLimitConfig {
  keyStrategy: 'ip' | 'user' | 'api_key';
  defaultLimit: number;
  anonymousLimit: number;
  tierLimits: { [tier: string]: number };
  timeWindow: number;
}

// Usage in routes
fastify.route({
  method: 'POST',
  url: '/api/users',
  preHandler: [
    fastify.rateLimitingService.createDynamicLimiter({
      keyStrategy: 'user',
      defaultLimit: 10,
      anonymousLimit: 5,
      tierLimits: {
        basic: 10,
        premium: 50,
        enterprise: 200,
      },
      timeWindow: 3600, // 1 hour
    }),
  ],
  handler: async (request, reply) => {
    // Handler logic
  },
});
```

### API Key Management

```typescript
// apps/api/src/services/api-key.service.ts
export class ApiKeyValidator {
  constructor(private fastify: FastifyInstance) {}

  async validateApiKey(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      return reply.unauthorized('API key required');
    }

    // Check API key in cache first
    const cached = await this.fastify.redis.get(`api_key:${apiKey}`);
    if (cached) {
      const keyData = JSON.parse(cached);
      request.apiKeyData = keyData;
      return;
    }

    // Check in database
    const keyRecord = await this.fastify.knex('api_keys').where('key_hash', this.hashApiKey(apiKey)).where('is_active', true).where('expires_at', '>', new Date()).first();

    if (!keyRecord) {
      return reply.unauthorized('Invalid or expired API key');
    }

    // Cache for 5 minutes
    await this.fastify.redis.setex(`api_key:${apiKey}`, 300, JSON.stringify(keyRecord));

    request.apiKeyData = keyRecord;
  }

  private hashApiKey(key: string): string {
    return this.fastify.crypto.createHash('sha256').update(key).digest('hex');
  }
}
```
