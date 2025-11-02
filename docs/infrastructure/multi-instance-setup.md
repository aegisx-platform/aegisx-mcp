# Multi-Instance Development Setup

> **For working on multiple features simultaneously using cloned repositories**

## Overview

The AegisX platform supports running multiple instances of the application simultaneously for parallel feature development. Each instance gets its own:

- Isolated database (PostgreSQL)
- Isolated cache (Redis)
- Unique ports (API, Web)
- Separate Docker containers

This allows developers to work on multiple features without conflicts or data corruption.

## Quick Setup (One Command)

```bash
# Auto-configure ports and containers based on folder name
pnpm setup

# This runs:
# 1. setup-env.sh → generates .env.local with unique ports
# 2. docker:up → starts containers
# 3. db:migrate → runs migrations
# 4. db:seed → seeds database
```

## Manual Setup Steps

If you need more control over the setup process:

```bash
# 1. Configure instance-specific environment
pnpm run setup:env

# 2. Start services with unique ports/containers
pnpm run docker:up

# 3. Initialize database
pnpm run db:migrate && pnpm run db:seed
```

## Port Assignment Strategy

Ports are automatically assigned based on the folder name hash:

### Main Repository

- **Folder**: `aegisx-starter`
- **PostgreSQL**: 5432
- **Redis**: 6380
- **API**: 3333
- **Web**: 4200

### Feature Repositories

- **Folder**: `aegisx-starter-{name}`
- **Ports**: Auto-assigned based on hash of `{name}`

### Examples

| Folder Name           | PostgreSQL | Redis | API  | Web  |
| --------------------- | ---------- | ----- | ---- | ---- |
| `aegisx-starter`      | 5432       | 6380  | 3333 | 4200 |
| `aegisx-starter-mpv`  | 5433       | 6381  | 3334 | 4201 |
| `aegisx-starter-rbac` | 5434       | 6382  | 3335 | 4202 |
| `aegisx-starter-auth` | 5435       | 6383  | 3336 | 4203 |

The hash algorithm ensures consistent ports for the same folder name.

## Instance Management Commands

### View All Instances

```bash
# List all instances with their ports
./scripts/port-manager.sh list

# Example output:
# Instance: aegisx-starter (main)
#   PostgreSQL: 5432
#   Redis: 6380
#   API: 3333
#   Web: 4200
#
# Instance: aegisx-starter-mpv
#   PostgreSQL: 5433
#   Redis: 6381
#   API: 3334
#   Web: 4201
```

### Check for Port Conflicts

```bash
# Detect if any ports are already in use
./scripts/port-manager.sh conflicts

# Example output:
# Checking for port conflicts...
# ⚠️  Port 5432 is already in use
# ✅ Port 6380 is available
# ✅ Port 3333 is available
```

### Stop Specific Instance

```bash
# Stop containers for specific instance
./scripts/port-manager.sh stop aegisx-starter-mpv

# Stops:
# - PostgreSQL container
# - Redis container
# - Does NOT affect other instances
```

### Stop All Instances

```bash
# Stop ALL running instances
./scripts/port-manager.sh stop-all

# Useful when:
# - Switching contexts
# - Freeing up resources
# - Troubleshooting port conflicts
```

### Show Running Services

```bash
# Show all running Docker containers
./scripts/port-manager.sh running

# Example output:
# CONTAINER ID   IMAGE           PORTS                    NAMES
# abc123def456   postgres:15     0.0.0.0:5432->5432/tcp  aegisx-starter-postgres
# def789ghi012   redis:7-alpine  0.0.0.0:6380->6379/tcp  aegisx-starter-redis
# ghi345jkl678   postgres:15     0.0.0.0:5433->5432/tcp  aegisx-starter-mpv-postgres
```

### Clean Up Unused Resources

```bash
# Remove stopped containers and unused volumes
./scripts/port-manager.sh cleanup

# Removes:
# - Stopped containers
# - Dangling volumes
# - Unused networks
# ⚠️  Does NOT affect running containers
```

## Docker Commands

### Start Instance Services

```bash
# Start PostgreSQL and Redis for current instance
pnpm run docker:up

# Uses ports from .env.local
```

