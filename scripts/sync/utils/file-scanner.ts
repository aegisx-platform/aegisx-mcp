import { promises as fs } from 'fs';
import { join, resolve, relative, isAbsolute } from 'path';

/**
 * Options for file scanning operations
 */
export interface ScanOptions {
  /** Whether to include hidden files (starting with .) */
  includeHidden?: boolean;
  /** Directories to skip during scan */
  skipDirs?: string[];
}

/**
 * Scans a directory recursively for files matching a pattern
 *
 * @param dirPath - The directory path to scan
 * @param pattern - RegExp pattern to match against file paths
 * @param options - Optional scan configuration
 * @returns Promise resolving to array of matching file paths (relative to dirPath)
 *
 * @example
 * ```typescript
 * const tsFiles = await scanDirectory('./src', /\.ts$/);
 * const components = await scanDirectory('./components', /\.component\.ts$/);
 * ```
 */
export async function scanDirectory(
  dirPath: string,
  pattern: RegExp,
  options: ScanOptions = {},
): Promise<string[]> {
  const { includeHidden = false, skipDirs = [] } = options;
  const normalizedPath = normalize(dirPath);

  // Validate that directory exists and is readable
  try {
    await fs.access(normalizedPath);
  } catch (error) {
    throw new Error(
      `Cannot access directory: ${dirPath} (${(error as Error).message})`,
    );
  }

  const results: string[] = [];
  const defaultSkipDirs = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.spec-workflow',
  ];
  const dirsToSkip = new Set([...defaultSkipDirs, ...skipDirs]);

  /**
   * Recursive helper function to traverse directory tree
   */
  async function traverse(currentPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);
        const relativePath = relative(normalizedPath, fullPath);

        // Skip hidden files/dirs if not included
        if (!includeHidden && entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory()) {
          // Skip specified directories
          if (!dirsToSkip.has(entry.name)) {
            // Recursively scan subdirectories
            await traverse(fullPath);
          }
        } else if (entry.isFile()) {
          // Test if file matches the pattern
          if (pattern.test(relativePath)) {
            results.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Log permission errors but continue with other files
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EACCES') {
        console.warn(`Warning: No read permission for ${currentPath}`);
      } else if (err.code !== 'ENOENT') {
        // Re-throw if not a "file not found" error
        throw error;
      }
    }
  }

  await traverse(normalizedPath);
  return results.sort();
}

/**
 * Reads the content of a file as a string
 *
 * @param filePath - The file path to read
 * @returns Promise resolving to the file content
 *
 * @example
 * ```typescript
 * const content = await readFileContent('./src/app.ts');
 * console.log(content);
 * ```
 */
export async function readFileContent(filePath: string): Promise<string> {
  const normalizedPath = normalize(filePath);

  try {
    const content = await fs.readFile(normalizedPath, 'utf-8');
    return content;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (err.code === 'EACCES') {
      throw new Error(`Permission denied reading file: ${filePath}`);
    } else if (err.code === 'EISDIR') {
      throw new Error(`Path is a directory, not a file: ${filePath}`);
    }
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Determines if a file path represents an Angular component file
 *
 * Checks if the file name matches the pattern *.component.ts
 *
 * @param filePath - The file path to check
 * @returns True if the file is an Angular component file, false otherwise
 *
 * @example
 * ```typescript
 * isComponentFile('button.component.ts'); // true
 * isComponentFile('src/button.component.ts'); // true
 * isComponentFile('button.service.ts'); // false
 * isComponentFile('button.ts'); // false
 * ```
 */
export function isComponentFile(filePath: string): boolean {
  // Extract just the filename from the path
  const filename = filePath.split(/[/\\]/).pop() || '';
  // Check if filename matches the component file pattern
  return /\.component\.ts$/.test(filename);
}

/**
 * Normalizes a file path to ensure it's absolute and uses forward slashes
 *
 * @param filePath - The path to normalize
 * @returns The normalized absolute path
 */
function normalize(filePath: string): string {
  const path = isAbsolute(filePath) ? filePath : resolve(filePath);
  return path;
}

/**
 * Checks if a directory exists
 *
 * @param dirPath - The directory path to check
 * @returns Promise resolving to true if directory exists, false otherwise
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(normalize(dirPath));
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Checks if a file exists
 *
 * @param filePath - The file path to check
 * @returns Promise resolving to true if file exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(normalize(filePath));
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Gets the size of a file in bytes
 *
 * @param filePath - The file path
 * @returns Promise resolving to file size in bytes, or null if file doesn't exist
 */
export async function getFileSize(filePath: string): Promise<number | null> {
  try {
    const stats = await fs.stat(normalize(filePath));
    return stats.size;
  } catch {
    return null;
  }
}

/**
 * Scans for JavaScript files (*.js)
 *
 * @param dirPath - The directory to scan
 * @returns Promise resolving to array of JS file paths
 */
export async function scanJavaScriptFiles(dirPath: string): Promise<string[]> {
  return scanDirectory(dirPath, /\.js$/);
}

/**
 * Scans for TypeScript files (*.ts)
 *
 * @param dirPath - The directory to scan
 * @returns Promise resolving to array of TS file paths
 */
export async function scanTypeScriptFiles(dirPath: string): Promise<string[]> {
  return scanDirectory(dirPath, /\.ts$/, { skipDirs: ['__tests__'] });
}

/**
 * Scans for Angular component files (*.component.ts)
 *
 * @param dirPath - The directory to scan
 * @returns Promise resolving to array of component file paths
 */
export async function scanComponentFiles(dirPath: string): Promise<string[]> {
  return scanDirectory(dirPath, /\.component\.ts$/);
}

/**
 * Scans for Markdown files (*.md)
 *
 * @param dirPath - The directory to scan
 * @returns Promise resolving to array of Markdown file paths
 */
export async function scanMarkdownFiles(dirPath: string): Promise<string[]> {
  return scanDirectory(dirPath, /\.md$/);
}
