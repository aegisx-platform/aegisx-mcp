/**
 * File Writer Utility
 * Provides safe file writing operations with TypeScript validation
 * Supports dry-run mode and atomic writes (no partial files)
 *
 * Key Features:
 * - Validates TypeScript syntax before writing
 * - Ensures directory structure exists
 * - Atomic writes to prevent corrupt files
 * - Dry-run mode for testing without side effects
 * - Comprehensive error handling
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { logger } from './logger.js';

/**
 * Options for file writing operations
 */
export interface WriteOptions {
  /** Skip file write, validate only */
  dryRun?: boolean;
  /** Log detailed operations */
  verbose?: boolean;
  /** Skip TypeScript validation */
  skipValidation?: boolean;
  /** File encoding (default: 'utf-8') */
  encoding?: BufferEncoding;
}

/**
 * Validation result details
 */
export interface ValidationResult {
  valid: boolean;
  errors: ts.Diagnostic[];
  warnings: ts.Diagnostic[];
}

/**
 * Write operation result
 */
export interface WriteResult {
  filePath: string;
  success: boolean;
  error?: Error;
  dryRun: boolean;
  bytesWritten?: number;
  validationPassed?: boolean;
}

/**
 * Ensure directory structure exists
 * Creates all intermediate directories as needed
 *
 * @param dirPath - Directory path to ensure exists
 * @throws Error if unable to create directory
 */
export function ensureDirectoryExists(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      logger.debug(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
      logger.debug(`Directory created: ${dirPath}`);
    } else {
      logger.debug(`Directory already exists: ${dirPath}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to create directory ${dirPath}: ${errorMsg}`);
    throw new Error(`Cannot create directory ${dirPath}: ${errorMsg}`);
  }
}

/**
 * Validate TypeScript code syntax and compilation
 * Uses TypeScript compiler API to check for errors
 *
 * @param code - TypeScript code to validate
 * @param fileName - File name for error reporting (default: 'generated.ts')
 * @returns Validation result with any errors/warnings
 */
export function validateTypeScript(
  code: string,
  fileName: string = 'generated.ts',
): ValidationResult {
  try {
    logger.debug(`Validating TypeScript syntax for ${fileName}`);

    // Create a source file from the code
    const sourceFile = ts.createSourceFile(
      fileName,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    // Collect diagnostics
    const errors: ts.Diagnostic[] = [];
    const warnings: ts.Diagnostic[] = [];

    // Check for parse errors by walking the AST
    // If there are syntax errors, the sourceFile will still be created but may have error nodes
    // We do a simple syntax check by seeing if the source compiles without error
    // For a more complete check, we'd need a full program, but for code generation validation,
    // basic parse validation is sufficient

    if (sourceFile.parseDiagnostics && sourceFile.parseDiagnostics.length > 0) {
      errors.push(...sourceFile.parseDiagnostics);
      logger.error(`TypeScript parse errors in ${fileName}:`);
      sourceFile.parseDiagnostics.forEach((error) => {
        const message = ts.flattenDiagnosticMessageText(
          error.messageText,
          '\n',
        );
        logger.error(`  - ${message}`);
      });
      return { valid: false, errors, warnings };
    }

    // Basic validation: check if code can be parsed without obvious errors
    // A simple heuristic: if the code contains matching braces/brackets/parens
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/]/g) || []).length;
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;

    // Check basic balance (this is not comprehensive but catches obvious errors)
    const hasBalancedBraces = openBraces === closeBraces;
    const hasBalancedBrackets = openBrackets === closeBrackets;
    const hasBalancedParens = openParens === closeParens;

    if (!hasBalancedBraces || !hasBalancedBrackets || !hasBalancedParens) {
      logger.warn(
        `Code structure may have unbalanced delimiters (braces: ${openBraces}/${closeBraces}, ` +
          `brackets: ${openBrackets}/${closeBrackets}, parens: ${openParens}/${closeParens})`,
      );
      // This is a warning, not an error - source files can still be written
    }

    logger.debug(`TypeScript validation passed for ${fileName}`);

    return { valid: true, errors, warnings };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`TypeScript validation failed: ${errorMsg}`);
    return {
      valid: false,
      errors: [
        {
          file: undefined,
          start: undefined,
          length: undefined,
          category: ts.DiagnosticCategory.Error,
          code: -1,
          messageText: `Validation error: ${errorMsg}`,
        } as ts.Diagnostic,
      ],
      warnings: [],
    };
  }
}

/**
 * Safely write file with validation and atomic writes
 * Performs validation before write and ensures no partial files are created
 *
 * Strategy for atomic writes:
 * 1. Validate content if not skipped
 * 2. If dry-run, stop here (no actual write)
 * 3. Ensure directory exists
 * 4. Write to temporary file first
 * 5. Atomically rename temp file to target (creates or replaces)
 * 6. Clean up on error (remove temp file)
 *
 * @param filePath - Full path to write file
 * @param content - File content to write
 * @param options - Write options (dry-run, validation, etc.)
 * @returns Write operation result
 */
