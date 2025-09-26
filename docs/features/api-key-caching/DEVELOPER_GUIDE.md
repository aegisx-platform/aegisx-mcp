# API Key Caching System - Developer Guide

## Technical Overview

The API Key Caching System is built on a multi-layered architecture that provides high-performance caching while maintaining strict security standards. This guide covers the technical implementation, integration patterns, and best practices for developers working with the system.

## Architecture Deep Dive

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Controllers   │   Middleware    │        Services         │
│   - API Routes  │   - Auth Check  │   - Business Logic     │
│   - Validation  │   - Cache Keys  │   - Data Processing    │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 ApiKeyCacheService                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Validation    │   Permissions   │    User Management      │
│   Caching       │   Caching      │    Caching             │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 RedisCacheService                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Core Cache    │   Tag-based     │    Statistics &        │
│   Operations    │   Invalidation  │    Monitoring          │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      Redis Layer                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Data Storage  │   Expiration    │    Memory Management    │
│   - Key-Value   │   - TTL         │    - Eviction Policies │
│   - Pipeline    │   - Auto-expire │    - Memory Limits     │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### Data Flow Architecture

```
API Request
     │
     ▼
┌─────────────┐    Cache Miss    ┌─────────────┐
│   Cache     │ ───────────────→ │  Database   │
│   Check     │                  │   Query     │
└─────────────┘                  └─────────────┘
     │                                 │
     │ Cache Hit                       │
     ▼                                 ▼
┌─────────────┐                  ┌─────────────┐
│  Validate   │                  │   Cache     │
│  & Return   │ ←─────────────── │   Store     │
└─────────────┘                  └─────────────┘
```

## Core Implementation

### ApiKeyCacheService Class Structure

```typescript
export class ApiKeyCacheService {
  private cache: RedisCacheService;
  private redis?: Redis;
  private logger: any;

  // Core functionality divided into specialized methods:
  // 1. Validation Caching
  // 2. Scope Permission Caching
  // 3. User Key List Caching
  // 4. Usage Statistics Caching
  // 5. Bulk Invalidation
  // 6. Cache Warming
  // 7. Monitoring & Health
}
```

### Configuration System

```typescript
export const API_KEY_CACHE_CONFIG = {
  // TTL Strategy: Security vs Performance Balance
  VALIDATION_TTL: 300, // 5 min: Frequent security checks
  SCOPE_TTL: 600, // 10 min: Permissions stable
  USER_LIST_TTL: 1800, // 30 min: Lists change rarely
  USAGE_BATCH_TTL: 60, // 1 min: Usage batching window

  // Namespace Organization
  PREFIXES: {
    VALIDATION: 'apikey:validation:',
    SCOPE: 'apikey:scope:',
    USER_LIST: 'apikey:user:',
    USAGE: 'apikey:usage:',
    STATS: 'apikey:stats:',
  },

  // Tag-based Invalidation
  TAGS: {
    USER: 'apikey-user-', // All user data
    KEY: 'apikey-', // Specific key data
    VALIDATION: 'apikey-validation', // All validation caches
    SCOPES: 'apikey-scopes', // All scope caches
  },
} as const;
```

## Implementation Patterns

### 1. Cache-First Validation Pattern

```typescript
async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
  // 1. Format validation (no DB/cache needed)
  const formatValidation = validateApiKeyFormat(apiKey);
  if (!formatValidation.isValid) {
    return { isValid: false, error: formatValidation.error };
  }

  const keyPrefix = formatValidation.prefix!;

  // 2. Cache lookup first
  if (this.cacheService) {
    const cachedData = await this.cacheService.getCachedValidation(keyPrefix);

    if (cachedData) {
      // 3. Validate cached data freshness
      if (!cachedData.is_active) {
        return { isValid: false, error: 'API key is disabled' };
      }

      if (isKeyExpired(cachedData.expires_at ? new Date(cachedData.expires_at) : null)) {
        // Clean up expired cache entry
        await this.cacheService.invalidateValidation(keyPrefix);
        return { isValid: false, error: 'API key has expired' };
      }

      // 4. Still need hash validation (security requirement)
      const keyData = await this.findByPrefix(keyPrefix);
      if (!keyData) {
        await this.cacheService.invalidateValidation(keyPrefix);
        return { isValid: false, error: 'API key not found' };
      }

      // 5. Validate hash against actual key
      const isValidHash = validateApiKey(apiKey, keyData.key_hash);
      if (!isValidHash) {
        return { isValid: false, error: 'Invalid API key' };
      }

      return { isValid: true, keyData };
    }
  }

  // 6. Cache miss: Database fallback + cache warming
  const keyData = await this.findByPrefix(keyPrefix);
  if (!keyData) {
    return { isValid: false, error: 'API key not found' };
  }

  // Validate and cache for future requests
  if (keyData.is_active && !isKeyExpired(keyData.expires_at)) {
    const isValidHash = validateApiKey(apiKey, keyData.key_hash);
    if (isValidHash && this.cacheService) {
      await this.cacheService.setCachedValidation(keyPrefix, keyData);
    }
    return { isValid: isValidHash, keyData: isValidHash ? keyData : undefined };
  }

  return { isValid: false, error: 'API key is invalid or expired' };
}
```

