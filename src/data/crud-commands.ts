/**
 * CRUD Generator Commands Reference
 * Complete documentation of all CRUD generator capabilities
 */

export interface CommandOption {
  name: string;
  alias?: string;
  type: 'boolean' | 'string' | 'number';
  default?: string | boolean | number;
  description: string;
  choices?: string[];
}

export interface CommandInfo {
  name: string;
  description: string;
  usage: string;
  options: CommandOption[];
  examples: string[];
  notes?: string[];
}

export interface PackageInfo {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  command: string;
}

export const packages: PackageInfo[] = [
  {
    name: 'standard',
    description: 'Basic CRUD operations with essential features',
    features: [
      'Full CRUD operations (Create, Read, Update, Delete)',
      'TypeBox schema validation',
      'Pagination and filtering',
      'Search functionality',
      'Soft delete support',
      'TypeScript types generation',
    ],
    useCases: [
      'Simple data management modules',
      'Basic admin panels',
      'Quick prototypes',
    ],
    command: 'pnpm run crud -- TABLE_NAME --force',
  },
  {
    name: 'enterprise',
    description: 'Standard + Excel/CSV import functionality',
    features: [
      'All standard features',
      'Excel file import (XLSX)',
      'CSV file import',
      'Bulk data operations',
      'Import validation',
      'Error reporting for imports',
    ],
    useCases: [
      'Data migration tools',
      'Bulk data management',
      'Admin import features',
    ],
    command: 'pnpm run crud:import -- TABLE_NAME --force',
  },
  {
    name: 'full',
    description: 'Enterprise + WebSocket events for real-time updates',
    features: [
      'All enterprise features',
      'WebSocket event emission',
      'Real-time CRUD notifications',
      'Event-driven architecture support',
      'Pub/sub integration ready',
    ],
    useCases: [
      'Real-time dashboards',
      'Collaborative applications',
      'Live data feeds',
    ],
    command: 'pnpm run crud:full -- TABLE_NAME --force',
  },
];

export const commands: CommandInfo[] = [
  {
    name: 'generate',
    description: 'Generate CRUD module from database table',
    usage: 'pnpm run crud -- <table_name> [options]',
    options: [
      {
        name: 'target',
        alias: 't',
        type: 'string',
        default: 'backend',
        description: 'Generation target',
        choices: ['backend', 'frontend'],
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        default: false,
        description: 'Overwrite existing files without prompt',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        default: false,
        description: 'Preview files without creating',
      },
      {
        name: 'package',
        type: 'string',
        default: 'standard',
        description: 'Feature package to use',
        choices: ['standard', 'enterprise', 'full'],
      },
      {
        name: 'with-events',
        alias: 'e',
        type: 'boolean',
        default: false,
        description: 'Include WebSocket events',
      },
      {
        name: 'with-import',
        type: 'boolean',
        default: false,
        description: 'Include bulk import (Excel/CSV)',
      },
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'api',
        description: 'Target app for backend',
        choices: ['api'],
      },
      {
        name: 'flat',
        type: 'boolean',
        default: false,
        description: 'Use flat structure (not domain)',
      },
      {
        name: 'no-register',
        type: 'boolean',
        default: false,
        description: 'Skip auto-registration',
      },
      {
        name: 'include-audit-fields',
        type: 'boolean',
        default: false,
        description: 'Include audit fields in forms (created_at, updated_at)',
      },
    ],
    examples: [
      '# Basic backend generation',
      'pnpm run crud -- products --force',
      '',
      '# Backend with import functionality',
      'pnpm run crud:import -- budgets --force',
      '',
      '# Backend with WebSocket events',
      'pnpm run crud:events -- notifications --force',
      '',
      '# Full package (all features)',
      'pnpm run crud:full -- orders --force',
      '',
      '# Frontend generation (must generate backend first)',
      './bin/cli.js generate products --target frontend --force',
      '',
      '# Frontend with import dialog',
      './bin/cli.js generate budgets --target frontend --with-import --force',
      '',
      '# Dry run to preview',
      'pnpm run crud -- articles --dry-run',
    ],
    notes: [
      'Always use -- separator before table name when using pnpm scripts',
      'Generate backend first, then frontend',
      'Use snake_case for table names (auto-converted to kebab-case)',
    ],
  },
  {
    name: 'list-tables',
    description: 'List all available database tables',
    usage: 'pnpm run crud:list',
    options: [],
    examples: [
      '# List all tables',
      'pnpm run crud:list',
      '',
      '# Or using direct CLI',
      './bin/cli.js list-tables',
    ],
    notes: [
      'Connects to database configured in .env.local',
      'Shows table names that can be used with generate command',
    ],
  },
  {
    name: 'validate',
    description: 'Validate generated CRUD module',
    usage: 'pnpm run crud:validate -- <table_name>',
    options: [],
    examples: [
      '# Validate generated module',
      'pnpm run crud:validate -- products',
    ],
    notes: [
      'Checks for missing files',
      'Validates schema consistency',
      'Verifies route registration',
    ],
  },
  {
    name: 'templates',
    description: 'Manage generation templates',
    usage: './bin/cli.js templates <action>',
    options: [
      {
        name: 'list',
        type: 'boolean',
        description: 'List available templates',
      },
      {
        name: 'show',
        type: 'string',
        description: 'Show template content',
      },
    ],
    examples: [
      '# List all templates',
      './bin/cli.js templates --list',
      '',
      '# Show specific template',
      './bin/cli.js templates --show controller',
    ],
  },
];

