/**
 * Components Generator
 *
 * Transforms extracted component data into valid TypeScript code for components.ts.
 * Generates valid TypeScript with ComponentInfo interface, componentCategories, and components array.
 * Maintains existing interface structure and preserves all extracted data.
 *
 * Phase 3 - Task 14 of aegisx-mcp-sync-automation spec
 */

import * as path from 'path';
import { logger } from '../utils/logger.js';
import {
  formatTypeScript,
  addFileHeader,
  FileMetadata,
} from '../utils/code-formatter.js';
import {
  writeFile,
  ensureDirectoryExists,
  WriteOptions,
  WriteResult,
} from '../utils/file-writer.js';
import type {
  ExtractedComponent,
  ExtractedInput,
  ExtractedOutput,
} from '../extractors/component-extractor.js';

/**
 * Options for component generation
 */
export interface GeneratorOptions {
  /** Output file path for generated components.ts */
  outputPath: string;
  /** Dry run mode - validate but don't write */
  dryRun?: boolean;
  /** Verbose logging */
  verbose?: boolean;
  /** Skip TypeScript validation */
  skipValidation?: boolean;
}

/**
 * Result of component generation
 */
export interface GenerationResult {
  /** Path to the generated file */
  filePath: string;
  /** Number of components generated */
  itemCount: number;
  /** Whether generation succeeded */
  success: boolean;
  /** Error if generation failed */
  error?: Error;
}

/**
 * ComponentInput interface matching the existing components.ts structure
 */
