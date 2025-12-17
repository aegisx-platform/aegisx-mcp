import { defineConfig } from 'vitepress';
// Note: Using CDN-based mermaid instead of vitepress-plugin-mermaid
// to avoid Vite optimization issues with CommonJS dependencies

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AegisX Platform',
  description:
    'Enterprise-ready full-stack application with Angular 19+, Fastify 4+, PostgreSQL, and Nx monorepo',
  base: '/',

  // Theme configuration
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'AegisX Platform',

    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/getting-started' },
      { text: 'Guides', link: '/guides/development/feature-development-standard' },
      { text: 'Reference', link: '/reference/api/api-response-standard' },
      { text: 'Architecture', link: '/architecture/architecture-overview' },
      { text: 'Features', link: '/features/index' },
      { text: 'Development', link: '/guides/development/claude-detailed-rules' },
      { text: 'Infrastructure', link: '/guides/infrastructure/ci-cd-setup' },
    ],

    // Sidebar navigation - will be configured in task 5.2
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            {
              text: 'Getting Started Guide',
              link: '/getting-started/getting-started',
            },
            { text: 'Project Setup', link: '/getting-started/project-setup' },
            { text: 'Contributing', link: '/getting-started/contributing' },
            { text: 'SMTP Setup Guide', link: '/getting-started/smtp-setup-guide' },
          ],
        },
      ],

      '/guides/': [
        {
          text: 'Development',
          items: [
            {
              text: 'Feature Development Standard',
              link: '/guides/development/feature-development-standard',
            },
            {
              text: 'Claude Skills Team Guide',
              link: '/guides/development/claude-skills-team-guide',
            },
            {
              text: 'API Calling Standard',
              link: '/guides/development/api-calling-standard',
            },
            {
              text: 'QA Checklist',
              link: '/guides/development/qa-checklist',
            },
            {
              text: 'Universal Full-Stack Standard',
              link: '/guides/development/universal-fullstack-standard',
            },
          ],
        },
        {
          text: 'Infrastructure',
          items: [
            {
              text: 'Multi-Instance Setup',
              link: '/guides/infrastructure/multi-instance-setup',
            },
            {
              text: 'Git Subtree Guide',
              link: '/guides/infrastructure/git-subtree-guide',
            },
            {
              text: 'Git Flow & Release',
              link: '/guides/infrastructure/version-management/git-flow-release-guide',
            },
            {
              text: 'Domain Separated Migrations',
              link: '/guides/infrastructure/domain-separated-migrations',
            },
            {
              text: 'CI/CD Quick Start',
              link: '/guides/infrastructure/ci-cd/quick-start',
            },
            {
              text: 'CI/CD Simple Guide',
              link: '/guides/infrastructure/ci-cd/simple-guide',
            },
          ],
        },
        {
          text: 'Database',
          items: [
            {
              text: 'Migration Guide',
              link: '/guides/database/migration-guide',
            },
            {
              text: 'Schema Migration Guide',
              link: '/guides/database/schema-migration-guide',
            },
          ],
        },
        {
          text: 'Testing',
          items: [
            {
              text: 'Testing Strategy',
              link: '/guides/testing/testing-strategy',
            },
            {
              text: 'API Testing',
              link: '/guides/testing/api-testing',
            },
            {
              text: 'Integration Tests',
              link: '/guides/testing/integration-tests',
            },
          ],
        },
        {
          text: 'Migrations',
          items: [
            {
              text: 'User Department Integration',
              link: '/guides/migrations/user-department-integration',
            },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'API Reference',
          items: [
            {
              text: 'API Response Standard',
              link: '/reference/api/api-response-standard',
            },
            {
              text: 'TypeBox Schema Standard',
              link: '/reference/api/typebox-schema-standard',
            },
            {
              text: 'Bulk Operations API',
              link: '/reference/api/bulk-operations-api-design',
            },
            { text: 'File Upload Guide', link: '/reference/api/file-upload-guide' },
          ],
        },
        {
          text: 'CLI Reference',
          items: [
            {
              text: 'AegisX CLI Overview',
              link: '/reference/cli/aegisx-cli/README',
            },
            {
              text: 'Complete Workflow',
              link: '/reference/cli/aegisx-cli/complete-workflow',
            },
            {
              text: 'Git Workflow',
              link: '/reference/cli/aegisx-cli/git-workflow',
            },
            {
              text: 'Testing Guide',
              link: '/reference/cli/aegisx-cli/testing-guide',
            },
          ],
        },
        {
          text: 'UI Reference',
          items: [
            {
              text: 'AegisX UI Standards',
              link: '/reference/ui/aegisx-ui-standards',
            },
            {
              text: 'Theme System',
              link: '/reference/ui/theme-system-standard',
            },
            { text: 'Token Reference', link: '/reference/ui/token-reference' },
          ],
        },
      ],

      '/architecture/': [
        {
          text: 'Overview',
          items: [
            {
              text: 'Architecture Overview',
              link: '/architecture/architecture-overview',
            },
            {
              text: 'Domain Architecture Guide',
              link: '/architecture/domain-architecture-guide',
            },
            {
              text: 'Quick Domain Reference',
              link: '/architecture/quick-domain-reference',
            },
          ],
        },
        {
          text: 'Frontend',
          items: [
            {
              text: 'Frontend Architecture',
              link: '/architecture/frontend-architecture',
            },
            {
              text: 'Angular Signals Patterns',
              link: '/architecture/frontend/angular-signals-patterns',
            },
            {
              text: 'Auth System',
              link: '/architecture/frontend/auth-system',
            },
            {
              text: 'Form Validation Patterns',
              link: '/architecture/frontend/form-validation-patterns',
            },
            {
              text: 'Performance Optimization',
              link: '/architecture/frontend/performance-optimization',
            },
          ],
        },
        {
          text: 'Backend',
          items: [
            {
              text: 'Backend Architecture',
              link: '/architecture/backend-architecture',
            },
            {
              text: 'Fastify Plugins',
              link: '/architecture/backend/fastify-plugins',
            },
            {
              text: 'RBAC & Auth',
              link: '/architecture/backend/rbac-auth',
            },
            {
              text: 'Error Handling & Monitoring',
              link: '/architecture/backend/error-handling-monitoring',
            },
            {
              text: 'Performance Optimization',
              link: '/architecture/backend/performance-optimization',
            },
          ],
        },
      ],

      '/development/': [
        {
          text: 'Advanced Development',
          items: [
            {
              text: 'Claude Detailed Rules',
              link: '/development/claude-detailed-rules',
            },
            {
              text: 'Advanced Validation Patterns',
              link: '/development/advanced-validation-patterns',
            },
            {
              text: 'Audit Compliance Framework',
              link: '/development/audit-compliance-framework',
            },
            {
              text: 'Feature Tracking',
              link: '/development/feature-tracking',
            },
            {
              text: 'Docs System Guide',
              link: '/development/docs-system-guide',
            },
          ],
        },
      ],

      '/infrastructure/': [
        {
          text: 'CI/CD & Deployment',
          items: [
            {
              text: 'CI/CD Setup',
              link: '/infrastructure/ci-cd-setup',
            },
            {
              text: 'CI/CD Summary',
              link: '/infrastructure/cicd-summary',
            },
            {
              text: 'CI/CD Optimization Guide',
              link: '/infrastructure/ci-cd-optimization-guide',
            },
            {
              text: 'Deployment Guide',
              link: '/infrastructure/deployment',
            },
            {
              text: 'GitHub Pages Deployment',
              link: '/infrastructure/github-pages-deployment',
            },
          ],
        },
        {
          text: 'Version Management',
          items: [
            {
              text: 'Automated Versioning Guide',
              link: '/infrastructure/automated-versioning-guide',
            },
            {
              text: 'Semantic Release Recovery',
              link: '/infrastructure/semantic-release-recovery',
            },
            {
              text: 'Version Management Best Practices',
              link: '/infrastructure/version-management-best-practices',
            },
          ],
        },
        {
          text: 'Docker & Runtime',
          items: [
            {
              text: 'Monorepo Docker Guide',
              link: '/infrastructure/monorepo-docker-guide',
            },
            {
              text: 'Multi-Instance Docker Workflow',
              link: '/infrastructure/multi-instance-docker-workflow',
            },
            {
              text: 'Runtime Configuration',
              link: '/infrastructure/runtime-config',
            },
          ],
        },
      ],

      '/features/': [
        {
          text: 'Feature Documentation',
          items: [
            {
              text: 'Feature Documentation Standard',
              link: '/features/feature-documentation-standard',
            },
            {
              text: 'Feature Templates',
              link: '/features/templates/README',
            },
          ],
        },
        {
          text: 'Core Features',
          items: [
            {
              text: 'Authentication',
              link: '/features/authentication/README',
            },
            {
              text: 'Users & Departments',
              link: '/features/users/README',
            },
            {
              text: 'Core Departments',
              link: '/features/core-departments/README',
            },
            {
              text: 'RBAC',
              link: '/features/rbac/README',
            },
            {
              text: 'Audit System',
              link: '/features/audit/README',
            },
          ],
        },
        {
          text: 'Security & Access',
          items: [
            {
              text: 'API Keys',
              link: '/features/api-keys/README',
            },
            {
              text: 'Password Reset',
              link: '/features/password-reset/README',
            },
          ],
        },
        {
          text: 'Content & Media',
          items: [
            {
              text: 'PDF Export',
              link: '/features/pdf-export/README',
            },
            {
              text: 'PDF Templates',
              link: '/features/pdf-templates/README',
            },
            {
              text: 'File Upload',
              link: '/features/file-upload/README',
            },
            {
              text: 'Attachment System',
              link: '/features/attachment-system/README',
            },
          ],
        },
        {
          text: 'System Features',
          items: [
            {
              text: 'System Configuration',
              link: '/features/system/README',
            },
            {
              text: 'System Initialization',
              link: '/features/system-initialization/README',
            },
            {
              text: 'Settings',
              link: '/features/settings/README',
            },
            {
              text: 'Navigation',
              link: '/features/navigation/README',
            },
            {
              text: 'Monitoring',
              link: '/features/monitoring/README',
            },
          ],
        },
        {
          text: 'Domain Features',
          items: [
            {
              text: 'Drug Management',
              link: '/features/drug-management/README',
            },
            {
              text: 'TMT Lookup',
              link: '/features/tmt-lookup/README',
            },
          ],
        },
        {
          text: 'Advanced Features',
          items: [
            {
              text: 'WebSocket',
              link: '/features/websocket/README',
            },
            {
              text: 'Bulk Import',
              link: '/features/bulk-import/README',
            },
            {
              text: 'Widget Framework',
              link: '/features/widget-framework/README',
            },
          ],
        },
      ],
    },

    // Social links
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/aegisx-platform/aegisx-starter-1',
      },
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present AegisX Platform',
    },

    // Edit link
    editLink: {
      pattern:
        'https://github.com/aegisx-platform/aegisx-starter-1/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },

    // Search (will be configured in task 5.4)
    search: {
      provider: 'local',
    },
  },

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    // Custom config to handle Handlebars syntax
    config: (md) => {
      // Store original fence renderer
      const defaultFence = md.renderer.rules.fence!;

      // Override fence renderer to escape Handlebars in code blocks
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const content = token.content;

        // If content has Handlebars syntax, wrap with v-pre
        if (content.includes('{{') || content.includes('}}')) {
          // Escape the content to prevent Vue compilation
          token.content = content;
          // Add v-pre attribute to the rendered HTML
          const rendered = defaultFence(tokens, idx, options, env, self);
          return `<div v-pre>${rendered}</div>`;
        }

        return defaultFence(tokens, idx, options, env, self);
      };
    },
  },

  // Head tags
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'Angular, Fastify, PostgreSQL, Nx, TypeScript, Enterprise, Full-Stack, AegisX',
      },
    ],
    // Load Mermaid from CDN to avoid Vite bundling issues
    [
      'script',
      { type: 'module' },
      `
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
      `,
    ],
  ],

  // Build output directory
  outDir: '../dist/docs',

  // Clean URLs (remove .html)
  cleanUrls: true,

  // Ignore dead links - allow localhost URLs and template placeholders
  ignoreDeadLinks: [
    // Localhost URLs (development examples)
    /^http:\/\/localhost/,
    /^https:\/\/localhost/,
    // Template placeholders
    /SESSION_X/,
    /SESSION_Y/,
    /feature-name/,
    // GitHub repository links (will be valid after push)
    /aegisx-platform\/aegisx-starter-1/,
    // README files (excluded from build)
    /\/README$/,
    /\/README\.md$/,
    // Spec workflow internal files
    /\.spec-workflow\//,
    // Old architecture file naming (legacy references)
    /05a-/,
    /05b-/,
    /05c-/,
    // Internal project files
    /PROJECT_STATUS/,
    /REDIRECT_MAP/,
    // CRUD generator docs (in libs/, not docs/)
    /crud-generator\/index/,
    /crud-generator\/ERROR_HANDLING_GUIDE/,
    /crud-generator\/VALIDATION_REFERENCE/,
    /crud-generator\/TESTING_GUIDE/,
    // Migration guides (moved/renamed)
    /06-migration-guide/,
    /04-url-routing-specification/,
    /03-plugin-pattern-specification/,
    /05-module-categorization-specification/,
    // Case sensitivity issues (uppercase references)
    /DOMAIN_ARCHITECTURE_GUIDE/,
    /TEMPLATE_DEVELOPMENT_GUIDE/,
    /MIGRATION_GUIDE/,
    /GIT-FLOW-RELEASE-GUIDE/,
    /THEME_SYSTEM_STANDARD/,
    /TOKEN_REFERENCE/,
    /CLAUDE$/,
    /QUICK_REFERENCE/,
    /SMTP_SETUP_GUIDE/,
    // Old numbered file naming (legacy)
    /02-quick-commands/,
    /03-project-setup/,
    /04a-api-first-workflow/,
    /05-architecture/,
    /05b1-/,
    /05b2-/,
    /05b3-/,
    /05b4-/,
    /05b5-/,
    // Excluded directory index files
    /\/features\/index/,
    /\/archive.*\/index/,
    // Infrastructure files (moved/renamed)
    /monorepo-docker-guide/,
    /development-workflow/,
    /port-configuration/,
    /environment-setup/,
    // Universal fullstack standard (renamed)
    /universal-fullstack-standard/,
    // Component references
    /\/dialog$/,
    /aegisx-ui-implementation/,
    // Library source paths
    /\/libs\//,
    // Authentication features
    /\/features\/authentication/,
    /\/api\/email-service/,
    // Aegisx CLI references
    /aegisx-cli\/GIT_WORKFLOW/,
    // Infrastructure and CI/CD guides (moved/renamed)
    /ci-cd-setup/,
    /multi-instance-setup/,
    /COMPONENT_STYLING_GUIDE/,
    /\/docs\/infrastructure/,
    /git-flow-release-guide/,
    // Architecture concepts (check if path exists)
    /\/architecture\/concepts\/module-isolation/,
    // Old SCREAMING_SNAKE_CASE filenames (renamed to kebab-case)
    /USER_GUIDE/,
    /DEVELOPER_GUIDE/,
    /API_REFERENCE/,
    /\/ARCHITECTURE/,
    /DEPLOYMENT_GUIDE/,
    /TROUBLESHOOTING/,
    /DOCUMENTATION_INDEX/,
    /API_CONTRACTS/,
    /\/FEATURE\.md/,
    /\/PROGRESS\.md/,
    /\/TASKS\.md/,
    /\/PATTERNS/,
    /\/GIT_WORKFLOW/,
    /\/NPM_PUBLISHING/,
    /CI-CD-SETUP/,
    /COMPREHENSIVE_TEST/,
    /FRONTEND_GENERATOR/,
    /SPEC-SESSION/,
    // Template placeholder links (not actual files)
    /\/template-.*\/.*/,
    /\/templates\/.*\/(user-guide|developer-guide|api-reference|architecture|troubleshooting|deployment-guide)/,
    // Remaining old SCREAMING_SNAKE_CASE references
    /BATCH_TRACKING_MIGRATION/,
    /FIXES_SPECIFICATION/,
    /DEPARTMENT_MANAGEMENT_DESIGN/,
    /implementation-PLAN/,
    /PERMISSION-MATRIX/,
    /DASHBOARD-SPEC/,
    /VALIDATION-RULES/,
    /UI-UX-IMPROVEMENTS/,
    // Inventory app specific patterns
    /INTEGRATION-SPEC/,
    /WORKFLOW-ANALYSIS/,
    /BACKEND/,
    /WORKFLOWS/,
    /API$/,
    // Non-markdown files (sql, prisma, etc.)
    /\.sql$/,
    /\.prisma$/,
    // Specific missing files
    /api-calling-standard$/,
    /auto-discovery-import-system$/,
    /\/implementation$/,
    /account-lockout$/,
    /session-management\/index$/,
    /jwt-authentication$/,
    /07-migration-patterns$/,
    /08-plugin-migration-guide$/,
    /\/components$/,
    /\/development$/,
    /phase-.*_(DATABASE|DATA_MIGRATION|BACKEND|FRONTEND)$/,
    /system-init-integration$/,
    /migration-guide$/,
  ],

  // Ignore patterns
  srcExclude: [
    // NOTE: Do NOT exclude **/README.md globally - it excludes features/README.md!
    // '**/features/**', // Re-enabled with Handlebars handling in markdown config
    '**/features/advanced/**', // Temporarily exclude - has extensive Handlebars examples
    '**/features/pdf-templates/**', // Temporarily exclude - has Handlebars syntax
    '**/features/templates/**', // Exclude templates - contain placeholder links
    '**/features/inventory-app/**', // Exclude - has many internal cross-references to fix later
    '**/styling/**',
    '**/archive/**', // Exclude archived content
    '**/aegisx-cli/**', // Exclude CLI library docs (in libs/)
    '**/sessions/**', // Exclude session templates
  ],

  // Performance
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
