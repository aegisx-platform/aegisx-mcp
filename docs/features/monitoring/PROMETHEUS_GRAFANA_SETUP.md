# Prometheus + Grafana Monitoring Setup

Complete production-ready monitoring stack for AegisX API metrics visualization and alerting.

## 📊 Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  AegisX API     │         │   Prometheus     │         │    Grafana      │
│  (Port 3383)    │ ─────▶  │   (Port 9140)    │ ─────▶  │  (Port 3050)    │
│                 │ scrape  │                  │ query   │                 │
│  /metrics       │  15s    │  Time Series DB  │ PromQL  │  Dashboards     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                           │                            │
         │                           │                            │
         ▼                           ▼                            ▼
  HTTP Requests              30-day retention              Visual Analytics
  Real-time metrics          10GB max storage               Pre-built panels
```

## 🚀 Quick Start

### 1. Start Monitoring Stack

```bash
# Start Prometheus + Grafana
pnpm run monitoring:start

# Verify containers are running
docker ps | grep -E 'prometheus|grafana'
```

### 2. Access Dashboards

**Grafana Dashboard:**

- URL: http://localhost:3050
- Username: `admin`
- Password: `admin123`
- Pre-loaded dashboard: "AegisX API Metrics"

**Prometheus UI:**

- URL: http://localhost:9140
- Direct metrics: http://localhost:9140/targets

**API Metrics Endpoint:**

- URL: http://localhost:3383/metrics
- Format: Prometheus text format

### 3. Generate Test Traffic

```bash
# Create test traffic script
cat > /tmp/generate-traffic.sh << 'EOF'
#!/bin/bash
echo "Generating test API traffic..."

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3383/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aegisx.local","password":"admin123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Make 50 requests
for i in {1..50}; do
  curl -s http://localhost:3383/api/users \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  curl -s http://localhost:3383/api/health > /dev/null
  echo -n "."
done

echo ""
echo "✅ Generated 100 requests"
echo "🔍 Check Grafana: http://localhost:3050"
EOF

chmod +x /tmp/generate-traffic.sh
/tmp/generate-traffic.sh
```

## 📈 Available Metrics

### HTTP Request Metrics

**1. http_requests_total** (Counter)

- Description: Total number of HTTP requests
- Labels: `method`, `route`, `status_code`
- Example: `http_requests_total{method="GET",route="/api/users",status_code="200"}`

**2. http_request_duration_seconds** (Histogram)

- Description: Request duration in seconds
- Labels: `method`, `route`, `status_code`
- Buckets: 0.005s, 0.01s, 0.025s, 0.05s, 0.1s, 0.25s, 0.5s, 1s, 2.5s, 5s, 10s
- Percentiles: p50, p90, p95, p99

**3. http_requests_active** (Gauge)

- Description: Number of concurrent active requests
- No labels
- Real-time measurement

**4. http_request_size_bytes** (Histogram)

- Description: Request payload size in bytes
- Labels: `method`, `route`
- Buckets: 100B, 1KB, 5KB, 10KB, 50KB, 100KB, 500KB, 1MB

### System Metrics

- **Process Memory**: Node.js heap usage
- **Event Loop Lag**: Event loop delay
- **GC Stats**: Garbage collection metrics

## 📊 Dashboard Panels

The pre-configured "AegisX API Metrics" dashboard includes:

1. **Total Requests (Rate)** - Requests per second by endpoint
2. **Request Duration (p95)** - 95th percentile response time
3. **Active Requests** - Concurrent requests in progress
4. **Error Rate (4xx + 5xx)** - Error requests per second
5. **Request Size Distribution** - Average payload sizes
6. **Top 10 Endpoints** - Most trafficked endpoints
7. **Response Time Percentiles** - p50, p90, p95, p99
8. **Success Rate (2xx)** - Successful requests counter
9. **Client Errors (4xx)** - Client error counter
10. **Server Errors (5xx)** - Server error counter
11. **Total Requests** - Overall request rate

## 🔍 Common PromQL Queries

### Request Rate

```promql
# Request rate per second (5m window)
rate(http_requests_total{job="aegisx-api"}[5m])

# Success rate only (2xx)
rate(http_requests_total{job="aegisx-api", status_code=~"2.."}[5m])

# Error rate (4xx + 5xx)
rate(http_requests_total{job="aegisx-api", status_code=~"[45].."}[5m])
```

### Response Time

```promql
# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Median response time (p50)
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
```

### Top Endpoints

```promql
# Top 10 endpoints by request count
topk(10, sum by (route) (rate(http_requests_total[5m])))

