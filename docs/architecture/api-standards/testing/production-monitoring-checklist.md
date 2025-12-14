# Production Monitoring Checklist - Route Aliasing

## Overview

This checklist ensures comprehensive monitoring of the route aliasing feature in production. Use this during and after the migration to ensure system health and track migration progress.

**Purpose**: Monitor route aliasing performance, track migration adoption, detect issues early
**Audience**: DevOps Engineers, SREs, QA Engineers
**Phase**: Production Deployment & Migration (Weeks 10-11)

---

## Pre-Deployment Checklist

### Monitoring Infrastructure

- [ ] Prometheus is collecting HTTP metrics
- [ ] Grafana dashboards are configured
- [ ] Alert rules are deployed
- [ ] Log aggregation is capturing route redirect logs
- [ ] APM tool is instrumented (if applicable)
- [ ] Synthetic monitoring checks are configured

### Baseline Metrics Captured

Before enabling new routes, capture baseline:

- [ ] Current request rate (requests/second)
- [ ] Current P50/P95/P99 latencies
- [ ] Current error rates by status code
- [ ] Current resource utilization (CPU, memory, connections)
- [ ] Current endpoint usage distribution

### Alert Configuration

- [ ] Redirect overhead alert configured (threshold: >5ms)
- [ ] Error rate alert configured (threshold: >0.1%)
- [ ] 404 rate alert configured (threshold: >0.5%)
- [ ] Latency increase alert configured (threshold: >5% increase)
- [ ] Feature flag change alert configured

---

## Day 1: Initial Deployment (New Routes Disabled)

### Configuration Verification

- [ ] Verify ENABLE_NEW_ROUTES=false
- [ ] Verify ENABLE_OLD_ROUTES=true
- [ ] Confirm no behavior changes expected

### Deployment Validation

- [ ] Deployment completed successfully
- [ ] All pods/instances healthy
- [ ] No spike in error rates
- [ ] Latency remains at baseline
- [ ] No increase in resource utilization

### 24-Hour Soak Test

Monitor for 24 hours to ensure stability:

- [ ] Hour 1: No errors, latency stable
- [ ] Hour 6: Metrics stable
- [ ] Hour 12: No issues detected
- [ ] Hour 24: System stable, ready for next phase

**Sign-off**: System stable with new code deployed (routes disabled)

---

## Day 2: Enable New Routes (Migration Mode)

### Pre-Enablement

- [ ] Review baseline metrics
- [ ] Verify rollback procedure is ready
- [ ] Notify team of feature flag change
- [ ] Set up war room / monitoring session

### Feature Flag Change

```bash
# Enable new routes
kubectl set env deployment/api-server ENABLE_NEW_ROUTES=true
# ENABLE_OLD_ROUTES remains true
```

- [ ] Feature flag change confirmed in logs
- [ ] Configuration reload successful
- [ ] Health check passes

### Immediate Validation (First 5 Minutes)

- [ ] HTTP 307 redirects working
- [ ] New routes accessible directly
- [ ] No spike in 404 errors
- [ ] No spike in 500 errors
- [ ] Authentication working on both route types

### First Hour Monitoring

Monitor every 5 minutes:

| Time | Request Rate | Error Rate | P95 Latency | Redirect Overhead | Issues |
| ---- | ------------ | ---------- | ----------- | ----------------- | ------ |
| +5m  |              |            |             |                   |        |
| +10m |              |            |             |                   |        |
| +15m |              |            |             |                   |        |
| +30m |              |            |             |                   |        |
| +60m |              |            |             |                   |        |

**Thresholds**:

- Error rate: < 0.1%
- P95 latency: < baseline + 5%
- Redirect overhead: < 5ms

### Key Metrics - Hour 1

- [ ] **Route Usage Distribution**
  - Old routes (redirected): \_\_\_\_%
  - New routes (direct): \_\_\_\_%
  - Total requests/second: **\_**

- [ ] **Performance Metrics**
  - P95 latency (old routes): \_\_\_\_ms
  - P95 latency (new routes): \_\_\_\_ms
  - Redirect overhead: \_\_\_\_ms
  - Verdict: ✅ Within SLA / ❌ Exceeds SLA

