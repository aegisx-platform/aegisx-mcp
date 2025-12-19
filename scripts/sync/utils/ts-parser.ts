/**
 * TypeScript Parser Utility
 *
 * Provides wrapper functions around TypeScript compiler API for common AST operations.
 * Used by extractors to parse TypeScript source files and extract metadata.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a TypeScript SourceFile from a file path.
 *
 * @param filePath - Absolute or relative path to the TypeScript file
 * @returns TypeScript SourceFile AST or undefined if file cannot be read
 * @throws Error if file doesn't exist or cannot be parsed
 */
export function createSourceFile(filePath: string): ts.SourceFile {
  try {
    // Resolve the file path to absolute path
    const absolutePath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // Read file content
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');

    // Create source file with appropriate script target
    const sourceFile = ts.createSourceFile(
      absolutePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true, // setParentNodes - important for traversal
    );

    return sourceFile;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to create source file for ${filePath}: ${error.message}`,
      );
    }
    throw error;
  }
}

/**
 * Finds a decorator with the specified name on a node.
 *
 * @param node - TypeScript node to search for decorator
 * @param name - Name of the decorator to find (e.g., 'Component', 'Input', 'Output')
 * @returns Decorator node if found, undefined otherwise
 */
export function findDecorator(
  node: ts.Node,
  name: string,
): ts.Decorator | undefined {
  try {
    // Check if node has decorators (it should be a class, property, or parameter)
    const decorators = ts.canHaveDecorators(node)
      ? ts.getDecorators(node)
      : undefined;

    if (!decorators || decorators.length === 0) {
      return undefined;
    }

    // Find decorator by name
    return decorators.find((decorator) => {
      const expression = decorator.expression;

      // Handle simple decorator: @DecoratorName
      if (ts.isIdentifier(expression)) {
        return expression.text === name;
      }

      // Handle decorator with arguments: @DecoratorName(...)
      if (
        ts.isCallExpression(expression) &&
        ts.isIdentifier(expression.expression)
      ) {
        return expression.expression.text === name;
      }

      return false;
    });
  } catch (error) {
    // Gracefully handle any parsing errors
    return undefined;
  }
}

/**
 * Extracts arguments from a decorator as an array of values.
 *
 * @param decorator - TypeScript Decorator node
 * @returns Array of decorator arguments (parsed from AST)
 */
export function getDecoratorArguments(decorator: ts.Decorator): any[] {
  try {
    const expression = decorator.expression;

    // If decorator has no arguments, return empty array
    if (!ts.isCallExpression(expression)) {
      return [];
    }

    // Extract arguments from call expression
    const args = expression.arguments;

    // Parse each argument to its runtime value
    return args.map((arg) => parseArgumentValue(arg));
  } catch (error) {
    // Gracefully handle parsing errors
    return [];
  }
}

/**
 * Helper function to parse an argument AST node to its runtime value.
 * Handles literals, objects, arrays, and simple expressions.
 *
 * @param node - AST node representing the argument
 * @returns Parsed value
 */
function parseArgumentValue(node: ts.Node): any {
  // String literal
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  // Numeric literal
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }

  // Boolean literals
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  // Null
  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }

  // Undefined
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
    return undefined;
  }

  // Object literal
  if (ts.isObjectLiteralExpression(node)) {
    const obj: Record<string, any> = {};
    node.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        obj[prop.name.text] = parseArgumentValue(prop.initializer);
      }
    });
    return obj;
  }

  // Array literal
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => parseArgumentValue(element));
  }

  // Identifier (variable reference) - return as string
  if (ts.isIdentifier(node)) {
    return node.text;
  }

  // For complex expressions, return the text representation
  return node.getText();
}

/**
 * Gets the type of a property declaration as a string.
 *
 * @param property - TypeScript PropertyDeclaration node
 * @returns Type as string (e.g., 'string', 'number', 'string | number')
 */
export function getPropertyType(property: ts.PropertyDeclaration): string {
  try {
    // If property has explicit type annotation
    if (property.type) {
      return property.type.getText();
    }

    // If property has initializer, try to infer type
    if (property.initializer) {
      return inferTypeFromInitializer(property.initializer);
    }

    // Default to 'any' if no type information available
    return 'any';
  } catch (error) {
    return 'any';
  }
}

/**
 * Helper function to infer type from an initializer expression.
 *
 * @param initializer - AST node representing the initializer
 * @returns Inferred type as string
 */
function inferTypeFromInitializer(initializer: ts.Expression): string {
  if (
    ts.isStringLiteral(initializer) ||
    ts.isNoSubstitutionTemplateLiteral(initializer)
  ) {
    return 'string';
  }

  if (ts.isNumericLiteral(initializer)) {
    return 'number';
  }

  if (
    initializer.kind === ts.SyntaxKind.TrueKeyword ||
    initializer.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return 'boolean';
  }

  if (ts.isArrayLiteralExpression(initializer)) {
    return 'any[]';
  }

  if (ts.isObjectLiteralExpression(initializer)) {
    return 'object';
  }

  if (
    ts.isNewExpression(initializer) &&
    ts.isIdentifier(initializer.expression)
  ) {
    return initializer.expression.text;
  }

  return 'any';
}

/**
 * Gets the initializer value of a property declaration as a string.
 *
 * @param property - TypeScript PropertyDeclaration node
 * @returns Initializer value as string, or undefined if no initializer
 */
export function getPropertyInitializer(
  property: ts.PropertyDeclaration,
): string | undefined {
  try {
    if (!property.initializer) {
      return undefined;
    }

    // Return the source text of the initializer
    return property.initializer.getText();
  } catch (error) {
    return undefined;
  }
}

/**
 * Utility function to traverse AST and find all nodes of a specific kind.
 *
 * @param node - Root node to start traversal
 * @param kind - SyntaxKind to search for
 * @returns Array of matching nodes
 */
export function findNodesByKind<T extends ts.Node>(
  node: ts.Node,
  kind: ts.SyntaxKind,
): T[] {
  const results: T[] = [];

  function visit(current: ts.Node) {
    if (current.kind === kind) {
      results.push(current as T);
    }
    ts.forEachChild(current, visit);
  }

  visit(node);
  return results;
}

/**
 * Utility function to check if a node is exported.
 *
 * @param node - Node to check
 * @returns True if node has export modifier
 */
export function isExported(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node);
  if (!modifiers) {
    return false;
  }

  return modifiers.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );
}

/**
 * Utility function to get the name of a declaration.
 *
 * @param node - Declaration node
 * @returns Name as string, or undefined if no name
 */
export function getDeclarationName(node: ts.Declaration): string | undefined {
  if (!node.name) {
    return undefined;
  }

  if (ts.isIdentifier(node.name)) {
    return node.name.text;
  }

  return node.name.getText();
}
