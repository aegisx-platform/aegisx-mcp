# API Key Caching System - Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting procedures for the API Key Caching System. It covers common issues, diagnostic procedures, resolution steps, and emergency recovery procedures.

## Quick Diagnostics Checklist

### 🔍 Initial Health Check

Before diving into specific issues, run this quick diagnostic sequence:

```bash
# 1. Check Redis connectivity
redis-cli ping
# Expected: PONG

# 2. Check cache service health
curl http://localhost:3333/health/cache
# Expected: HTTP 200 with healthy status

# 3. Check application logs
tail -f /var/log/aegisx/api.log | grep -i cache

# 4. Check Redis memory usage
redis-cli INFO memory | grep used_memory_human

# 5. Check cache hit rate
redis-cli INFO stats | grep keyspace_hits
```

### 🚨 Emergency Assessment

If you have a critical issue, check these first:

| Check                | Command                                         | Critical Threshold |
| -------------------- | ----------------------------------------------- | ------------------ |
| **Redis Up**         | `redis-cli ping`                                | Must return PONG   |
| **Memory Usage**     | `redis-cli INFO memory \| grep used_memory_rss` | <90% of maxmemory  |
| **Hit Rate**         | `curl localhost:3333/health/cache`              | >80% hit rate      |
| **Error Rate**       | Check application logs                          | <5% error rate     |
| **Connection Count** | `redis-cli INFO clients`                        | <80% of maxclients |

## Common Issues and Solutions

### 1. Cache Miss Rate Too High

#### Symptoms

- API response times consistently high (>50ms)
- Database load higher than expected
- Cache hit rate below 80%
- Users reporting slow dashboard performance

#### Diagnosis

```bash
# Check overall cache statistics
curl -s http://localhost:3333/health/cache | jq '.cache'

# Monitor cache operations in real-time
redis-cli MONITOR | grep -E "(GET|SET|DEL)"

# Check TTL distribution
redis-cli --scan --pattern "cache:apikeys:*" | xargs -I {} redis-cli TTL {}

# Analyze cache key patterns
redis-cli --scan --pattern "cache:apikeys:*" | head -20
```

#### Root Cause Analysis

**Possible Causes:**

1. **TTL too short**: Cache expires before being reused
2. **Cache invalidation too aggressive**: Unnecessary cache clearing
3. **Low traffic patterns**: Not enough repeated requests
4. **Memory pressure**: Redis evicting keys due to memory limits
5. **Application not using cache**: Bypassing cache layer

**Investigation Steps:**

```bash
# 1. Check TTL configuration
grep -r "TTL" /path/to/api/src/modules/apiKeys/services/

# 2. Monitor cache invalidation events
redis-cli MONITOR | grep DEL

# 3. Check memory pressure
redis-cli INFO memory | grep -E "(used_memory|maxmemory|evicted_keys)"

# 4. Verify cache is being used
grep -r "getCachedValidation" /var/log/aegisx/api.log | tail -10
```

#### Solutions

**Solution 1: Adjust TTL Configuration**

```typescript
// Update TTL values in configuration
export const API_KEY_CACHE_CONFIG = {
  VALIDATION_TTL: 600, // Increase from 300 to 600 seconds
  SCOPE_TTL: 900, // Increase from 600 to 900 seconds
  USER_LIST_TTL: 2700, // Increase from 1800 to 2700 seconds
};
```

**Solution 2: Optimize Cache Warming**

```bash
# Implement aggressive cache warming
curl -X POST http://localhost:3333/admin/cache/warm

# Or warm specific user data
curl -X POST http://localhost:3333/admin/cache/warm-user/{userId}
```

**Solution 3: Increase Memory Allocation**

```bash
# Increase Redis memory limit
redis-cli CONFIG SET maxmemory 4gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Update configuration file
echo "maxmemory 4gb" >> /etc/redis/redis.conf
```

**Solution 4: Review Invalidation Logic**

```typescript
// Audit cache invalidation calls
// Look for unnecessary invalidateKeyData() calls
await this.cacheService.invalidateKeyData(keyId, userId); // Only on actual updates
```

### 2. High Memory Usage

#### Symptoms

- Redis memory usage approaching or exceeding limits
- Frequent cache evictions
- Out-of-memory errors in Redis logs
- Degraded cache performance

#### Diagnosis

```bash
# Check detailed memory usage
redis-cli INFO memory

# Identify largest keys
redis-cli --bigkeys

# Check memory fragmentation
redis-cli INFO memory | grep mem_fragmentation_ratio

# Monitor eviction events
redis-cli INFO stats | grep evicted_keys

# Check key distribution by prefix
redis-cli --scan --pattern "cache:apikeys:*" | cut -d: -f1-3 | sort | uniq -c
```

#### Root Cause Analysis

**Memory Usage Breakdown:**

```bash
# Analyze memory usage by cache type
echo "Validation cache keys:"
redis-cli --scan --pattern "cache:apikeys:apikey:validation:*" | wc -l

echo "Scope cache keys:"
redis-cli --scan --pattern "cache:apikeys:apikey:scope:*" | wc -l

echo "User list cache keys:"
redis-cli --scan --pattern "cache:apikeys:apikey:user:*" | wc -l

echo "Usage cache keys:"
redis-cli --scan --pattern "cache:apikeys:apikey:usage:*" | wc -l
```

#### Solutions

**Solution 1: Implement Memory Monitoring**

```typescript
// Add memory monitoring to cache service
class CacheMemoryMonitor {
  async checkMemoryUsage(): Promise<void> {
    const memInfo = await this.redis.info('memory');
    const usedMemory = this.parseMemoryValue(memInfo, 'used_memory');
    const maxMemory = this.parseMemoryValue(memInfo, 'maxmemory');

    if (maxMemory > 0 && usedMemory / maxMemory > 0.8) {
      await this.triggerMemoryCleanup();
    }
  }

  private async triggerMemoryCleanup(): Promise<void> {
    // Clean up expired usage statistics
    await this.cleanupExpiredUsageStats();

    // Force LRU eviction of least used keys
    await this.redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
  }
}
```

**Solution 2: Optimize Data Storage**

```typescript
// Reduce cached data size
private sanitizeForCache(data: ApiKeys): CachedApiKeyData {
  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name.substring(0, 100), // Limit name length
    key_prefix: data.key_prefix,
    scopes: data.scopes.slice(0, 10), // Limit scope array size
    is_active: data.is_active,
    expires_at: data.expires_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
```

**Solution 3: Implement Cache Partitioning**

```bash
# Set up Redis cluster for horizontal scaling
redis-cli --cluster create \
  redis-1:7000 redis-2:7001 redis-3:7002 \
  redis-4:7003 redis-5:7004 redis-6:7005 \
  --cluster-replicas 1
```

### 3. Connection Issues

#### Symptoms

- "Connection refused" errors
- Timeout errors in application logs
- Intermittent cache failures
- High connection count warnings

#### Diagnosis

```bash
# Check Redis server status
sudo systemctl status redis

# Test connectivity
redis-cli -h localhost -p 6379 ping

# Check connection count
redis-cli INFO clients

# Monitor connections
netstat -an | grep :6379 | grep ESTABLISHED | wc -l

# Check connection pool status (application-specific)
curl http://localhost:3333/admin/cache/pool-status
```

#### Root Cause Analysis

**Common Connection Issues:**

1. **Redis server down**: Service stopped or crashed
2. **Network connectivity**: Firewall or routing issues
3. **Connection pool exhaustion**: Too many concurrent connections
4. **Authentication failures**: Wrong password or configuration
5. **Port conflicts**: Another service using Redis port

#### Solutions

**Solution 1: Restart Redis Service**

```bash
# Check Redis logs first
sudo journalctl -u redis -f

# Restart if needed
sudo systemctl restart redis

# Verify restart
redis-cli ping
```

**Solution 2: Fix Connection Pool Configuration**

```typescript
// Optimize connection pool settings
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,

  // Connection pool optimization
  maxConnections: 50, // Increase pool size
  minConnections: 5, // Maintain minimum connections
  acquireTimeoutMillis: 30000, // Increase timeout

  // Redis-specific settings
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
};
```

**Solution 3: Network Troubleshooting**

```bash
# Check firewall rules
sudo ufw status | grep 6379

# Test port connectivity
telnet localhost 6379

# Check DNS resolution
nslookup redis.internal.company.com

# Test with different interface
redis-cli -h 127.0.0.1 -p 6379 ping
redis-cli -h $(hostname -I | awk '{print $1}') -p 6379 ping
```

### 4. Slow Cache Performance

