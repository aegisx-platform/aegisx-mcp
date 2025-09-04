# Clone Setup Guide for Multi-Clone Development

**Purpose**: Ensure all clones work independently without conflicts

## 🚀 Initial Clone Setup

### Step 1: Clone Repository

```bash
# Clone 1
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-1
cd aegisx-starter-1

# Clone 2
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-2
cd aegisx-starter-2

# Clone 3
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-3
cd aegisx-starter-3
```

### Step 2: Configure Environment

```bash
# In each clone directory, create .env.local
# This overrides .env for local development

# Clone 1
echo "API_PORT=3334
WEB_PORT=4201
ADMIN_PORT=4202" > .env.local

# Clone 2
echo "API_PORT=3335
WEB_PORT=4203
ADMIN_PORT=4204" > .env.local

# Clone 3
echo "API_PORT=3336
WEB_PORT=4205
ADMIN_PORT=4206" > .env.local
```

### Step 3: Initial Setup & Verification

```bash
# Run in each clone
npm install
./scripts/fix-dependencies.sh  # Fix any missing dependencies
./scripts/pre-push-check.sh    # Verify everything works
```

---

## 📋 Daily Workflow

### Morning Sync (REQUIRED)

```bash
# 1. Pull latest changes
git pull origin develop

# 2. Install new dependencies
npm install

# 3. Run verification
./scripts/pre-push-check.sh

# 4. If fails, fix before starting work
./scripts/fix-dependencies.sh
```

### Before Starting Work

```bash
# 1. Check what others are working on
cat WORK_DISTRIBUTION.md

# 2. Update your status
echo "Clone X: Working on [feature]" >> WORK_DISTRIBUTION.md

# 3. Create feature branch for risky changes
git checkout -b feature/clone1-specific-work
```

### Before Every Push

```bash
# MANDATORY: Run pre-push check
./scripts/pre-push-check.sh

# Only push if all checks pass
git push origin develop
```

---

## 🛠️ Quick Reference Commands

### Check Port Availability

```bash
# Check if your ports are free
lsof -i :3334  # API port
lsof -i :4201  # Web port
lsof -i :4202  # Admin port
```

### Run Your Clone Services

```bash
# Start only your API (uses .env.local ports)
nx serve api

# Start only your web app
nx serve web

# Start only admin
nx serve admin

# Start all with your ports
nx run-many --target=serve --projects=api,web,admin
```

### Fix Common Issues

```bash
# Dependencies out of sync
./scripts/fix-dependencies.sh

# Build cache issues
nx reset
nx build api --skip-nx-cache

# Port already in use
kill -9 $(lsof -t -i:3334)  # Kill process on port
```

---

## ⚠️ Rules to Prevent Problems

### 1. NEVER Push Without Testing

```bash
# Bad ❌
git add .
git commit -m "Add feature"
git push

# Good ✅
git add .
git commit -m "Add feature"
./scripts/pre-push-check.sh
# Only push if passes
git push
```

### 2. NEVER Modify These Without Coordination

- package.json
- package-lock.json
- nx.json
- tsconfig.base.json
- Any migration files

### 3. ALWAYS Communicate

- Before: "Starting work on X feature"
- Problem: "Build failing with Y error"
- After: "Pushed X feature, no breaking changes"

---

## 🔧 Troubleshooting Checklist

### Clone Won't Build After Pull

1. **Clean Install**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Fix Dependencies**

   ```bash
   ./scripts/fix-dependencies.sh
   ```

3. **Reset Nx Cache**

   ```bash
   nx reset
   ```

4. **Check for Duplicate Imports**
   - Look in apps/api/src/main.ts
   - Fix any duplicate plugin registrations

5. **Verify Ports**
   - Check .env.local exists
   - Ensure ports are not in use

### Type Errors

```bash
# Install missing types
npm install --save-dev @types/node @types/jest

# Rebuild TypeScript
npx tsc --build --clean
npx tsc --build
```

### Integration Test Failures

```bash
# Ensure database is running
docker-compose up -d postgres redis

# Run migrations
npx knex migrate:latest

# Run seeds
npx knex seed:run
```

---

## 📱 Emergency Contacts

### If You Break The Build

1. **Immediately** notify team
2. Try to fix within 15 minutes
3. If can't fix, revert:
   ```bash
   git revert HEAD
   git push origin develop
   ```

### Need Help?

- Check: MULTI_CLONE_DEVELOPMENT_STANDARDS.md
- Run: ./scripts/pre-push-check.sh
- Ask: Team chat before making risky changes

---

## ✅ Clone Health Check

Run this daily to ensure your clone is healthy:

```bash
#!/bin/bash
# Save as scripts/health-check.sh

echo "🏥 Clone Health Check"
echo "===================="

# 1. Git status
echo -n "Git status: "
if [[ -z $(git status -s) ]]; then
  echo "✅ Clean"
else
  echo "⚠️  Uncommitted changes"
fi

# 2. Dependencies
echo -n "Dependencies: "
if npm ls > /dev/null 2>&1; then
  echo "✅ Valid"
else
  echo "❌ Issues found"
fi

# 3. Build status
echo -n "API build: "
if nx build api > /dev/null 2>&1; then
  echo "✅ Success"
else
  echo "❌ Failed"
fi

# 4. Port availability
echo -n "Ports: "
source .env.local 2>/dev/null
if ! lsof -i :${API_PORT:-3333} > /dev/null 2>&1; then
  echo "✅ Available"
else
  echo "⚠️  In use"
fi

echo "===================="
```

Remember: **A healthy clone = A productive developer!** 🚀
