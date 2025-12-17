# RBAC Permission Consolidation - Production Migration Runbook

## Executive Summary

This runbook provides step-by-step procedures for migrating the production database from the hybrid permission system (department-level flags + RBAC) to a consolidated RBAC-only permission system.

### What

- Remove 5 permission boolean columns from `user_departments` table:
  - `can_create_requests`
  - `can_edit_requests`
  - `can_submit_requests`
  - `can_approve_requests`
  - `can_view_reports`

### Why

- Consolidate permission management to single source of truth (RBAC)
- Remove redundant data storage
- Simplify permission logic and reduce maintenance burden
- Improve security through centralized permission control

### Impact

- Zero downtime migration
- Fully reversible with rollback procedure
- All users maintain current access levels via RBAC roles
- No data loss - only schema simplification

### Duration

- Estimated execution time: 5-10 minutes (including verification)
- Actual time will depend on database size and system load

### Risk Level

- **LOW** - Fully tested in development, with automatic rollback capability
- All users migrated to RBAC before schema changes
- Reversible migration with complete rollback procedure

---

## Prerequisites

### 1. Backups and Disaster Recovery

- [ ] **Full database backup completed**
  - Command: `pg_dump -h <host> -U <user> <database> > backup_$(date +%Y%m%d_%H%M%S).sql`
  - Backup location: ******\*\*\*\*******\_******\*\*\*\*******
  - Backup timestamp: ******\*\*\*\*******\_******\*\*\*\*******
  - Backup size: ******\*\*\*\*******\_******\*\*\*\*******

- [ ] **Backup verified and tested**
  - Tested restore procedure on non-production environment
  - Verified data integrity of backup
  - Estimated restore time: ******\*\*\*\*******\_******\*\*\*\*******

- [ ] **Backup archived to offsite storage**
  - Archive location: ******\*\*\*\*******\_******\*\*\*\*******
  - Archive timestamp: ******\*\*\*\*******\_******\*\*\*\*******

### 2. Maintenance Window

- [ ] **Maintenance window scheduled**
  - Scheduled date/time: ******\*\*\*\*******\_******\*\*\*\*******
  - Expected duration: 15 minutes
  - Window buffer: ******\*\*\*\*******\_******\*\*\*\*******

- [ ] **Users notified**
  - Notification method: Email / In-app notification / Teams
  - Notification timestamp: ******\*\*\*\*******\_******\*\*\*\*******
  - Notification content acknowledges zero data loss
  - Estimated impact duration: 5-10 minutes

- [ ] **Support team notified and prepared**
  - Support leads: ******\*\*\*\*******\_******\*\*\*\*******
  - Escalation procedures documented
  - Rollback decision authority identified: ******\*\*\*\*******\_******\*\*\*\*******

### 3. Environment Verification

- [ ] **Database accessible and healthy**
  - Connection test: `psql -h <host> -U <user> -d <database> -c "SELECT version();"`
  - Database status: OK / DEGRADED / PROBLEMATIC
  - Current connections: ******\*\*\*\*******\_******\*\*\*\*******

- [ ] **Migration files present and validated**
  - Migration file location: `apps/api/src/database/migrations/[timestamp]_remove_user_departments_permissions.ts`
  - Migration file size: ******\*\*\*\*******\_******\*\*\*\*******
  - Migration file checksum: ******\*\*\*\*******\_******\*\*\*\*******
  - File verified by: ******\*\*\*\*******\_******\*\*\*\*******

- [ ] **RBAC permissions seeded**
  - Run: `npx knex seed:run`
  - Verification: Check permissions table for all required entries
  - Required permissions verified: ✓ (timestamp: ******\*\*\*\*******\_******\*\*\*\*******)

- [ ] **Permission mapping completed**
  - Mapping script location: `apps/api/src/database/scripts/map-department-permissions-to-rbac.ts`
  - Mapping script executed timestamp: ******\*\*\*\*******\_******\*\*\*\*******
  - Mapping results reviewed: YES / NO
  - Any exceptions identified: ******\*\*\*\*******\_******\*\*\*\*******

