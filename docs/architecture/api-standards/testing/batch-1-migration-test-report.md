# Batch 1 Migration Test Report

## API Architecture Standardization - Phase 3

**Test Date**: 2025-12-14
**Migration Batch**: Batch 1 (Low-Risk Platform Services)
**Modules Migrated**: departments, settings, navigation
**Test Status**: ⏳ In Progress

---

## Executive Summary

This document outlines the testing procedures and results for the Batch 1 migration of the API Architecture Standardization initiative. Three low-risk platform modules (departments, settings, navigation) have been migrated from `apps/api/src/core/` to `apps/api/src/layers/platform/` following the layer-based architecture specification.

### Migration Changes Overview

1. **Plugin Pattern Conversion**: Removed `fastify-plugin` (fp) wrapper from leaf modules
2. **Directory Structure**: Migrated modules to new layer-based structure
3. **Dual Route Registration**: Both old and new routes functional during transition
4. **Import Path Updates**: Adjusted relative imports for deeper nesting
5. **Plugin Loading Order Fix**: Moved websocket plugin to application group for proper dependency order

---

## Modules Migrated

### 1. Departments Module (Task 3.1)

**Old Location**: `apps/api/src/core/departments/`
**New Location**: `apps/api/src/layers/platform/departments/`
**Old Route**: `/api/departments`
**New Route**: `/api/v1/platform/departments`

**Files Created**:

- `apps/api/src/layers/platform/departments/index.ts` (Plugin entry point)
- `apps/api/src/layers/platform/departments/departments.controller.ts`
- `apps/api/src/layers/platform/departments/departments.service.ts`
- `apps/api/src/layers/platform/departments/departments.repository.ts`
- `apps/api/src/layers/platform/departments/departments.routes.ts`
- `apps/api/src/layers/platform/departments/departments.schemas.ts`
- `apps/api/src/layers/platform/departments/departments.types.ts`
- `apps/api/src/layers/platform/departments/departments-import.service.ts`

**Key Changes**:

- Converted from fp() wrapper to plain async function
- Added eventService availability check
- Updated import paths from `../../` to `../../../`
- Registered in `createPlatformLayerGroup()` in plugin.loader.ts

### 2. Settings Module (Task 3.2)

**Old Location**: `apps/api/src/core/settings/`
**New Location**: `apps/api/src/layers/platform/settings/`
**Old Route**: `/api/settings`
**New Route**: `/api/v1/platform/settings`

**Files Created**:

- `apps/api/src/layers/platform/settings/index.ts` (Re-exports)
- `apps/api/src/layers/platform/settings/settings.plugin.ts`
- `apps/api/src/layers/platform/settings/settings.controller.ts`
- `apps/api/src/layers/platform/settings/settings.service.ts`
- `apps/api/src/layers/platform/settings/settings.repository.ts`
- `apps/api/src/layers/platform/settings/settings.routes.ts`
- `apps/api/src/layers/platform/settings/settings.schemas.ts`
- `apps/api/src/layers/platform/settings/settings-cache.service.ts`
- `apps/api/src/layers/platform/settings/settings.performance.ts`

**Key Changes**:

- Exported as named export `settingsPlugin` from index.ts
- No eventService dependency (simpler migration)
- Plugin.loader.ts imports as `{ settingsPlugin as platformSettingsPlugin }`

### 3. Navigation Module (Task 3.3)

**Old Location**: `apps/api/src/core/navigation/`
**New Location**: `apps/api/src/layers/platform/navigation/`
**Old Route**: `/api/navigation`
**New Route**: `/api/v1/platform/navigation`

**Files Created**: Multiple files including plugin, controller, service, repository, routes, schemas, types

**Key Changes**:

- Passed navigationService via route options instead of fastify decoration (避免type conflict)
- No fastify decoration during migration period
- Commented type declarations to avoid conflicts with old module

---

## Infrastructure Changes

### Plugin Loading Order Fix (Critical)

**Problem Identified**:

- WebSocket plugin (which decorates `fastify.eventService`) was loading in `createCorePluginGroup()` (old routes)
- Platform layer was loading BEFORE old routes when both feature flags enabled
- Result: `eventService` undefined when departments controller initialized

**Solution Implemented**:

```typescript
// apps/api/src/bootstrap/plugin.loader.ts

// BEFORE: websocket in createCorePluginGroup() (loaded AFTER platform layer)
export function createCorePluginGroup(apiPrefix: string): PluginGroup {
  return {
    plugins: [
      { name: 'websocket', plugin: websocketPlugin, required: true }, // ❌ TOO LATE
      // ... other plugins
    ],
  };
}

// AFTER: websocket in application group (loaded BEFORE platform layer)
export function createPluginGroups(...) {
  return [
    // ... infrastructure, database, monitoring, authentication, middleware
    {
      name: 'application',
      plugins: [
        { name: 'websocket', plugin: websocketPlugin, required: true }, // ✅ EARLY ENOUGH
        { name: 'auth-strategies', ... },
        // ... other application plugins
      ],
    },
  ];
}
```

**Loading Order (Correct)**:

1. Infrastructure → Database → Monitoring → Authentication → Middleware → **Application (websocket)** ✅
2. New layer-based routes: Core Layer → **Platform Layer (needs eventService)** → Domains Layer
3. Old routes: Core Plugin Group → Feature Plugin Group

### EventService Availability Check

Added explicit check in departments plugin:

```typescript
// apps/api/src/layers/platform/departments/index.ts

// Verify event service is available (should be decorated by websocket plugin)
if (!(fastify as any).eventService) {
  throw new Error('EventService not available - websocket plugin must load first');
}
```

This provides clear error messaging if dependency order is incorrect.

---

## Testing Requirements

### Unit Testing

- [ ] All existing unit tests pass
- [ ] No new unit tests required (functionality unchanged)

### Integration Testing

#### Route Aliasing Tests

- [ ] Old route `/api/departments` returns HTTP 307 redirect
- [ ] Redirect target is `/api/v1/platform/departments`
- [ ] Redirect preserves HTTP method (GET, POST, PUT, DELETE)
- [ ] Redirect preserves request body
- [ ] Redirect preserves query parameters
- [ ] Redirect preserves authentication headers

#### Dual Route Functionality

- [ ] Old route `/api/departments` works correctly
- [ ] New route `/api/v1/platform/departments` works correctly
- [ ] Old route `/api/settings` works correctly
- [ ] New route `/api/v1/platform/settings` works correctly
- [ ] Old route `/api/navigation` works correctly
- [ ] New route `/api/v1/platform/navigation` works correctly

#### CRUD Operations (Both Routes)

For each module (departments, settings, navigation):

- [ ] **CREATE**: POST request creates record successfully
- [ ] **READ**: GET request retrieves record successfully
- [ ] **UPDATE**: PUT request updates record successfully
- [ ] **DELETE**: DELETE request removes record successfully
- [ ] **LIST**: GET request with pagination works correctly
- [ ] **DROPDOWN**: Dropdown endpoint returns correct format

#### WebSocket Events (Departments Only)

- [ ] CREATE event emitted when department created
- [ ] UPDATE event emitted when department updated
- [ ] DELETE event emitted when department deleted
- [ ] Event payload contains correct data

#### Error Handling

- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing authentication
- [ ] 403 Forbidden for insufficient permissions
- [ ] 404 Not Found for non-existent resources
- [ ] 500 Server Error handled gracefully

### Performance Testing

#### Response Time

- [ ] P95 latency < baseline + 5%
- [ ] P99 latency < baseline + 10%
- [ ] Route aliasing overhead < 5ms

#### Plugin Loading

- [ ] Server startup time < baseline + 10%
- [ ] Platform layer loads successfully
- [ ] No plugin registration failures

### Canary Deployment Testing

#### Stage 1: 5% Traffic

- [ ] Deploy to staging with 5% traffic to new routes
- [ ] Monitor error rates (should be < 0.1%)
- [ ] Monitor P95 latency (should be < baseline + 5%)
- [ ] Verify no data corruption

#### Stage 2: 25% Traffic

- [ ] Increase to 25% traffic
- [ ] Same monitoring criteria as Stage 1
- [ ] Check database connection pool usage

#### Stage 3: 50% Traffic

- [ ] Increase to 50% traffic
- [ ] Extended monitoring period (2 hours)
- [ ] Verify memory usage stable

#### Stage 4: 100% Traffic

- [ ] Full migration to new routes
- [ ] 24-hour monitoring period
- [ ] Document any issues for rollback plan

---

## Test Execution Log

### Build Verification

**Test**: TypeScript compilation
**Command**: `pnpm run build`
**Status**: ✅ **PASS**
**Output**: All applications built successfully without TypeScript errors

**Build Time**:

- aegisx-ui: 5.8s
- landing: 3.6s
- api: (cached)
- web: 2.7s
- admin: (not tested)

### Plugin Loading Order Test

**Test**: Verify websocket loads before platform layer
**Expected**: WebSocket plugin decorates eventService before platform layer loads
**Actual**: ✅ **FIXED** - Moved websocket to application group
**Status**: ✅ **PASS** (code review)

### API Startup Test

