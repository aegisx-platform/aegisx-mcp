/**
 * Pattern Extractor Utility
 *
 * Extracts development patterns from the existing patterns.ts file,
 * validates their structure, and supports adding patterns from external files.
 * Ensures all patterns have required fields and complete code examples.
 */

import * as path from 'path';
import * as fs from 'fs';
import {
  createSourceFile,
  getDeclarationName,
  isExported,
} from '../utils/ts-parser';
import * as ts from 'typescript';
import { logger } from '../utils/logger';

/**
 * Represents a pattern extracted from the patterns.ts file or external sources
 */
export interface ExtractedPattern {
  name: string;
  category: 'backend' | 'frontend' | 'database' | 'testing';
  description: string;
  code: string;
  language: string;
  notes: string[];
  relatedPatterns: string[];
  filePath?: string; // Optional: path to the source file (for debugging)
}

/**
 * Options for pattern extraction
 */
export interface PatternExtractionOptions {
  includeFilePath?: boolean;
  validateCodeComplete?: boolean;
  logValidationErrors?: boolean;
}

/**
 * Validation result for a single pattern
 */
interface PatternValidationResult {
  valid: boolean;
  pattern?: ExtractedPattern;
  errors: string[];
}

/**
 * Main function to extract patterns from the existing patterns.ts file
 *
 * @param patternsFilePath - Path to the patterns.ts file
 * @param options - Extraction options
 * @returns Array of validated ExtractedPattern objects
 *
 * @example
 * ```typescript
 * const patterns = await extractPatterns(
 *   '/path/to/libs/aegisx-mcp/src/data/patterns.ts',
 *   { validateCodeComplete: true, logValidationErrors: true }
 * );
 * ```
 */
