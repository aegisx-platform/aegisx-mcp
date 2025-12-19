/**
 * JSDoc Parser Utility
 *
 * Provides utilities for extracting and parsing JSDoc comments from TypeScript nodes
 * using the TypeScript compiler API. Handles extraction of documentation tags,
 * descriptions, and code examples while preserving formatting.
 */

import * as ts from 'typescript';

/**
 * Represents a parsed JSDoc tag with name and value
 */
export interface JSDocTag {
  tagName: string;
  value: string;
}

/**
 * Extract the full JSDoc comment text from a TypeScript node
 *
 * Returns the raw JSDoc text including comment markers and formatting.
 * Returns empty string if no JSDoc comment is found.
 *
 * @param node - TypeScript AST node to extract JSDoc from
 * @returns Full JSDoc comment text or empty string if not found
 */
export function getJSDocComment(node: ts.Node): string {
  const jsDocTags = ts.getJSDocTags(node);
  if (!jsDocTags || jsDocTags.length === 0) {
    return '';
  }

  // Get the source file for location info
  const sourceFile = node.getSourceFile();
  if (!sourceFile) {
    return '';
  }

  // Find the comment text from the source
  const comments = ts.getLeadingCommentRanges(sourceFile.text, node.getStart());
  if (!comments || comments.length === 0) {
    return '';
  }

  // Extract the last comment (usually the JSDoc comment)
  const lastComment = comments[comments.length - 1];
  return sourceFile.text.substring(lastComment.pos, lastComment.end);
}

/**
 * Parse JSDoc tags from a TypeScript node
 *
 * Extracts all JSDoc tags (e.g., @param, @returns, @example) from the node
 * and returns them as a Map where keys are tag names and values are tag contents.
 *
 * @param node - TypeScript AST node to parse JSDoc tags from
 * @returns Map of tag name to tag value
 */
export function getJSDocTags(node: ts.Node): Map<string, string> {
  const tagsMap = new Map<string, string>();

  const jsDocTags = ts.getJSDocTags(node);
  if (!jsDocTags || jsDocTags.length === 0) {
    return tagsMap;
  }

  for (const tag of jsDocTags) {
    const tagName = tag.tagName.text;
    const tagText = tag.comment;

    if (tagText) {
      // Handle both string comments and JSDocText arrays
      const value =
        typeof tagText === 'string'
          ? tagText
          : extractTextFromJSDocComment(tagText as any);
      tagsMap.set(tagName, value);
    } else {
      tagsMap.set(tagName, '');
    }
  }

  return tagsMap;
}

/**
 * Parse and extract the @example tag content from a TypeScript node
 *
 * Preserves code formatting including indentation and line breaks.
 * Returns undefined if no @example tag is found.
 *
 * @param node - TypeScript AST node to extract example from
 * @returns Example code with formatting preserved, or undefined if not found
 */
export function parseExampleTag(node: ts.Node): string | undefined {
  const jsDocTags = ts.getJSDocTags(node);
  if (!jsDocTags || jsDocTags.length === 0) {
    return undefined;
  }

  const exampleTag = jsDocTags.find((tag) => tag.tagName.text === 'example');
  if (!exampleTag) {
    return undefined;
  }

  if (!exampleTag.comment) {
    return undefined;
  }

  const exampleText =
    typeof exampleTag.comment === 'string'
      ? exampleTag.comment
      : extractTextFromJSDocComment(exampleTag.comment as any);

  return sanitizeJSDocContent(exampleText);
}

/**
 * Parse and extract the description from a TypeScript node's JSDoc
 *
 * Returns the main description text (content before the first tag).
 * Returns empty string if no description is found.
 *
 * @param node - TypeScript AST node to extract description from
 * @returns Description text or empty string if not found
 */
export function parseDescriptionTag(node: ts.Node): string {
  const jsDocTags = ts.getJSDocTags(node);
  if (!jsDocTags || jsDocTags.length === 0) {
    return '';
  }

  // Look for the JSDoc comment with description
  const sourceFile = node.getSourceFile();
  if (!sourceFile) {
    return '';
  }

  const comments = ts.getLeadingCommentRanges(sourceFile.text, node.getStart());
  if (!comments || comments.length === 0) {
    return '';
  }

  const lastComment = comments[comments.length - 1];
  const commentText = sourceFile.text.substring(
    lastComment.pos,
    lastComment.end,
  );

  // Extract description (text between /** and first tag)
  const lines = commentText.split('\n');
  const descriptionLines: string[] = [];

  for (const line of lines) {
    // Skip the opening /**
    if (line.includes('/**')) {
      continue;
    }

    // Stop at the first tag
    if (line.trim().startsWith('@')) {
      break;
    }

    // Clean up comment formatting and add non-empty lines
    const cleanedLine = line
      .replace(/^\s*\*\s?/, '') // Remove leading * and spaces
      .replace(/\s*\*\/\s*$/, ''); // Remove closing */

    if (cleanedLine.trim()) {
      descriptionLines.push(cleanedLine.trim());
    }
  }

  return descriptionLines.join(' ').trim();
}

