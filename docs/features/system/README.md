# System

> **Core infrastructure providing health checks, API information, and system monitoring endpoints**

**Status:** 🟢 Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-10-31
**Module Type:** Core Infrastructure
**Dependencies:** Database (PostgreSQL), Redis (optional)

---

## 📋 Quick Start

```bash
# Check API health (for load balancers)
curl http://localhost:3333/api/health

# Get detailed system status
curl http://localhost:3333/api/status

# Get API information
curl http://localhost:3333/api/info

# Simple ping
curl http://localhost:3333/api/ping
```

**For end users:** See [User Guide](./USER_GUIDE.md)
**For developers:** See [Developer Guide](./DEVELOPER_GUIDE.md)
**For deployment:** See [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## 🎯 Key Features

- ✅ **Health Check Endpoints** - Simple `/health` endpoint for load balancers and monitoring
- ✅ **Detailed System Status** - Database, Redis, and memory monitoring via `/status`
- ✅ **API Information** - Version, uptime, and environment info via `/info`
- ✅ **Ping Endpoint** - Ultra-fast ping/pong for connectivity tests
- ✅ **Welcome Message** - Branded welcome with ASCII logo and endpoint list
- ✅ **Smart Health Determination** - Automatically detects healthy/degraded/unhealthy states
- ✅ **Response Time Tracking** - Measures database and Redis latency
- ✅ **Memory Monitoring** - Tracks heap usage and alerts when high
- ✅ **Demo Endpoints** - API key authentication examples (dev only)

---

## 📚 Documentation

### For End Users
- [User Guide](./USER_GUIDE.md) - How to use health check endpoints
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

### For Developers
- [Developer Guide](./DEVELOPER_GUIDE.md) - Technical implementation details
- [API Reference](./API_REFERENCE.md) - Complete API documentation (7 endpoints)
- [Architecture](./ARCHITECTURE.md) - System design and health check logic

### For DevOps
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment and monitoring setup

### Navigation
- [Documentation Index](./DOCUMENTATION_INDEX.md) - Complete documentation map

---

## 🔗 Quick Links

### Backend
- **Module:** `apps/api/src/core/system/`
- **Controller:** `apps/api/src/core/system/default.controller.ts`
- **Service:** `apps/api/src/core/system/default.service.ts`
- **Routes:** `apps/api/src/core/system/default.routes.ts`
- **Schemas:** `apps/api/src/core/system/default.schemas.ts`
- **Tests:** `apps/api/src/core/system/__tests__/`

### Frontend
- **N/A** - Backend-only module (infrastructure)

### Database
- **N/A** - No database tables (infrastructure module)

---

## 🚦 Status & Roadmap

### Current Status (v1.0.0)
- ✅ Core endpoints complete (5 production + 2 demo + 2 test)
- ✅ Unit tests complete (100% coverage)
- ✅ Integration tests complete
- ✅ Documentation complete
- ✅ Production ready

### Health States

| State | Meaning | Conditions |
|-------|---------|------------|
| **🟢 Healthy** | All systems operational | DB connected, memory <90%, Redis OK (if configured) |
| **🟡 Degraded** | Operational with issues | High memory (>90%), Redis down, or slow DB (>1s) |
| **🔴 Unhealthy** | Critical failure | Database disconnected or error |

### Roadmap

**v1.1.0** (Next)
- [ ] Prometheus metrics export (`/api/metrics`)
- [ ] Alerting integration (Slack, PagerDuty)
- [ ] Settings module integration (dynamic version)

**v1.2.0** (Future)
- [ ] Health check history and trends
- [ ] Disk space monitoring
- [ ] CPU usage monitoring
- [ ] External API connectivity checks

---

## 📊 Technical Overview

| Aspect | Details |
|--------|---------|
| **Backend** | Fastify 4+, TypeBox validation |
| **Frontend** | N/A (backend-only) |
| **Database** | PostgreSQL (for connectivity check) |
| **Caching** | Redis (optional, for connectivity check) |
| **Real-time** | WebSocket (test endpoints only) |
| **Testing** | Jest (unit + integration) |

### Endpoints Summary

| Endpoint | Purpose | Authentication | Response Time |
|----------|---------|----------------|---------------|
| `GET /api/health` | Simple health check | Public | <50ms |
| `GET /api/status` | Detailed status | Public | <200ms |
| `GET /api/info` | API information | Public | <50ms |
| `GET /api/ping` | Connectivity test | Public | <10ms |
| `GET /` | Welcome message | Public | <50ms |
| `GET /api/protected-data` | API key demo | API Key | Varies |
| `GET /api/hybrid-protected` | Hybrid auth demo | JWT or API Key | Varies |

---

## 🤝 Related Features

- [Monitoring](../monitoring/README.md) - Application activity and audit logs
- [API Keys](../api-keys/README.md) - API key authentication system (used in demos)
- [Settings](../settings/README.md) - Application settings (future integration)

---

## 📝 Usage Examples

### Load Balancer Health Check

```nginx
# Nginx upstream health check
upstream api_backend {
  server api1.example.com:3333;
  server api2.example.com:3333;

  # Health check configuration
  health_check interval=5s fails=3 passes=2 uri=/api/health;
}
```

### Kubernetes Liveness/Readiness Probes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: aegisx-api
spec:
  containers:
  - name: api
    image: aegisx/api:latest
    livenessProbe:
      httpGet:
        path: /api/health
        port: 3333
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /api/status
        port: 3333
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Monitoring with curl

```bash
# Simple health check
curl http://localhost:3333/api/health

# Expected response (HTTP 200):
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "version": "1.0.0"
  },
  "message": "API is healthy"
}

# Detailed system status
curl http://localhost:3333/api/status | jq .

# Monitor memory usage
watch -n 5 'curl -s http://localhost:3333/api/status | jq .data.memory'
```

### Alerting Script Example

```bash
#!/bin/bash
# Monitor API health and send alert if unhealthy

STATUS=$(curl -s http://localhost:3333/api/status | jq -r '.data.status')

if [ "$STATUS" == "unhealthy" ]; then
  # Send alert (example using Slack webhook)
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    -H 'Content-Type: application/json' \
    -d '{"text":"🚨 API is UNHEALTHY!"}'
elif [ "$STATUS" == "degraded" ]; then
  # Send warning
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    -H 'Content-Type: application/json' \
    -d '{"text":"⚠️ API is DEGRADED"}'
fi
```

---

## 🔒 Security Notes

- **Public Endpoints** - All production endpoints are public (no authentication required)
- **Test Endpoints Protected** - Test endpoints (`/test/*`) are automatically blocked in production
- **No Sensitive Data** - Health checks never expose credentials or secrets
- **Rate Limiting** - Consider adding rate limiting for public endpoints in production

---

## 🎯 Design Philosophy

The System module follows these principles:

1. **Lightweight** - Health checks must be fast (<100ms)
2. **Reliable** - Never fail due to missing optional dependencies
3. **Informative** - Provide enough detail for debugging
4. **Secure** - Never expose sensitive information
5. **Standard** - Follow industry best practices for health checks

---

## 📈 Performance Metrics

Based on production benchmarks:

| Metric | Target | Typical |
|--------|--------|---------|
| `/api/health` response time | <50ms | 5-10ms |
| `/api/ping` response time | <10ms | 2-5ms |
| `/api/status` response time | <200ms | 50-100ms |
| Database check | <100ms | 10-20ms |
| Redis check | <50ms | 2-5ms |
| Memory overhead | Minimal | <1MB |

---

**Need help?** See [Troubleshooting Guide](./TROUBLESHOOTING.md) or contact the DevOps team.

**Contributing:** See [Developer Guide](./DEVELOPER_GUIDE.md) for how to add new health checks or modify existing ones.
