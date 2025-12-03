# GitHub Pages Deployment Guide

This guide covers deploying the Admin documentation app to GitHub Pages at `aegisx-platform.github.io/aegisx-ui`.

## Overview

The Admin app serves as the documentation and demo site for the `@aegisx/ui` library. It's deployed to the `aegisx-ui` repository's GitHub Pages from this monorepo using a cross-repository deployment workflow.

**Live Site:** https://aegisx-platform.github.io/aegisx-ui/

## Architecture

```
aegisx-starter (source repo)
    │
    ├── apps/admin/          # Admin/Docs Angular app
    ├── libs/aegisx-ui/      # UI component library
    │
    └── .github/workflows/
        └── deploy-admin-docs.yml  # Deployment workflow
                │
                ▼
aegisx-ui (target repo)
    │
    └── gh-pages branch      # Deployed static files
                │
                ▼
        https://aegisx-platform.github.io/aegisx-ui/
```

## Deployment Workflow

### Workflow File

Location: `.github/workflows/deploy-admin-docs.yml`

```yaml
name: Deploy Admin Docs to aegisx-ui GitHub Pages

on:
  workflow_dispatch: # Manual trigger
  push:
    branches:
      - main
      - develop
    paths:
      - 'apps/admin/**'
      - 'libs/aegisx-ui/**'

jobs:
  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout aegisx-starter
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.17.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build admin app for GitHub Pages
        run: pnpm nx build admin --configuration=gh-pages
        env:
          NODE_OPTIONS: --max-old-space-size=4096

      - name: Add 404.html for SPA routing
        run: cp dist/apps/admin/index.html dist/apps/admin/404.html

      - name: Deploy to aegisx-ui repo
        uses: peaceiris/actions-gh-pages@v4
        with:
          deploy_key: ${{ secrets.AEGISX_UI_DEPLOY_KEY }}
          external_repository: aegisx-platform/aegisx-ui
          publish_branch: gh-pages
          publish_dir: ./dist/apps/admin
```

### Triggers

The deployment runs automatically when:

1. **Manual trigger** - Via GitHub Actions UI or CLI
2. **Push to main/develop** - When changes are made to:
   - `apps/admin/**` - Admin app source code
   - `libs/aegisx-ui/**` - UI library components

## Setup Requirements

### 1. Deploy Key Configuration

To deploy to an external repository, a deploy key is required:

1. **Generate SSH key pair:**

   ```bash
   ssh-keygen -t ed25519 -C "aegisx-ui-deploy" -f aegisx-ui-deploy -N ""
   ```

2. **Add public key to aegisx-ui repo:**
   - Go to `aegisx-ui` repo → Settings → Deploy keys
   - Add new deploy key with **write access**
   - Paste contents of `aegisx-ui-deploy.pub`

3. **Add private key to aegisx-starter repo:**
   - Go to `aegisx-starter` repo → Settings → Secrets → Actions
   - Create new secret named `AEGISX_UI_DEPLOY_KEY`
   - Paste contents of `aegisx-ui-deploy` (private key)

### 2. GitHub Pages Configuration

Configure GitHub Pages in the `aegisx-ui` repository:

1. Go to `aegisx-ui` repo → Settings → Pages
2. Set source branch to `gh-pages`
3. Set path to `/` (root)

**Via CLI:**

```bash
gh api repos/aegisx-platform/aegisx-ui/pages -X PUT \
  -f 'source[branch]=gh-pages' \
  -f 'source[path]=/'
```

### 3. Angular Build Configuration

The admin app uses a special `gh-pages` configuration in `apps/admin/project.json`:

```json
{
  "configurations": {
    "gh-pages": {
      "baseHref": "/aegisx-ui/",
      "outputPath": "dist/apps/admin",
      "optimization": true,
      "outputHashing": "all",
      "sourceMap": false,
      "namedChunks": false,
      "extractLicenses": true
    }
  }
}
```

**Key settings:**

- `baseHref: "/aegisx-ui/"` - Required for GitHub Pages subdirectory
- `outputPath: "dist/apps/admin"` - Build output location

## Manual Deployment

### Via GitHub CLI

