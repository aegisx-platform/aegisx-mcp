/**
 * Command Extractor
 *
 * Extracts CLI command metadata from aegisx-cli:
 * - Package information (standard, enterprise, full) from QUICK_REFERENCE.md
 * - Command definitions from CLI entry point (bin/cli.js)
 * - Usage examples and documentation from QUICK_REFERENCE.md
 *
 * Combines data from multiple sources to create complete CommandInfo and PackageInfo objects.
 */

import { join } from 'path';
import { readFileContent } from '../utils/file-scanner';

/**
 * Extracted package information from documentation
 */
export interface ExtractedPackage {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  command: string;
}

/**
 * Extracted command option information
 */
export interface ExtractedOption {
  name: string;
  alias?: string;
  type: 'boolean' | 'string' | 'number';
  default?: string | boolean | number;
  description: string;
  choices?: string[];
}

/**
 * Extracted command information
 */
export interface ExtractedCommand {
  name: string;
  description: string;
  usage: string;
  options: ExtractedOption[];
  examples: string[];
  notes: string[];
  filePath: string;
}

/**
 * Main extraction function - extracts all CLI metadata
 *
 * @param projectRoot - Project root directory path
 * @returns Object containing extracted commands and packages
 */
export async function extractCommands(
  projectRoot: string,
): Promise<{ commands: ExtractedCommand[]; packages: ExtractedPackage[] }> {
  try {
    // Path to aegisx-cli
    const cliRoot = join(projectRoot, 'libs', 'aegisx-cli');
    const quickRefPath = join(cliRoot, 'docs', 'QUICK_REFERENCE.md');
    const cliEntryPath = join(cliRoot, 'bin', 'cli.js');

    // Read documentation and CLI source
    const quickRefContent = await readFileContent(quickRefPath);
    const cliContent = await readFileContent(cliEntryPath);

    // Extract package information (Task 10)
    const packages = extractPackages(quickRefContent);

    // Extract command definitions from CLI source (Task 11)
    const commandsFromSource = extractCommandsFromCLI(cliContent, cliEntryPath);

    // Extract examples and documentation (Task 12)
    const commandsWithDocs = enrichCommandsWithDocumentation(
      commandsFromSource,
      quickRefContent,
    );

    return {
      commands: commandsWithDocs,
      packages,
    };
  } catch (error) {
    console.error('Error extracting commands:', error);
    throw error;
  }
}

/**
 * Task 10: Extract package information from QUICK_REFERENCE.md
 *
 * Parses the "Package Scripts" section to extract standard, enterprise, and full packages.
 *
 * @param content - QUICK_REFERENCE.md file content
 * @returns Array of extracted packages
 */
function extractPackages(content: string): ExtractedPackage[] {
  const packages: ExtractedPackage[] = [];

  // Look for package scripts section
  const packageScriptsMatch = content.match(
    /## 📦 Package Scripts([\s\S]*?)(?=##|$)/,
  );

  if (!packageScriptsMatch) {
    console.warn('Package Scripts section not found in QUICK_REFERENCE.md');
    return packages;
  }

  const packageSection = packageScriptsMatch[1];

  // Extract table rows
  const tableRows = packageSection
    .split('\n')
    .filter((line) => line.trim().startsWith('|') && !line.includes('---'));

  // Skip header row
  const dataRows = tableRows.slice(1);

  for (const row of dataRows) {
    const cells = row
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    if (cells.length >= 3) {
      const scriptName = cells[0].replace(/`/g, '');
      const command = cells[1].replace(/`/g, '');
      const description = cells[2];

      // Determine package type from script name and description
      let packageName = '';
      let features: string[] = [];
      let useCases: string[] = [];

      if (
        scriptName.includes('crud:full') ||
        command.includes('--package full')
      ) {
        packageName = 'full';
        features = [
          'Basic CRUD operations',
          'Bulk operations (import/export)',
          'Advanced validation',
          'Uniqueness checks',
          'Complex search filters',
          'Real-time events (optional)',
        ];
        useCases = [
          'Mission-critical enterprise features',
          'Complex business logic',
          'Data integrity requirements',
        ];
      } else if (
        scriptName.includes('crud:import') ||
        command.includes('--with-import')
      ) {
        packageName = 'enterprise';
        features = [
          'Basic CRUD operations',
          'Bulk import (Excel/CSV)',
          'Dropdown API',
          'Export functionality',
        ];
        useCases = [
          'Data migration scenarios',
          'Bulk data management',
          'Standard business features',
        ];
      } else if (
        scriptName.includes('crud:events') ||
        command.includes('--with-events')
      ) {
        // Events is a feature flag, not a package
        continue;
      } else if (scriptName === 'pnpm run crud -- TABLE') {
        packageName = 'standard';
        features = [
          'Basic CRUD operations (Create, Read, Update, Delete)',
          'List with pagination',
          'Search and filtering',
          'Soft delete support',
        ];
        useCases = [
          'Simple data management',
          'Prototype development',
          'Non-critical features',
        ];
      }

      if (packageName) {
        // Check if package already added
        const existingPackage = packages.find((p) => p.name === packageName);
        if (!existingPackage) {
          packages.push({
            name: packageName,
            description: description,
            features,
            useCases,
            command: scriptName,
          });
        }
      }
    }
  }

  // Ensure all three packages exist (fallback)
  const packageNames = ['standard', 'enterprise', 'full'];
  for (const name of packageNames) {
    if (!packages.find((p) => p.name === name)) {
      packages.push({
        name,
        description: `${name.charAt(0).toUpperCase() + name.slice(1)} CRUD package`,
        features: [],
        useCases: [],
        command: `pnpm run crud${name !== 'standard' ? ':' + name : ''} -- TABLE`,
      });
    }
  }

  return packages;
}

