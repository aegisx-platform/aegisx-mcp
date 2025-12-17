# Auth & RBAC Improvements - Requirements

## Overview

Improve authentication and RBAC system by removing debug logging, implementing cache invalidation, and adding database indexes based on comprehensive review findings.

## Business Requirements

### BR-1: Production-Ready Logging

**Priority:** High
**Description:** Remove debug console.log statements and implement proper environment-aware logging

**Acceptance Criteria:**

- [ ] All `console.log('[DEBUG]` statements removed from auth.strategies.ts
- [ ] Use structured logging with `request.log.debug()` instead
- [ ] Debug logs only active in development environment
- [ ] No performance impact in production

### BR-2: Permission Cache Invalidation

**Priority:** High
**Description:** Implement automatic cache invalidation when roles or permissions change

**Acceptance Criteria:**

- [ ] Cache invalidated when user roles are assigned/removed
- [ ] Cache invalidated when role permissions change
- [ ] Cache invalidated when permissions are created/updated/deleted
- [ ] Bulk operations also trigger cache invalidation
- [ ] No stale permission data in cache

### BR-3: Database Performance Optimization

**Priority:** Medium
**Description:** Add missing database indexes for permission queries

**Acceptance Criteria:**

- [ ] Index on `user_roles(user_id, is_active)`
- [ ] Index on `role_permissions(role_id)`
- [ ] Migration created for index additions
- [ ] Query performance improved (measurable)

## Technical Requirements

### TR-1: Logging Strategy

- Use Fastify's built-in logger
- Environment-aware debug logging
- Structured log format (JSON)
- No sensitive data in logs

### TR-2: Cache Invalidation Strategy

- Invalidate specific user cache on role assignment change
- Invalidate multiple user caches on permission change
- Use Redis DEL command for single key
- Use Redis SCAN + DEL for pattern matching

### TR-3: Database Indexes

- B-tree indexes for equality and range queries
- Composite index on (user_id, is_active) for filtered queries
- Single column index on foreign keys

## Non-Functional Requirements

### Performance

- Cache invalidation < 10ms
- Database index creation without downtime
- No degradation to existing query performance

### Security

- No information leakage in production logs
- Cache invalidation doesn't expose user IDs
- Indexes don't impact data integrity

### Compatibility

- Backward compatible with existing code
- No breaking changes to API
- Works with existing permission cache plugin

## Success Metrics

1. **Logging:** Zero console.log in production code
2. **Cache:** 0% stale permission rate after role/permission changes
3. **Performance:** 30-50% faster permission queries with indexes
4. **Security:** No debug information in production logs

## Constraints

- Must maintain existing API contracts
- No schema changes to tables (only indexes)
- Redis must remain optional dependency
- Must work with current auth flow

## Dependencies

- Existing files:
  - `apps/api/src/layers/core/auth/strategies/auth.strategies.ts`
  - `apps/api/src/layers/core/auth/services/permission-cache.service.ts`
  - `apps/api/src/layers/platform/rbac/rbac.service.ts`
  - Database migration system

## Timeline

- High Priority items: Immediate
- Medium Priority items: This sprint
- Total estimated time: 4-6 hours