### 2. Scope Permission Caching Pattern

```typescript
async validateScope(
  keyId: string,
  resource: string,
  action: string,
  userId: string
): Promise<boolean> {
  // 1. Check cache first
  if (this.cacheService) {
    const cachedResult = await this.cacheService.getCachedScopeValidation(
      keyId,
      resource,
      action
    );

    if (cachedResult !== null) {
      return cachedResult;
    }
  }

  // 2. Database validation
  const isValid = await this.validateScopeFromDatabase(keyId, resource, action);

  // 3. Cache result for future requests
  if (this.cacheService) {
    await this.cacheService.setCachedScopeValidation(
      keyId,
      resource,
      action,
      isValid,
      userId
    );
  }

  return isValid;
}
```

### 3. Usage Statistics Batching Pattern

```typescript
async recordUsage(keyId: string): Promise<void> {
  if (!this.cacheService) {
    // Fallback: Direct database write
    await this.updateUsageInDatabase(keyId, 1);
    return;
  }

  // 1. Increment in-memory counter
  const currentCount = await this.cacheService.incrementUsage(keyId);

  // 2. Batch threshold check (optional optimization)
  const BATCH_THRESHOLD = 10;
  if (currentCount >= BATCH_THRESHOLD) {
    await this.flushUsageBatch(keyId);
  }

  // 3. Background periodic flush (handled by scheduler)
}

private async flushUsageBatch(keyId: string): Promise<void> {
  const count = await this.cacheService.getAndResetUsage(keyId);
  if (count > 0) {
    await this.updateUsageInDatabase(keyId, count);
  }
}
```

### 4. Tag-Based Invalidation Pattern

```typescript
async invalidateKeyData(keyId: string, userId: string): Promise<void> {
  try {
    // 1. Invalidate by key-specific tag
    await this.cache.invalidateByTags([
      `${API_KEY_CACHE_CONFIG.TAGS.KEY}${keyId}`,
    ]);

    // 2. Invalidate related user data
    await this.invalidateUserKeys(userId);

    // 3. Log for monitoring
    this.logger.info({
      msg: 'API key cache invalidated',
      keyId,
      userId,
    });
  } catch (error) {
    this.logger.error({
      msg: 'API key cache invalidation error',
      keyId,
      userId,
      error,
    });
    // Continue execution - cache invalidation failure shouldn't break app
  }
}
```

## Advanced Features

### Cache Warming Implementation

```typescript
async warmCache(frequentKeys: { prefix: string; data: ApiKeys }[]): Promise<void> {
  if (frequentKeys.length === 0) return;

  try {
    // 1. Prepare batch cache operations
    const cacheItems = new Map<string, CachedApiKeyData>();

    for (const { prefix, data } of frequentKeys) {
      const cachedData: CachedApiKeyData = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        key_prefix: data.key_prefix,
        scopes: data.scopes as ApiKeyScope[],
        is_active: data.is_active,
        expires_at: data.expires_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      cacheItems.set(prefix, cachedData);
    }

    // 2. Batch write to cache
    await this.cache.mset(cacheItems, {
      prefix: API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION,
      ttl: API_KEY_CACHE_CONFIG.VALIDATION_TTL,
    });

    this.logger.info({
      msg: 'API key cache warmed',
      count: frequentKeys.length,
    });
  } catch (error) {
    this.logger.error({
      msg: 'Cache warming error',
      error,
    });
  }
}

// Usage: Call during service startup or scheduled warming
async onServiceStartup(): Promise<void> {
  const frequentlyUsedKeys = await this.getFrequentlyUsedKeys();
  await this.warmCache(frequentlyUsedKeys);
}
```

