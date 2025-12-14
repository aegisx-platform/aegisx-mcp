# Staging QA Procedures for Route Aliasing

## Overview

This document outlines the comprehensive QA testing procedures for enabling new routes in the staging environment during the API architecture standardization migration.

**Status**: Development Environment Testing Completed
**Environment**: Currently Development (Staging procedures documented for future deployment)
**Feature Flags**: ENABLE_NEW_ROUTES=true, ENABLE_OLD_ROUTES=true

## Table of Contents

1. [Testing Prerequisites](#testing-prerequisites)
2. [Feature Flag Configuration](#feature-flag-configuration)
3. [Integration Test Verification](#integration-test-verification)
4. [Performance Testing Procedures](#performance-testing-procedures)
5. [Monitoring & Observability](#monitoring--observability)
6. [Error Rate Analysis](#error-rate-analysis)
7. [Rollback Procedures](#rollback-procedures)
8. [Sign-off Checklist](#sign-off-checklist)

---

## Testing Prerequisites

### Environment Setup

Before enabling new routes in staging, verify the following:

- [ ] Staging environment is fully deployed with latest code
- [ ] Database migrations are complete
- [ ] Feature flags are accessible via environment variables
- [ ] Monitoring systems are operational
- [ ] Rollback plan is documented and tested

### Required Access

- [ ] Staging environment access
- [ ] Monitoring dashboard access (Prometheus/Grafana)
- [ ] Log aggregation system access
- [ ] Database read access for verification
- [ ] Deploy/rollback permissions

---

## Feature Flag Configuration

### Migration Modes

The route aliasing system supports three configuration modes:

#### Mode 1: Both Routes Disabled (INVALID)

```bash
# ❌ INVALID - Will throw configuration error
ENABLE_NEW_ROUTES=false
ENABLE_OLD_ROUTES=false
```

**Error**: "At least one of ENABLE_NEW_ROUTES or ENABLE_OLD_ROUTES must be true"

#### Mode 2: Migration Mode (Recommended for Testing)

```bash
# ✅ RECOMMENDED - Both old and new routes active
ENABLE_NEW_ROUTES=true
ENABLE_OLD_ROUTES=true
```

**Behavior**:

- Old routes redirect to new routes via HTTP 307
- New routes serve directly
- All existing clients continue working
- Metrics track route usage patterns

#### Mode 3: New Routes Only (Post-Migration)

```bash
# Future state after migration complete
ENABLE_NEW_ROUTES=true
ENABLE_OLD_ROUTES=false
```

**Behavior**:

- Only new routes active
- Old routes return 404
- Clients must have migrated to new routes

### Staging Configuration

For initial staging testing, use Migration Mode:

```bash
# .env.staging
ENABLE_NEW_ROUTES=true
ENABLE_OLD_ROUTES=true
```

### Verification Commands

```bash
# Verify configuration loaded correctly
curl https://staging-api.example.com/api/health | jq .config.features

# Expected response:
{
  "enableNewRoutes": true,
  "enableOldRoutes": true
}
```

---

## Integration Test Verification

### Running Integration Tests Locally

Before deploying to staging, verify integration tests pass locally:

```bash
# Set feature flags
export ENABLE_NEW_ROUTES=true
export ENABLE_OLD_ROUTES=true

# Run route aliasing integration tests
cd /Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1
pnpm test apps/api/src/__tests__/integration/route-aliasing.test.ts
```

### Test Coverage

The integration test suite (`route-aliasing.test.ts`) covers:

#### 1. HTTP 307 Redirect Behavior

- Core layer routes (`/api/auth`, `/api/monitoring`)
- Platform layer routes (`/api/users`, `/api/departments`, `/api/settings`, `/api/navigation`)
- Domains layer routes (`/api/inventory`, `/api/admin`)

#### 2. HTTP Method Preservation

- GET requests
- POST requests (with body)
- PUT requests (with body)
- DELETE requests
- PATCH requests (with body)

#### 3. Request Body Preservation

- JSON payloads
- Complex nested objects
- Array payloads

#### 4. Query String Preservation

- Pagination parameters
- Filter parameters
- Complex query parameters
- Query params in POST requests

#### 5. Metrics Logging

- Redirect metrics tracking
- Old path and new path logging
- HTTP method tracking

#### 6. Edge Cases

- Routes without aliases
- Non-existent routes
- Special characters in paths
- Long URLs
- Multiple path segments
- Trailing slashes

#### 7. Feature Flag Control

- Respects ENABLE_NEW_ROUTES flag
- Handles wildcard paths
- Preserves path parameters

#### 8. Authentication & Authorization

- Preserves auth headers
- Maintains authorization context

#### 9. Error Handling

- Handles target route errors correctly
- Preserves error responses

#### 10. Performance

- Minimal redirect overhead
- Concurrent request handling

### Expected Test Results

All 45+ test cases should pass:

```
Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
```

### Test Failures - Troubleshooting

If tests fail, check:

1. **TypeScript Compilation Errors**
   - Verify all type definitions are correct
   - Check FastifyReply decorators are registered
   - Ensure auth plugin decorators are loaded

2. **Database Issues**
   - Verify migrations are applied
   - Check test database is clean
   - Ensure seed data is loaded

3. **Authentication Failures**
   - Verify JWT secret is configured
   - Check user creation succeeds
   - Validate token generation

4. **Route Aliasing Not Active**
   - Verify ENABLE_NEW_ROUTES=true
   - Check plugin is registered
   - Validate route alias mappings

---

## Performance Testing Procedures

### Redirect Overhead Measurement

**Requirement**: Redirect overhead must be < 5ms

#### Test Procedure

1. **Baseline Measurement** (Direct Route Access)

```bash
# Test new route directly (no redirect)
ab -n 1000 -c 10 \
   -H "Authorization: Bearer $TOKEN" \
   https://staging-api.example.com/api/v1/platform/users/
```

Record P50, P95, P99 latencies.

2. **Redirect Measurement** (Old Route Access)

```bash
# Test old route (with redirect)
ab -n 1000 -c 10 \
   -H "Authorization: Bearer $TOKEN" \
   https://staging-api.example.com/api/users/
```

Record P50, P95, P99 latencies.

3. **Calculate Overhead**

```
Redirect Overhead = P95(Old Route) - P95(New Route)
```

**Success Criteria**: Overhead < 5ms

#### Performance Test Matrix

Test the following scenarios:

| Route Type | HTTP Method | Payload Size | Concurrent Users | Target P95 |
| ---------- | ----------- | ------------ | ---------------- | ---------- |
| Core       | GET         | N/A          | 10               | < 50ms     |
| Core       | POST        | 1KB          | 10               | < 100ms    |
| Platform   | GET         | N/A          | 50               | < 50ms     |
| Platform   | POST        | 10KB         | 50               | < 150ms    |
| Domains    | GET         | N/A          | 100              | < 75ms     |
| Domains    | POST        | 50KB         | 100              | < 250ms    |

### Load Testing

Use k6 for comprehensive load testing:

```javascript
// load-test-route-aliasing.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp up
    { duration: '5m', target: 50 }, // Sustained
    { duration: '2m', target: 100 }, // Peak
    { duration: '5m', target: 100 }, // Sustained peak
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% < 100ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const token = 'YOUR_TEST_TOKEN';

  // Test old route (redirect)
  let res1 = http.get('https://staging-api.example.com/api/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(res1, {
    'old route status is 200 or 307': (r) => [200, 307].includes(r.status),
    'old route response time OK': (r) => r.timings.duration < 100,
  });

  // Test new route (direct)
  let res2 = http.get('https://staging-api.example.com/api/v1/platform/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(res2, {
    'new route status is 200': (r) => r.status === 200,
    'new route response time OK': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
```

Run load test:

```bash
k6 run load-test-route-aliasing.js
```

### Performance Benchmarking Report Template

```markdown
# Route Aliasing Performance Report

**Date**: YYYY-MM-DD
**Environment**: Staging
**Test Duration**: X hours
**Peak Concurrent Users**: X

## Summary

- ✅ Redirect overhead: X.Xms (Target: < 5ms)
- ✅ P95 latency increase: X.X% (Target: < 5%)
- ✅ Error rate: X.XX% (Target: < 0.1%)

## Detailed Metrics

### Direct Route Access (New Routes)

- P50: XXms
- P95: XXms
- P99: XXms

### Redirected Route Access (Old Routes)

- P50: XXms
- P95: XXms
- P99: XXms

### Redirect Overhead

- P50 overhead: X.Xms
- P95 overhead: X.Xms
- P99 overhead: X.Xms

## Load Test Results

[Include k6 summary output]

## Conclusion

[✅ PASS / ❌ FAIL] - Performance within acceptable thresholds
```

---

## Monitoring & Observability

### Key Metrics to Monitor

#### 1. Route Usage Metrics

Track which routes are being used:

```promql
# Old route usage (redirects)
rate(http_requests_total{path=~"/api/(?!v1).*"}[5m])

# New route usage (direct)
rate(http_requests_total{path=~"/api/v1/.*"}[5m])

# Redirect ratio
rate(http_redirects_total{status="307"}[5m])
  /
rate(http_requests_total[5m])
```

#### 2. Performance Metrics

```promql
# P95 latency for redirected requests
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{
    path=~"/api/(?!v1).*"
  }[5m])
)

# P95 latency for direct requests
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{
    path=~"/api/v1/.*"
  }[5m])
)

# Latency difference (redirect overhead)
# (Calculate difference between above queries)
```

#### 3. Error Rate Metrics

```promql
# Error rate for old routes
rate(http_requests_total{
  path=~"/api/(?!v1).*",
  status=~"5.."
}[5m])

# Error rate for new routes
rate(http_requests_total{
  path=~"/api/v1/.*",
  status=~"5.."
}[5m])

# 404 errors (routes not found)
rate(http_requests_total{status="404"}[5m])
```

#### 4. Redirect-Specific Metrics

```promql
# 307 redirect count
sum(rate(http_requests_total{status="307"}[5m])) by (path)

# Top redirected routes
topk(10, sum(rate(http_requests_total{status="307"}[5m])) by (path))
```

### Grafana Dashboard Configuration

Create a dedicated dashboard for route aliasing monitoring:

**Dashboard Panels**:

1. **Route Usage Overview**
   - Total requests (old vs new routes)
   - Pie chart showing route distribution
   - Time series of route usage trends

2. **Performance Comparison**
   - P50/P95/P99 latencies side-by-side
   - Redirect overhead trend
   - Latency distribution histogram

3. **Error Tracking**
   - Error rate by route type
   - 404 errors (unmapped routes)
   - 500 errors (server errors)

4. **Top Routes**
   - Most redirected routes
   - Slowest routes
   - Routes with highest error rates

5. **Feature Flag Status**
   - Current configuration (visual indicator)
   - Configuration change history

### Alert Configuration

Set up alerts for critical issues:

```yaml
# prometheus-alerts.yml
groups:
  - name: route_aliasing
    interval: 30s
    rules:
      # High redirect overhead
      - alert: RedirectOverheadHigh
        expr: |
          (
            histogram_quantile(0.95,
              rate(http_request_duration_seconds_bucket{path=~"/api/(?!v1).*"}[5m])
            )
            -
            histogram_quantile(0.95,
              rate(http_request_duration_seconds_bucket{path=~"/api/v1/.*"}[5m])
            )
          ) > 0.005
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Route redirect overhead exceeds 5ms threshold'
          description: 'P95 redirect overhead is {{ $value }}ms (threshold: 5ms)'

      # High error rate on redirected routes
      - alert: RedirectErrorRateHigh
        expr: |
          rate(http_requests_total{
            path=~"/api/(?!v1).*",
            status=~"5.."
          }[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'Error rate on redirected routes exceeds 1%'
          description: 'Error rate is {{ $value | humanizePercentage }}'

      # Unexpected 404s on old routes
      - alert: UnexpectedRouteNotFound
        expr: |
          rate(http_requests_total{
            path=~"/api/(?!v1).*",
            status="404"
          }[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: 'High 404 rate on old routes'
          description: '{{ $value }} requests/sec getting 404 on old routes'
```

### Log Aggregation

Ensure the following logs are captured and searchable:

```javascript
// Example log entries to track
{
  "level": "info",
  "msg": "Route redirect",
  "oldPath": "/api/users",
  "newPath": "/api/v1/platform/users",
  "method": "GET",
  "statusCode": 307,
  "duration": 2.5,
  "timestamp": "2025-12-14T10:00:00Z"
}
```

**Log Queries** (using Elasticsearch/Kibana or similar):

```
# All redirects in last hour
level:info AND msg:"Route redirect" AND timestamp:>now-1h

# Slow redirects (>5ms overhead)
level:info AND msg:"Route redirect" AND duration:>5

# Failed redirects
level:error AND msg:"Route redirect"

# Top redirected paths
# Aggregation by oldPath field
```

---

## Error Rate Analysis

### Acceptable Error Rates

| Error Type | Threshold | Action if Exceeded      |
| ---------- | --------- | ----------------------- |
| 5xx errors | < 0.1%    | Investigate immediately |
| 4xx errors | < 1%      | Review and monitor      |
| 404 errors | < 0.5%    | Check route mappings    |
| Timeouts   | < 0.05%   | Investigate immediately |

### Error Investigation Checklist

When error rate exceeds threshold:

1. **Identify Error Pattern**
   - [ ] Check which routes are failing
   - [ ] Identify error types (404, 500, etc.)
   - [ ] Determine if errors are old routes, new routes, or both
   - [ ] Check if errors correlate with specific HTTP methods

2. **Review Logs**
   - [ ] Search for error logs in time window
   - [ ] Identify common error messages
   - [ ] Check stack traces
   - [ ] Review request payloads

3. **Check Configuration**
   - [ ] Verify feature flags are correct
   - [ ] Validate route alias mappings
   - [ ] Ensure plugin is loaded
   - [ ] Check plugin registration order

4. **Test Manually**
   - [ ] Reproduce error with curl/Postman
   - [ ] Test both old and new route
   - [ ] Verify authentication works
   - [ ] Check response headers

5. **Assess Impact**
   - [ ] Count affected requests
   - [ ] Identify affected users/clients
   - [ ] Determine business impact
   - [ ] Decide if rollback needed

### Common Error Scenarios

#### Scenario 1: 404 on Old Routes

**Symptom**: Old routes returning 404 instead of redirecting

**Possible Causes**:

- Route alias mapping missing
- Plugin not loaded
- ENABLE_NEW_ROUTES=false

**Resolution**:

1. Verify route alias mapping in `route-aliases.ts`
2. Check plugin is registered in `plugin.loader.ts`
3. Verify ENABLE_NEW_ROUTES=true

#### Scenario 2: 500 Errors After Redirect

**Symptom**: Redirect succeeds (307) but target route returns 500

**Possible Causes**:

- Target route implementation broken
- Missing authentication context
- Database connection issue

**Resolution**:

1. Test new route directly (bypass redirect)
2. Check target route logs
3. Verify authentication headers preserved
4. Check database connectivity

#### Scenario 3: Authentication Failures

**Symptom**: 401 Unauthorized after redirect

**Possible Causes**:

- Authorization header not preserved
- JWT validation failing
- Token expired during redirect

**Resolution**:

1. Verify HTTP 307 preserves headers
2. Check JWT is valid
3. Test new route directly with same token
4. Review auth middleware logs

---

## Rollback Procedures

### Immediate Rollback (Emergency)

If critical issues detected during testing:

```bash
# Step 1: Disable new routes immediately
kubectl set env deployment/api-server ENABLE_NEW_ROUTES=false

# Step 2: Verify old routes still work
curl https://staging-api.example.com/api/users \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Monitor for 5 minutes
# Check error rate drops
# Verify functionality restored

# Step 4: Notify team
# Send alert to #staging-ops channel
# Create incident report
```

### Planned Rollback

If issues discovered but not critical:

1. **Document Issues**
   - [ ] Create detailed issue report
   - [ ] Include logs and metrics
   - [ ] Identify root cause
   - [ ] Estimate fix time

2. **Schedule Rollback**
   - [ ] Notify stakeholders
   - [ ] Plan rollback window
   - [ ] Prepare rollback commands

3. **Execute Rollback**
   - [ ] Disable new routes
   - [ ] Verify old routes work
   - [ ] Monitor for 30 minutes
   - [ ] Update status page

4. **Post-Rollback**
   - [ ] Conduct retrospective
   - [ ] Document lessons learned
   - [ ] Create fix plan
   - [ ] Schedule retry

### Rollback Verification

After rollback:

```bash
# Verify configuration
curl https://staging-api.example.com/api/health | jq .config.features
# Expected: { "enableNewRoutes": false, "enableOldRoutes": true }

# Test critical endpoints
curl https://staging-api.example.com/api/users -H "Authorization: Bearer $TOKEN"
curl https://staging-api.example.com/api/departments -H "Authorization: Bearer $TOKEN"
curl https://staging-api.example.com/api/settings -H "Authorization: Bearer $TOKEN"

# Check error rate
# Should return to baseline
```

---

## Sign-off Checklist

### Pre-Deployment Validation

- [ ] All integration tests pass locally
- [ ] Code review approved
- [ ] Documentation complete
- [ ] Rollback plan tested
- [ ] Monitoring configured
- [ ] Alerts configured

### Post-Deployment Validation (Staging)

#### Functional Testing

- [ ] Old routes redirect correctly (HTTP 307)
- [ ] New routes work directly
- [ ] All HTTP methods preserved (GET, POST, PUT, DELETE, PATCH)
- [ ] Request bodies preserved
- [ ] Query parameters preserved
- [ ] Authentication works on both old and new routes
- [ ] Authorization context preserved
- [ ] Error responses intact

#### Performance Testing

- [ ] Redirect overhead < 5ms (P95)
- [ ] P95 latency increase < 5%
- [ ] No performance degradation under load
- [ ] Concurrent requests handled correctly

#### Monitoring

- [ ] Metrics collected correctly
- [ ] Dashboard showing route usage
- [ ] Alerts firing correctly
- [ ] Logs searchable and useful

#### Error Handling

- [ ] Error rate < 0.1%
- [ ] No unexpected 404s
- [ ] No authentication failures
- [ ] Errors logged correctly

### Sign-off

**QA Engineer**: ************\_************ Date: ****\_****

**DevOps Lead**: ************\_************ Date: ****\_****

**Engineering Manager**: ********\_\_******** Date: ****\_****

---

## Appendix: Test Commands

### Quick Smoke Test

```bash
#!/bin/bash
# smoke-test-route-aliasing.sh

TOKEN="your-test-token"
BASE_URL="https://staging-api.example.com"

echo "Testing old routes (should redirect)..."
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/users"

curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/departments"

echo "Testing new routes (direct access)..."
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/v1/platform/users"

curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/v1/platform/departments"

echo "Testing body preservation (POST)..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Dept","code":"TEST"}' \
  "$BASE_URL/api/departments"
```

### Performance Quick Test

```bash
#!/bin/bash
# quick-perf-test.sh

TOKEN="your-test-token"
BASE_URL="https://staging-api.example.com"

echo "Measuring direct route latency..."
time curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/v1/platform/users" > /dev/null

echo "Measuring redirected route latency..."
time curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/users" > /dev/null
```

---

## Document History

| Version | Date       | Author  | Changes          |
| ------- | ---------- | ------- | ---------------- |
| 1.0     | 2025-12-14 | QA Team | Initial creation |

---

**Related Documents**:

- [URL Routing Specification](../04-url-routing-specification.md)
- [Migration Guide](../06-migration-guide.md)
- [Route Aliasing Implementation](../../../../apps/api/src/config/route-aliases.ts)
- [Integration Tests](../../../../apps/api/src/__tests__/integration/route-aliasing.test.ts)
