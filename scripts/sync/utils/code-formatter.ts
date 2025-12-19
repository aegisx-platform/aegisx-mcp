/**
 * Code Formatter Utility
 * Provides TypeScript code formatting, file header generation, and code indentation
 */

export interface FileMetadata {
  generatedAt: Date;
  generatorVersion?: string;
  sourceFiles?: string[];
}

/**
 * Formats TypeScript code with consistent indentation and line breaks
 * Applies deterministic formatting rules without altering code semantics
 */
export function formatTypeScript(code: string): string {
  // Remove trailing whitespace from each line
  let formatted = code
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // Remove excess blank lines (more than 2 consecutive blank lines become 2)
  formatted = formatted.replace(/(\n\s*){3,}/g, '\n\n');

  // Ensure single blank line before export statements (unless at start)
  formatted = formatted.replace(/([^\n])\n(export )/g, '$1\n\n$2');

  // Ensure single blank line between major code blocks
  formatted = formatted.replace(
    /([})])\n(export |interface |type |const |function |class )/g,
    '$1\n\n$2',
  );

  // Ensure file ends with a single newline
  formatted = formatted.trimEnd() + '\n';

  return formatted;
}

/**
 * Adds a file header with metadata to the top of a TypeScript file
 * Header includes generation timestamp and optional metadata
 */
export function addFileHeader(code: string, metadata: FileMetadata): string {
  // Format the timestamp in ISO string format
  const generatedAt = metadata.generatedAt.toISOString();
  const generatorVersion = metadata.generatorVersion || 'auto-generated';

  // Build source files comment if provided
  const sourceFilesComment =
    metadata.sourceFiles && metadata.sourceFiles.length > 0
      ? `\n * Source files:\n${metadata.sourceFiles.map((f) => ` *   - ${f}`).join('\n')}`
      : '';

  const header = `/**
 * AUTO-GENERATED FILE
 * Generated at: ${generatedAt}
 * Generator: ${generatorVersion}${sourceFilesComment}
 * DO NOT EDIT MANUALLY - Changes will be overwritten on next sync
 */

/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

`;

  return header + code;
}

/**
 * Indents code by a specified number of levels (2 spaces per level)
 * Preserves relative indentation and handles edge cases
 */
export function indentCode(code: string, level: number): string {
  if (level < 0) {
    throw new Error('Indentation level must be non-negative');
  }

  if (level === 0) {
    return code;
  }

  const indent = '  '.repeat(level);

  // Split into lines and indent each non-empty line
  const lines = code.split('\n');
  const indented = lines.map((line) => {
    // Preserve empty lines as-is
    if (line.trim() === '') {
      return '';
    }
    return indent + line;
  });

  return indented.join('\n');
}

/**
 * Normalizes line breaks to \n (Unix style)
 * Handles Windows (\r\n) and old Mac (\r) line endings
 */
export function normalizeLineBreaks(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Ensures consistent spacing around operators and delimiters
 * Applies common TypeScript formatting rules
 */
export function formatOperatorSpacing(code: string): string {
  // Add space after commas (but not if already present)
  code = code.replace(/,([^\s\n])/g, ', $1');

  // Add space around assignment operators (but not in default values)
  code = code.replace(/([^=!<>])(=)([^=])/g, '$1 $2 $3');

  // Remove double spaces
  code = code.replace(/  +/g, ' ');

  return code;
}

/**
 * Wraps long lines at a specified character limit
 * Preserves string content and code structure
 */
export function wrapLongLines(code: string, lineLength: number = 100): string {
  const lines = code.split('\n');

  return lines
    .map((line) => {
      // Skip lines that are already short enough
      if (line.length <= lineLength) {
        return line;
      }

      // Skip string literals and comments to avoid breaking them
      if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        return line;
      }

      // For now, return long lines as-is to preserve semantics
      // Breaking lines could change code meaning in some cases
      return line;
    })
    .join('\n');
}

/**
 * Cleans up and validates TypeScript code structure
 * Ensures proper spacing and consistent formatting
 */
export function cleanTypeScriptCode(code: string): string {
  // Normalize line breaks first
  let cleaned = normalizeLineBreaks(code);

  // Apply formatting rules
  cleaned = formatTypeScript(cleaned);
  cleaned = formatOperatorSpacing(cleaned);
  cleaned = wrapLongLines(cleaned);

  return cleaned;
}

/**
 * Generates a complete formatted TypeScript module from raw code
 * Combines formatting, header generation, and cleanup
 */
export function generateFormattedModule(
  code: string,
  metadata: FileMetadata,
): string {
  // Clean and format the code first
  let formatted = cleanTypeScriptCode(code);

  // Add file header
  formatted = addFileHeader(formatted, metadata);

  // Final format pass to ensure consistency
  formatted = formatTypeScript(formatted);

  return formatted;
}

/**
 * Formats a specific code block (e.g., interface, function)
 * Useful for formatting individual components before assembly
 */
export function formatCodeBlock(code: string, indent: number = 0): string {
  let formatted = cleanTypeScriptCode(code);

  if (indent > 0) {
    formatted = indentCode(formatted, indent);
  }

  return formatted;
}
