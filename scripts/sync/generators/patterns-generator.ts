/**
 * Patterns Generator
 *
 * Transforms extracted pattern data into valid TypeScript code for patterns.ts.
 * Handles code snippet escaping correctly (preserves formatting, escapes special characters).
 * Generates valid TypeScript with CodePattern interface and patterns array.
 */

import * as path from 'path';
import { logger } from '../utils/logger';
import {
  formatTypeScript,
  addFileHeader,
  FileMetadata,
} from '../utils/code-formatter';
import {
  writeFile,
  ensureDirectoryExists,
  WriteOptions,
  WriteResult,
} from '../utils/file-writer';
import type { ExtractedPattern } from '../extractors/pattern-extractor';

/**
 * Options for pattern generation
 */
export interface GeneratorOptions {
  /** Output file path for generated patterns.ts */
  outputPath: string;
  /** Dry run mode - validate but don't write */
  dryRun?: boolean;
  /** Verbose logging */
  verbose?: boolean;
  /** Skip TypeScript validation */
  skipValidation?: boolean;
}

/**
 * Result of pattern generation
 */
export interface GenerationResult {
  /** Path to the generated file */
  filePath: string;
  /** Number of patterns generated */
  itemCount: number;
  /** Whether generation succeeded */
  success: boolean;
  /** Error if generation failed */
  error?: Error;
}

/**
 * CodePattern interface matching the existing patterns.ts structure
 */
export interface CodePattern {
  name: string;
  category: string;
  description: string;
  code: string;
  language: string;
  notes?: string[];
  relatedPatterns?: string[];
}

/**
 * Main function to generate patterns.ts from extracted patterns
 *
 * @param patterns - Array of extracted patterns
 * @param options - Generation options
 * @returns Generation result
 *
 * @example
 * ```typescript
 * const result = await generatePatternsFile(extractedPatterns, {
 *   outputPath: '/path/to/patterns.ts',
 *   dryRun: false,
 * });
 * ```
 */
export async function generatePatternsFile(
  patterns: ExtractedPattern[],
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
        `Starting pattern generation: ${patterns.length} patterns to process`,
      );
    }

    // Validate input
    if (!patterns || patterns.length === 0) {
      throw new Error('No patterns provided for generation');
    }

    if (!outputPath) {
      throw new Error('Output path is required');
    }

    // Transform ExtractedPattern[] to CodePattern[]
    const codePatterns: CodePattern[] = patterns.map(transformPattern);

    // Generate TypeScript code
    const generatedCode = generateTypeScriptCode(codePatterns);

    // Format the code
    const formattedCode = formatTypeScript(generatedCode);

    // Add file header with metadata
    const metadata: FileMetadata = {
      generatedAt: new Date(),
      generatorVersion: 'patterns-generator@1.0.0',
      sourceFiles: ['libs/aegisx-mcp/src/data/patterns.ts'],
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
      logger.info(`Writing patterns to: ${outputPath}`);
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
        `Successfully generated ${codePatterns.length} patterns (${writeResult.bytesWritten} bytes)`,
      );
    }

    return {
      filePath: outputPath,
      itemCount: codePatterns.length,
      success: true,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Pattern generation failed: ${err.message}`);
    return {
      filePath: options.outputPath,
      itemCount: 0,
      success: false,
      error: err,
    };
  }
}

/**
 * Transforms an ExtractedPattern to a CodePattern
 * Handles code snippet escaping for proper TypeScript generation
 *
 * @param pattern - Extracted pattern
 * @returns Transformed CodePattern
 */
function transformPattern(pattern: ExtractedPattern): CodePattern {
  return {
    name: pattern.name,
    category: pattern.category,
    description: pattern.description,
    code: pattern.code,
    language: pattern.language,
    notes:
      pattern.notes && pattern.notes.length > 0 ? pattern.notes : undefined,
    relatedPatterns:
      pattern.relatedPatterns && pattern.relatedPatterns.length > 0
        ? pattern.relatedPatterns
        : undefined,
  };
}

/**
 * Generates TypeScript code for the patterns file
 *
 * @param patterns - Array of CodePattern objects
 * @returns Generated TypeScript code as string
 */
function generateTypeScriptCode(patterns: CodePattern[]): string {
  const lines: string[] = [];

  // Add file documentation
  lines.push('/**');
  lines.push(' * AegisX Development Patterns');
  lines.push(' * Best practices and code patterns for development');
  lines.push(' */');
  lines.push('');

  // Add CodePattern interface
  lines.push('export interface CodePattern {');
  lines.push('  name: string;');
  lines.push('  category: string;');
  lines.push('  description: string;');
  lines.push('  code: string;');
  lines.push('  language: string;');
  lines.push('  notes?: string[];');
  lines.push('  relatedPatterns?: string[];');
  lines.push('}');
  lines.push('');

  // Add patterns array
  lines.push('export const patterns: CodePattern[] = [');

  // Add each pattern
  patterns.forEach((pattern, index) => {
    lines.push('  {');
    lines.push(`    name: '${escapeString(pattern.name)}',`);
    lines.push(`    category: '${escapeString(pattern.category)}',`);
    lines.push(`    description: '${escapeString(pattern.description)}',`);
    lines.push(`    language: '${escapeString(pattern.language)}',`);

    // Code field uses template literal with proper escaping
    lines.push(`    code: \`${escapeTemplateString(pattern.code)}\`,`);

    // Add notes array if present
    if (pattern.notes && pattern.notes.length > 0) {
      lines.push('    notes: [');
      pattern.notes.forEach((note) => {
        lines.push(`      '${escapeString(note)}',`);
      });
      lines.push('    ],');
    }

    // Add relatedPatterns array if present
    if (pattern.relatedPatterns && pattern.relatedPatterns.length > 0) {
      lines.push('    relatedPatterns: [');
      pattern.relatedPatterns.forEach((related) => {
        lines.push(`      '${escapeString(related)}',`);
      });
      lines.push('    ],');
    }

    lines.push('  },');
  });

  lines.push('];');
  lines.push('');

  // Add utility functions
  lines.push('/**');
  lines.push(' * Get all patterns');
  lines.push(' */');
  lines.push('export function getAllPatterns(): CodePattern[] {');
  lines.push('  return patterns;');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get patterns by category');
  lines.push(' */');
  lines.push(
    'export function getPatternsByCategory(category: string): CodePattern[] {',
  );
  lines.push('  return patterns.filter((p) => p.category === category);');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get pattern by name');
  lines.push(' */');
  lines.push(
    'export function getPatternByName(name: string): CodePattern | undefined {',
  );
  lines.push(
    '  return patterns.find((p) => p.name.toLowerCase() === name.toLowerCase());',
  );
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Search patterns');
  lines.push(' */');
  lines.push('export function searchPatterns(query: string): CodePattern[] {');
  lines.push('  const q = query.toLowerCase();');
  lines.push('  return patterns.filter(');
  lines.push('    (p) =>');
  lines.push('      p.name.toLowerCase().includes(q) ||');
  lines.push('      p.description.toLowerCase().includes(q) ||');
  lines.push('      p.category.includes(q),');
  lines.push('  );');
  lines.push('}');

  return lines.join('\n');
}

/**
 * Escapes special characters in a string for use in a single-quoted string literal
 *
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeString(str: string): string {
  if (!str) return '';

  return str
    .replace(/\\/g, '\\\\') // Backslash first (must be first to avoid double-escaping)
    .replace(/'/g, "\\'") // Single quotes
    .replace(/\n/g, '\\n') // Newlines
    .replace(/\r/g, '\\r') // Carriage returns
    .replace(/\t/g, '\\t') // Tabs
    .replace(/\f/g, '\\f') // Form feeds
    .replace(/\v/g, '\\v'); // Vertical tabs
}

/**
 * Escapes special characters in a string for use in a template literal (backtick string)
 * Template literals support all characters except backticks and ${...}
 *
 * @param str - String to escape
 * @returns Escaped string safe for template literals
 */
function escapeTemplateString(str: string): string {
  if (!str) return '';

  return str
    .replace(/\\/g, '\\\\') // Backslash first
    .replace(/`/g, '\\`') // Backticks must be escaped
    .replace(/\$/g, '\\$'); // Dollar sign must be escaped (to prevent ${...} interpretation)
}
