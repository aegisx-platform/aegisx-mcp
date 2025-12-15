# Git Subtree Guide - Shared Libraries Management

## Overview

โปรเจกต์นี้ใช้ **Git Subtree** ในการจัดการ shared libraries ที่ต้องเผยแพร่ทั้งใน monorepo และ standalone repository

## Libraries ที่ใช้ Git Subtree

| Library        | Monorepo Path      | Standalone Repo                  | NPM Package              |
| -------------- | ------------------ | -------------------------------- | ------------------------ |
| CRUD Generator | `libs/aegisx-cli/` | `aegisx-platform/crud-generator` | `@aegisx/crud-generator` |
| UI Components  | `libs/aegisx-ui/`  | `aegisx-platform/aegisx-ui`      | `@aegisx/ui`             |
| MCP Server     | `libs/aegisx-mcp/` | `aegisx-platform/aegisx-mcp`     | `@aegisx/mcp`            |

## Git Subtree คืออะไร?

Git Subtree เป็นวิธีการ embed repository หนึ่งไว้ใน subdirectory ของอีก repository หนึ่ง โดยยังคง history ไว้และสามารถ sync กลับไปยัง upstream ได้

```
┌─────────────────────────────────────────────────────────────┐
│                    aegisx-starter (Monorepo)                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  libs/aegisx-cli/  ←──────────────────────────────► crud-generator repo
│  │  libs/aegisx-ui/              ←──────────────────────────────► aegisx-ui repo
│  │  libs/aegisx-mcp/             ←──────────────────────────────► aegisx-mcp repo
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  apps/api/                                           │    │
│  │  apps/admin/                                         │    │
│  │  apps/web/                                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Workflow ที่ถูกต้อง

### 1. แก้ไข Code ใน Monorepo

```bash
# 1. แก้ไขไฟล์ใน libs/[library]/
# 2. Commit ตามปกติ
git add libs/aegisx-mcp/src/tools/components.tool.ts
git commit -m "feat(mcp): add new component tool"

# 3. Push to monorepo
git push origin develop
```

### 2. Sync ไปยัง Standalone Repository

```bash
# ใช้ sync script ที่มีใน library
cd libs/aegisx-mcp
./sync-to-repo.sh

# หรือ sync แบบ manual
git subtree push --prefix=libs/aegisx-mcp git@github.com:aegisx-platform/aegisx-mcp.git main
```

### 3. Publish ไปยัง NPM

```bash
# หลัง sync แล้ว ไปที่ standalone repo เพื่อ publish
cd /tmp
git clone git@github.com:aegisx-platform/aegisx-mcp.git
cd aegisx-mcp
npm publish --access public
```

## การเพิ่ม Library ใหม่ที่ใช้ Subtree

### Step 1: สร้าง Remote Repository

1. สร้าง repository ใหม่บน GitHub (empty repo)
2. ตั้งชื่อตาม convention: `aegisx-platform/[library-name]`

### Step 2: สร้าง Library ใน Monorepo

```bash
# สร้าง directory structure
mkdir -p libs/aegisx-new-lib/src
mkdir -p libs/aegisx-new-lib/bin

# สร้างไฟล์พื้นฐาน
# - package.json
# - tsconfig.json
# - README.md
# - src/index.ts
```

### Step 3: เพิ่ม Sync Script

สร้างไฟล์ `libs/aegisx-new-lib/sync-to-repo.sh`:

```bash
#!/bin/bash

# Sync libs/aegisx-new-lib to separate repository
# Usage: ./sync-to-repo.sh [branch]

BRANCH=${1:-main}
REMOTE_REPO="git@github.com:aegisx-platform/aegisx-new-lib.git"

echo "Syncing @aegisx/new-lib to separate repository..."
echo "Branch: $BRANCH"
echo "Remote: $REMOTE_REPO"
echo ""

# Navigate to project root
cd "$(git rev-parse --show-toplevel)"

# Push subtree to separate repository
echo "Pushing subtree..."
git subtree push --prefix=libs/aegisx-new-lib "$REMOTE_REPO" "$BRANCH"

if [ $? -eq 0 ]; then
  echo ""
  echo "Successfully synced to $REMOTE_REPO"
  echo "View at: https://github.com/aegisx-platform/aegisx-new-lib"
else
  echo ""
  echo "Failed to sync"
  exit 1
