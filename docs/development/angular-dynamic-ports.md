# Angular Dynamic Ports with Multi-Instance System

## 🎯 Overview

This guide explains how AegisX's Multi-Instance Development System seamlessly integrates with Angular applications to provide **complete port isolation** across all frontend and backend services, eliminating port conflicts during parallel development.

**Key Innovation**: Angular applications (Web & Admin) now automatically use **dynamic ports** calculated from folder names, enabling true zero-conflict multi-instance development.

## 🚀 Quick Start

### **Automatic Setup**

```bash
# Clone and setup any instance
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-auth
cd aegisx-starter-auth
pnpm setup  # Automatically generates unique ports for ALL services

# Start development with complete isolation
pnpm dev    # API, Web, Admin all use unique calculated ports
```

### **Zero Configuration Required**

- ✅ **Automatic port calculation** based on folder name
- ✅ **Fallback to defaults** for main repository
- ✅ **Environment variable integration** with package.json scripts
- ✅ **Complete Docker integration** for backend services

## 📊 Port Assignment Logic

### **Folder Name Detection**

```mermaid
flowchart TD
    A[Folder Name] --> B{Matches 'aegisx-starter'?}

    B -->|Yes| C[Main Repository]
    B -->|No| D{Matches 'aegisx-starter-*'?}

    C --> E[Use Default Ports<br/>Web: 4200, Admin: 4201, API: 3333]

    D -->|Yes| F[Extract Suffix]
    D -->|No| G[Unknown Pattern<br/>Use defaults + warning]

    F --> H[Calculate Hash from Suffix]
    H --> I[Apply Hash to Base Ports<br/>Web: 4200 + hash<br/>Admin: 4201 + hash<br/>API: 3333 + hash + 1]

    G --> E
    I --> J[Generate Unique Ports]

    style C fill:#e8f5e8
    style F fill:#fff3e0
    style E fill:#e1f5fe
    style J fill:#f3e5f5
```

### **Port Calculation Examples**

| Folder Name              | Suffix    | Hash | Web Port | Admin Port | API Port | PostgreSQL |
| ------------------------ | --------- | ---- | -------- | ---------- | -------- | ---------- |
| `aegisx-starter`         | None      | -    | 4200     | 4201       | 3333     | 5432       |
| `aegisx-starter-1`       | "1"       | 49   | 4249     | 4250       | 3382     | 5481       |
| `aegisx-starter-2`       | "2"       | 50   | 4250     | 4251       | 3383     | 5482       |
| `aegisx-starter-auth`    | "auth"    | 33   | 4233     | 4234       | 3366     | 5465       |
| `aegisx-starter-payment` | "payment" | 12   | 4212     | 4213       | 3345     | 5444       |

### **Hash Algorithm**

```javascript
// Simple hash function for consistent port assignment
function simpleHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash += input.charCodeAt(i);
  }
  return hash % 100; // Keep within reasonable range
}
```

## 🔧 Technical Implementation

### **Environment Variable Integration**

#### **Generated `.env.local`**

```bash
# Instance configuration for: auth
INSTANCE_NAME=auth
FOLDER_NAME=aegisx-starter-auth

# Frontend Configuration
WEB_PORT=4233
ADMIN_PORT=4234
WEB_URL=http://localhost:4233
ADMIN_URL=http://localhost:4234

# Backend Configuration
API_PORT=3366
DATABASE_URL=postgresql://postgres:postgres@localhost:5465/aegisx_db
REDIS_URL=redis://localhost:6412
```

#### **Package.json Scripts Integration**

```json
{
  "scripts": {
    "dev:api": "nx serve api --port=${API_PORT:-3333}",
    "dev:web": "nx serve web --port=${WEB_PORT:-4200}",
    "dev:admin": "nx serve admin --port=${ADMIN_PORT:-4201}",
    "dev": "nx run-many --target=serve --projects=api,web --parallel",
    "dev:all": "nx run-many --target=serve --projects=api,web,admin --parallel"
  }
}
```

### **Angular CLI Integration**

#### **How It Works**

```bash
# Environment variables are passed to Angular CLI
WEB_PORT=4233 pnpm dev:web
# Executes: nx serve web --port=4233

# Fallback to defaults if no environment variable
pnpm dev:web
# Executes: nx serve web --port=4200
```

#### **No project.json Changes Required**

Unlike other approaches, AegisX doesn't require modifying Angular's `project.json` files:

```json
// ❌ Traditional approach - requires project.json modification
{
  "serve": {
    "options": {
      "port": "$WEB_PORT" // Doesn't work - Angular doesn't process env vars
    }
  }
}

// ✅ AegisX approach - uses CLI parameters
// nx serve web --port=${WEB_PORT:-4200}
```

## 🏗️ Development Workflows

### **Single Instance Development**

```bash
# Main repository - uses defaults
cd aegisx-starter
pnpm setup              # No instance files generated
pnpm dev                # Web: 4200, Admin: 4201, API: 3333

# Access applications
open http://localhost:4200  # Web app
open http://localhost:4201  # Admin app
open http://localhost:3333  # API docs
```

