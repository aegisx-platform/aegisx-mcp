# RBAC Permission Consolidation - Deployment Checklist

## Pre-Deployment Verification

### Code Quality

- [ ] All 37 unit tests passing (UserDepartmentsService)
- [ ] All 18 unit tests passing (UserDepartmentsRepository)
- [ ] All 20 integration tests passing
- [ ] Full build successful (pnpm run build)
- [ ] No TypeScript errors
- [ ] No linting errors

### Database Preparation

- [ ] Audit script executed (zero users at risk)
- [ ] Permission mapping script executed (100% success)
- [ ] RBAC permissions seeded
- [ ] Migration tested in development
- [ ] Migration tested in staging
- [ ] Rollback tested successfully

### Documentation

- [ ] API documentation updated
- [ ] Migration runbook created
- [ ] Architecture documentation updated
- [ ] Deployment checklist reviewed

### Environment Preparation

- [ ] Staging environment validated
- [ ] Database backup created and verified
- [ ] Maintenance window scheduled
- [ ] Team members notified
- [ ] Rollback plan confirmed

## Deployment Steps

### 1. Pre-Deployment Backup

- [ ] Create full database backup
- [ ] Verify backup integrity
- [ ] Document backup location
- [ ] Test backup restoration (in test environment)

**Success Criteria:** Backup created, verified, and restorable

### 2. Code Deployment

- [ ] Deploy backend code (API)
- [ ] Deploy frontend code (if applicable)
- [ ] Verify deployment successful
- [ ] Services restarted

**Success Criteria:** Code deployed, services running

### 3. Database Migration

- [ ] Execute migration: `npx knex migrate:up`
- [ ] Verify execution time < 5 seconds
- [ ] Verify schema changes (5 columns removed)
- [ ] Verify data integrity (row count unchanged)

**Success Criteria:** Migration successful, schema correct, data intact

### 4. Service Restart

- [ ] Restart API services
- [ ] Verify services healthy
- [ ] Check service logs for errors

**Success Criteria:** All services running without errors

## Post-Deployment Verification

### API Verification

- [ ] GET /users/me/departments returns correct schema
- [ ] POST /users/:id/departments works without permissions
- [ ] Response includes only organizational fields
- [ ] No permission fields in responses
- [ ] RBAC middleware protecting endpoints

**Success Criteria:** All API endpoints working, correct schema

### Database Verification

- [ ] Permission columns removed from schema
- [ ] Data integrity maintained
- [ ] Foreign keys intact
- [ ] Referential integrity 100%
- [ ] No NULL values in NOT NULL columns

**Success Criteria:** Database schema correct, data valid

### Application Verification

- [ ] No errors in application logs
- [ ] No 500 errors from API
- [ ] Authentication working correctly
- [ ] RBAC permissions enforcing
- [ ] User access preserved

**Success Criteria:** Application functioning normally

### Performance Verification

- [ ] API response times normal
- [ ] Database query performance acceptable
- [ ] No performance degradation
- [ ] Resource usage normal

**Success Criteria:** Performance meets expectations

### Monitoring

- [ ] Application logs clean
- [ ] Database logs clean
- [ ] No alert triggers
- [ ] Metrics normal
- [ ] Error rates normal

**Success Criteria:** All monitoring green

## Rollback Triggers

Execute rollback immediately if ANY of these occur:

- Migration fails or times out
- Data integrity issues detected
- API returning errors
- Users losing access
- Performance degradation > 20%
- Critical errors in logs

## Rollback Execution

If rollback needed:

1. [ ] Execute: `npx knex migrate:down`
2. [ ] Verify columns restored
3. [ ] Restart services
4. [ ] Verify system operation
5. [ ] Document rollback reason

## Final Sign-Off

- [ ] All pre-deployment checks passed
- [ ] Deployment executed successfully
- [ ] All post-deployment verifications passed
- [ ] No issues detected
- [ ] System stable for 1 hour
- [ ] Monitoring confirmed normal

**Deployment Status:** ☐ SUCCESS ☐ ROLLBACK

**Deployed by:** **\*\*\*\***\_**\*\*\*\***
**Date:** **\*\*\*\***\_**\*\*\*\***
**Start time:** **\*\*\*\***\_**\*\*\*\***
**End time:** **\*\*\*\***\_**\*\*\*\***
**Duration:** **\*\*\*\***\_**\*\*\*\***

**Notes/Issues:**

---

---

**Approved by:** **\*\*\*\***\_**\*\*\*\***
**Date:** **\*\*\*\***\_**\*\*\*\***
