# API Key Caching System - API Reference

## Overview

This document provides comprehensive API reference for the API Key Caching System. All methods, interfaces, and configuration options are documented with examples and usage patterns.

## Table of Contents

- [Core Classes](#core-classes)
- [Configuration](#configuration)
- [Data Structures](#data-structures)
- [Methods Reference](#methods-reference)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Integration Patterns](#integration-patterns)

## Core Classes

### ApiKeyCacheService

Main cache service class that provides high-level caching operations for API keys.

```typescript
class ApiKeyCacheService {
  constructor(fastify: FastifyInstance);

  // Validation Caching
  getCachedValidation(keyPrefix: string): Promise<CachedApiKeyData | null>;
  setCachedValidation(keyPrefix: string, apiKeyData: ApiKeys): Promise<boolean>;
  invalidateValidation(keyPrefix: string): Promise<boolean>;

  // Scope Permission Caching
  getCachedScopeValidation(keyId: string, resource: string, action: string): Promise<boolean | null>;
  setCachedScopeValidation(keyId: string, resource: string, action: string, isValid: boolean, userId: string): Promise<boolean>;
  invalidateKeyScopes(keyId: string): Promise<number>;

  // User Key List Caching
  getCachedUserKeys(userId: string): Promise<CachedApiKeyData[] | null>;
  setCachedUserKeys(userId: string, apiKeys: ApiKeys[]): Promise<boolean>;
  invalidateUserKeys(userId: string): Promise<boolean>;

  // Usage Statistics
  incrementUsage(keyId: string): Promise<number>;
  getAndResetUsage(keyId: string): Promise<number>;

  // Bulk Operations
  invalidateKeyData(keyId: string, userId: string): Promise<void>;
  invalidateUserData(userId: string): Promise<void>;
  invalidateAllValidation(): Promise<number>;
  invalidateAllScopes(): Promise<number>;

  // Cache Warming
  warmCache(frequentKeys: { prefix: string; data: ApiKeys }[]): Promise<void>;

  // Monitoring
  getCacheHealth(): Promise<CacheHealthInfo>;
}
```

## Configuration

### API_KEY_CACHE_CONFIG

Central configuration object for all cache settings.

```typescript
export const API_KEY_CACHE_CONFIG = {
  // TTL values in seconds
  VALIDATION_TTL: 300, // 5 minutes
  SCOPE_TTL: 600, // 10 minutes
  USER_LIST_TTL: 1800, // 30 minutes
  USAGE_BATCH_TTL: 60, // 1 minute

  // Cache key prefixes
  PREFIXES: {
    VALIDATION: 'apikey:validation:',
    SCOPE: 'apikey:scope:',
    USER_LIST: 'apikey:user:',
    USAGE: 'apikey:usage:',
    STATS: 'apikey:stats:',
  },

  // Cache tags for bulk invalidation
  TAGS: {
    USER: 'apikey-user-',
    KEY: 'apikey-',
    VALIDATION: 'apikey-validation',
    SCOPES: 'apikey-scopes',
  },
} as const;
```

#### Configuration Details

| Setting           | Default       | Description                                | Security Impact                        |
| ----------------- | ------------- | ------------------------------------------ | -------------------------------------- |
| `VALIDATION_TTL`  | 300s (5min)   | Cache duration for API key validation data | Higher values = longer exposure window |
| `SCOPE_TTL`       | 600s (10min)  | Cache duration for permission checks       | Longer delays for permission changes   |
| `USER_LIST_TTL`   | 1800s (30min) | Cache duration for user key listings       | UI refresh delays                      |
| `USAGE_BATCH_TTL` | 60s (1min)    | Batching window for usage statistics       | Statistics accuracy window             |

## Data Structures

### CachedApiKeyData

Interface for cached API key data (excludes sensitive information).

```typescript
interface CachedApiKeyData {
  id: string; // Unique identifier
  user_id: string; // Owner user ID
  name: string; // Human-readable name
  key_prefix: string; // Public key prefix (e.g., "ak_live_...")
  scopes: ApiKeyScope[]; // Granted permissions
  is_active: boolean; // Active status
  expires_at: string | null; // Expiration timestamp (ISO string)
  created_at: string; // Creation timestamp (ISO string)
  updated_at: string; // Last update timestamp (ISO string)
  // NOTE: key_hash is NEVER cached for security
}
```

### ApiKeyScope

Permission scope definition for API keys.

```typescript
type ApiKeyScope =
  | {
      resource: string; // Resource identifier (e.g., "users", "files")
      actions: string[]; // Allowed actions (e.g., ["read", "write"])
    }
  | string; // Or simple string scope (e.g., "read:users")
```

### CacheHealthInfo

Health monitoring information for the cache system.

```typescript
interface CacheHealthInfo {
  stats: CacheStats; // Overall cache statistics
  validationCacheSize: number; // Number of validation cache entries
  scopeCacheSize: number; // Number of scope cache entries
  userListCacheSize: number; // Number of user list cache entries
  usageCacheSize: number; // Number of usage cache entries
}

interface CacheStats {
  hits: number; // Cache hit count
  misses: number; // Cache miss count
  errors: number; // Cache error count
  hitRate: number; // Hit rate percentage (0-1)
}
```

## Methods Reference

### Validation Caching Methods

#### getCachedValidation

Retrieves cached API key validation data by key prefix.

```typescript
async getCachedValidation(keyPrefix: string): Promise<CachedApiKeyData | null>
```

**Parameters:**

- `keyPrefix` (string): The API key prefix (e.g., "ak_live_abc123...")

**Returns:**

- `Promise<CachedApiKeyData | null>`: Cached key data or null if not found

**Example:**

```typescript
const cacheService = new ApiKeyCacheService(fastify);
const cachedData = await cacheService.getCachedValidation('ak_live_abc123');

if (cachedData) {
  console.log('Cache hit!', cachedData);
  // Verify data is still valid
  if (cachedData.is_active && !isExpired(cachedData.expires_at)) {
    // Use cached data
  }
} else {
  console.log('Cache miss - need database lookup');
}
```

**Cache Key Pattern:**

```
cache:apikeys:apikey:validation:{keyPrefix}
```

#### setCachedValidation

Stores API key validation data in cache.

```typescript
async setCachedValidation(keyPrefix: string, apiKeyData: ApiKeys): Promise<boolean>
```

**Parameters:**

- `keyPrefix` (string): The API key prefix
- `apiKeyData` (ApiKeys): Complete API key data from database

**Returns:**

- `Promise<boolean>`: Success status

**Security Note:** Sensitive data (key_hash) is automatically excluded from cache.

**Example:**

```typescript
const dbKeyData = await database.findByPrefix(keyPrefix);
const success = await cacheService.setCachedValidation(keyPrefix, dbKeyData);

if (success) {
  console.log('API key cached successfully');
} else {
  console.log('Cache storage failed - will retry on next request');
}
```

**Cache Tags Applied:**

- `apikey-{keyId}`
- `apikey-user-{userId}`
- `apikey-validation`

#### invalidateValidation

Removes specific API key from validation cache.

```typescript
async invalidateValidation(keyPrefix: string): Promise<boolean>
```

**Parameters:**

- `keyPrefix` (string): The API key prefix to invalidate

**Returns:**

- `Promise<boolean>`: Success status

**Example:**

```typescript
// Invalidate expired key
if (isKeyExpired(cachedData.expires_at)) {
  await cacheService.invalidateValidation(keyPrefix);
}

// Invalidate on security event
await cacheService.invalidateValidation(compromisedKeyPrefix);
```

### Scope Permission Caching Methods

#### getCachedScopeValidation

Retrieves cached permission check result.

```typescript
async getCachedScopeValidation(
  keyId: string,
  resource: string,
  action: string
): Promise<boolean | null>
```

**Parameters:**

- `keyId` (string): API key ID
- `resource` (string): Resource being accessed (e.g., "users", "files")
- `action` (string): Action being performed (e.g., "read", "write")

**Returns:**

- `Promise<boolean | null>`: Permission result or null if not cached

**Example:**

```typescript
const hasPermission = await cacheService.getCachedScopeValidation('key-123', 'users', 'read');

if (hasPermission !== null) {
  // Use cached permission decision
  return hasPermission;
} else {
  // Perform full permission check
  const permission = await checkDatabasePermissions(keyId, resource, action);
  await cacheService.setCachedScopeValidation(keyId, resource, action, permission, userId);
  return permission;
}
```

**Cache Key Pattern:**

```
cache:apikeys:apikey:scope:{keyId}:{resource}:{action}
```

#### setCachedScopeValidation

Stores permission check result in cache.

```typescript
async setCachedScopeValidation(
  keyId: string,
  resource: string,
  action: string,
  isValid: boolean,
  userId: string
): Promise<boolean>
```

**Parameters:**

- `keyId` (string): API key ID
- `resource` (string): Resource identifier
- `action` (string): Action identifier
- `isValid` (boolean): Permission result
- `userId` (string): User ID for tagging

**Returns:**

- `Promise<boolean>`: Success status

**Example:**

```typescript
// Cache permission decision
const hasAccess = await validateScopeFromDatabase(keyId, 'files', 'write');
await cacheService.setCachedScopeValidation(keyId, 'files', 'write', hasAccess, userId);
```

#### invalidateKeyScopes

Removes all cached scope permissions for a specific API key.

```typescript
async invalidateKeyScopes(keyId: string): Promise<number>
```

**Parameters:**

- `keyId` (string): API key ID

**Returns:**

- `Promise<number>`: Number of cache entries removed

**Example:**

```typescript
// Called when API key scopes are updated
const removedCount = await cacheService.invalidateKeyScopes('key-123');
console.log(`Invalidated ${removedCount} scope cache entries`);
```

### User Key List Caching Methods

#### getCachedUserKeys

Retrieves cached list of user's API keys.

```typescript
async getCachedUserKeys(userId: string): Promise<CachedApiKeyData[] | null>
```

**Parameters:**

- `userId` (string): User ID

**Returns:**

- `Promise<CachedApiKeyData[] | null>`: Array of user's API keys or null

**Example:**

```typescript
const userKeys = await cacheService.getCachedUserKeys('user-456');

if (userKeys) {
  // Display cached key list
  return { data: userKeys, source: 'cache' };
} else {
  // Fetch from database and cache
  const keys = await database.findUserKeys(userId);
  await cacheService.setCachedUserKeys(userId, keys);
  return { data: keys, source: 'database' };
}
```

#### setCachedUserKeys

Stores user's API key list in cache.

```typescript
async setCachedUserKeys(userId: string, apiKeys: ApiKeys[]): Promise<boolean>
```

**Parameters:**

- `userId` (string): User ID
- `apiKeys` (ApiKeys[]): Array of user's API keys

**Returns:**

- `Promise<boolean>`: Success status

**Example:**

```typescript
const userApiKeys = await apiKeysService.findByUserId(userId);
await cacheService.setCachedUserKeys(userId, userApiKeys);
```

#### invalidateUserKeys

Removes cached user key list.

```typescript
async invalidateUserKeys(userId: string): Promise<boolean>
```

**Parameters:**

- `userId` (string): User ID

**Returns:**

- `Promise<boolean>`: Success status

**Example:**

```typescript
// Called when user creates/deletes API keys
await cacheService.invalidateUserKeys(userId);
```

### Usage Statistics Methods

#### incrementUsage

Increments usage counter for batching.

```typescript
async incrementUsage(keyId: string): Promise<number>
```

**Parameters:**

- `keyId` (string): API key ID

**Returns:**

- `Promise<number>`: Current counter value

**Example:**

```typescript
// Called on each API request
const currentCount = await cacheService.incrementUsage(keyId);

// Optional: Trigger batch flush at threshold
if (currentCount >= 100) {
  await flushUsageBatch(keyId);
}
```

#### getAndResetUsage

Retrieves and resets usage counter for batch processing.

```typescript
async getAndResetUsage(keyId: string): Promise<number>
```

**Parameters:**

- `keyId` (string): API key ID

**Returns:**

- `Promise<number>`: Previous counter value

**Example:**

```typescript
// Scheduled batch processing
setInterval(async () => {
  for (const keyId of activeKeys) {
    const usageCount = await cacheService.getAndResetUsage(keyId);
    if (usageCount > 0) {
      await database.incrementUsageStats(keyId, usageCount);
    }
  }
}, 60000); // Every minute
```

### Bulk Operations Methods

#### invalidateKeyData

Invalidates all cached data for a specific API key.

```typescript
async invalidateKeyData(keyId: string, userId: string): Promise<void>
```

**Parameters:**

- `keyId` (string): API key ID
- `userId` (string): User ID

**Returns:**

- `Promise<void>`

**Example:**

```typescript
// Called when API key is updated, revoked, or rotated
await cacheService.invalidateKeyData('key-123', 'user-456');
```

**Invalidates:**

- Validation cache for the key
- All scope permission caches for the key
- User's key list cache

#### invalidateUserData

Invalidates all cached data for a specific user.

```typescript
async invalidateUserData(userId: string): Promise<void>
```

**Parameters:**

- `userId` (string): User ID

**Returns:**

- `Promise<void>`

**Example:**

```typescript
// Called when user is deleted or roles change
await cacheService.invalidateUserData('user-456');
```

#### invalidateAllValidation

Invalidates all validation caches (emergency use).

```typescript
async invalidateAllValidation(): Promise<number>
```

**Returns:**

- `Promise<number>`: Number of cache entries removed

**Example:**

```typescript
// Called during security events or system maintenance
const removedCount = await cacheService.invalidateAllValidation();
console.log(`Cleared ${removedCount} validation cache entries`);
```

#### invalidateAllScopes

Invalidates all scope permission caches.

```typescript
async invalidateAllScopes(): Promise<number>
```

**Returns:**

- `Promise<number>`: Number of cache entries removed

**Example:**

```typescript
// Called when permission system changes
await cacheService.invalidateAllScopes();
```

### Cache Warming Methods

#### warmCache

Pre-loads frequently used API keys into cache.

```typescript
async warmCache(frequentKeys: { prefix: string; data: ApiKeys }[]): Promise<void>
```

**Parameters:**

- `frequentKeys` (Array): Array of key objects with prefix and data

**Returns:**

- `Promise<void>`

**Example:**

```typescript
// Service startup cache warming
const frequentKeys = await getFrequentlyUsedKeys();
await cacheService.warmCache(frequentKeys);

// Scheduled cache warming
setInterval(async () => {
  const hotKeys = await identifyHotKeys();
  await cacheService.warmCache(hotKeys);
}, 300000); // Every 5 minutes
```

### Monitoring Methods

#### getCacheHealth

Retrieves cache health and statistics.

```typescript
async getCacheHealth(): Promise<CacheHealthInfo>
```

**Returns:**

- `Promise<CacheHealthInfo>`: Health information object

**Example:**

```typescript
const health = await cacheService.getCacheHealth();

console.log({
  hitRate: health.stats.hitRate,
  totalEntries: health.validationCacheSize + health.scopeCacheSize + health.userListCacheSize + health.usageCacheSize,
  validation: health.validationCacheSize,
  scopes: health.scopeCacheSize,
  userLists: health.userListCacheSize,
  usage: health.usageCacheSize,
});

// Alert if hit rate is low
if (health.stats.hitRate < 0.8) {
  console.warn('Cache hit rate below 80%');
}
```

## Error Handling

### Cache Service Errors

The cache service is designed to fail gracefully. Most methods return `null` or `false` on errors rather than throwing exceptions.

```typescript
// Example error handling patterns
try {
  const cachedData = await cacheService.getCachedValidation(keyPrefix);

  if (cachedData) {
    // Use cached data
    return validateCachedKey(cachedData);
  } else {
    // Fall back to database
    return validateFromDatabase(keyPrefix);
  }
} catch (error) {
  // Log error but continue with database fallback
  logger.error('Cache service error', error);
  return validateFromDatabase(keyPrefix);
}
```

### Redis Connection Errors

```typescript
// The service handles Redis connection failures gracefully
if (!this.redis) {
  // Redis not available - return null/false to trigger database fallback
  return null;
}

try {
  // Redis operation
} catch (error) {
  this.logger.error('Redis operation failed', error);
  return null; // Trigger fallback behavior
}
```

### Common Error Scenarios

| Scenario              | Behavior                   | Fallback                |
| --------------------- | -------------------------- | ----------------------- |
| Redis unavailable     | Returns null/false         | Database query          |
| Cache key not found   | Returns null               | Database query          |
| Serialization error   | Logs error, returns null   | Database query          |
| Memory limit exceeded | Redis evicts old keys      | Slower initial requests |
| Network timeout       | Returns null after timeout | Database query          |

## Usage Examples

### Basic Cache-First Pattern

```typescript
async function validateApiKeyWithCache(apiKey: string): Promise<ApiKeyValidationResult> {
  const cacheService = new ApiKeyCacheService(fastify);
  const keyPrefix = extractPrefix(apiKey);

  // 1. Try cache first
  const cachedData = await cacheService.getCachedValidation(keyPrefix);

  if (cachedData) {
    // 2. Validate cached data is current
    if (!cachedData.is_active || isExpired(cachedData.expires_at)) {
      await cacheService.invalidateValidation(keyPrefix);
      return { isValid: false, error: 'Key expired or disabled' };
    }

    // 3. Still need to validate hash (security requirement)
    const keyData = await database.findByPrefix(keyPrefix);
    if (keyData && validateHash(apiKey, keyData.key_hash)) {
      return { isValid: true, keyData };
    }
  }

  // 4. Cache miss: full database validation
  const keyData = await database.findByPrefix(keyPrefix);
  if (keyData && keyData.is_active && !isExpired(keyData.expires_at)) {
    if (validateHash(apiKey, keyData.key_hash)) {
      // 5. Cache for future requests
      await cacheService.setCachedValidation(keyPrefix, keyData);
      return { isValid: true, keyData };
    }
  }

  return { isValid: false, error: 'Invalid API key' };
}
```

### Permission Checking with Cache

```typescript
async function checkPermissionWithCache(keyId: string, resource: string, action: string, userId: string): Promise<boolean> {
  const cacheService = new ApiKeyCacheService(fastify);

  // Check cache first
  const cachedResult = await cacheService.getCachedScopeValidation(keyId, resource, action);

  if (cachedResult !== null) {
    return cachedResult;
  }

  // Database check
  const hasPermission = await database.checkPermission(keyId, resource, action);

  // Cache result
  await cacheService.setCachedScopeValidation(keyId, resource, action, hasPermission, userId);

  return hasPermission;
}
```

### User Dashboard with Cache

```typescript
async function getUserApiKeys(userId: string): Promise<CachedApiKeyData[]> {
  const cacheService = new ApiKeyCacheService(fastify);

  // Try cache first
  const cachedKeys = await cacheService.getCachedUserKeys(userId);
  if (cachedKeys) {
    return cachedKeys;
  }

  // Database fallback
  const userKeys = await database.findUserKeys(userId);

  // Cache for future requests
  await cacheService.setCachedUserKeys(userId, userKeys);

  // Return sanitized data (matching cache format)
  return userKeys.map((key) => ({
    id: key.id,
    user_id: key.user_id,
    name: key.name,
    key_prefix: key.key_prefix,
    scopes: key.scopes,
    is_active: key.is_active,
    expires_at: key.expires_at,
    created_at: key.created_at,
    updated_at: key.updated_at,
  }));
}
```

### Usage Tracking with Batching

```typescript
class UsageTracker {
  private cacheService: ApiKeyCacheService;

  constructor(fastify: FastifyInstance) {
    this.cacheService = new ApiKeyCacheService(fastify);
    this.startBatchProcessor();
  }

  async recordUsage(keyId: string): Promise<void> {
    await this.cacheService.incrementUsage(keyId);
  }

  private startBatchProcessor(): void {
    setInterval(async () => {
      await this.processBatchedUsage();
    }, 60000); // Process every minute
  }

  private async processBatchedUsage(): Promise<void> {
    const activeKeys = await this.getActiveApiKeys();

    for (const keyId of activeKeys) {
      const usage = await this.cacheService.getAndResetUsage(keyId);
      if (usage > 0) {
        await database.updateUsageStats(keyId, usage);
      }
    }
  }
}
```

## Integration Patterns

### Fastify Plugin Integration

```typescript
import fp from 'fastify-plugin';
import { ApiKeyCacheService } from './services/apiKeys-cache.service';

export default fp(async function (fastify: FastifyInstance) {
  // Register cache service
  const cacheService = new ApiKeyCacheService(fastify);
  fastify.decorate('apiKeyCache', cacheService);

  // Add cache headers to responses
  fastify.addHook('onResponse', async (request, reply) => {
    if (request.cacheStatus) {
      reply.header('X-Cache-Status', request.cacheStatus);
    }
  });
});

// Usage in routes
fastify.get('/api/keys', async (request, reply) => {
  const cached = await fastify.apiKeyCache.getCachedUserKeys(request.user.id);

  if (cached) {
    request.cacheStatus = 'HIT';
    return { data: cached };
  }

  request.cacheStatus = 'MISS';
  const keys = await getUserKeysFromDatabase(request.user.id);
  await fastify.apiKeyCache.setCachedUserKeys(request.user.id, keys);
  return { data: keys };
});
```

### Middleware Integration

```typescript
export async function apiKeyAuthMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return reply.status(401).send({ error: 'API key required' });
  }

  const cacheService = new ApiKeyCacheService(request.server);
  const validation = await validateApiKeyWithCache(apiKey, cacheService);

  if (!validation.isValid) {
    return reply.status(401).send({ error: validation.error });
  }

  // Attach validated data to request
  request.apiKeyData = validation.keyData;
  request.apiKeyCache = cacheService;
}

// Usage in permission checking
export async function requirePermission(resource: string, action: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const hasPermission = await request.apiKeyCache.getCachedScopeValidation(request.apiKeyData.id, resource, action);

    if (!hasPermission) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }
  };
}
```

### Service Layer Integration

```typescript
export class ApiKeysService {
  private cacheService: ApiKeyCacheService;

  constructor(fastify: FastifyInstance) {
    this.cacheService = new ApiKeyCacheService(fastify);
  }

  async create(data: CreateApiKeyRequest): Promise<ApiKeys> {
    const newKey = await this.repository.create(data);

    // Invalidate user cache since new key was added
    await this.cacheService.invalidateUserKeys(data.user_id);

    return newKey;
  }

  async update(id: string, data: UpdateApiKeyRequest): Promise<ApiKeys> {
    const updatedKey = await this.repository.update(id, data);

    // Invalidate all related cache data
    await this.cacheService.invalidateKeyData(id, updatedKey.user_id);

    return updatedKey;
  }

  async revoke(id: string): Promise<void> {
    const key = await this.repository.findById(id);
    await this.repository.update(id, { is_active: false });

    // Immediate cache invalidation for security
    await this.cacheService.invalidateKeyData(id, key.user_id);
  }
}
```

## Related Documentation

- **[Developer Guide](./DEVELOPER_GUIDE.md)**: Implementation details and patterns
- **[Architecture Guide](./ARCHITECTURE.md)**: System design and scalability
- **[User Guide](./USER_GUIDE.md)**: End-user perspective
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues and solutions
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Production configuration
