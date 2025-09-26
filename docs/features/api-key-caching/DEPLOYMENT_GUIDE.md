# API Key Caching System - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the API Key Caching System to production environments. It covers system requirements, configuration options, security hardening, monitoring setup, and operational procedures.

## System Requirements

### Minimum Requirements

**Redis Server:**

- **Memory**: 2GB RAM minimum (4GB recommended)
- **CPU**: 2 cores minimum (4 cores recommended)
- **Storage**: 10GB SSD minimum (fast I/O required)
- **Network**: 1Gbps network interface
- **Redis Version**: 6.0+ (7.0+ recommended)

**Application Server:**

- **Memory**: 1GB additional RAM for cache service
- **CPU**: Minimal impact (cache operations are lightweight)
- **Network**: Low latency connection to Redis (<1ms preferred)

**Network Requirements:**

- **Latency**: <1ms between app server and Redis
- **Bandwidth**: 100Mbps minimum for cache traffic
- **Reliability**: 99.9% uptime SLA

### Production Requirements

**Redis High Availability:**

- **Primary + 2 Replicas**: For redundancy and read scaling
- **Sentinel**: For automatic failover (3 instances minimum)
- **Memory**: 8GB+ RAM for large-scale deployments
- **Storage**: 50GB+ SSD with backup storage

**Application Scaling:**

- **Connection Pool**: 10-50 connections per app instance
- **Memory**: Scale based on concurrent cache operations
- **Monitoring**: Comprehensive metrics collection

## Pre-Deployment Setup

### 1. Redis Installation and Configuration

#### Redis Server Installation (Ubuntu/Debian)

```bash
# Update package repository
sudo apt update

# Install Redis
sudo apt install redis-server

# Verify installation
redis-server --version

# Expected: Redis server v=6.2.0 or higher
```

#### Redis Configuration File

Create or update `/etc/redis/redis.conf`:

```bash
# Basic Configuration
bind 127.0.0.1 192.168.1.100    # Bind to specific interfaces
port 6379
daemonize yes
supervised systemd

# Security Configuration
requirepass your_secure_password_here
rename-command FLUSHDB ""         # Disable dangerous commands
rename-command FLUSHALL ""
rename-command CONFIG ""

# Memory Configuration
maxmemory 4gb
maxmemory-policy allkeys-lru     # Evict least recently used keys

# Persistence Configuration (optional for cache)
save ""                          # Disable RDB snapshots for pure cache
appendonly no                    # Disable AOF for pure cache

# Performance Configuration
tcp-keepalive 60
tcp-nodelay yes
timeout 300

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Slow Query Log
slowlog-log-slower-than 10000    # Log queries slower than 10ms
slowlog-max-len 128
```

#### Redis Cluster Setup (Production)

For high availability and scalability:

```bash
# Create cluster configuration files
mkdir -p /etc/redis/cluster

# Node 1 configuration (7000.conf)
cat > /etc/redis/cluster/7000.conf << EOF
port 7000
cluster-enabled yes
cluster-config-file nodes-7000.conf
cluster-node-timeout 5000
appendonly yes
appendfilename "appendonly-7000.aof"
dbfilename "dump-7000.rdb"
dir "/var/lib/redis/cluster/7000"
EOF

# Repeat for nodes 7001, 7002, 7003, 7004, 7005

# Start cluster nodes
redis-server /etc/redis/cluster/7000.conf
redis-server /etc/redis/cluster/7001.conf
redis-server /etc/redis/cluster/7002.conf

# Create cluster
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

### 2. Application Configuration

#### Environment Variables

Add to your `.env` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password_here
REDIS_DB=0

# Cluster Configuration (if using Redis cluster)
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=redis-1:7000,redis-2:7001,redis-3:7002

# Cache Configuration
API_KEY_CACHE_ENABLED=true
API_KEY_CACHE_DEFAULT_TTL=300
API_KEY_CACHE_MAX_MEMORY=512mb

# Monitoring
CACHE_METRICS_ENABLED=true
CACHE_HEALTH_CHECK_INTERVAL=30
```

#### Docker Configuration