### Health Monitoring Implementation

```typescript
async getCacheHealth(): Promise<{
  stats: any;
  validationCacheSize: number;
  scopeCacheSize: number;
  userListCacheSize: number;
  usageCacheSize: number;
}> {
  if (!this.redis) {
    return {
      stats: this.cache.getStats(),
      validationCacheSize: 0,
      scopeCacheSize: 0,
      userListCacheSize: 0,
      usageCacheSize: 0,
    };
  }

  try {
    // Parallel key counting for performance
    const [validationKeys, scopeKeys, userKeys, usageKeys] = await Promise.all([
      this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION}*`),
      this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.SCOPE}*`),
      this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.USER_LIST}*`),
      this.redis.keys(`${API_KEY_CACHE_CONFIG.PREFIXES.USAGE}*`),
    ]);

    return {
      stats: this.cache.getStats(),
      validationCacheSize: validationKeys.length,
      scopeCacheSize: scopeKeys.length,
      userListCacheSize: userKeys.length,
      usageCacheSize: usageKeys.length,
    };
  } catch (error) {
    this.logger.error({
      msg: 'Cache health check error',
      error,
    });

    return {
      stats: this.cache.getStats(),
      validationCacheSize: -1,
      scopeCacheSize: -1,
      userListCacheSize: -1,
      usageCacheSize: -1,
    };
  }
}
```

## Integration Examples

### Service Layer Integration

```typescript
export class ApiKeysService extends BaseService<ApiKeys, CreateApiKeys, UpdateApiKeys> {
  private cacheService?: ApiKeyCacheService;

  constructor(
    private apiKeysRepository: ApiKeysRepository,
    private eventService?: EventService,
    private fastify?: FastifyInstance,
  ) {
    super(apiKeysRepository);

    // Initialize cache service with dependency injection
    if (fastify) {
      this.cacheService = new ApiKeyCacheService(fastify);
    }
  }

  // Override create method to handle cache invalidation
  async create(data: CreateApiKeys): Promise<ApiKeys> {
    const newKey = await super.create(data);

    // Invalidate user cache since new key was added
    if (this.cacheService) {
      await this.cacheService.invalidateUserKeys(newKey.user_id);
    }

    return newKey;
  }

  // Override update method to handle cache invalidation
  async update(id: string | number, data: UpdateApiKeys): Promise<ApiKeys> {
    const updatedKey = await super.update(id, data);

    // Invalidate all related cache data
    if (this.cacheService) {
      await this.cacheService.invalidateKeyData(updatedKey.id, updatedKey.user_id);
    }

    return updatedKey;
  }
}
```

### Middleware Integration

```typescript
export async function apiKeyAuthMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const apiKey = extractApiKeyFromRequest(request);

  if (!apiKey) {
    return reply.status(401).send({ error: 'API key required' });
  }

  try {
    // Use cache-aware validation
    const cacheService = new ApiKeyCacheService(request.server);
    const validation = await validateApiKeyWithCache(apiKey, cacheService);

    if (!validation.isValid) {
      return reply.status(401).send({ error: validation.error });
    }

    // Attach validated data to request
    request.apiKeyData = validation.keyData;
    request.apiKeyCache = cacheService;
  } catch (error) {
    request.log.error('API key validation error', error);
    return reply.status(500).send({ error: 'Authentication service error' });
  }
}

async function validateApiKeyWithCache(apiKey: string, cacheService: ApiKeyCacheService): Promise<ApiKeyValidationResult> {
  const formatValidation = validateApiKeyFormat(apiKey);
  if (!formatValidation.isValid) {
    return { isValid: false, error: formatValidation.error };
  }

  const keyPrefix = formatValidation.prefix!;

  // Try cache first
  const cachedData = await cacheService.getCachedValidation(keyPrefix);
  if (cachedData) {
    // Validate cached data is still current
    if (!cachedData.is_active || isKeyExpired(cachedData.expires_at)) {
      await cacheService.invalidateValidation(keyPrefix);
      return { isValid: false, error: 'API key expired or disabled' };
    }

    return { isValid: true, keyData: cachedData };
  }

  // Fallback to database validation
  // ... implementation continues
}
```

### Controller Integration

```typescript
@Controller('/api/keys')
export class ApiKeysController {
  constructor(
    private apiKeysService: ApiKeysService,
    private cacheService: ApiKeyCacheService,
  ) {}

