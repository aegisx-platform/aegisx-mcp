# AegisX UI Git Workflow

> **CRITICAL: libs/aegisx-ui/ is synced to a separate repository and published as npm package**

## Overview

The AegisX UI library (`libs/aegisx-ui/`) is maintained in the main monorepo but published as a standalone NPM package from a separate repository using git subtree.

**Repositories:**

- **Main Monorepo**: https://github.com/aegisx-platform/aegisx-starter
- **Package Repository**: https://github.com/aegisx-platform/aegisx-ui
- **NPM Package**: https://www.npmjs.com/package/@aegisx/ui

## Architecture Overview

```
Main Monorepo (aegisx-starter)
└── libs/aegisx-ui/
    │
    ├─ git subtree push ──→ Separate Repo (aegisx-ui)
    │                       └── NPM Package Source
    │                           ├── Tags (v0.1.0, v0.2.0, etc.)
    │                           └── npm publish → registry.npmjs.org
    │
    └─ NO TAGS HERE! Tags belong in separate repo only
```

## Mandatory Steps After Making Changes

**Every time you modify files in `libs/aegisx-ui/`:**

```bash
# 1. Commit changes in main monorepo
git add libs/aegisx-ui/
git commit -m "feat(aegisx-ui): add new component"

# 2. CRITICAL: Sync to separate aegisx-ui repository
./libs/aegisx-ui/sync-to-repo.sh main

# 3. Push main monorepo
git push origin develop

# 4. (Optional) Publish to NPM if package.json version changed
# See NPM_PUBLISHING.md for details
```

## Git Subtree Commands

### Initial Setup (First Time Only)

If the aegisx-ui repository is empty and you need to push for the first time:

```bash
# Navigate to main repo root
cd /path/to/aegisx-starter

# Split the subtree and create a branch
git subtree split --prefix=libs/aegisx-ui -b aegisx-ui-split

# Push to the separate repository
git push git@github.com:aegisx-platform/aegisx-ui.git aegisx-ui-split:main

# Clean up the temporary branch
git branch -D aegisx-ui-split
```

### Sync to Separate Repository (Most Common)

```bash
# Using helper script (recommended)
./libs/aegisx-ui/sync-to-repo.sh main

# Manual sync (if script unavailable)
git subtree push --prefix=libs/aegisx-ui \
  git@github.com:aegisx-platform/aegisx-ui.git main
```

### Pull Updates from Separate Repository (Rare)

```bash
git subtree pull --prefix=libs/aegisx-ui \
  git@github.com:aegisx-platform/aegisx-ui.git main --squash
```

## Communication Guidelines for Claude

**Use these EXACT phrases when working with Claude:**

| What You Want    | Say This to Claude                 | What Claude Will Do                                                                 |
| ---------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| **Version Bump** | "ออก version aegisx-ui เป็น X.X.X" | 1. Bump package.json version<br>2. Commit in main repo<br>3. Sync to aegisx-ui repo |
| **Tag Creation** | "สร้าง tag aegisx-ui vX.X.X"       | Create tag in **aegisx-ui repo only** (NOT main repo)                               |
| **NPM Publish**  | "publish aegisx-ui ไป npm"         | User provides OTP, Claude runs publish workflow                                     |
| **Full Release** | "release aegisx-ui vX.X.X"         | Complete workflow: bump → commit → sync → tag → npm publish                         |
| **Sync Only**    | "sync aegisx-ui"                   | Git subtree push to aegisx-ui repo                                                  |

## Version Release Workflow

### Complete Release Workflow

**When you say: "release aegisx-ui v0.2.0"**

```bash
# Step 1: Version Bump & Commit (in main repo)
cd libs/aegisx-ui
# Edit package.json: "version": "0.2.0"
# Update CHANGELOG.md with new version notes
git add .
git commit -m "chore(aegisx-ui): bump version to 0.2.0"
git push origin develop

# Step 2: Sync to Separate Repository
cd /path/to/main/repo
./libs/aegisx-ui/sync-to-repo.sh main

# Step 3: Create Tag in AegisX UI Repo (NOT main repo!)
git push git@github.com:aegisx-platform/aegisx-ui.git \
  <commit-hash>:refs/tags/v0.2.0

# Step 4: Build the library
pnpm nx build aegisx-ui

# Step 5: Publish to NPM (user provides OTP)
cd dist/libs/aegisx-ui
../../../libs/aegisx-ui/publish.sh <OTP-CODE>
```

