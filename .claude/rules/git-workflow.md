---
paths: '**/*'
---

# Git Workflow Rules

## CRITICAL: Commit Message Rules

### ❌ NEVER Include These

```bash
# ❌ FORBIDDEN - DO NOT USE
git commit -m "feat: add feature

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# ❌ FORBIDDEN - Triggers major version bump
git commit -m "BREAKING CHANGE: ..."
```

### ✅ Correct Commit Messages

```bash
# ✅ CORRECT: Clean, descriptive messages
git commit -m "feat(inventory): add drug catalog CRUD operations"
git commit -m "fix(budget): correct remaining amount calculation"
git commit -m "docs: update API contracts for inventory module"
git commit -m "refactor(auth): simplify token validation logic"

# For important changes, use these instead of BREAKING CHANGE:
git commit -m "IMPORTANT: inventory schema migration required"
git commit -m "MAJOR UPDATE: refactor authentication system"
git commit -m "MIGRATION: update database schema for budgets"
```

## Commit Message Format

### Standard Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies
- `perf`: Performance improvements
- `style`: Code style (formatting, no logic change)

### Scopes (examples)

- `inventory`: Inventory module
- `budget`: Budget module
- `auth`: Authentication
- `api`: Backend API
- `web`: Frontend
- `db`: Database
- `cli`: CRUD generator

### Examples

```bash
# Feature
git commit -m "feat(inventory): implement stock transaction tracking"

# Bug fix
git commit -m "fix(budget): prevent negative budget allocations"

# Documentation
git commit -m "docs(api): add API contracts for inventory endpoints"

# Refactor
git commit -m "refactor(auth): extract JWT validation to separate service"

# Multiple files
git commit -m "feat(inventory): add drug catalog module

- Add migration for drug_catalogs table
- Implement CRUD endpoints
- Create Angular component for catalog list
- Add TypeBox schemas for validation"
```

## Git Add Rules

### ❌ NEVER Use These

```bash
# ❌ FORBIDDEN - Adds everything including unwanted files
git add -A
git add .
git add --all
```

### ✅ ALWAYS Add Specific Files

```bash
# ✅ CORRECT: Add specific files only
git add apps/api/src/modules/inventory/drug-catalog.routes.ts
git add apps/api/src/modules/inventory/drug-catalog.service.ts
git add apps/web/src/app/modules/inventory/drug-catalog-list.component.ts

# ✅ CORRECT: Add specific directory
git add apps/api/src/database/migrations/

# ✅ CORRECT: Add pattern
git add apps/api/src/modules/inventory/*.ts

# ✅ CORRECT: Add multiple specific files
git add \
  apps/api/src/modules/inventory/drug-catalog.routes.ts \
  apps/api/src/modules/inventory/drug-catalog.service.ts \
  apps/web/src/app/modules/inventory/drug-catalog-list.component.ts
```

## Pre-Commit Workflow

### MANDATORY Steps Before Every Commit

```bash
# 1. Check git status
git status

# 2. Build project (MUST pass!)
pnpm run build

# 3. Add specific files only
git add apps/api/src/modules/inventory/drug-catalog.routes.ts
git add apps/api/src/modules/inventory/drug-catalog.service.ts

# 4. Check what's staged
git diff --staged

# 5. Commit with proper message
git commit -m "feat(inventory): add drug catalog CRUD operations"

# 6. Verify commit
git log -1 --stat
```

### If Build Fails

```bash
# ❌ DO NOT commit if build fails!
pnpm run build
# Error: TypeScript errors found

# ✅ Fix errors first
# ... fix TypeScript errors ...

# Then build again
pnpm run build
# Success!

# Now you can commit
git add fixed-file.ts
git commit -m "fix(inventory): resolve TypeScript errors in drug catalog service"
```

## Git Subtree Management

### Shared Libraries (Read-Only in Monorepo)

These directories are synced to separate repos:

- `libs/aegisx-cli` → `aegisx-platform/crud-generator`
- `libs/aegisx-ui` → `aegisx-platform/aegisx-ui`
- `libs/aegisx-mcp` → `aegisx-platform/aegisx-mcp`

### Workflow for Subtree Changes

#### Step 1: Commit to Monorepo FIRST

```bash
# Make changes to shared library
# Example: libs/aegisx-cli/src/generators/crud.ts

# Commit to monorepo
git add libs/aegisx-cli/src/generators/crud.ts
git commit -m "feat(cli): improve CRUD generator template"
git push origin develop
```

#### Step 2: Sync to Separate Repo

```bash
# Use sync script
cd libs/aegisx-cli
bash sync-to-repo.sh

# Or manually
cd libs/aegisx-ui
bash sync-to-repo.sh
```

### ❌ NEVER Modify Subtree Config

```bash
# ❌ DO NOT modify these files:
# - .env.local
# - docker-compose.instance.yml
# - proxy.conf.js
# - libs/*/sync-to-repo.sh (without approval)
```

## Branch Strategy

### Main Branches

- `main` - Production-ready code
- `develop` - Integration branch for features

### Feature Branches

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/inventory-drug-catalog

# Work on feature
# ... make changes ...

# Commit changes
git add specific-files
git commit -m "feat(inventory): add drug catalog component"

# Push to remote
git push origin feature/inventory-drug-catalog

# Create PR to develop
gh pr create --base develop --title "feat(inventory): Add drug catalog CRUD"
```

### Hotfix Branches

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug

# Fix the bug
# ... make changes ...

# Commit
git add specific-files
git commit -m "fix: resolve critical authentication bug"

# Push and create PR to main
git push origin hotfix/fix-critical-bug
gh pr create --base main --title "fix: Critical authentication bug"

# Also merge back to develop
git checkout develop
git merge hotfix/fix-critical-bug
```

## Checking What Changed

### Before Staging

```bash
# See all changes
git diff

# See changes in specific file
git diff apps/api/src/modules/inventory/drug-catalog.routes.ts

# See only file names
git diff --name-only
```

### After Staging

```bash
# See staged changes
git diff --staged

# See staged changes in specific file
git diff --staged apps/api/src/modules/inventory/drug-catalog.routes.ts
```

### After Committing

```bash
# See last commit
git log -1

# See last commit with changes
git show

# See last commit file list
git log -1 --stat

# See last 5 commits
git log -5 --oneline
```

## Undoing Changes

### Before Staging

```bash
# Discard changes in file
git checkout -- apps/api/src/modules/inventory/drug-catalog.routes.ts

# Discard all changes
git checkout -- .
```

### After Staging (Before Commit)

```bash
# Unstage file
git reset HEAD apps/api/src/modules/inventory/drug-catalog.routes.ts

# Unstage all
git reset HEAD
```

### After Committing (Before Push)

```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1

# Amend last commit (add more changes)
git add forgotten-file.ts
git commit --amend --no-edit
```

### After Pushing

```bash
# ❌ NEVER force push to main/develop
git push --force  # DANGEROUS!

# ✅ Create revert commit instead
git revert HEAD
git push origin develop
```

## .gitignore Rules

### Already Ignored

```
# Dependencies
node_modules/
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Build output
build/
coverage/

# Personal notes
CLAUDE.local.md
```

### Checking Ignored Files

```bash
# See what's ignored
git status --ignored

# Check if file is ignored
git check-ignore -v apps/api/.env
```

## Common Mistakes

### ❌ WRONG: Adding everything

```bash
git add -A
git commit -m "update"
git push
```

### ✅ CORRECT: Specific files with good message

```bash
git add apps/api/src/modules/inventory/drug-catalog.routes.ts
git add apps/api/src/modules/inventory/drug-catalog.service.ts
git commit -m "feat(inventory): add drug catalog CRUD endpoints"
git push origin feature/inventory-drug-catalog
```

### ❌ WRONG: Committing without building

```bash
git add file.ts
git commit -m "fix"  # Did not run pnpm run build!
```

### ✅ CORRECT: Build first, then commit

```bash
pnpm run build  # MUST pass!
git add file.ts
git commit -m "fix(inventory): resolve TypeScript error in service"
```

### ❌ WRONG: Using BREAKING CHANGE

```bash
git commit -m "BREAKING CHANGE: refactor API"  # Triggers v2.x.x!
```

### ✅ CORRECT: Use alternatives

```bash
git commit -m "IMPORTANT: API refactoring requires client updates"
git commit -m "MIGRATION: database schema changes required"
```

## Quick Reference Checklist

Before every commit:

- ✅ Run `pnpm run build` and ensure it passes
- ✅ Check `git status` to see what changed
- ✅ Add only specific files (never `git add -A`)
- ✅ Write descriptive commit message with type and scope
- ✅ NO "Generated with Claude Code" or "Co-Authored-By"
- ✅ NO "BREAKING CHANGE:" in message
- ✅ Use `git diff --staged` to review what will be committed
- ✅ For subtree changes, sync to separate repo after monorepo commit

Common commands:

```bash
# Check status
git status

# Build (MUST pass!)
pnpm run build

# Add specific files
git add apps/api/src/modules/inventory/drug-catalog.routes.ts

# Check staged changes
git diff --staged

# Commit with good message
git commit -m "feat(inventory): add drug catalog CRUD operations"

# Push to branch
git push origin feature/inventory-drug-catalog
```
