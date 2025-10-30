# API Keys Developer Guide

> **Technical integration guide for adding API Key authentication to routes and services.**

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Middleware Integration](#middleware-integration)
- [Validation Flow](#validation-flow)
- [Cache Strategy](#cache-strategy)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## Quick Start

### Prerequisites

- Fastify application with authentication system
- Redis for caching (optional but recommended)
- PostgreSQL database with api_keys table

### Basic Integration

#### 1. Import Middleware

```typescript
import { createApiKeyAuth, createHybridAuth } from '../core/api-keys/middleware/apiKeys.middleware';
```

#### 2. Add to Route

```typescript
// Option 1: API Key only
fastify.get('/api/data', {
  preValidation: [
    createApiKeyAuth(apiKeysService, {
      headerName: 'x-api-key',
      resource: 'data',
      action: 'read'
    })
  ],
  handler: async (request, reply) => {
    // Access key data: request.apiKey
    return reply.success({ data: [...] });
  }
});

// Option 2: JWT or API Key (hybrid)
fastify.get('/api/data', {
  preValidation: [
    createHybridAuth(apiKeysService, {
      headerName: 'x-api-key',
      resource: 'data',
      action: 'read'
    })
  ],
  handler: async (request, reply) => {
    // Check which auth method was used
    if (request.user) {
      // JWT authentication
    } else if (request.apiKey) {
      // API Key authentication
    }
  }
});
```

## Middleware Integration

### API Key Only Authentication

**Use Case**: Public APIs, third-party integrations

```typescript
import { createApiKeyAuth } from '../middleware/apiKeys.middleware';

export async function productRoutes(fastify: FastifyInstance) {
  const apiKeyAuth = createApiKeyAuth(apiKeysService, {
    headerName: 'x-api-key', // Header name for key
    queryParam: 'api_key', // Query param name
    bearerPrefix: 'Bearer ', // Bearer token prefix
    allowQueryAuth: false, // Disable query param auth
    resource: 'products', // Resource for scope check
    action: 'read', // Action for scope check
  });

  // List products - requires API key
  fastify.get('/products', {
    preValidation: [apiKeyAuth],
    schema: {
      tags: ['Products'],
      summary: 'List products',
      security: [{ apiKey: [] }], // OpenAPI security
      response: {
        200: ProductsListResponseSchema,
        401: { $ref: 'Unauthorized' },
        403: { $ref: 'Forbidden' },
      },
    },
    handler: controller.list.bind(controller),
  });
}
```

### Hybrid Authentication (JWT or API Key)

**Use Case**: APIs used by both users and services

```typescript
import { createHybridAuth } from '../middleware/apiKeys.middleware';

export async function dataRoutes(fastify: FastifyInstance) {
  const hybridAuth = createHybridAuth(apiKeysService, {
    resource: 'data',
    action: 'read'
  });

  // Accepts both JWT and API Key
  fastify.get('/data', {
    preValidation: [
      fastify.authenticate,            // Try JWT first
      hybridAuth                       // Fallback to API key
    ],
    handler: async (request, reply) => {
      // Check which authentication method succeeded
      const user = request.user || request.apiKey?.user;
      const authMethod = request.user ? 'JWT' : 'API_KEY';

      return reply.success({
        data: [...],
        meta: { authMethod }
      });
    }
  });
}
```

### Permission-Based Authentication

```typescript
fastify.get('/admin/users', {
  preValidation: [
    fastify.authenticate, // JWT required
    fastify.verifyPermission('api-keys', 'read'), // Permission check
  ],
  handler: async (request, reply) => {
    // Only users with 'api-keys:read' permission can access
  },
});
```

## Validation Flow

### Complete Validation Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCOMING API REQUEST                          │
│  Headers: x-api-key: ak_8a9590a2_87e400a2b35cd9ffccb6d76...    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: EXTRACT API KEY                                         │
│  ─────────────────────────────────────────────────────────────  │
│  1. Check x-api-key header                                       │
│  2. Check Authorization: Bearer header                           │
│  3. Check query parameter (if allowed)                           │
│                                                                  │
│  Result: ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432df...       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: PARSE KEY PREFIX                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Format validation: ak_<hash>_<random>                           │
│  Extract prefix: ak_8a9590a2                                     │
│                                                                  │
│  ✅ Valid format                                                 │
│  ❌ Invalid → return 401 "Invalid API key format"                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: CHECK CACHE (Redis)                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Key: api_key:validation:ak_8a9590a2                            │
│  Data: { is_active, expires_at, scopes }                        │
│                                                                  │
│  Cache Hit:                                                      │
│  ├─ Check is_active === true                                    │
│  ├─ Check expires_at > now                                      │
│  └─ Quick validation passed                                     │
│                                                                  │
│  Cache Miss:                                                     │
│  └─ Continue to database                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: DATABASE VALIDATION                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Query: SELECT * FROM api_keys WHERE key_prefix = 'ak_8a9590a2' │
│                                                                  │
│  Retrieved:                                                      │
│  - id, user_id, key_hash                                         │
│  - is_active, expires_at                                         │
│  - scopes                                                        │
│                                                                  │
│  ✅ Found                                                         │
│  ❌ Not found → return 401 "API key not found"                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: HASH VALIDATION                                         │
│  ─────────────────────────────────────────────────────────────  │
│  bcrypt.compare(fullApiKey, storedHash)                         │
│                                                                  │
│  ✅ Match → Continue                                             │
│  ❌ No match → return 401 "Invalid API key"                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: STATUS CHECKS                                           │
│  ─────────────────────────────────────────────────────────────  │
│  1. is_active check                                              │
│     ❌ false → return 401 "API key is disabled"                  │
│                                                                  │
│  2. Expiration check                                             │
│     ❌ expired → return 401 "API key has expired"                │
│                                                                  │
│  ✅ All checks passed                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: PERMISSION CHECK (if resource/action specified)        │
│  ─────────────────────────────────────────────────────────────  │
│  Check scopes array for matching permission                      │
│  Example: { resource: "users", actions: ["read", "create"] }    │
│                                                                  │
│  ✅ Has permission → Continue                                    │
│  ❌ No permission → return 403 "Permission denied"               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: CACHE UPDATE                                            │
│  ─────────────────────────────────────────────────────────────  │
│  Store validation result in Redis                                │
│  Key: api_key:validation:ak_8a9590a2                            │
│  TTL: 300 seconds (5 minutes)                                    │
│                                                                  │
│  Cached data: { is_active, expires_at, scopes }                 │
│  (Note: key_hash NOT cached for security)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 9: USAGE TRACKING (Background)                             │
│  ─────────────────────────────────────────────────────────────  │
│  Non-blocking update:                                            │
│  - last_used_at = NOW()                                          │
│  - last_used_ip = client IP                                      │
│                                                                  │
│  Fire-and-forget (doesn't block request)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  SUCCESS: REQUEST AUTHENTICATED                                  │
│  ─────────────────────────────────────────────────────────────  │
│  request.apiKey = { id, user_id, key_prefix, scopes, ... }     │
│  request.apiKeyAuth = { authenticated: true, keyData: {...} }   │
│                                                                  │
│  → Continue to route handler                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Cache Strategy

### Why Hybrid Caching?

**Problem**: Full caching is insecure, no caching is slow

**Solution**: Cache metadata, validate hash from database

```typescript
// Cache structure
{
  "api_key:validation:ak_8a9590a2": {
    "is_active": true,
    "expires_at": "2026-01-15T00:00:00.000Z",
    "scopes": [
      { "resource": "users", "actions": ["read"] }
    ],
    // ❌ key_hash NOT stored (security)
  }
}
```

### Benefits

| Aspect         | Cached | Not Cached  | Why                             |
| -------------- | ------ | ----------- | ------------------------------- |
| **is_active**  | ✅ Yes |             | Fast rejection of disabled keys |
| **expires_at** | ✅ Yes |             | Fast expiration check           |
| **scopes**     | ✅ Yes |             | Fast permission validation      |
| **key_hash**   | ❌ No  | ✅ Database | Security - never cache hashes   |

### Performance Impact

```
Without Cache:
┌──────────┐     ┌──────────┐     ┌────────┐
│ Request  │────▶│ Database │────▶│ bcrypt │
└──────────┘     └──────────┘     └────────┘
                    ~5ms              ~50ms
                 Total: ~55ms per request

With Hybrid Cache:
┌──────────┐     ┌───────┐     ┌──────────┐     ┌────────┐
│ Request  │────▶│ Redis │────▶│ Database │────▶│ bcrypt │
└──────────┘     └───────┘     └──────────┘     └────────┘
                   ~1ms           ~5ms            ~50ms
Cache hit: ~1ms for metadata check (99% of validations)
Cache miss: ~56ms (same as without cache)
```

## Code Examples

### Complete Implementation Example

```typescript
// api-keys.plugin.ts
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { ApiKeysService } from './services/apiKeys.service';
import { ApiKeysRepository } from './apiKeys.repository';
import { createApiKeyAuth, createHybridAuth } from './middleware/apiKeys.middleware';

export const apiKeysPlugin = fastifyPlugin(async (fastify: FastifyInstance) => {
  // 1. Initialize repository and service
  const repository = new ApiKeysRepository(fastify.knex);
  const service = new ApiKeysService(repository, fastify.eventService, fastify.cacheService);

  // 2. Decorate Fastify with utilities
  fastify.decorate('apiKeysService', service);
  fastify.decorate('createApiKeyAuth', (options) => createApiKeyAuth(service, options));
  fastify.decorate('createHybridAuth', (options) => createHybridAuth(service, options));

  // 3. Register routes
  await fastify.register(apiKeysRoutes, {
    prefix: '/api/api-keys',
    controller: new ApiKeysController(service),
  });
});
```

### Using in Routes

```typescript
// users.routes.ts
export async function usersRoutes(fastify: FastifyInstance) {
  // Read-only API key access
  fastify.get('/api/users', {
    preValidation: [
      fastify.createApiKeyAuth({
        resource: 'users',
        action: 'read',
      }),
    ],
    schema: {
      security: [{ apiKey: [] }],
      response: {
        200: UsersListResponseSchema,
        401: { $ref: 'Unauthorized' },
        403: { $ref: 'Forbidden' },
      },
    },
    handler: async (request, reply) => {
      const users = await usersService.findAll();
      return reply.success({ data: users });
    },
  });

  // Write operations - JWT only (no API key)
  fastify.post('/api/users', {
    preValidation: [
      fastify.authenticate, // JWT required
      fastify.verifyPermission('users', 'create'),
    ],
    handler: async (request, reply) => {
      // Only JWT authenticated users can create
    },
  });
}
```

## Best Practices

### 1. Choose the Right Authentication Method

```typescript
// ✅ GOOD: API keys for read-only external access
fastify.get('/api/public/stats', {
  preValidation: [createApiKeyAuth(service, { resource: 'stats', action: 'read' })],
  handler: getPublicStats,
});

// ✅ GOOD: JWT for write operations
fastify.post('/api/users', {
  preValidation: [fastify.authenticate, fastify.verifyPermission('users', 'create')],
  handler: createUser,
});

// ✅ GOOD: Hybrid for flexible access
fastify.get('/api/data', {
  preValidation: [createHybridAuth(service)],
  handler: getData,
});

// ❌ BAD: API keys for sensitive write operations
fastify.delete('/api/users/:id', {
  preValidation: [createApiKeyAuth(service)], // Too permissive!
  handler: deleteUser,
});
```

### 2. Always Specify Resource and Action

```typescript
// ✅ GOOD: Explicit permissions
createApiKeyAuth(service, {
  resource: 'products',
  action: 'read',
});

// ❌ BAD: No permission check
createApiKeyAuth(service, {}); // Any valid key works!
```

### 3. Disable Query Parameter Auth by Default

```typescript
// ✅ GOOD: Headers only (secure)
createApiKeyAuth(service, {
  allowQueryAuth: false, // Default
});

// ⚠️ USE WITH CAUTION: Query param allowed
createApiKeyAuth(service, {
  allowQueryAuth: true, // Keys visible in logs!
});
```

### 4. Handle Both Auth Methods in Hybrid Mode

```typescript
fastify.get('/api/data', {
  preValidation: [createHybridAuth(service)],
  handler: async (request, reply) => {
    // ✅ GOOD: Check which auth method was used
    if (request.user) {
      // JWT - full user context
      const userId = request.user.id;
    } else if (request.apiKey) {
      // API Key - limited context
      const userId = request.apiKey.user_id;
    }

    // ❌ BAD: Assume only JWT
    const userId = request.user.id; // Will fail for API keys!
  },
});
```

### 5. Track and Monitor API Key Usage

```typescript
// ✅ GOOD: Log API key usage for security monitoring
fastify.addHook('onRequest', async (request) => {
  if (request.apiKeyAuth?.authenticated) {
    fastify.log.info(
      {
        apiKeyPrefix: request.apiKey.key_prefix,
        userId: request.apiKey.user_id,
        ip: request.ip,
        route: request.url,
      },
      'API key request',
    );
  }
});
```

---

**Related Documentation**:

- [User Guide](./USER_GUIDE.md) - End-user documentation
- [Architecture](./ARCHITECTURE.md) - System design
- [Security](./SECURITY.md) - Security best practices

**Last Updated**: 2025-10-30