### Stop Instance Services

```bash
# Stop containers for current instance
pnpm run docker:down

# Keeps data volumes intact
```

### Show Instance Containers

```bash
# Show running containers for current instance
pnpm run docker:ps

# Example output:
# NAME                          STATUS         PORTS
# aegisx-starter-postgres       Up 2 hours     0.0.0.0:5432->5432/tcp
# aegisx-starter-redis          Up 2 hours     0.0.0.0:6380->6379/tcp
```

### Reset Instance

```bash
# Complete reset: down + up + fresh data
pnpm run docker:reset

# WARNING: This will:
# 1. Stop containers
# 2. Remove volumes (data loss!)
# 3. Start fresh containers
# 4. Run migrations
# 5. Seed database
```

## Benefits

### ✅ Isolated Environments

Each feature has its own database with separate:

- User accounts
- Test data
- Configuration
- No cross-contamination

### ✅ No Port Conflicts

Automatic port assignment ensures:

- Each instance gets unique ports
- No manual configuration needed
- Consistent ports based on folder name
- Easy to remember (folder name = port offset)

### ✅ Parallel Development

Work on multiple features simultaneously:

- Different branches in different folders
- Independent databases
- Separate containers
- No context switching overhead

### ✅ Easy Switching

Stop and start instances as needed:

- Free up resources when not in use
- Quick startup times
- No configuration changes required
- Resume exactly where you left off

### ✅ Consistent Naming

Folder name determines everything:

- Container names
- Port assignments
- Database names
- Configuration files

## Workflow Examples

### Example 1: Starting New Feature Branch

```bash
# Clone repository with feature name
cd ~/projects
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-user-import
cd aegisx-starter-user-import

# Checkout feature branch
git checkout -b feature/user-import

# Quick setup
pnpm setup

# Verify ports
cat .env.local | grep PORT
# API_PORT=3334
# POSTGRES_PORT=5433

# Start development
pnpm run dev:api  # Uses port 3334 automatically
```

### Example 2: Working on Multiple Features

```bash
# Instance 1: Main feature
cd ~/projects/aegisx-starter
pnpm run dev:api  # Port 3333

# Instance 2: RBAC feature
cd ~/projects/aegisx-starter-rbac
pnpm run dev:api  # Port 3335

# Instance 3: Payment integration
cd ~/projects/aegisx-starter-payments
pnpm run dev:api  # Port 3336

# All running simultaneously with isolated data
```

### Example 3: Cleaning Up After Feature Completion

```bash
# Feature merged, cleanup instance
cd ~/projects/aegisx-starter-user-import

# Stop containers
pnpm run docker:down

# Optional: Remove folder
cd ~/projects
rm -rf aegisx-starter-user-import

# Cleanup Docker resources
./scripts/port-manager.sh cleanup
```

### Example 4: Troubleshooting Port Conflicts

```bash
# Check what's using your ports
./scripts/port-manager.sh conflicts

# Output shows:
# ⚠️  Port 5432 is already in use by: aegisx-starter-postgres

# Stop the conflicting instance
./scripts/port-manager.sh stop aegisx-starter

# Or stop all instances
./scripts/port-manager.sh stop-all

# Now start your instance
pnpm run docker:up
```

## Environment Files

### Auto-Generated Files

These files are auto-generated by `setup-env.sh`:

```
.env.local                    # Instance-specific environment variables
docker-compose.instance.yml   # Instance-specific Docker configuration
```

**⚠️ NEVER modify these files manually!** They are generated based on folder name.

### How to Find Current Ports

```bash
# Always check .env.local for current ports
cat .env.local | grep PORT

# Example output:
# API_PORT=3334
# POSTGRES_PORT=5433
# REDIS_PORT=6381
# WEB_PORT=4201
```

### Port Configuration Flow

```
Folder Name (aegisx-starter-mpv)
         ↓
    Hash("mpv")
         ↓
    Offset = 1
         ↓
  PostgreSQL: 5432 + 1 = 5433
  Redis:      6380 + 1 = 6381
  API:        3333 + 1 = 3334
  Web:        4200 + 1 = 4201
         ↓
  Written to .env.local
         ↓
  Used by Docker Compose
         ↓
  Used by API Server
```

