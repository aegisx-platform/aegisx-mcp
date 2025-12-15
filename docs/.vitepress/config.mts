import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
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
      { text: 'Architecture', link: '/architecture/concepts/module-isolation' },
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
            {
              text: 'Claude Detailed Rules',
              link: '/guides/development/claude-detailed-rules',
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
          text: 'Concepts',
          items: [
            {
              text: 'Module Isolation',
              link: '/architecture/concepts/module-isolation',
            },
            {
              text: 'Module Development',
              link: '/architecture/concepts/module-development',
            },
          ],
        },
        {
          text: 'Patterns',
          items: [
            {
              text: 'Microservices Adoption',
              link: '/architecture/patterns/microservices-adoption-path',
            },
            {
              text: 'Dynamic Architecture',
              link: '/architecture/patterns/dynamic-architecture',
            },
          ],
        },
        {
          text: 'Domains',
          items: [
            {
              text: 'Domain Architecture Guide',
              link: '/architecture/domains/domain-architecture-guide',
            },
            {
              text: 'Quick Domain Reference',
              link: '/architecture/domains/quick-domain-reference',
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
  ],

  // Ignore patterns
  srcExclude: [
    '**/README.md',
    '**/features/**',
    '**/styling/**',
    '**/reference/cli/aegisx-cli/**',
    '**/archive/**', // Exclude archived content
    '**/aegisx-cli/**', // Exclude CLI library docs (in libs/)
    '**/sessions/**', // Exclude session templates
  ],

  // Performance
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      exclude: ['dayjs', 'exceljs'],
    },
    ssr: {
      noExternal: ['dayjs'],
    },
    resolve: {
      alias: {
        dayjs: 'dayjs/esm',
      },
    },
  },

  // Mermaid configuration
  mermaid: {
    // Mermaid theme configuration
  },
  mermaidPlugin: {
    class: 'mermaid',
  },
  }),
);