`docker-compose.yml` for development:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: aegisx-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --save ""
      --appendonly no
    volumes:
      - redis_data:/data
      - ./config/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - aegisx-network

  redis-sentinel:
    image: redis:7-alpine
    container_name: aegisx-redis-sentinel
    restart: unless-stopped
    ports:
      - '26379:26379'
    command: >
      redis-sentinel /usr/local/etc/redis/sentinel.conf
    volumes:
      - ./config/sentinel.conf:/usr/local/etc/redis/sentinel.conf:ro
    depends_on:
      - redis
    networks:
      - aegisx-network

volumes:
  redis_data:

networks:
  aegisx-network:
    driver: bridge
```

Production `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  redis-master:
    image: redis:7-alpine
    container_name: redis-master
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 4gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - redis_master_data:/data
    networks:
      - redis-network

  redis-replica-1:
    image: redis:7-alpine
    container_name: redis-replica-1
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --replicaof redis-master 6379
      --masterauth ${REDIS_PASSWORD}
    depends_on:
      - redis-master
    volumes:
      - redis_replica1_data:/data
    networks:
      - redis-network

  redis-replica-2:
    image: redis:7-alpine
    container_name: redis-replica-2
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --replicaof redis-master 6379
      --masterauth ${REDIS_PASSWORD}
    depends_on:
      - redis-master
    volumes:
      - redis_replica2_data:/data
    networks:
      - redis-network

volumes:
  redis_master_data:
  redis_replica1_data:
  redis_replica2_data:

networks:
  redis-network:
    driver: bridge
```

## Production Deployment Steps

### Step 1: Infrastructure Preparation

#### Server Setup

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install required packages
sudo apt install -y \
  curl \
  wget \
  unzip \
  htop \
  iotop \
  redis-tools \
  prometheus-node-exporter

# 3. Configure system limits
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
echo "redis soft nofile 65535" >> /etc/security/limits.conf
echo "redis hard nofile 65535" >> /etc/security/limits.conf

# 4. Configure kernel parameters
echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
echo "net.core.somaxconn = 511" >> /etc/sysctl.conf
sysctl -p

# 5. Disable Transparent Huge Pages (THP)
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo "echo never > /sys/kernel/mm/transparent_hugepage/enabled" >> /etc/rc.local
```

#### Network Configuration

```bash
# Configure firewall rules
sudo ufw allow 6379/tcp  # Redis
sudo ufw allow 26379/tcp # Sentinel
sudo ufw allow 3333/tcp  # Application

# For cluster setup
sudo ufw allow 7000:7005/tcp  # Redis cluster ports
sudo ufw allow 17000:17005/tcp # Redis cluster bus ports
```

### Step 2: Redis Deployment

#### Single Instance Deployment

```bash
# 1. Create Redis user and directories
sudo useradd --system --home /var/lib/redis --shell /bin/false redis
sudo mkdir -p /var/lib/redis /var/log/redis /etc/redis
sudo chown redis:redis /var/lib/redis /var/log/redis

# 2. Deploy configuration
sudo cp redis.conf /etc/redis/redis.conf
sudo chown redis:redis /etc/redis/redis.conf
sudo chmod 640 /etc/redis/redis.conf

# 3. Create systemd service
sudo cp redis.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable redis
sudo systemctl start redis

# 4. Verify deployment
sudo systemctl status redis
redis-cli ping
```

#### High Availability Deployment

```bash
# Deploy Redis Sentinel configuration
cat > /etc/redis/sentinel.conf << EOF
port 26379
sentinel announce-ip 192.168.1.100
sentinel announce-port 26379

sentinel monitor mymaster 192.168.1.100 6379 2
sentinel auth-pass mymaster your_secure_password_here
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 10000

sentinel deny-scripts-reconfig yes
logfile /var/log/redis/sentinel.log
EOF

# Start Sentinel
sudo systemctl enable redis-sentinel
sudo systemctl start redis-sentinel
```

### Step 3: Application Deployment

#### Cache Service Integration

Update your application's service registration:

```typescript
// src/plugins/cache.plugin.ts
import fp from 'fastify-plugin';
import { ApiKeyCacheService } from '../modules/apiKeys/services/apiKeys-cache.service';

export default fp(async function (fastify: FastifyInstance) {
  // Initialize cache service
  const cacheService = new ApiKeyCacheService(fastify);

  // Register as a decorator
  fastify.decorate('apiKeyCache', cacheService);

  // Health check hook
  fastify.addHook('onReady', async () => {
    const health = await cacheService.getCacheHealth();
    fastify.log.info('Cache service initialized', health);
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    fastify.log.info('Cache service shutting down');
  });
});
```

#### Configuration Validation

```bash
# Create deployment validation script
cat > scripts/validate-deployment.sh << 'EOF'
#!/bin/bash

echo "Validating API Key Cache Deployment..."

# Test Redis connection
echo "Testing Redis connection..."
redis-cli ping || exit 1

# Test cache operations
echo "Testing cache operations..."
redis-cli set test_key "test_value" EX 60
redis-cli get test_key || exit 1
redis-cli del test_key

# Test application cache service
echo "Testing application cache service..."
curl -f http://localhost:3333/health/cache || exit 1

# Test performance
echo "Testing cache performance..."
redis-cli eval "
  for i=1,1000 do
    redis.call('set', 'perf_test_'..i, 'value_'..i, 'EX', 300)
  end
  return 'OK'
" 0

echo "Deployment validation completed successfully!"
EOF

chmod +x scripts/validate-deployment.sh
```

## Security Hardening

### 1. Redis Security Configuration

#### Authentication and Authorization

```bash
# Generate secure password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "Redis Password: $REDIS_PASSWORD"

# Update Redis configuration
sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf

# Disable dangerous commands
cat >> /etc/redis/redis.conf << EOF
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG ""
rename-command SHUTDOWN REDIS_SHUTDOWN_$(openssl rand -hex 8)
rename-command DEBUG ""
rename-command EVAL ""
rename-command SCRIPT ""
EOF
```

#### Network Security

```bash
# Bind to specific interfaces only
sed -i 's/bind 127.0.0.1/bind 127.0.0.1 192.168.1.100/' /etc/redis/redis.conf

# Enable TLS (Redis 6.0+)
cat >> /etc/redis/redis.conf << EOF
tls-port 6380
port 0
tls-cert-file /etc/redis/tls/redis.crt
tls-key-file /etc/redis/tls/redis.key
tls-ca-cert-file /etc/redis/tls/ca.crt
tls-dh-params-file /etc/redis/tls/redis.dh
EOF
```

### 2. Application Security

#### Secure Connection Configuration

```typescript
// src/config/redis.config.ts
import { RedisOptions } from 'ioredis';

export const getRedisConfig = (): RedisOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  const baseConfig: RedisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),

    // Connection pool settings
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,

    // Timeouts
    connectTimeout: 10000,
    commandTimeout: 5000,
    lazyConnect: true,
  };

  if (isProduction) {
    return {
      ...baseConfig,
      // TLS configuration for production
      tls: {
        cert: process.env.REDIS_TLS_CERT,
        key: process.env.REDIS_TLS_KEY,
        ca: process.env.REDIS_TLS_CA,
        rejectUnauthorized: true,
      },

      // Enhanced security
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'cache:apikeys:',
    };
  }

  return baseConfig;
};
```

#### Secrets Management

```bash
# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name "aegisx/redis/password" \
  --description "Redis password for AegisX API key cache" \
  --secret-string "$REDIS_PASSWORD"

# Using HashiCorp Vault
vault kv put secret/aegisx/redis \
  password="$REDIS_PASSWORD" \
  host="redis.internal.company.com"

# Using Kubernetes secrets
kubectl create secret generic redis-credentials \
  --from-literal=password="$REDIS_PASSWORD" \
  --from-literal=host="redis-service"
```

## Monitoring and Observability

### 1. Redis Monitoring Setup

#### Prometheus Configuration

```yaml
# prometheus/redis-exporter.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 15s
    metrics_path: /metrics

  - job_name: 'redis-instances'
    static_configs:
      - targets: ['localhost:6379']
    metrics_path: /metrics
    params:
      target: ['redis://localhost:6379']
```

#### Redis Exporter Setup