## Best Practices

### 1. Always Use `pnpm setup` for New Instances

```bash
# ✅ Correct
cd aegisx-starter-new-feature
pnpm setup

# ❌ Wrong (missing setup)
cd aegisx-starter-new-feature
pnpm install
pnpm run docker:up  # Will use wrong ports!
```

### 2. Check Ports Before Starting

```bash
# Always verify ports first
cat .env.local | grep PORT

# Then start development
pnpm run dev:api
```

### 3. Use Instance-Specific Commands

```bash
# ✅ Correct (respects .env.local)
pnpm run dev:api

# ❌ Wrong (bypasses .env.local)
nx serve api --port 3333
```

### 4. Clean Up Unused Instances

```bash
# Monthly cleanup
./scripts/port-manager.sh cleanup

# Remove old feature folders
ls -la ~/projects/aegisx-starter-*
```

### 5. Stop Instances When Not in Use

```bash
# Before long break or shutdown
./scripts/port-manager.sh stop-all

# Free up resources
docker system prune -f
```

## Troubleshooting

### Problem: Port Already in Use

**Symptoms**: Cannot start containers, port conflict errors

**Solution**:

```bash
# Find conflicting instance
./scripts/port-manager.sh conflicts

# Stop conflicting instance
./scripts/port-manager.sh stop [instance-name]

# Or stop all
./scripts/port-manager.sh stop-all
```

### Problem: Wrong Database Data

**Symptoms**: Seeing data from different feature branch

**Solution**:

```bash
# Check if using correct instance
cat .env.local | grep POSTGRES_PORT

# Verify Docker containers
pnpm run docker:ps

# If wrong, stop and reset
pnpm run docker:down
pnpm setup  # Re-run setup
```

### Problem: Cannot Connect to Database

**Symptoms**: API cannot connect to PostgreSQL

**Solution**:

```bash
# 1. Check if containers are running
pnpm run docker:ps

# 2. Verify port in .env.local matches running container
cat .env.local | grep POSTGRES_PORT
docker ps | grep postgres

# 3. Restart containers if needed
pnpm run docker:down
pnpm run docker:up
```

### Problem: Containers Not Starting

**Symptoms**: Docker compose fails to start

**Solution**:

```bash
# 1. Check for port conflicts
./scripts/port-manager.sh conflicts

# 2. Clean up resources
docker system prune -f

# 3. Reset instance
pnpm run docker:reset
```

## Advanced Usage

### Custom Port Offset

If you need specific ports, edit after setup:

```bash
# 1. Run initial setup
pnpm setup

# 2. Edit .env.local manually (not recommended)
# Only do this if you have specific requirements

# 3. Recreate containers
pnpm run docker:down
pnpm run docker:up
```

**⚠️ Warning**: Manual port changes can cause conflicts with the automatic system.

### Sharing Ports Between Instances

Not recommended, but possible for read-only scenarios:

```bash
# Instance 1 (read-write)
cd aegisx-starter
pnpm run docker:up

# Instance 2 (read-only, same database)
cd aegisx-starter-readonly
# Manually set same POSTGRES_PORT in .env.local
# Only for viewing data, don't write!
```

### Running Multiple Branches of Same Feature

```bash
# Different approaches to same feature
cd ~/projects

# Approach 1
git clone ... aegisx-starter-auth-v1
cd aegisx-starter-auth-v1
git checkout feature/auth-approach-1

# Approach 2
git clone ... aegisx-starter-auth-v2
cd aegisx-starter-auth-v2
git checkout feature/auth-approach-2

# Both run simultaneously with isolated data
# Easy to compare implementations
```

## Related Documentation

- **[Docker Guide](./monorepo-docker-guide.md)** - Docker management for monorepo
- **[Development Workflow](../development/development-workflow.md)** - Step-by-step development guide
- **[Port Configuration](../getting-started/port-configuration.md)** - Detailed port assignment logic

---

**📚 For complete infrastructure documentation, see `docs/infrastructure/` directory**
