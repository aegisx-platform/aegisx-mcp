/**
 * Commands Generator
 *
 * Transforms extracted command and package data into valid TypeScript code for crud-commands.ts.
 * Handles various option types correctly and generates valid TypeScript with proper formatting.
 * Generates CommandInfo and PackageInfo arrays matching the existing interface structure.
 */

import * as path from 'path';
import { logger } from '../utils/logger';
import {
  formatTypeScript,
  addFileHeader,
  FileMetadata,
  indentCode,
} from '../utils/code-formatter';
import {
  writeFile,
  ensureDirectoryExists,
  WriteOptions,
  WriteResult,
} from '../utils/file-writer';
import type {
  ExtractedCommand,
  ExtractedPackage,
  ExtractedOption,
} from '../extractors/command-extractor';

/**
 * Options for command generation
 */
export interface GeneratorOptions {
  /** Output file path for generated crud-commands.ts */
  outputPath: string;
  /** Dry run mode - validate but don't write */
  dryRun?: boolean;
  /** Verbose logging */
  verbose?: boolean;
  /** Skip TypeScript validation */
  skipValidation?: boolean;
}

/**
 * Result of command generation
 */
export interface GenerationResult {
  /** Path to the generated file */
  filePath: string;
  /** Number of commands generated */
  commandCount: number;
  /** Number of packages generated */
  packageCount: number;
  /** Whether generation succeeded */
  success: boolean;
  /** Error if generation failed */
  error?: Error;
}

/**
 * CommandOption interface matching the existing crud-commands.ts structure
 */
export interface CommandOption {
  name: string;
  alias?: string;
  type: 'boolean' | 'string' | 'number';
  default?: string | boolean | number;
  description: string;
  choices?: string[];
}

/**
 * CommandInfo interface matching the existing crud-commands.ts structure
 */
export interface CommandInfo {
  name: string;
  description: string;
  usage: string;
  options: CommandOption[];
  examples: string[];
  notes?: string[];
}

/**
 * PackageInfo interface matching the existing crud-commands.ts structure
 */
export interface PackageInfo {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  command: string;
}

/**
 * Main function to generate crud-commands.ts from extracted commands and packages
 *
 * @param commands - Array of extracted commands
 * @param packages - Array of extracted packages
 * @param options - Generation options
 * @returns Generation result
 *
 * @example
 * ```typescript
 * const result = await generateCommandsFile(extractedCommands, extractedPackages, {
 *   outputPath: '/path/to/crud-commands.ts',
 *   dryRun: false,
 * });
 * ```
 */
