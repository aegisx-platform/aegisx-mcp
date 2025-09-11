# 🚀 Automated Versioning & Changelog Guide

## 📋 Overview

ระบบนี้จะ:

1. **ตรวจสอบ commit messages** อัตโนมัติ
2. **กำหนด version** ตาม Semantic Versioning
3. **สร้าง CHANGELOG.md** อัตโนมัติ
4. **สร้าง GitHub Release** พร้อม release notes
5. **Trigger CI/CD** สำหรับ deployment

## 🎯 Conventional Commits

ใช้ format นี้สำหรับ commit messages:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types ที่ใช้ได้

| Type       | Version Bump  | Description   | Example                               |
| ---------- | ------------- | ------------- | ------------------------------------- |
| `feat`     | Minor (0.x.0) | Feature ใหม่  | `feat: add user management API`       |
| `fix`      | Patch (0.0.x) | แก้ bug       | `fix: resolve login error`            |
| `docs`     | No bump       | เอกสาร        | `docs: update API documentation`      |
| `style`    | No bump       | Code style    | `style: fix linting errors`           |
| `refactor` | No bump       | Refactor code | `refactor: optimize database queries` |
| `perf`     | Patch         | Performance   | `perf: improve query performance`     |
| `test`     | No bump       | เพิ่ม tests   | `test: add user service tests`        |
| `build`    | No bump       | Build system  | `build: update dependencies`          |
| `ci`       | No bump       | CI/CD         | `ci: add staging deployment`          |
| `chore`    | No bump       | งานอื่นๆ      | `chore: update .gitignore`            |

### Breaking Changes = Major Version

```bash
# Method 1: ใส่ ! หลัง type
feat!: change API response format

# Method 2: ใส่ BREAKING CHANGE ใน footer
feat: update authentication flow

BREAKING CHANGE: JWT token format has changed
```

## 🔄 Automated Flow

### 1. Development (Feature Branch)

```bash
# สร้าง feature branch
git checkout -b feat/user-crud

# Commit with conventional format
git add .
git commit -m "feat(api): add user CRUD endpoints"
git commit -m "test(api): add user service tests"
git commit -m "docs: update API documentation"

# Push to GitHub
git push origin feat/user-crud
```

### 2. Merge to Main

```bash
# Create PR and merge to main
# GitHub Actions จะ:
```

1. **ตรวจสอบ commits** ตั้งแต่ tag ล่าสุด
2. **คำนวณ version bump**:
   - มี `feat` → Minor version (1.0.0 → 1.1.0)
   - มี `fix` → Patch version (1.0.0 → 1.0.1)
   - มี `BREAKING CHANGE` → Major version (1.0.0 → 2.0.0)

3. **Auto generate**:
   - Update `package.json` version
   - Generate `CHANGELOG.md`
   - Create git tag `v1.1.0`
   - Create GitHub Release

4. **Trigger deployment** ไปยัง production

## 📝 CHANGELOG.md Format

```markdown
## [1.1.0] - 2025-12-02

### ✨ Features

- **api**: add user CRUD endpoints ([commit-hash])
- **auth**: implement role-based access control ([commit-hash])

### 🐛 Bug Fixes

- **login**: resolve token refresh issue ([commit-hash])

### 📚 Documentation

- update API documentation ([commit-hash])

[1.1.0]: https://github.com/aegisx/aegisx-starter/compare/v1.0.0...v1.1.0
```

## 🎮 Manual Release (ถ้าต้องการ)

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major

# หรือให้ตัดสินใจจาก commits
npm run release
```

## 🔍 ตัวอย่าง Commit Messages

### ✅ Good Examples

```bash
# Feature
feat(auth): add OAuth2 integration
feat(api): implement user search endpoint

# Fix
fix(login): handle expired token correctly
fix: prevent memory leak in user service

# Breaking change
feat!: redesign authentication API
feat(api): change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case

# Multiple changes in one commit
feat(users): add profile management

- Add profile update endpoint
- Add avatar upload functionality
- Implement email verification

Closes #123
```

### ❌ Bad Examples

```bash
# Too generic
fix: bug fix
feat: new feature
update code

# Wrong format
Fixed the login bug
FEAT - Add new endpoint
[Feature] User management
```

## 🛠️ Setup Requirements

### 1. Install Dependencies

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional
yarn add -D standard-version
yarn add -D husky
```

### 2. Initialize Husky

```bash
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

### 3. Files Created

- `.github/workflows/auto-release.yml` - Automated release workflow
- `.versionrc.json` - Version & changelog configuration
- `commitlint.config.js` - Commit message rules
- `.husky/commit-msg` - Git hook for validation

## 📊 Version History Example

```
v1.0.0 - Initial release
v1.0.1 - fix: login bug
v1.1.0 - feat: add user management
v2.0.0 - feat!: new API structure
v2.0.1 - fix: validation error
v2.1.0 - feat: add export functionality
```

## 🚨 Important Notes

1. **ทุก commit ต้อง pass commitlint** - ไม่งั้น commit ไม่ได้
2. **Version bump อัตโนมัติ** - ไม่ต้องแก้ version เอง
3. **CHANGELOG อัตโนมัติ** - ไม่ต้องเขียนเอง
4. **GitHub Release อัตโนมัติ** - พร้อม release notes

## 🎯 Benefits

- ✅ **Consistent versioning** - ทุกคนใช้มาตรฐานเดียวกัน
- ✅ **Clear history** - อ่าน commits เข้าใจง่าย
- ✅ **Automated changelog** - ไม่ต้องเขียนเอง
- ✅ **Semantic versioning** - รู้ว่า version ไหนมีอะไรเปลี่ยน
- ✅ **CI/CD integration** - Deploy อัตโนมัติตาม version
