# System - Developer Guide

> **Technical implementation guide for developers**

**Last Updated:** 2025-10-31
**Version:** 1.0.0

---

## Quick Start for Developers

```bash
# Location
cd apps/api/src/core/system/

# Run tests
pnpm test default.service.spec
pnpm test default.controller.spec
pnpm test default.integration.spec

# Test health endpoint
curl http://localhost:3333/api/health
```

---

## Architecture Overview

### File Structure

\`\`\`
apps/api/src/core/system/
├── default.controller.ts    # 5 endpoints
├── default.service.ts        # Health check logic
├── default.routes.ts         # 7 routes
├── default.schemas.ts        # TypeBox schemas
├── default.plugin.ts         # Fastify plugin
├── test-websocket.routes.ts  # Test endpoints
└── __tests__/
    ├── default.service.spec.ts
    ├── default.controller.spec.ts
    └── default.integration.spec.ts
\`\`\`

### Key Components

**DefaultService** - Core business logic
- Database connectivity check
- Redis connectivity check  
- Memory usage calculation
- Health status determination

**DefaultController** - Request handlers
- getApiInfo, getSystemStatus, getHealthStatus
- getPing, getWelcome

**DefaultRoutes** - Route registration
- Public endpoints (no auth)
- Demo endpoints (API key/JWT)
- Test endpoints (dev only)

---

## Health Check Logic

### Status Determination Algorithm

\`\`\`typescript
function determineOverallStatus(): 'healthy' | 'degraded' | 'unhealthy' {
  // 1. Database check (CRITICAL)
  if (database.status === 'error' || database.status === 'disconnected') {
    return 'unhealthy'; // ❌ Critical failure
  }

  // 2. Memory check
  if (memory.percentage > 90) {
    return 'degraded'; // ⚠️ High memory
  }

  // 3. Redis check (if configured)
  if (redis && (redis.status === 'error' || redis.status === 'disconnected')) {
    return 'degraded'; // ⚠️ Cache unavailable
  }

  // 4. Database performance check
  if (database.responseTime > 1000) {
    return 'degraded'; // ⚠️ Slow database
  }

  return 'healthy'; // ✅ All good
}
\`\`\`

### Response Time Measurement

\`\`\`typescript
async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    await this.knex.raw('SELECT 1'); // Simple query
    const responseTime = Date.now() - startTime;
    
    return { status: 'connected', responseTime };
  } catch (error) {
    return { status: 'error' };
  }
}
\`\`\`

---

## Adding New Health Checks

### Step 1: Add Service Check Method

\`\`\`typescript
// In default.service.ts
private async checkExternalAPI(): Promise<ServiceStatus> {
  try {
    const startTime = Date.now();
    await fetch('https://api.external.com/health');
    const responseTime = Date.now() - startTime;
    
    return { status: 'connected', responseTime };
  } catch (error) {
    return { status: 'error' };
  }
}
\`\`\`

### Step 2: Integrate into getSystemStatus

\`\`\`typescript
async getSystemStatus(): Promise<SystemStatus> {
  const databaseStatus = await this.checkDatabase();
  const redisStatus = await this.checkRedis();
  const externalAPIStatus = await this.checkExternalAPI(); // NEW
  
  return {
    status: this.determineOverallStatus(
      databaseStatus, 
      redisStatus, 
      externalAPIStatus // NEW
    ),
    services: {
      database: databaseStatus,
      redis: redisStatus,
      externalAPI: externalAPIStatus // NEW
    },
    // ...
  };
}
\`\`\`

### Step 3: Update Schema

\`\`\`typescript
// In default.schemas.ts
export const SystemStatusSchema = Type.Object({
  services: Type.Object({
    database: ServiceStatusSchema,
    redis: Type.Optional(ServiceStatusSchema),
    externalAPI: Type.Optional(ServiceStatusSchema), // NEW
  }),
  // ...
});
\`\`\`

### Step 4: Add Tests

\`\`\`typescript
// In __tests__/default.service.spec.ts
describe('checkExternalAPI', () => {
  it('should return connected when API is reachable', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    
    const result = await service.checkExternalAPI();
    expect(result.status).toBe('connected');
  });
});
\`\`\`

---

## Testing Guide

### Unit Tests

\`\`\`bash
# Run service tests
pnpm test default.service.spec.ts

# Run controller tests
pnpm test default.controller.spec.ts

# Watch mode
pnpm test:watch default.service
\`\`\`

### Integration Tests

\`\`\`bash
# Run integration tests
pnpm test default.integration.spec.ts

# Run with coverage
pnpm test:cov system
\`\`\`

### Test Structure

\`\`\`typescript
describe('DefaultService', () => {
  beforeEach(() => {
    // Setup mocks
  });

  describe('getSystemStatus', () => {
    it('should return healthy when all services ok', async () => {
      // Arrange
      mockKnex.raw.mockResolvedValue({});
      
      // Act
      const result = await service.getSystemStatus();
      
      // Assert
      expect(result.status).toBe('healthy');
    });
  });
});
\`\`\`

---

## Best Practices

### 1. Keep Health Checks Fast
- Target: <100ms for most checks
- Use simple queries (SELECT 1)
- Avoid complex calculations

### 2. Graceful Degradation
- Never fail hard on optional dependencies
- Check if service exists before using

\`\`\`typescript
const redisStatus = this.fastify?.redis 
  ? await this.checkRedis() 
  : undefined; // Graceful
\`\`\`

### 3. Proper Error Handling
- Catch all errors in check methods
- Return error status, don't throw

\`\`\`typescript
try {
  await checkSomething();
  return { status: 'connected' };
} catch (error) {
  return { status: 'error' }; // Don't throw
}
\`\`\`

### 4. Response Time Tracking
- Always measure critical operations
- Include in status responses

---

## Common Tasks

### Update API Version

\`\`\`typescript
// In default.service.ts and default.controller.ts
version: '1.1.0' // Update here
\`\`\`

### Add New Endpoint

1. Define schema in `default.schemas.ts`
2. Add controller method in `default.controller.ts`
3. Register route in `default.routes.ts`
4. Add tests

### Modify Health Logic

1. Update `determineOverallStatus()` in service
2. Update tests to cover new logic
3. Document changes in ARCHITECTURE.md

---

## Debugging

### Enable Debug Logging

\`\`\`typescript
// In default.service.ts
console.log('Health check:', {
  database: databaseStatus,
  redis: redisStatus,
  memory: memoryStatus
});
\`\`\`

### Test Health Check Manually

\`\`\`bash
# Check database connectivity
curl http://localhost:3333/api/status | jq '.data.services.database'

# Monitor memory
watch -n 1 'curl -s http://localhost:3333/api/status | jq .data.memory'
\`\`\`

---

## Performance Tips

1. **Cache repeated checks** - Don't check same service twice
2. **Parallel checks** - Use Promise.all for independent checks
3. **Timeout protection** - Add timeouts to external calls
4. **Minimal overhead** - Keep ping endpoint ultra-fast

---

**See Also:**
- [API Reference](./API_REFERENCE.md)
- [Architecture](./ARCHITECTURE.md)
- [Testing Strategy](../../../docs/testing/testing-strategy.md)