#### Symptoms

- Cache operations taking >10ms
- High CPU usage on Redis server
- Slow query warnings in Redis log
- Application performance degradation despite cache hits

#### Diagnosis

```bash
# Monitor Redis latency
redis-cli --latency

# Check slow query log
redis-cli SLOWLOG GET 10

# Monitor Redis CPU usage
top -p $(pgrep redis-server)

# Check key complexity
redis-cli --bigkeys

# Monitor command frequency
redis-cli --stat
```

#### Root Cause Analysis

**Performance Bottlenecks:**

1. **Large key values**: Oversized cached objects
2. **Complex operations**: Heavy Redis commands
3. **Memory fragmentation**: Inefficient memory usage
4. **Disk I/O**: Persistence operations blocking
5. **Network latency**: Slow connection to Redis

#### Solutions

**Solution 1: Optimize Key Sizes**

```typescript
// Implement key size monitoring
class CacheKeyOptimizer {
  async optimizeKeySize(key: string, data: any): Promise<any> {
    const serialized = JSON.stringify(data);

    if (serialized.length > 10000) {
      // 10KB threshold
      console.warn(`Large cache key detected: ${key} (${serialized.length} bytes)`);

      // Compress or reduce data
      return this.compressData(data);
    }

    return data;
  }

  private compressData(data: any): any {
    // Remove unnecessary fields
    const compressed = { ...data };
    delete compressed.metadata;
    delete compressed.debug_info;

    // Truncate long strings
    if (compressed.description?.length > 200) {
      compressed.description = compressed.description.substring(0, 200) + '...';
    }

    return compressed;
  }
}
```

**Solution 2: Use Pipeline Operations**

```typescript
// Batch cache operations for efficiency
class BatchCacheOperations {
  async batchSetValidations(validations: Array<{ prefix: string; data: ApiKeys }>): Promise<void> {
    const pipeline = this.redis.pipeline();

    for (const { prefix, data } of validations) {
      const cacheKey = `cache:apikeys:apikey:validation:${prefix}`;
      const cachedData = this.sanitizeForCache(data);

      pipeline.setex(cacheKey, API_KEY_CACHE_CONFIG.VALIDATION_TTL, JSON.stringify(cachedData));
    }

    await pipeline.exec();
  }
}
```

**Solution 3: Disable Persistence for Pure Cache**

```bash
# Optimize Redis for cache-only usage
redis-cli CONFIG SET save ""
redis-cli CONFIG SET appendonly no

# Update configuration file
echo "save \"\"" >> /etc/redis/redis.conf
echo "appendonly no" >> /etc/redis/redis.conf
```

### 5. Cache Inconsistency Issues

#### Symptoms

- Stale data returned from cache
- Cache showing old API key statuses
- Permission checks returning outdated results
- Users seeing deleted API keys in dashboard

#### Diagnosis

```bash
# Check cache vs database consistency
# (Requires custom verification script)
node scripts/verify-cache-consistency.js

# Monitor cache invalidation events
redis-cli MONITOR | grep DEL

# Check TTL values
redis-cli --scan --pattern "cache:apikeys:*" | xargs -I {} sh -c 'echo "{}:" && redis-cli TTL {}'

# Verify application invalidation logic
grep -r "invalidate" /var/log/aegisx/api.log | tail -10
```

#### Root Cause Analysis

**Consistency Issues:**

1. **Missing invalidation**: Cache not cleared on data updates
2. **Race conditions**: Update/invalidate timing conflicts
3. **TTL too long**: Stale data persisting too long
4. **Partial failures**: Invalidation failing silently
5. **Cross-service updates**: External updates bypassing cache

#### Solutions

**Solution 1: Implement Consistency Checks**

```typescript
// Add consistency verification
class CacheConsistencyChecker {
  async verifyCacheConsistency(keyPrefix: string): Promise<boolean> {
    const cachedData = await this.cacheService.getCachedValidation(keyPrefix);
    const dbData = await this.database.findByPrefix(keyPrefix);

    if (!cachedData || !dbData) {
      return true; // No inconsistency if one is missing
    }

    // Check critical fields
    const isConsistent = cachedData.is_active === dbData.is_active && cachedData.expires_at === dbData.expires_at && JSON.stringify(cachedData.scopes) === JSON.stringify(dbData.scopes);

    if (!isConsistent) {
      console.warn(`Cache inconsistency detected for ${keyPrefix}`);
      await this.cacheService.invalidateValidation(keyPrefix);
    }

    return isConsistent;
  }
}
```