- [ ] **Current version in production matches tested version**
  - Git commit hash: ******\*\*\*\*******\_******\*\*\*\*******
  - Deployment timestamp: ******\*\*\*\*******\_******\*\*\*\*******
  - Build verification: PASSED / FAILED

---

## Pre-Migration Verification (Execute 30 minutes before maintenance window)

### Step 1: Verify Database Schema

Execute this SQL query to confirm current state:

```sql
-- Verify permission columns exist before migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_departments'
  AND column_name IN ('can_create_requests', 'can_edit_requests', 'can_submit_requests',
                      'can_approve_requests', 'can_view_reports')
ORDER BY column_name;
```

**Expected Result:** 5 rows (one for each permission column, all boolean type)

**Actual Result:**

```
[Record these results here for documentation]
```

**Status:** PASS / FAIL

---

### Step 2: Run Pre-Migration Audit

Navigate to API directory and execute audit script:

```bash
cd apps/api
npx ts-node src/database/scripts/audit-department-permissions.ts
```

**Expected Output:**

- Count of users with each permission flag
- List of users with department permissions but no RBAC roles
- Summary: **0 users at risk** (all should have RBAC roles assigned)

**Actual Output:**

```
[Capture full audit output here]
```

**Status:** PASS / FAIL

**If FAIL:** Do not proceed - investigate why some users lack RBAC roles before continuing.

---

### Step 3: Verify Permission Mapping (Dry-Run)

Execute mapping script in dry-run mode to preview changes:

```bash
cd apps/api
npx ts-node src/database/scripts/map-department-permissions-to-rbac.ts --dry-run
```

**Expected Output:**

- Preview of RBAC role assignments
- No actual database modifications
- Summary of users to be updated

**Actual Output:**

```
[Capture full dry-run output here]
```

**Status:** PASS / FAIL

**If FAIL:** Do not proceed - fix mapping logic before continuing.

---

### Step 4: Check Migration Status

Verify the migration is in pending state:

```bash
cd apps/api
npx knex migrate:status
```

**Expected Output:**

```
Pending migrations:
  [timestamp] - remove_user_departments_permissions.ts
```

**Actual Output:**

```
[Capture output here]
```

**Status:** PASS / FAIL

**If migration already applied:** Do not proceed - verify current state with DBA.

---

### Step 5: Monitor System Health

Check application and database metrics:

```bash
# Check API server health
curl -s http://localhost:3000/health | jq .

# Check database connections
psql -U <user> -d <database> -c "SELECT count(*) as connection_count FROM pg_stat_activity WHERE datname='<database>';"

# Check current table sizes
psql -U <user> -d <database> -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
```

**Current Metrics:**

- API Server: HEALTHY / DEGRADED / OFFLINE
- Database Connections: ******\*\*\*\*******\_******\*\*\*\*******
- user_departments table size: ******\*\*\*\*******\_******\*\*\*\*******
- Active queries: ******\*\*\*\*******\_******\*\*\*\*******

**Status:** HEALTHY / DEGRADED

**If DEGRADED:** Do not proceed - wait for system stabilization.

---

## Migration Execution

### Step 6: Create Transaction Checkpoint

Create a savepoint before applying migration:

```bash
# Start PostgreSQL session and create checkpoint
psql -U <user> -d <database> << 'EOF'
BEGIN;
SAVEPOINT pre_migration;

-- Verify starting state
SELECT COUNT(*) as user_dept_count FROM user_departments;

-- Record column count
SELECT COUNT(*) as permission_cols FROM information_schema.columns
WHERE table_name = 'user_departments'
AND column_name LIKE 'can_%';
EOF
```

**Checkpoint created:** YES / NO
**Timestamp:** ******\*\*\*\*******\_******\*\*\*\*******

---

### Step 7: Apply Migration

Execute the migration in production:

```bash
cd apps/api

# Start time
echo "Migration start time: $(date)"

# Apply migration
npx knex migrate:up

# End time
echo "Migration end time: $(date)"
```

