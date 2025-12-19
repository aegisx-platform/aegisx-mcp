/**
 * Component Extractor
 *
 * Extracts comprehensive metadata from Angular component files in aegisx-ui.
 * Combines tasks 7, 8, 9: Core extraction, Input/Output extraction, and Documentation extraction.
 *
 * Phase 2 - Tasks 7, 8, 9 of aegisx-mcp-sync-automation spec
 */

import * as ts from 'typescript';
import { join } from 'path';
import {
  createSourceFile,
  findDecorator,
  getDecoratorArguments,
  getPropertyType,
  getPropertyInitializer,
  findNodesByKind,
  getDeclarationName,
} from '../utils/ts-parser.js';
import {
  parseDescriptionTag,
  parseExampleTag,
  getJSDocTags,
  hasJSDocComment,
} from '../utils/jsdoc-parser.js';
import { scanComponentFiles } from '../utils/file-scanner.js';

/**
 * Represents a single component input property
 */
export interface ExtractedInput {
  name: string;
  type: string;
  default?: string;
  description: string;
  required: boolean;
}

/**
 * Represents a single component output event
 */
export interface ExtractedOutput {
  name: string;
  type: string;
  description: string;
}

/**
 * Represents a complete extracted component with all metadata
 */
export interface ExtractedComponent {
  name: string;
  selector: string;
  category: string;
  description: string;
  inputs: ExtractedInput[];
  outputs: ExtractedOutput[];
  usage: string;
  bestPractices: string[];
  relatedComponents: string[];
  filePath: string; // For debugging
}

/**
 * Category mapping from directory name to category identifier
 */
const CATEGORY_MAP: Record<string, string> = {
  'data-display': 'data-display',
  forms: 'forms',
  feedback: 'feedback',
  navigation: 'navigation',
  layout: 'layout',
  auth: 'auth',
  advanced: 'advanced',
  overlays: 'overlays',
  dialogs: 'overlays',
  drawer: 'overlays',
  calendar: 'advanced',
  card: 'data-display',
  'code-tabs': 'data-display',
  'empty-state': 'feedback',
  'error-state': 'feedback',
  'file-upload': 'forms',
  gridster: 'layout',
};

/**
 * Main extraction function that scans and extracts all component metadata
 *
 * @param componentsDir - Absolute path to aegisx-ui components directory
 * @returns Promise resolving to array of extracted components
 */
export async function extractComponents(
  componentsDir: string,
): Promise<ExtractedComponent[]> {
  const components: ExtractedComponent[] = [];
  const errors: { file: string; error: Error }[] = [];

  try {
    // Task 7: Scan component files
    const componentFiles = await scanComponentFiles(componentsDir);

    for (const relativeFilePath of componentFiles) {
      const absoluteFilePath = join(componentsDir, relativeFilePath);

      try {
        // Parse component file
        const component = await extractComponentFromFile(
          absoluteFilePath,
          relativeFilePath,
        );

        if (component) {
          components.push(component);
        }
      } catch (error) {
        errors.push({
          file: relativeFilePath,
          error: error as Error,
        });
        console.warn(
          `Warning: Failed to extract component from ${relativeFilePath}: ${
            (error as Error).message
          }`,
        );
      }
    }

    if (errors.length > 0) {
      console.warn(
        `\nExtraction completed with ${errors.length} errors out of ${componentFiles.length} files.`,
      );
    }

    return components;
  } catch (error) {
    throw new Error(
      `Failed to extract components from ${componentsDir}: ${
        (error as Error).message
      }`,
    );
  }
}

/**
 * Extract component metadata from a single TypeScript file
 *
 * @param filePath - Absolute path to component file
 * @param relativeFilePath - Relative path for category determination
 * @returns Extracted component or null if not a valid component
 */
async function extractComponentFromFile(
  filePath: string,
  relativeFilePath: string,
): Promise<ExtractedComponent | null> {
  // Create TypeScript source file
  const sourceFile = createSourceFile(filePath);

  // Find the component class
  const componentClass = findComponentClass(sourceFile);
  if (!componentClass) {
    return null;
  }

  // Task 7: Extract core metadata
  const componentDecorator = findDecorator(componentClass, 'Component');
  if (!componentDecorator) {
    return null;
  }

  const decoratorArgs = getDecoratorArguments(componentDecorator);
  const componentMetadata = decoratorArgs[0] || {};

  const selector = componentMetadata.selector || '';
  if (!selector) {
    return null; // Skip if no selector
  }

  const className = getDeclarationName(componentClass) || '';
  const componentName = extractComponentName(className);

  // Determine category from directory structure
  const category = determineCategoryFromPath(relativeFilePath);

  // Task 9: Extract documentation
  const description = parseDescriptionTag(componentClass);
  const usage = extractUsageExamples(componentClass);
  const bestPractices = extractBestPractices(componentClass);
  const relatedComponents = extractRelatedComponents(componentClass);

  // Task 8: Extract inputs and outputs
  const inputs = extractInputs(componentClass);
  const outputs = extractOutputs(componentClass);

  return {
    name: componentName,
    selector,
    category,
    description: description || `${componentName} component`,
    inputs,
    outputs,
    usage,
    bestPractices,
    relatedComponents,
    filePath,
  };
}

/**
 * Find the component class in a source file
 *
 * @param sourceFile - TypeScript source file
 * @returns Component class declaration or undefined
 */
function findComponentClass(
  sourceFile: ts.SourceFile,
): ts.ClassDeclaration | undefined {
  const classes = findNodesByKind<ts.ClassDeclaration>(
    sourceFile,
    ts.SyntaxKind.ClassDeclaration,
  );

  // Find class with @Component decorator
  return classes.find((classNode) => {
    return findDecorator(classNode, 'Component') !== undefined;
  });
}

/**
 * Extract component name from class name
 * Example: AegisxCardComponent -> Card
 *
 * @param className - Full class name
 * @returns Simplified component name
 */
function extractComponentName(className: string): string {
  // Remove "Component" suffix
  let name = className.replace(/Component$/, '');

  // Remove common prefixes (Aegisx, Ax, etc.)
  name = name.replace(/^(Aegisx|Ax)/, '');

  // Convert PascalCase to Title Case with spaces
  // Example: DataGrid -> Data Grid
  name = name.replace(/([A-Z])/g, ' $1').trim();

  return name;
}

/**
 * Determine component category from file path
 *
 * @param filePath - Relative file path
 * @returns Category string
 */
function determineCategoryFromPath(filePath: string): string {
  const pathParts = filePath.split(/[/\\]/);

  // Look for category in path parts
  for (const part of pathParts) {
    const normalizedPart = part.toLowerCase();
    if (CATEGORY_MAP[normalizedPart]) {
      return CATEGORY_MAP[normalizedPart];
    }
  }

  // Default category
  return 'data-display';
}

/**
 * Task 8: Extract @Input decorators with metadata
 *
 * @param componentClass - Component class declaration
 * @returns Array of extracted inputs
 */
function extractInputs(componentClass: ts.ClassDeclaration): ExtractedInput[] {
  const inputs: ExtractedInput[] = [];

  // Find all properties
  const properties = componentClass.members.filter(
    (member): member is ts.PropertyDeclaration =>
      ts.isPropertyDeclaration(member),
  );

  for (const property of properties) {
    const inputDecorator = findDecorator(property, 'Input');
    if (!inputDecorator) {
      continue;
    }

    const propertyName = getDeclarationName(property);
    if (!propertyName) {
      continue;
    }

    // Extract type
    const type = getPropertyType(property);

    // Extract default value
    const defaultValue = getPropertyInitializer(property);

    // Extract description from JSDoc
    const description = parseDescriptionTag(property);

    // Determine if required (no default value and not optional)
    const isOptional = propertyName.endsWith('?') || type.includes('undefined');
    const hasDefault = defaultValue !== undefined;
    const required = !isOptional && !hasDefault;

    inputs.push({
      name: propertyName.replace('?', ''),
      type,
      default: defaultValue,
      description: description || '',
      required,
    });
  }

  return inputs;
}

/**
 * Task 8: Extract @Output decorators with metadata
 *
 * @param componentClass - Component class declaration
 * @returns Array of extracted outputs
 */
function extractOutputs(
  componentClass: ts.ClassDeclaration,
): ExtractedOutput[] {
  const outputs: ExtractedOutput[] = [];

  // Find all properties
  const properties = componentClass.members.filter(
    (member): member is ts.PropertyDeclaration =>
      ts.isPropertyDeclaration(member),
  );

  for (const property of properties) {
    const outputDecorator = findDecorator(property, 'Output');
    if (!outputDecorator) {
      continue;
    }

    const propertyName = getDeclarationName(property);
    if (!propertyName) {
      continue;
    }

    // Extract type (usually EventEmitter<T>)
    let type = getPropertyType(property);

    // Simplify EventEmitter<void> to just 'void'
    const eventEmitterMatch = type.match(/EventEmitter<(.+)>/);
    if (eventEmitterMatch) {
      type = eventEmitterMatch[1];
    }

    // Extract description from JSDoc
    const description = parseDescriptionTag(property);

    outputs.push({
      name: propertyName,
      type,
      description: description || '',
    });
  }

  return outputs;
}

/**
 * Task 9: Extract usage examples from @example JSDoc tags
 *
 * @param componentClass - Component class declaration
 * @returns Combined usage examples as a string
 */