export async function extractPatterns(
  patternsFilePath: string,
  options: PatternExtractionOptions = {},
): Promise<ExtractedPattern[]> {
  const {
    includeFilePath = false,
    validateCodeComplete = true,
    logValidationErrors = false,
  } = options;

  try {
    // Read the patterns file
    const fileContent = fs.readFileSync(patternsFilePath, 'utf-8');

    // Parse the TypeScript file
    const sourceFile = createSourceFile(patternsFilePath);

    // Extract patterns array from the source file
    const patterns = extractPatternsFromAST(sourceFile, fileContent);

    // Validate each pattern
    const validatedPatterns: ExtractedPattern[] = [];
    const validationResults: PatternValidationResult[] = [];

    for (const pattern of patterns) {
      const result = validatePattern(pattern, {
        validateCodeComplete,
      });
      validationResults.push(result);

      if (result.valid && result.pattern) {
        if (includeFilePath) {
          result.pattern.filePath = patternsFilePath;
        }
        validatedPatterns.push(result.pattern);
      } else if (logValidationErrors) {
        logger.warn(
          `Pattern "${pattern.name}" validation failed: ${result.errors.join(', ')}`,
        );
      }
    }

    // Log summary
    logger.info(
      `Extracted ${validatedPatterns.length} valid patterns from ${patternsFilePath}`,
    );

    return validatedPatterns;
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to extract patterns from ${patternsFilePath}: ${err}`);
    throw new Error(`Pattern extraction failed: ${err}`);
  }
}

/**
 * Extracts patterns from the AST of a TypeScript file
 * Looks for the `patterns` array export and parses its structure
 *
 * @param sourceFile - TypeScript SourceFile AST
 * @param fileContent - Raw file content as string
 * @returns Array of raw pattern objects (before validation)
 */
function extractPatternsFromAST(
  sourceFile: ts.SourceFile,
  fileContent: string,
): Partial<ExtractedPattern>[] {
  const patterns: Partial<ExtractedPattern>[] = [];

  // Find the patterns array declaration
  ts.forEachChild(sourceFile, (node) => {
    // Look for: export const patterns: CodePattern[] = [...]
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length > 0
    ) {
      const declaration = node.declarationList.declarations[0];

      // Check if it's the patterns array
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'patterns' &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        const arrayLiteral =
          declaration.initializer as ts.ArrayLiteralExpression;

        // Process each element in the array
        arrayLiteral.elements.forEach((element) => {
          if (ts.isObjectLiteralExpression(element)) {
            const pattern = parsePatternObject(element, fileContent);
            if (pattern) {
              patterns.push(pattern);
            }
          }
        });
      }
    }
  });

  return patterns;
}

/**
 * Parses a single pattern object literal from the AST
 *
 * @param objNode - ObjectLiteralExpression node
 * @param fileContent - Raw file content for extracting code blocks
 * @returns Parsed pattern object or null if parsing fails
 */
function parsePatternObject(
  objNode: ts.ObjectLiteralExpression,
  fileContent: string,
): Partial<ExtractedPattern> | null {
  try {
    const pattern: Partial<ExtractedPattern> = {
      notes: [],
      relatedPatterns: [],
    };

    // Process each property in the object
    objNode.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        const propertyName = prop.name.text;
        const propertyValue = parsePropertyValue(prop.initializer, fileContent);

        switch (propertyName) {
          case 'name':
            pattern.name = propertyValue as string;
            break;
          case 'category':
            pattern.category = propertyValue as any;
            break;
          case 'description':
            pattern.description = propertyValue as string;
            break;
          case 'code':
            pattern.code = propertyValue as string;
            break;
          case 'language':
            pattern.language = propertyValue as string;
            break;
          case 'notes':
            pattern.notes = Array.isArray(propertyValue)
              ? (propertyValue as string[])
              : [];
            break;
          case 'relatedPatterns':
            pattern.relatedPatterns = Array.isArray(propertyValue)
              ? (propertyValue as string[])
              : [];
            break;
        }
      }
    });

    return pattern;
  } catch (error) {
    logger.warn(
      `Failed to parse pattern object: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

/**
 * Parses a property value from an AST node
 * Handles string literals, array literals, and template literals with proper escaping
 *
 * @param node - Expression node representing the property value
 * @param fileContent - Raw file content for multi-line values
 * @returns Parsed value
 */
function parsePropertyValue(node: ts.Expression, fileContent: string): any {
  try {
    // String literal
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    }

    // Template literal (backtick strings) - get the raw text
    if (ts.isTemplateLiteral(node)) {
      // Get the exact text from the source file
      return fileContent.substring(node.getStart() + 1, node.getEnd() - 1);
    }

    // Array literal
    if (ts.isArrayLiteralExpression(node)) {
      return node.elements.map((element) => {
        if (ts.isStringLiteral(element)) {
          return element.text;
        }
        if (ts.isNoSubstitutionTemplateLiteral(element)) {
          return element.text;
        }
        return element.getText();
      });
    }

    // Fallback to getText() for complex expressions
    return node.getText();
  } catch (error) {
    logger.warn(
      `Failed to parse property value: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

/**
 * Validates a pattern object has all required fields
 * and that code examples are complete
 *
 * @param pattern - Pattern object to validate
 * @param options - Validation options
 * @returns Validation result with errors array
 */
function validatePattern(
  pattern: Partial<ExtractedPattern>,
  options: {
    validateCodeComplete?: boolean;
  } = {},
): PatternValidationResult {
  const { validateCodeComplete = true } = options;
  const errors: string[] = [];

  // Check required fields
  if (!pattern.name) {
    errors.push('Missing required field: name');
  }

  if (!pattern.category) {
    errors.push('Missing required field: category');
  } else if (!isValidCategory(pattern.category)) {
    errors.push(
      `Invalid category: ${pattern.category}. Must be one of: backend, frontend, database, testing`,
    );
  }

  if (!pattern.description) {
    errors.push('Missing required field: description');
  }

  if (!pattern.code) {
    errors.push('Missing required field: code');
  } else if (validateCodeComplete) {
    const codeErrors = validateCodeExample(pattern.code);
    if (codeErrors.length > 0) {
      errors.push(`Code validation failed: ${codeErrors.join('; ')}`);
    }
  }

  if (!pattern.language) {
    errors.push('Missing required field: language');
  }

  // Check optional fields with defaults
  if (!pattern.notes) {
    pattern.notes = [];
  } else if (!Array.isArray(pattern.notes)) {
    errors.push('Field notes must be an array');
  }

  if (!pattern.relatedPatterns) {
    pattern.relatedPatterns = [];
  } else if (!Array.isArray(pattern.relatedPatterns)) {
    errors.push('Field relatedPatterns must be an array');
  }

  // Return result
  if (errors.length === 0) {
    return {
      valid: true,
      pattern: pattern as ExtractedPattern,
      errors: [],
    };
  } else {
    return {
      valid: false,
      errors,
    };
  }
}

/**
 * Checks if a category is valid
 *
 * @param category - Category to validate
 * @returns True if category is valid
 */
function isValidCategory(
  category: any,
): category is 'backend' | 'frontend' | 'database' | 'testing' {
  return ['backend', 'frontend', 'database', 'testing'].includes(category);
}

/**
 * Validates that a code example is complete
 * Checks for basic completeness (not empty, has content)
 *
 * @param code - Code snippet to validate
 * @returns Array of validation error messages
 */
function validateCodeExample(code: string): string[] {
  const errors: string[] = [];

  // Check if code is empty or just whitespace
  if (!code || code.trim().length === 0) {
    errors.push('Code example is empty');
    return errors;
  }

  // Check for incomplete code patterns
  const hasUnclosedBraces =
    (code.match(/{/g) || []).length !== (code.match(/}/g) || []).length;
  const hasUnclosedBrackets =
    (code.match(/\[/g) || []).length !== (code.match(/\]/g) || []).length;
  const hasUnclosedParens =
    (code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length;

  if (hasUnclosedBraces) {
    errors.push('Unclosed braces detected');
  }
  if (hasUnclosedBrackets) {
    errors.push('Unclosed brackets detected');
  }
  if (hasUnclosedParens) {
    errors.push('Unclosed parentheses detected');
  }

  return errors;
}

/**
 * Adds external patterns from a configuration file
 * Useful for manually adding patterns not found in source code
 *
 * @param existingPatterns - Patterns already extracted
 * @param externalPatternFile - Path to file containing additional patterns (JSON or TS)
 * @returns Combined array of patterns
 *
 * @example
 * ```typescript
 * // External patterns can be defined in patterns-external.json:
 * // [
 * //   {
 * //     name: "Custom Pattern",
 * //     category: "backend",
 * //     description: "A custom pattern",
 * //     code: "...",
 * //     language: "typescript",
 * //     notes: [],
 * //     relatedPatterns: []
 * //   }
 * // ]
 * ```
 */
export async function addExternalPatterns(
  existingPatterns: ExtractedPattern[],
  externalPatternFile: string,
): Promise<ExtractedPattern[]> {
  try {
    // Check if file exists
    if (!fs.existsSync(externalPatternFile)) {
      logger.warn(`External patterns file not found: ${externalPatternFile}`);
      return existingPatterns;
    }

    const fileContent = fs.readFileSync(externalPatternFile, 'utf-8');
    let externalPatterns: Partial<ExtractedPattern>[] = [];

    // Parse JSON file
    if (externalPatternFile.endsWith('.json')) {
      externalPatterns = JSON.parse(fileContent);
    }
    // Parse TypeScript file with array export
    else if (externalPatternFile.endsWith('.ts')) {
      const sourceFile = createSourceFile(externalPatternFile);
      externalPatterns = extractPatternsFromAST(sourceFile, fileContent);
    } else {
      logger.warn(
        `Unsupported external pattern file format: ${externalPatternFile}`,
      );
      return existingPatterns;
    }

    // Validate and add external patterns
    const validated: ExtractedPattern[] = [];
    for (const pattern of externalPatterns) {
      const result = validatePattern(pattern, { validateCodeComplete: true });
      if (result.valid && result.pattern) {
        result.pattern.filePath = externalPatternFile;
        validated.push(result.pattern);
      } else {
        logger.warn(
          `External pattern "${pattern.name}" validation failed: ${result.errors.join(', ')}`,
        );
      }
    }

    logger.info(
      `Added ${validated.length} external patterns from ${externalPatternFile}`,
    );
    return [...existingPatterns, ...validated];
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to add external patterns: ${err}`);
    throw new Error(`External pattern loading failed: ${err}`);
  }
}

/**
 * Gets validation statistics about extracted patterns
 *
 * @param patterns - Patterns to analyze
 * @returns Statistics object
 */
export function getPatternStats(patterns: ExtractedPattern[]): {
  total: number;
  byCategory: Record<string, number>;
  avgCodeLength: number;
  patternsWithoutNotes: number;
  patternsWithRelations: number;
} {
  const stats = {
    total: patterns.length,
    byCategory: {} as Record<string, number>,
    avgCodeLength: 0,
    patternsWithoutNotes: 0,
    patternsWithRelations: 0,
  };

  let totalCodeLength = 0;

  for (const pattern of patterns) {
    // Count by category
    stats.byCategory[pattern.category] =
      (stats.byCategory[pattern.category] || 0) + 1;

    // Sum code lengths
    totalCodeLength += pattern.code.length;

    // Count patterns without notes
    if (pattern.notes.length === 0) {
      stats.patternsWithoutNotes++;
    }

    // Count patterns with related patterns
    if (pattern.relatedPatterns.length > 0) {
      stats.patternsWithRelations++;
    }
  }

  stats.avgCodeLength =
    patterns.length > 0 ? totalCodeLength / patterns.length : 0;

  return stats;
}