**Expected Output:**

- SUCCESS message
- Execution time: < 5 seconds
- No error messages

**Actual Output:**

```
[Capture full migration output here]

Migration Start Time: _________________________________
Migration End Time: _________________________________
Migration Duration: _________________________________ seconds
```

**Status:** SUCCESS / FAILED

**If FAILED:** Immediately execute rollback procedure (see Rollback section).

---

### Step 8: Verify Column Removal

Execute SQL to verify columns are removed:

```sql
-- Verify permission columns are removed
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'user_departments'
  AND column_name IN ('can_create_requests', 'can_edit_requests', 'can_submit_requests',
                      'can_approve_requests', 'can_view_reports')
ORDER BY column_name;
```

**Expected Result:** 0 rows (no permission columns should exist)

**Actual Result:**

```
[Record results here]
```

**Status:** PASS / FAIL

**If FAIL:** Immediately execute rollback procedure.

---

### Step 9: Verify Data Integrity

Verify no data was lost during migration:

```sql
-- Count user_departments records
SELECT COUNT(*) as total_records,
       COUNT(DISTINCT user_id) as unique_users,
       COUNT(DISTINCT department_id) as unique_departments
FROM user_departments;

-- Verify no NULL values in critical fields
SELECT COUNT(*) as null_user_ids FROM user_departments WHERE user_id IS NULL;
SELECT COUNT(*) as null_department_ids FROM user_departments WHERE department_id IS NULL;

-- Check data completeness
SELECT * FROM user_departments LIMIT 5;
```

**Expected Results:**

- Row count matches pre-migration count
- No NULL values in critical fields
- Data integrity intact

**Actual Results:**

```
Total Records: _________________________________
Unique Users: _________________________________
Unique Departments: _________________________________
NULL user_ids: _________________________________
NULL department_ids: _________________________________
Sample Data: [Include sample records]
```

**Status:** PASS / FAIL

**If FAIL:** Immediately execute rollback procedure.

---

### Step 10: Test RBAC Permission Enforcement

Verify RBAC system is properly enforcing permissions:

```bash
# Test permission check via API
curl -X GET http://localhost:3000/api/users/me/departments \
  -H "Authorization: Bearer <valid_jwt_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**

- HTTP 200 OK
- Response body includes user departments WITHOUT permission fields
- No `can_create_requests` or other permission fields in response
- RBAC permissions still enforcing correctly

**Example Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "department_id": 123,
      "is_primary": true,
      "valid_from": "2024-01-01T00:00:00Z",
      "valid_until": null,
      "assigned_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Actual Response:**

```
[Capture full response here - verify NO permission fields are present]
```

**Status:** PASS / FAIL

**If FAIL:** Immediately execute rollback procedure.

---

### Step 11: Monitor Application Logs

Check application logs for errors during and after migration:

```bash
# Check application logs for errors
tail -n 100 /var/log/app/application.log | grep -E "ERROR|WARN|CRITICAL"

# Check for permission-related errors
tail -n 100 /var/log/app/application.log | grep -iE "permission|rbac|department"