function extractUsageExamples(componentClass: ts.ClassDeclaration): string {
  const examples: string[] = [];

  // Get JSDoc tags
  const tags = getJSDocTags(componentClass);

  // Look for all @example tags
  const jsDocTags = ts.getJSDocTags(componentClass);
  if (jsDocTags && jsDocTags.length > 0) {
    const exampleTags = jsDocTags.filter(
      (tag) => tag.tagName.text === 'example',
    );

    for (const exampleTag of exampleTags) {
      if (!exampleTag.comment) {
        continue;
      }

      const exampleText =
        typeof exampleTag.comment === 'string'
          ? exampleTag.comment
          : extractTextFromJSDocComment(exampleTag.comment);

      if (exampleText) {
        const cleanedExample = cleanExampleText(exampleText);
        if (cleanedExample) {
          examples.push(cleanedExample);
        }
      }
    }
  }

  // If no examples found in JSDoc, try parseExampleTag
  if (examples.length === 0) {
    const singleExample = parseExampleTag(componentClass);
    if (singleExample) {
      examples.push(singleExample);
    }
  }

  return examples.join('\n\n');
}

/**
 * Task 9: Extract best practices from JSDoc
 *
 * @param componentClass - Component class declaration
 * @returns Array of best practice strings
 */
function extractBestPractices(componentClass: ts.ClassDeclaration): string[] {
  const bestPractices: string[] = [];

  const tags = getJSDocTags(componentClass);

  // Look for @bestPractice or @note tags
  if (tags.has('bestPractice')) {
    const practice = tags.get('bestPractice');
    if (practice) {
      bestPractices.push(practice);
    }
  }

  if (tags.has('note')) {
    const note = tags.get('note');
    if (note) {
      bestPractices.push(note);
    }
  }

  // Additional patterns: look for practices in description
  const description = parseDescriptionTag(componentClass);
  if (description) {
    // Look for bullet points or practices in description
    const lines = description.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        bestPractices.push(trimmed.substring(2));
      }
    }
  }

  return bestPractices;
}

/**
 * Task 9: Extract related components from JSDoc
 *
 * @param componentClass - Component class declaration
 * @returns Array of related component names
 */
function extractRelatedComponents(
  componentClass: ts.ClassDeclaration,
): string[] {
  const relatedComponents: string[] = [];

  const tags = getJSDocTags(componentClass);

  // Look for @related or @see tags
  if (tags.has('related')) {
    const related = tags.get('related');
    if (related) {
      // Parse comma-separated component names
      const components = related
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      relatedComponents.push(...components);
    }
  }

  if (tags.has('see')) {
    const see = tags.get('see');
    if (see) {
      // Parse comma-separated component names
      const components = see
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      relatedComponents.push(...components);
    }
  }

  // Remove duplicates
  return Array.from(new Set(relatedComponents));
}

/**
 * Helper: Extract text from JSDoc comment (handles string or array format)
 *
 * @param comment - JSDoc comment (string or array)
 * @returns Extracted text
 */
function extractTextFromJSDocComment(comment: string | readonly any[]): string {
  if (typeof comment === 'string') {
    return comment;
  }

  if (Array.isArray(comment)) {
    return comment
      .map((c) => {
        if (typeof c === 'string') {
          return c;
        }
        if (c.text) {
          return c.text;
        }
        return '';
      })
      .join('');
  }

  return '';
}

/**
 * Helper: Clean example text by removing comment markers
 *
 * @param text - Raw example text
 * @returns Cleaned example text
 */
function cleanExampleText(text: string): string {
  const lines = text.split('\n');
  const cleanedLines: string[] = [];

  for (const line of lines) {
    // Remove leading * and spaces
    let cleaned = line.replace(/^\s*\*\s?/, '');

    // Remove trailing */
    cleaned = cleaned.replace(/\s*\*\/\s*$/, '');

    // Remove leading // comments
    if (cleaned.trim().startsWith('//')) {
      continue;
    }

    cleanedLines.push(cleaned);
  }

  // Remove leading and trailing empty lines
  while (cleanedLines.length > 0 && !cleanedLines[0].trim()) {
    cleanedLines.shift();
  }
  while (
    cleanedLines.length > 0 &&
    !cleanedLines[cleanedLines.length - 1].trim()
  ) {
    cleanedLines.pop();
  }

  // Find minimum indentation to preserve relative indentation
  const nonEmptyLines = cleanedLines.filter((line) => line.trim().length > 0);
  const minIndent = Math.min(...nonEmptyLines.map((line) => line.search(/\S/)));

  if (minIndent > 0 && minIndent !== Infinity) {
    return cleanedLines
      .map((line) => (line.length > 0 ? line.slice(minIndent) : line))
      .join('\n')
      .trim();
  }

  return cleanedLines.join('\n').trim();
}
