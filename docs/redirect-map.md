---
title: 'Documentation Redirect Map'
description: 'URL redirect configuration for documentation restructure backward compatibility'
category: reference
tags: [documentation, redirects, migration]
---

# Documentation Redirect Map

> **Purpose:** Maintain backward compatibility for bookmarks, external links, and search engine indexes after documentation restructuring.

## Overview

This document describes the redirect strategy implemented as part of the **docs-restructure** specification (Phase 4, Task 4.3). All old documentation URLs are mapped to their new locations with 301 (Permanent Redirect) status codes.

**Last Updated:** 2025-12-15
**Total Redirects:** 39 paths

## Redirect Files

### 1. Universal Redirect File: `docs/.redirects`

Compatible with:

- ✅ Netlify
- ✅ Vercel
- ✅ Cloudflare Pages
- ⚠️ VitePress (requires configuration)
- ⚠️ Docusaurus (requires configuration)

**Format:**

```
<old-path> <new-path> <status-code>
```

**Example:**

```
/aegisx-cli/README.md /reference/cli/aegisx-cli/README.md 301
```

## Static Site Generator Configuration

### VitePress

Add to `.vitepress/config.ts`:

```typescript
export default {
  rewrites: {
    'aegisx-cli/README.md': 'reference/cli/aegisx-cli/README.md',
    'aegisx-cli/COMPLETE_WORKFLOW.md': 'reference/cli/aegisx-cli/complete-workflow.md',
    'AEGISX_UI_STANDARDS.md': 'reference/ui/aegisx-ui-standards.md',
    // ... add all redirects from docs/.redirects
  },
};
```

**Alternative:** Use VitePress redirects plugin:

```bash
npm install vitepress-plugin-redirects
```

```typescript
import { defineConfig } from 'vitepress';
import redirects from 'vitepress-plugin-redirects';

export default defineConfig({
  vite: {
    plugins: [
      redirects({
        '/aegisx-cli/README': '/reference/cli/aegisx-cli/README',
        // ... add all redirects
      }),
    ],
  },
});
```

### Docusaurus

Add to `docusaurus.config.js`:

```javascript
module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // ... other config
        },
      },
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/aegisx-cli/README',
            to: '/reference/cli/aegisx-cli/README',
          },
          {
            from: '/AEGISX_UI_STANDARDS',
            to: '/reference/ui/aegisx-ui-standards',
          },
          // ... add all redirects
        ],
      },
    ],
  ],
};
```

### MkDocs

Add to `mkdocs.yml`:

```yaml
plugins:
  - redirects:
      redirect_maps:
        'aegisx-cli/README.md': 'reference/cli/aegisx-cli/README.md'
        'aegisx-cli/COMPLETE_WORKFLOW.md': 'reference/cli/aegisx-cli/complete-workflow.md'
        'AEGISX_UI_STANDARDS.md': 'reference/ui/aegisx-ui-standards.md'
        # ... add all redirects
```

## Redirect Categories

### 1. CLI Documentation (5 redirects)

| Old Path                                       | New Path                                                     |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `/aegisx-cli/README.md`                        | `/reference/cli/aegisx-cli/README.md`                        |
| `/aegisx-cli/COMPLETE_WORKFLOW.md`             | `/reference/cli/aegisx-cli/complete-workflow.md`             |
| `/aegisx-cli/GIT_WORKFLOW.md`                  | `/reference/cli/aegisx-cli/git-workflow.md`                  |
| `/aegisx-cli/TESTING_GUIDE.md`                 | `/reference/cli/aegisx-cli/testing-guide.md`                 |
| `/aegisx-cli/WEBSOCKET_implementation_SPEC.md` | `/reference/cli/aegisx-cli/websocket-implementation-spec.md` |

### 2. UI Standards (3 redirects)

| Old Path                       | New Path                                 |
| ------------------------------ | ---------------------------------------- |
| `/AEGISX_UI_STANDARDS.md`      | `/reference/ui/aegisx-ui-standards.md`   |
| `/ui/THEME_SYSTEM_STANDARD.md` | `/reference/ui/theme-system-standard.md` |
| `/ui/TOKEN_REFERENCE.md`       | `/reference/ui/token-reference.md`       |

### 3. API Standards (4 redirects)

| Old Path                             | New Path                                       |
| ------------------------------------ | ---------------------------------------------- |
| `/api/api-response-standard.md`      | `/reference/api/api-response-standard.md`      |
| `/api/typebox-schema-standard.md`    | `/reference/api/typebox-schema-standard.md`    |
| `/api/bulk-operations-api-design.md` | `/reference/api/bulk-operations-api-design.md` |
| `/api/file-upload-guide.md`          | `/reference/api/file-upload-guide.md`          |

### 4. Development Guides (4 redirects)

| Old Path                                       | New Path                                              |
| ---------------------------------------------- | ----------------------------------------------------- |
| `/development/feature-development-standard.md` | `/guides/development/feature-development-standard.md` |
| `/development/api-calling-standard.md`         | `/guides/development/api-calling-standard.md`         |
| `/development/qa-checklist.md`                 | `/guides/development/qa-checklist.md`                 |
| `/development/universal-fullstack-standard.md` | `/guides/development/universal-fullstack-standard.md` |

