# CRUD Generator Git Workflow

> **⚠️ CRITICAL: libs/aegisx-cli/ is synced to a separate repository**

## Overview

The CRUD Generator library (`libs/aegisx-cli/`) is maintained in the main monorepo but published as a standalone NPM package from a separate repository using git subtree.

**Repositories:**

- **Main Monorepo**: https://github.com/aegisx-platform/aegisx-starter
- **Package Repository**: https://github.com/aegisx-platform/crud-generator

## Mandatory Steps After Making Changes

**Every time you modify files in `libs/aegisx-cli/`:**

```bash
# 1. Commit changes in main monorepo
git add libs/aegisx-cli/
git commit -m "docs(crud-generator): update documentation"

# 2. ⚠️ CRITICAL: Sync to separate crud-generator repository
./libs/aegisx-cli/sync-to-repo.sh develop

# 3. Push main monorepo
git push origin develop

# 4. (Optional) Publish to NPM if package.json version changed
cd libs/aegisx-cli
npm publish
```

## Git Subtree Commands

### Sync to Separate Repository (Most Common)

```bash
# Using helper script (recommended)
./libs/aegisx-cli/sync-to-repo.sh develop

# Manual sync (if script unavailable)
git subtree push --prefix=libs/aegisx-cli \
  git@github.com:aegisx-platform/crud-generator.git develop
```

### Pull Updates from Separate Repository (Rare)

```bash
git subtree pull --prefix=libs/aegisx-cli \
  git@github.com:aegisx-platform/crud-generator.git develop --squash
```

## Version Release & NPM Publishing

### Communication Guidelines

**Use these EXACT phrases when working with Claude:**

| What You Want    | Say This to Claude                      | What Claude Will Do                                                                      |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Version Bump** | "ออก version CRUD generator เป็น X.X.X" | 1. Bump package.json version<br>2. Commit in main repo<br>3. Sync to crud-generator repo |
| **Tag Creation** | "สร้าง tag CRUD generator vX.X.X"       | Create tag in **crud-generator repo only** (NOT main repo)                               |
| **NPM Publish**  | "publish CRUD generator ไป npm"         | User provides OTP, Claude runs publish.sh                                                |
| **Full Release** | "release CRUD generator vX.X.X"         | Complete workflow: bump → commit → sync → tag → npm publish                              |
| **Sync Only**    | "sync CRUD generator"                   | Git subtree push to crud-generator repo                                                  |

### Complete Release Workflow

**When you say: "release CRUD generator v2.1.0"**

```bash
# Step 1: Version Bump & Commit (in main repo)
cd libs/aegisx-cli
# Edit package.json: "version": "2.1.0"
git add .
git commit -m "chore(crud-generator): bump version to 2.1.0"
git push origin develop

# Step 2: Sync to Separate Repository
cd /path/to/main/repo
./libs/aegisx-cli/sync-to-repo.sh develop

# Step 3: Create Tag in CRUD Generator Repo (NOT main repo!)
git push git@github.com:aegisx-platform/crud-generator.git \
  <commit-hash>:refs/tags/v2.1.0

# Step 4: Publish to NPM (user provides OTP)
cd libs/aegisx-cli
./publish.sh <OTP-CODE>
```

## Critical Rules

### DO ✅

- ✅ Create tags in **crud-generator repository** (`git@github.com:aegisx-platform/crud-generator.git`)
- ✅ Always sync to separate repo before creating tags
- ✅ Wait for user to provide OTP before npm publish
- ✅ Use semantic versioning (major.minor.patch)

### DON'T ❌

- ❌ NEVER create version tags in main aegisx-starter repository
- ❌ NEVER create tags before syncing to separate repo
- ❌ NEVER publish without user's explicit OTP code
- ❌ NEVER skip git subtree sync step

## Architecture Overview

```
Main Monorepo (aegisx-starter)
└── libs/aegisx-cli/
    │
    ├─ git subtree push ──→ Separate Repo (crud-generator)
    │                       └── NPM Package Source
    │                           ├── Tags (v2.1.0, v2.0.1, etc.)
    │                           └── npm publish → registry.npmjs.org
    │
    └─ ❌ NO TAGS HERE! Tags belong in separate repo only
```

### Benefits

1. Main repo stays clean (no package-specific tags)
2. NPM package has its own version history
3. Separation of concerns: monorepo vs. published package
4. Easy to manage multiple packages in future

## Quick Reference Examples

### Example 1: Full Release

```
User: "ออก version CRUD generator 2.1.0 แล้ว publish"
Claude:
1. ✅ Bump package.json to 2.1.0
2. ✅ Commit to main repo
3. ✅ Sync to crud-generator repo
4. ✅ Create tag v2.1.0 in crud-generator repo
5. ⏸️ Wait for user OTP
User: "OTP: 123456"
Claude: ✅ Publish to npm
```

### Example 2: Sync Only

```
User: "sync CRUD generator"
Claude: ✅ Git subtree push to crud-generator repo
```

### Example 3: Tag Only

```
User: "สร้าง tag v2.1.0 ให้ CRUD generator"
Claude: ✅ Create tag in crud-generator repo (NOT main repo)
```

## Why This Matters

- `libs/aegisx-cli/` is published as standalone NPM package
- Separate repository: https://github.com/aegisx-platform/crud-generator
- Main monorepo is source of truth, must sync to separate repo
- NPM package is built from separate repository
- ⚠️ **DO NOT FORGET** the git subtree push or changes won't appear in the separate crud-generator repository!

## Troubleshooting

### Changes Not Appearing in Package Repository

**Problem**: Made changes in main monorepo but they don't show up in crud-generator repository.

**Solution**: You forgot to run the sync step!

```bash
./libs/aegisx-cli/sync-to-repo.sh develop
```

### Cannot Create Tag

**Problem**: Trying to create tag in main repository instead of package repository.

**Solution**: Tags must be created in the crud-generator repository:

```bash
# Correct: Create tag in package repo
git push git@github.com:aegisx-platform/crud-generator.git \
  <commit-hash>:refs/tags/v2.1.0

# Wrong: Never create tags in main repo for the package
git tag v2.1.0  # ❌ Don't do this for CRUD generator versions
```

### Publish Fails

**Problem**: NPM publish returns authentication error.

**Solution**:

1. Ensure you're logged in: `npm whoami`
2. Get fresh OTP from authenticator app
3. Run publish script with OTP: `./publish.sh <OTP>`

---

**For usage documentation, see [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
