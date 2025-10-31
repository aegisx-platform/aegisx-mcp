# System - Architecture

> **Deep dive into system design, technical decisions, and health check architecture**

**Last Updated:** 2025-10-31
**Version:** 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Design](#system-design)
- [Health Check Architecture](#health-check-architecture)
- [Component Breakdown](#component-breakdown)
- [Data Flow](#data-flow)
- [Technical Decisions](#technical-decisions)
- [Design Patterns](#design-patterns)
- [Performance Considerations](#performance-considerations)
- [Security Model](#security-model)
- [Extensibility](#extensibility)

---

## Overview

The System module is an **infrastructure module** providing foundational health monitoring, API information, and connectivity testing endpoints. Unlike feature modules, it has:

- **No database tables** - Uses existing connections for health checks only
- **No frontend** - Backend-only infrastructure
- **Public endpoints** - No authentication required (except demo endpoints)
- **Minimal overhead** - Fast, lightweight operations

### Design Goals

1. **Fast Response Times** - Target <100ms for most checks
2. **Reliable Monitoring** - Never fail due to optional dependencies
3. **Informative Errors** - Provide actionable debugging information
4. **Load Balancer Compatible** - Standard health check patterns
5. **Kubernetes Ready** - Liveness and readiness probe support

---

## System Design

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│              (Nginx, AWS ALB, Kubernetes)               │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Fastify Routes Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ /api/health │  │ /api/status │  │  /api/info  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────┘
          │                │                │
          ↓                ↓                ↓
┌─────────────────────────────────────────────────────────┐
│              DefaultController Layer                     │
│  - Request validation                                    │
│  - Response formatting                                   │
│  - Error handling                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              DefaultService Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Database   │  │    Redis     │  │    Memory    │  │
│  │    Check     │  │    Check     │  │    Check     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │
          ↓                  ↓                  ↓
┌─────────────────────────────────────────────────────────┐
│              External Dependencies                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │  Redis Cache │  │  Node.js VM  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Module Structure

```
apps/api/src/core/system/
├── default.controller.ts    # Request handlers (84 lines)
├── default.service.ts        # Business logic (209 lines)
├── default.routes.ts         # Route registration (280 lines)
├── default.schemas.ts        # TypeBox validation (203 lines)
├── default.plugin.ts         # Fastify plugin (56 lines)
├── test-websocket.routes.ts  # Test endpoints (dev only)
└── __tests__/
    ├── default.service.spec.ts       # 24 unit tests
    ├── default.controller.spec.ts    # 17 unit tests
    └── default.integration.spec.ts   # 25 integration tests
```

**Total:** 832 lines of code + 66 tests

---

## Health Check Architecture

### Three-Tier Health Model

The System module implements a sophisticated three-tier health determination model:

#### 1. Service Status (Individual Checks)

```typescript
type ServiceStatus = {
  status: 'connected' | 'disconnected' | 'error';
  responseTime?: number;
  message?: string;
};
```

**Purpose:** Track individual dependency health
**Example:** Database check, Redis check

#### 2. Overall Status (Aggregated)

```typescript
type OverallStatus = 'healthy' | 'degraded' | 'unhealthy';
```

**Purpose:** Determine system-wide health based on critical dependencies
**Logic:**
- **Unhealthy** = Critical failure (database down)
- **Degraded** = Operational with issues (high memory, Redis down, slow DB)
- **Healthy** = All systems nominal

#### 3. Simple Health (External)

```typescript
type SimpleHealth = 'ok' | 'error';
```

**Purpose:** Fast load balancer checks (binary up/down)
**Logic:** Map `unhealthy` → `error`, everything else → `ok`

### Status Determination Flow

```
┌──────────────────────────────────────────────────────────┐
│              Check All Dependencies                       │
└────────────────┬─────────────────────────────────────────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
   ┌─────────┐ ┌────────┐ ┌────────┐
   │Database │ │ Redis  │ │ Memory │
   │  Check  │ │ Check  │ │ Check  │
   └────┬────┘ └────┬───┘ └────┬───┘
        │           │          │
        └───────────┼──────────┘
                    ↓
        ┌───────────────────────┐
        │ Determine Overall     │
        │ Status (Priority)     │
        └───────────┬───────────┘
                    │
     ┌──────────────┼──────────────┐
     ↓              ↓              ↓
┌─────────┐   ┌──────────┐   ┌─────────┐
│Database │   │  Memory  │   │  Redis  │
│ ERROR?  │   │  > 90%?  │   │ ERROR?  │
└────┬────┘   └─────┬────┘   └────┬────┘
     │              │              │
     ↓ Yes          ↓ Yes          ↓ Yes
 UNHEALTHY      DEGRADED       DEGRADED
     │              │              │
     └──────────────┼──────────────┘
                    ↓
     ┌──────────────────────────┐
     │ Database > 1000ms?       │
     └──────────┬───────────────┘
                ↓ Yes
            DEGRADED
                │
                ↓ No
             HEALTHY
```

### Priority Ranking

Health checks are evaluated in priority order:

1. **🔴 CRITICAL**: Database connectivity (unhealthy if down)
2. **🟡 HIGH**: Memory usage (degraded if >90%)
3. **🟡 MEDIUM**: Redis connectivity (degraded if down)
4. **🟡 LOW**: Database performance (degraded if >1s)

---

## Component Breakdown

### DefaultService (Business Logic)

**Responsibilities:**
- Perform health checks
- Calculate memory usage
- Determine overall status
- Measure response times

**Key Methods:**

```typescript
class DefaultService {
  // Public API
  getApiInfo(): Promise<ApiInfo>
  getSystemStatus(): Promise<SystemStatus>
  getHealthStatus(): Promise<HealthStatus>
  
  // Health Checks
  private checkDatabase(): Promise<ServiceStatus>
  private checkRedis(): Promise<ServiceStatus>
  private getMemoryStatus(): MemoryStatus
  
  // Status Logic
  private determineOverallStatus(
    databaseStatus: ServiceStatus,
    redisStatus: ServiceStatus | undefined,
    memory: MemoryStatus
  ): 'healthy' | 'degraded' | 'unhealthy'
}
```

**Design Patterns:**
- **Dependency Injection**: Fastify instance injected
- **Optional Dependencies**: Redis check gracefully skipped if not configured
- **Error Isolation**: Each check catches its own errors

### DefaultController (Request Handlers)

**Responsibilities:**
- Validate requests
- Call service methods
- Format responses
- Handle errors

**Key Methods:**

```typescript
class DefaultController {
  getApiInfo(request, reply): Promise<void>
  getSystemStatus(request, reply): Promise<void>
  getHealthStatus(request, reply): Promise<void>
  getPing(request, reply): Promise<void>
  getWelcome(request, reply): Promise<void>
}
```

**Error Handling:**
- Try-catch around all service calls
- Standardized error responses via reply.error()
- Proper HTTP status codes

### DefaultRoutes (Route Registration)

**Responsibilities:**
- Register routes with Fastify
- Attach schemas for validation
- Configure authentication (demo endpoints)
- Protect test endpoints

**Route Categories:**

```typescript
// Public routes (no auth)
GET /api/health       → getHealthStatus
GET /api/status       → getSystemStatus
GET /api/info         → getApiInfo
GET /api/ping         → getPing
GET /                 → getWelcome

// Demo routes (API key or JWT)
GET /api/protected-data     → protected (API key only)
GET /api/hybrid-protected   → protected (API key OR JWT)

// Test routes (dev only)
GET /test/websocket/emit    → blocked in production
GET /test/rbac/role         → blocked in production
```

---

## Data Flow

### Health Check Request Flow

```
1. Load Balancer Request
   GET /api/health
         ↓
2. Fastify Route Matching
   /api/health → handler
         ↓
3. Schema Validation
   (no params, no body)
         ↓
4. Controller.getHealthStatus()
         ↓
5. Service.getHealthStatus()
   ├─→ Service.getSystemStatus()
   │   ├─→ checkDatabase()
   │   │   └─→ knex.raw('SELECT 1')
   │   ├─→ checkRedis()
   │   │   └─→ redis.ping()
   │   └─→ getMemoryStatus()
   │       └─→ process.memoryUsage()
   └─→ determineOverallStatus()
         ↓
6. Map to SimpleHealth
   unhealthy → 'error'
   * → 'ok'
         ↓
7. Controller Response
   reply.success(data, message)
         ↓
8. Response Handler Plugin
   Format standard response
         ↓
9. HTTP Response
   200 OK + JSON body
```

**Performance:**
- No database queries (SELECT 1 is minimal overhead)
- Redis ping is microseconds
- Memory check is synchronous (no I/O)
- Total: <50ms typical

---

## Technical Decisions

### 1. Why No Database Tables?

**Decision:** System module uses existing database connection for health checks only

**Rationale:**
- Infrastructure module should not store data
- Health checks need minimal overhead
- Simplifies deployment (no migrations needed)
- Reduces attack surface (no data to leak)

### 2. Why Public Endpoints?

**Decision:** All production endpoints are public (no authentication)

**Rationale:**
- Load balancers need unauthenticated access
- Kubernetes probes cannot inject tokens
- Health data is not sensitive
- Industry standard pattern

### 3. Why Three Status Levels?

**Decision:** Implement healthy/degraded/unhealthy instead of binary up/down

**Rationale:**
- Load balancers can route away from degraded instances
- Operators can debug before critical failure
- Gradual degradation better than sudden death
- Aligns with SRE best practices

### 4. Why Measure Response Times?

**Decision:** Track and report database/Redis response times

**Rationale:**
- Early warning of performance degradation
- Helps identify slow queries
- Useful for capacity planning
- Minimal overhead (Date.now())

### 5. Why Graceful Redis Degradation?

**Decision:** System continues working if Redis is unconfigured or down

**Rationale:**
- Redis is optional dependency (caching only)
- Core functionality should not require cache
- Fail gracefully rather than crash
- Allows running without Redis in dev

---

## Design Patterns

### 1. Plugin Architecture

```typescript
export default fastifyPlugin(async function systemPlugin(fastify) {
  // Register dependencies
  await fastify.register(knexPlugin);
  await fastify.register(responseHandlerPlugin);
  
  // Instantiate service & controller
  const service = new DefaultService(fastify);
  const controller = new DefaultController(service);
  
  // Register routes
  await fastify.register(defaultRoutes, { controller });
});
```

**Benefits:**
- Clean dependency injection
- Testable components
- Reusable across apps

### 2. Service Layer Pattern

```typescript
class DefaultService {
  constructor(private fastify: FastifyInstance) {}
  
  async getSystemStatus(): Promise<SystemStatus> {
    const db = await this.checkDatabase();
    const redis = await this.checkRedis();
    const memory = this.getMemoryStatus();
    
    return {
      status: this.determineOverallStatus(db, redis, memory),
      services: { database: db, redis },
      memory,
      // ...
    };
  }
}
```

**Benefits:**
- Business logic isolated from HTTP layer
- Easy to unit test (mock Fastify)
- Reusable by other modules

### 3. Schema-First Validation

```typescript
export const HealthStatusSchema = Type.Object({
  status: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
  timestamp: Type.String({ format: 'date-time' }),
  version: Type.String(),
});

export type HealthStatus = Static<typeof HealthStatusSchema>;
```

**Benefits:**
- Runtime validation + TypeScript types
- Auto-generated OpenAPI docs
- Contract-driven development

### 4. Dependency Injection

```typescript
class DefaultController {
  constructor(private service: DefaultService) {}
  
  async getHealthStatus(req, reply) {
    const status = await this.service.getHealthStatus();
    return reply.success(status, 'API is healthy');
  }
}
```

**Benefits:**
- Testable (inject mock service)
- Loose coupling
- Easy to swap implementations

---

## Performance Considerations

### Response Time Targets

| Endpoint         | Target   | Typical | Max Acceptable |
|------------------|----------|---------|----------------|
| `/api/ping`      | <10ms    | 2-5ms   | 20ms          |
| `/api/health`    | <50ms    | 5-10ms  | 100ms         |
| `/api/info`      | <50ms    | 5-10ms  | 100ms         |
| `/api/status`    | <200ms   | 50-100ms| 500ms         |

### Optimization Strategies

#### 1. Parallel Checks

```typescript
async getSystemStatus() {
  const [db, redis, memory] = await Promise.all([
    this.checkDatabase(),
    this.checkRedis(),
    Promise.resolve(this.getMemoryStatus())
  ]);
  // ...
}
```

**Benefit:** Check database and Redis concurrently

#### 2. Minimal Queries

```typescript
await this.knex.raw('SELECT 1');
```

**Benefit:** Fastest possible database query

#### 3. Connection Reuse

```typescript
const knex = this.fastify.knex; // Reuse existing connection
```

**Benefit:** No connection overhead

#### 4. Synchronous Memory Check

```typescript
getMemoryStatus(): MemoryStatus {
  const mem = process.memoryUsage();
  return { used: mem.heapUsed, total: mem.heapTotal, ... };
}
```

**Benefit:** No async overhead

### Caching Considerations

**Current:** No caching (always fresh data)

**Future:** Could cache `/api/info` (rarely changes)

**Trade-off:** Freshness vs. performance

---

## Security Model

### Public Endpoints

**Endpoints:** `/api/health`, `/api/status`, `/api/info`, `/api/ping`, `/`

**Security Measures:**
- ✅ No sensitive data exposed
- ✅ Read-only operations
- ✅ No user-controlled input
- ⚠️ Consider rate limiting in production

### Demo Endpoints

**Endpoints:** `/api/protected-data`, `/api/hybrid-protected`

**Security Measures:**
- ✅ API key authentication required
- ✅ JWT authentication supported
- ✅ Only enabled if `ENABLE_API_KEY_DEMO=true`
- ✅ Clearly marked as demo only

### Test Endpoints

**Endpoints:** `/test/*`

**Security Measures:**
- ✅ Blocked in production (`NODE_ENV !== 'development'`)
- ✅ Automatic middleware protection
- ✅ Cannot be accidentally exposed

### Information Disclosure

**Safe to expose:**
- API version
- Uptime
- Environment name
- Endpoint list

**NEVER expose:**
- Database credentials
- Redis password
- API keys
- User data
- Internal IP addresses

---

## Extensibility

### Adding New Health Checks

**Step 1:** Add check method to service
```typescript
private async checkExternalAPI(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    await fetch('https://api.external.com/health');
    return { status: 'connected', responseTime: Date.now() - start };
  } catch {
    return { status: 'error' };
  }
}
```

**Step 2:** Integrate into getSystemStatus
```typescript
const externalAPI = await this.checkExternalAPI();
return {
  status: this.determineOverallStatus(db, redis, memory, externalAPI),
  services: { database: db, redis, externalAPI },
  // ...
};
```

**Step 3:** Update determineOverallStatus logic
```typescript
private determineOverallStatus(
  db: ServiceStatus,
  redis: ServiceStatus | undefined,
  memory: MemoryStatus,
  externalAPI?: ServiceStatus
): 'healthy' | 'degraded' | 'unhealthy' {
  // Existing logic...
  
  if (externalAPI?.status === 'error') {
    return 'degraded';
  }
  
  return 'healthy';
}
```

**Step 4:** Update schema
```typescript
export const SystemStatusSchema = Type.Object({
  services: Type.Object({
    database: ServiceStatusSchema,
    redis: Type.Optional(ServiceStatusSchema),
    externalAPI: Type.Optional(ServiceStatusSchema), // NEW
  }),
  // ...
});
```

**Step 5:** Add tests
```typescript
describe('checkExternalAPI', () => {
  it('should return connected when API is reachable', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const result = await service['checkExternalAPI']();
    expect(result.status).toBe('connected');
  });
});
```

### Future Enhancements

**Planned (v1.1.0):**
- Prometheus metrics export (`/api/metrics`)
- Alerting integration (Slack, PagerDuty)
- Settings module integration (dynamic version)

**Possible (v1.2.0):**
- Health check history and trends
- Disk space monitoring
- CPU usage monitoring
- External API connectivity checks
- Custom health check registration API

---

**See Also:**
- [Developer Guide](./DEVELOPER_GUIDE.md) - Implementation patterns
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup

