# Multi-Clone Development Standards

**Last Updated**: 2025-09-03  
**Purpose**: Prevent merge conflicts and build failures in multi-clone development

## 🚨 Critical Rule #1: Always Test Before Push

**NEVER push code that hasn't been tested locally!**

---

## 📋 Pre-Development Checklist (Before Starting Work)

### 1. Sync Your Clone

```bash
# Always start with latest code
git pull origin develop
npm install  # or yarn install
```

### 2. Verify Build Works

```bash
# Test build before making changes
nx build api
nx build web
nx build admin

# If build fails, fix it before proceeding
```

### 3. Check Current Dependencies

```bash
# Save current package.json state
cp package.json package.json.backup

# Check for outdated/missing deps
npm outdated
npm ls
```

---

## 🛠️ Development Standards

### 1. When Adding New Dependencies

**❌ NEVER DO THIS:**

```bash
# Don't add dependencies without testing
npm install some-package
git add .
git commit -m "Add feature"
git push
```

**✅ ALWAYS DO THIS:**

```bash
# 1. Install dependency
npm install some-package

# 2. Update package.json in all workspaces if needed
# 3. Test build locally
nx build api
nx test api
nx lint api

# 4. Run integration tests
npm run test:integration

# 5. Only commit if everything passes
git add package.json package-lock.json
git commit -m "feat: add some-package dependency

- Added some-package@1.2.3 for XYZ functionality
- Tested build and all tests pass
- No breaking changes"
```

### 2. When Modifying Core Files

**High-Risk Files (Require Extra Care):**

- `package.json`
- `tsconfig.*.json`
- `nx.json`
- `.env.example`
- Any file in `/apps/api/src/plugins/`
- Database migrations

**Before Modifying:**

1. Communicate in team chat
2. Check if other clones are working on same files
3. Create backup

**After Modifying:**

1. Run full test suite
2. Build all apps
3. Test in Docker if changing configs

### 3. Import Management

**❌ Common Mistakes:**

```typescript
// Duplicate imports
import monitoringPlugin from './plugins/monitoring.plugin';
import { monitoringPlugin } from './modules/monitoring';

// Missing type imports
import winston from 'winston'; // Without @types/winston

// Test code in production files
import { jest } from '@jest/globals';
```

**✅ Best Practices:**

```typescript
// Use unique names for similar imports
import monitoringPlugin from './plugins/monitoring.plugin';
import { monitoringPlugin as monitoringModulePlugin } from './modules/monitoring';

// Ensure types exist
// First: npm install --save-dev @types/winston
import winston from 'winston';

// Keep test code in test files only
// In *.spec.ts or *.test.ts files only
```

---

## 🧪 Testing Standards

### 1. Pre-Push Testing Protocol

```bash
#!/bin/bash
# Create this as scripts/pre-push-check.sh

echo "🔍 Running pre-push checks..."

# 1. Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "❌ Uncommitted changes detected. Commit or stash first."
  exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 3. Run linting
echo "🔍 Running linting..."
nx run-many --target=lint --all --parallel=3
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# 4. Run unit tests
echo "🧪 Running unit tests..."
nx run-many --target=test --all --parallel=3
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed"
  exit 1
fi

# 5. Build all projects
echo "🏗️ Building projects..."
nx run-many --target=build --all --parallel=3
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

# 6. Run integration tests (optional but recommended)
echo "🔄 Running integration tests..."
npm run test:integration
if [ $? -ne 0 ]; then
  echo "⚠️  Integration tests failed (non-blocking)"
fi

echo "✅ All checks passed! Safe to push."
```

### 2. Make Script Executable

```bash
chmod +x scripts/pre-push-check.sh
```

### 3. Use Before Every Push

```bash
./scripts/pre-push-check.sh && git push origin develop
```

---

## 📦 Dependency Management Rules

### 1. Package.json Modifications

**Before Adding Dependencies:**

```bash
# 1. Check if dependency already exists
npm ls package-name

# 2. Check compatibility
npm view package-name versions
npm view package-name peerDependencies

# 3. Install with exact version
npm install package-name@1.2.3 --save-exact

# 4. For dev dependencies
npm install @types/package-name --save-dev --save-exact
```

### 2. Common Dependencies Issues & Solutions

