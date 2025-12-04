/**
 * AegisX CRUD Generator Tools
 */

import type { ToolDefinition } from './index.js';
import {
  getAllPackages,
  getTroubleshooting,
  buildCommand,
  generatedFiles,
} from '../data/crud-commands.js';

export const crudTools: ToolDefinition[] = [
  {
    name: 'aegisx_crud_build_command',
    description:
      'Build a CRUD generator command with the specified options. Returns the exact command to run.',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Database table name in snake_case (e.g., "products", "user_profiles")',
        },
        target: {
          type: 'string',
          enum: ['backend', 'frontend'],
          description: 'Generation target (default: backend)',
        },
        package: {
          type: 'string',
          enum: ['standard', 'enterprise', 'full'],
          description: 'Feature package: standard (basic CRUD), enterprise (+ import), full (+ events)',
        },
        withImport: {
          type: 'boolean',
          description: 'Include Excel/CSV import functionality',
        },
        withEvents: {
          type: 'boolean',
          description: 'Include WebSocket events for real-time updates',
        },
        force: {
          type: 'boolean',
          description: 'Overwrite existing files without prompt',
        },
        dryRun: {
          type: 'boolean',
          description: 'Preview files without creating them',
        },
      },
      required: ['tableName'],
    },
  },
  {
    name: 'aegisx_crud_packages',
    description:
      'Get information about available CRUD generator packages and their features.',
    inputSchema: {
      type: 'object',
      properties: {
        packageName: {
          type: 'string',
          enum: ['standard', 'enterprise', 'full'],
          description: 'Specific package to get details for (optional)',
        },
      },
    },
  },
  {
    name: 'aegisx_crud_files',
    description:
      'Show what files will be generated for a CRUD module.',
    inputSchema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          enum: ['backend', 'frontend', 'both'],
          description: 'Which target to show files for',
        },
        tableName: {
          type: 'string',
          description: 'Table name to show file paths for (optional)',
        },
      },
    },
  },
  {
    name: 'aegisx_crud_troubleshoot',
    description:
      'Get troubleshooting help for common CRUD generator issues.',
    inputSchema: {
      type: 'object',
      properties: {
        problem: {
          type: 'string',
          description: 'Describe the problem you are experiencing',
        },
      },
    },
  },
  {
    name: 'aegisx_crud_workflow',
    description:
      'Get the recommended workflow for generating a complete CRUD feature (backend + frontend).',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Table name for the feature',
        },
        withImport: {
          type: 'boolean',
          description: 'Include import functionality',
        },
        withEvents: {
          type: 'boolean',
          description: 'Include real-time events',
        },
      },
      required: ['tableName'],
    },
  },
];

interface PackageInfo {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  command: string;
}

function formatPackage(pkg: PackageInfo): string {
  const lines: string[] = [];
  lines.push(`## ${pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)} Package`);
  lines.push(pkg.description);
  lines.push('');
  lines.push('**Features:**');
  for (const feature of pkg.features) {
    lines.push(`- ${feature}`);
  }
  lines.push('');
  lines.push('**Use Cases:**');
  for (const useCase of pkg.useCases) {
    lines.push(`- ${useCase}`);
  }
  lines.push('');
  lines.push('**Command:**');
  lines.push('```bash');
  lines.push(pkg.command);
  lines.push('```');
  return lines.join('\n');
}

export function handleCrudTool(
  name: string,
  args: Record<string, unknown>,
): { content: Array<{ type: string; text: string }> } {
  switch (name) {
    case 'aegisx_crud_build_command': {
      const tableName = args.tableName as string;
      const command = buildCommand(tableName, {
        target: args.target as 'backend' | 'frontend',
        package: args.package as 'standard' | 'enterprise' | 'full',
        withImport: args.withImport as boolean,
        withEvents: args.withEvents as boolean,
        force: args.force as boolean,
        dryRun: args.dryRun as boolean,
      });

      const lines: string[] = [];
      lines.push('# CRUD Generator Command');
      lines.push('');
      lines.push('```bash');
      lines.push(command);
      lines.push('```');
      lines.push('');

      // Add helpful notes based on options
      if (args.target === 'frontend') {
        lines.push('> **Note:** Generate backend first before frontend.');
        lines.push('> ```bash');
        lines.push(`> pnpm run crud -- ${tableName} --force`);
        lines.push('> ```');
      }

      if (args.dryRun) {
        lines.push('');
        lines.push('> This is a dry run. Remove `--dry-run` to actually generate files.');
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_crud_packages': {
      const packageName = args.packageName as string | undefined;
      const packages = getAllPackages();

      if (packageName) {
        const pkg = packages.find((p) => p.name === packageName);
        if (!pkg) {
          return {
            content: [
              {
                type: 'text',
                text: `Package "${packageName}" not found. Available: standard, enterprise, full`,
              },
            ],
          };
        }
        return {
          content: [{ type: 'text', text: formatPackage(pkg) }],
        };
      }

      const lines: string[] = [];
      lines.push('# CRUD Generator Packages');
      lines.push('');
      lines.push('| Package | Description | Key Feature |');
      lines.push('|---------|-------------|-------------|');
      for (const pkg of packages) {
        lines.push(`| **${pkg.name}** | ${pkg.description} | ${pkg.features[pkg.features.length - 1] || ''} |`);
      }
      lines.push('');
      for (const pkg of packages) {
        lines.push(formatPackage(pkg));
        lines.push('');
        lines.push('---');
        lines.push('');
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_crud_files': {
      const target = (args.target as string) || 'both';
      const tableName = (args.tableName as string) || '{name}';

      // Convert snake_case to kebab-case
      const kebabName = tableName.replace(/_/g, '-');

      const lines: string[] = [];
      lines.push('# Generated Files');
      lines.push('');

      if (target === 'backend' || target === 'both') {
        lines.push('## Backend Files');
        lines.push('```');
        for (const file of generatedFiles.backend) {
          const path = file.path.replace(/{name}/g, kebabName);
          lines.push(`apps/api/src/${path}`);
          lines.push(`  └─ ${file.description}`);
        }
        lines.push('```');
        lines.push('');
      }

      if (target === 'frontend' || target === 'both') {
        lines.push('## Frontend Files');
        lines.push('```');
        for (const file of generatedFiles.frontend) {
          const path = file.path.replace(/{name}/g, kebabName);
          lines.push(`apps/admin/src/app/${path}`);
          lines.push(`  └─ ${file.description}`);
        }
        lines.push('```');
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_crud_troubleshoot': {
      const problem = (args.problem as string) || '';
      const tips = getTroubleshooting();

      const lines: string[] = [];
      lines.push('# CRUD Generator Troubleshooting');
      lines.push('');

      // Find relevant tips
      const q = problem.toLowerCase();
      const relevant = tips.filter(
        (t) =>
          t.problem.toLowerCase().includes(q) ||
          t.solution.toLowerCase().includes(q),
      );

      if (relevant.length > 0 && problem) {
        lines.push(`## Solutions for: "${problem}"`);
        lines.push('');
        for (const tip of relevant) {
          lines.push(`### ${tip.problem}`);
          lines.push(tip.solution);
          if (tip.example) {
            lines.push('```bash');
            lines.push(tip.example);
            lines.push('```');
          }
          lines.push('');
        }
      } else {
        lines.push('## Common Issues & Solutions');
        lines.push('');
        for (const tip of tips) {
          lines.push(`### ${tip.problem}`);
          lines.push(tip.solution);
          if (tip.example) {
            lines.push('```bash');
            lines.push(tip.example);
            lines.push('```');
          }
          lines.push('');
        }
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'aegisx_crud_workflow': {
      const tableName = args.tableName as string;
      const withImport = args.withImport as boolean;
      const withEvents = args.withEvents as boolean;

      const kebabName = tableName.replace(/_/g, '-');

      const lines: string[] = [];
      lines.push(`# Complete CRUD Workflow for \`${tableName}\``);
      lines.push('');
      lines.push('## Prerequisites');
      lines.push('');
      lines.push('1. Ensure database is running:');
      lines.push('```bash');
      lines.push('docker ps | grep postgres');
      lines.push('```');
      lines.push('');
      lines.push('2. Check table exists:');
      lines.push('```bash');
      lines.push('pnpm run crud:list');
      lines.push('```');
      lines.push('');
      lines.push('## Step 1: Generate Backend');
      lines.push('');
      lines.push('```bash');

      let backendCmd = 'pnpm run crud';
      if (withImport && withEvents) {
        backendCmd = 'pnpm run crud:full';
      } else if (withImport) {
        backendCmd = 'pnpm run crud:import';
      } else if (withEvents) {
        backendCmd = 'pnpm run crud:events';
      }
      lines.push(`${backendCmd} -- ${tableName} --force`);
      lines.push('```');
      lines.push('');
      lines.push('Generated files:');
      lines.push(`- \`apps/api/src/modules/${kebabName}/${kebabName}.routes.ts\``);
      lines.push(`- \`apps/api/src/modules/${kebabName}/${kebabName}.controller.ts\``);
      lines.push(`- \`apps/api/src/modules/${kebabName}/${kebabName}.service.ts\``);
      lines.push(`- \`apps/api/src/modules/${kebabName}/${kebabName}.repository.ts\``);
      lines.push(`- \`apps/api/src/modules/${kebabName}/${kebabName}.schemas.ts\``);
      lines.push(`- \`apps/api/src/modules/${kebabName}/${kebabName}.types.ts\``);
      lines.push('');

      lines.push('## Step 2: Verify Backend');
      lines.push('');
      lines.push('```bash');
      lines.push('# Build to check for errors');
      lines.push('pnpm run build');
      lines.push('');
      lines.push('# Start API server');
      lines.push('pnpm run dev:api');
      lines.push('');
      lines.push('# Test endpoint (in another terminal)');
      lines.push(`curl http://localhost:3333/api/${kebabName}`);
      lines.push('```');
      lines.push('');

      lines.push('## Step 3: Generate Frontend');
      lines.push('');
      lines.push('```bash');
      let frontendCmd = `./bin/cli.js generate ${tableName} --target frontend`;
      if (withImport) {
        frontendCmd += ' --with-import';
      }
      if (withEvents) {
        frontendCmd += ' --with-events';
      }
      frontendCmd += ' --force';
      lines.push(frontendCmd);
      lines.push('```');
      lines.push('');
      lines.push('Generated files:');
      lines.push(`- \`apps/admin/src/app/features/${kebabName}/\``);
      lines.push(`  - \`${kebabName}.component.ts\``);
      lines.push(`  - \`${kebabName}.service.ts\``);
      lines.push(`  - \`${kebabName}.types.ts\``);
      lines.push(`  - \`${kebabName}.routes.ts\``);
      lines.push(`  - \`components/\` (list, form, dialog)`);
      lines.push('');

      lines.push('## Step 4: Add Navigation');
      lines.push('');
      lines.push('Add to your navigation config:');
      lines.push('```typescript');
      lines.push('// apps/admin/src/app/config/navigation.config.ts');
      lines.push(`{`);
      lines.push(`  id: '${kebabName}',`);
      lines.push(`  title: '${tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}',`);
      lines.push(`  type: 'basic',`);
      lines.push(`  icon: 'heroicons_outline:folder',`);
      lines.push(`  link: '/${kebabName}',`);
      lines.push(`}`);
      lines.push('```');
      lines.push('');

      lines.push('## Step 5: Test Feature');
      lines.push('');
      lines.push('```bash');
      lines.push('# Start both servers');
      lines.push('pnpm run dev');
      lines.push('');
      lines.push('# Open admin app');
      lines.push('open http://localhost:4200');
      lines.push('```');
      lines.push('');

      lines.push('## Validation');
      lines.push('');
      lines.push('```bash');
      lines.push(`pnpm run crud:validate -- ${tableName}`);
      lines.push('```');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown CRUD tool: ${name}` }],
      };
  }
}
