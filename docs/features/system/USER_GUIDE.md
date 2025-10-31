# System - User Guide

> **Practical guide for end users: DevOps, SREs, and API consumers**

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Target Audience:** DevOps Engineers, SREs, API Consumers, Monitoring Teams

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Checking API Health](#checking-api-health)
- [Monitoring System Status](#monitoring-system-status)
- [Integration with Monitoring Tools](#integration-with-monitoring-tools)
- [Load Balancer Configuration](#load-balancer-configuration)
- [Kubernetes Setup](#kubernetes-setup)
- [Alerting Examples](#alerting-examples)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Basic Health Check

The simplest way to check if the API is running:

```bash
curl http://localhost:3333/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "version": "1.0.0"
  },
  "message": "API is healthy"
}
```

**Interpretation:**
- `status: "ok"` → ✅ API is running and database is connected
- `status: "error"` → ❌ API has critical issues (database down)

### Detailed Status Check

For more information about system health:

```bash
curl http://localhost:3333/api/status | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "services": {
      "database": {
        "status": "connected",
        "responseTime": 15
      },
      "redis": {
        "status": "connected",
        "responseTime": 5
      }
    },
    "memory": {
      "used": 52428800,
      "total": 134217728,
      "free": 81788928,
      "percentage": 39
    }
  },
  "message": "System status retrieved successfully"
}
```

---

## Checking API Health

### Understanding Health Status

The API provides two health endpoints with different purposes:

#### `/api/health` - Simple Check (for Load Balancers)

**Purpose:** Fast binary check (ok/error)
**Use Case:** Load balancer health probes
**Response Time:** <50ms

```bash
# Quick check
curl -s http://localhost:3333/api/health | jq '.data.status'
# Output: "ok" or "error"
```

**Status Values:**
- `"ok"` → API is operational
- `"error"` → API has critical failures

#### `/api/status` - Detailed Check (for Monitoring)

**Purpose:** Comprehensive system information
**Use Case:** Monitoring dashboards, debugging
**Response Time:** <200ms

```bash
# Full status
curl -s http://localhost:3333/api/status | jq .
```

**Status Values:**
- `"healthy"` → 🟢 All systems operational
- `"degraded"` → 🟡 Operational with issues (high memory, Redis down, slow DB)
- `"unhealthy"` → 🔴 Critical failure (database disconnected)

### Health Determination Rules

| Condition | Status | Meaning |
|-----------|--------|---------|
| Database connected, memory <90%, Redis OK | **healthy** | ✅ All good |
| Memory >90% | **degraded** | ⚠️ High memory usage |
| Redis down (if configured) | **degraded** | ⚠️ Cache unavailable |
| Database >1000ms response | **degraded** | ⚠️ Database slow |
| Database disconnected/error | **unhealthy** | ❌ Critical failure |

---

## Monitoring System Status

### Monitoring Memory Usage

```bash
# Check current memory percentage
curl -s http://localhost:3333/api/status | jq '.data.memory.percentage'
# Output: 39

# Watch memory over time
watch -n 5 'curl -s http://localhost:3333/api/status | jq ".data.memory.percentage"'
```

**Alert Threshold:** >80% memory usage warrants investigation

### Monitoring Database Performance

```bash
# Check database response time
curl -s http://localhost:3333/api/status | jq '.data.services.database.responseTime'
# Output: 15 (milliseconds)

# Watch database performance
watch -n 1 'curl -s http://localhost:3333/api/status | jq ".data.services.database"'
```

**Alert Threshold:** >500ms response time warrants investigation

### Monitoring Redis Status

```bash
# Check Redis connectivity
curl -s http://localhost:3333/api/status | jq '.data.services.redis'
# Output: { "status": "connected", "responseTime": 5 }
```

**Note:** Redis is optional. If not configured, this field will be absent.

### Checking API Uptime

```bash
# Get uptime in seconds
curl -s http://localhost:3333/api/info | jq '.data.uptime'
# Output: 86400 (24 hours)

# Convert to human-readable
curl -s http://localhost:3333/api/info | jq '.data.uptime / 3600 | floor'
# Output: 24 (hours)
```

---

## Integration with Monitoring Tools

### Prometheus Metrics (Future)

**Coming in v1.1.0:** Native Prometheus metrics export

```bash
# Future endpoint
curl http://localhost:3333/api/metrics
```

**Current Workaround:** Use script to export JSON as Prometheus text format

```bash
#!/bin/bash
# prometheus-exporter.sh
STATUS=$(curl -s http://localhost:3333/api/status)

echo "# HELP api_status_healthy API health status (1=healthy, 0.5=degraded, 0=unhealthy)"
echo "# TYPE api_status_healthy gauge"
case $(echo $STATUS | jq -r '.data.status') in
  healthy) echo "api_status_healthy 1" ;;
  degraded) echo "api_status_healthy 0.5" ;;
  unhealthy) echo "api_status_healthy 0" ;;
esac

echo "# HELP api_memory_percentage Memory usage percentage"
echo "# TYPE api_memory_percentage gauge"
echo "api_memory_percentage $(echo $STATUS | jq '.data.memory.percentage')"

echo "# HELP api_db_response_time_ms Database response time in milliseconds"
echo "# TYPE api_db_response_time_ms gauge"
echo "api_db_response_time_ms $(echo $STATUS | jq '.data.services.database.responseTime')"
```

### Datadog Integration

```bash
#!/bin/bash
# datadog-check.sh
STATUS=$(curl -s http://localhost:3333/api/status)

# Send metrics to Datadog
echo "api.status:$(echo $STATUS | jq -r '.data.status')|g" | nc -u -w0 localhost 8125
echo "api.memory.percentage:$(echo $STATUS | jq '.data.memory.percentage')|g" | nc -u -w0 localhost 8125
echo "api.db.response_time:$(echo $STATUS | jq '.data.services.database.responseTime')|g" | nc -u -w0 localhost 8125
```

### Grafana Dashboard Query

```javascript
// Query for JSON API datasource
{
  "url": "http://api.example.com/api/status",
  "method": "GET",
  "headers": {},
  "jsonPath": "$.data.memory.percentage"
}
```

### New Relic Synthetic Monitor

```javascript
// New Relic Scripted Browser
$http.get("https://api.example.com/api/health", function(err, response, body) {
  assert.equal(response.statusCode, 200, "Expected 200 OK");
  var data = JSON.parse(body);
  assert.equal(data.data.status, "ok", "API should be healthy");
});
```

---

## Load Balancer Configuration

### Nginx Upstream Health Check

```nginx
# /etc/nginx/conf.d/api-upstream.conf
upstream api_backend {
  # Multiple backend servers
  server api1.example.com:3333;
  server api2.example.com:3333;
  server api3.example.com:3333;

  # Health check configuration
  check interval=5000 rise=2 fall=3 timeout=3000 type=http;
  check_http_send "GET /api/health HTTP/1.0\r\n\r\n";
  check_http_expect_alive http_2xx;
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://api_backend;
    proxy_next_upstream error timeout http_500 http_502 http_503;
  }

  # Health check status page (internal only)
  location /nginx_status {
    check_status;
    access_log off;
    allow 127.0.0.1;
    deny all;
  }
}
```

**Configuration Details:**
- `interval=5000` → Check every 5 seconds
- `rise=2` → 2 successful checks mark server as healthy
- `fall=3` → 3 failed checks mark server as unhealthy
- `timeout=3000` → 3 second timeout

### HAProxy Health Check

```haproxy
# /etc/haproxy/haproxy.cfg
backend api_backend
  mode http
  balance roundrobin

  # Health check configuration
  option httpchk GET /api/health
  http-check expect status 200
  http-check expect string "\"status\":\"ok\""

  # Backend servers
  server api1 api1.example.com:3333 check inter 5s fall 3 rise 2
  server api2 api2.example.com:3333 check inter 5s fall 3 rise 2
  server api3 api3.example.com:3333 check inter 5s fall 3 rise 2
```

### AWS Application Load Balancer

```bash
# Create target group with health check
aws elbv2 create-target-group \
  --name api-target-group \
  --protocol HTTP \
  --port 3333 \
  --vpc-id vpc-xxxxx \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --matcher HttpCode=200
```

---

## Kubernetes Setup

### Liveness and Readiness Probes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegisx-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aegisx-api
  template:
    metadata:
      labels:
        app: aegisx-api
    spec:
      containers:
      - name: api
        image: aegisx/api:latest
        ports:
        - containerPort: 3333

        # Liveness probe - restart if unhealthy
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3333
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        # Readiness probe - remove from service if not ready
        readinessProbe:
          httpGet:
            path: /api/status
            port: 3333
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2

        # Startup probe - allow longer startup time
        startupProbe:
          httpGet:
            path: /api/health
            port: 3333
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30
```

**Probe Explanation:**
- **Liveness Probe** → If fails 3 times, restart container
- **Readiness Probe** → If fails 2 times, remove from service
- **Startup Probe** → Allow up to 150 seconds for startup (30 × 5s)

### Service with Health Check

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: aegisx-api-service
spec:
  selector:
    app: aegisx-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3333
  type: LoadBalancer
  sessionAffinity: None
```

### HorizontalPodAutoscaler Based on Health

```yaml
# hpa.yaml (future with custom metrics)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aegisx-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aegisx-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: api_db_response_time_ms
      target:
        type: AverageValue
        averageValue: 500
```

---

## Alerting Examples

### Simple Bash Alert Script

```bash
#!/bin/bash
# check-and-alert.sh

API_URL="http://localhost:3333/api/status"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Get status
STATUS=$(curl -s $API_URL | jq -r '.data.status')

# Alert based on status
case $STATUS in
  unhealthy)
    MESSAGE="CRITICAL: API is UNHEALTHY! Database down?"
    curl -X POST $SLACK_WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"$MESSAGE\"}"
    ;;
  degraded)
    MESSAGE="WARNING: API is DEGRADED. Check memory/Redis."
    curl -X POST $SLACK_WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"$MESSAGE\"}"
    ;;
  healthy)
    # All good, no alert
    ;;
esac
```

**Run via cron:**
```cron
*/5 * * * * /path/to/check-and-alert.sh
```

---

## Common Use Cases

### 1. Pre-Deployment Health Check

Check API health before deploying new version to ensure system is stable.

### 2. Post-Deployment Verification

Verify that deployment succeeded and API is responding correctly.

### 3. Blue-Green Deployment Smoke Test

Test new deployment (green) before switching traffic from old deployment (blue).

### 4. Database Migration Health Check

Verify database connectivity after running migrations.

---

## Troubleshooting

### API Returns "error" Status

**Symptom:** `/api/health` returns `status: "error"`

**Diagnosis:**
```bash
# Get detailed status
curl -s http://localhost:3333/api/status | jq .
```

**Common Causes:**
1. **Database disconnected** → Check database container/service
2. **High memory (>90%)** → Check memory usage, restart if needed
3. **Redis down** → Check Redis container/service (if configured)

**Next Steps:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed debugging

### Slow Response Times

**Symptom:** Health checks take >1 second

**Diagnosis:**
```bash
# Measure response time
time curl http://localhost:3333/api/health
```

**Common Causes:**
- Database queries taking too long
- Network latency
- Server overload

### Health Check Passes But Application Fails

**Symptom:** `/api/health` returns "ok" but other endpoints fail

**Explanation:** Health check only verifies basic connectivity, not application logic

**Solution:** Implement custom health checks for critical dependencies

---

**Next Steps:**
- [API Reference](./API_REFERENCE.md) - Complete endpoint documentation
- [Troubleshooting](./TROUBLESHOOTING.md) - Detailed debugging guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup
