import { defineConfig } from 'vitepress';

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

  // Ignore patterns
  srcExclude: ['**/README.md', '**/features/**'],

  // Performance
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
