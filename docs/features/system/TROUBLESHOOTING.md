# System - Troubleshooting

> **Common issues, debugging techniques, and solutions for System module problems**

**Last Updated:** 2025-10-31
**Version:** 1.0.0

---

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Health Check Issues](#health-check-issues)
- [Database Connection Problems](#database-connection-problems)
- [Redis Connection Problems](#redis-connection-problems)
- [Memory Issues](#memory-issues)
- [Performance Problems](#performance-problems)
- [Load Balancer Integration Issues](#load-balancer-integration-issues)
- [Kubernetes Probe Failures](#kubernetes-probe-failures)
- [Debugging Techniques](#debugging-techniques)
- [Getting Help](#getting-help)

---

## Quick Diagnostics

### First Steps When Something Goes Wrong

```bash
# 1. Check if API is running
curl http://localhost:3333/api/ping

# 2. Check simple health
curl http://localhost:3333/api/health

# 3. Check detailed status
curl http://localhost:3333/api/status | jq .

# 4. Check API logs
docker logs aegisx-api  # Docker
kubectl logs -l app=aegisx-api -n aegisx  # Kubernetes
```

### Interpreting Status Responses

| Response | Meaning | Next Step |
|----------|---------|-----------|
| **Connection refused** | API not running | Check process/container is running |
| **Timeout** | API unresponsive | Check CPU/memory, database connectivity |
| **status: "error"** | Critical failure | Check database connection |
| **status: "degraded"** | Partial issues | Check Redis, memory, database performance |
| **status: "healthy"** | All good | False alarm or intermittent issue |

---

## Health Check Issues

### Problem: `/api/health` Returns "error"

**Symptoms:**
```json
{
  "success": true,
  "data": {
    "status": "error",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

**Causes:**
1. Database is disconnected or unreachable
2. Memory usage >90%
3. Redis is down (if required)

**Diagnosis:**
```bash
# Get detailed status
curl -s http://localhost:3333/api/status | jq .

# Check database status specifically
curl -s http://localhost:3333/api/status | jq '.data.services.database'
# Output: {"status": "error"} or {"status": "disconnected"}

# Check memory
curl -s http://localhost:3333/api/status | jq '.data.memory.percentage'
# Output: 95 (meaning 95% used)
```

**Solutions:**

**If database is down:**
```bash
# Docker
docker ps | grep postgres
docker start aegisx-postgres

# Kubernetes
kubectl get pods -n aegisx | grep postgres
kubectl logs -n aegisx postgres-0

# Check connectivity manually
psql -h localhost -p 5432 -U aegisx_user -d aegisx_production
```

**If memory is high:**
```bash
# Restart API to clear memory
docker restart aegisx-api  # Docker
kubectl rollout restart deployment/aegisx-api -n aegisx  # Kubernetes

# Investigate memory leak
# Check for growing memory in /api/status over time
```

**If Redis is down:**
```bash
# Docker
docker ps | grep redis
docker start aegisx-redis

# Kubernetes
kubectl get pods -n aegisx | grep redis
kubectl logs -n aegisx redis-0

# Test Redis manually
redis-cli -h localhost -p 6379 ping
# Expected: PONG
```

---

## Database Connection Problems

### Problem: "Database status: disconnected"

**Symptoms:**
```bash
curl -s http://localhost:3333/api/status | jq '.data.services.database'
# Output: {"status": "disconnected"}
```

**Common Causes:**

#### 1. Wrong Database Credentials

**Check:**
```bash
# View environment variables
docker exec aegisx-api env | grep DB_
# Or in Kubernetes:
kubectl exec -n aegisx aegisx-api-xxx -- env | grep DB_
```

**Fix:**
```bash
# Update environment variables
# Docker: Edit docker-compose.yml or .env file
# Kubernetes: Update ConfigMap/Secret

kubectl edit configmap api-config -n aegisx
kubectl edit secret api-secrets -n aegisx

# Restart after changes
kubectl rollout restart deployment/aegisx-api -n aegisx
```

#### 2. Network Issues

**Check:**
```bash
# Can API reach database?
docker exec aegisx-api ping postgres
docker exec aegisx-api nc -zv postgres 5432

# Kubernetes
kubectl exec -n aegisx aegisx-api-xxx -- nc -zv postgres-service 5432
```

**Fix:**
- Ensure database service is in same network (Docker)
- Check Kubernetes NetworkPolicies
- Verify firewall rules

#### 3. Database Not Running

**Check:**
```bash
# Docker
docker ps | grep postgres
docker logs aegisx-postgres

# Kubernetes
kubectl get pods -n aegisx | grep postgres
kubectl logs -n aegisx postgres-0
```

**Fix:**
```bash
# Start database
docker start aegisx-postgres  # Docker
kubectl get statefulset -n aegisx  # Kubernetes - check StatefulSet

# Check if database data is corrupted
docker exec -it aegisx-postgres psql -U aegisx_user -d aegisx_production -c "SELECT 1;"
```

#### 4. Too Many Connections

**Symptoms:**
```
FATAL: remaining connection slots are reserved for non-replication superuser connections
```

**Check:**
```sql
-- Connect to PostgreSQL
psql -h localhost -U postgres -d aegisx_production

-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Check max connections
SHOW max_connections;

-- See active connections
SELECT pid, usename, application_name, client_addr, state
FROM pg_stat_activity;
```

**Fix:**
```bash
# Reduce connection pool size
# Edit environment variables:
DB_POOL_MIN=2
DB_POOL_MAX=5

# Or increase PostgreSQL max_connections
# Edit postgresql.conf:
max_connections = 200

# Restart PostgreSQL
docker restart aegisx-postgres
```

---

## Redis Connection Problems

### Problem: "Redis status: error"

**Symptoms:**
```bash
curl -s http://localhost:3333/api/status | jq '.data.services.redis'
# Output: {"status": "error"} or field is missing
```

**Common Causes:**

#### 1. Redis Not Running

**Check:**
```bash
# Docker
docker ps | grep redis

# Kubernetes
kubectl get pods -n aegisx | grep redis
```

**Fix:**
```bash
# Start Redis
docker start aegisx-redis  # Docker
kubectl scale statefulset/redis --replicas=1 -n aegisx  # Kubernetes
```

#### 2. Wrong Redis Password

**Check:**
```bash
# Test Redis connection manually
docker exec -it aegisx-redis redis-cli
AUTH your-password
PING
# Expected: PONG
```

**Fix:**
Update `REDIS_PASSWORD` environment variable to match Redis configuration.

#### 3. Redis is Optional

**Note:** If Redis is not required, the API should gracefully handle its absence:

```bash
# Redis field should be absent from response if not configured
curl -s http://localhost:3333/api/status | jq '.data.services.redis'
# Output: null (this is OK if Redis is not needed)
```

If API fails when Redis is down but shouldn't, check that `REDIS_HOST` is not set when Redis is optional.

---

## Memory Issues

### Problem: Memory Usage >90%

**Symptoms:**
```bash
curl -s http://localhost:3333/api/status | jq '.data.memory.percentage'
# Output: 95
```

**Causes:**
1. Memory leak in application code
2. Too many requests/connections
3. Insufficient container memory limits

**Immediate Fix:**
```bash
# Restart API to clear memory
docker restart aegisx-api  # Docker
kubectl rollout restart deployment/aegisx-api -n aegisx  # Kubernetes
```

**Long-term Diagnosis:**

**Monitor memory over time:**
```bash
# Watch memory usage
watch -n 5 'curl -s http://localhost:3333/api/status | jq ".data.memory"'

# Check if memory grows continuously
# Growing memory = potential leak
# Stable high memory = need more resources
```

**Check container limits:**
```bash
# Docker
docker stats aegisx-api

# Kubernetes
kubectl top pods -n aegisx
kubectl describe pod aegisx-api-xxx -n aegisx | grep -A 5 "Limits:"
```

**Solutions:**

1. **Increase memory limits:**
```yaml
# Kubernetes
resources:
  limits:
    memory: "2Gi"  # Increase from 1Gi
```

2. **Investigate memory leak:**
```bash
# Enable Node.js heap snapshots
# Add to API startup:
NODE_OPTIONS="--max-old-space-size=1024 --heapsnapshot-signal=SIGUSR2"

# Take heap snapshot when memory is high
docker kill --signal=SIGUSR2 aegisx-api
# Analyze heap snapshot with Chrome DevTools
```

---

## Performance Problems

### Problem: Slow Health Check Response Times

**Symptoms:**
```bash
# Health check takes >1 second
time curl http://localhost:3333/api/health
# Output: real 0m1.523s
```

**Causes:**
1. Slow database queries
2. Network latency to database
3. High CPU usage
4. Too many concurrent requests

**Diagnosis:**

**Check database response time:**
```bash
curl -s http://localhost:3333/api/status | jq '.data.services.database.responseTime'
# Output: 1500 (ms) - This is TOO SLOW
```

**Check system load:**
```bash
# Docker
docker stats aegisx-api

# Kubernetes
kubectl top pods -n aegisx
```

**Solutions:**

**If database is slow:**
```bash
# Check database queries
psql -h localhost -U aegisx_user -d aegisx_production

-- Check slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '1 second';

-- Check database connections
SELECT count(*) FROM pg_stat_activity;
```

**If network latency is high:**
```bash
# Test latency to database
docker exec aegisx-api ping -c 5 postgres

# Ensure API and database are in same region/datacenter
```

**If CPU is maxed out:**
```bash
# Scale horizontally (add more instances)
# Kubernetes
kubectl scale deployment/aegisx-api --replicas=5 -n aegisx

# Docker Swarm
docker service scale aegisx-api=5
```

---

## Load Balancer Integration Issues

### Problem: Load Balancer Marks Backend as Unhealthy

**Symptoms:**
- Load balancer removes API instance from pool
- Logs show repeated health check failures

**Diagnosis:**

**Check health check configuration:**
```nginx
# Nginx example
check interval=5000 rise=2 fall=3 timeout=3000 type=http;
check_http_send "GET /api/health HTTP/1.0\r\n\r\n";
check_http_expect_alive http_2xx;
```

**Common Misconfigurations:**

1. **Timeout too short:**
```nginx
# Bad: timeout=1000 (1 second)
timeout=5000;  # Good: 5 seconds
```

2. **Wrong endpoint:**
```nginx
# Bad: check_http_send "GET /health HTTP/1.0\r\n\r\n"
check_http_send "GET /api/health HTTP/1.0\r\n\r\n";  # Correct path
```

3. **Expecting wrong response:**
```nginx
# Bad: check_http_expect_alive http_2xx http_3xx
check_http_expect_alive http_2xx;  # Only expect 200-299
```

**Test health check manually from load balancer:**
```bash
# SSH to load balancer
ssh loadbalancer.example.com

# Test health check
curl -v http://api1.internal:3333/api/health
# Should return 200 OK with {"success":true,"data":{"status":"ok",...}}
```

---

## Kubernetes Probe Failures

### Problem: Pods Restarting Due to Liveness Probe Failures

**Symptoms:**
```bash
kubectl get pods -n aegisx
# Output shows pod with many restarts
NAME                          READY   STATUS    RESTARTS   AGE
aegisx-api-6b8f7d5c9-abc123   1/1     Running   15         2h
```

**Diagnosis:**
```bash
# Check probe configuration
kubectl describe pod aegisx-api-xxx -n aegisx | grep -A 10 "Liveness:"

# Check recent events
kubectl get events -n aegisx --sort-by='.lastTimestamp' | grep aegisx-api
```

**Common Issues:**

**1. initialDelaySeconds too short:**
```yaml
# Bad: API takes 60s to start, but probe starts at 10s
livenessProbe:
  initialDelaySeconds: 10

# Good: Allow enough time for startup
livenessProbe:
  initialDelaySeconds: 60
```

**2. failureThreshold too low:**
```yaml
# Bad: Restart after 1 failure
livenessProbe:
  failureThreshold: 1

# Good: Allow transient failures
livenessProbe:
  failureThreshold: 3
```

**3. Database temporarily unavailable:**
- Liveness probe checks database
- Database briefly unavailable
- Pod restarts unnecessarily

**Solution:** Use startup probe for initial delays:
```yaml
# Startup probe allows longer initial delay
startupProbe:
  httpGet:
    path: /api/health
    port: 3333
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30  # 30 * 5s = 150s max startup time

# Liveness probe only activates after startup succeeds
livenessProbe:
  httpGet:
    path: /api/health
    port: 3333
  initialDelaySeconds: 0  # Startup probe handles initial delay
  periodSeconds: 10
  failureThreshold: 3
```

---

## Debugging Techniques

### Enable Debug Logging

**Temporarily enable debug logging:**
```bash
# Docker
docker exec -it aegisx-api /bin/sh
export LOG_LEVEL=debug
# Restart API

# Kubernetes
kubectl set env deployment/aegisx-api LOG_LEVEL=debug -n aegisx
```

### Check Application Logs

```bash
# Docker
docker logs -f aegisx-api

# Kubernetes
kubectl logs -f -n aegisx -l app=aegisx-api

# Search for errors
docker logs aegisx-api 2>&1 | grep -i error
kubectl logs -n aegisx -l app=aegisx-api | grep -i error
```

### Test Database Connection Manually

```bash
# Inside API container
docker exec -it aegisx-api /bin/sh

# Install psql if not available
apk add postgresql-client

# Test connection
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
# Enter password when prompted

# Run simple query
SELECT 1;
```

### Test Redis Connection Manually

```bash
# Inside API container
docker exec -it aegisx-api /bin/sh

# Install redis-cli if not available
apk add redis

# Test connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT
AUTH $REDIS_PASSWORD
PING
# Expected: PONG
```

### Monitor Health Check in Real-Time

```bash
# Watch health status
watch -n 1 'curl -s http://localhost:3333/api/health | jq .'

# Watch detailed status
watch -n 5 'curl -s http://localhost:3333/api/status | jq .'

# Monitor specific metric
watch -n 1 'curl -s http://localhost:3333/api/status | jq ".data.services.database.responseTime"'
```

### Trace Network Issues

```bash
# Inside API container
docker exec -it aegisx-api /bin/sh

# Install network tools
apk add bind-tools netcat-openbsd

# DNS lookup
nslookup postgres

# Port connectivity
nc -zv postgres 5432

# Trace route
traceroute postgres
```

---

## Getting Help

### Information to Provide

When seeking help, provide:

1. **Health status output:**
```bash
curl -s http://localhost:3333/api/status | jq . > status.json
```

2. **Application logs:**
```bash
docker logs aegisx-api > api.log 2>&1
# Or Kubernetes:
kubectl logs -n aegisx aegisx-api-xxx > api.log
```

3. **Environment info:**
```bash
docker exec aegisx-api env > environment.txt
```

4. **Database status:**
```bash
psql -h localhost -U aegisx_user -d aegisx_production -c "\conninfo" > db-info.txt
```

### Support Channels

- **Documentation:** [System Module README](./README.md)
- **API Reference:** [Complete API documentation](./API_REFERENCE.md)
- **Developer Guide:** [Technical details](./DEVELOPER_GUIDE.md)
- **Architecture:** [System design](./ARCHITECTURE.md)

---

**Last Updated:** 2025-10-31
**Version:** 1.0.0