export interface ComponentInput {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

/**
 * ComponentOutput interface matching the existing components.ts structure
 */
export interface ComponentOutput {
  name: string;
  type: string;
  description: string;
}

/**
 * ComponentInfo interface matching the existing components.ts structure
 */
export interface ComponentInfo {
  name: string;
  selector: string;
  category: string;
  description: string;
  inputs: ComponentInput[];
  outputs: ComponentOutput[];
  usage: string;
  bestPractices?: string[];
  relatedComponents?: string[];
}

/**
 * Main function to generate components.ts from extracted components
 *
 * @param components - Array of extracted components
 * @param options - Generation options
 * @returns Generation result
 *
 * @example
 * ```typescript
 * const result = await generateComponentsFile(extractedComponents, {
 *   outputPath: '/path/to/components.ts',
 *   dryRun: false,
 * });
 * ```
 */
export async function generateComponentsFile(
  components: ExtractedComponent[],
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
        `Starting component generation: ${components.length} components to process`,
      );
    }

    // Validate input
    if (!components || components.length === 0) {
      throw new Error('No components provided for generation');
    }

    if (!outputPath) {
      throw new Error('Output path is required');
    }

    // Transform ExtractedComponent[] to ComponentInfo[]
    const componentInfos: ComponentInfo[] = components.map(transformComponent);

    // Extract unique categories
    const categories = extractCategories(componentInfos);

    // Generate TypeScript code
    const generatedCode = generateTypeScriptCode(componentInfos, categories);

    // Format the code
    const formattedCode = formatTypeScript(generatedCode);

    // Add file header with metadata
    const metadata: FileMetadata = {
      generatedAt: new Date(),
      generatorVersion: 'components-generator@1.0.0',
      sourceFiles: ['libs/aegisx-ui/src/lib/components/'],
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
      logger.info(`Writing components to: ${outputPath}`);
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
        `Successfully generated ${componentInfos.length} components (${writeResult.bytesWritten} bytes)`,
      );
    }

    return {
      filePath: outputPath,
      itemCount: componentInfos.length,
      success: true,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Component generation failed: ${err.message}`);
    return {
      filePath: options.outputPath,
      itemCount: 0,
      success: false,
      error: err,
    };
  }
}

/**
 * Transforms an ExtractedComponent to a ComponentInfo
 *
 * @param component - Extracted component
 * @returns Transformed ComponentInfo
 */
function transformComponent(component: ExtractedComponent): ComponentInfo {
  return {
    name: component.name,
    selector: component.selector,
    category: component.category,
    description: component.description,
    inputs: component.inputs.map(transformInput),
    outputs: component.outputs.map(transformOutput),
    usage: component.usage,
    bestPractices:
      component.bestPractices && component.bestPractices.length > 0
        ? component.bestPractices
        : undefined,
    relatedComponents:
      component.relatedComponents && component.relatedComponents.length > 0
        ? component.relatedComponents
        : undefined,
  };
}

/**
 * Transforms an ExtractedInput to a ComponentInput
 *
 * @param input - Extracted input
 * @returns Transformed ComponentInput
 */
function transformInput(input: ExtractedInput): ComponentInput {
  const result: ComponentInput = {
    name: input.name,
    type: input.type,
    description: input.description,
  };

  if (input.default !== undefined) {
    result.default = input.default;
  }

  if (input.required !== undefined && input.required !== false) {
    result.required = input.required;
  }

  return result;
}

/**
 * Transforms an ExtractedOutput to a ComponentOutput
 *
 * @param output - Extracted output
 * @returns Transformed ComponentOutput
 */
function transformOutput(output: ExtractedOutput): ComponentOutput {
  return {
    name: output.name,
    type: output.type,
    description: output.description,
  };
}

/**
 * Extracts unique categories from components in the order they appear
 *
 * @param components - Array of ComponentInfo objects
 * @returns Array of unique categories
 */
function extractCategories(components: ComponentInfo[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const component of components) {
    if (!seen.has(component.category)) {
      seen.add(component.category);
      categories.push(component.category);
    }
  }

  return categories;
}

/**
 * Generates TypeScript code for the components file
 *
 * @param components - Array of ComponentInfo objects
 * @param categories - Array of unique categories
 * @returns Generated TypeScript code as string
 */
function generateTypeScriptCode(
  components: ComponentInfo[],
  categories: string[],
): string {
  const lines: string[] = [];

  // Add file documentation
  lines.push('/**');
  lines.push(' * AegisX UI Components Registry');
  lines.push(` * Complete catalog of all ${components.length}+ UI components`);
  lines.push(' */');
  lines.push('');

  // Add ComponentInput interface
  lines.push('export interface ComponentInput {');
  lines.push('  name: string;');
  lines.push('  type: string;');
  lines.push('  default?: string;');
  lines.push('  description: string;');
  lines.push('  required?: boolean;');
  lines.push('}');
  lines.push('');

  // Add ComponentOutput interface
  lines.push('export interface ComponentOutput {');
  lines.push('  name: string;');
  lines.push('  type: string;');
  lines.push('  description: string;');
  lines.push('}');
  lines.push('');

  // Add ComponentInfo interface
  lines.push('export interface ComponentInfo {');
  lines.push('  name: string;');
  lines.push('  selector: string;');
  lines.push('  category: string;');
  lines.push('  description: string;');
  lines.push('  inputs: ComponentInput[];');
  lines.push('  outputs: ComponentOutput[];');
  lines.push('  usage: string;');
  lines.push('  bestPractices?: string[];');
  lines.push('  relatedComponents?: string[];');
  lines.push('}');
  lines.push('');

  // Add componentCategories array
  lines.push('export const componentCategories = [');
  categories.forEach((category) => {
    lines.push(`  '${escapeString(category)}',`);
  });
  lines.push('] as const;');
  lines.push('');

  // Add ComponentCategory type
  lines.push(
    'export type ComponentCategory = (typeof componentCategories)[number];',
  );
  lines.push('');

  // Add components array
  lines.push('export const components: ComponentInfo[] = [');

  // Group components by category for better organization
  const componentsByCategory = new Map<string, ComponentInfo[]>();
  for (const component of components) {
    const categoryComponents =
      componentsByCategory.get(component.category) || [];
    categoryComponents.push(component);
    componentsByCategory.set(component.category, categoryComponents);
  }

  // Add each component grouped by category
  categories.forEach((category, categoryIndex) => {
    const categoryComponents = componentsByCategory.get(category) || [];
    if (categoryComponents.length === 0) return;

    // Add category header comment
    lines.push(
      `  // ============ ${category.toUpperCase().replace(/-/g, ' ')} ============`,
    );

    categoryComponents.forEach((component) => {
      lines.push('  {');
      lines.push(`    name: '${escapeString(component.name)}',`);
      lines.push(`    selector: '${escapeString(component.selector)}',`);
      lines.push(`    category: '${escapeString(component.category)}',`);
      lines.push(`    description:`);
      lines.push(`      '${escapeString(component.description)}',`);

      // Add inputs array
      lines.push('    inputs: [');
      component.inputs.forEach((input) => {
        lines.push('      {');
        lines.push(`        name: '${escapeString(input.name)}',`);
        lines.push(`        type: "${escapeDoubleQuoteString(input.type)}",`);
        if (input.default !== undefined) {
          lines.push(`        default: '${escapeString(input.default)}',`);
        }
        lines.push(
          `        description: '${escapeString(input.description)}',`,
        );
        if (input.required !== undefined && input.required !== false) {
          lines.push(`        required: ${input.required},`);
        }
        lines.push('      },');
      });
      lines.push('    ],');

      // Add outputs array
      lines.push('    outputs: [');
      component.outputs.forEach((output) => {
        lines.push('      {');
        lines.push(`        name: '${escapeString(output.name)}',`);
        lines.push(`        type: '${escapeString(output.type)}',`);
        lines.push(
          `        description: '${escapeString(output.description)}',`,
        );
        lines.push('      },');
      });
      lines.push('    ],');

      // Add usage with template literal
      lines.push(`    usage: \`${escapeTemplateString(component.usage)}\`,`);

      // Add bestPractices array if present
      if (component.bestPractices && component.bestPractices.length > 0) {
        lines.push('    bestPractices: [');
        component.bestPractices.forEach((practice) => {
          lines.push(`      '${escapeString(practice)}',`);
        });
        lines.push('    ],');
      }

      // Add relatedComponents array if present
      if (
        component.relatedComponents &&
        component.relatedComponents.length > 0
      ) {
        lines.push('    relatedComponents: [');
        component.relatedComponents.forEach((related) => {
          lines.push(`      '${escapeString(related)}',`);
        });
        lines.push('    ],');
      }

      lines.push('  },');
    });
  });

  lines.push('];');
  lines.push('');

  // Add utility functions
  lines.push('/**');
  lines.push(' * Get all components');
  lines.push(' */');
  lines.push('export function getAllComponents(): ComponentInfo[] {');
  lines.push('  return components;');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get components by category');
  lines.push(' */');
  lines.push('export function getComponentsByCategory(');
  lines.push('  category: ComponentCategory,');
  lines.push('): ComponentInfo[] {');
  lines.push('  return components.filter((c) => c.category === category);');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Get component by name');
  lines.push(' */');
  lines.push(
    'export function getComponentByName(name: string): ComponentInfo | undefined {',
  );
  lines.push('  return components.find(');
  lines.push(
    '    (c) => c.name.toLowerCase() === name.toLowerCase() || c.selector === name,',
  );
  lines.push('  );');
  lines.push('}');
  lines.push('');

  lines.push('/**');
  lines.push(' * Search components');
  lines.push(' */');
  lines.push(
    'export function searchComponents(query: string): ComponentInfo[] {',
  );
  lines.push('  const q = query.toLowerCase();');
  lines.push('  return components.filter(');
  lines.push('    (c) =>');
  lines.push('      c.name.toLowerCase().includes(q) ||');
  lines.push('      c.selector.toLowerCase().includes(q) ||');
  lines.push('      c.description.toLowerCase().includes(q) ||');
  lines.push('      c.category.includes(q),');
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
 * Escapes special characters in a string for use in a double-quoted string literal
 *
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeDoubleQuoteString(str: string): string {
  if (!str) return '';

  return str
    .replace(/\\/g, '\\\\') // Backslash first
    .replace(/"/g, '\\"') // Double quotes
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
