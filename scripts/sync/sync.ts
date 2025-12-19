#!/usr/bin/env node
/**
 * AegisX MCP Sync Tool
 *
 * Orchestrates the complete synchronization workflow:
 * 1. Extracts metadata from source files (components, commands, patterns)
 * 2. Generates TypeScript data files for MCP server
 * 3. Validates generated code
 *
 * Tasks 17 & 18 - aegisx-mcp-sync-automation spec
 *
 * Usage:
 *   pnpm run sync                  # Run sync with default options
 *   pnpm run sync --dry-run        # Preview changes without writing
 *   pnpm run sync --verbose        # Show detailed progress
 *   pnpm run sync --help           # Show usage information
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './utils/logger.js';

// Extractors
import { extractComponents } from './extractors/component-extractor.js';
import { extractCommands } from './extractors/command-extractor.js';
import { extractPatterns } from './extractors/pattern-extractor.js';

// Generators
import { generateComponentsFile } from './generators/components-generator.js';
import { generateCommandsFile } from './generators/commands-generator.js';
import { generatePatternsFile } from './generators/patterns-generator.js';

/**
 * CLI options parsed from process.argv
 */
interface CLIOptions {
  dryRun: boolean;
  verbose: boolean;
  help: boolean;
}

/**
 * Statistics about the sync operation
 */
interface SyncStats {
  componentsFound: number;
  commandsFound: number;
  packagesFound: number;
  patternsFound: number;
  filesGenerated: string[];
  timeElapsed: number;
}

/**
 * Error with context information
 */
interface SyncError {
  phase: string;
  message: string;
  filePath?: string;
  originalError?: Error;
}

/**
 * Parse command-line arguments (Task 18)
 */
function parseArguments(argv: string[]): CLIOptions {
  const options: CLIOptions = {
    dryRun: false,
    verbose: false,
    help: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg === '--dry-run' || arg === '-d') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      console.warn(`[WARN] Unknown argument: ${arg}`);
    }
  }

  return options;
}

/**
 * Display help information (Task 18)
 */
function showHelp(): void {
  console.log(`
AegisX MCP Sync Tool
====================

Synchronizes component, command, and pattern metadata from source files
to TypeScript data files used by the MCP server.

Usage:
  pnpm run sync [options]

Options:
  --dry-run, -d     Preview changes without writing files
  --verbose, -v     Show detailed progress and debug information
  --help, -h        Display this help message

Examples:
  pnpm run sync                    # Run sync with default options
  pnpm run sync --dry-run          # Preview what would be generated
  pnpm run sync --verbose          # Show detailed progress
  pnpm run sync --dry-run --verbose # Combine options

Output Files:
  libs/aegisx-mcp/src/data/components.ts     - UI component metadata
  libs/aegisx-mcp/src/data/crud-commands.ts  - CLI command metadata
  libs/aegisx-mcp/src/data/patterns.ts       - Development pattern metadata

Source Files:
  libs/aegisx-ui/src/lib/components/         - Angular components
  libs/aegisx-cli/docs/QUICK_REFERENCE.md    - CLI documentation
  libs/aegisx-cli/bin/cli.js                 - CLI entry point
  libs/aegisx-mcp/src/data/patterns.ts       - Existing patterns
`);
}

/**
 * Find project root by looking for package.json with "aegisx" in name
 */
function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = startDir;

  while (true) {
    // Look for pnpm-workspace.yaml first (monorepo root indicator)
    const workspaceFile = path.join(currentDir, 'pnpm-workspace.yaml');
    if (fs.existsSync(workspaceFile)) {
      return currentDir;
    }

    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8'),
        );
        // Look for a workspace root indicator
        if (
          packageJson.workspaces ||
          (packageJson.name && !packageJson.name.includes('aegisx'))
        ) {
          return currentDir;
        }
      } catch {
        // Continue searching
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached filesystem root
      throw new Error(
        'Could not find project root. Please run this script from within the aegisx project.',
      );
    }
    currentDir = parentDir;
  }
}

/**
 * Display progress indicator (Task 18)
 */
function showProgress(message: string, verbose: boolean): void {
  if (verbose) {
    logger.info(`[PROGRESS] ${message}`);
  } else {
    process.stdout.write(`${message}... `);
  }
}

/**
 * Complete progress indicator (Task 18)
 */
function completeProgress(success: boolean, verbose: boolean): void {
  if (!verbose) {
    console.log(success ? 'Done' : 'Failed');
  }
}

/**
 * Format error message with context (Task 18)
 */