# Count errors in last 5 minutes
grep "ERROR" /var/log/app/application.log | tail -n 50
```

**Log Analysis:**

- Critical errors: ******\*\*\*\*******\_******\*\*\*\*******
- Warning messages: ******\*\*\*\*******\_******\*\*\*\*******
- Permission-related issues: ******\*\*\*\*******\_******\*\*\*\*******

**Status:** PASS (no errors) / WARNING (minor issues) / FAIL (critical errors)

**If FAIL:** Immediately execute rollback procedure.

---

## Post-Migration Verification

### Step 12: Comprehensive Verification Checklist

Execute the following verifications and mark completion:

#### Schema Verification

- [ ] Permission columns removed from user_departments
- [ ] Remaining columns intact and correct
- [ ] Indexes still present and valid
- [ ] Foreign keys still valid

#### Data Integrity

- [ ] Row count unchanged
- [ ] No NULL values in critical fields
- [ ] All user-department relationships preserved
- [ ] Timestamps accurate (assigned_at, valid_from, etc.)

#### RBAC System Verification

- [ ] RBAC permissions properly defined
- [ ] Role-permission associations intact
- [ ] Permission cache functional
- [ ] Permission checks returning correct results

#### API Functionality

- [ ] Department endpoints returning data without permission fields
- [ ] Permission checks enforcing via RBAC
- [ ] No deprecated permission field references
- [ ] Error handling working correctly

#### Performance

- [ ] API response times normal (< 500ms)
- [ ] Database query performance acceptable
- [ ] No slow queries introduced
- [ ] Cache hit rate optimal

#### User Impact

- [ ] Users can still access departments
- [ ] Users with permissions have correct RBAC roles
- [ ] No access loss reported
- [ ] User experience unchanged

---

### Step 13: Execute Post-Migration Audit

Run the audit script again to verify post-migration state:

```bash
cd apps/api
npx ts-node src/database/scripts/audit-department-permissions.ts
```

**Expected Output:**

- Confirmation that migration completed
- No users at risk
- All users have appropriate RBAC roles
- Confirmation of zero permission columns

**Actual Output:**

```
[Capture full post-migration audit output]
```

**Comparison to Pre-Migration Audit:**

- Users affected: ******\*\*\*\*******\_******\*\*\*\*******
- Access changes: NONE (all maintained via RBAC)
- Status: PASS / FAIL

---

### Step 14: Smoke Tests

Execute basic smoke tests to verify user workflows:

```bash
# Test 1: User can view their departments
curl -X GET http://localhost:3000/api/users/me/departments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Test 2: Permission checks work
# (Test with user that has and without admin permission)
curl -X POST http://localhost:3000/api/requests/create \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"department_id": 1}'

# Test 3: Denied access still works
curl -X POST http://localhost:3000/api/requests/create \
  -H "Authorization: Bearer <no_permission_token>" \
  -H "Content-Type: application/json" \
  -d '{"department_id": 1}'
```

**Test Results:**

- Test 1 (View departments): PASS / FAIL
- Test 2 (Admin access): PASS / FAIL
- Test 3 (Deny access): PASS / FAIL

**Overall Status:** PASS / FAIL

---

## Rollback Procedure

Execute this procedure **ONLY IF** migration verification fails or critical issues occur.

### Rollback Step 1: Stop Migration if In Progress

If migration is still running, terminate it:

```bash
# Stop any running migrations (if not yet completed)
# This is automatic if you interrupted the process

# Verify migration status
cd apps/api
npx knex migrate:status
```

---

### Rollback Step 2: Down Migration

Execute the down migration to restore permission columns:

```bash
cd apps/api

# Start time
echo "Rollback start time: $(date)"

# Apply down migration
npx knex migrate:down

# End time
echo "Rollback end time: $(date)"
```

**Expected Output:**

- SUCCESS message
- Columns restored
- Execution time: < 5 seconds

**Actual Output:**

```
[Capture full rollback output]

Rollback Start Time: _________________________________
Rollback End Time: _________________________________
Rollback Duration: _________________________________ seconds
```

**Status:** SUCCESS / FAILED

**If FAILED:** Manually restore from backup (see step below).

---

### Rollback Step 3: Verify Columns Restored

Verify permission columns are restored:

```sql
-- Verify permission columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_departments'
  AND column_name IN ('can_create_requests', 'can_edit_requests', 'can_submit_requests',
                      'can_approve_requests', 'can_view_reports')
ORDER BY column_name;
```

**Expected Result:** 5 rows with proper data types and defaults

**Actual Result:**

```
[Record results here]
```

**Status:** PASS / FAIL

---

### Rollback Step 4: Verify Data Restored

Verify all data is correctly restored:

```sql
-- Verify row count matches
SELECT COUNT(*) as restored_records FROM user_departments;

-- Verify permission values are restored
SELECT can_create_requests, can_edit_requests, can_submit_requests,
       can_approve_requests, can_view_reports, COUNT(*) as record_count