## Critical Rules

### DO

- Create tags in **aegisx-ui repository** (`git@github.com:aegisx-platform/aegisx-ui.git`)
- Always sync to separate repo before creating tags
- Wait for user to provide OTP before npm publish
- Use semantic versioning (major.minor.patch)
- Build library before publishing (`pnpm nx build aegisx-ui`)
- Update CHANGELOG.md with every release

### DON'T

- NEVER create version tags in main aegisx-starter repository
- NEVER create tags before syncing to separate repo
- NEVER publish without user's explicit OTP code
- NEVER skip git subtree sync step
- NEVER publish without building first

## Quick Reference Examples

### Example 1: Full Release

```
User: "ออก version aegisx-ui 0.2.0 แล้ว publish"
Claude:
1. Bump package.json to 0.2.0
2. Update CHANGELOG.md
3. Commit to main repo
4. Sync to aegisx-ui repo
5. Create tag v0.2.0 in aegisx-ui repo
6. Build library
7. Wait for user OTP
User: "OTP: 123456"
Claude: Publish to npm
```

### Example 2: Sync Only

```
User: "sync aegisx-ui"
Claude: Git subtree push to aegisx-ui repo
```

### Example 3: Tag Only

```
User: "สร้าง tag v0.2.0 ให้ aegisx-ui"
Claude: Create tag in aegisx-ui repo (NOT main repo)
```

## Troubleshooting

### Changes Not Appearing in Package Repository

**Problem**: Made changes in main monorepo but they don't show up in aegisx-ui repository.

**Solution**: You forgot to run the sync step!

```bash
./libs/aegisx-ui/sync-to-repo.sh main
```

### First Push Fails with "Updates were rejected"

**Problem**: Separate repository has existing commits that conflict.

**Solution**: Use subtree split for initial setup:

```bash
git subtree split --prefix=libs/aegisx-ui -b aegisx-ui-split
git push git@github.com:aegisx-platform/aegisx-ui.git aegisx-ui-split:main --force
git branch -D aegisx-ui-split
```

### Cannot Create Tag

**Problem**: Trying to create tag in main repository instead of package repository.

**Solution**: Tags must be created in the aegisx-ui repository:

```bash
# Correct: Create tag in package repo
git push git@github.com:aegisx-platform/aegisx-ui.git \
  <commit-hash>:refs/tags/v0.2.0

# Wrong: Never create tags in main repo for the package
git tag v0.2.0  # Don't do this for aegisx-ui versions
```

### Publish Fails

**Problem**: NPM publish returns authentication error.

**Solution**:

1. Ensure you're logged in: `npm whoami`
2. Get fresh OTP from authenticator app
3. Navigate to dist folder: `cd dist/libs/aegisx-ui`
4. Run publish script with OTP: `../../../libs/aegisx-ui/publish.sh <OTP>`

### Build Fails Before Publish

**Problem**: Library doesn't build correctly.

**Solution**:

```bash
# Clean and rebuild
pnpm nx reset
pnpm nx build aegisx-ui

# Check for errors
pnpm nx lint aegisx-ui
pnpm nx test aegisx-ui
```

## Related Documentation

- **[NPM_PUBLISHING.md](./NPM_PUBLISHING.md)** - Detailed npm publishing guide
- **[THEME_SYSTEM_STANDARD.md](./THEME_SYSTEM_STANDARD.md)** - Theme system documentation
- **[TOKEN_REFERENCE.md](./TOKEN_REFERENCE.md)** - Design token reference

---

**For CRUD Generator workflow, see [docs/crud-generator/GIT_WORKFLOW.md](../crud-generator/GIT_WORKFLOW.md)**