  @Get('/')
  async listKeys(@Request() req: FastifyRequest, @Query() query: ListApiKeysQuery): Promise<{ data: ApiKeys[]; pagination: any }> {
    const userId = req.user.id;

    // Try cache first for user key listings
    const cachedKeys = await this.cacheService.getCachedUserKeys(userId);
    if (cachedKeys && !query.includeUsage) {
      // Return cached data with proper pagination
      return this.paginateCachedKeys(cachedKeys, query);
    }

    // Cache miss or needs fresh data
    const result = await this.apiKeysService.findMany({
      ...query,
      userId,
    });

    // Cache the result for future requests
    await this.cacheService.setCachedUserKeys(userId, result.data);

    return result;
  }

  @Post('/:id/rotate')
  async rotateKey(@Param('id') id: string, @Request() req: FastifyRequest): Promise<{ key: string; preview: string }> {
    const rotated = await this.apiKeysService.rotateKey(id);

    // Invalidate all cache data for this key
    await this.cacheService.invalidateKeyData(id, req.user.id);

    return rotated;
  }
}
```

## Testing Strategies

### Unit Testing Cache Service

```typescript
describe('ApiKeyCacheService', () => {
  let cacheService: ApiKeyCacheService;
  let mockFastify: jest.Mocked<FastifyInstance>;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    mockRedis = createMockRedis();
    mockFastify = createMockFastify({ redis: mockRedis });
    cacheService = new ApiKeyCacheService(mockFastify);
  });

  describe('getCachedValidation', () => {
    it('should return cached data when available', async () => {
      // Arrange
      const keyPrefix = 'ak_test_prefix';
      const cachedData: CachedApiKeyData = {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        key_prefix: keyPrefix,
        scopes: ['read'],
        is_active: true,
        expires_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      // Act
      const result = await cacheService.getCachedValidation(keyPrefix);

      // Assert
      expect(result).toEqual(cachedData);
      expect(mockRedis.get).toHaveBeenCalledWith(`cache:apikeys:apikey:validation:${keyPrefix}`);
    });

    it('should return null when cache miss', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue(null);

      // Act
      const result = await cacheService.getCachedValidation('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      // Arrange
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      // Act
      const result = await cacheService.getCachedValidation('test');

      // Assert
      expect(result).toBeNull();
      // Should log error but not throw
    });
  });

  describe('setCachedValidation', () => {
    it('should cache API key data with correct TTL and tags', async () => {
      // Arrange
      const keyPrefix = 'ak_test_prefix';
      const apiKeyData: ApiKeys = {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        key_prefix: keyPrefix,
        key_hash: 'hashed_secret', // Should not be cached
        scopes: ['read'],
        is_active: true,
        expires_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockRedis.setex.mockResolvedValue('OK');

      // Act
      const result = await cacheService.setCachedValidation(keyPrefix, apiKeyData);

      // Assert
      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `cache:apikeys:apikey:validation:${keyPrefix}`,
        300, // TTL
        expect.stringContaining('"id":"key-123"'),
      );

      // Verify sensitive data is excluded
      const cachedValue = mockRedis.setex.mock.calls[0][2];
      expect(cachedValue).not.toContain('key_hash');
      expect(cachedValue).not.toContain('hashed_secret');
    });
  });
});
```

### Integration Testing

```typescript
describe('Cache Integration', () => {
  let app: FastifyInstance;
  let redis: Redis;

  beforeAll(async () => {
    app = await createTestApp();
    redis = app.redis;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await redis.flushall();
  });

  it('should use cache for repeated API key validations', async () => {
    // Arrange
    const apiKey = await createTestApiKey();
    const endpoint = '/api/protected-resource';

    // Act & Assert - First request (cache miss)
    const response1 = await app.inject({
      method: 'GET',
      url: endpoint,
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response1.statusCode).toBe(200);
    expect(response1.headers['x-cache-status']).toBe('MISS');

    // Second request (cache hit)
    const response2 = await app.inject({
      method: 'GET',
      url: endpoint,
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response2.statusCode).toBe(200);
    expect(response2.headers['x-cache-status']).toBe('HIT');
  });

  it('should invalidate cache when API key is updated', async () => {
    // Arrange
    const apiKey = await createTestApiKey();

    // Prime the cache
    await validateApiKey(apiKey);

    // Act - Update the key
    await updateApiKey(apiKey.id, { name: 'Updated Name' });

    // Assert - Cache should be invalidated
    const cachedData = await redis.get(`cache:apikeys:apikey:validation:${apiKey.prefix}`);
    expect(cachedData).toBeNull();
  });
});
```

### Performance Testing

```typescript
describe('Cache Performance', () => {
  it('should handle high-volume validation requests', async () => {
    const apiKey = await createTestApiKey();
    const cacheService = new ApiKeyCacheService(app);

    // Warm the cache
    await cacheService.getCachedValidation(apiKey.prefix);

    // Performance test
    const start = Date.now();
    const promises = Array(1000)
      .fill(null)
      .map(() => cacheService.getCachedValidation(apiKey.prefix));

    await Promise.all(promises);
    const duration = Date.now() - start;

    // Should complete 1000 cache hits in under 100ms
    expect(duration).toBeLessThan(100);
  });

  it('should batch usage statistics efficiently', async () => {
    const apiKey = await createTestApiKey();
    const cacheService = new ApiKeyCacheService(app);

    // Test batching
    const promises = Array(50)
      .fill(null)
      .map(() => cacheService.incrementUsage(apiKey.id));

    await Promise.all(promises);

    // Verify batching occurred
    const count = await cacheService.getAndResetUsage(apiKey.id);
    expect(count).toBe(50);
  });
});
```

## Performance Optimization

### Memory Management

```typescript
// Configure Redis for optimal cache performance
const redisConfig = {
  // Memory optimization
  maxmemory: '256mb',
  'maxmemory-policy': 'allkeys-lru',

  // Performance optimization
  'tcp-keepalive': 60,
  'tcp-nodelay': 'yes',

  // Persistence (optional for cache)
  save: '', // Disable persistence for pure cache
  appendonly: 'no',
};
```

### Batch Operations

```typescript
// Optimize cache operations with pipelining
async batchInvalidateKeys(keyIds: string[]): Promise<void> {
  if (!this.redis || keyIds.length === 0) return;

  const pipeline = this.redis.pipeline();

  for (const keyId of keyIds) {
    // Add all invalidation operations to pipeline
    pipeline.del(`${API_KEY_CACHE_CONFIG.PREFIXES.VALIDATION}${keyId}`);
    pipeline.del(`${API_KEY_CACHE_CONFIG.PREFIXES.SCOPE}${keyId}:*`);
  }

  await pipeline.exec();
}
```

### Cache Size Management

```typescript
async monitorCacheSize(): Promise<void> {
  const info = await this.redis.info('memory');
  const usedMemory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0');
  const maxMemory = parseInt(info.match(/maxmemory:(\d+)/)?.[1] || '0');

  if (maxMemory > 0 && usedMemory / maxMemory > 0.8) {
    this.logger.warn({
      msg: 'Cache memory usage high',
      usedMemory,
      maxMemory,
      utilization: (usedMemory / maxMemory * 100).toFixed(2) + '%',
    });

    // Trigger cleanup of expired keys
    await this.cleanupExpiredKeys();
  }
}
```

## Security Considerations

### Data Sanitization

```typescript
private sanitizeApiKeyData(apiKey: ApiKeys): CachedApiKeyData {
  // CRITICAL: Never cache sensitive data
  return {
    id: apiKey.id,
    user_id: apiKey.user_id,
    name: apiKey.name,
    key_prefix: apiKey.key_prefix,
    scopes: apiKey.scopes as ApiKeyScope[],
    is_active: apiKey.is_active,
    expires_at: apiKey.expires_at,
    created_at: apiKey.created_at,
    updated_at: apiKey.updated_at,
    // EXCLUDED: key_hash, any other sensitive fields
  };
}
```

### Cache Key Security

```typescript
private buildSecureCacheKey(prefix: string, identifier: string): string {
  // Use prefix instead of full key for security
  // Prevents key enumeration attacks
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '');
  return `${this.namespace}:${safePrefix}:${identifier}`;
}
```

### TTL Security Strategy

```typescript
// Security-first TTL configuration
const SECURITY_TTL_CONFIG = {
  // Critical security data: Short TTL
  VALIDATION: 300, // 5 minutes
  PERMISSIONS: 600, // 10 minutes

  // Less sensitive data: Longer TTL
  USER_LISTS: 1800, // 30 minutes
  STATISTICS: 3600, // 1 hour

  // Emergency: Immediate invalidation
  SECURITY_EVENT: 0, // Immediate expiration
};
```

## Troubleshooting Development Issues

### Common Cache Problems

**Cache Miss Rate Too High**

```typescript
// Monitor and debug cache performance
async debugCachePerformance(): Promise<void> {
  const stats = this.cache.getStats();

  console.log({
    hitRate: stats.hitRate,
    hits: stats.hits,
    misses: stats.misses,
    errors: stats.errors,
  });

  if (stats.hitRate < 0.8) {
    console.warn('Cache hit rate below 80%');
    // Investigate cache invalidation patterns
    await this.auditCacheInvalidations();
  }
}
```

**Memory Leaks**

```typescript
// Monitor cache memory usage
async detectMemoryLeaks(): Promise<void> {
  const keys = await this.redis.keys('cache:apikeys:*');
  const keysByPrefix = {};

  for (const key of keys) {
    const prefix = key.split(':')[2];
    keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
  }

  console.log('Cache distribution:', keysByPrefix);

  // Alert if any prefix has excessive keys
  for (const [prefix, count] of Object.entries(keysByPrefix)) {
    if (count > 10000) {
      console.warn(`Potential memory leak in ${prefix}: ${count} keys`);
    }
  }
}
```

**Cache Invalidation Issues**

```typescript
// Debug invalidation patterns
async auditCacheInvalidations(): Promise<void> {
  const auditLog = [];

  // Override invalidation methods to add logging
  const originalInvalidate = this.cache.invalidateByTags;
  this.cache.invalidateByTags = async (tags: string[]) => {
    auditLog.push({
      timestamp: new Date(),
      action: 'invalidateByTags',
      tags,
      stackTrace: new Error().stack,
    });

    return originalInvalidate.call(this.cache, tags);
  };

  // Review audit log for patterns
  setTimeout(() => {
    console.log('Invalidation audit:', auditLog);
  }, 60000);
}
```

## Best Practices Summary

### Development Guidelines

1. **Always fallback gracefully**: Cache failures should not break application
2. **Never cache sensitive data**: API key hashes, secrets, or credentials
3. **Use appropriate TTLs**: Balance security with performance needs
4. **Implement proper invalidation**: Clear stale data on updates
5. **Monitor cache performance**: Track hit rates and response times
6. **Test cache behavior**: Include cache scenarios in tests
7. **Handle Redis failures**: Graceful degradation to database
8. **Use batch operations**: Optimize for high-volume scenarios

### Security Guidelines

1. **Validate cached data**: Check freshness and validity
2. **Use secure cache keys**: Prevent enumeration attacks
3. **Implement immediate invalidation**: For security events
4. **Audit cache access**: Monitor for suspicious patterns
5. **Configure memory limits**: Prevent cache exhaustion
6. **Use encryption**: For sensitive cached data (if any)
7. **Regular security reviews**: Audit cached data types

### Performance Guidelines

1. **Cache frequently accessed data**: Focus on hot paths
2. **Use appropriate batch sizes**: Balance memory and performance
3. **Monitor memory usage**: Prevent out-of-memory conditions
4. **Implement cache warming**: Pre-load critical data
5. **Use pipeline operations**: Batch Redis commands
6. **Configure eviction policies**: Handle memory pressure
7. **Profile cache performance**: Identify bottlenecks

## Related Documentation

- **[Architecture Guide](./ARCHITECTURE.md)**: Deep dive into system design
- **[API Reference](./API_REFERENCE.md)**: Complete method documentation
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Production configuration
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Issue resolution guide
- **[Redis Cache Service](../../services/redis-cache-service.md)**: Underlying cache implementation
