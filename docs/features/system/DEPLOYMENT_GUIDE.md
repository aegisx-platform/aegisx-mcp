# System - Deployment Guide

> **Production deployment and monitoring setup for System module**

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Target Audience:** DevOps Engineers, SREs, Platform Engineers

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Load Balancer Setup](#load-balancer-setup)
- [Monitoring Configuration](#monitoring-configuration)
- [Alerting Setup](#alerting-setup)
- [Production Checklist](#production-checklist)
- [Security Considerations](#security-considerations)

---

## Overview

The System module is part of the AegisX Platform API and provides infrastructure endpoints for health monitoring and API information. This guide covers production deployment best practices.

### Module Characteristics

- **Backend-only** - No frontend components to deploy
- **No database tables** - Uses existing connections for checks only
- **Public endpoints** - Load balancers need unauthenticated access
- **Lightweight** - Minimal resource requirements
- **Stateless** - Can scale horizontally without coordination

---

## Prerequisites

### Infrastructure Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **Node.js** | 18.x or higher | LTS version recommended |
| **PostgreSQL** | 15.x or higher | For health checks |
| **Redis** | 6.x or higher | Optional, for cache health checks |
| **Memory** | Minimum 512MB | Per instance |
| **CPU** | 1 core minimum | 2+ cores recommended |
| **Network** | Low latency to DB | <10ms preferred |

### Load Balancer Requirements

- HTTP/HTTPS support
- Health check endpoint configuration
- Graceful draining support
- Timeout configuration (min 5 seconds)

---

## Environment Configuration

### Required Environment Variables

```bash
# Database (required)
DB_HOST=postgres.example.com
DB_PORT=5432
DB_NAME=aegisx_production
DB_USER=aegisx_user
DB_PASSWORD=secure_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10

# Application (required)
NODE_ENV=production
API_PORT=3333
API_HOST=0.0.0.0

# Redis (optional)
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here
REDIS_DB=0

# Optional Settings
ENABLE_API_KEY_DEMO=false  # NEVER enable in production
LOG_LEVEL=info
```

### Health Check Configuration

```bash
# Health check thresholds (optional, defaults shown)
HEALTH_CHECK_MEMORY_THRESHOLD=90  # Percentage
HEALTH_CHECK_DB_TIMEOUT=5000      # Milliseconds
HEALTH_CHECK_REDIS_TIMEOUT=2000   # Milliseconds
```

---

## Docker Deployment

### Dockerfile

The API Dockerfile already includes the System module (no changes needed):

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:api

FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3333
CMD ["node", "main.js"]
```

### Docker Compose (Single Instance)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: aegisx/api:latest
    ports:
      - "3333:3333"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: aegisx_production
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3333/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: aegisx_production
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Building and Running

```bash
# Build image
docker build -t aegisx/api:latest -f apps/api/Dockerfile .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3333/api/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f api
```

---

## Kubernetes Deployment

### Complete Deployment Configuration

```yaml
# k8s/api-deployment.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: aegisx
data:
  NODE_ENV: "production"
  API_PORT: "3333"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "aegisx_production"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"

---
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: aegisx
type: Opaque
stringData:
  DB_PASSWORD: "your-secure-password"
  REDIS_PASSWORD: "your-redis-password"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegisx-api
  namespace: aegisx
  labels:
    app: aegisx-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
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
        image: aegisx/api:1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 3333
          name: http
          protocol: TCP

        envFrom:
        - configMapRef:
            name: api-config
        - secretRef:
            name: api-secrets

        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"

        # Liveness probe
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3333
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        # Readiness probe
        readinessProbe:
          httpGet:
            path: /api/status
            port: 3333
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2

        # Startup probe
        startupProbe:
          httpGet:
            path: /api/health
            port: 3333
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30

---
apiVersion: v1
kind: Service
metadata:
  name: aegisx-api-service
  namespace: aegisx
spec:
  type: ClusterIP
  selector:
    app: aegisx-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3333

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aegisx-api-hpa
  namespace: aegisx
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aegisx-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Deploying to Kubernetes

```bash
# Create namespace
kubectl create namespace aegisx

# Apply configuration
kubectl apply -f k8s/api-deployment.yaml

# Check deployment status
kubectl get deployments -n aegisx
kubectl get pods -n aegisx

# Check health
kubectl port-forward -n aegisx svc/aegisx-api-service 3333:80
curl http://localhost:3333/api/health

# View logs
kubectl logs -n aegisx -l app=aegisx-api -f
```

### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aegisx-api-ingress
  namespace: aegisx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.example.com
    secretName: aegisx-api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: aegisx-api-service
            port:
              number: 80
```

---

## Load Balancer Setup

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/api.example.com
upstream aegisx_api {
  least_conn;
  server api1.internal:3333 max_fails=3 fail_timeout=30s;
  server api2.internal:3333 max_fails=3 fail_timeout=30s;
  server api3.internal:3333 max_fails=3 fail_timeout=30s;

  # Health check
  check interval=5000 rise=2 fall=3 timeout=3000 type=http;
  check_http_send "GET /api/health HTTP/1.0\r\n\r\n";
  check_http_expect_alive http_2xx;
}

server {
  listen 80;
  listen [::]:80;
  server_name api.example.com;

  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name api.example.com;

  # SSL configuration
  ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # Proxy settings
  location / {
    proxy_pass http://aegisx_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Health check endpoint (bypass caching)
  location /api/health {
    proxy_pass http://aegisx_api;
    proxy_cache off;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

---

## Monitoring Configuration

### Prometheus ServiceMonitor

```yaml
# k8s/servicemonitor.yaml (for future Prometheus metrics)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: aegisx-api-monitor
  namespace: aegisx
spec:
  selector:
    matchLabels:
      app: aegisx-api
  endpoints:
  - port: http
    path: /api/metrics  # Future endpoint in v1.1.0
    interval: 30s
```

### Custom Health Check Monitor Script

```bash
#!/bin/bash
# /opt/monitoring/health-check-monitor.sh

API_URL="http://localhost:3333/api/status"
METRICS_FILE="/var/lib/node_exporter/textfile_collector/api_health.prom"

# Fetch status
STATUS=$(curl -s $API_URL)

# Extract metrics
OVERALL_STATUS=$(echo $STATUS | jq -r '.data.status')
MEMORY_PCT=$(echo $STATUS | jq '.data.memory.percentage')
DB_RESPONSE_TIME=$(echo $STATUS | jq '.data.services.database.responseTime')
REDIS_RESPONSE_TIME=$(echo $STATUS | jq '.data.services.redis.responseTime // 0')

# Convert status to numeric
case $OVERALL_STATUS in
  healthy) STATUS_NUM=1 ;;
  degraded) STATUS_NUM=0.5 ;;
  unhealthy) STATUS_NUM=0 ;;
  *) STATUS_NUM=-1 ;;
esac

# Write Prometheus metrics
cat > $METRICS_FILE << EOF
# HELP api_health_status API health status (1=healthy, 0.5=degraded, 0=unhealthy)
# TYPE api_health_status gauge
api_health_status $STATUS_NUM

# HELP api_memory_usage_percent Memory usage percentage
# TYPE api_memory_usage_percent gauge
api_memory_usage_percent $MEMORY_PCT

# HELP api_database_response_ms Database response time in milliseconds
# TYPE api_database_response_ms gauge
api_database_response_ms $DB_RESPONSE_TIME

# HELP api_redis_response_ms Redis response time in milliseconds
# TYPE api_redis_response_ms gauge
api_redis_response_ms $REDIS_RESPONSE_TIME
EOF
```

**Install as cron job:**
```bash
# Add to crontab
* * * * * /opt/monitoring/health-check-monitor.sh
```

---

## Alerting Setup

### Alert Rules (Prometheus)

```yaml
# prometheus-alerts.yaml
groups:
- name: aegisx_api_alerts
  interval: 30s
  rules:

  # Critical: API is unhealthy
  - alert: APIUnhealthy
    expr: api_health_status == 0
    for: 2m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "API is UNHEALTHY"
      description: "AegisX API has been unhealthy for 2 minutes. Database may be down."

  # Warning: API is degraded
  - alert: APIDegraded
    expr: api_health_status == 0.5
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "API is DEGRADED"
      description: "AegisX API has been degraded for 5 minutes. Check memory/Redis/database performance."

  # Warning: High memory usage
  - alert: APIHighMemory
    expr: api_memory_usage_percent > 80
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "API memory usage is high"
      description: "Memory usage is {{ $value }}% for 10 minutes."

  # Warning: Slow database
  - alert: APISlowDatabase
    expr: api_database_response_ms > 500
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "Database response time is slow"
      description: "Database response time is {{ $value }}ms for 5 minutes."
```

---

## Production Checklist

### Pre-Deployment

- [ ] Environment variables configured correctly
- [ ] Database connection tested
- [ ] Redis connection tested (if used)
- [ ] SSL certificates installed
- [ ] Load balancer configured
- [ ] Health check endpoints verified
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Log aggregation configured

### Post-Deployment

- [ ] `/api/health` returns "ok"
- [ ] `/api/status` returns "healthy"
- [ ] Load balancer health checks passing
- [ ] Kubernetes probes passing (if applicable)
- [ ] Monitoring dashboards showing data
- [ ] Alert rules firing correctly (test with temporary issues)
- [ ] Logs flowing to aggregation system
- [ ] Response times within acceptable range

### Performance Validation

- [ ] `/api/health` responds in <50ms
- [ ] `/api/status` responds in <200ms
- [ ] `/api/ping` responds in <10ms
- [ ] Database checks complete in <100ms
- [ ] Redis checks complete in <50ms

---

## Security Considerations

### Public Endpoint Protection

While health endpoints are public, consider these protections:

1. **Rate Limiting** - Limit requests per IP
2. **Geographic Filtering** - Allow only from expected regions
3. **DDoS Protection** - Use CloudFlare or AWS Shield
4. **Monitoring** - Track unusual traffic patterns

### Information Disclosure

Health endpoints intentionally expose:
- ✅ API version
- ✅ Uptime
- ✅ Environment name
- ✅ Service status

They never expose:
- ❌ Database credentials
- ❌ Internal IP addresses
- ❌ User data
- ❌ Secrets

### Demo Endpoints

**CRITICAL:** Ensure demo endpoints are disabled in production:

```bash
# MUST be false or unset in production
ENABLE_API_KEY_DEMO=false
```

Test endpoints are automatically blocked when `NODE_ENV=production`.

---

**Next Steps:**
- [Monitoring Setup](./USER_GUIDE.md#integration-with-monitoring-tools)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Architecture Overview](./ARCHITECTURE.md)