FROM user_departments
GROUP BY 1, 2, 3, 4, 5;
```

**Expected Results:**

- Row count matches pre-migration count
- Permission columns contain expected values
- No NULL values in key columns

**Actual Results:**

```
[Record results here]
```

**Status:** PASS / FAIL

---

### Rollback Step 5: Restart Services

Restart API service to clear any cached schema references:

```bash
# Restart API service
systemctl restart api-service

# Wait for service to become ready
sleep 5

# Verify service is running
systemctl status api-service
curl -s http://localhost:3000/health | jq .
```

**Service Status:** RUNNING / STOPPED / ERROR
**Health Check:** HEALTHY / DEGRADED / OFFLINE

---

### Rollback Step 6: Verify System Operation

Test basic functionality to confirm rollback successful:

```bash
# Test API endpoint that was failing
curl -X GET http://localhost:3000/api/users/me/departments \
  -H "Authorization: Bearer <token>"

# Check for errors
tail -n 50 /var/log/app/application.log | grep ERROR
```

**System Status:** OPERATIONAL / DEGRADED / OFFLINE

---

### Rollback Step 7: Manual Restore from Backup (If Needed)

If automated rollback fails, manually restore from backup:

```bash
# Stop the application
systemctl stop api-service

# Stop PostgreSQL
systemctl stop postgresql

# Restore from backup
pg_restore -h localhost -U <user> -d <database> \
  --clean --if-exists \
  backup_<timestamp>.sql

# Start PostgreSQL
systemctl start postgresql

# Start application
systemctl start api-service

# Verify restoration
curl -s http://localhost:3000/health | jq .
```

**Restoration Status:** SUCCESS / FAILED

---

## Troubleshooting

### Issue: Migration times out (> 30 seconds)

**Symptoms:**

- Migration process hangs
- No response for extended period
- Process terminates with timeout error

**Solutions:**

1. **Increase timeout setting:**

   ```bash
   # In knexfile configuration
   acquireConnectionTimeout: 60000  # Increase to 60 seconds
   ```

2. **Check database connections:**

   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
   ```

   If too many active connections, reduce application connections.

3. **Check for table locks:**

   ```sql
   SELECT * FROM pg_locks WHERE relation::regclass::text = 'user_departments';
   ```

   If locked, identify and terminate blocking queries.

4. **Retry migration:**

   ```bash
   # If timeout occurred, migration may be partially applied
   # Check status first
   npx knex migrate:status

   # If migration shows as applied, proceed to verification
   # If pending, retry with increased timeout
   ```

**Prevention:** Schedule migration during low-traffic period to minimize database activity.

---

### Issue: Permission columns still exist after migration

**Symptoms:**

- Migration reports success
- SQL query shows permission columns still present
- API responses include permission fields

**Diagnosis:**

```sql
-- Check migration history
SELECT * FROM knex_migrations
WHERE name LIKE '%remove_user_departments_permissions%';

-- Check actual column existence
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_departments' AND column_name LIKE 'can_%';
```

**Solutions:**

1. **Check migration wasn't already rolled back:**

   ```bash
   npx knex migrate:status
   ```

2. **Check for multiple migration files:**

   ```bash
   ls -la apps/api/src/database/migrations/*remove_user_departments_permissions*
   ```

   If multiple files exist, remove duplicates.

3. **Verify migration file content:**

   ```bash
   cat apps/api/src/database/migrations/*remove_user_departments_permissions.ts | grep dropColumn
   ```

   Ensure all 5 columns are in the drop statement.

4. **Re-apply migration:**
   ```bash
   npx knex migrate:down
   npx knex migrate:up
   ```

**Prevention:** Run migration status check before and after execution.

---

### Issue: API returning permission field errors

**Symptoms:**

- 500 error when accessing department endpoints
- Error mentions undefined permission properties
- Logs show "Cannot read property 'can_create_requests'"

**Diagnosis:**