/**
 * Task 11: Extract command definitions from CLI source code
 *
 * Parses bin/cli.js to extract commands, options, and metadata.
 *
 * @param content - CLI source file content
 * @param filePath - Path to the CLI file
 * @returns Array of extracted commands
 */
function extractCommandsFromCLI(
  content: string,
  filePath: string,
): ExtractedCommand[] {
  const commands: ExtractedCommand[] = [];

  // Find all .command() calls
  const commandPattern =
    /\.command\(['"]([^'"]+)['"]\)[\s\S]*?\.description\(['"]([^'"]+)['"]\)/g;

  let match;
  while ((match = commandPattern.exec(content)) !== null) {
    const commandName = match[1];
    const description = match[2];

    // Extract the full command block
    const commandBlockStart = match.index;
    let commandBlockEnd = commandBlockStart;
    let braceCount = 0;
    let inString = false;

    // Find the end of this command definition
    for (let i = commandBlockStart; i < content.length; i++) {
      const char = content[i];

      if (char === '"' || char === "'") {
        inString = !inString;
      }

      if (!inString) {
        if (char === '(' || char === '{') braceCount++;
        if (char === ')' || char === '}') braceCount--;

        // End when we find .action() call
        if (content.slice(i, i + 8) === '.action(' && braceCount === 0) {
          commandBlockEnd = i + 100; // Include some buffer
          break;
        }
      }
    }

    const commandBlock = content.slice(commandBlockStart, commandBlockEnd);

    // Extract options
    const options = extractOptionsFromCommandBlock(commandBlock);

    // Create command object
    commands.push({
      name: commandName.replace(/\[([^\]]+)\]/, '$1'), // Remove optional brackets
      description,
      usage: commandName,
      options,
      examples: [], // Will be filled in Task 12
      notes: [], // Will be filled in Task 12
      filePath,
    });
  }

  return commands;
}

/**
 * Helper function to extract options from a command block
 *
 * @param commandBlock - The command definition block as string
 * @returns Array of extracted options
 */
function extractOptionsFromCommandBlock(
  commandBlock: string,
): ExtractedOption[] {
  const options: ExtractedOption[] = [];

  // Match .option() calls - handle multi-line options
  const optionPattern =
    /\.option\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"](?:,\s*([^)]+))?\)/g;

  let match;
  while ((match = optionPattern.exec(commandBlock)) !== null) {
    const flagString = match[1];
    const description = match[2];
    const defaultValue = match[3]
      ? match[3].trim().replace(/[,\s]+$/, '')
      : undefined;

    // Parse flag string (e.g., "-e, --with-events" or "--package <type>")
    const flagParts = flagString.split(',').map((f) => f.trim());

    let name = '';
    let alias: string | undefined;
    let type: 'boolean' | 'string' | 'number' = 'boolean';
    let choices: string[] | undefined;

    for (const flag of flagParts) {
      if (flag.startsWith('--')) {
        // Long flag
        const flagMatch = flag.match(/--([a-z-]+)(?:\s+<([^>]+)>)?/);
        if (flagMatch) {
          name = flagMatch[1];
          if (flagMatch[2]) {
            // Has argument, so it's a string type
            type = 'string';

            // Check if it's a choice type
            if (flagMatch[2].includes('|')) {
              choices = flagMatch[2].split('|').map((c) => c.trim());
            }
          }
        }
      } else if (flag.startsWith('-')) {
        // Short flag
        const aliasMatch = flag.match(/-([a-z])/);
        if (aliasMatch) {
          alias = aliasMatch[1];
        }
      }
    }

    if (name) {
      // Parse default value
      let parsedDefault: string | boolean | number | undefined;
      if (defaultValue) {
        if (defaultValue === 'true') parsedDefault = true;
        else if (defaultValue === 'false') parsedDefault = false;
        else if (!isNaN(Number(defaultValue)))
          parsedDefault = Number(defaultValue);
        else parsedDefault = defaultValue.replace(/['"]/g, '');
      }

      options.push({
        name,
        alias,
        type,
        default: parsedDefault,
        description,
        choices,
      });
    }
  }

  return options;
}

/**
 * Task 12: Enrich commands with examples and documentation
 *
 * Extracts usage examples and notes from QUICK_REFERENCE.md and combines with command data.
 *
 * @param commands - Commands extracted from source code
 * @param quickRefContent - QUICK_REFERENCE.md content
 * @returns Commands enriched with examples and documentation
 */
function enrichCommandsWithDocumentation(
  commands: ExtractedCommand[],
  quickRefContent: string,
): ExtractedCommand[] {
  // Extract all code blocks from the entire document
  const allExamples = extractCodeBlocks(quickRefContent);

  // Extract notes from various sections
  const notes = extractNotes(quickRefContent);

  // Enrich each command with relevant examples and notes
  return commands.map((command) => {
    // Extract base command name (first word)
    const baseCommandName = command.name.split(/\s+/)[0].replace(/\[|\]/g, '');

    // Filter examples relevant to this command
    const relevantExamples = allExamples.filter((example) => {
      // Check if example contains the base command name
      const commandNamePattern = new RegExp(`\\b${baseCommandName}\\b`, 'i');
      return commandNamePattern.test(example);
    });

    // Filter notes relevant to this command
    const relevantNotes = notes.filter((note) => {
      const commandNamePattern = new RegExp(`\\b${baseCommandName}\\b`, 'i');
      return commandNamePattern.test(note);
    });

    return {
      ...command,
      examples: relevantExamples.length > 0 ? relevantExamples : [],
      notes: relevantNotes.length > 0 ? relevantNotes : [],
    };
  });
}

/**
 * Helper function to extract code blocks from markdown content
 *
 * @param content - Markdown content
 * @returns Array of code blocks (without language identifier)
 */
function extractCodeBlocks(content: string): string[] {
  const codeBlocks: string[] = [];

  // Match ```bash or ``` code blocks
  const codeBlockPattern = /```(?:bash)?\s*([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockPattern.exec(content)) !== null) {
    const code = match[1].trim();
    if (code) {
      // Split by lines and filter out comments
      const lines = code
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));

      codeBlocks.push(...lines);
    }
  }

  return codeBlocks;
}

/**
 * Helper function to extract notes from markdown content
 *
 * @param content - Markdown content
 * @returns Array of note strings
 */
function extractNotes(content: string): string[] {
  const notes: string[] = [];

  // Extract from "Important" sections
  const importantPattern = /\*\*Important\*\*:\s*\n([\s\S]*?)(?=\n\n|$)/g;
  let match;
  while ((match = importantPattern.exec(content)) !== null) {
    const noteText = match[1].trim();
    if (noteText) {
      notes.push(noteText);
    }
  }

  // Extract from "Note" sections
  const notePattern = /\*\*Note\*\*:\s*(.*?)(?=\n|$)/g;
  while ((match = notePattern.exec(content)) !== null) {
    const noteText = match[1].trim();
    if (noteText) {
      notes.push(noteText);
    }
  }

  // Extract from "CRITICAL" sections
  const criticalPattern = /\*\*CRITICAL\*\*:\s*(.*?)(?=\n|$)/g;
  while ((match = criticalPattern.exec(content)) !== null) {
    const noteText = match[1].trim();
    if (noteText) {
      notes.push('CRITICAL: ' + noteText);
    }
  }

  // Extract bullet points from "DO:" and "DON'T:" sections
  const doPattern = /✅ \*\*DO:\*\*([\s\S]*?)(?=❌|\n##|$)/;
  const doMatch = content.match(doPattern);
  if (doMatch) {
    const doItems = doMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim());
    notes.push(...doItems.map((item) => 'DO: ' + item));
  }

  const dontPattern = /❌ \*\*DON'T:\*\*([\s\S]*?)(?=\n##|$)/;
  const dontMatch = content.match(dontPattern);
  if (dontMatch) {
    const dontItems = dontMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim());
    notes.push(...dontItems.map((item) => "DON'T: " + item));
  }

  return notes;
}

/**
 * Export convenience function to extract just commands
 */
export async function extractCommandsOnly(
  projectRoot: string,
): Promise<ExtractedCommand[]> {
  const result = await extractCommands(projectRoot);
  return result.commands;
}

/**
 * Export convenience function to extract just packages
 */
export async function extractPackagesOnly(
  projectRoot: string,
): Promise<ExtractedPackage[]> {
  const result = await extractCommands(projectRoot);
  return result.packages;
}