**Solution 2: Implement Transactional Invalidation**

```typescript
// Ensure invalidation happens with updates
class TransactionalCacheService {
  async updateApiKeyWithCache(id: string, updates: UpdateApiKeys): Promise<ApiKeys> {
    const transaction = await this.database.beginTransaction();

    try {
      // Update database
      const updatedKey = await this.database.update(id, updates, { transaction });

      // Invalidate cache
      await this.cacheService.invalidateKeyData(id, updatedKey.user_id);

      await transaction.commit();
      return updatedKey;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

**Solution 3: Add Cache Versioning**

```typescript
// Implement cache versioning for consistency
interface VersionedCacheData extends CachedApiKeyData {
  _cache_version: string;
  _cached_at: number;
}

class VersionedCacheService {
  private readonly CACHE_VERSION = '1.0';

  async setCachedValidation(keyPrefix: string, data: ApiKeys): Promise<boolean> {
    const versionedData: VersionedCacheData = {
      ...this.sanitizeForCache(data),
      _cache_version: this.CACHE_VERSION,
      _cached_at: Date.now(),
    };

    return this.cache.set(keyPrefix, versionedData, this.getOptions());
  }

  async getCachedValidation(keyPrefix: string): Promise<CachedApiKeyData | null> {
    const data = await this.cache.get<VersionedCacheData>(keyPrefix);

    if (!data) return null;

    // Check version compatibility
    if (data._cache_version !== this.CACHE_VERSION) {
      await this.cache.del(keyPrefix);
      return null;
    }

    return data;
  }
}
```

## Advanced Troubleshooting

### Memory Leak Detection

#### Monitoring Script

```bash
#!/bin/bash
# memory-leak-monitor.sh

REDIS_HOST="localhost"
REDIS_PORT="6379"
LOG_FILE="/var/log/redis-memory-monitor.log"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  MEMORY_INFO=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO memory)

  USED_MEMORY=$(echo "$MEMORY_INFO" | grep used_memory: | cut -d: -f2 | tr -d '\r')
  KEY_COUNT=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT DBSIZE)

  echo "$TIMESTAMP - Memory: $USED_MEMORY, Keys: $KEY_COUNT" >> $LOG_FILE

  # Alert if memory growth is concerning
  if [ $USED_MEMORY -gt 1073741824 ]; then  # 1GB threshold
    echo "WARNING: Redis memory usage high: $USED_MEMORY bytes" >> $LOG_FILE
  fi

  sleep 300  # Check every 5 minutes
done
```

#### Memory Analysis Tools

```bash
# Generate memory usage report
redis-cli --bigkeys --output /tmp/bigkeys-$(date +%Y%m%d).txt

# Memory analysis by pattern
for pattern in "validation" "scope" "user" "usage"; do
  echo "Cache type: $pattern"
  redis-cli --scan --pattern "cache:apikeys:*:$pattern:*" | wc -l
done

# Check for memory fragmentation
redis-cli INFO memory | grep fragmentation
```

### Performance Profiling

#### Cache Operation Profiling

```typescript
class CacheProfiler {
  private operations: Map<string, { count: number; totalTime: number }> = new Map();

  async profileOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.recordOperation(operation, duration);