- [ ] **Error Metrics**
  - 5xx error rate: \_\_\_\_%
  - 4xx error rate: \_\_\_\_%
  - 404 error rate: \_\_\_\_%
  - Verdict: ✅ Within threshold / ❌ Exceeds threshold

- [ ] **Resource Utilization**
  - CPU usage: \_\_\_\_%
  - Memory usage: \_\_\_\_%
  - Connection count: **\_**
  - Verdict: ✅ Normal / ❌ Elevated

### Decision Point (Hour 1)

- ✅ **CONTINUE**: All metrics within thresholds → Proceed to extended monitoring
- ❌ **ROLLBACK**: Any metric exceeds threshold → Execute rollback procedure

---

## Extended Monitoring (Day 2-7)

### Daily Checks

Complete this checklist daily for the first week:

#### Day 2

- [ ] Morning check: Review overnight metrics
- [ ] Identify top 10 redirected routes
- [ ] Check for any unusual patterns
- [ ] Verify no new errors introduced
- [ ] Review user feedback (if any)

**Notes**: ******************\_\_\_******************

#### Day 3

- [ ] Route adoption rate: **_% new routes, _**% old routes
- [ ] Redirect overhead trend: ✅ Stable / ⚠️ Increasing
- [ ] Error rate trend: ✅ Stable / ⚠️ Increasing
- [ ] Performance trend: ✅ Stable / ⚠️ Degrading

**Notes**: ******************\_\_\_******************

#### Day 4

- [ ] Identify clients still using old routes exclusively
- [ ] Review deprecation strategy
- [ ] Plan client outreach if needed
- [ ] Check for any edge cases

**Notes**: ******************\_\_\_******************

#### Day 5

- [ ] Peak load performance check
- [ ] Weekend traffic pattern review (if applicable)
- [ ] Cumulative error count review
- [ ] Resource utilization trends

**Notes**: ******************\_\_\_******************

#### Day 6

- [ ] Review all alerts triggered this week
- [ ] Analyze any incidents or near-misses
- [ ] Document lessons learned
- [ ] Plan for sunset period

**Notes**: ******************\_\_\_******************

#### Day 7 (Week 1 Review)

- [ ] Week 1 metrics summary prepared
- [ ] Stakeholder update sent
- [ ] Decision made on next steps
- [ ] Sunset date proposed (if metrics good)

**Week 1 Summary**:

- Total requests: ******\_******
- Old route usage: \_\_\_\_%
- New route usage: \_\_\_\_%
- Average redirect overhead: \_\_\_\_ms
- Total errors: **\_** (\_\_\_%)
- Incidents: **\_**

**Decision**: ✅ Proceed to deprecation / ⏸️ Continue monitoring / ❌ Rollback

---

## Week 2-3: Add Deprecation Headers

### Deprecation Header Implementation

After 1 week of stable operation:

- [ ] Deploy deprecation headers update
- [ ] Verify headers present on redirected requests
  ```bash
  curl -I https://api.example.com/api/users \
    -H "Authorization: Bearer $TOKEN"
  # Should include:
  # X-API-Deprecated: true
  # X-API-Sunset: 2025-12-28T00:00:00Z
  # X-API-Migration-Guide: https://docs.example.com/migration
  ```

### Client Communication

- [ ] Send migration notice to API consumers
- [ ] Publish migration guide
- [ ] Set up migration support channel
- [ ] Track client migration progress

### Client Outreach Tracking

| Client | Contact | Old Route Usage | Status | Last Contact |
| ------ | ------- | --------------- | ------ | ------------ |
|        |         |                 |        |              |
|        |         |                 |        |              |
|        |         |                 |        |              |

### Monitoring Focus

- [ ] Track deprecation header delivery rate
- [ ] Monitor client migration progress
- [ ] Identify stragglers
- [ ] Reach out to heavy old-route users

---

## Week 4: Prepare for Old Route Sunset

### Pre-Sunset Validation

- [ ] All critical clients migrated
- [ ] Old route usage < 5% of total traffic
- [ ] No critical systems depend on old routes
- [ ] Rollback plan tested
- [ ] Communication sent (1 week notice)

### Final Client Check

- [ ] Review client migration status
- [ ] Contact any remaining heavy users
- [ ] Provide migration support as needed
- [ ] Document any clients unable to migrate

### Sunset Day Preparation

