# AegisX Monitoring and Logging System

A comprehensive monitoring and logging solution for the AegisX Angular/Fastify/PostgreSQL application stack.

## 🚀 Quick Start

```bash
# Install monitoring dependencies
yarn install

# Start the monitoring stack
./scripts/setup-monitoring.sh

# Start the application with monitoring
yarn dev
```

## 📊 Components Overview

### Backend Monitoring (Fastify API)

#### 1. Winston Logging System

- **Structured JSON logging** for production
- **Colorized console logging** for development
- **Daily rotating file logs** with automatic cleanup
- **Request/response correlation IDs** for distributed tracing
- **Multiple log levels**: error, warn, info, debug

#### 2. Performance Monitoring

- **Prometheus metrics** integration
- **HTTP request metrics** (count, duration, status codes)
- **System resource monitoring** (CPU, memory, disk)
- **Database connection pool metrics**
- **Redis connection status**

#### 3. Health Check Endpoints

- **Liveness probe**: `/health/live` - Basic server health
- **Readiness probe**: `/health/ready` - Comprehensive health check
- **Service dependencies**: Database, Redis, memory, disk
- **Detailed health information** in development mode

### Frontend Monitoring (Angular)

#### 1. Global Error Handler

- **Automatic error capture** for unhandled exceptions
- **HTTP error interception** and correlation
- **Client-side error logging** to backend API
- **Contextual error information** with stack traces

#### 2. Performance Tracking

- **Core Web Vitals** monitoring (LCP, FID, CLS)
- **Page load time** tracking
- **Navigation performance** monitoring
- **Custom performance metrics** support

#### 3. User Behavior Analytics

- **User interaction tracking** (clicks, navigation)
- **Form submission monitoring**
- **Custom action tracking** capabilities
- **Session-based analytics**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular App   │───▶│   Fastify API   │───▶│   PostgreSQL    │
│                 │    │                 │    │                 │
│ • Error Handler │    │ • Winston Logs  │    │ • Health Checks │
│ • HTTP Intercept│    │ • Prometheus    │    │ • Connection    │
│ • Performance   │    │ • Health Checks │    │   Monitoring    │
│ • User Tracking │    │ • Correlation   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Log Files     │    │   Metrics DB    │
│     Stack       │    │                 │    │                 │
│ • Prometheus    │    │ • Application   │    │ • Time Series   │
│ • Grafana       │    │ • Error Logs    │    │ • Performance   │
│ • Loki          │    │ • Request Logs  │    │ • Health Data   │
│ • Alertmanager  │    │ • Audit Logs    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
aegisx-starter/
├── apps/
│   ├── api/src/
│   │   ├── plugins/
│   │   │   ├── logging.plugin.ts         # Winston logging system
│   │   │   ├── monitoring.plugin.ts      # Prometheus metrics
│   │   │   └── health-check.plugin.ts    # Health endpoints
│   │   └── modules/
│   │       └── monitoring/               # Client error logging endpoints
│   └── web/src/app/
│       └── core/
│           ├── error-handler.service.ts  # Global error handling
│           ├── http-error.interceptor.ts # HTTP error interception
│           └── monitoring.service.ts     # Performance & user tracking
├── monitoring/                           # Monitoring stack configuration
│   ├── prometheus.yml                    # Prometheus configuration
│   ├── grafana/                         # Grafana dashboards & datasources
│   ├── loki.yml                         # Loki log aggregation
│   └── alertmanager.yml                 # Alert configuration
├── logs/                                # Application logs (auto-created)
├── docker-compose.monitoring.yml        # Monitoring stack
├── .env.monitoring.example              # Monitoring configuration
└── scripts/setup-monitoring.sh          # Setup script
```

## 🔧 Configuration

### Environment Variables (.env.monitoring)

```env
# Logging
LOG_LEVEL=info
LOG_DIRECTORY=logs
STORE_CLIENT_ERRORS=true

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_RESOURCE_MONITORING=true
METRICS_PREFIX=aegisx_api_

# Health Checks
DATABASE_HEALTH_TIMEOUT=5000
REDIS_HEALTH_TIMEOUT=3000
MEMORY_THRESHOLD=85