### **Multi-Instance Development**

```bash
# Terminal 1: Authentication feature
cd aegisx-starter-auth
pnpm setup              # Generates: Web: 4233, Admin: 4234, API: 3366
pnpm dev:all           # Start all apps with unique ports
# Web: http://localhost:4233, Admin: http://localhost:4234

# Terminal 2: Payment feature
cd aegisx-starter-payment
pnpm setup              # Generates: Web: 4212, Admin: 4213, API: 3345
pnpm dev:all           # Start all apps with different unique ports
# Web: http://localhost:4212, Admin: http://localhost:4213

# Terminal 3: UI improvements
cd aegisx-starter-ui
pnpm setup              # Generates: Web: 4245, Admin: 4246, API: 3378
pnpm dev:all           # Start all apps with different unique ports
# Web: http://localhost:4245, Admin: http://localhost:4246

# All instances run simultaneously with ZERO conflicts! 🎉
```

### **Individual App Development**

```bash
# Start only specific apps with dynamic ports
cd aegisx-starter-auth

pnpm dev:web           # Web app only on port 4233
pnpm dev:admin         # Admin app only on port 4234
pnpm dev:api           # API only on port 3366

# Mix and match as needed
pnpm dev               # API + Web only
pnpm dev:all          # All three apps
```

## 📋 Naming Convention Support

### **Supported Patterns**

```bash
# ✅ All these patterns work:
aegisx-starter              → Default ports
aegisx-starter-1           → Unique ports (numeric)
aegisx-starter-2           → Unique ports (numeric)
aegisx-starter-feature     → Unique ports (descriptive)
aegisx-starter-auth-fix    → Unique ports (multi-word)
aegisx-starter-ui-v2       → Unique ports (version)
aegisx-starter-team-a      → Unique ports (team-based)
```

### **Recommended Naming**

```bash
# 🎯 Feature-based (Recommended)
aegisx-starter-authentication
aegisx-starter-payment-gateway
aegisx-starter-user-management
aegisx-starter-dashboard-redesign

# 🔢 Numeric (Simple)
aegisx-starter-1
aegisx-starter-2
aegisx-starter-3

# 👥 Team-based
aegisx-starter-team-frontend
aegisx-starter-team-backend
aegisx-starter-team-mobile

# 🐛 Bug fixes
aegisx-starter-bug-123
aegisx-starter-hotfix-auth
aegisx-starter-critical-fix
```

## 🎮 Advanced Usage

### **Environment-Specific Instances**

```bash
# Development environment variations
aegisx-starter-dev-1       → Different ports for dev testing
aegisx-starter-dev-auth    → Dev-specific auth testing
aegisx-starter-staging     → Staging environment testing

# Each gets unique ports automatically
```

### **Team Coordination**

```bash
# Team members working on same feature
# Developer A:
git clone repo aegisx-starter-dashboard
cd aegisx-starter-dashboard && pnpm setup
# Gets: Web: 4266, Admin: 4267

# Developer B:
git clone repo aegisx-starter-dashboard
cd aegisx-starter-dashboard && pnpm setup
# Gets: Web: 4266, Admin: 4267 (SAME ports - predictable!)

# Different machines, same folder name = same ports
```

### **Port Registry Tracking**

```bash
# Check all active instances and their ports
cat ~/.aegisx-port-registry

# Example output:
# auth:5465:6412:3366:4233:4234:5083:2025-09-14_10:15
# payment:5444:6388:3345:4212:4213:5062:2025-09-14_10:22
# ui:5478:6425:3378:4245:4246:5096:2025-09-14_10:30
```

## 🛠️ Troubleshooting

### **Port Already in Use**

```bash
# Problem: Port 4233 is already in use
Error: Port 4233 is already in use

# Solution 1: Check what's using the port
lsof -i :4233
kill <PID>

# Solution 2: Use different folder name
mv aegisx-starter-auth aegisx-starter-auth-v2
cd aegisx-starter-auth-v2 && pnpm setup  # Gets different ports

# Solution 3: Stop conflicting instances
./scripts/port-manager.sh stop-all
```

### **Environment Variables Not Loading**

```bash
# Problem: Angular still uses default ports

# Check if .env.local exists
ls -la .env.local

# Regenerate if missing
pnpm setup:env

# Check environment variables are loaded
source .env.local && echo $WEB_PORT

# Verify package.json scripts
cat package.json | grep "dev:web"
```

### **Docker Services Conflict**

```bash
# Problem: Docker services conflict with old containers

# Check running containers
docker ps --filter "name=aegisx"

# Stop old default containers
docker stop aegisx_postgres aegisx_redis 2>/dev/null || true
docker rm aegisx_postgres aegisx_redis 2>/dev/null || true

# Start with instance-specific containers
pnpm run docker:up
```

### **Angular Serve Fails**

```bash
# Problem: nx serve web --port=$WEB_PORT fails

# Check Nx version compatibility
nx --version

# Try with explicit port
nx serve web --port=4233

# Check if project.json has conflicting port settings
cat apps/web/project.json | grep -i port
```