- [ ] Schedule maintenance window (if needed)
- [ ] Prepare monitoring dashboard
- [ ] Assign on-call engineer
- [ ] Set up war room / incident channel
- [ ] Test rollback procedure

---

## Sunset Day: Disable Old Routes

### Pre-Sunset Checklist

- [ ] Current old route usage: \_\_\_\_%
- [ ] All critical clients confirmed migrated
- [ ] Rollback plan ready
- [ ] Team on standby

### Feature Flag Change

```bash
# Disable old routes
kubectl set env deployment/api-server ENABLE_OLD_ROUTES=false
# ENABLE_NEW_ROUTES remains true
```

- [ ] Flag change confirmed
- [ ] Health check passes
- [ ] Route aliasing plugin disabled

### Immediate Monitoring (First 30 Minutes)

Monitor every 5 minutes:

| Time | 404 Rate | Error Rate | P95 Latency | Incidents |
| ---- | -------- | ---------- | ----------- | --------- |
| +5m  |          |            |             |           |
| +10m |          |            |             |           |
| +15m |          |            |             |           |
| +30m |          |            |             |           |

**Expected**: Small spike in 404s (clients not migrated), then stabilization

### Decision Points

**If 404 rate > 1%**:

- [ ] Identify source of 404s
- [ ] Determine if critical clients affected
- [ ] Decide: Continue or rollback

**If error rate > 0.5%**:

- [ ] Investigate root cause
- [ ] Check if related to route change
- [ ] Decide: Continue or rollback

### Extended Monitoring (First 24 Hours)

- [ ] Hour 1: Monitor closely
- [ ] Hour 6: Check for delayed issues
- [ ] Hour 12: Nighttime traffic review
- [ ] Hour 24: Full day review

**24-Hour Summary**:

- Total 404s: **\_** (expected from unmigrated clients)
- Error rate: \_\_\_\_%
- Performance impact: \_\_\_\_%
- Incidents: **\_**

**Decision**: ✅ Success / ⚠️ Issues but manageable / ❌ Rollback needed

---

## Week 5-6: Code Cleanup

### Pre-Cleanup Validation

- [ ] Old routes disabled for 1+ week
- [ ] No incidents related to migration
- [ ] All metrics stable
- [ ] Client migration > 95%

### Code Removal Plan

- [ ] Old code directories identified
- [ ] Route aliasing plugin identified
- [ ] Dependencies mapped
- [ ] Tests updated

### Code Removal Execution

- [ ] Delete old module directories
- [ ] Remove route aliasing plugin
- [ ] Clean up plugin loader
- [ ] Update documentation
- [ ] Deploy cleanup changes

### Post-Cleanup Validation

- [ ] Build succeeds
- [ ] Tests pass
- [ ] Deployment successful
- [ ] Functionality unchanged
- [ ] Bundle size reduced (if applicable)

---

## Ongoing Monitoring

### Weekly Reviews (First Month)

- [ ] Week 5: Review metrics, document final state
- [ ] Week 6: Ensure stability maintained
- [ ] Week 7: Confirm no regressions
- [ ] Week 8: Final migration report

### Monthly Reviews (Next 3 Months)

- [ ] Month 2: Long-term stability check
- [ ] Month 3: Performance trend analysis
- [ ] Month 4: Final closeout, lessons learned

---

## Incident Response Checklist

### If Error Rate Spikes

1. [ ] Check error logs for patterns
2. [ ] Identify which routes are failing
3. [ ] Determine if old or new routes affected
4. [ ] Check recent deployments
5. [ ] Verify feature flag state
6. [ ] Test manually with curl
7. [ ] Decide: Fix forward or rollback

### If Performance Degrades

1. [ ] Compare current vs baseline metrics
2. [ ] Check resource utilization
3. [ ] Review slow query logs
4. [ ] Check for external dependencies
5. [ ] Analyze redirect overhead trend
6. [ ] Decide: Optimize or rollback

### If Redirects Fail

1. [ ] Verify plugin is loaded
2. [ ] Check route alias mappings
3. [ ] Test redirect manually
4. [ ] Review plugin logs
5. [ ] Verify feature flag configuration
6. [ ] Decide: Fix or disable new routes

---

## Key Performance Indicators (KPIs)

### Migration Success Metrics

