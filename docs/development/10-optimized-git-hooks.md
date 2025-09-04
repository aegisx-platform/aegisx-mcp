# Optimized Git Hooks Guide

## Overview

เราปรับ Git hooks ให้เบาและเร็วขึ้น โดยย้าย heavy testing ไปรันบน CI/CD แทน

## Hook Configuration

### Pre-commit (เร็วมาก ~2-3 วินาที)

- ✅ Prettier format (staged files only)
- ✅ ESLint fix (staged files only)
- ❌ No tests
- ❌ No type checking

### Pre-push (เร็ว ~3-5 วินาที)

- ✅ Lint affected projects
- ❌ No tests
- ❌ No type checking
- 💡 Tests run in GitHub Actions

### Commit-msg

- ✅ Conventional commit format validation
- Examples: `feat:`, `fix:`, `docs:`, `perf:`, etc.

## Quick Commands

```bash
# Normal operations
git push                    # Runs lint check only
git commit -m "feat: ..."   # Must follow conventional format

# Skip hooks when needed
SKIP_HOOKS=1 git push       # Skip all hooks
SKIP_HOOKS=1 git commit     # Skip commit validation

# NPM scripts shortcuts
npm run push:quick          # Push without any checks
npm run push:force          # Force push without checks
npm run commit:feat         # Start a feature commit
npm run commit:fix          # Start a fix commit

# Test locally if needed
npm run test:affected       # Test only affected projects
npm run lint:affected       # Lint only affected projects
npm run lint:fix            # Fix lint issues
```

## CI/CD Pipeline

Tests ที่ย้ายไป GitHub Actions:

1. **Quality Checks** (2-3 นาที)
   - Format check
   - Lint all
   - Type check

2. **Unit Tests** (5 นาที)
   - All projects in parallel
   - Coverage reports

3. **Integration Tests** (5-10 นาที)
   - Database tests
   - API tests

4. **Build Check** (5 นาที)
   - Production builds
   - Bundle size check

## Benefits

- 🚀 **Push เร็วขึ้น**: จาก 20+ วินาที เหลือ 3-5 วินาที
- 🎯 **Focus on coding**: ไม่ต้องรอ test
- ✅ **Quality maintained**: CI/CD จับ bugs แทน
- 😊 **Developer happiness**: Smooth workflow

## Troubleshooting

### ถ้า push ถูก reject

```bash
# Check what's wrong
git status
nx affected --target=lint

# Fix lint issues
nx affected --target=lint --fix

# Or skip if urgent
SKIP_HOOKS=1 git push
```

### ถ้า commit message ถูก reject

```bash
# Check format
cat .commitlintrc.json

# Valid types:
feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

# Example:
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login error"
```

## Best Practices

1. **Let CI/CD do the heavy work** - Push บ่อยๆ ให้ CI/CD test
2. **Fix lint locally** - แก้ lint errors ก่อน push
3. **Use conventional commits** - ช่วย generate changelog
4. **Run tests before PR** - `npm run test:affected` ก่อน create PR

## Rollback (ถ้าอยากกลับไปใช้แบบเดิม)

```bash
# Restore old hooks
cp .husky/pre-push.backup.* .husky/pre-push
chmod +x .husky/pre-push

# Or get from git history
git checkout ea5d94f -- .husky/pre-push
```