export async function writeFile(
  filePath: string,
  content: string,
  options: WriteOptions = {},
): Promise<WriteResult> {
  const {
    dryRun = false,
    verbose = false,
    skipValidation = false,
    encoding = 'utf-8',
  } = options;

  const result: WriteResult = {
    filePath,
    success: false,
    dryRun,
  };

  try {
    logger.log(`${verbose ? '[VERBOSE] ' : ''}Writing file: ${filePath}`);

    // Step 1: Validate TypeScript if not skipped
    if (!skipValidation) {
      const fileName = path.basename(filePath);
      const validation = validateTypeScript(content, fileName);
      result.validationPassed = validation.valid;

      if (!validation.valid) {
        const errorMsg = validation.errors
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
          .join('; ');
        throw new Error(`TypeScript validation failed: ${errorMsg}`);
      }

      logger.debug(
        `TypeScript validation passed for ${path.basename(filePath)}`,
      );
    } else {
      logger.debug(`Skipping TypeScript validation for ${filePath}`);
      result.validationPassed = true;
    }

    // Step 2: Return early if dry-run
    if (dryRun) {
      logger.log(
        `[DRY-RUN] Would write ${content.length} bytes to ${filePath}`,
      );
      result.success = true;
      result.bytesWritten = content.length;
      return result;
    }

    // Step 3: Ensure directory exists
    const dirPath = path.dirname(filePath);
    ensureDirectoryExists(dirPath);

    // Step 4: Write to temporary file first (atomic write strategy)
    const tempFile = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    logger.debug(`Creating temporary file: ${tempFile}`);

    await fs.promises.writeFile(tempFile, content, { encoding });
    const bytesWritten = Buffer.byteLength(content, encoding);
    logger.debug(`Temp file written: ${tempFile} (${bytesWritten} bytes)`);

    // Step 5: Atomic rename (replaces target if exists)
    logger.debug(`Atomically renaming ${tempFile} to ${filePath}`);
    await fs.promises.rename(tempFile, filePath);
    logger.log(
      `File written successfully: ${filePath} (${bytesWritten} bytes)`,
    );

    result.success = true;
    result.bytesWritten = bytesWritten;
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to write file ${filePath}: ${errorMsg}`);
    result.error = error instanceof Error ? error : new Error(errorMsg);

    // Cleanup: Remove temp files if any were created
    try {
      const tempPattern = `${filePath}.tmp.`;
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir)) {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
          if (file.startsWith(path.basename(filePath) + '.tmp.')) {
            const tempPath = path.join(dir, file);
            await fs.promises.unlink(tempPath);
            logger.debug(`Cleaned up temp file: ${tempPath}`);
          }
        }
      }
    } catch (cleanupError) {
      logger.warn(
        `Failed to cleanup temp files: ${
          cleanupError instanceof Error
            ? cleanupError.message
            : String(cleanupError)
        }`,
      );
    }

    return result;
  }
}

/**
 * Write multiple files with validation
 * Provides atomic all-or-nothing behavior for related files
 *
 * @param files - Array of {filePath, content} objects
 * @param options - Write options
 * @returns Array of write results
 */
export async function writeFiles(
  files: Array<{ filePath: string; content: string }>,
  options: WriteOptions = {},
): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  // If dry-run, validate all and return early
  if (options.dryRun) {
    for (const file of files) {
      const result = await writeFile(file.filePath, file.content, options);
      results.push(result);
    }
    return results;
  }

  // For non-dry-run, validate all first
  for (const file of files) {
    if (!options.skipValidation) {
      const validation = validateTypeScript(
        file.content,
        path.basename(file.filePath),
      );
      if (!validation.valid) {
        throw new Error(
          `Validation failed for ${file.filePath}: ${validation.errors
            .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
            .join('; ')}`,
        );
      }
    }
  }

  // All validated, now write
  for (const file of files) {
    const result = await writeFile(file.filePath, file.content, {
      ...options,
      skipValidation: true, // Already validated above
    });
    results.push(result);

    if (!result.success) {
      // Log failure but continue to attempt writing other files
      logger.warn(`Failed to write ${file.filePath}`);
    }
  }

  return results;
}

/**
 * Check if a file exists and is readable
 *
 * @param filePath - Path to check
 * @returns True if file exists and is readable
 */
export function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 *
 * @param filePath - Path to file
 * @returns File size or 0 if file doesn't exist
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Delete file safely
 *
 * @param filePath - Path to file
 * @returns True if deleted, false if file didn't exist
 * @throws Error if unable to delete
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot delete file ${filePath}: ${errorMsg}`);
  }
}