| Metric                  | Target | Actual     | Status |
| ----------------------- | ------ | ---------- | ------ |
| Client migration rate   | > 95%  | \_\_\_%    | ✅ ❌  |
| Redirect overhead (P95) | < 5ms  | \_\_\_ms   | ✅ ❌  |
| Error rate increase     | < 0.1% | \_\_\_%    | ✅ ❌  |
| Latency increase (P95)  | < 5%   | \_\_\_%    | ✅ ❌  |
| Incidents               | 0      | \_\_\_     | ✅ ❌  |
| Downtime                | 0 min  | \_\_\_ min | ✅ ❌  |

### Business Impact Metrics

| Metric             | Pre-Migration  | Post-Migration   | Change  |
| ------------------ | -------------- | ---------------- | ------- |
| API Requests/day   | ******\_****** | ******\_\_****** | \_\_\_% |
| Active API clients | ******\_****** | ******\_\_****** | \_\_\_% |
| Support tickets    | ******\_****** | ******\_\_****** | \_\_\_% |

---

## Tools & Dashboards

### Monitoring Tools

- **Prometheus**: https://prometheus.example.com
- **Grafana Dashboard**: https://grafana.example.com/d/route-aliasing
- **Logs (Kibana)**: https://logs.example.com
- **APM**: https://apm.example.com

### Useful Queries

#### Prometheus Queries

```promql
# Current redirect rate
rate(http_requests_total{status="307"}[5m])

# Redirect overhead (P95)
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{path=~"/api/(?!v1).*"}[5m])
)
-
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{path=~"/api/v1/.*"}[5m])
)

# Error rate by route type
sum(rate(http_requests_total{status=~"5.."}[5m])) by (path)
```

#### Log Queries (Kibana)

```
# All redirects
msg:"Route redirect"

# Slow redirects
msg:"Route redirect" AND duration:>5

# Failed redirects
level:error AND msg:"Route redirect"
```

---

## Sign-off Template

### Phase Completion Sign-off

**Phase**: [Initial Deployment / Enable New Routes / Deprecation / Sunset / Cleanup]

**Date**: ******\_******

**Metrics Summary**:

- Request rate: **\_** req/s
- Error rate: \_\_\_\_%
- P95 latency: **\_**ms
- Redirect overhead: **\_**ms

**Issues Encountered**: **************\_\_\_**************

**Resolution**: **************\_\_\_**************

**Decision**: ✅ Proceed to next phase / ⏸️ Pause for investigation / ❌ Rollback

**Signatures**:

- DevOps Engineer: ********\_\_\_********
- QA Lead: ********\_\_\_********
- Engineering Manager: ********\_\_\_********

---

## Appendix: Monitoring Commands

### Quick Health Check

```bash
#!/bin/bash
# health-check.sh

echo "=== Feature Flags ==="
kubectl get deployment api-server -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="ENABLE_NEW_ROUTES")].value}'
kubectl get deployment api-server -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="ENABLE_OLD_ROUTES")].value}'

echo -e "\n=== Request Rate (last 5m) ==="
curl -s 'http://prometheus:9090/api/v1/query?query=rate(http_requests_total[5m])' | jq

echo -e "\n=== Error Rate (last 5m) ==="
curl -s 'http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~"5.."}[5m])' | jq

echo -e "\n=== P95 Latency ==="
curl -s 'http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(http_request_duration_seconds_bucket[5m]))' | jq
```

### Redirect Metrics

```bash
#!/bin/bash
# redirect-metrics.sh

echo "=== Top Redirected Routes ==="
curl -s 'http://prometheus:9090/api/v1/query?query=topk(10,sum(rate(http_requests_total{status="307"}[1h]))by(path))' \
  | jq -r '.data.result[] | "\(.metric.path): \(.value[1])"'

echo -e "\n=== Redirect Overhead ==="
# Would need to calculate from two queries - see monitoring procedures doc
```

---

## Document History

| Version | Date       | Author      | Changes          |
| ------- | ---------- | ----------- | ---------------- |
| 1.0     | 2025-12-14 | DevOps Team | Initial creation |

---

**Related Documents**:

- [Staging QA Procedures](./staging-qa-procedures.md)
- [Migration Guide](../06-migration-guide.md)
- [URL Routing Specification](../04-url-routing-specification.md)