      if (duration > 100) {
        // Log slow operations
        console.warn(`Slow cache operation: ${operation} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      console.error(`Cache operation failed: ${operation}`, error);
      throw error;
    }
  }

  private recordOperation(operation: string, duration: number): void {
    const stats = this.operations.get(operation) || { count: 0, totalTime: 0 };
    stats.count++;
    stats.totalTime += duration;
    this.operations.set(operation, stats);
  }

  getPerformanceReport(): string {
    let report = 'Cache Performance Report:\n';

    for (const [operation, stats] of this.operations.entries()) {
      const avgTime = stats.totalTime / stats.count;
      report += `${operation}: ${stats.count} ops, avg ${avgTime.toFixed(2)}ms\n`;
    }

    return report;
  }
}
```

### Network Diagnostics

#### Connection Monitoring

```bash
# Monitor active Redis connections
watch -n 5 'netstat -an | grep :6379 | wc -l'

# Check connection states
netstat -an | grep :6379 | awk '{print $6}' | sort | uniq -c

# Monitor Redis command latency
redis-cli --latency-history -i 1
```

#### Network Performance Testing

```bash
# Test Redis network performance
redis-cli --latency-dist

# Bandwidth test
redis-cli eval "
  for i=1,10000 do
    redis.call('set', 'test_key_'..i, string.rep('x', 1024))
  end
  return 'OK'
" 0
```

## Emergency Procedures

### 🚨 Critical Cache Failure

When the cache system is completely unavailable:

```bash
#!/bin/bash
# emergency-fallback.sh

echo "EMERGENCY: Implementing database-only fallback"

# 1. Update application configuration
export CACHE_ENABLED=false
export FORCE_DATABASE_FALLBACK=true

# 2. Restart application with fallback mode
sudo systemctl restart aegisx-api

# 3. Monitor database performance
tail -f /var/log/postgresql/postgresql.log | grep -i "slow\|error"

# 4. Scale database connections if needed
# Update database connection pool size

echo "Fallback mode activated - monitor database load"
```

### 🔥 Cache Corruption Recovery

When cache contains corrupted or inconsistent data:

```bash
#!/bin/bash
# cache-corruption-recovery.sh

echo "Starting cache corruption recovery..."

# 1. Stop application writes to cache
curl -X POST http://localhost:3333/admin/cache/disable-writes

# 2. Backup current cache state
redis-cli --rdb /tmp/corrupted-cache-backup-$(date +%Y%m%d-%H%M%S).rdb

# 3. Clear corrupted cache
redis-cli FLUSHALL

# 4. Verify cache is empty
KEYS_COUNT=$(redis-cli DBSIZE)
if [ $KEYS_COUNT -eq 0 ]; then
  echo "Cache cleared successfully"
else
  echo "ERROR: Cache not fully cleared, $KEYS_COUNT keys remaining"
  exit 1
fi

# 5. Restart application to rebuild cache
sudo systemctl restart aegisx-api

# 6. Trigger cache warming
sleep 30
curl -X POST http://localhost:3333/admin/cache/warm

# 7. Re-enable cache writes
curl -X POST http://localhost:3333/admin/cache/enable-writes

echo "Cache corruption recovery completed"
```

### 🩺 Health Recovery Scripts

#### Automated Recovery Script

```bash
#!/bin/bash
# auto-recovery.sh

LOG_FILE="/var/log/cache-recovery.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
  echo "[$TIMESTAMP] $1" | tee -a $LOG_FILE
}

# Check Redis connectivity
if ! redis-cli ping > /dev/null 2>&1; then
  log_message "Redis not responding, attempting restart"
  sudo systemctl restart redis
  sleep 10

  if redis-cli ping > /dev/null 2>&1; then
    log_message "Redis restart successful"
  else
    log_message "Redis restart failed, enabling fallback mode"
    export CACHE_ENABLED=false
    sudo systemctl restart aegisx-api
    exit 1
  fi
fi

# Check cache hit rate
HIT_RATE=$(curl -s http://localhost:3333/health/cache | jq -r '.cache.hitRate')
if (( $(echo "$HIT_RATE < 0.5" | bc -l) )); then
  log_message "Low hit rate detected ($HIT_RATE), warming cache"
  curl -X POST http://localhost:3333/admin/cache/warm
fi

# Check memory usage
MEMORY_USAGE=$(redis-cli INFO memory | grep used_memory_rss | cut -d: -f2 | tr -d '\r')
MAX_MEMORY=$(redis-cli CONFIG GET maxmemory | tail -1)

if [ $MAX_MEMORY -gt 0 ] && [ $MEMORY_USAGE -gt $((MAX_MEMORY * 90 / 100)) ]; then
  log_message "High memory usage detected, triggering cleanup"
  redis-cli --scan --pattern "cache:apikeys:usage:*" | head -1000 | xargs redis-cli DEL
fi

log_message "Health check completed"
```

## Monitoring and Alerting Setup

### Comprehensive Monitoring Dashboard

#### Grafana Queries

```sql
-- Cache Hit Rate
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))

-- Memory Usage Percentage
redis_memory_used_bytes / redis_memory_max_bytes * 100

-- Average Response Time
histogram_quantile(0.50, rate(cache_operation_duration_seconds_bucket[5m]))

-- Error Rate
rate(cache_errors_total[5m]) / rate(cache_operations_total[5m]) * 100

-- Connection Count
redis_connected_clients
```

#### Alert Rules

```yaml
# Prometheus alert rules
groups:
  - name: cache-alerts
    rules:
      - alert: CacheHitRateLow
        expr: cache_hit_rate < 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Cache hit rate is low'
          description: 'Cache hit rate has been below 80% for more than 5 minutes'

      - alert: CacheMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'Redis memory usage is high'
          description: 'Redis memory usage is above 90%'

      - alert: CacheResponseTimeSlow
        expr: histogram_quantile(0.95, rate(cache_operation_duration_seconds_bucket[5m])) > 0.1
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: 'Cache response time is slow'
          description: '95th percentile cache response time is above 100ms'
```

### Log Analysis Patterns

#### Common Error Patterns

```bash
# Redis connection errors
grep -E "(Connection refused|Connection timeout|Auth failed)" /var/log/aegisx/api.log

# Cache operation failures
grep -E "(Cache operation failed|Redis error|Cache timeout)" /var/log/aegisx/api.log

# Memory pressure indicators
grep -E "(OOM|Out of memory|Memory limit)" /var/log/redis/redis.log

# Slow operations
grep -E "(slow|timeout)" /var/log/redis/redis.log | tail -20
```

#### Log Aggregation Query

```bash
# ELK Stack query for cache issues
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-1h"
            }
          }
        }
      ],
      "should": [
        {
          "match": {
            "message": "cache error"
          }
        },
        {
          "match": {
            "message": "redis"
          }
        }
      ]
    }
  }
}
```

## Performance Tuning Guide

### Redis Configuration Optimization

```bash
# High-performance Redis configuration
cat >> /etc/redis/redis.conf << EOF
# Memory optimization
maxmemory-policy allkeys-lru
hash-max-ziplist-entries 512
list-max-ziplist-size -2
set-max-intset-entries 512

# Network optimization
tcp-keepalive 300
tcp-nodelay yes
timeout 0

# Performance tuning
hz 10
dynamic-hz yes
latency-monitor-threshold 100

# Logging for troubleshooting
loglevel notice
slowlog-log-slower-than 10000
slowlog-max-len 128
EOF
```

### Application-Level Optimization

```typescript
// Optimized cache configuration
const optimizedCacheConfig = {
  // Aggressive caching for stable data
  VALIDATION_TTL: 900, // 15 minutes
  SCOPE_TTL: 1800, // 30 minutes

  // Shorter TTL for frequently changing data
  USER_LIST_TTL: 600, // 10 minutes
  USAGE_BATCH_TTL: 30, // 30 seconds

  // Performance optimizations
  BATCH_SIZE: 100, // Batch operations
  PIPELINE_THRESHOLD: 10, // Use pipeline for >10 ops
  CONNECTION_POOL_SIZE: 50, // Increase pool size
};
```

## Best Practices Summary

### 🎯 Prevention Strategies

1. **Monitoring**: Implement comprehensive monitoring and alerting
2. **Testing**: Regular cache performance and consistency testing
3. **Documentation**: Keep runbooks updated with common issues
4. **Automation**: Automated recovery scripts for common problems
5. **Capacity Planning**: Monitor growth and plan scaling

### 🛠️ Troubleshooting Methodology

1. **Assess Impact**: Determine scope and urgency of the issue
2. **Gather Data**: Collect logs, metrics, and system state
3. **Isolate Problem**: Narrow down the root cause
4. **Apply Solution**: Implement fix with minimal disruption
5. **Verify Resolution**: Confirm the issue is resolved
6. **Document**: Update troubleshooting guide with learnings

### 📋 Regular Maintenance

1. **Weekly**: Review cache performance metrics and hit rates
2. **Monthly**: Analyze memory usage trends and capacity needs
3. **Quarterly**: Review and update cache configuration
4. **Semi-annually**: Comprehensive performance testing and optimization

## Related Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Production deployment procedures
- **[Architecture Guide](./ARCHITECTURE.md)**: System design and components
- **[API Reference](./API_REFERENCE.md)**: Complete method documentation
- **[Developer Guide](./DEVELOPER_GUIDE.md)**: Implementation details
- **[User Guide](./USER_GUIDE.md)**: End-user perspective and usage patterns
