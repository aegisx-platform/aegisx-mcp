# AegisX UI NPM Publishing Guide

> **Package**: `@aegisx/ui`
> **Registry**: https://www.npmjs.com/package/@aegisx/ui
> **Repository**: https://github.com/aegisx-platform/aegisx-ui

## Prerequisites

### 1. NPM Account Setup

```bash
# Login to npm (if not already logged in)
npm login

# Verify login
npm whoami

# Check organization access
npm org ls aegisx
```

### 2. 2FA Setup

NPM publishing requires 2FA (Two-Factor Authentication):

1. Enable 2FA on npmjs.com account
2. Use authenticator app (Google Authenticator, Authy, etc.)
3. Have OTP code ready before publishing

## Publishing Workflow

### Step 1: Prepare Release

```bash
# 1. Update version in package.json
cd libs/aegisx-ui
# Edit package.json: "version": "X.X.X"

# 2. Update CHANGELOG.md
# Add release notes for new version

# 3. Commit changes
git add package.json CHANGELOG.md
git commit -m "chore(aegisx-ui): bump version to X.X.X"
git push origin develop
```

### Step 2: Sync to Separate Repository

```bash
# From project root
./libs/aegisx-ui/sync-to-repo.sh main
```

### Step 3: Build Library

```bash
# Build production version
pnpm nx build aegisx-ui

# Verify build output
ls -la dist/libs/aegisx-ui/
```

### Step 4: Publish to NPM

```bash
# Navigate to dist folder
cd dist/libs/aegisx-ui

# Option A: Use publish script (recommended)
../../../libs/aegisx-ui/publish.sh <OTP-CODE>

# Option B: Manual publish
npm publish --access public --otp=<OTP-CODE>
```

### Step 5: Create Git Tag

```bash
# Create tag in aegisx-ui repository (NOT main repo!)
git push git@github.com:aegisx-platform/aegisx-ui.git \
  HEAD:refs/tags/vX.X.X
```

### Step 6: Verify Publication

```bash
# Check npm registry
npm view @aegisx/ui

# View available versions
npm view @aegisx/ui versions

# Test installation
npm pack @aegisx/ui
```

## Version Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (API changes, removed features)
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### Version Guidelines

| Change Type             | Version Bump | Example          |
| ----------------------- | ------------ | ---------------- |
| Bug fix                 | PATCH        | 0.1.0 → 0.1.1    |
| New component           | MINOR        | 0.1.0 → 0.2.0    |
| New feature             | MINOR        | 0.1.0 → 0.2.0    |
| Breaking API change     | MAJOR        | 0.1.0 → 1.0.0    |
| Angular version support | MINOR/MAJOR  | Depends on scope |

### Pre-release Versions

```bash
# Alpha (early testing)
0.2.0-alpha.1

# Beta (feature complete, testing)
0.2.0-beta.1

# Release candidate (final testing)
0.2.0-rc.1
```

## Package Configuration

### package.json Fields

```json
{
  "name": "@aegisx/ui",
  "version": "0.1.0",
  "description": "Enterprise Angular UI library...",
  "author": "AegisX Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/aegisx-platform/aegisx-ui"
  },
  "homepage": "https://github.com/aegisx-platform/aegisx-ui#readme",
  "bugs": {
    "url": "https://github.com/aegisx-platform/aegisx-ui/issues"
  },
  "keywords": ["angular", "ui", "components", "material", "tailwind", "enterprise", "aegisx"],
  "peerDependencies": {
    "@angular/core": ">=17.0.0 <21.0.0",
    "@angular/material": ">=17.0.0 <21.0.0"
  }
}
```

### Files Included in Package

The published package includes:

```
@aegisx/ui/
├── esm2022/           # ES2022 modules
├── fesm2022/          # Flat ES modules
├── bundles/           # UMD bundles
├── styles/            # SCSS styles
├── package.json
├── README.md
└── CHANGELOG.md
```

## CHANGELOG Guidelines

### Format

```markdown
## [X.X.X] - YYYY-MM-DD

### Added

- New features

### Changed

- Modified behavior

### Fixed

- Bug fixes

### Deprecated

- Features to be removed

### Removed

- Removed features

### Security

- Security fixes
```

### Example Entry

```markdown
## [0.2.0] - 2025-12-15

### Added

- New `ax-data-table` component with sorting and pagination
- `AxFormFieldComponent` for consistent form layouts
- Dark mode support for all components

### Changed

- Improved `ax-card` hover animations
- Updated Angular Material peer dependency to support v20

### Fixed

- Fixed `ax-drawer` not closing on escape key
- Resolved theme switching delay issue
```

## Troubleshooting

### "npm ERR! 403 Forbidden"

**Cause**: Not logged in or no publish access.

**Solution**:

```bash
npm login
npm whoami
```

### "npm ERR! 402 Payment Required"

**Cause**: Trying to publish private package without paid account.

**Solution**: Use `--access public` flag:

```bash
npm publish --access public --otp=<OTP>
```

### "npm ERR! E409 Conflict"

**Cause**: Version already exists.

**Solution**: Bump version number in package.json.

### "OTP Required"

**Cause**: 2FA enabled on npm account.

**Solution**: Use `--otp` flag with fresh OTP code:

```bash
npm publish --access public --otp=123456
```

### Build Errors

**Cause**: TypeScript or Angular compilation issues.

**Solution**:

```bash
# Clean build
pnpm nx reset
rm -rf dist/libs/aegisx-ui

# Rebuild
pnpm nx build aegisx-ui

# Check errors
pnpm nx lint aegisx-ui
```

## Quick Reference

### Complete Release Command Sequence

```bash
# 1. Update version and changelog
vim libs/aegisx-ui/package.json
vim libs/aegisx-ui/CHANGELOG.md

# 2. Commit
git add libs/aegisx-ui/
git commit -m "chore(aegisx-ui): release v0.2.0"
git push origin develop

# 3. Sync to separate repo
./libs/aegisx-ui/sync-to-repo.sh main

# 4. Build
pnpm nx build aegisx-ui

# 5. Publish
cd dist/libs/aegisx-ui
npm publish --access public --otp=<YOUR_OTP>

# 6. Tag
git push git@github.com:aegisx-platform/aegisx-ui.git HEAD:refs/tags/v0.2.0

# 7. Verify
npm view @aegisx/ui
```

## Related Documentation

- **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Git subtree and sync workflow
- **[THEME_SYSTEM_STANDARD.md](./THEME_SYSTEM_STANDARD.md)** - Theme system documentation
- **[TOKEN_REFERENCE.md](./TOKEN_REFERENCE.md)** - Design token reference
