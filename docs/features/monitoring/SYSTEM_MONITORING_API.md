# System Monitoring API Reference

> **Last Updated:** 2025-10-31 (Session 54)
> **Status:** ✅ Production Ready - Fixed API Structure Alignment

## Overview

This document provides complete API documentation for the System Monitoring endpoints. These endpoints provide real-time system metrics including CPU usage, memory consumption, database connection pools, and Redis cache statistics.

## Base URL

```
Production: https://api.aegisx.com
Development: http://localhost:3333
```

## Authentication

All monitoring endpoints are publicly accessible (no authentication required) for development purposes. In production, these should be restricted to admin users only.

```http
Authorization: Bearer <admin_jwt_token>
```

## Standard Response Format

All endpoints follow the standardized API response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## Endpoints

### 1. Get System Metrics

Retrieve current system metrics including CPU usage, memory consumption, and process statistics.

```http
GET /api/monitoring/system-metrics
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "cpu": {
      "usage": 140.9,
      "cores": 8,
      "loadAverage": [2.5, 2.3, 2.1]
    },
    "memory": {
      "total": 17179869184,
      "used": 16956342272,
      "free": 223526912,
      "usagePercent": 98.7
    },
    "process": {
      "memoryUsage": 45678901,
      "uptime": 12345,
      "pid": 47414
    },
    "timestamp": "2025-10-31T09:37:47.888Z"
  }
}
```

#### Response Fields

| Field                 | Type     | Description                                                   |
| --------------------- | -------- | ------------------------------------------------------------- |
| `cpu.usage`           | number   | CPU usage percentage (can exceed 100% for multi-core systems) |
| `cpu.cores`           | number   | Number of CPU cores available                                 |
| `cpu.loadAverage`     | number[] | System load average for 1, 5, and 15 minutes                  |
| `memory.total`        | number   | Total system memory in bytes                                  |
| `memory.used`         | number   | Used system memory in bytes                                   |
| `memory.free`         | number   | Free system memory in bytes                                   |
| `memory.usagePercent` | number   | Memory usage as percentage                                    |
| `process.memoryUsage` | number   | Process heap memory usage in bytes                            |
| `process.uptime`      | number   | Process uptime in seconds                                     |
| `process.pid`         | number   | Process ID                                                    |
| `timestamp`           | string   | ISO 8601 timestamp of when metrics were collected             |

#### Example Usage

```bash
curl -X GET http://localhost:3333/api/monitoring/system-metrics
```

```typescript
// TypeScript/JavaScript
const response = await fetch('http://localhost:3333/api/monitoring/system-metrics');
const { data } = await response.json();

console.log(`CPU Usage: ${data.cpu.usage.toFixed(1)}%`);
console.log(`Memory Usage: ${data.memory.usagePercent.toFixed(1)}%`);
```

---

### 2. Get Database Pool Status

**✨ Updated in Session 54:** Response structure changed to nested format for better type safety.

Retrieve current database connection pool statistics.

```http
GET /api/monitoring/database-pool
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "pool": {
      "total": 10,
      "active": 0,
      "idle": 1
    },
    "queries": {
      "total": 0,
      "slow": 0
    },
    "timestamp": "2025-10-31T09:37:47.888Z"
  }
}
```

#### Response Fields

| Field           | Type   | Description                                           |
| --------------- | ------ | ----------------------------------------------------- |
| `pool.total`    | number | Maximum number of connections in the pool             |
| `pool.active`   | number | Number of currently active connections                |
| `pool.idle`     | number | Number of idle connections available                  |
| `queries.total` | number | Total queries executed (not yet implemented)          |
| `queries.slow`  | number | Number of slow queries detected (not yet implemented) |
| `timestamp`     | string | ISO 8601 timestamp                                    |

#### TypeScript Interface

```typescript
interface DatabasePoolResponse {
  pool: {
    total: number;
    active: number;
    idle: number;
  };
  queries: {
    total: number;
    slow: number;
  };
  timestamp: string;
}
```

#### Example Usage

```bash
curl -X GET http://localhost:3333/api/monitoring/database-pool
```

```typescript
// TypeScript/JavaScript
const response = await fetch('http://localhost:3333/api/monitoring/database-pool');
const { data } = await response.json();

console.log(`DB Connections: ${data.pool.active}/${data.pool.total}`);
console.log(`Idle Connections: ${data.pool.idle}`);
```

#### 📝 Migration Note (Session 54)

**Before (Flat Structure):**

```json
{
  "total": 10,
  "active": 0,
  "idle": 1,
  "waiting": 0
}
```

**After (Nested Structure):**

```json
{
  "pool": {
    "total": 10,
    "active": 0,
    "idle": 1
  },
  "queries": {
    "total": 0,
    "slow": 0
  }
}
```

---

### 3. Get Cache Statistics

**✨ Updated in Session 54:** Response structure changed to nested format for better type safety.

Retrieve Redis cache hit rates, memory usage, and performance statistics.

```http
GET /api/monitoring/cache-stats
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "cache": {
      "hits": 76,
      "misses": 30,
      "hitRate": 71.69811320754717,
      "keys": 4,
      "memory": 1231448
    },
    "timestamp": "2025-10-31T09:37:57.041Z"
  }
}
```

#### Response Fields

| Field           | Type   | Description                       |
| --------------- | ------ | --------------------------------- |
| `cache.hits`    | number | Number of cache hits              |
| `cache.misses`  | number | Number of cache misses            |
| `cache.hitRate` | number | Cache hit rate percentage (0-100) |
| `cache.keys`    | number | Total number of keys in cache     |
| `cache.memory`  | number | Memory used by Redis in bytes     |
| `timestamp`     | string | ISO 8601 timestamp                |

#### TypeScript Interface

```typescript
interface CacheStatsResponse {
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    keys: number;
    memory: number;
  };
  timestamp: string;
}
```

#### Example Usage

```bash
curl -X GET http://localhost:3333/api/monitoring/cache-stats
```

```typescript
// TypeScript/JavaScript
const response = await fetch('http://localhost:3333/api/monitoring/cache-stats');
const { data } = await response.json();

console.log(`Cache Hit Rate: ${data.cache.hitRate.toFixed(1)}%`);
console.log(`Total Keys: ${data.cache.keys}`);
console.log(`Memory: ${(data.cache.memory / 1024 / 1024).toFixed(2)} MB`);
```

#### 📝 Migration Note (Session 54)

**Before (Flat Structure):**

```json
{
  "hits": 76,
  "misses": 30,
  "hitRate": 71.7,
  "keys": 4,
  "memory": 1231448
}
```

**After (Nested Structure):**

```json
{
  "cache": {
    "hits": 76,
    "misses": 30,
    "hitRate": 71.7,
    "keys": 4,
    "memory": 1231448
  }
}
```

---

### 4. Get Active Sessions

Retrieve current active user sessions count.

```http
GET /api/monitoring/active-sessions
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "total": 5,
    "users": 3,
    "sessions": [
      {
        "userId": "user-123",
        "lastActivity": "2025-10-31T09:30:00.000Z"
      }
    ],
    "timestamp": "2025-10-31T09:37:57.041Z"
  }
}
```

#### Response Fields

| Field                     | Type   | Description                                           |
| ------------------------- | ------ | ----------------------------------------------------- |
| `total`                   | number | Total number of active sessions                       |
| `users`                   | number | Number of unique users with active sessions           |
| `sessions`                | array  | Array of session objects (limited to 100 most recent) |
| `sessions[].userId`       | string | User ID for the session                               |
| `sessions[].lastActivity` | string | ISO 8601 timestamp of last activity                   |
| `timestamp`               | string | ISO 8601 timestamp                                    |

---

### 5. Get Request Metrics

Retrieve request counts and average response times by endpoint.

```http
GET /api/monitoring/request-metrics
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "totalRequests": 15432,
    "byEndpoint": [
      {
        "endpoint": "/api/users",
        "count": 5234,
        "avgResponseTime": 42.3
      },
      {
        "endpoint": "/api/auth/login",
        "count": 823,
        "avgResponseTime": 125.7
      }
    ],
    "timestamp": "2025-10-31T09:37:57.041Z"
  }
}
```

---

## Error Responses

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "METRICS_ERROR",
    "message": "Failed to get system metrics"
  }
}
```

---

## Complete Example: Monitoring Dashboard

Here's a complete example of fetching all monitoring data for a dashboard:

```typescript
interface MonitoringData {
  system: SystemMetrics;
  database: DatabasePoolResponse;
  cache: CacheStatsResponse;
  sessions: ActiveSessionsResponse;
  requests: RequestMetricsResponse;
}

async function fetchMonitoringData(): Promise<MonitoringData> {
  const baseUrl = 'http://localhost:3333/api/monitoring';

  const [system, database, cache, sessions, requests] = await Promise.all([fetch(`${baseUrl}/system-metrics`).then((r) => r.json()), fetch(`${baseUrl}/database-pool`).then((r) => r.json()), fetch(`${baseUrl}/cache-stats`).then((r) => r.json()), fetch(`${baseUrl}/active-sessions`).then((r) => r.json()), fetch(`${baseUrl}/request-metrics`).then((r) => r.json())]);

  return {
    system: system.data,
    database: database.data,
    cache: cache.data,
    sessions: sessions.data,
    requests: requests.data,
  };
}

// Usage
const monitoring = await fetchMonitoringData();

// Display metrics
console.log('=== System Monitoring Dashboard ===');
console.log(`CPU: ${monitoring.system.cpu.usage.toFixed(1)}%`);
console.log(`Memory: ${monitoring.system.memory.usagePercent.toFixed(1)}%`);
console.log(`DB Connections: ${monitoring.database.pool.active}/${monitoring.database.pool.total}`);
console.log(`Cache Hit Rate: ${monitoring.cache.cache.hitRate.toFixed(1)}%`);
console.log(`Active Sessions: ${monitoring.sessions.total}`);
console.log(`Total Requests: ${monitoring.requests.totalRequests}`);
```

---

## Frontend Integration (Angular)

### Service Implementation

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/monitoring';

  getDatabaseStats(): Observable<DatabasePoolResponse> {
    return this.http.get<{ success: true; data: DatabasePoolResponse }>(`${this.baseUrl}/database-pool`).pipe(map((response) => response.data));
  }

  getCacheStats(): Observable<CacheStatsResponse> {
    return this.http.get<{ success: true; data: CacheStatsResponse }>(`${this.baseUrl}/cache-stats`).pipe(map((response) => response.data));
  }
}
```

### Component Usage

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { MonitoringService } from './monitoring.service';

@Component({
  selector: 'app-system-monitoring',
  template: `
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>DB Connections</h3>
        <p>{{ dbStats()?.pool.active }}/{{ dbStats()?.pool.total }}</p>
      </div>
      <div class="metric-card">
        <h3>Cache Hit Rate</h3>
        <p>{{ cacheStats()?.cache.hitRate.toFixed(1) }}%</p>
      </div>
    </div>
  `,
})
export class SystemMonitoringComponent implements OnInit {
  dbStats = signal<DatabasePoolResponse | null>(null);
  cacheStats = signal<CacheStatsResponse | null>(null);

  constructor(private monitoring: MonitoringService) {}

  ngOnInit() {
    this.loadMetrics();
  }

  private loadMetrics() {
    this.monitoring.getDatabaseStats().subscribe((data) => {
      this.dbStats.set(data);
    });

    this.monitoring.getCacheStats().subscribe((data) => {
      this.cacheStats.set(data);
    });
  }
}
```

---

## Technical Notes

### Session 54 Fix (2025-10-31)

**Problem:** The 4 metric cards on the System Monitoring dashboard were not displaying because the API response structure didn't match the frontend TypeScript interfaces.

**Root Cause:**

- Frontend expected nested structures: `db.pool.active`, `redis.cache.hitRate`
- API was returning flat structures: `{ total, active, idle }` at the top level
- This caused Angular computed signals to return undefined values

**Solution:**

1. Updated `/database-pool` endpoint to return nested structure with `pool` and `queries` objects
2. Updated `/cache-stats` endpoint to return nested structure with `cache` object
3. Updated OpenAPI response schemas to match new structure

**Impact:**

- ✅ All 4 metric cards now display correctly with real-time data
- ✅ Better type safety across frontend-backend boundary
- ✅ OpenAPI documentation accurately reflects response structure

### Best Practices

1. **Type Safety**: Always ensure API response structures match TypeScript interfaces
2. **Nested Structures**: Use nested objects for better organization and type inference
3. **OpenAPI Schemas**: Keep schemas synchronized with actual response structures
4. **Error Handling**: Handle missing data gracefully in frontend components

---

**Last Updated:** Session 54 (2025-10-31)
**File:** `apps/api/src/core/monitoring/monitoring.routes.ts`
**Lines Modified:**

- `/database-pool` endpoint (522-533)
- `/cache-stats` endpoint (631-640)
- OpenAPI schemas (494-527, 562-590)