# External Services (optional)
# SENTRY_DSN=your_sentry_dsn
# DATADOG_API_KEY=your_api_key
```

### Winston Logging Configuration

```typescript
// Structured logging in production
{
  timestamp: "2024-01-15T10:30:45.123Z",
  level: "INFO",
  message: "Request completed",
  service: "aegisx-api",
  environment: "production",
  correlationId: "abc123-def456",
  requestId: "req-789",
  method: "POST",
  url: "/api/users",
  statusCode: 201,
  responseTime: "45ms"
}
```

## 📈 Metrics and Monitoring

### Key Metrics Tracked

1. **HTTP Request Metrics**
   - `aegisx_api_http_requests_total` - Total HTTP requests
   - `aegisx_api_http_request_duration_seconds` - Request duration histogram
   - `aegisx_api_http_requests_in_progress` - Concurrent requests

2. **System Metrics**
   - `aegisx_api_memory_usage_bytes` - Memory usage by type
   - `aegisx_api_cpu_usage_percent` - CPU usage percentage
   - `aegisx_api_db_connections_active` - Database connections

3. **Error Metrics**
   - `aegisx_api_errors_total` - Error count by type and route
   - Client-side error rates and types
   - HTTP error status code distribution

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "details": {
        "poolSize": 10,
        "activeConnections": 2
      }
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    }
  },
  "summary": {
    "total": 4,
    "healthy": 4,
    "unhealthy": 0,
    "degraded": 0
  }
}
```

## 🚨 Alerting

### Default Alert Rules

1. **High Error Rate** (> 10% in 5 minutes)
2. **Slow Response Times** (> 3 seconds average)
3. **High Memory Usage** (> 85%)
4. **Database Connection Issues**
5. **Service Unavailability**

### Alert Channels

- **Webhook** notifications for custom integrations
- **Email** alerts for critical issues
- **Slack** integration for team notifications
- **PagerDuty** for on-call management (configurable)

## 🖥️ Dashboards and Visualization

### Grafana Dashboards

Access Grafana at `http://localhost:3030` (admin/aegisx123)

1. **API Performance Dashboard**
   - Request rate and response times
   - Error rate and status code distribution
   - Database and Redis performance

2. **System Resources Dashboard**
   - CPU and memory usage
   - Disk space and I/O
   - Network metrics

3. **Application Logs Dashboard**
   - Real-time log streaming
   - Error log analysis
   - Request correlation tracking

### Prometheus Queries

```promql
# Request rate per minute
rate(aegisx_api_http_requests_total[1m])

# Average response time
rate(aegisx_api_http_request_duration_seconds_sum[5m]) /
rate(aegisx_api_http_request_duration_seconds_count[5m])

# Error rate percentage
(
  rate(aegisx_api_http_requests_total{status_code=~"5.."}[5m]) /
  rate(aegisx_api_http_requests_total[5m])
) * 100
```

## 🔍 Log Analysis

### Log Locations

```
logs/
├── application-2024-01-15.log  # General application logs
├── error-2024-01-15.log        # Error logs only
└── requests-2024-01-15.log     # HTTP request logs
```

### Log Querying with Loki

```logql
# All error logs
{job="aegisx-api"} |= "ERROR"

# API requests with status 5xx
{job="aegisx-api-requests"} | json | statusCode =~ "5.."

# Requests by correlation ID
{job="aegisx-api"} | json | correlationId="abc123-def456"
```

## 🛠️ Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in application code
   - Monitor garbage collection metrics
   - Review database connection pooling

2. **Slow Response Times**
   - Analyze database query performance
   - Check for expensive operations
   - Review caching effectiveness

3. **High Error Rates**
   - Examine error logs for patterns
   - Check external service dependencies
   - Verify input validation

### Debug Commands

```bash
# Check API metrics
curl http://localhost:3333/metrics

# Check health status
curl http://localhost:3333/health/ready

# View real-time logs
tail -f logs/application-$(date +%Y-%m-%d).log

# Monitor resource usage
docker stats aegisx-api

# Check monitoring stack status
docker-compose -f docker-compose.monitoring.yml ps
```

## 🚀 Production Deployment

### Security Considerations

1. **Secure metric endpoints** with authentication
2. **Limit log retention** to comply with data policies
3. **Encrypt log transmission** in production
4. **Use secure credentials** for external services

### Performance Optimization

1. **Adjust log levels** for production (info or higher)
2. **Configure retention policies** to manage disk usage
3. **Use external time-series databases** for large deployments
4. **Implement log sampling** for high-traffic applications

### Scaling Considerations

1. **Distribute monitoring** across multiple instances
2. **Use external log aggregation** services
3. **Implement custom metrics** for business KPIs
4. **Set up cross-region monitoring** for global deployments

## 📚 Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Grafana Dashboard Guide](https://grafana.com/docs/grafana/latest/dashboards/)
- [Fastify Logging Best Practices](https://www.fastify.io/docs/latest/Reference/Logging/)
- [Angular Error Handling](https://angular.io/guide/error-handling)

## 🤝 Contributing

When adding new monitoring features:

1. **Follow the existing patterns** for consistency
2. **Add appropriate TypeBox schemas** for API endpoints
3. **Include comprehensive error handling**
4. **Update this documentation** with new features
5. **Add unit tests** for monitoring functions

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