```bash
# Check application logs for specific error
tail -n 100 /var/log/app/application.log | grep -A 5 "can_create_requests"

# Check schema definition files
grep -r "can_create_requests" apps/api/src --include="*.ts"
```

**Solutions:**

1. **Update schema definitions:**
   Remove permission field definitions from TypeBox schemas in:
   - `apps/api/src/layers/platform/users/schemas/user-departments.schemas.ts`
   - Any other schema files referencing department permissions

2. **Clear application cache:**

   ```bash
   # Restart service to clear all caches
   systemctl restart api-service
   ```

3. **Check for stale references:**
   ```bash
   # Search for references to old permission methods
   grep -r "can_create_requests\|can_edit_requests\|getPermissions\|setPermissions" \
     apps/api/src --include="*.ts" | grep -v "node_modules"
   ```
   Update any found references to use RBAC instead.

**Prevention:** Ensure all code references updated before applying migration.

---

### Issue: Users reporting access denied

**Symptoms:**

- Users cannot perform actions they previously could
- Permission checks failing unexpectedly
- RBAC permissions not enforcing

**Diagnosis:**

```sql
-- Check if user has RBAC role
SELECT * FROM user_roles WHERE user_id = '<user_id>';

-- Check if role has required permission
SELECT * FROM role_permissions
WHERE role_id IN (SELECT role_id FROM user_roles WHERE user_id = '<user_id>')
AND permission_id IN (SELECT id FROM permissions WHERE action LIKE '%create_requests%');
```

**Solutions:**

1. **Re-run permission mapping script:**

   ```bash
   npx ts-node src/database/scripts/map-department-permissions-to-rbac.ts
   ```

2. **Manually assign role to user:**

   ```sql
   INSERT INTO user_roles (user_id, role_id, assigned_at)
   VALUES ('<user_id>', <role_id>, NOW())
   ON CONFLICT DO NOTHING;
   ```

3. **Clear permission cache:**

   ```bash
   # Restart service to clear Redis cache
   redis-cli FLUSHALL  # Use with caution in production
   systemctl restart api-service
   ```

4. **Verify RBAC middleware:**
   Check that RBAC middleware is properly configured in routes requiring permissions.

**Prevention:** Execute comprehensive verification steps before declaring migration complete.

---

### Issue: Database backup/restore failures

**Symptoms:**

- Cannot access backup file
- Restore command fails
- Backup size unexpectedly large

**Solutions:**

1. **Verify backup file exists:**

   ```bash
   ls -lh backup_<timestamp>.sql
   file backup_<timestamp>.sql
   ```

2. **Check disk space for restore:**

   ```bash
   df -h /var/lib/postgresql
   ```

   Ensure sufficient space for restored database (at least 2x backup size).

3. **Verify backup integrity:**

   ```bash
   pg_restore -l backup_<timestamp>.sql | head -20
   ```

4. **Test restore procedure:**
   ```bash
   # On test system
   pg_restore -h localhost -U test_user -d test_db --clean backup_<timestamp>.sql
   ```

**Prevention:** Test backup/restore procedure before scheduled maintenance.

---

## Performance Impact Assessment

### Expected Performance Metrics

| Metric              | Before     | After       | Impact           |
| ------------------- | ---------- | ----------- | ---------------- |
| Migration Time      | N/A        | < 5 seconds | NEGLIGIBLE       |
| API Response Time   | ~100-150ms | ~100-150ms  | NONE             |
| Database Query Time | ~50-100ms  | ~50-100ms   | NONE             |
| Memory Usage        | ~500MB     | ~500MB      | NONE             |
| Disk Usage          | ~200MB     | ~190MB      | SLIGHT REDUCTION |

### Monitoring During Migration

```bash
# Monitor system resources
top -b -n 1 | head -15

# Monitor database connections
watch -n 1 'psql -U postgres -d postgres -c "SELECT count(*) FROM pg_stat_activity WHERE datname='"'"'<database>'"'"';"'

# Monitor API response times
watch -n 5 'curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health'
```

### Post-Migration Performance

