# Database Migration Guide

## Overview

This guide explains how database migrations are automatically handled during ArgoCD deployments for the AegisX Platform.

## Migration Strategies by Environment

### Staging Environment

**Strategy**: Init Container Pattern

Migrations run automatically before the application container starts using a Kubernetes Init Container.

**Location**: `argocd/overlays/staging/api/deployment-patch.yaml`

**Behavior**:

- Runs before every pod startup
- If migration fails, pod won't start
- Non-blocking for other pods (each pod runs its own init)
- Suitable for development/staging where downtime is acceptable

**Flow**:

```
Deploy → Init Container (Migration) → Success → App Container Starts
                                   → Failure → Pod stays in Init state
```

### Production Environment

**Strategy**: ArgoCD PreSync Hook (Job)

Migrations run as a separate Kubernetes Job before ArgoCD syncs the application.

**Location**: `argocd/overlays/production/api/migration-job.yaml`

**Behavior**:

- Runs once per deployment (not per pod)
- ArgoCD waits for job completion before updating application
- Includes backup mechanisms and notifications
- 3 retry attempts on failure
- Job retained for 7 days for log inspection

**Flow**:

```
ArgoCD Sync Triggered → PreSync Job (Migration) → Success → Sync Application
                                                → Failure → Sync Aborted
```

## Migration Scripts

### Available Commands

```bash
# Check database connection
pnpm run db:ping

# Run migrations
pnpm run db:migrate

# Check migration status
pnpm run db:migrate:status

# Rollback last migration
pnpm run db:rollback

# Production migrations
pnpm run db:migrate:prod
pnpm run db:status:prod
```

### Script Details

**db:ping** - Verifies database connectivity

- Connects to database using environment variables
- Exits with code 0 on success, 1 on failure
- Used in migration jobs to verify DB before running migrations

**db:migrate** - Runs all pending migrations

- Uses Knex.js migration system
- Executes migrations in sequential order
- Idempotent (safe to run multiple times)

**db:migrate:status** - Shows migration status

- Lists all migrations and their execution status
- Useful for debugging migration issues

## Configuration Files

### Staging Configuration

File: `argocd/overlays/staging/api/kustomization.yaml`

```yaml
patches:
  - path: deployment-patch.yaml
    target:
      kind: Deployment
      name: aegisx-api
```

The patch adds an init container to the deployment that runs migrations.

### Production Configuration

File: `argocd/overlays/production/api/kustomization.yaml`

```yaml
resources:
  - migration-job.yaml
```

The Job resource is created separately with ArgoCD hook annotations.

## Environment Variables

Both staging and production migrations use the following environment variables:

```yaml
- DATABASE_HOST # From ConfigMap: aegisx-api-config
- DATABASE_PORT # From ConfigMap: aegisx-api-config
- DATABASE_USER # From ConfigMap: aegisx-api-config
- DATABASE_NAME # From ConfigMap: aegisx-api-config
- DATABASE_PASSWORD # From Secret: aegisx-api-secrets
- NODE_ENV # Set to "production"
```

## Monitoring & Debugging

### Check Migration Status (Staging)

```bash
# Get pod status
kubectl get pods -n staging | grep aegisx-api

# Check init container logs
kubectl logs -n staging <pod-name> -c db-migration

# Check if pod is stuck in Init state
kubectl describe pod -n staging <pod-name>
```

### Check Migration Status (Production)

```bash
# List migration jobs
kubectl get jobs -n production | grep migration

# Check job status
kubectl describe job -n production production-aegisx-api-migration

# View migration logs
kubectl logs -n production job/production-aegisx-api-migration

# Check if job succeeded
kubectl get job -n production production-aegisx-api-migration -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}'
```

### Common Issues

**Issue**: Init container stuck in "Init:CrashLoopBackOff"

- **Cause**: Migration failed
- **Solution**: Check init container logs to see migration error