# Slowest endpoints (p95 latency)
topk(10, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### Active Requests

```promql
# Current active requests
http_requests_active

# Max active requests (5m window)
max_over_time(http_requests_active[5m])
```

## 🛠️ Management Commands

### Start/Stop/Restart

```bash
# Start monitoring stack
pnpm run monitoring:start

# Stop monitoring stack
pnpm run monitoring:stop

# Restart (useful after config changes)
pnpm run monitoring:restart

# View logs
pnpm run monitoring:logs

# View specific service logs
docker logs aegisx_1_prometheus -f
docker logs aegisx_1_grafana -f
```

### Configuration Reload

```bash
# Reload Prometheus config without restart
curl -X POST http://localhost:9140/-/reload

# Restart Grafana to reload dashboards
docker restart aegisx_1_grafana
```

### Data Management

```bash
# Check Prometheus data size
docker exec aegisx_1_prometheus du -sh /prometheus

# Clean up all data (CAUTION!)
docker-compose -f docker-compose.monitoring.yml down -v
docker volume rm prometheus_1_data grafana_1_data
```

## 🔧 Configuration Files

### Prometheus Configuration

**File:** `monitoring/prometheus.yml`

- Scrape interval: 15s
- Scrape timeout: 10s
- Retention: 30 days or 10GB (whichever first)
- Target: API at `host.docker.internal:3383/metrics`

### Grafana Datasource

**File:** `monitoring/grafana/datasources/prometheus.yml`

- Auto-provisioned on startup
- Points to: `http://prometheus:9090` (internal Docker network)
- Query timeout: 60s

### Grafana Dashboard

**File:** `monitoring/grafana/dashboards/api-metrics.json`

- Auto-loaded on startup
- Refresh interval: 30s
- Time range: Last 1 hour (configurable)

## 📝 Production Checklist

### Security

- [ ] Change default Grafana password
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Restrict Prometheus access (not exposed to public)
- [ ] Use authentication for Grafana

### Performance

- [ ] Adjust scrape interval based on traffic (15s default)
- [ ] Configure retention based on storage capacity
- [ ] Set up remote storage for long-term retention
- [ ] Monitor Prometheus resource usage

### Alerts (Optional)

- [ ] Configure Alertmanager
- [ ] Create alert rules for high error rates
- [ ] Set up notifications (email, Slack, PagerDuty)
- [ ] Test alert delivery

### Backup

- [ ] Backup Grafana dashboard configurations
- [ ] Export custom dashboards regularly
- [ ] Document custom PromQL queries

## 🎯 Monitoring Best Practices

### 1. Dashboard Usage

- **Default Time Range**: Last 1 hour for real-time monitoring
- **Refresh Rate**: 30s automatic refresh
- **Drill-Down**: Click panels to explore specific endpoints

### 2. Alert Thresholds

Recommended alert thresholds:

- Error rate > 5% for 5 minutes
- p95 latency > 1 second for 10 minutes
- Active requests > 100 for 5 minutes
- Memory usage > 80% for 10 minutes

### 3. Retention Strategy

- **Short-term (Prometheus)**: 30 days at 15s resolution
- **Long-term (Optional)**: Remote storage at 5m resolution
- **Aggregation**: Daily/weekly summaries for historical analysis

## 🐛 Troubleshooting

### Prometheus Not Scraping API

```bash
# Check Prometheus targets
curl http://localhost:9140/api/v1/targets | jq

# Test API metrics endpoint
curl http://localhost:3383/metrics

# Check Prometheus logs
docker logs aegisx_1_prometheus -f
```

**Common Issues:**

- API not running on port 3383
- Firewall blocking Prometheus → API connection
- Wrong target URL in prometheus.yml

### Grafana Dashboard Not Loading

```bash
# Check Grafana logs
docker logs aegisx_1_grafana -f

# Verify datasource
curl -u admin:admin123 http://localhost:3050/api/datasources
```

**Common Issues:**

- Prometheus datasource not connected
- Dashboard JSON syntax error
- Permissions issue on volume mounts

### No Data in Dashboard

```bash
# Generate test traffic
for i in {1..20}; do
  curl http://localhost:3383/api/health > /dev/null
done

# Check if metrics exist
curl http://localhost:3383/metrics | grep http_requests_total

# Query Prometheus directly
curl 'http://localhost:9140/api/v1/query?query=http_requests_total'
```

### High Memory Usage

```bash
# Check Prometheus memory
docker stats aegisx_1_prometheus

# Reduce retention
# Edit monitoring/prometheus.yml:
#   retention.time: 15d  # Reduce from 30d
#   retention.size: 5GB  # Reduce from 10GB

# Restart Prometheus
pnpm run monitoring:restart
```

## 📚 Additional Resources

### Prometheus

- [Official Documentation](https://prometheus.io/docs/)
- [Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [Best Practices](https://prometheus.io/docs/practices/)

### Grafana

- [Official Documentation](https://grafana.com/docs/)
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [PromQL in Grafana](https://grafana.com/docs/grafana/latest/datasources/prometheus/)

### PromQL

- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Query Functions](https://prometheus.io/docs/prometheus/latest/querying/functions/)
- [Operators](https://prometheus.io/docs/prometheus/latest/querying/operators/)

## 🔄 Integration with Existing API

The monitoring stack integrates seamlessly with your existing API:

**Backend Endpoints:**

- `/metrics` - Prometheus format (public)
- `/api/monitoring/request-metrics` - JSON format (authenticated)
- `/api/monitoring/active-sessions` - Active user sessions (authenticated)

**Metrics Collection:**

- Non-blocking (uses onResponse hook)
- Zero performance impact on requests
- Fire-and-forget session tracking
- Automatic cleanup via Redis TTL

**Authentication:**

- `/metrics` endpoint: Public (for Prometheus scraping)
- Dashboard endpoints: JWT-protected
- Grafana: Username/password authentication

## 📊 Example Monitoring Workflow

### Daily Monitoring Routine

1. **Morning Check** (9:00 AM)
   - Open Grafana dashboard
   - Review overnight error rates
   - Check for any anomalies in traffic patterns

2. **Performance Review** (Twice daily)
   - Monitor p95 latency trends
   - Identify slowest endpoints
   - Review active request count

3. **Incident Response**
   - High error rate detected → Check error panel
   - Slow response → Check latency percentiles
   - High load → Check active requests gauge

4. **Weekly Review**
   - Analyze traffic patterns
   - Identify optimization opportunities
   - Plan capacity scaling if needed

---

**🎉 Setup Complete!** Your production-ready monitoring stack is now configured and ready to use.

For questions or issues, refer to the troubleshooting section above or check the official documentation.