```bash
# Install Redis exporter
wget https://github.com/oliver006/redis_exporter/releases/download/v1.45.0/redis_exporter-v1.45.0.linux-amd64.tar.gz
tar xzf redis_exporter-v1.45.0.linux-amd64.tar.gz
sudo cp redis_exporter-v1.45.0.linux-amd64/redis_exporter /usr/local/bin/

# Create systemd service
cat > /etc/systemd/system/redis-exporter.service << EOF
[Unit]
Description=Redis Exporter
After=network.target

[Service]
Type=simple
User=redis
Environment=REDIS_ADDR=redis://localhost:6379
Environment=REDIS_PASSWORD=${REDIS_PASSWORD}
ExecStart=/usr/local/bin/redis_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable redis-exporter
sudo systemctl start redis-exporter
```

### 2. Application Monitoring

#### Custom Metrics Implementation

```typescript
// src/monitoring/cache-metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class CacheMetrics {
  private cacheHits = new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type', 'key_type'],
  });

  private cacheMisses = new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type', 'key_type'],
  });

  private cacheOperationDuration = new Histogram({
    name: 'cache_operation_duration_seconds',
    help: 'Duration of cache operations',
    labelNames: ['operation', 'cache_type'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  });

  private cacheSize = new Gauge({
    name: 'cache_size_entries',
    help: 'Number of entries in cache',
    labelNames: ['cache_type'],
  });

  recordHit(cacheType: string, keyType: string): void {
    this.cacheHits.labels(cacheType, keyType).inc();
  }

  recordMiss(cacheType: string, keyType: string): void {
    this.cacheMisses.labels(cacheType, keyType).inc();
  }

  recordOperation(operation: string, cacheType: string, duration: number): void {
    this.cacheOperationDuration.labels(operation, cacheType).observe(duration);
  }

  updateCacheSize(cacheType: string, size: number): void {
    this.cacheSize.labels(cacheType).set(size);
  }
}
```

#### Health Check Endpoint

```typescript
// src/routes/health.ts
export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health/cache', async (request, reply) => {
    try {
      const cacheService = fastify.apiKeyCache;
      const health = await cacheService.getCacheHealth();

      const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: {
          connected: true,
          hitRate: health.stats.hitRate,
          totalEntries: health.validationCacheSize + health.scopeCacheSize + health.userListCacheSize + health.usageCacheSize,
          breakdown: {
            validation: health.validationCacheSize,
            scope: health.scopeCacheSize,
            userList: health.userListCacheSize,
            usage: health.usageCacheSize,
          },
        },
      };

      // Determine health status
      if (health.stats.hitRate < 0.8) {
        status.status = 'degraded';
      }

      const httpStatus = status.status === 'healthy' ? 200 : 503;
      return reply.status(httpStatus).send(status);
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });
}
```

### 3. Grafana Dashboard

```json
{
  "dashboard": {
    "title": "API Key Cache Monitoring",
    "panels": [
      {
        "title": "Cache Hit Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))",
            "legendFormat": "Hit Rate"
          }
        ]
      },
      {
        "title": "Cache Operations/sec",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cache_hits_total[1m])",
            "legendFormat": "Hits/sec"
          },
          {
            "expr": "rate(cache_misses_total[1m])",
            "legendFormat": "Misses/sec"
          }
        ]
      },
      {
        "title": "Cache Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(cache_operation_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(cache_operation_duration_seconds_bucket[5m]))",
            "legendFormat": "Median"
          }
        ]
      }
    ]
  }
}
```

## Performance Optimization

### 1. Redis Optimization

#### Memory Configuration

```bash
# Optimize Redis memory usage
cat >> /etc/redis/redis.conf << EOF
# Memory optimization
maxmemory-policy allkeys-lru
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64

# CPU optimization
hz 10
dynamic-hz yes

# Network optimization
tcp-keepalive 300
tcp-nodelay yes
EOF
```

#### Kernel Optimization

```bash
# Create Redis optimization script
cat > /etc/sysctl.d/redis.conf << EOF
# Memory management
vm.overcommit_memory = 1
vm.swappiness = 1

# Network optimization
net.core.somaxconn = 511
net.ipv4.tcp_max_syn_backlog = 511
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
EOF

sysctl -p /etc/sysctl.d/redis.conf
```

### 2. Application Optimization

#### Connection Pool Tuning