**Issue**: Production sync waiting indefinitely

- **Cause**: Migration job hasn't completed
- **Solution**: Check job logs and status

**Issue**: "Cannot connect to database"

- **Cause**: Database credentials or network issues
- **Solution**: Verify ConfigMap and Secret values, check network policies

## Production Features

The production migration job includes additional safety features:

### 1. Connection Validation

Verifies database connectivity before attempting migrations

### 2. Migration Status Display

Shows current migration status before and after execution

### 3. Backup Preparation

Placeholder for database backup (can be enabled by adding pg_dump)

### 4. Slack Notifications (Optional)

Sends notifications on migration start, success, or failure

- Requires `SLACK_WEBHOOK_URL` in secrets
- Commented out by default

### 5. Data Integrity Checks

Placeholder for custom verification (can be enabled with custom scripts)

### 6. Comprehensive Logging

Detailed logs with timestamps for audit trail

## Best Practices

### 1. Test Migrations in Staging First

Always deploy to staging before production to catch migration issues

### 2. Write Reversible Migrations

Include both `up` and `down` migrations when possible

### 3. Keep Migrations Small

Break large schema changes into smaller, incremental migrations

### 4. Avoid Data Migrations in Schema Changes

Separate data migrations from schema changes when dealing with large datasets

### 5. Monitor Migration Duration

Long-running migrations can block deployments in production

### 6. Use Transactions

Ensure migrations run in transactions for atomicity (Knex does this by default)

## ArgoCD Hook Annotations

Production migration job uses these ArgoCD annotations:

```yaml
annotations:
  # Run before sync
  argocd.argoproj.io/hook: PreSync

  # Delete old job before creating new one
  argocd.argoproj.io/hook-delete-policy: BeforeHookCreation

  # Run before everything else (wave -1)
  argocd.argoproj.io/sync-wave: '-1'
```

### Sync Wave Explanation

- Wave `-1`: Migration runs first
- Wave `0`: Default (application deployment)
- Wave `1+`: Post-deployment tasks

## Rollback Strategy

### Staging

If migration fails:

1. Fix the migration file
2. Commit and push changes
3. ArgoCD will auto-sync and retry

### Production

If migration fails:

1. ArgoCD sync is aborted (app not updated)
2. Review migration job logs
3. Fix migration issue
4. Delete failed job: `kubectl delete job -n production production-aegisx-api-migration`
5. Re-trigger sync in ArgoCD

If you need to rollback a successful migration:

```bash
# Run rollback locally or via debug pod
pnpm run db:rollback:prod

# Or create a new migration that reverses changes
pnpm run db:migrate:prod
```

## Resources

- Migration files: `apps/api/src/database/migrations/`
- Knex configuration: `knexfile.ts`
- ArgoCD Applications: `aegisx-infra/apps/`

## Troubleshooting

### Migration stuck or failing

1. Check logs
2. Verify database credentials
3. Check database connectivity from pod
4. Verify migration file syntax
5. Check for schema conflicts

### Need to skip a migration

Not recommended, but if absolutely necessary:

```bash
# Mark migration as complete without running it
kubectl exec -it -n production <api-pod> -- pnpm run db:migrate:status
# Then manually update migrations table
```

### Emergency database access

```bash
# Port forward to database
kubectl port-forward -n production svc/production-aegisx-postgres 5432:5432

# Connect with psql
psql -h localhost -p 5432 -U aegisx -d aegisx
```

## Security Considerations

1. Database credentials stored in Kubernetes Secrets
2. Secrets should be encrypted at rest
3. Use RBAC to limit access to secrets
4. Audit migration logs regularly
5. Consider using sealed secrets or external secret managers

## Future Enhancements

Potential improvements to consider:

1. Automatic backup before migrations
2. Migration dry-run capability
3. Automatic rollback on failure
4. Migration performance metrics
5. Slack/Teams integration for notifications
6. Migration approval workflow for production
