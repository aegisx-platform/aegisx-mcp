# API Key Management - Developer Guide

> **🔧 Technical guide for developers integrating with and extending the API Key Management system**

This guide provides technical details for developers working with the API Key Management system, including architecture, implementation patterns, and extension points.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Structure](#code-structure)
3. [Implementation Details](#implementation-details)
4. [Integration Patterns](#integration-patterns)
5. [Extending the System](#extending-the-system)
6. [Testing Strategies](#testing-strategies)
7. [Performance Considerations](#performance-considerations)
8. [Deployment Guide](#deployment-guide)

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Key Management System                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Controllers   │  │   Middleware    │  │     Services    │  │
│  │                 │  │                 │  │                 │  │
│  │ • Generation    │  │ • Auth Handler  │  │ • Business      │  │
│  │ • Validation    │  │ • Scope Check   │  │   Logic         │  │
│  │ • Management    │  │ • Rate Limiting │  │ • Crypto Utils  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Repositories  │  │    Schemas      │  │   Event Bus     │  │
│  │                 │  │                 │  │                 │  │
│  │ • CRUD Ops      │  │ • TypeBox       │  │ • WebSocket     │  │
│  │ • DB Queries    │  │ • Validation    │  │ • Real-time     │  │
│  │ • Transactions  │  │ • OpenAPI       │  │ • Audit Logs    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Client Request
   ↓
2. Fastify Route Handler
   ↓
3. Authentication Middleware
   ↓
4. Scope Validation
   ↓
5. Controller Method
   ↓
6. Service Layer (Business Logic)
   ↓
7. Repository Layer (Data Access)
   ↓
8. Database
   ↓
9. Event Bus (Optional)
   ↓
10. Response
```

## 📁 Code Structure

### File Organization

```
apps/api/src/modules/apiKeys/
├── controllers/
│   └── apiKeys.controller.ts           # HTTP request handlers
├── middleware/
│   └── apiKeys.middleware.ts           # Authentication middleware
├── routes/
│   └── index.ts                        # Route definitions
├── services/
│   └── apiKeys.service.ts              # Business logic layer
├── repositories/
│   └── apiKeys.repository.ts           # Data access layer
├── schemas/
│   └── apiKeys.schemas.ts              # TypeBox validation schemas
├── types/
│   └── apiKeys.types.ts                # TypeScript type definitions
├── utils/
│   └── apiKeys.crypto.ts               # Cryptographic utilities
├── __tests__/
│   └── apiKeys.test.ts                 # Unit tests
└── index.ts                            # Module entry point
```

### Core Classes

#### ApiKeysService

```typescript
export class ApiKeysService extends BaseService<ApiKeys, CreateApiKeys, UpdateApiKeys> {
  // Key management methods
  async generateKey(userId: string, name: string, options: GenerateOptions): Promise<KeyResult>;
  async validateKey(apiKey: string): Promise<ValidationResult>;
  async revokeKey(keyId: string, userId?: string): Promise<boolean>;
  async rotateKey(keyId: string, userId?: string): Promise<RotateResult>;
  async updateUsage(keyId: string, ipAddress?: string): Promise<void>;
  async checkScope(keyData: ApiKeys, resource: string, action: string): Promise<boolean>;
}
```

#### ApiKeysController

```typescript
export class ApiKeysController {
  // Endpoint handlers
  async generateKey(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  async validateKey(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  async getMyKeys(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  async revokeKey(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  async rotateKey(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
```

#### Authentication Middleware

```typescript
export function createApiKeyAuth(apiKeysService: ApiKeysService, options: ApiKeyAuthOptions = {}): FastifyPreHandler;

export function createHybridAuth(apiKeysService: ApiKeysService, options: ApiKeyAuthOptions = {}): FastifyPreHandler;
```

## 🔧 Implementation Details

### Cryptographic Security

#### Key Generation

```typescript
// apps/api/src/modules/apiKeys/utils/apiKeys.crypto.ts
export function generateApiKey(): ApiKeyComponents {
  // Generate cryptographically secure components
  const prefixBytes = randomBytes(8).toString('hex').substring(0, 8);
  const secretBytes = randomBytes(32).toString('hex');

  // Format: ak_{prefix}_{secret}
  const prefix = `ak_${prefixBytes}`;
  const fullKey = `${prefix}_${secretBytes}`;

  // Create secure hash for storage
  const hash = createSecureHash(fullKey);

  return { fullKey, prefix, hash, preview: generatePreview(fullKey) };
}

export function createSecureHash(apiKey: string): string {
  const saltRounds = 12;
  return bcrypt.hashSync(apiKey, saltRounds);
}
```

#### Key Validation

```typescript
export function validateApiKey(apiKey: string, storedHash: string): boolean {
  try {
    return bcrypt.compareSync(apiKey, storedHash);
  } catch (error) {
    console.error('[ApiKeyCrypto] Validation error:', error);
    return false;
  }
}

export function validateApiKeyFormat(apiKey: string): ApiKeyValidationResult {
  const apiKeyRegex = /^ak_[a-f0-9]{8}_[a-f0-9]{64}$/;

  if (!apiKeyRegex.test(apiKey)) {
    return { isValid: false, error: 'Invalid API key format' };
  }

  const parts = apiKey.split('_');
  const prefix = `${parts[0]}_${parts[1]}`;

  return { isValid: true, prefix };
}
```

### Scope-Based Authorization

#### Scope Definition

```typescript
export interface ApiKeyScope {
  resource: string; // e.g., 'users', 'files', '*'
  actions: string[]; // e.g., ['read'], ['read', 'write'], ['*']
  conditions?: Record<string, any>; // Optional filters
}
```

#### Scope Validation

```typescript
export function validateScope(keyScopes: ApiKeyScope[] | Record<string, any>, requiredResource: string, requiredAction: string): boolean {
  // Handle legacy format conversion
  const scopesArray = Array.isArray(keyScopes)
    ? keyScopes
    : Object.entries(keyScopes).map(([resource, actions]) => ({
        resource,
        actions: Array.isArray(actions) ? actions : [String(actions)],
      }));

  // Check if any scope grants access
  return scopesArray.some((scope) => {
    const resourceMatch = scope.resource === requiredResource || scope.resource === '*';
    const actionMatch = scope.actions.includes('*') || scope.actions.includes(requiredAction);
    return resourceMatch && actionMatch;
  });
}
```

### Database Schema

```sql
-- Migration: API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL UNIQUE,
  scopes JSONB,
  last_used_at TIMESTAMP,
  last_used_ip INET,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;
```

### TypeBox Schemas

```typescript
// Request/Response validation schemas
export const GenerateApiKeySchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  scopes: Type.Optional(Type.Array(ApiKeyScopeSchema)),
  expiryDays: Type.Optional(Type.Number({ minimum: 1, maximum: 3650, default: 365 })),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

export const ApiKeyScopeSchema = Type.Object({
  resource: Type.String({ minLength: 1, maxLength: 50 }),
  actions: Type.Array(Type.String({ minLength: 1, maxLength: 20 }), { minItems: 1 }),
  conditions: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export const ValidateApiKeySchema = Type.Object({
  key: Type.String({ minLength: 10 }),
  resource: Type.Optional(Type.String()),
  action: Type.Optional(Type.String()),
});
```

## 🔌 Integration Patterns

### Fastify Plugin Integration

```typescript
// apps/api/src/modules/apiKeys/index.ts
export default fp(
  async function apiKeysDomainPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Service instantiation with dependency injection
    const apiKeysRepository = new ApiKeysRepository(fastify.knex);
    const apiKeysService = new ApiKeysService(apiKeysRepository, fastify.eventService);
    const apiKeysController = new ApiKeysController(apiKeysService);

    // Decorate Fastify instance for cross-plugin access
    fastify.decorate('apiKeysService', apiKeysService);

    // Register routes with controller
    await fastify.register(apiKeysRoutes, {
      controller: apiKeysController,
      prefix: options.prefix || '/apiKeys',
    });
  },
  {
    name: 'apiKeys-domain-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin'],
  },
);
```

### Middleware Usage

```typescript
// Protecting individual routes
fastify.get('/protected-endpoint', {
  preHandler: [
    createApiKeyAuth(fastify.apiKeysService, {
      resource: 'users',
      action: 'read',
    }),
  ],
  handler: async (request: AuthenticatedRequest, reply) => {
    // Access authenticated key data
    const keyData = request.apiKeyAuth?.keyData;
    const userId = keyData?.user_id;

    // Your endpoint logic here
    return { message: 'Access granted', userId };
  },
});

// Hybrid authentication (JWT OR API key)
fastify.get('/hybrid-endpoint', {
  preHandler: [
    createHybridAuth(fastify.apiKeysService, {
      resource: 'system',
      action: 'read',
    }),
  ],
  handler: async (request, reply) => {
    // Check authentication method
    const jwtUser = (request as any).user;
    const apiKeyAuth = (request as any).apiKeyAuth;

    if (jwtUser) {
      return { authenticated: 'JWT', user: jwtUser };
    } else if (apiKeyAuth) {
      return { authenticated: 'API Key', key: apiKeyAuth.keyData };
    }
  },
});
```

### Event Bus Integration

```typescript
// Real-time events for key operations
export class ApiKeysService extends BaseService {
  private eventHelper?: CrudEventHelper;

  constructor(repository: ApiKeysRepository, eventService?: EventService) {
    super(repository);

    if (eventService) {
      this.eventHelper = eventService.for('apiKeys', 'apiKeys');
    }
  }

  async generateKey(...): Promise<KeyResult> {
    // Generate key logic...

    // Emit real-time event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('key_generated', {
        id: apiKey.id,
        userId,
        prefix: keyComponents.prefix,
        preview: keyComponents.preview
      });
    }

    return result;
  }
}
```

## 🚀 Extending the System

### Adding Custom Scopes

```typescript
// 1. Define new scope types
export interface CustomScope extends ApiKeyScope {
  resource: 'custom-resource';
  actions: ['custom-action'];
  conditions?: {
    department?: string;
    level?: number;
  };
}

// 2. Extend validation logic
export function validateCustomScope(keyScopes: ApiKeyScope[], requiredResource: string, requiredAction: string, context?: Record<string, any>): boolean {
  return keyScopes.some((scope) => {
    // Standard validation
    const basicMatch = validateScope(keyScopes, requiredResource, requiredAction);

    // Custom condition checking
    if (scope.conditions && context) {
      return basicMatch && validateConditions(scope.conditions, context);
    }

    return basicMatch;
  });
}

function validateConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
  return Object.entries(conditions).every(([key, value]) => {
    return context[key] === value;
  });
}
```

### Custom Middleware

```typescript
// Rate limiting per API key
export function createApiKeyRateLimit(
  options: {
    requestsPerMinute?: number;
    burstLimit?: number;
  } = {},
) {
  const { requestsPerMinute = 60, burstLimit = 100 } = options;

  return async function apiKeyRateLimitMiddleware(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.apiKeyAuth) return;

    const keyId = request.apiKeyAuth.keyData.id;
    const rateLimiter = await getRateLimiter(keyId);

    try {
      await rateLimiter.consume(keyId);
    } catch (rejRes) {
      return reply.status(429).send({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000),
      });
    }
  };
}

// Usage tracking middleware
export function createApiKeyAuditLog() {
  return async function apiKeyAuditMiddleware(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.apiKeyAuth) return;

    const { keyData } = request.apiKeyAuth;
    const auditData = {
      keyId: keyData.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      clientIp: getClientIpAddress(request),
      timestamp: new Date().toISOString(),
    };

    // Store in audit log
    await storeAuditLog(auditData);
  };
}
```

### Custom Key Types

```typescript
// Extend key generation for special purposes
export function generateAdminApiKey(): ApiKeyComponents {
  const baseKey = generateApiKey();

  // Use special prefix for admin keys
  const adminPrefix = baseKey.prefix.replace('ak_', 'admin_');
  const adminKey = baseKey.fullKey.replace('ak_', 'admin_');

  return {
    ...baseKey,
    fullKey: adminKey,
    prefix: adminPrefix,
    preview: generatePreview(adminKey),
  };
}

// Special validation for admin keys
export function validateAdminApiKey(apiKey: string): ApiKeyValidationResult {
  const adminKeyRegex = /^admin_[a-f0-9]{8}_[a-f0-9]{64}$/;

  if (!adminKeyRegex.test(apiKey)) {
    return { isValid: false, error: 'Invalid admin API key format' };
  }

  return { isValid: true, prefix: apiKey.split('_').slice(0, 2).join('_') };
}
```

## 🧪 Testing Strategies

### Unit Tests

```typescript
// apps/api/src/modules/apiKeys/__tests__/apiKeys.service.test.ts
describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let repository: jest.Mocked<ApiKeysRepository>;
  let eventService: jest.Mocked<EventService>;

  beforeEach(() => {
    repository = createMockRepository();
    eventService = createMockEventService();
    service = new ApiKeysService(repository, eventService);
  });

  describe('generateKey', () => {
    it('should generate a valid API key', async () => {
      const result = await service.generateKey('user-123', 'Test Key', {
        scopes: [{ resource: 'users', actions: ['read'] }],
      });

      expect(result.apiKey).toBeDefined();
      expect(result.fullKey).toMatch(/^ak_[a-f0-9]{8}_[a-f0-9]{64}$/);
      expect(result.preview).toMatch(/^\*\*\*\.\.\.[a-f0-9]{4}$/);
    });

    it('should respect key limits', async () => {
      repository.findMany.mockResolvedValue({
        data: new Array(50).fill({}),
        pagination: { total: 50 },
      });

      await expect(service.generateKey('user-123', 'Test Key')).rejects.toThrow('Maximum API keys limit');
    });
  });

  describe('validateKey', () => {
    it('should validate correct API key', async () => {
      const mockKey = createMockApiKey();
      repository.findMany.mockResolvedValue({ data: [mockKey] });

      const result = await service.validateKey('valid-key');

      expect(result.isValid).toBe(true);
      expect(result.keyData).toEqual(mockKey);
    });

    it('should reject invalid format', async () => {
      const result = await service.validateKey('invalid-format');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid API key format');
    });
  });
});
```

### Integration Tests

```typescript
// apps/api/src/modules/apiKeys/__tests__/apiKeys.integration.test.ts
describe('API Keys Integration', () => {
  let app: FastifyInstance;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    userToken = await loginTestUser(app);
  });

  describe('POST /api/apiKeys/generate', () => {
    it('should generate API key with JWT auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/apiKeys/generate',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
        payload: {
          name: 'Integration Test Key',
          scopes: [{ resource: 'users', actions: ['read'] }],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.key).toMatch(/^ak_[a-f0-9]{8}_[a-f0-9]{64}$/);
    });
  });

  describe('API Key Authentication', () => {
    it('should authenticate with valid API key', async () => {
      // First generate a key
      const genResponse = await app.inject({
        method: 'POST',
        url: '/api/apiKeys/generate',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { name: 'Auth Test Key' },
      });

      const { key } = JSON.parse(genResponse.body).data;

      // Use the key to access protected endpoint
      const authResponse = await app.inject({
        method: 'GET',
        url: '/api/protected-data',
        headers: {
          'x-api-key': key,
        },
      });

      expect(authResponse.statusCode).toBe(200);
      const body = JSON.parse(authResponse.body);
      expect(body.data.authenticatedWith).toBe('API Key');
    });
  });
});
```

### End-to-End Tests

```typescript
// e2e/api-keys.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Key Management E2E', () => {
  test('complete API key lifecycle', async ({ request }) => {
    // 1. Login and get JWT token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'testpass',
      },
    });

    const { token } = await loginResponse.json();

    // 2. Generate API key
    const generateResponse = await request.post('/api/apiKeys/generate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: 'E2E Test Key',
        scopes: [{ resource: 'users', actions: ['read'] }],
      },
    });

    expect(generateResponse.ok()).toBeTruthy();
    const { data: keyData } = await generateResponse.json();

    // 3. Use API key for authentication
    const protectedResponse = await request.get('/api/protected-data', {
      headers: {
        'x-api-key': keyData.key,
      },
    });

    expect(protectedResponse.ok()).toBeTruthy();

    // 4. Validate key
    const validateResponse = await request.post('/api/apiKeys/validate', {
      data: {
        key: keyData.key,
        resource: 'users',
        action: 'read',
      },
    });

    const validation = await validateResponse.json();
    expect(validation.data.valid).toBe(true);
    expect(validation.data.hasAccess).toBe(true);

    // 5. Revoke key
    const revokeResponse = await request.post(`/api/apiKeys/${keyData.id}/revoke`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        keyId: keyData.id,
        reason: 'E2E test cleanup',
      },
    });

    expect(revokeResponse.ok()).toBeTruthy();

    // 6. Verify key is revoked
    const verifyResponse = await request.get('/api/protected-data', {
      headers: {
        'x-api-key': keyData.key,
      },
    });

    expect(verifyResponse.status()).toBe(401);
  });
});
```

## ⚡ Performance Considerations

### Database Optimization

```sql
-- Essential indexes for performance
CREATE INDEX CONCURRENTLY idx_api_keys_user_active
ON api_keys(user_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_api_keys_prefix_hash
ON api_keys USING HASH(key_prefix);

CREATE INDEX CONCURRENTLY idx_api_keys_last_used
ON api_keys(last_used_at DESC) WHERE last_used_at IS NOT NULL;

-- Partial index for active keys only
CREATE INDEX CONCURRENTLY idx_api_keys_expires_active
ON api_keys(expires_at) WHERE is_active = true AND expires_at IS NOT NULL;
```

### Caching Strategy

```typescript
// Redis caching for key validation
export class CachedApiKeysService extends ApiKeysService {
  private redis: Redis;
  private cacheTTL = 300; // 5 minutes

  async validateKey(apiKey: string): Promise<ValidationResult> {
    const cacheKey = `apikey:${this.hashKey(apiKey)}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const result = await super.validateKey(apiKey);

    // Cache successful validations only
    if (result.isValid) {
      await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
    }

    return result;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}
```

### Rate Limiting Implementation

```typescript
// Redis-based rate limiting
import { RateLimiterRedis } from 'rate-limiter-flexible';

export function createApiKeyRateLimit(
  redisClient: Redis,
  options: {
    requestsPerMinute?: number;
    burstLimit?: number;
  } = {},
) {
  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: options.requestsPerMinute || 60,
    duration: 60,
    blockDuration: 60,
    keyPrefix: 'apikey_rl',
  });

  return async function rateLimitMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
    if (!request.apiKeyAuth) return;

    const keyId = request.apiKeyAuth.keyData.id;

    try {
      await rateLimiter.consume(keyId);
    } catch (rejRes) {
      return reply.status(429).send({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000),
      });
    }
  };
}
```

### Query Optimization

```typescript
// Optimized repository methods
export class ApiKeysRepository extends BaseRepository {
  async findByPrefixOptimized(prefix: string): Promise<ApiKeys | null> {
    // Use hash index for O(1) lookup
    const result = await this.knex('api_keys').where('key_prefix', prefix).andWhere('is_active', true).first();

    return result || null;
  }

  async getUserKeysOptimized(
    userId: string,
    options: ListOptions = {},
  ): Promise<{
    data: ApiKeys[];
    total: number;
  }> {
    const baseQuery = this.knex('api_keys').where('user_id', userId).andWhere('is_active', true);

    // Use covering index to avoid table lookups
    const [data, [{ count }]] = await Promise.all([
      baseQuery
        .clone()
        .select('id', 'name', 'key_prefix', 'scopes', 'last_used_at', 'expires_at', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(options.limit || 20)
        .offset(((options.page || 1) - 1) * (options.limit || 20)),

      baseQuery.clone().count('* as count'),
    ]);

    return { data, total: parseInt(count) };
  }
}
```

## 🚀 Deployment Guide

### Environment Variables

```bash
# Production environment
export NODE_ENV=production

# API Key specific settings
export API_KEY_BCRYPT_ROUNDS=12
export API_KEY_MAX_PER_USER=50
export API_KEY_DEFAULT_EXPIRY_DAYS=365
export API_KEY_RATE_LIMIT_RPM=60

# Database settings
export DATABASE_URL=postgresql://user:pass@host:5432/database
export REDIS_URL=redis://host:6379

# Security settings
export API_KEY_REQUIRE_HTTPS=true
export API_KEY_AUDIT_ENABLED=true
```

### Database Migrations

```sql
-- Migration file: 001_create_api_keys.sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL UNIQUE,
  scopes JSONB DEFAULT '[]'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE,
  last_used_ip INET,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_api_keys_user_id FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE UNIQUE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_api_keys_user_active ON api_keys(user_id, is_active) WHERE is_active = true;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### Docker Configuration

```dockerfile
# Dockerfile.api
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --production

# Copy source code
COPY apps/api ./apps/api
COPY libs ./libs

# Build application
RUN pnpm build api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start application
EXPOSE 3333
CMD ["node", "dist/apps/api/main.js"]
```

### Monitoring and Observability

```typescript
// Metrics collection
import { createPrometheusMetrics } from '@prometheus/client';

export const apiKeyMetrics = {
  keysGenerated: new Counter({
    name: 'api_keys_generated_total',
    help: 'Total number of API keys generated',
    labelNames: ['user_id', 'status'],
  }),

  keyValidations: new Counter({
    name: 'api_key_validations_total',
    help: 'Total number of API key validations',
    labelNames: ['result', 'resource'],
  }),

  keyUsage: new Counter({
    name: 'api_key_usage_total',
    help: 'Total API key usage',
    labelNames: ['key_prefix', 'endpoint'],
  }),

  validationDuration: new Histogram({
    name: 'api_key_validation_duration_seconds',
    help: 'API key validation duration',
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  }),
};

// Usage in middleware
export function createMetricsMiddleware() {
  return async function metricsMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
    if (request.apiKeyAuth) {
      const startTime = Date.now();

      // Record key usage
      apiKeyMetrics.keyUsage.inc({
        key_prefix: request.apiKeyAuth.prefix,
        endpoint: request.routerPath,
      });

      reply.addHook('onSend', () => {
        const duration = (Date.now() - startTime) / 1000;
        apiKeyMetrics.validationDuration.observe(duration);
      });
    }
  };
}
```

### Security Hardening

```typescript
// Security middleware stack
export function createSecurityMiddleware(app: FastifyInstance) {
  // Rate limiting
  app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => {
      return request.headers['x-api-key'] || request.ip;
    },
  });

  // CORS for API keys
  app.register(fastifyCors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['x-api-key', 'authorization', 'content-type'],
  });

  // Helmet security headers
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });
}
```

---

## 📚 Additional Resources

- **[Architecture Overview](./ARCHITECTURE.md)** - System architecture and design decisions
- **[Security Guide](./SECURITY.md)** - Security considerations and best practices
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🤝 Contributing

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** - ESLint, Prettier, TypeScript strict mode
3. **Write comprehensive tests** - Unit, integration, and E2E tests
4. **Update documentation** - Keep docs in sync with code changes
5. **Submit pull request** with detailed description

## 📞 Support

For technical questions or contributions:

- **GitHub Issues**: Bug reports and feature requests
- **Technical Documentation**: Complete guides and references
- **Code Reviews**: Peer review process for contributions
