# Multi-Instance Development Setup

> **🎯 Objective**: Enable parallel development on multiple feature branches without port conflicts or resource conflicts.

## 📊 **The Problem**

When working on multiple features simultaneously by cloning the repo multiple times:

```bash
aegisx-starter/           # Main development
aegisx-starter-mpv/       # MPV feature branch
aegisx-starter-rbac/      # RBAC feature branch
```

**Conflicts occur**:

- ❌ PostgreSQL port 5432 conflicts
- ❌ Redis port 6380 conflicts
- ❌ API port 3333 conflicts
- ❌ Container names clash (`aegisx_postgres`, `aegisx_redis`)
- ❌ Volume names overlap causing data mixing

## ✅ **The Solution: Folder-Based Auto-Configuration**

### 🎯 **Core Concept**

Each folder gets **unique ports and container names** based on its suffix:

| Folder Name           | PostgreSQL | Redis | API  | Web  | Admin | Containers             |
| --------------------- | ---------- | ----- | ---- | ---- | ----- | ---------------------- |
| `aegisx-starter`      | 5432       | 6380  | 3333 | 4200 | 4201  | `aegisx_postgres`      |
| `aegisx-starter-mpv`  | 5433       | 6381  | 3334 | 4201 | 4202  | `aegisx_mpv_postgres`  |
| `aegisx-starter-rbac` | 5434       | 6382  | 3335 | 4202 | 4203  | `aegisx_rbac_postgres` |

### 🔧 **Port Calculation Algorithm**

```bash
# Extract suffix from folder name
FOLDER_NAME="aegisx-starter-mpv"
SUFFIX="mpv"

# Generate consistent hash-based offset
HASH=$(echo -n "$SUFFIX" | md5sum | cut -c1-2)
OFFSET=$((0x$HASH % 50 + 1))  # Range: 1-50

# Calculate ports
POSTGRES_PORT=$((5432 + OFFSET))
REDIS_PORT=$((6380 + OFFSET))
API_PORT=$((3333 + OFFSET))
```

## 🚀 **Quick Start Guide**

### 1. **Clone Repository with Feature-Specific Name**

```bash
# Clone for MPV feature
git clone [repo-url] aegisx-starter-mpv
cd aegisx-starter-mpv

# Clone for RBAC feature
git clone [repo-url] aegisx-starter-rbac
cd aegisx-starter-rbac
```

### 2. **One-Command Setup**

```bash
# Automatically configures ports, containers, and environment
pnpm setup

# Or step-by-step:
pnpm install
pnpm run setup:env     # Generate .env.local and docker-compose.override.yml
pnpm run docker:up     # Start services with unique ports
pnpm run db:migrate    # Initialize database
pnpm run db:seed       # Add seed data
```

### 3. **Start Development**

```bash
# Each instance runs on different ports
pnpm dev

# Example URLs for aegisx-starter-mpv:
# API: http://localhost:3334
# Web: http://localhost:4201
# Admin: http://localhost:4202
# PgAdmin: http://localhost:5051
```

## 📁 **Generated Files**

### **`.env.local` (Auto-generated)**

```bash
# Auto-generated environment for instance: mpv
# Generated on: 2025-09-13 06:45:35 +07 2025
# Folder: aegisx-starter-mpv

# Instance Configuration
INSTANCE_NAME=mpv
INSTANCE_SUFFIX=mpv

# Application Ports
PORT=3334
API_PORT=3334
WEB_PORT=4201
ADMIN_PORT=4202

# Database Configuration
DATABASE_PORT=5433
REDIS_PORT=6381

# Container Configuration
POSTGRES_CONTAINER=aegisx_mpv_postgres
REDIS_CONTAINER=aegisx_mpv_redis
POSTGRES_VOLUME=mpv_postgres_data
REDIS_VOLUME=mpv_redis_data
```

### **`docker-compose.instance.yml` (Auto-generated)**

```yaml
# Instance-specific Docker Compose file for: mpv
# Generated on: 2025-09-13 09:15:30 +07 2025

services:
  postgres:
    image: postgres:15-alpine
    container_name: aegisx_mpv_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: aegisx_db
    ports:
      - '5433:5432'
    volumes:
      - mpv_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: aegisx_mpv_redis
    ports:
      - '6381:6379'
    command: redis-server --appendonly yes
    volumes:
      - mpv_redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: aegisx_mpv_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@aegisx.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '5051:80'
    depends_on:
      - postgres

volumes:
  mpv_postgres_data:
  mpv_redis_data:
```

## 🛠️ **Management Commands**

### **Port Manager Script**

```bash
# View all instances and their port assignments
./scripts/port-manager.sh list

# Check for port conflicts
./scripts/port-manager.sh conflicts

# Stop specific instance
./scripts/port-manager.sh stop aegisx-starter-mpv

# Stop all instances
./scripts/port-manager.sh stop-all

# Show currently running services
./scripts/port-manager.sh running

# Clean up unused containers and volumes
./scripts/port-manager.sh cleanup
```

### **Sample Output: Instance List**

```
📋 AegisX Instances Registry
=================================
FOLDER              POSTGRES  REDIS  API   WEB   ADMIN  PGADMIN  STATUS
aegisx-starter      5432      6380   3333  4200  4201   5050     Running
aegisx-starter-mpv  5433      6381   3334  4201  4202   5051     Running
aegisx-starter-rbac 5434      6382   3335  4202  4203   5052     Stopped
```