/**
 * Extract a specific tag value by tag name
 *
 * @param node - TypeScript AST node to extract tag from
 * @param tagName - Name of the tag to extract (e.g., 'param', 'returns')
 * @returns Tag value or undefined if not found
 */
export function getJSDocTagByName(
  node: ts.Node,
  tagName: string,
): string | undefined {
  const tags = getJSDocTags(node);
  return tags.get(tagName);
}

/**
 * Check if a node has JSDoc comments
 *
 * @param node - TypeScript AST node to check
 * @returns True if node has JSDoc comments, false otherwise
 */
export function hasJSDocComment(node: ts.Node): boolean {
  const jsDocTags = ts.getJSDocTags(node);
  return jsDocTags && jsDocTags.length > 0;
}

/**
 * Extract all @param tags from a node
 *
 * @param node - TypeScript AST node to extract params from
 * @returns Array of parameter descriptions
 */
export function extractParamTags(
  node: ts.Node,
): { name: string; description: string }[] {
  const jsDocTags = ts.getJSDocTags(node);
  if (!jsDocTags || jsDocTags.length === 0) {
    return [];
  }

  const paramTags = jsDocTags.filter((tag) => tag.tagName.text === 'param');
  const params: { name: string; description: string }[] = [];

  for (const tag of paramTags) {
    if (!tag.comment) {
      continue;
    }

    const commentText =
      typeof tag.comment === 'string'
        ? tag.comment
        : extractTextFromJSDocComment(tag.comment as any);

    // Parse "name - description" format
    const match = commentText.match(/^(\w+)\s*-\s*(.*)/);
    if (match) {
      params.push({
        name: match[1],
        description: match[2].trim(),
      });
    }
  }

  return params;
}

/**
 * Extract @returns tag from a node
 *
 * @param node - TypeScript AST node to extract returns from
 * @returns Returns description or empty string if not found
 */
export function extractReturnTag(node: ts.Node): string {
  const jsDocTags = ts.getJSDocTags(node);
  if (!jsDocTags || jsDocTags.length === 0) {
    return '';
  }

  const returnTag = jsDocTags.find(
    (tag) => tag.tagName.text === 'returns' || tag.tagName.text === 'return',
  );
  if (!returnTag || !returnTag.comment) {
    return '';
  }

  const commentText =
    typeof returnTag.comment === 'string'
      ? returnTag.comment
      : extractTextFromJSDocComment(returnTag.comment as any);

  return commentText.trim();
}

/**
 * Helper function to extract text from JSDocComment (which can be a string or array)
 *
 * @param comment - JSDoc comment content (string or array of JSDocText/JSDocComment)
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
        // For JSDocText or JSDocComment nodes, get the text property
        if (c.text) {
          return c.text;
        }
        // Fallback for JSDocLink and other JSDocComment variants
        return '';
      })
      .join('');
  }

  return '';
}

/**
 * Sanitize JSDoc content by removing comment markers and cleaning up formatting
 *
 * Removes leading * characters and extra whitespace while preserving code formatting
 * in examples.
 *
 * @param content - Raw JSDoc content
 * @returns Sanitized content
 */
function sanitizeJSDocContent(content: string): string {
  const lines = content.split('\n');
  const cleanedLines: string[] = [];

  for (const line of lines) {
    // Remove leading * and spaces (but preserve code indentation)
    let cleaned = line.replace(/^\s*\*\s?/, '');

    // Remove trailing */ if present
    cleaned = cleaned.replace(/\s*\*\/\s*$/, '');

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

  // If all content is indented (like code), preserve relative indentation
  const minIndent = Math.min(
    ...cleanedLines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.search(/\S/)),
  );

  if (minIndent > 0 && minIndent !== Infinity) {
    return cleanedLines
      .map((line) => line.slice(minIndent))
      .join('\n')
      .trim();
  }

  return cleanedLines.join('\n').trim();
}
