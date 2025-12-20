/**
 * AUTO-GENERATED FILE
 * Generated at: 2025-12-20T02:53:09.871Z
 * Generator: commands-generator@1.0.0
 * Source files:
 *   - libs/aegisx-cli/docs/QUICK_REFERENCE.md
 *   - libs/aegisx-cli/bin/cli.js
 * DO NOT EDIT MANUALLY - Changes will be overwritten on next sync
 */

 
 
 

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

export interface TroubleshootingItem {
  problem: string;
  solution: string;
  example: string;
}

export const packages: PackageInfo[] = [
  {
    name: 'standard',
    description: 'Basic CRUD generation',
    features: [
      'Basic CRUD operations (Create, Read, Update, Delete)',
      'List with pagination',
      'Search and filtering',
      'Soft delete support',
    ],
    useCases: [
      'Simple data management',
      'Prototype development',
      'Non-critical features',
    ],
    command: 'pnpm run crud -- TABLE',
  },
  {
    name: 'enterprise',
    description: 'With bulk import (Excel/CSV)',
    features: [
      'Basic CRUD operations',
      'Bulk import (Excel/CSV)',
      'Dropdown API',
      'Export functionality',
    ],
    useCases: [
      'Data migration scenarios',
      'Bulk data management',
      'Standard business features',
    ],
    command: 'pnpm run crud:import -- TABLE',
  },
  {
    name: 'full',
    description: 'Full feature package',
    features: [
      'Basic CRUD operations',
      'Bulk operations (import/export)',
      'Advanced validation',
      'Uniqueness checks',
      'Complex search filters',
      'Real-time events (optional)',
    ],
    useCases: [
      'Mission-critical enterprise features',
      'Complex business logic',
      'Data integrity requirements',
    ],
    command: 'pnpm run crud:full -- TABLE',
  },
];

