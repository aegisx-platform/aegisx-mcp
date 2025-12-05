import { Route } from '@angular/router';

// Route Definitions
import { COMPONENTS_AEGISX_ROUTES } from './routes/docs/components-aegisx.routes';
import { FOUNDATIONS_ROUTES } from './routes/docs/foundations.routes';
import { GETTING_STARTED_ROUTES } from './routes/docs/getting-started.routes';
import { INTEGRATIONS_ROUTES } from './routes/docs/integrations.routes';
import { MATERIAL_ROUTES } from './routes/docs/material.routes';
import { MCP_ROUTES } from './routes/docs/mcp.routes';
import { CLI_ROUTES } from './routes/docs/cli.routes';
import {
  ARCHITECTURE_ROUTES,
  PATTERNS_ROUTES,
} from './routes/docs/patterns-architecture.routes';
import { EXAMPLES_ROUTES } from './routes/examples/examples.routes';
import { PLAYGROUND_ROUTES } from './routes/playground/playground.routes';
import { LEGACY_REDIRECTS } from './routes/redirects/legacy-redirects.routes';
import { STANDALONE_ROUTES } from './routes/standalone/standalone.routes';
import { TOOLS_ROUTES } from './routes/tools/tools.routes';

/**
 * Admin Application Routes
 *
 * Route Architecture:
 * ├── / (root redirect)
 * ├── /docs/* (documentation)
 * │   ├── /docs/getting-started/*
 * │   ├── /docs/foundations/*
 * │   ├── /docs/components/aegisx/*
 * │   ├── /docs/integrations/*
 * │   ├── /docs/material/*
 * │   ├── /docs/patterns/*
 * │   └── /docs/architecture/*
 * ├── /playground/* (examples & experiments)
 * ├── /tools/* (admin tools)
 * ├── /[standalone pages] (demos & legacy)
 * └── [legacy redirects]
 */
export const appRoutes: Route[] = [
  // ============================================
  // ROOT REDIRECT
  // ============================================
  {
    path: '',
    redirectTo: 'docs/getting-started/introduction',
    pathMatch: 'full',
  },

  // ============================================
  // DOCUMENTATION ROUTES - /docs/*
  // ============================================
  {
    path: 'docs/getting-started',
    children: GETTING_STARTED_ROUTES,
    data: {
      title: 'Getting Started',
      description: 'Get started with AegisX',
    },
  },
  {
    path: 'docs/foundations',
    children: FOUNDATIONS_ROUTES,
    data: {
      title: 'Foundations',
      description: 'Design foundations and principles',
    },
  },
  {
    path: 'docs/components/aegisx',
    children: COMPONENTS_AEGISX_ROUTES,
    data: {
      title: 'AegisX Components',
      description: 'AegisX component library',
    },
  },
  {
    path: 'docs/integrations',
    children: INTEGRATIONS_ROUTES,
    data: {
      title: 'Integrations',
      description: 'Third-party integrations',
    },
  },
  {
    path: 'docs/material',
    children: MATERIAL_ROUTES,
    data: {
      title: 'Material Components',
      description: 'Angular Material components',
    },
  },
  {
    path: 'docs/patterns',
    children: PATTERNS_ROUTES,
    data: {
      title: 'Patterns',
      description: 'Design patterns',
    },
  },
  {
    path: 'docs/architecture',
    children: ARCHITECTURE_ROUTES,
    data: {
      title: 'Architecture',
      description: 'Application architecture',
    },
  },
  {
    path: 'docs/mcp',
    children: MCP_ROUTES,
    data: {
      title: 'MCP Server',
      description: 'AegisX Model Context Protocol server',
    },
  },
  {
    path: 'docs/cli',
    children: CLI_ROUTES,
    data: {
      title: 'CLI Reference',
      description: 'AegisX CRUD Generator CLI documentation',
    },
  },

  // ============================================
  // PLAYGROUND ROUTES - /playground/*
  // ============================================
  {
    path: 'playground',
    children: PLAYGROUND_ROUTES,
    data: {
      title: 'Playground',
      description: 'Component playgrounds and experiments',
    },
  },

  // ============================================
  // TOOLS ROUTES - /tools/*
  // ============================================
  {
    path: 'tools',
    children: TOOLS_ROUTES,
    data: {
      title: 'Tools',
      description: 'Administrative tools and utilities',
    },
  },

  // ============================================
  // EXAMPLES ROUTES - /examples/*
  // Copy-paste friendly page examples
  // ============================================
  {
    path: 'examples',
    children: EXAMPLES_ROUTES,
    data: {
      title: 'Page Examples',
      description: 'Copy-paste friendly page examples',
    },
  },

  // ============================================
  // STANDALONE DEMO ROUTES
  // ============================================
  ...STANDALONE_ROUTES,

  // ============================================
  // LEGACY REDIRECTS (old routes → new routes)
  // ============================================
  ...LEGACY_REDIRECTS,

  // ============================================
  // CATCH-ALL (404)
  // ============================================
  {
    path: '**',
    redirectTo: 'docs/getting-started/introduction',
  },
];
