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
    name: 'domain:init',
    description:
      'Initialize a new domain with PostgreSQL schema and folder structure',
    usage: 'pnpm run domain:init -- <domain_name> [options]',
    options: [
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        default: false,
        description: 'Reinitialize even if domain already exists',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        default: false,
        description: 'Preview files without creating',
      },
    ],
    examples: [
      '# Initialize inventory domain',
      'pnpm run domain:init -- inventory',
      '',
      '# Initialize with dry run preview',
      './bin/cli.js domain:init inventory --dry-run',
      '',
      '# Force reinitialize existing domain',
      './bin/cli.js domain:init inventory --force',
    ],
    notes: [
      'Creates PostgreSQL schema, knexfile, migrations folder, seeds folder',
      'Run migration after init: npx knex migrate:latest --knexfile knexfile-{domain}.ts',
      'Domain names are converted: hr_management → hr-management (kebab), hr_management (snake)',
    ],
  },
  {
    name: 'domain:list',
    description: 'List all initialized domains in the project',
    usage: 'pnpm run domain:list',
    options: [],
    examples: [
      '# List all domains',
      'pnpm run domain:list',
      '',
      '# Or using direct CLI',
      './bin/cli.js domain:list',
    ],
    notes: [
      'Shows domains with their schema names and status',
      'Checks for knexfile and modules folder existence',
    ],
  },
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
      {
        name: 'domain',
        type: 'string',
        description:
          'Domain path for module organization (e.g., inventory/master-data)',
      },
      {
        name: 'schema',
        alias: 's',
        type: 'string',
        default: 'public',
        description: 'PostgreSQL schema to read table from',
      },
      {
        name: 'shell',
        type: 'string',
        description:
          'Target shell for frontend generation (requires --target frontend)',
      },
      {
        name: 'section',
        type: 'string',
        description: 'Target section within shell (requires --shell)',
      },
      {
        name: 'smart-stats',
        type: 'boolean',
        default: false,
        description: 'Enable smart statistics detection for dashboard cards',
      },
      {
        name: 'direct-db',
        type: 'boolean',
        default: false,
        description: 'Write roles directly to database instead of migration',
      },
      {
        name: 'no-roles',
        type: 'boolean',
        default: false,
        description: 'Skip role/permission generation',
      },
      {
        name: 'migration-only',
        type: 'boolean',
        default: false,
        description: 'Generate only the migration file (for role permissions)',
      },
      {
        name: 'multiple-roles',
        type: 'boolean',
        default: false,
        description: 'Generate multiple role levels (admin, manager, viewer)',
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
      '# Generate for specific domain (e.g., inventory)',
      'pnpm run crud -- drugs --domain inventory/master-data --schema inventory --force',
      '',
      '# Generate for HR domain',
      'pnpm run crud -- employees --domain hr --schema hr --force',
      '',
      '# Frontend generation (must generate backend first)',
      './bin/cli.js generate products --target frontend --force',
      '',
      '# Frontend with import dialog',
      './bin/cli.js generate budgets --target frontend --with-import --force',
      '',
      '# Dry run to preview',
      'pnpm run crud -- articles --dry-run',
      '',
      '# Frontend generation for specific shell and section',
      './bin/cli.js generate drugs --target frontend --shell inventory --section master-data --force',
      '',
      '# Generate with smart statistics for dashboard',
      './bin/cli.js generate orders --target frontend --shell sales --smart-stats --force',
      '',
      '# Generate backend with multiple roles',
      'pnpm run crud -- invoices --multiple-roles --force',
      '',
      '# Skip role generation',
      'pnpm run crud -- temp_data --no-roles --force',
    ],
    notes: [
      'Always use -- separator before table name when using pnpm scripts',
      'Generate backend first, then frontend',
      'Use snake_case for table names (auto-converted to kebab-case)',
      'For domain generation, initialize domain first: pnpm run domain:init -- <domain>',
      'Domain auto-detect: prompts to initialize if domain not found',
      'Use --shell and --section for App Shell integration',
      'Use --smart-stats to auto-detect statistics fields for dashboard cards',
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
  {
    name: 'shell',
    description: 'Generate App Shell for organizing frontend features',
    usage: './bin/cli.js shell <shell-name> [options]',
    options: [
      {
        name: 'type',
        alias: 't',
        type: 'string',
        default: 'simple',
        description: 'Shell type',
        choices: ['simple', 'enterprise', 'multi-app'],
      },
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'web',
        description: 'Target app',
        choices: ['web', 'admin'],
      },
      {
        name: 'name',
        alias: 'n',
        type: 'string',
        description: 'Display name for the shell',
      },
      {
        name: 'theme',
        type: 'string',
        default: 'default',
        description: 'Theme preset',
        choices: ['default', 'indigo', 'teal', 'rose'],
      },
      {
        name: 'with-dashboard',
        type: 'boolean',
        default: false,
        description: 'Include dashboard page',
      },
      {
        name: 'with-master-data',
        type: 'boolean',
        default: false,
        description: 'Include Master Data page with ax-launcher',
      },
      {
        name: 'with-settings',
        type: 'boolean',
        default: false,
        description: 'Include settings page',
      },
      {
        name: 'with-auth',
        type: 'boolean',
        default: false,
        description: 'Include AuthGuard and AuthService',
      },
      {
        name: 'with-theme-switcher',
        type: 'boolean',
        default: false,
        description: 'Include theme switcher component',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        default: false,
        description: 'Force overwrite existing files',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        default: false,
        description: 'Preview files without creating',
      },
    ],
    examples: [
      '# Generate simple shell',
      './bin/cli.js shell inventory --app web --force',
      '',
      '# Generate enterprise shell with all features',
      './bin/cli.js shell hr --type enterprise --with-dashboard --with-master-data --force',
      '',
      '# Generate shell with theme',
      './bin/cli.js shell finance --theme indigo --with-settings --force',
      '',
      '# Preview shell generation',
      './bin/cli.js shell crm --dry-run',
    ],
    notes: [
      'Shell types: simple (basic layout), enterprise (with sidebar), multi-app (tenant-aware)',
      'Use --with-master-data for ax-launcher integration',
      'Shells organize features into logical groupings',
      'After creating shell, use section command to add sections',
    ],
  },
  {
    name: 'section',
    description: 'Generate section within an App Shell',
    usage: './bin/cli.js section <shell-name> <section-name> [options]',
    options: [
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'web',
        description: 'Target app',
        choices: ['web', 'admin'],
      },
      {
        name: 'name',
        alias: 'n',
        type: 'string',
        description: 'Display name for the section',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        default: false,
        description: 'Force overwrite existing files',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        default: false,
        description: 'Preview files without creating',
      },
    ],
    examples: [
      '# Add master-data section to inventory shell',
      './bin/cli.js section inventory master-data --force',
      '',
      '# Add reports section with custom name',
      './bin/cli.js section hr reports --name "HR Reports" --force',
      '',
      '# Preview section generation',
      './bin/cli.js section finance transactions --dry-run',
    ],
    notes: [
      'Sections organize features within a shell',
      'Common sections: master-data, transactions, reports, settings',
      'Section creates routes and navigation entries',
      'Use generate command with --shell and --section to add CRUD features',
    ],
  },
  {
    name: 'shell-types',
    description: 'Show available shell types and their features',
    usage: './bin/cli.js shell-types',
    options: [],
    examples: ['# Show all shell types', './bin/cli.js shell-types'],
    notes: [
      'Lists: simple, enterprise, multi-app shell types',
      'Shows features included in each type',
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
    problem: 'Domain not initialized',
    solution:
      'Initialize domain first with domain:init command, then generate CRUD',
    example:
      'pnpm run domain:init -- inventory\nnpx knex migrate:latest --knexfile knexfile-inventory.ts\npnpm run crud -- drugs --domain inventory --schema inventory --force',
  },
  {
    problem: 'Table not found in schema',
    solution:
      'Ensure table exists in the specified PostgreSQL schema. Use --schema flag to specify non-public schemas',
    example:
      'pnpm run crud -- drugs --schema inventory --force\n# Or check tables: psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema = \'inventory\'"',
  },
  {
    problem: 'Table not found',
    solution: 'Run migrations first and check table exists: pnpm run crud:list',
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
    domain?: string;
    schema?: string;
    shell?: string;
    section?: string;
    smartStats?: boolean;
    directDb?: boolean;
    noRoles?: boolean;
    migrationOnly?: boolean;
    multipleRoles?: boolean;
  },
): string {
  const parts: string[] = [];

  if (options.target === 'frontend') {
    parts.push('./bin/cli.js generate');
    parts.push(tableName);
    parts.push('--target frontend');
  } else {
    // Backend - use pnpm scripts
    if (
      options.package === 'full' ||
      (options.withImport && options.withEvents)
    ) {
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

  // Domain options (for both backend and frontend)
  if (options.domain) {
    parts.push(`--domain ${options.domain}`);
  }

  if (options.schema && options.schema !== 'public') {
    parts.push(`--schema ${options.schema}`);
  }

  if (options.withImport && options.target === 'frontend') {
    parts.push('--with-import');
  }

  if (options.withEvents && options.target === 'frontend') {
    parts.push('--with-events');
  }

  // Shell integration options (for frontend)
  if (options.shell && options.target === 'frontend') {
    parts.push(`--shell ${options.shell}`);
  }

  if (options.section && options.target === 'frontend') {
    parts.push(`--section ${options.section}`);
  }

  if (options.smartStats && options.target === 'frontend') {
    parts.push('--smart-stats');
  }

  // Role/permission options (for backend)
  if (options.directDb && options.target !== 'frontend') {
    parts.push('--direct-db');
  }

  if (options.noRoles && options.target !== 'frontend') {
    parts.push('--no-roles');
  }

  if (options.migrationOnly && options.target !== 'frontend') {
    parts.push('--migration-only');
  }

  if (options.multipleRoles && options.target !== 'frontend') {
    parts.push('--multiple-roles');
  }

  if (options.force) {
    parts.push('--force');
  }

  if (options.dryRun) {
    parts.push('--dry-run');
  }

  return parts.join(' ');
}