```typescript
// src/config/redis-pool.config.ts
export const getRedisPoolConfig = () => {
  const poolSize = parseInt(process.env.REDIS_POOL_SIZE || '20');

  return {
    // Connection pool settings
    maxConnections: poolSize,
    minConnections: Math.floor(poolSize * 0.1),
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,

    // Redis-specific optimizations
    redisOptions: {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: true,
    },
  };
};
```

#### Cache Warming Strategy

```typescript
// src/services/cache-warming.service.ts
export class CacheWarmingService {
  constructor(
    private cacheService: ApiKeyCacheService,
    private analytics: AnalyticsService,
  ) {}

  async warmCacheOnStartup(): Promise<void> {
    console.log('Starting cache warming process...');

    try {
      // 1. Get frequently used API keys from analytics
      const frequentKeys = await this.analytics.getFrequentlyUsedKeys(500);

      // 2. Warm validation cache
      await this.warmValidationCache(frequentKeys);

      // 3. Warm scope cache for common permissions
      await this.warmScopeCache(frequentKeys);

      // 4. Warm user lists for active users
      await this.warmUserListCache();

      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  private async warmValidationCache(keys: FrequentKey[]): Promise<void> {
    const chunks = this.chunkArray(keys, 50);

    for (const chunk of chunks) {
      await Promise.all(chunk.map((key) => this.cacheService.setCachedValidation(key.prefix, key.data)));

      // Small delay to prevent overwhelming Redis
      await this.delay(100);
    }
  }
}
```

## Backup and Recovery

### 1. Redis Backup Strategy

#### Automated Backup Script

```bash
#!/bin/bash
# backup-redis.sh

BACKUP_DIR="/var/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="${REDIS_PASSWORD}"

mkdir -p "$BACKUP_DIR"

# Create RDB backup
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --rdb "$BACKUP_DIR/dump_$DATE.rdb"

# Compress backup
gzip "$BACKUP_DIR/dump_$DATE.rdb"

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
  aws s3 cp "$BACKUP_DIR/dump_$DATE.rdb.gz" "s3://aegisx-backups/redis/"
fi

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -name "dump_*.rdb.gz" -mtime +7 -delete

echo "Redis backup completed: dump_$DATE.rdb.gz"
```

#### Backup Scheduling

```bash
# Add to crontab
crontab -e

# Add backup jobs
0 2 * * * /usr/local/bin/backup-redis.sh  # Daily at 2 AM
0 */6 * * * /usr/local/bin/backup-redis.sh  # Every 6 hours
```

### 2. Disaster Recovery Procedures

#### Cache Reconstruction Script

```bash
#!/bin/bash
# restore-cache.sh

echo "Starting cache restoration process..."

# 1. Stop application traffic to cache
echo "Stopping application..."
sudo systemctl stop aegisx-api

# 2. Clear corrupted cache
echo "Clearing cache..."
redis-cli FLUSHALL

# 3. Restore from backup if available
if [ -f "/var/backups/redis/latest.rdb" ]; then
  echo "Restoring from backup..."
  sudo systemctl stop redis
  cp /var/backups/redis/latest.rdb /var/lib/redis/dump.rdb
  sudo chown redis:redis /var/lib/redis/dump.rdb
  sudo systemctl start redis
fi

# 4. Warm cache with critical data
echo "Warming cache..."
curl -X POST http://localhost:3333/admin/cache/warm

# 5. Restart application
echo "Starting application..."
sudo systemctl start aegisx-api

echo "Cache restoration completed"
```

## Troubleshooting

### Common Issues and Solutions

#### 1. High Memory Usage

**Symptoms:**

- Redis memory usage approaching limit
- Cache evictions occurring frequently
- Application performance degrading

**Diagnosis:**

```bash
# Check Redis memory usage
redis-cli INFO memory

# Check largest keys
redis-cli --bigkeys

# Monitor memory usage over time
redis-cli INFO memory | grep used_memory_human
```

**Solutions:**

```bash
# Adjust maxmemory settings
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Clear specific cache types if needed
redis-cli --scan --pattern "cache:apikeys:usage:*" | xargs redis-cli DEL
```

#### 2. Poor Cache Hit Rate

**Symptoms:**