## 🔍 Debugging & Monitoring

### **Port Verification**

```bash
# Check all assigned ports for current instance
source .env.local
echo "Web: $WEB_PORT, Admin: $ADMIN_PORT, API: $API_PORT"

# Verify ports are available
lsof -i :$WEB_PORT || echo "Port $WEB_PORT available"
lsof -i :$ADMIN_PORT || echo "Port $ADMIN_PORT available"
lsof -i :$API_PORT || echo "Port $API_PORT available"
```

### **Service Health Checks**

```bash
# Check if services are running on correct ports
curl -f http://localhost:$WEB_PORT || echo "Web app not responding"
curl -f http://localhost:$ADMIN_PORT || echo "Admin app not responding"
curl -f http://localhost:$API_PORT/health || echo "API not responding"
```

### **Instance Status Overview**

```bash
# Show all running services for current instance
echo "=== Instance: $(basename $(pwd)) ==="
source .env.local 2>/dev/null || echo "No .env.local found"
echo "Web App: http://localhost:${WEB_PORT:-4200}"
echo "Admin App: http://localhost:${ADMIN_PORT:-4201}"
echo "API: http://localhost:${API_PORT:-3333}"
echo "Database: localhost:${POSTGRES_PORT:-5432}"
echo ""
docker ps --filter "name=aegisx_${INSTANCE_NAME:-main}" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

## 🎯 Best Practices

### **1. Consistent Naming**

```bash
# Good: Clear, descriptive names
aegisx-starter-user-authentication
aegisx-starter-payment-integration
aegisx-starter-mobile-responsive

# Avoid: Generic or unclear names
aegisx-starter-test
aegisx-starter-temp
aegisx-starter-fix
```

### **2. Instance Lifecycle**

```bash
# Start new instance
git clone repo aegisx-starter-feature
cd aegisx-starter-feature
pnpm setup    # Generate config
pnpm dev:all  # Start all services

# Pause instance (preserve data)
pnpm run docker:down

# Resume instance
pnpm run docker:up && pnpm dev:all

# Clean up instance
pnpm run docker:down -v
rm -f .env.local docker-compose.instance.yml
```

### **3. Team Communication**

```bash
# Document your instance in team channels
echo "Working on authentication feature"
echo "Instance: aegisx-starter-auth"
echo "Ports: Web(4233), Admin(4234), API(3366)"
echo "Database: localhost:5465"
```

### **4. Resource Management**

```bash
# Weekly cleanup routine
./scripts/port-manager.sh list
./scripts/port-manager.sh stop-all
docker system prune -f

# Remove unused instance configs
find . -name ".env.local" -type f -delete
find . -name "docker-compose.instance.yml" -type f -delete
```

## 📈 Performance Considerations

### **Resource Allocation**

```bash
# Each instance consumes:
# - PostgreSQL: ~256MB RAM
# - Redis: ~64MB RAM
# - API (Node.js): ~512MB RAM
# - Angular Dev Server: ~256MB RAM per app

# Recommended limits:
# - 4GB RAM: 2-3 instances
# - 8GB RAM: 4-6 instances
# - 16GB RAM: 8+ instances
```

### **Development Machine Setup**

```bash
# Optimize for multi-instance development
# Increase file watch limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

# Increase max open files
ulimit -n 4096

# Use faster storage (SSD recommended)
# Consider using Docker volume cleanup
docker volume prune -f
```

## 🎉 Benefits & Features

### **✅ Complete Isolation**

- **Zero port conflicts** across all services (Web, Admin, API, Database, Redis)
- **Unique container names** and **separate Docker volumes**
- **Independent development environments** per instance

### **✅ Developer Experience**

- **One-command setup** - `pnpm setup` does everything
- **Predictable behavior** - same folder name = same ports across machines
- **Backward compatible** - main repo works without changes
- **Smart fallbacks** - graceful degradation to defaults

### **✅ Team Productivity**

- **Parallel development** - multiple features simultaneously
- **No coordination required** - automatic port assignment
- **Consistent environments** - reproducible across team members
- **Visual feedback** - clear port assignments in terminal output

### **✅ Production Ready**

- **Environment hierarchy** - `.env.local` overrides `.env`
- **Docker integration** - complete container isolation
- **CI/CD compatible** - works with automated pipelines
- **Security conscious** - instance files are git-ignored

## 🔗 Related Documentation

- **[Multi-Instance Docker Workflow](../infrastructure/multi-instance-docker-workflow.md)** - Complete system architecture
- **[Multi-Instance Setup Guide](./multi-instance-setup.md)** - Detailed configuration steps
- **[Multi-Instance Commands Reference](../references/multi-instance-commands.md)** - All available commands

---

**Next Steps:**

1. Try creating your first instance: `git clone repo aegisx-starter-test && cd aegisx-starter-test && pnpm setup`
2. Start development with automatic port assignment: `pnpm dev:all`
3. Open multiple instances and see the magic of zero-conflict development! 🚀