| Package     | Common Issue      | Solution                            |
| ----------- | ----------------- | ----------------------------------- |
| winston     | Version conflicts | Use `winston@^3.14.2`               |
| prom-client | Version too high  | Use `prom-client@^15.1.3`           |
| @types/\*   | Missing types     | Always install corresponding @types |
| jest        | Global not found  | Ensure jest is in devDependencies   |

### 3. Dependency Sync Check

```bash
# Run this to check dependency issues
node -e "
const pkg = require('./package.json');
const required = {
  'winston': '^3.14.2',
  'winston-daily-rotate-file': '^5.0.0',
  'prom-client': '^15.1.3'
};

const missing = [];
const wrongVersion = [];

for (const [name, version] of Object.entries(required)) {
  if (!pkg.dependencies[name] && !pkg.devDependencies[name]) {
    missing.push(\`\${name}@\${version}\`);
  } else if (pkg.dependencies[name] !== version) {
    wrongVersion.push(\`\${name}: has \${pkg.dependencies[name]}, needs \${version}\`);
  }
}

if (missing.length) console.log('Missing:', missing);
if (wrongVersion.length) console.log('Wrong version:', wrongVersion);
if (!missing.length && !wrongVersion.length) console.log('✅ All dependencies OK');
"
```

---

## 🔄 Merge Conflict Prevention

### 1. File Modification Rules

**Sequential Files (MUST coordinate):**

- Database migrations (number sequence)
- Route registration order
- Plugin registration order

**Shared Config Files (Communicate first):**

- package.json
- tsconfig.json
- nx.json
- docker-compose.yml

**Safe for Parallel Work:**

- Feature modules in separate folders
- Component files
- Test files
- Documentation

### 2. Git Workflow

```bash
# Always use feature branches for risky changes
git checkout -b feature/clone1-performance

# Commit frequently with clear messages
git add .
git commit -m "feat(api): add performance monitoring

- Add specific change 1
- Add specific change 2
- All tests passing"

# Before merging to develop
git checkout develop
git pull origin develop
git checkout feature/clone1-performance
git rebase develop  # Resolve conflicts locally
npm install
npm run pre-push-check
git checkout develop
git merge feature/clone1-performance
git push origin develop
```

---

## 🚀 Clone-Specific Setup

### Clone Environment Variables

Each clone should use different ports to avoid conflicts:

**Clone 1 (.env.local):**

```env
API_PORT=3334
WEB_PORT=4201
ADMIN_PORT=4202
```

**Clone 2 (.env.local):**

```env
API_PORT=3335
WEB_PORT=4203
ADMIN_PORT=4204
```

**Clone 3 (.env.local):**

```env
API_PORT=3336
WEB_PORT=4205
ADMIN_PORT=4206
```

---

## ✅ Commit Checklist

Before EVERY commit, ensure:

- [ ] All imports are unique (no duplicates)
- [ ] All dependencies are in package.json
- [ ] Build passes: `nx build [project]`
- [ ] Lint passes: `nx lint [project]`
- [ ] Tests pass: `nx test [project]`
- [ ] No console.log() in production code
- [ ] No hardcoded values (use env vars)
- [ ] No commented-out code
- [ ] API changes are documented
- [ ] Breaking changes are noted

---

## 🆘 Troubleshooting

### Build Fails After Pull

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Clear Nx cache
nx reset

# 3. Rebuild
nx build api --skip-nx-cache
```

### Type Errors

```bash
# Install missing types
npm install --save-dev @types/node @types/jest

# Generate missing types
npx tsc --init
```

### Dependency Conflicts

```bash
# Force resolution
npm install --legacy-peer-deps

# Or use exact versions
npm install package@1.2.3 --save-exact
```

---

## 📢 Communication Protocol

### Before Making Changes:

1. Check #dev-coordination channel
2. Announce what you're working on
3. Check if anyone is touching same files

### After Pushing:

1. Post in channel: "Pushed to develop: [brief description]"
2. Note any breaking changes
3. Update WORK_DISTRIBUTION.md if needed

### If Build Breaks:

1. **IMMEDIATELY** post in channel
2. Either fix within 15 minutes or revert
3. Don't leave develop branch broken

---

## 🎯 Golden Rules

1. **Test Locally** - If it doesn't build locally, don't push
2. **Communicate** - Over-communicate rather than under
3. **Document** - Changes should be self-explanatory
4. **Revert Quickly** - If you break develop, revert fast
5. **Stay Updated** - Pull frequently to avoid conflicts

---

**Remember**: A broken develop branch blocks EVERYONE. Your 5 minutes of testing saves hours for the team!