## 🔍 **Port Registry System**

All instances are tracked in `~/.aegisx-port-registry`:

```
aegisx-starter:5432:6380:3333:4200:4201:5050
aegisx-starter-mpv:5433:6381:3334:4201:4202:5051
aegisx-starter-rbac:5434:6382:3335:4202:4203:5052
```

## 📄 **Environment File Hierarchy**

The system uses **environment file hierarchy** (no file replacement needed):

1. **`.env.local`** - Instance-specific overrides (auto-generated, git-ignored)
2. **`.env`** - Base configuration (committed to git)
3. **`.env.example`** - Template only

Node.js loads `.env.local` first, then falls back to `.env` for missing values.

## 🔒 **Git Integration**

### **Files Excluded from Git**

```gitignore
# Auto-generated instance files
.env.local
docker-compose.override.yml
docker-compose.instance.yml
```

### **Why These Files Are Git-Ignored**

- ✅ **Auto-generated** - Recreated on each setup
- ✅ **Instance-specific** - Different per developer/folder
- ✅ **No conflicts** - Each developer has unique config
- ✅ **Secure** - Local secrets stay local

## 🎯 **Benefits**

### **For Individual Developers**

- ✅ **Zero setup conflicts** - Each folder is isolated
- ✅ **Predictable ports** - Same folder = same ports always
- ✅ **Data isolation** - Each feature has its own database
- ✅ **Easy switching** - Start/stop instances independently

### **For Team Development**

- ✅ **No merge conflicts** - Auto-generated files not committed
- ✅ **Consistent experience** - Same setup script for everyone
- ✅ **Parallel work** - Multiple developers on different features
- ✅ **Clean Git history** - No environment-specific commits

## 🐛 **Troubleshooting**

### **Port Already in Use**

```bash
# Check what's using the port
lsof -i :5433

# Stop conflicting instance
./scripts/port-manager.sh stop aegisx-starter-mpv

# Or stop all instances
./scripts/port-manager.sh stop-all

# Remove old default containers that block ports
docker stop aegisx_postgres aegisx_redis aegisx_pgadmin 2>/dev/null || true
docker rm aegisx_postgres aegisx_redis aegisx_pgadmin 2>/dev/null || true
```

### **Container Name Conflicts**

```bash
# Remove conflicting containers
docker rm -f aegisx_mpv_postgres aegisx_mpv_redis

# Or clean up all AegisX containers
./scripts/port-manager.sh cleanup
```

### **Database Data Issues**

```bash
# Each instance has isolated data
# To reset instance database:
pnpm run db:reset

# To start completely fresh:
docker-compose down -v  # Remove volumes
pnpm setup              # Recreate everything
```

### **Environment Issues**

```bash
# Regenerate configuration files
pnpm run setup:env

# Check generated configuration
cat .env.local
cat docker-compose.instance.yml
```

### **Docker Compose Instance File Not Found**

If `pnpm run docker:up` fails with "docker-compose.instance.yml not found":

```bash
# 1. Generate instance configuration
pnpm run setup:env

# 2. Check generated files
ls -la docker-compose.instance.yml .env.local

# 3. Start with instance file
pnpm run docker:up

# 4. Verify containers are using correct names and ports
docker ps --filter "name=aegisx" --format "table {{.Names}}\t{{.Ports}}"
```

**Note**: Each instance uses a completely separate Docker Compose file with unique ports - no conflicts!

## 📚 **Advanced Usage**

### **Custom Port Ranges**

Edit `scripts/setup-env.sh` to modify port calculation:

```bash
# Change offset range (currently 1-50)
OFFSET=$((0x$HASH % 100 + 1))  # Range: 1-100
```

### **Different Base Ports**

Modify base ports in `setup-env.sh`:

```bash
# Change base ports
POSTGRES_PORT=$((5500 + OFFSET))  # Start from 5500 instead of 5432
REDIS_PORT=$((6400 + OFFSET))     # Start from 6400 instead of 6380
```

### **Custom Instance Names**

Use any folder naming pattern:

```bash
my-project-auth/      # → instance: auth
my-project-ui/        # → instance: ui
company-feature-x/    # → instance: feature-x
```

## 🚦 **Best Practices**

### **Folder Naming**

```bash
# ✅ Good patterns
aegisx-starter-feature-name
aegisx-starter-mpv
aegisx-starter-rbac-v2
my-project-auth

# ❌ Avoid
aegisx-starter (only use for main development)
aegisx-starter-1 (numeric suffixes less descriptive)
```

### **Instance Management**

```bash
# ✅ Start only what you need
./scripts/port-manager.sh stop-all   # Stop unused instances
pnpm setup                          # Start current instance

# ✅ Regular cleanup
./scripts/port-manager.sh cleanup    # Remove unused resources
```

### **Development Workflow**

```bash
# ✅ Switching between features
cd ../aegisx-starter-mpv
pnpm dev                            # Starts on different ports

cd ../aegisx-starter-rbac
pnpm dev                            # Starts on different ports

# Both can run simultaneously!
```

## 🎉 **Success Indicators**

You've successfully set up multi-instance development when:

- ✅ Multiple repo folders can run `pnpm dev` simultaneously
- ✅ Each instance has unique URLs (different ports)
- ✅ Database changes in one instance don't affect others
- ✅ No port conflicts or container name collisions
- ✅ Can switch between features seamlessly

---

**🚀 Ready to develop multiple features in parallel!**
