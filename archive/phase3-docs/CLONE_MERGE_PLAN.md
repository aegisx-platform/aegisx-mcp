# Clone Merge Plan - Phase 3

**Last Updated**: 2025-09-03  
**Objective**: Safely merge all Phase 3 changes from 3 clones

## 🔀 Merge Strategy Overview

### Merge Order (Critical):

1. **Clone 1** → `develop` (Backend Performance)
2. **Clone 3** → `develop` (Docker/DevOps)
3. **Clone 2** → `develop` (E2E Tests)

This order minimizes conflicts and ensures infrastructure is ready before testing.

---

## 📋 Pre-Merge Checklist

### For Each Clone:

- [ ] All tests passing locally
- [ ] No linting errors
- [ ] Changes documented
- [ ] Peer review completed
- [ ] No sensitive data in commits

---

## 🔴 Clone 1: Backend Performance Merge

### Files to Merge:

```bash
# New files
apps/api/src/database/migrations/012_add_settings_performance_indexes.ts
apps/api/src/modules/settings/settings.performance.ts

# Modified files
apps/api/src/modules/settings/settings.repository.ts
```

### Merge Commands:

```bash
# In Clone 1
cd /path/to/aegisx-starter-1

# 1. Commit current work
git add apps/api/src/database/migrations/012_add_settings_performance_indexes.ts
git add apps/api/src/modules/settings/settings.performance.ts
git add apps/api/src/modules/settings/settings.repository.ts

git commit -m "feat(api): add Settings API performance optimizations

- Add database indexes for common query patterns
- Implement query optimization strategies
- Add cache warming for Redis
- Add performance monitoring utilities
- Use PostgreSQL full-text search
- Optimize connection pooling"

# 2. Pull latest and push
git pull origin develop --rebase
git push origin develop
```

### Post-Merge Tests:

```bash
# Run migration
npx knex migrate:latest

# Test Settings API performance
npm run test:integration -- settings

# Check query performance
npm run benchmark:settings
```

---

## 🔵 Clone 3: Docker/DevOps Merge

### Files to Merge:

```bash
# Modified files
docker-compose.prod.yml
apps/api/Dockerfile
apps/web/Dockerfile
apps/admin/Dockerfile
```

### Merge Commands:

```bash
# In Clone 3
cd /path/to/aegisx-starter-3

# 1. Commit Docker optimizations
git add docker-compose.prod.yml
git add apps/*/Dockerfile

git commit -m "feat(docker): optimize production deployment

- Multi-stage builds for smaller images
- Security hardening with non-root users
- Alpine Linux base for minimal attack surface
- PostgreSQL performance tuning
- Resource limits and health checks
- Layer caching optimization"

# 2. Pull Clone 1 changes first
git pull origin develop --rebase

# 3. Resolve any conflicts and push
git push origin develop
```

### Post-Merge Tests:

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Test containers
docker-compose -f docker-compose.prod.yml up -d
docker-compose ps

# Verify health checks
docker-compose -f docker-compose.prod.yml ps --format json | jq '.[].Health'
```

---

## 🟢 Clone 2: E2E Testing Merge

### No files to commit (clean state)

### Merge Commands:

```bash
# In Clone 2
cd /path/to/aegisx-start-2

# 1. Pull all changes from Clone 1 & 3
git pull origin develop

# 2. Run E2E tests against updated code
npm run e2e

# 3. If tests reveal issues, create fix branch
git checkout -b fix/e2e-issues
# Make fixes...
git commit -m "fix: resolve E2E test failures"
git push origin fix/e2e-issues
# Create PR for review
```

---

## 🚨 Conflict Resolution Guide

### Potential Conflict Areas:

1. **package.json** - Dependencies
2. **docker-compose files** - Port mappings
3. **Migration numbers** - Sequential ordering

### Resolution Strategy:

```bash
# If conflicts occur
git status
git diff

# For package.json conflicts
npm install  # After resolving
yarn install # If using yarn

# For migrations
# Ensure sequential numbering
ls apps/api/src/database/migrations/

# For Docker conflicts
# Check port availability
netstat -an | grep LISTEN
```

---

## 📊 Verification Steps

### After All Merges:

```bash
# 1. Clean install
rm -rf node_modules
yarn install

# 2. Run all tests
nx run-many --target=test --all
nx run-many --target=lint --all
nx e2e e2e

# 3. Build all apps
nx run-many --target=build --all

# 4. Test Docker production build
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up

# 5. Performance verification
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3333/api/settings"
```

---

## 🔄 Rollback Plan

### If Issues Occur:

```bash
# Save current state
git tag phase3-merge-attempt-$(date +%Y%m%d-%H%M%S)

# If rollback needed
git reset --hard origin/develop
git clean -fd

# Cherry-pick specific commits if needed
git cherry-pick <commit-hash>
```

---

## 📅 Merge Timeline

### Day 1 (Today):

- [ ] 10:00 AM - Clone 1 commits and pushes
- [ ] 11:00 AM - Verify Clone 1 changes
- [ ] 2:00 PM - Clone 3 pulls and merges
- [ ] 3:00 PM - Verify Clone 3 changes
- [ ] 4:00 PM - Clone 2 pulls all changes
- [ ] 5:00 PM - Run full E2E suite

### Day 2:

- [ ] Address any issues found
- [ ] Final integration testing
- [ ] Update documentation

---

## ✅ Success Criteria

- [ ] All changes merged without conflicts
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance benchmarks improved
- [ ] Docker images building successfully
- [ ] No regression in existing features
- [ ] Documentation updated

---

## 📝 Notes

- Keep main `develop` branch stable
- Use feature branches for risky changes
- Communicate before major merges
- Document any workarounds needed

**Ready to merge? Start with Clone 1!** 🚀