export const commands: CommandInfo[] = [
  {
    name: 'generate table-name',
    description:
      'Generate CRUD module (interactive mode if no table specified)',
    usage: 'generate [table-name]',
    options: [
      {
        name: 'with-events',
        alias: 'e',
        type: 'boolean',
        description: 'Include real-time events integration',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        description: 'Preview files without creating them',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Force overwrite existing files without confirmation',
      },
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'api',
        description: 'Target app (api, web, admin)',
      },
      {
        name: 'output',
        alias: 'o',
        type: 'string',
        description: 'Custom output directory (overrides --app)',
      },
      {
        name: 'target',
        alias: 't',
        type: 'string',
        default: 'backend',
        description: 'Generation target (backend, frontend)',
      },
      {
        name: 'config',
        alias: 'c',
        type: 'string',
        description: 'Configuration file path',
      },
      {
        name: 'direct-db',
        type: 'boolean',
        description: 'Write roles directly to database (development only)',
      },
      {
        name: 'no-roles',
        type: 'boolean',
        description: 'Skip role generation entirely',
      },
      {
        name: 'migration-only',
        type: 'boolean',
        description: 'Generate migration file only (no CRUD files)',
      },
      {
        name: 'multiple-roles',
        type: 'boolean',
        description:
          'Generate multiple roles (admin, editor, viewer) instead of single role',
      },
      {
        name: 'package',
        type: 'string',
        default: 'standard',
        description: 'Feature package to generate (standard, enterprise, full)',
      },
      {
        name: 'smart-stats',
        type: 'boolean',
        default: false,
        description: 'Enable smart statistics detection based on table fields',
      },
      {
        name: 'no-format',
        type: 'boolean',
        default: false,
        description: 'Skip auto-formatting generated files',
      },
      {
        name: 'with-import',
        type: 'boolean',
        default: false,
        description: 'Include bulk import functionality (Excel/CSV upload)',
      },
      {
        name: 'with-export',
        type: 'boolean',
        default: false,
        description: 'Include export functionality (CSV/Excel/PDF export)',
      },
      {
        name: 'no-register',
        type: 'boolean',
        default: false,
        description:
          'Skip auto-registration in plugin.loader.ts / app.routes.ts',
      },
      {
        name: 'include-audit-fields',
        type: 'boolean',
        default: false,
        description:
          'Include audit fields (created_at, updated_at, deleted_at, created_by, updated_by) in forms',
      },
      {
        name: 'shell',
        type: 'string',
        description:
          'Target shell for frontend generation (e.g., inventory, system). Output goes to features/{shell}/modules/ and routes are registered in shell routes file',
      },
      {
        name: 'section',
        type: 'string',
        description:
          'Target section within a shell (e.g., master-data). Module will be registered in section config instead of main config',
      },
      {
        name: 'schema',
        alias: 's',
        type: 'string',
        default: 'public',
        description: 'PostgreSQL schema to read table from (default: public)',
      },
      {
        name: 'domain',
        type: 'string',
        description:
          'Domain path for module organization (e.g., inventory/master-data, queue/tickets)',
      },
      {
        name: 'layer',
        type: 'string',
        description:
          'Architectural layer for the module: core, platform, or domains',
      },
      {
        name: 'type',
        type: 'string',
        description:
          'Module type within domain (e.g., master-data, operations)',
      },
    ],
    examples: [
      './bin/cli.js generate drugs --target frontend --domain inventory/master-data --force',
      './bin/cli.js generate TABLE_NAME [OPTIONS]',
      './libs/aegisx-cli/bin/cli.js generate TABLE_NAME [OPTIONS]',
      './bin/cli.js generate products --with-import --with-events --force',
      './bin/cli.js generate products --target frontend --force',
      './bin/cli.js generate products --target frontend --with-import --force',
      './bin/cli.js generate products --dry-run',
      './bin/cli.js generate products --output ./custom/path --force',
      './bin/cli.js generate products --target frontend --force',
      './bin/cli.js generate products --target frontend --app admin --force',
      './bin/cli.js generate products --target frontend --shell system --force',
      './bin/cli.js generate products --target frontend --shell inventory --force',
      './bin/cli.js generate products --target frontend --force',
      './bin/cli.js generate budgets --target frontend --with-import --force',
      './bin/cli.js generate notifications --target frontend --with-events --force',
      './bin/cli.js generate orders --package full --with-import --with-events --force',
      './bin/cli.js generate orders --target frontend --package full --with-import --with-events --force',
      './bin/cli.js generate products --target frontend --force',
      './bin/cli.js generate products --target frontend --app admin --force',
      'pnpm run crud generate products --force',
      './bin/cli.js generate products --target backend --target frontend',
      './bin/cli.js generate products --target frontend --force',
      './bin/cli.js generate products --target frontend --force',
      'generate [TABLE]             # Generate CRUD module',
      'shell <SHELL_NAME>           # Generate App Shell (NEW)',
      'domain <NAME>                # Generate domain module',
    ],
    notes: [
      '- Generate backend FIRST, then frontend\n- Default app for `--target backend` is `api`\n- Default app for `--target frontend` is `web`',
      'DO: Use `./bin/cli.js generate` for advanced options',
      'DO: Generate **backend FIRST**, then frontend',
      "DON'T: Generate frontend without backend",
    ],
  },
  {
    name: 'domain',
    description: 'Generate domain module with organized structure',
    usage: 'domain',
    options: [
      {
        name: 'with-events',
        alias: 'e',
        type: 'boolean',
        description: 'Include real-time events integration',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        description: 'Preview files without creating them',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Force overwrite existing files without confirmation',
      },
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'api',
        description: 'Target app (api, web, admin)',
      },
      {
        name: 'output',
        alias: 'o',
        type: 'string',
        description: 'Custom output directory (overrides --app)',
      },
      {
        name: 'target',
        alias: 't',
        type: 'string',
        default: 'backend',
        description: 'Generation target (backend, frontend)',
      },
      {
        name: 'config',
        alias: 'c',
        type: 'string',
        description: 'Configuration file path',
      },
      {
        name: 'schema',
        alias: 's',
        type: 'string',
        default: 'public',
        description: 'PostgreSQL schema to read table from (default: public)',
      },
    ],
    examples: [
      'pnpm run domain:init -- inventory',
      './bin/cli.js domain:init inventory --dry-run  # Preview',
      'pnpm run domain:list',
      'pnpm run crud -- drugs --domain inventory/master-data --schema inventory --force',
      './bin/cli.js generate drugs --target frontend --domain inventory/master-data --force',
      '│  └─ inventory/           # Domain folder',
      '│     ├─ index.ts          # Domain plugin registration',
      '└─ migrations-inventory/ # Domain-specific migrations',
      'domain <NAME>                # Generate domain module',
      'route <DOMAIN/ROUTE>         # Add route to domain',
    ],
  },
  {
    name: 'route',
    description: 'Add route to existing domain module',
    usage: 'route',
    options: [
      {
        name: 'with-events',
        alias: 'e',
        type: 'boolean',
        description: 'Include real-time events integration',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        description: 'Preview files without creating them',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Force overwrite existing files without confirmation',
      },
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'api',
        description: 'Target app (api, web, admin)',
      },
      {
        name: 'output',
        alias: 'o',
        type: 'string',
        description: 'Custom output directory (overrides --app)',
      },
      {
        name: 'target',
        alias: 't',
        type: 'string',
        default: 'backend',
        description: 'Generation target (backend, frontend)',
      },
    ],
    examples: ['route <DOMAIN/ROUTE>         # Add route to domain'],
  },
  {
    name: 'list-tables',
    description: 'List available database tables',
    usage: 'list-tables',
    options: [
      {
        name: 'schema',
        alias: 's',
        type: 'string',
        default: 'public',
        description: 'PostgreSQL schema to list tables from (default: public)',
      },
    ],
    examples: ['list-tables                  # List database tables'],
  },
  {
    name: 'validate',
    description: 'Validate generated module',
    usage: 'validate',
    options: [],
    examples: ['validate <MODULE>            # Validate module'],
  },
  {
    name: 'packages',
    description: 'Show available feature packages',
    usage: 'packages',
    options: [],
    examples: ['packages                     # Show feature packages'],
  },
  {
    name: 'shell <shell-name>',
    description: 'Generate App Shell (simple, enterprise, or multi-app)',
    usage: 'shell <shell-name>',
    options: [
      {
        name: 'type',
        alias: 't',
        type: 'string',
        default: 'enterprise',
        description: 'Shell type (simple, enterprise, multi-app)',
      },
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'web',
        description: 'Target app (web, admin)',
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
        description: 'Theme preset (default, indigo, teal, rose)',
      },
      {
        name: 'order',
        type: 'string',
        default: '0',
        description: 'App order in launcher',
      },
      {
        name: 'with-dashboard',
        type: 'boolean',
        default: true,
        description: 'Include dashboard page',
      },
      {
        name: 'with-master-data',
        type: 'boolean',
        default: true,
        description:
          'Include Master Data page with ax-launcher for CRUD modules',
      },
      {
        name: 'with-settings',
        type: 'boolean',
        description: 'Include settings page',
      },
      {
        name: 'with-auth',
        type: 'boolean',
        default: true,
        description: 'Include AuthGuard and AuthService',
      },
      {
        name: 'with-theme-switcher',
        type: 'boolean',
        description: 'Include theme switcher component',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Force overwrite existing files without confirmation',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        description: 'Preview files without creating them',
      },
      {
        name: 'no-format',
        type: 'boolean',
        description: 'Skip auto-formatting generated files',
      },
    ],
    examples: [
      './bin/cli.js shell SHELL_NAME --force',
      './bin/cli.js generate products --target frontend --shell system --force',
      './bin/cli.js generate products --target frontend --shell inventory --force',
      'shell <SHELL_NAME>           # Generate App Shell (NEW)',
      'shell-types                  # Show available shell types',
      './bin/cli.js shell reports --force',
      './bin/cli.js shell auth --type simple --force',
      './bin/cli.js shell inventory --type multi-app --force',
      './bin/cli.js shell reports --dry-run',
      './bin/cli.js shell-types',
      'apps/web/src/app/features/{shell-name}/',
      '├── {shell-name}-shell.component.ts',
      '├── {shell-name}.config.ts',
      '├── {shell-name}.routes.ts',
      'apps/web/src/app/features/{shell-name}/',
      '├── {shell-name}-shell.component.ts',
      '├── {shell-name}.routes.ts',
      './bin/cli.js shell reports --force',
      './bin/cli.js shell auth --type simple --app web --force',
      './bin/cli.js shell inventory --type multi-app --with-settings --force',
      './bin/cli.js shell admin-panel --app admin --theme enterprise --force',
      '// {Shell Name}',
      "path: '{shell-name}',",
      "import('./features/{shell-name}/{shell-name}.routes').then((m) => m.{SHELL_NAME}_ROUTES),",
    ],
  },
  {
    name: 'shell-types',
    description: 'Show available shell types and their features',
    usage: 'shell-types',
    options: [],
    examples: [
      'shell-types                  # Show available shell types',
      './bin/cli.js shell-types',
    ],
  },
  {
    name: 'section <shell-name> <section-name>',
    description:
      'Generate a section within a shell (sub-page with ax-launcher)',
    usage: 'section <shell-name> <section-name>',
    options: [
      {
        name: 'app',
        alias: 'a',
        type: 'string',
        default: 'web',
        description: 'Target app (web, admin)',
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
        description: 'Force overwrite existing files without confirmation',
      },
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        description: 'Preview files without creating them',
      },
      {
        name: 'no-format',
        type: 'boolean',
        description: 'Skip auto-formatting generated files',
      },
    ],
    examples: [],
  },
  {
    name: 'templates',
    description: 'Manage CRUD generator templates',
    usage: 'templates',
    options: [],
    examples: [
      'templates list [TYPE]        # List templates',
      'templates set-default        # Set default template',
      'templates add                # Add custom template',
      'templates remove             # Remove custom template',
    ],
  },
  {
    name: 'list type',
    description: 'List available templates (backend, frontend, or all)',
    usage: 'list [type]',
    options: [],
    examples: [
      'pnpm run domain:list',
      'pnpm run crud:list',
      'pnpm run crud:list',
      'list-tables                  # List database tables',
      'templates list [TYPE]        # List templates',
    ],
    notes: ['DO: Check `pnpm run crud:list` before generating'],
  },
  {
    name: 'set-default',
    description: 'Set default template for backend or frontend',
    usage: 'set-default',
    options: [],
    examples: ['templates set-default        # Set default template'],
  },
  {
    name: 'add',
    description: 'Add a custom template',
    usage: 'add',
    options: [],
    examples: [
      'route <DOMAIN/ROUTE>         # Add route to domain',
      'templates add                # Add custom template',
    ],
    notes: ['DO: Add `--force` to avoid prompts'],
  },
  {
    name: 'remove',
    description: 'Remove a custom template',
    usage: 'remove',
    options: [],
    examples: ['templates remove             # Remove custom template'],
  },
  {
    name: 'config',
    description: 'Manage CRUD generator configuration',
    usage: 'config',
    options: [
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Overwrite existing configuration file',
      },
    ],
    examples: [
      'config init                  # Initialize .crudgen.json',
      'config show                  # Show current config',
      '├── {shell-name}.config.ts',
    ],
  },
  {
    name: 'init',
    description: 'Initialize .crudgen.json configuration file',
    usage: 'init',
    options: [
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Overwrite existing configuration file',
      },
    ],
    examples: [
      'pnpm run domain:init -- inventory',
      './bin/cli.js domain:init inventory --dry-run  # Preview',
      'config init                  # Initialize .crudgen.json',
    ],
  },
  {
    name: 'show',
    description: 'Show current configuration',
    usage: 'show',
    options: [],
    examples: [
      'shell-types                  # Show available shell types',
      'packages                     # Show feature packages',
      'config show                  # Show current config',
    ],
  },
  {
    name: 'activate <license-key>',
    description: 'Activate your AegisX CLI license',
    usage: 'activate <license-key>',
    options: [],
    examples: [],
  },
  {
    name: 'domain:init <domain-name>',
    description: 'List all initialized domains',
    usage: 'domain:init <domain-name>',
    options: [
      {
        name: 'dry-run',
        alias: 'd',
        type: 'boolean',
        description: 'Preview files without creating them',
      },
      {
        name: 'force',
        alias: 'f',
        type: 'boolean',
        description: 'Force reinitialize if domain already exists',
      },
    ],
    examples: [
      'pnpm run domain:init -- inventory',
      './bin/cli.js domain:init inventory --dry-run  # Preview',
    ],
  },
  {
    name: 'deactivate',
    description: 'Remove license from this machine',
    usage: 'deactivate',
    options: [],
    examples: [],
  },
  {
    name: 'license',
    description: 'Show current license status',
    usage: 'license',
    options: [],
    examples: [],
  },
  {
    name: 'trial',
    description: 'Start a 14-day free trial',
    usage: 'trial',
    options: [],
    examples: [],
  },
];

export const troubleshooting: TroubleshootingItem[] = [
  {
    problem: 'Module not found errors',
    solution: 'Run pnpm install to ensure all dependencies are available',
    example: 'pnpm install && pnpm run build',
  },
  {
    problem: 'TypeScript compilation errors',
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