export interface GeneratedFile {
  path: string;
  description: string;
  category: 'backend' | 'frontend' | 'shared';
}

export const generatedFiles: {
  backend: GeneratedFile[];
  frontend: GeneratedFile[];
} = {
  backend: [
    {
      path: 'modules/{name}/{name}.routes.ts',
      description: 'Fastify route definitions with schema validation',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.controller.ts',
      description: 'Request handlers and business logic',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.service.ts',
      description: 'Service layer with repository integration',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.repository.ts',
      description: 'Database operations with Knex',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.schemas.ts',
      description: 'TypeBox schemas for validation',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.types.ts',
      description: 'TypeScript type definitions',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.import.service.ts',
      description: 'Excel/CSV import service (with-import only)',
      category: 'backend',
    },
    {
      path: 'modules/{name}/{name}.events.ts',
      description: 'WebSocket event definitions (with-events only)',
      category: 'backend',
    },
  ],
  frontend: [
    {
      path: 'features/{name}/{name}.component.ts',
      description: 'Main feature component',
      category: 'frontend',
    },
    {
      path: 'features/{name}/{name}.service.ts',
      description: 'HTTP service for API calls',
      category: 'frontend',
    },
    {
      path: 'features/{name}/{name}.types.ts',
      description: 'TypeScript interfaces',
      category: 'frontend',
    },
    {
      path: 'features/{name}/components/{name}-list.component.ts',
      description: 'List/table component',
      category: 'frontend',
    },
    {
      path: 'features/{name}/components/{name}-form.component.ts',
      description: 'Create/edit form component',
      category: 'frontend',
    },
    {
      path: 'features/{name}/components/{name}-dialog.component.ts',
      description: 'Dialog wrapper for form',
      category: 'frontend',
    },
    {
      path: 'features/{name}/components/{name}-import-dialog.component.ts',
      description: 'Import dialog (with-import only)',
      category: 'frontend',
    },
    {
      path: 'features/{name}/{name}.routes.ts',
      description: 'Angular route definitions',
      category: 'frontend',
    },
  ],
};

export interface TroubleshootingItem {
  problem: string;
  solution: string;
  example?: string;
}

export const troubleshooting: TroubleshootingItem[] = [
  {
    problem: 'Missing double dash separator',
    solution:
      'When using pnpm scripts, add -- before table name: pnpm run crud -- TABLE_NAME',
    example: '❌ pnpm run crud products\n✅ pnpm run crud -- products --force',
  },
  {
    problem: 'Table not found',
    solution:
      'Run migrations first and check table exists: pnpm run crud:list',
    example: 'pnpm run db:migrate && pnpm run crud:list',
  },
  {
    problem: 'Cannot connect to database',
    solution:
      'Ensure Docker containers are running and .env.local has correct ports',
    example: 'docker ps && cat .env.local | grep PORT',
  },
  {
    problem: 'Files not being generated',
    solution: 'Check --dry-run is not set, and use --force to overwrite',
    example: 'pnpm run crud -- products --force',
  },
  {
    problem: 'TypeScript compilation errors after generation',
    solution:
      'Ensure all dependencies are installed and restart TypeScript server',
    example: 'pnpm install && pnpm run build',
  },
  {
    problem: 'Routes not registered',
    solution:
      'Check if --no-register was used, manually register in app.ts if needed',
    example:
      "import { productsRoutes } from './modules/products/products.routes';",
  },
  {
    problem: 'Frontend generation fails',
    solution: 'Generate backend first, then frontend separately',
    example:
      'pnpm run crud -- products --force && ./bin/cli.js generate products --target frontend --force',
  },
];

/**
 * Get all commands
 */
export function getAllCommands(): CommandInfo[] {
  return commands;
}

/**
 * Get command by name
 */
export function getCommand(name: string): CommandInfo | undefined {
  return commands.find((c) => c.name === name);
}

/**
 * Get all packages
 */
export function getAllPackages(): PackageInfo[] {
  return packages;
}

/**
 * Get troubleshooting tips
 */
export function getTroubleshooting(): TroubleshootingItem[] {
  return troubleshooting;
}

/**
 * Build command string from options
 */
export function buildCommand(
  tableName: string,
  options: {
    target?: 'backend' | 'frontend';
    package?: 'standard' | 'enterprise' | 'full';
    withImport?: boolean;
    withEvents?: boolean;
    force?: boolean;
    dryRun?: boolean;
  },
): string {
  const parts: string[] = [];

  if (options.target === 'frontend') {
    parts.push('./bin/cli.js generate');
    parts.push(tableName);
    parts.push('--target frontend');
  } else {
    // Backend - use pnpm scripts
    if (options.package === 'full' || (options.withImport && options.withEvents)) {
      parts.push('pnpm run crud:full --');
    } else if (options.package === 'enterprise' || options.withImport) {
      parts.push('pnpm run crud:import --');
    } else if (options.withEvents) {
      parts.push('pnpm run crud:events --');
    } else {
      parts.push('pnpm run crud --');
    }
    parts.push(tableName);
  }

  if (options.withImport && options.target === 'frontend') {
    parts.push('--with-import');
  }

  if (options.withEvents && options.target === 'frontend') {
    parts.push('--with-events');
  }

  if (options.force) {
    parts.push('--force');
  }

  if (options.dryRun) {
    parts.push('--dry-run');
  }

  return parts.join(' ');
}