- Cache hit rate below 80%
- Slow API response times
- High database load

**Diagnosis:**

```bash
# Check cache statistics
curl http://localhost:3333/health/cache

# Monitor cache operations
redis-cli MONITOR
```

**Solutions:**

- Review TTL configurations
- Implement cache warming for frequently used keys
- Analyze application cache usage patterns

#### 3. Connection Issues

**Symptoms:**

- Connection timeouts
- Redis unavailable errors
- Intermittent cache failures

**Diagnosis:**

```bash
# Test Redis connectivity
redis-cli ping

# Check connection limits
redis-cli INFO clients

# Monitor connection usage
netstat -an | grep :6379
```

**Solutions:**

- Increase connection pool size
- Check network connectivity
- Review firewall rules

### Emergency Procedures

#### Complete Cache Reset

```bash
#!/bin/bash
# emergency-cache-reset.sh

echo "EMERGENCY: Resetting cache system..."

# 1. Stop cache-dependent services
sudo systemctl stop aegisx-api

# 2. Backup current state (if possible)
redis-cli --rdb /tmp/emergency_backup.rdb

# 3. Clear all cache data
redis-cli FLUSHALL

# 4. Restart Redis (if needed)
sudo systemctl restart redis

# 5. Restart application with cache warming
sudo systemctl start aegisx-api

# 6. Trigger cache warming
sleep 30
curl -X POST http://localhost:3333/admin/cache/warm

echo "Emergency cache reset completed"
```

#### Failover to Database-Only Mode

```typescript
// Emergency configuration override
export const EMERGENCY_CONFIG = {
  CACHE_ENABLED: false,
  FORCE_DATABASE_FALLBACK: true,
  SKIP_CACHE_OPERATIONS: true,
};

// Apply in service initialization
if (process.env.EMERGENCY_MODE === 'true') {
  Object.assign(process.env, EMERGENCY_CONFIG);
}
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks

```bash
# Check cache performance metrics
curl -s http://localhost:3333/health/cache | jq '.cache.hitRate'

# Analyze memory usage trends
redis-cli INFO memory | grep -E "(used_memory|maxmemory)"

# Review slow query log
redis-cli SLOWLOG GET 10

# Backup cache configuration
cp /etc/redis/redis.conf "/var/backups/redis-config-$(date +%Y%m%d).conf"
```

#### Monthly Tasks

```bash
# Comprehensive performance review
redis-cli --latency-history -i 1

# Memory fragmentation analysis
redis-cli INFO memory | grep mem_fragmentation_ratio

# Connection analysis
redis-cli INFO clients

# Cache hit rate analysis by type
# (requires custom monitoring scripts)
```

### Capacity Planning

#### Growth Projection Script

```bash
#!/bin/bash
# capacity-planning.sh

echo "Cache Capacity Planning Report"
echo "=============================="

# Current usage
CURRENT_MEMORY=$(redis-cli INFO memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
CURRENT_KEYS=$(redis-cli DBSIZE)

echo "Current Memory Usage: $CURRENT_MEMORY"
echo "Current Key Count: $CURRENT_KEYS"

# Growth projection (simplified)
MONTHLY_GROWTH_RATE=0.15  # 15% per month
MONTHS_TO_PROJECT=12

for i in $(seq 1 $MONTHS_TO_PROJECT); do
  PROJECTED_KEYS=$(echo "$CURRENT_KEYS * (1 + $MONTHLY_GROWTH_RATE)^$i" | bc -l)
  echo "Month $i projected keys: $(printf "%.0f" $PROJECTED_KEYS)"
done

echo ""
echo "Recommendations:"
echo "- Monitor memory usage weekly"
echo "- Plan for 2x current capacity within 6 months"
echo "- Consider Redis cluster when exceeding 4GB memory"
```

## Related Documentation

- **[Architecture Guide](./ARCHITECTURE.md)**: System design and scalability considerations
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)**: Detailed issue resolution procedures
- **[API Reference](./API_REFERENCE.md)**: Complete method documentation
- **[Developer Guide](./DEVELOPER_GUIDE.md)**: Implementation details and examples
- **[User Guide](./USER_GUIDE.md)**: End-user perspective and usage patterns