fi
```

```bash
chmod +x libs/aegisx-new-lib/sync-to-repo.sh
```

### Step 4: Initial Push to Remote

```bash
# Commit library ใน monorepo ก่อน
git add libs/aegisx-new-lib/
git commit -m "feat: add aegisx-new-lib library"

# Push to monorepo
git push origin develop

# Sync to standalone repo (first time - use split)
git subtree split --prefix=libs/aegisx-new-lib -b aegisx-new-lib-split
git push git@github.com:aegisx-platform/aegisx-new-lib.git aegisx-new-lib-split:main
git branch -D aegisx-new-lib-split
```

### Step 5: อัพเดต Documentation

1. เพิ่มใน `CLAUDE.md` section "Libraries ที่ใช้ Git Subtree"
2. เพิ่มใน table ของ docs นี้

## Sync Scripts Reference

แต่ละ library มี script สำหรับ sync:

| Library        | Sync Command                      |
| -------------- | --------------------------------- |
| CRUD Generator | `libs/aegisx-cli/sync-to-repo.sh` |
| UI Components  | `libs/aegisx-ui/sync-to-repo.sh`  |
| MCP Server     | `libs/aegisx-mcp/sync-to-repo.sh` |

## การดึง Changes จาก Standalone Repo กลับ Monorepo

ในกรณีที่มีคน contribute โดยตรงไปยัง standalone repo:

```bash
# Pull changes from standalone repo
git subtree pull --prefix=libs/aegisx-mcp git@github.com:aegisx-platform/aegisx-mcp.git main --squash

# Resolve conflicts if any, then commit
```

## Common Issues & Solutions

### Issue 1: "Updates were rejected because the tip of your current branch is behind"

```bash
# Solution: Pull ก่อน push
git subtree pull --prefix=libs/aegisx-mcp git@github.com:aegisx-platform/aegisx-mcp.git main --squash
# Then push again
./sync-to-repo.sh
```

### Issue 2: "fatal: refusing to merge unrelated histories"

```bash
# Solution: Use force push for first sync
git subtree split --prefix=libs/aegisx-mcp -b mcp-split
git push git@github.com:aegisx-platform/aegisx-mcp.git mcp-split:main --force
git branch -D mcp-split
```

### Issue 3: Nested .git directory error

**อย่าสร้าง `.git` directory ภายใน libs/** - ถ้าเผลอสร้าง:

```bash
# Remove nested .git
rm -rf libs/aegisx-mcp/.git

# Reset uncommitted changes if needed
git checkout -- libs/aegisx-mcp/
```

### Issue 4: Subtree push takes very long time

```bash
# Use split + push instead (faster)
git subtree split --prefix=libs/aegisx-mcp -b temp-split
git push git@github.com:aegisx-platform/aegisx-mcp.git temp-split:main
git branch -D temp-split
```

## Best Practices

### DO:

- Commit และ push ไป monorepo ก่อน แล้วค่อย sync ไป standalone
- ใช้ sync script ที่มีให้
- Test build ก่อน sync
- อัพเดต version ใน package.json ก่อน publish npm

### DON'T:

- อย่าสร้าง `.git` folder ภายใน libs/
- อย่า clone standalone repo มาไว้ใน libs/ (ใช้ subtree แทน)
- อย่าแก้ไข code ใน standalone repo โดยตรง (ยกเว้น urgent hotfix)
- อย่า force push โดยไม่จำเป็น

## NPM Publishing Workflow

หลังจาก sync ไปยัง standalone repo แล้ว:

```bash
# 1. Clone standalone repo
git clone git@github.com:aegisx-platform/aegisx-mcp.git /tmp/aegisx-mcp
cd /tmp/aegisx-mcp

# 2. Install dependencies & build
npm install
npm run build

# 3. Publish (may require OTP for 2FA)
npm publish --access public

# 4. Clean up
rm -rf /tmp/aegisx-mcp
```

## Version Management

เมื่อต้องการ release version ใหม่:

1. อัพเดต `version` ใน `libs/[library]/package.json`
2. Commit: `chore(library): bump version to X.Y.Z`
3. Sync to standalone repo
4. Publish to npm

---

**Related Documentation:**

- [Git Flow & Release Guide](./GIT-FLOW-RELEASE-GUIDE.md)
- [Automated Versioning Guide](./AUTOMATED-VERSIONING-GUIDE.md)
- [CRUD Generator Git Workflow](../../libs/aegisx-cli/docs/GIT_WORKFLOW.md)