export async function generateCommandsFile(
  commands: ExtractedCommand[],
  packages: ExtractedPackage[],
  options: GeneratorOptions,
): Promise<GenerationResult> {
  try {
    const {
      outputPath,
      dryRun = false,
      verbose = false,
      skipValidation = false,
    } = options;

    if (verbose) {
      logger.info(
        `Starting commands generation: ${commands.length} commands, ${packages.length} packages`,
      );
    }

    // Validate input
    if (!commands || commands.length === 0) {
      throw new Error('No commands provided for generation');
    }

    if (!packages || packages.length === 0) {
      throw new Error('No packages provided for generation');
    }

    if (!outputPath) {
      throw new Error('Output path is required');
    }

    // Transform ExtractedCommand[] to CommandInfo[]
    const commandInfos: CommandInfo[] = commands.map(transformCommand);

    // Transform ExtractedPackage[] to PackageInfo[]
    const packageInfos: PackageInfo[] = packages.map(transformPackage);

    // Generate TypeScript code
    const generatedCode = generateTypeScriptCode(commandInfos, packageInfos);

    // Format the code
    const formattedCode = formatTypeScript(generatedCode);

    // Add file header with metadata
    const metadata: FileMetadata = {
      generatedAt: new Date(),
      generatorVersion: 'commands-generator@1.0.0',
      sourceFiles: [
        'libs/aegisx-cli/docs/QUICK_REFERENCE.md',
        'libs/aegisx-cli/bin/cli.js',
      ],
    };

    const codeWithHeader = addFileHeader(formattedCode, metadata);

    // Prepare write options
    const writeOptions: WriteOptions = {
      dryRun,
      verbose,
      skipValidation,
      encoding: 'utf-8',
    };

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    ensureDirectoryExists(outputDir);

    if (verbose) {
      logger.info(`Writing commands to: ${outputPath}`);
    }

    // Write the file
    const writeResult: WriteResult = await writeFile(
      outputPath,
      codeWithHeader,
      writeOptions,
    );

    if (!writeResult.success) {
      throw writeResult.error || new Error('File write operation failed');
    }

    if (verbose) {
      logger.info(
        `Successfully generated ${commandInfos.length} commands and ${packageInfos.length} packages (${writeResult.bytesWritten} bytes)`,
      );
    }

    return {
      filePath: outputPath,
      commandCount: commandInfos.length,
      packageCount: packageInfos.length,
      success: true,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Commands generation failed: ${err.message}`);
    return {
      filePath: options.outputPath,
      commandCount: 0,
      packageCount: 0,
      success: false,
      error: err,
    };
  }
}

/**
 * Transforms an ExtractedCommand to a CommandInfo
 * Validates option types and handles various option formats
 *
 * @param command - Extracted command
 * @returns Transformed CommandInfo
 */
function transformCommand(command: ExtractedCommand): CommandInfo {
  return {
    name: command.name,
    description: command.description,
    usage: command.usage,
    options: command.options.map(transformOption),
    examples: command.examples || [],
    notes:
      command.notes && command.notes.length > 0 ? command.notes : undefined,
  };
}

/**
 * Transforms an ExtractedOption to a CommandOption
 * Handles various option types (boolean, string, number)
 *
 * @param option - Extracted option
 * @returns Transformed CommandOption
 */
function transformOption(option: ExtractedOption): CommandOption {
  const result: CommandOption = {
    name: option.name,
    type: option.type || 'boolean',
    description: option.description,
  };

  // Add optional fields if present
  if (option.alias) {
    result.alias = option.alias;
  }

  if (option.default !== undefined) {
    result.default = option.default;
  }

  if (option.choices && option.choices.length > 0) {
    result.choices = option.choices;
  }

  return result;
}

/**
 * Transforms an ExtractedPackage to a PackageInfo
 * Maps package fields directly with validation
 *
 * @param pkg - Extracted package
 * @returns Transformed PackageInfo
 */
function transformPackage(pkg: ExtractedPackage): PackageInfo {
  return {
    name: pkg.name,
    description: pkg.description,
    features: pkg.features || [],
    useCases: pkg.useCases || [],
    command: pkg.command,
  };
}

/**
 * Generates TypeScript code for the crud-commands file
 *
 * @param commands - Array of CommandInfo objects
 * @param packages - Array of PackageInfo objects
 * @returns Generated TypeScript code as string
 */
function generateTypeScriptCode(
  commands: CommandInfo[],
  packages: PackageInfo[],
): string {
  const lines: string[] = [];

  // Add file documentation
  lines.push('/**');
  lines.push(' * CRUD Generator Commands Reference');
  lines.push(' * Complete documentation of all CRUD generator capabilities');
  lines.push(' */');
  lines.push('');

  // Add CommandOption interface
  lines.push('export interface CommandOption {');
  lines.push('  name: string;');
  lines.push('  alias?: string;');
  lines.push("  type: 'boolean' | 'string' | 'number';");
  lines.push('  default?: string | boolean | number;');
  lines.push('  description: string;');
  lines.push('  choices?: string[];');
  lines.push('}');
  lines.push('');

  // Add CommandInfo interface
  lines.push('export interface CommandInfo {');
  lines.push('  name: string;');
  lines.push('  description: string;');
  lines.push('  usage: string;');
  lines.push('  options: CommandOption[];');
  lines.push('  examples: string[];');
  lines.push('  notes?: string[];');
  lines.push('}');
  lines.push('');

  // Add PackageInfo interface
  lines.push('export interface PackageInfo {');
  lines.push('  name: string;');
  lines.push('  description: string;');
  lines.push('  features: string[];');
  lines.push('  useCases: string[];');
  lines.push('  command: string;');
  lines.push('}');
  lines.push('');

  // Add TroubleshootingItem interface
  lines.push('export interface TroubleshootingItem {');
  lines.push('  problem: string;');
  lines.push('  solution: string;');
  lines.push('  example: string;');
  lines.push('}');
  lines.push('');

  // Add packages array
  lines.push('export const packages: PackageInfo[] = [');
  for (const pkg of packages) {
    lines.push('  {');
    lines.push(`    name: '${escapeString(pkg.name)}',`);
    lines.push(`    description: '${escapeString(pkg.description)}',`);
    lines.push('    features: [');
    for (const feature of pkg.features) {
      lines.push(`      '${escapeString(feature)}',`);
    }
    lines.push('    ],');
    lines.push('    useCases: [');
    for (const useCase of pkg.useCases) {
      lines.push(`      '${escapeString(useCase)}',`);
    }
    lines.push('    ],');
    lines.push(`    command: '${escapeString(pkg.command)}',`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');

  // Add commands array
  lines.push('export const commands: CommandInfo[] = [');
  for (const cmd of commands) {
    lines.push('  {');
    lines.push(`    name: '${escapeString(cmd.name)}',`);
    lines.push(`    description: '${escapeString(cmd.description)}',`);
    lines.push(`    usage: '${escapeString(cmd.usage)}',`);
    lines.push('    options: [');

    for (const opt of cmd.options) {
      lines.push('      {');
      lines.push(`        name: '${escapeString(opt.name)}',`);

      if (opt.alias) {
        lines.push(`        alias: '${escapeString(opt.alias)}',`);
      }

      lines.push(`        type: '${opt.type}',`);

      if (opt.default !== undefined) {
        lines.push(`        default: ${formatDefaultValue(opt.default)},`);
      }

      lines.push(`        description: '${escapeString(opt.description)}',`);

      if (opt.choices && opt.choices.length > 0) {
        lines.push('        choices: [');
        for (const choice of opt.choices) {
          lines.push(`          '${escapeString(choice)}',`);
        }
        lines.push('        ],');
      }

      lines.push('      },');
    }

    lines.push('    ],');
    lines.push('    examples: [');
    for (const example of cmd.examples) {
      lines.push(`      '${escapeString(example)}',`);
    }
    lines.push('    ],');

    if (cmd.notes && cmd.notes.length > 0) {
      lines.push('    notes: [');
      for (const note of cmd.notes) {
        lines.push(`      '${escapeString(note)}',`);
      }
      lines.push('    ],');
    }

    lines.push('  },');
  }
  lines.push('];');
  lines.push('');

  // Add hardcoded troubleshooting items (these are not extracted, maintained manually)
  lines.push('export const troubleshooting: TroubleshootingItem[] = [');
  lines.push('  {');
  lines.push("    problem: 'Module not found errors',");
  lines.push(
    "    solution: 'Run pnpm install to ensure all dependencies are available',",
  );
  lines.push("    example: 'pnpm install && pnpm run build',");
  lines.push('  },');
  lines.push('  {');
  lines.push("    problem: 'TypeScript compilation errors',");
  lines.push(
    "    solution: 'Ensure all dependencies are installed and restart TypeScript server',",
  );
  lines.push("    example: 'pnpm install && pnpm run build',");
  lines.push('  },');
  lines.push('  {');
  lines.push("    problem: 'Routes not registered',");
  lines.push(
    "    solution: 'Check if --no-register was used, manually register in app.ts if needed',",
  );
  lines.push(
    '    example: "import { productsRoutes } from \'./modules/products/products.routes\';",',
  );
  lines.push('  },');
  lines.push('  {');
  lines.push("    problem: 'Frontend generation fails',");
  lines.push(
    "    solution: 'Generate backend first, then frontend separately',",
  );
  lines.push(
    "    example: 'pnpm run crud -- products --force && ./bin/cli.js generate products --target frontend --force',",
  );
  lines.push('  },');
  lines.push('];');
  lines.push('');

  // Add helper functions
  lines.push('/**');
  lines.push(' * Get all commands');
  lines.push(' */');
  lines.push('export function getAllCommands(): CommandInfo[] {');
  lines.push('  return commands;');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get command by name');
  lines.push(' */');
  lines.push(
    'export function getCommand(name: string): CommandInfo | undefined {',
  );
  lines.push('  return commands.find((c) => c.name === name);');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get all packages');
  lines.push(' */');
  lines.push('export function getAllPackages(): PackageInfo[] {');
  lines.push('  return packages;');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get troubleshooting tips');
  lines.push(' */');
  lines.push('export function getTroubleshooting(): TroubleshootingItem[] {');
  lines.push('  return troubleshooting;');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Build command string from options');
  lines.push(' */');
  lines.push('export function buildCommand(');
  lines.push('  tableName: string,');
  lines.push('  options: {');
  lines.push("    target?: 'backend' | 'frontend';");
  lines.push("    package?: 'standard' | 'enterprise' | 'full';");
  lines.push('    withImport?: boolean;');
  lines.push('    withEvents?: boolean;');
  lines.push('    force?: boolean;');
  lines.push('    dryRun?: boolean;');
  lines.push('    domain?: string;');
  lines.push('    schema?: string;');
  lines.push('    shell?: string;');
  lines.push('    section?: string;');
  lines.push('    smartStats?: boolean;');
  lines.push('    directDb?: boolean;');
  lines.push('    noRoles?: boolean;');
  lines.push('    migrationOnly?: boolean;');
  lines.push('    multipleRoles?: boolean;');
  lines.push('  },');
  lines.push('): string {');
  lines.push('  const parts: string[] = [];');
  lines.push('');
  lines.push("  if (options.target === 'frontend') {");
  lines.push("    parts.push('./bin/cli.js generate');");
  lines.push('    parts.push(tableName);');
  lines.push("    parts.push('--target frontend');");
  lines.push('  } else {');
  lines.push('    // Backend - use pnpm scripts');
  lines.push('    if (');
  lines.push("      options.package === 'full' ||");
  lines.push('      (options.withImport && options.withEvents)');
  lines.push('    ) {');
  lines.push("      parts.push('pnpm run crud:full --');");
  lines.push(
    "    } else if (options.package === 'enterprise' || options.withImport) {",
  );
  lines.push("      parts.push('pnpm run crud:import --');");
  lines.push('    } else if (options.withEvents) {');
  lines.push("      parts.push('pnpm run crud:events --');");
  lines.push('    } else {');
  lines.push("      parts.push('pnpm run crud --');");
  lines.push('    }');
  lines.push('    parts.push(tableName);');
  lines.push('  }');
  lines.push('');
  lines.push('  // Domain options (for both backend and frontend)');
  lines.push('  if (options.domain) {');
  lines.push('    parts.push(`--domain ${options.domain}`);');
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.schema && options.schema !== 'public') {");
  lines.push('    parts.push(`--schema ${options.schema}`);');
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.withImport && options.target === 'frontend') {");
  lines.push("    parts.push('--with-import');");
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.withEvents && options.target === 'frontend') {");
  lines.push("    parts.push('--with-events');");
  lines.push('  }');
  lines.push('');
  lines.push('  // Shell integration options (for frontend)');
  lines.push("  if (options.shell && options.target === 'frontend') {");
  lines.push('    parts.push(`--shell ${options.shell}`);');
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.section && options.target === 'frontend') {");
  lines.push('    parts.push(`--section ${options.section}`);');
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.smartStats && options.target === 'frontend') {");
  lines.push("    parts.push('--smart-stats');");
  lines.push('  }');
  lines.push('');
  lines.push('  // Role/permission options (for backend)');
  lines.push("  if (options.directDb && options.target !== 'frontend') {");
  lines.push("    parts.push('--direct-db');");
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.noRoles && options.target !== 'frontend') {");
  lines.push("    parts.push('--no-roles');");
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.migrationOnly && options.target !== 'frontend') {");
  lines.push("    parts.push('--migration-only');");
  lines.push('  }');
  lines.push('');
  lines.push("  if (options.multipleRoles && options.target !== 'frontend') {");
  lines.push("    parts.push('--multiple-roles');");
  lines.push('  }');
  lines.push('');
  lines.push('  if (options.force) {');
  lines.push("    parts.push('--force');");
  lines.push('  }');
  lines.push('');
  lines.push('  if (options.dryRun) {');
  lines.push("    parts.push('--dry-run');");
  lines.push('  }');
  lines.push('');
  lines.push("  return parts.join(' ');");
  lines.push('}');
  lines.push('');

  // Add GeneratedFile interface
  lines.push('export interface GeneratedFile {');
  lines.push('  path: string;');
  lines.push('  description: string;');
  lines.push("  category: 'backend' | 'frontend' | 'shared';");
  lines.push('}');
  lines.push('');

  // Add generatedFiles export for compatibility
  lines.push('export const generatedFiles: {');
  lines.push('  backend: GeneratedFile[];');
  lines.push('  frontend: GeneratedFile[];');
  lines.push('} = {');
  lines.push('  backend: [');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.routes.ts',");
  lines.push(
    "      description: 'Fastify route definitions with schema validation',",
  );
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.controller.ts',");
  lines.push("      description: 'Request handlers and business logic',");
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.service.ts',");
  lines.push("      description: 'Service layer with repository integration',");
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.repository.ts',");
  lines.push("      description: 'Database operations with Knex',");
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.schemas.ts',");
  lines.push("      description: 'TypeBox schemas for validation',");
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.types.ts',");
  lines.push("      description: 'TypeScript type definitions',");
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.import.service.ts',");
  lines.push(
    "      description: 'Excel/CSV import service (with-import only)',",
  );
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'modules/{name}/{name}.events.ts',");
  lines.push(
    "      description: 'WebSocket event definitions (with-events only)',",
  );
  lines.push("      category: 'backend',");
  lines.push('    },');
  lines.push('  ],');
  lines.push('  frontend: [');
  lines.push('    {');
  lines.push("      path: 'features/{name}/{name}.component.ts',");
  lines.push("      description: 'Main feature component',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'features/{name}/{name}.service.ts',");
  lines.push("      description: 'HTTP service for API calls',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'features/{name}/{name}.types.ts',");
  lines.push("      description: 'TypeScript interfaces',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push(
    "      path: 'features/{name}/components/{name}-list.component.ts',",
  );
  lines.push("      description: 'List/table component',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push(
    "      path: 'features/{name}/components/{name}-form.component.ts',",
  );
  lines.push("      description: 'Create/edit form component',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push(
    "      path: 'features/{name}/components/{name}-dialog.component.ts',",
  );
  lines.push("      description: 'Dialog wrapper for form',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push(
    "      path: 'features/{name}/components/{name}-import-dialog.component.ts',",
  );
  lines.push("      description: 'Import dialog (with-import only)',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('    {');
  lines.push("      path: 'features/{name}/{name}.routes.ts',");
  lines.push("      description: 'Angular route definitions',");
  lines.push("      category: 'frontend',");
  lines.push('    },');
  lines.push('  ],');
  lines.push('};');

  return lines.join('\n');
}

/**
 * Escapes special characters in strings for TypeScript output
 * Handles quotes, newlines, and backslashes
 *
 * @param str - String to escape
 * @returns Escaped string safe for TypeScript string literals
 */
function escapeString(str: string): string {
  if (!str) return '';

  return str
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t'); // Escape tabs
}

/**
 * Formats a default value for TypeScript output
 * Handles different types: boolean, string, number
 *
 * @param value - Default value
 * @returns Formatted value string
 */
function formatDefaultValue(
  value: string | boolean | number | undefined,
): string {
  if (value === undefined || value === null) {
    return 'undefined';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  // String type
  return `'${escapeString(String(value))}'`;
}
