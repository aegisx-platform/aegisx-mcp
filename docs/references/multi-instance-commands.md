# Multi-Instance Development - Quick Reference

> **⚡ Quick command reference for managing multiple AegisX instances**

## 🚀 **Setup Commands**

### **Initial Setup (New Clone)**

```bash
# Clone with feature-specific name
git clone [repo] aegisx-starter-mpv
cd aegisx-starter-mpv

# One-command setup
pnpm setup
# ↳ Runs: setup-env.sh → docker-compose up → db:migrate → db:seed
```

### **Manual Setup Steps**

```bash
# 1. Generate environment config
pnpm run setup:env

# 2. Start services
pnpm run docker:up

# 3. Initialize database
pnpm run db:migrate && pnpm run db:seed

# 4. Start development
pnpm dev
```

## 🛠️ **Instance Management**

### **Port Manager Commands**

```bash
# View all instances
./scripts/port-manager.sh list
./scripts/port-manager.sh ls

# Check port conflicts
./scripts/port-manager.sh conflicts
./scripts/port-manager.sh check

# Show running services
./scripts/port-manager.sh running
./scripts/port-manager.sh status

# Stop specific instance
./scripts/port-manager.sh stop aegisx-starter-mpv

# Stop all instances
./scripts/port-manager.sh stop-all

# Clean up unused resources
./scripts/port-manager.sh cleanup
```

### **Docker Commands**

```bash
# Start current instance services
docker-compose -f docker-compose.instance.yml up -d
# OR use npm scripts
pnpm run docker:up

# Stop current instance services
docker-compose -f docker-compose.instance.yml down
# OR use npm scripts
pnpm run docker:down

# View running containers (current instance only)
pnpm run docker:ps

# View all AegisX containers (all instances)
docker ps --filter "name=aegisx"

# Remove specific containers
docker rm -f aegisx_mpv_postgres aegisx_mpv_redis
```

## 📊 **Status & Monitoring**

### **Check Instance Status**

```bash
# Quick status check
./scripts/port-manager.sh running

# Detailed port assignments
./scripts/port-manager.sh list

# Check for conflicts
./scripts/port-manager.sh conflicts
```

### **Port Usage**

```bash
# Check what's using a port
lsof -i :5433
lsof -i :6381

# Check all AegisX services
lsof -i :5432-5500 | grep LISTEN
```

### **Registry Information**

```bash
# View port registry
cat ~/.aegisx-port-registry

# Current instance config
cat .env.local
cat docker-compose.instance.yml
```

## 🔧 **Development Workflow**

### **Starting Work**

```bash
# Stop other instances (optional)
./scripts/port-manager.sh stop-all

# Start current instance
cd aegisx-starter-mpv
pnpm dev
# ↳ API: http://localhost:3334
# ↳ Web: http://localhost:4201
```

### **Switching Features**

```bash
# Switch to different feature
cd ../aegisx-starter-rbac
pnpm dev
# ↳ Runs on different ports automatically
```

### **Parallel Development**

```bash
# Terminal 1: MPV feature
cd aegisx-starter-mpv && pnpm dev

# Terminal 2: RBAC feature
cd aegisx-starter-rbac && pnpm dev

# Both run simultaneously on different ports!
```

## 🐛 **Troubleshooting**

### **Port Conflicts**

```bash
# Find conflicting process
lsof -i :5433

# Stop all instances
./scripts/port-manager.sh stop-all

# Kill specific process
kill -9 [PID]

# Regenerate config
pnpm run setup:env
```

### **Container Issues**

```bash
# Remove all AegisX containers
docker ps -a | grep aegisx | awk '{print $1}' | xargs docker rm -f

# Remove all AegisX volumes
docker volume ls | grep aegisx | awk '{print $2}' | xargs docker volume rm

# Clean rebuild
./scripts/port-manager.sh cleanup
pnpm setup
```

### **Environment Issues**

```bash
# Regenerate config files
rm -f .env.local docker-compose.instance.yml
pnpm run setup:env

# Check generated config
cat .env.local
```

### **Database Issues**

```bash
# Reset current instance database
pnpm run db:reset

# Complete fresh start
pnpm run docker:down -v
pnpm setup
```

## 📋 **Configuration Files**

### **Auto-Generated Files (Git Ignored)**

- ✅ `.env.local` - Instance-specific environment variables
- ✅ `docker-compose.instance.yml` - Complete instance-specific compose file

### **Committed Files**

- ✅ `.env.example` - Environment template
- ✅ `docker-compose.yml` - Base compose configuration
- ✅ `scripts/setup-env.sh` - Setup automation
- ✅ `scripts/port-manager.sh` - Management utilities

## 🎯 **Common Port Assignments**

| Folder                | PostgreSQL | Redis | API  | Web  | Admin |
| --------------------- | ---------- | ----- | ---- | ---- | ----- |
| `aegisx-starter`      | 5432       | 6379  | 3333 | 4200 | 4201  |
| `aegisx-starter-mpv`  | 5433       | 6381  | 3334 | 4201 | 4202  |
| `aegisx-starter-rbac` | 5434       | 6382  | 3335 | 4202 | 4203  |
| `aegisx-starter-auth` | 5435       | 6383  | 3336 | 4203 | 4204  |

_Ports calculated using hash algorithm for consistency_

## 🚨 **Emergency Commands**

### **Complete Reset**

```bash
# Nuclear option: reset everything
./scripts/port-manager.sh stop-all
./scripts/port-manager.sh cleanup
docker system prune -f
rm -f .env.local docker-compose.instance.yml
pnpm setup
```

### **Force Clean State**

```bash
# Remove all AegisX resources
docker ps -aq --filter "name=aegisx" | xargs -r docker rm -f
docker volume ls -q --filter "name=postgres_data" | xargs -r docker volume rm
docker volume ls -q --filter "name=redis_data" | xargs -r docker volume rm
```

## 💡 **Pro Tips**

### **Aliases (Add to ~/.bashrc or ~/.zshrc)**

```bash
alias pm='./scripts/port-manager.sh'
alias pml='./scripts/port-manager.sh list'
alias pmr='./scripts/port-manager.sh running'
alias pms='./scripts/port-manager.sh stop-all'
alias pmc='./scripts/port-manager.sh cleanup'

# Usage
pm list
pmr
pms
```

### **Environment Variables**

```bash
# Set default instance name
export AEGISX_DEFAULT_INSTANCE="mpv"

# Skip confirmation prompts
export AEGISX_AUTO_CONFIRM=1
```

### **VS Code Workspace**

```json
// .vscode/settings.json
{
  "terminal.integrated.env.osx": {
    "API_URL": "http://localhost:${config:aegisx.apiPort}",
    "WEB_URL": "http://localhost:${config:aegisx.webPort}"
  }
}
```

---

**📖 For detailed setup instructions, see [Multi-Instance Setup Guide](./multi-instance-setup.md)**