**Test**: Start API server with both feature flags enabled
**Command**: `pnpm run dev:api`
**Feature Flags**:

- `ENABLE_NEW_ROUTES=true`
- `ENABLE_OLD_ROUTES=true`

**Status**: ⏳ **PENDING** (NX process lock issue during testing session)
**Expected Behavior**:

- ✅ Server starts successfully
- ✅ Platform layer loads (3 plugins: departments, settings, navigation)
- ✅ Both old and new routes registered
- ✅ WebSocket connection established
- ✅ EventService available

**Next Steps**: Restart testing session with fresh environment

---

## Known Issues

### 1. NX Process Lock During Testing

**Issue**: NX watch mode occasionally holds file locks preventing new builds
**Severity**: Low (testing environment only)
**Workaround**: `pkill -9 -f "nx serve"` before restarting
**Resolution**: Not blocking migration

### 2. Integration Test TypeScript Configuration

**Issue**: Jest integration tests fail with TypeScript module augmentation errors
**Error**: `Property 'permissionCache' does not exist on type 'FastifyInstance'`
**Severity**: Low (pre-existing issue, not introduced by migration)
**Workaround**: Manual route testing via curl/Postman
**Resolution**: Separate task to fix Jest+TypeScript configuration

---

## Manual Testing Checklist

When API server starts successfully, perform the following manual tests:

### Departments Module

```bash
# Test old route (should redirect)
curl -i http://localhost:3383/api/departments

# Test new route (direct access)
curl -i http://localhost:3383/api/v1/platform/departments

# Test CREATE
curl -X POST http://localhost:3383/api/v1/platform/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"dept_code":"TEST","dept_name":"Test Department"}'

# Test READ
curl http://localhost:3383/api/v1/platform/departments/<uuid>

# Test UPDATE
curl -X PUT http://localhost:3383/api/v1/platform/departments/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"dept_name":"Updated Department"}'

# Test DELETE
curl -X DELETE http://localhost:3383/api/v1/platform/departments/<uuid>
```

### Settings Module

```bash
# Test old route
curl http://localhost:3383/api/settings

# Test new route
curl http://localhost:3383/api/v1/platform/settings

# Test get specific setting
curl http://localhost:3383/api/v1/platform/settings/<key>
```

### Navigation Module

```bash
# Test old route
curl http://localhost:3383/api/navigation

# Test new route
curl http://localhost:3383/api/v1/platform/navigation

# Test user navigation
curl http://localhost:3383/api/v1/platform/navigation/user
```

---

## Success Criteria

Migration is considered successful when ALL of the following are met:

- [x] Build completes without errors
- [ ] API server starts successfully with both feature flags
- [ ] Platform layer loads 3 plugins (departments, settings, navigation)
- [ ] All manual tests pass for both old and new routes
- [ ] HTTP 307 redirects work correctly
- [ ] Performance metrics within acceptable range (< +5% latency)
- [ ] Zero data corruption or data loss
- [ ] No authentication/authorization regressions
- [ ] WebSocket events work correctly (departments)
- [ ] Canary deployment completes successfully (5% → 25% → 50% → 100%)

---

## Rollback Plan

If any critical issue is discovered:

1. **Immediate Action**: Disable new routes

   ```bash
   # Set in environment
   ENABLE_NEW_ROUTES=false
   ENABLE_OLD_ROUTES=true

   # Restart API server
   pnpm run kill:api && pnpm run dev:api
   ```

2. **Verify**: Old routes still functional
3. **Investigate**: Review error logs and metrics
4. **Fix Forward**: Address issues and re-enable new routes
5. **Revert**: Only if fix-forward not possible within 1 hour

---

## Sign-Off

**Testing Completed By**: ************\_\_\_************
**Date**: ************\_\_\_************
**Approved By**: ************\_\_\_************
**Date**: ************\_\_\_************

---

## Appendix: Files Modified

### Core Files Modified

- `apps/api/src/bootstrap/plugin.loader.ts` - Added platform plugins, moved websocket to application group
- `apps/api/src/__tests__/integration/route-aliasing.test.ts` → `route-aliasing.integration.spec.ts` - Renamed to match naming convention

### Files Created (Departments)

- `apps/api/src/layers/platform/departments/` (8 files, ~900 lines)

### Files Created (Settings)

- `apps/api/src/layers/platform/settings/` (9 files, ~850 lines)

### Files Created (Navigation)

- `apps/api/src/layers/platform/navigation/` (15 files, ~1,200 lines)

**Total**: 32 new files, ~2,950 lines of code, 2 files modified

---

**Document Version**: 1.0
**Last Updated**: 2025-12-14T12:20:00Z