function formatError(error: SyncError): string {
  let message = `[${error.phase}] ${error.message}`;

  if (error.filePath) {
    message += `\n  File: ${error.filePath}`;
  }

  if (error.originalError) {
    message += `\n  Details: ${error.originalError.message}`;
  }

  // Add actionable suggestions
  message += '\n\nSuggestions:';
  if (error.phase === 'EXTRACTION') {
    message += '\n  - Check that source files exist and are readable';
    message += '\n  - Verify file paths are correct';
    message += '\n  - Run with --verbose for detailed error information';
  } else if (error.phase === 'GENERATION') {
    message += '\n  - Verify output directory exists and is writable';
    message += '\n  - Check that extracted data is valid';
    message += '\n  - Try running with --dry-run to validate without writing';
  } else if (error.phase === 'VALIDATION') {
    message += '\n  - Check TypeScript syntax in generated files';
    message += '\n  - Review extraction logic for data completeness';
    message += '\n  - Run with --verbose to see validation details';
  }

  return message;
}

/**
 * Main orchestration function (Task 17)
 * Executes extractors in parallel and calls generators with results
 */
async function runSync(options: CLIOptions): Promise<SyncStats> {
  const startTime = Date.now();
  const errors: SyncError[] = [];
  const stats: SyncStats = {
    componentsFound: 0,
    commandsFound: 0,
    packagesFound: 0,
    patternsFound: 0,
    filesGenerated: [],
    timeElapsed: 0,
  };

  try {
    // Configure logger
    if (options.verbose) {
      logger.setVerbose(true);
      logger.setLevel('debug');
    }

    // Find project root
    const projectRoot = findProjectRoot();
    logger.info(`Project root: ${projectRoot}`);

    if (options.dryRun) {
      logger.info('[DRY RUN MODE] No files will be written\n');
    }

    // Define paths
    const componentsDir = path.join(
      projectRoot,
      'libs',
      'aegisx-ui',
      'src',
      'lib',
      'components',
    );
    const patternsFile = path.join(
      projectRoot,
      'libs',
      'aegisx-mcp',
      'src',
      'data',
      'patterns.ts',
    );
    const outputDir = path.join(
      projectRoot,
      'libs',
      'aegisx-mcp',
      'src',
      'data',
    );

    const componentsOutputPath = path.join(outputDir, 'components.ts');
    const commandsOutputPath = path.join(outputDir, 'crud-commands.ts');
    const patternsOutputPath = path.join(outputDir, 'patterns.ts');

    // ====================================================================
    // Phase 1: Parallel Extraction (Task 17)
    // ====================================================================
    logger.info('Starting extraction phase...\n');

    showProgress(
      'Extracting components, commands, and patterns',
      options.verbose,
    );

    const extractionStartTime = Date.now();

    // Run all extractors in parallel for performance
    const [componentsResult, commandsResult, patternsResult] =
      await Promise.allSettled([
        extractComponents(componentsDir),
        extractCommands(projectRoot),
        extractPatterns(patternsFile, {
          validateCodeComplete: true,
          logValidationErrors: options.verbose,
        }),
      ]);

    const extractionTime = Date.now() - extractionStartTime;

    completeProgress(true, options.verbose);

    if (options.verbose) {
      logger.info(`\nExtraction completed in ${extractionTime}ms`);
    }

    // Process extraction results
    let extractedComponents: any[] = [];
    let extractedCommands: any[] = [];
    let extractedPackages: any[] = [];
    let extractedPatterns: any[] = [];

    // Components
    if (componentsResult.status === 'fulfilled') {
      extractedComponents = componentsResult.value;
      stats.componentsFound = extractedComponents.length;
      logger.info(`Found ${stats.componentsFound} components`);
    } else {
      errors.push({
        phase: 'EXTRACTION',
        message: 'Failed to extract components',
        filePath: componentsDir,
        originalError: componentsResult.reason,
      });
    }

    // Commands and Packages
    if (commandsResult.status === 'fulfilled') {
      extractedCommands = commandsResult.value.commands;
      extractedPackages = commandsResult.value.packages;
      stats.commandsFound = extractedCommands.length;
      stats.packagesFound = extractedPackages.length;
      logger.info(
        `Found ${stats.commandsFound} commands and ${stats.packagesFound} packages`,
      );
    } else {
      errors.push({
        phase: 'EXTRACTION',
        message: 'Failed to extract commands',
        filePath: projectRoot,
        originalError: commandsResult.reason,
      });
    }

    // Patterns
    if (patternsResult.status === 'fulfilled') {
      extractedPatterns = patternsResult.value;
      stats.patternsFound = extractedPatterns.length;
      logger.info(`Found ${stats.patternsFound} patterns`);
    } else {
      errors.push({
        phase: 'EXTRACTION',
        message: 'Failed to extract patterns',
        filePath: patternsFile,
        originalError: patternsResult.reason,
      });
    }

    // Check if we have any data to generate
    if (errors.length > 0) {
      throw new Error(
        'Extraction phase failed. Cannot proceed with generation.',
      );
    }

    // ====================================================================
    // Phase 2: Generation (Task 17)
    // ====================================================================
    logger.info('\nStarting generation phase...\n');

    const generationStartTime = Date.now();

    // Generate all files sequentially (they're independent but quick)
    const generationResults = [];

    // Generate components.ts
    if (extractedComponents.length > 0) {
      showProgress('Generating components.ts', options.verbose);
      try {
        const result = await generateComponentsFile(extractedComponents, {
          outputPath: componentsOutputPath,
          dryRun: options.dryRun,
          verbose: options.verbose,
          skipValidation: false,
        });

        if (result.success) {
          stats.filesGenerated.push(componentsOutputPath);
          completeProgress(true, options.verbose);
        } else {
          throw result.error || new Error('Generation failed');
        }
      } catch (error) {
        completeProgress(false, options.verbose);
        errors.push({
          phase: 'GENERATION',
          message: 'Failed to generate components.ts',
          filePath: componentsOutputPath,
          originalError: error as Error,
        });
      }
    }

    // Generate crud-commands.ts
    if (extractedCommands.length > 0 && extractedPackages.length > 0) {
      showProgress('Generating crud-commands.ts', options.verbose);
      try {
        const result = await generateCommandsFile(
          extractedCommands,
          extractedPackages,
          {
            outputPath: commandsOutputPath,
            dryRun: options.dryRun,
            verbose: options.verbose,
            skipValidation: false,
          },
        );

        if (result.success) {
          stats.filesGenerated.push(commandsOutputPath);
          completeProgress(true, options.verbose);
        } else {
          throw result.error || new Error('Generation failed');
        }
      } catch (error) {
        completeProgress(false, options.verbose);
        errors.push({
          phase: 'GENERATION',
          message: 'Failed to generate crud-commands.ts',
          filePath: commandsOutputPath,
          originalError: error as Error,
        });
      }
    }

    // Generate patterns.ts
    if (extractedPatterns.length > 0) {
      showProgress('Generating patterns.ts', options.verbose);
      try {
        const result = await generatePatternsFile(extractedPatterns, {
          outputPath: patternsOutputPath,
          dryRun: options.dryRun,
          verbose: options.verbose,
          skipValidation: false,
        });

        if (result.success) {
          stats.filesGenerated.push(patternsOutputPath);
          completeProgress(true, options.verbose);
        } else {
          throw result.error || new Error('Generation failed');
        }
      } catch (error) {
        completeProgress(false, options.verbose);
        errors.push({
          phase: 'GENERATION',
          message: 'Failed to generate patterns.ts',
          filePath: patternsOutputPath,
          originalError: error as Error,
        });
      }
    }

    const generationTime = Date.now() - generationStartTime;

    if (options.verbose) {
      logger.info(`\nGeneration completed in ${generationTime}ms`);
    }

    // Check for generation errors
    if (errors.length > 0) {
      throw new Error('Generation phase failed');
    }

    // Calculate total time
    stats.timeElapsed = Date.now() - startTime;

    return stats;
  } catch (error) {
    // If we have collected errors, use those. Otherwise, create a general error.
    if (errors.length === 0) {
      errors.push({
        phase: 'SYNC',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    // Format and display all errors
    console.error('\n========================================');
    console.error('SYNC FAILED');
    console.error('========================================\n');

    for (const err of errors) {
      console.error(formatError(err));
      console.error('');
    }

    throw new Error(`Sync failed with ${errors.length} error(s)`);
  }
}

/**
 * Display sync statistics (Task 18)
 */
function displayStats(stats: SyncStats, options: CLIOptions): void {
  console.log('\n========================================');
  console.log('SYNC COMPLETED SUCCESSFULLY');
  console.log('========================================\n');

  console.log('Statistics:');
  console.log(`  Components found: ${stats.componentsFound}`);
  console.log(`  Commands found: ${stats.commandsFound}`);
  console.log(`  Packages found: ${stats.packagesFound}`);
  console.log(`  Patterns found: ${stats.patternsFound}`);
  console.log(`  Time taken: ${(stats.timeElapsed / 1000).toFixed(2)}s`);

  console.log('\nFiles generated:');
  if (options.dryRun) {
    console.log('  [DRY RUN] No files were written');
  } else if (stats.filesGenerated.length > 0) {
    for (const file of stats.filesGenerated) {
      console.log(`  - ${file}`);
    }
  } else {
    console.log('  No files generated');
  }

  console.log('');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    // Parse CLI arguments
    const options = parseArguments(process.argv);

    // Show help and exit
    if (options.help) {
      showHelp();
      process.exit(0);
    }

    // Run sync
    const stats = await runSync(options);

    // Display statistics
    displayStats(stats, options);

    // Exit successfully
    process.exit(0);
  } catch (error) {
    // Error already logged in runSync
    process.exit(1);
  }
}

// Run the script
main();