### 5. Infrastructure Guides (3 redirects)

| Old Path                                    | New Path                                                              |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `/infrastructure/multi-instance-setup.md`   | `/guides/infrastructure/multi-instance-setup.md`                      |
| `/infrastructure/git-subtree-guide.md`      | `/guides/infrastructure/git-subtree-guide.md`                         |
| `/infrastructure/GIT-FLOW-RELEASE-GUIDE.md` | `/guides/infrastructure/version-management/git-flow-release-guide.md` |

### 6. CI/CD Guides (2 redirects)

| Old Path                   | New Path                                         |
| -------------------------- | ------------------------------------------------ |
| `/QUICK-START-CICD.md`     | `/guides/infrastructure/ci-cd/quick-start.md`    |
| `/CI_CD_BEST_PRACTICES.md` | `/guides/infrastructure/ci-cd/best-practices.md` |

### 7. Architecture Documents (6 redirects)

| Old Path                                       | New Path                                                |
| ---------------------------------------------- | ------------------------------------------------------- |
| `/architecture/microservices-adoption-path.md` | `/architecture/patterns/microservices-adoption-path.md` |
| `/architecture/MODULE_ISOLATION_CONCEPT.md`    | `/architecture/concepts/module-isolation.md`            |
| `/architecture/module-development-concepts.md` | `/architecture/concepts/module-development.md`          |
| `/architecture/dynamic-architecture.md`        | `/architecture/patterns/dynamic-architecture.md`        |
| `/architecture/DOMAIN_ARCHITECTURE_GUIDE.md`   | `/architecture/domains/domain-architecture-guide.md`    |
| `/architecture/QUICK_DOMAIN_REFERENCE.md`      | `/architecture/domains/quick-domain-reference.md`       |

### 8. Analysis Documents (3 redirects)

| Old Path                                            | New Path                                                     |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `/analysis/fuse-integration-summary.md`             | `/analysis/platform/fuse-integration-summary.md`             |
| `/analysis/knex-to-drizzle-migration.md`            | `/analysis/migration/knex-to-drizzle-migration.md`           |
| `/analysis/ui-components-implementation-summary.md` | `/analysis/platform/ui-components-implementation-summary.md` |

### 9. Reports & Archives (4 redirects)

| Old Path                                    | New Path                                           |
| ------------------------------------------- | -------------------------------------------------- |
| `/UI-TEST-REPORT.md`                        | `/reports/ui-test-report.md`                       |
| `/reports/migration-summary.md`             | `/archive/2024-Q4/migration-summary-archived.md`   |
| `/sessions/ARCHIVE_2025_Q1.md`              | `/archive/2025-Q1/sessions-archive.md`             |
| `/sessions/SESSION_59_DASHBOARD_WIDGETS.md` | `/archive/2024-Q4/session-59-dashboard-widgets.md` |

## Deprecation Notices

All archived files contain deprecation notices at the top:

```markdown
> **⚠️ ARCHIVED:** This document has been moved to [new-location](./new-location.md)
>
> **Archive Date:** YYYY-MM-DD
> **Reason:** Documentation restructuring (Phase 4)
> **New Location:** [path-to-new-location](./path)
```

## Testing Redirects

### Local Testing (with live server)

1. Start documentation server:

```bash
# VitePress
pnpm run docs:dev

# Docusaurus
pnpm run docs:start

# MkDocs
mkdocs serve
```

2. Test old URLs:

```bash
curl -I http://localhost:port/aegisx-cli/README
# Should return: HTTP/1.1 301 Moved Permanently
# Location: /reference/cli/aegisx-cli/README
```

### Production Testing

After deployment, test a sample of redirects:

```bash
# Test CLI documentation redirect
curl -I https://docs.aegisx.com/aegisx-cli/README

# Test UI standards redirect
curl -I https://docs.aegisx.com/AEGISX_UI_STANDARDS

# Verify 301 status and correct Location header
```

## Search Engine Considerations

### Google Search Console

1. Submit updated sitemap with new URLs
2. Monitor crawl errors for 404s
3. Use URL inspection tool to verify redirects
4. Check "Coverage" report for redirect status

### Bing Webmaster Tools

1. Submit updated sitemap
2. Monitor "URL Inspection" for redirect status
3. Check "Crawl Information" for errors

## Maintenance

### Adding New Redirects

1. Add to `docs/.redirects`:

   ```
   /old-path /new-path 301
   ```

2. Update static site generator config (if needed)

3. Update this REDIRECT_MAP.md with new entry

4. Test locally before deploying

### Removing Old Redirects

**Wait at least 12 months** before removing redirects to ensure:

- Search engines have updated indexes
- External links have been updated
- User bookmarks have been updated

## Related Documents

- [Documentation Structure](./README.md) - Master documentation index
- [Metadata Schema](./metadata-schema.md) - Frontmatter standards
- [docs-restructure Specification](./.spec-workflow/specs/docs-restructure/) - Full restructure plan

## Support

For redirect issues:

1. Check this document for correct mapping
2. Test redirect locally first
3. Verify static site generator configuration
4. Check server/hosting provider redirect support

---

**Specification:** docs-restructure
**Task:** 4.3 - Create redirect map for legacy URLs
**Last Updated:** 2025-12-15