Execute performance tests to verify no degradation:

```bash
# Test API performance (1000 concurrent requests)
ab -n 1000 -c 100 http://localhost:3000/api/users/me/departments

# Monitor database with high load
pgbench -U postgres -d <database> -r -T 60
```

**Expected:** Response times unchanged or improved

---

## Communication Plan

### Pre-Migration (24 hours before)

- [ ] Send notification to all users
- [ ] Notify support team
- [ ] Alert monitoring systems
- [ ] Document scheduled maintenance in status page

### During Migration (maintenance window)

- [ ] Update status page (Maintenance in Progress)
- [ ] Monitor logs continuously
- [ ] Keep team on standby
- [ ] Respond to incidents immediately

### Post-Migration (within 1 hour)

- [ ] Verify all systems operational
- [ ] Close monitoring alerts
- [ ] Send completion notification
- [ ] Update status page
- [ ] Document lessons learned

---

## Sign-Off and Documentation

### Migration Execution Sign-Off

- [ ] Migration completed successfully
- [ ] All verification steps passed
- [ ] No errors or warnings in logs
- [ ] System operating normally
- [ ] Users can access all features

**Executed by:** ******\*\*\*\*******\_******\*\*\*\******* (DBA/DevOps)
**Date/Time:** ******\*\*\*\*******\_******\*\*\*\******* (ISO 8601 format)
**Duration:** ******\*\*\*\*******\_******\*\*\*\******* (HH:MM:SS)
**Status:** SUCCESS / ROLLBACK

### Performance Metrics

| Metric            | Target  | Actual     | Status    |
| ----------------- | ------- | ---------- | --------- |
| Migration Time    | < 5 sec | **\_\_\_** | PASS/FAIL |
| API Response Time | ≤ 150ms | **\_\_\_** | PASS/FAIL |
| User Impact       | Zero    | **\_\_\_** | PASS/FAIL |
| Errors            | Zero    | **\_\_\_** | PASS/FAIL |

### Issues and Resolutions

**Issues Encountered:** **************\*\***************\_\_\_\_**************\*\***************

**Resolutions Applied:** **************\*\***************\_\_\_\_**************\*\***************

**Lessons Learned:** **************\*\***************\_\_\_\_**************\*\***************

---

## Appendix: Reference Information

### Migration File Location

- Path: `apps/api/src/database/migrations/[timestamp]_remove_user_departments_permissions.ts`
- Timestamp format: `YYYYMMDDhhmmss`
- Reviewers: ******\*\*\*\*******\_******\*\*\*\******* (at least 2 required)
- Approved by: ******\*\*\*\*******\_******\*\*\*\*******

### Audit Scripts

- Pre-migration: `apps/api/src/database/scripts/audit-department-permissions.ts`
- Mapping: `apps/api/src/database/scripts/map-department-permissions-to-rbac.ts`

### Key Contacts

- DBA: ******\*\*\*\*******\_******\*\*\*\*******
- DevOps Lead: ******\*\*\*\*******\_******\*\*\*\*******
- Application Owner: ******\*\*\*\*******\_******\*\*\*\*******
- Incident Commander: ******\*\*\*\*******\_******\*\*\*\*******

### Escalation Matrix

- Minor Issues (< 5 min impact): Handle locally, notify team
- Medium Issues (5-30 min impact): Escalate to team lead
- Major Issues (> 30 min impact): Escalate to incident commander, consider rollback
- Critical Issues (system down): Execute immediate rollback, page on-call

### Documentation References

- RBAC Permission Consolidation Specification: `.spec-workflow/specs/rbac-permission-consolidation/`
- Design Document: `design.md`
- Requirements Document: `requirements.md`
- Task List: `tasks.md`
- Deployment Checklist: `DEPLOYMENT_CHECKLIST.md`

---

**Last Updated:** 2025-12-17
**Runbook Version:** 1.0
**Next Review Date:** Post-migration + 7 days

---

**For assistance during migration:** Contact on-call DBA or DevOps team immediately.