```bash
# Trigger deployment workflow
gh workflow run "Deploy Admin Docs to aegisx-ui GitHub Pages" --ref develop

# Check workflow status
gh run list --limit 5

# View specific run
gh run view <run-id>

# View failed logs
gh run view <run-id> --log-failed
```

### Via GitHub UI

1. Go to Actions tab in `aegisx-starter` repo
2. Select "Deploy Admin Docs to aegisx-ui GitHub Pages"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Trigger GitHub Pages Build

If Pages shows 404 after deployment, manually trigger a build:

```bash
gh api repos/aegisx-platform/aegisx-ui/pages/builds -X POST
```

## Troubleshooting

### Common Issues

#### 1. Build Output Path Mismatch

**Error:**

```
cp: cannot stat 'dist/apps/admin/browser/index.html': No such file or directory
```

**Cause:** Angular build configuration changed output path.

**Solution:** Verify the actual output path:

```bash
pnpm nx build admin --configuration=gh-pages
ls dist/apps/admin/
```

Update workflow to use correct path (e.g., `dist/apps/admin/` not `dist/apps/admin/browser/`).

#### 2. Deprecated Sass Functions

**Error:**

```
Deprecation Warning: color.red() is deprecated. Suggestion:
color.channel($color, "red", $space: rgb)
```

**Cause:** Dart Sass 3.0 deprecated legacy color functions.

**Solution:** Update SCSS files to use modern syntax:

```scss
// OLD (deprecated)
--ax-success-rgb: #{color.red($color)}, #{color.green($color)}, #{color.blue($color)};
--ax-primary-dark: #{darken($color, 10%)};
--ax-primary-light: #{lighten($color, 20%)};

// NEW (modern)
--ax-success-rgb: #{color.channel($color, 'red', $space: rgb)}, #{color.channel($color, 'green', $space: rgb)}, #{color.channel($color, 'blue', $space: rgb)};
--ax-primary-dark: #{color.adjust($color, $lightness: -10%)};
--ax-primary-light: #{color.adjust($color, $lightness: 20%)};
```

Add at top of SCSS file:

```scss
@use 'sass:color';
```

#### 3. Missing Dependencies

**Error:**

```
Cannot find module 'signature_pad'
```

**Solution:** Add missing optional peer dependencies:

```bash
pnpm add -D signature_pad@^5.0.0
```

#### 4. GitHub Pages Shows 404

**Cause:** Pages build not triggered after deployment.

**Solution:**

1. Verify gh-pages branch has files:

   ```bash
   gh api repos/aegisx-platform/aegisx-ui/git/trees/gh-pages --jq '.tree[].path' | head -10
   ```

2. Check Pages source is correct:

   ```bash
   gh api repos/aegisx-platform/aegisx-ui/pages
   # Should show: "source":{"branch":"gh-pages","path":"/"}
   ```

3. Trigger manual build:

   ```bash
   gh api repos/aegisx-platform/aegisx-ui/pages/builds -X POST
   ```

4. Wait 30-60 seconds and check:
   ```bash
   curl -sI https://aegisx-platform.github.io/aegisx-ui/ | head -5
   # Should show: HTTP/2 200
   ```

#### 5. SPA Routing Issues

**Symptom:** Direct URLs like `/aegisx-ui/docs/buttons` return 404.

**Solution:** The workflow copies `index.html` to `404.html`:

```yaml
- name: Add 404.html for SPA routing
  run: cp dist/apps/admin/index.html dist/apps/admin/404.html
```

This allows GitHub Pages to serve the Angular app for all routes.

## Verification

After deployment, verify:

1. **Check HTTP status:**

   ```bash
   curl -sI https://aegisx-platform.github.io/aegisx-ui/ | head -5
   # Expected: HTTP/2 200
   ```

2. **Check page content:**

   ```bash
   curl -s https://aegisx-platform.github.io/aegisx-ui/ | grep -o '<title>.*</title>'
   ```

3. **Test SPA routing:**
   - Visit https://aegisx-platform.github.io/aegisx-ui/
   - Navigate to different pages
   - Refresh page on a sub-route (should not 404)

## Related Documentation

- [CI/CD Setup Guide](./CI-CD-SETUP.md)
- [Git Flow & Release Guide](./GIT-FLOW-RELEASE-GUIDE.md)
- [Deployment Guide](./deployment.md)
