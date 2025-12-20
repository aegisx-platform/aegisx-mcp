/**
 * API Contract Parser Types and Interfaces
 * Provides data structures for parsing and managing API contract documentation
 *
 * This module defines TypeScript interfaces for:
 * - Individual API endpoints with method, path, schemas, examples
 * - Complete API contracts (collection of endpoints per feature)
 * - Error responses with status codes
 * - Validation reports comparing docs vs implementation
 */

/**
 * Represents a single API endpoint within a contract
 */
export interface ApiEndpoint {
  /** HTTP method (GET, POST, PUT, PATCH, DELETE) */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

  /** API path (e.g., "/api/profile" or "/api/budget/:id") */
  path: string;

  /** Brief description of what this endpoint does */
  description: string;

  /** Feature name this endpoint belongs to (e.g., "user-profile", "rbac") */
  feature: string;

  /** Whether authentication is required for this endpoint */
  authentication: boolean;

  /** TypeScript interface or JSON schema for request body (optional) */
  requestSchema?: string;

  /** TypeScript interface or JSON schema for response body (optional) */
  responseSchema?: string;

  /** Example request (bash, curl, or JSON format) (optional) */
  requestExample?: string;

  /** Example response (JSON format) (optional) */
  responseExample?: string;

  /** Array of possible error responses */
  errorResponses?: ErrorResponse[];

  /** Description of path parameters if any */
  pathParameters?: PathParameter[];

  /** Description of query parameters if any */
  queryParameters?: QueryParameter[];
}

/**
 * Represents an error response that can be returned by an endpoint
 */
export interface ErrorResponse {
  /** HTTP status code (401, 403, 404, 500, etc.) */
  statusCode: number;

  /** Human-readable description of the error */
  description: string;

  /** Example error response in JSON format (optional) */
  example?: string;
}

/**
 * Describes a path parameter in an endpoint path
 */
export interface PathParameter {
  /** Parameter name (e.g., "id", "featureId") */
  name: string;

  /** Parameter type (string, number, uuid, etc.) */
  type: string;

  /** Description of what this parameter represents */
  description: string;

  /** Whether this parameter is required */
  required: boolean;
}

/**
 * Describes a query parameter accepted by an endpoint
 */
export interface QueryParameter {
  /** Parameter name (e.g., "limit", "offset", "sort") */
  name: string;

  /** Parameter type (string, number, boolean, etc.) */
  type: string;

  /** Description of what this parameter does */
  description: string;

  /** Whether this parameter is required */
  required: boolean;

  /** Default value if not provided (optional) */
  default?: string;
}

/**
 * Represents a complete API contract for a feature
 * Contains all endpoints and metadata for a specific feature's API
 */
export interface ApiContract {
  /** Feature name (derived from directory name) */
  feature: string;

  /** Base URL prefix for all endpoints in this contract (e.g., "/api/profile") */
  baseUrl: string;

  /** Description of authentication requirements */
  authentication: string;

  /** Expected Content-Type header (application/json, etc.) */
  contentType: string;

  /** All API endpoints in this contract */
  endpoints: ApiEndpoint[];

  /** File path to the source contract file */
  filePath: string;

  /** Timestamp when this contract was last parsed */
  parsedAt?: Date;
}

/**
 * Represents the result of validating documented contracts against actual implementations
 */
export interface ValidationReport {
  /** Feature name being validated */
  feature: string;

  /** Number of endpoints that have matching implementations */
  matched: number;

  /** Endpoints documented but missing implementations */
  missing: MissingEndpoint[];

  /** Endpoints implemented but not documented */
  undocumented: UndocumentedEndpoint[];

  /** Endpoints with method mismatches between docs and code */
  methodMismatches: MethodMismatch[];

  /** Timestamp when validation was performed */
  validatedAt?: Date;
}

/**
 * Represents an endpoint that is documented but not implemented
 */
export interface MissingEndpoint {
  /** HTTP method specified in documentation */
  method: string;

  /** API path specified in documentation */
  path: string;

  /** Expected location where this endpoint should be implemented */
  expectedFile: string;
}

/**
 * Represents an endpoint that is implemented but not documented
 */
export interface UndocumentedEndpoint {
  /** HTTP method found in code */
  method: string;

  /** API path found in code */
  path: string;

  /** File path where this endpoint is implemented */
  foundIn: string;
}

/**
 * Represents a mismatch between documented and implemented endpoint methods
 */
export interface MethodMismatch {
  /** API path */
  path: string;

  /** HTTP method specified in documentation */
  documentedMethod: string;

  /** HTTP method found in actual implementation */
  implementedMethod: string;

  /** File path where the implementation is located */
  file: string;
}

/**
 * Represents a collection of API contracts, typically all contracts in the system
 */
export interface ApiContractCollection {
  /** Array of all API contracts */
  contracts: ApiContract[];

  /** Total count of endpoints across all contracts */
  totalEndpoints: number;

  /** List of unique features found */
  features: string[];

  /** Timestamp when this collection was assembled */
  collectedAt?: Date;
}

/**
 * Represents the result of a search operation across API endpoints
 */
export interface SearchResult {
  /** Array of matching endpoints */
  endpoints: Array<ApiEndpoint & { matchScore: number }>;

  /** Number of results found */
  count: number;

  /** Search query that was executed */
  query: string;

  /** Optional feature filter that was applied */
  feature?: string;
}

/**
 * Represents a cache entry for parsed contracts
 */
export interface CacheEntry<T> {
  /** The cached data */
  data: T;

  /** Timestamp when this data was cached */
  cachedAt: Date;

  /** Time-to-live in milliseconds */
  ttl: number;
}

/**
 * Options for parsing API contracts
 */
export interface ParseOptions {
  /** Whether to extract examples from code blocks */
  includeExamples?: boolean;

  /** Whether to extract error responses */
  includeErrors?: boolean;

  /** Whether to extract parameter descriptions */
  includeParameters?: boolean;

  /** Custom path resolver for relative paths */
  basePath?: string;
}

/**
 * Options for searching endpoints
 */
export interface SearchOptions {
  /** Feature to filter by (optional) */
  feature?: string;

  /** HTTP method to filter by (optional) */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

  /** Whether search should be case-sensitive */
  caseSensitive?: boolean;

  /** Maximum number of results to return */
  limit?: number;

  /** Whether to apply relevance ranking */
  ranked?: boolean;
}

/**
 * Options for validation operations
 */
export interface ValidationOptions {
  /** Feature to validate (optional - if not provided, validates all) */
  feature?: string;

  /** Root path of the codebase to search for implementations */
  codebaseRoot: string;

  /** File patterns to search for route implementations */
  routePatterns?: string[];

  /** Whether to check for method mismatches */
  checkMethodMismatches?: boolean;
}

/**
 * Represents a parsing error that occurred while processing a contract file
 */
export interface ParsingError {
  /** File path that had the error */
  filePath: string;

  /** Error message */
  message: string;

  /** Line number where error occurred (optional) */
  lineNumber?: number;

  /** Severity level (warn, error) */
  severity: 'warn' | 'error';
}

/**
 * Represents the result of parsing a single contract file
 */
export interface ParseResult {
  /** Successfully parsed contract (if parsing succeeded) */
  contract?: ApiContract;

  /** Array of errors encountered during parsing */
  errors: ParsingError[];

  /** Whether parsing completed successfully */
  success: boolean;

  /** Number of endpoints extracted */
  endpointCount: number;
}

// Type exports for convenience
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type ValidationSeverity = 'warn' | 'error';

/**
 * Generic cache manager interface
 */
export interface CacheManager<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  clear(): void;
  has(key: string): boolean;
  size(): number;
}

// ============================================================================
// File Discovery and Reading Functions
// ============================================================================

import { promises as fs } from 'fs';
import { resolve, join, relative } from 'path';

/**
 * In-memory cache for contract file contents and discoveries
 * Stores parsed contents and file lists with TTL for cache invalidation
 */
class ContractFileCache {
  private fileContentCache = new Map<
    string,
    { content: string; timestamp: number }
  >();
  private discoveryCache: { files: string[]; timestamp: number } | null = null;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get cached file content if it exists and hasn't expired
   */
  getFileContent(
    filePath: string,
    ttl: number = this.DEFAULT_TTL,
  ): string | null {
    const cached = this.fileContentCache.get(filePath);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > ttl) {
      this.fileContentCache.delete(filePath);
      return null;
    }

    return cached.content;
  }

  /**
   * Cache file content with timestamp
   */
  setFileContent(filePath: string, content: string): void {
    this.fileContentCache.set(filePath, {
      content,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached discovery results if they haven't expired
   */
  getDiscovery(ttl: number = this.DEFAULT_TTL): string[] | null {
    if (!this.discoveryCache) return null;

    const age = Date.now() - this.discoveryCache.timestamp;
    if (age > ttl) {
      this.discoveryCache = null;
      return null;
    }

    return this.discoveryCache.files;
  }

  /**
   * Cache discovery results with timestamp
   */
  setDiscovery(files: string[]): void {
    this.discoveryCache = {
      files,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.fileContentCache.clear();
    this.discoveryCache = null;
  }

  /**
   * Invalidate specific file from cache
   */
  invalidateFile(filePath: string): void {
    this.fileContentCache.delete(filePath);
    // Invalidate discovery cache when a file changes
    this.discoveryCache = null;
  }

  /**
   * Get current cache size info
   */
  getSize(): { files: number; discoveryCount: number } {
    return {
      files: this.fileContentCache.size,
      discoveryCount: this.discoveryCache ? 1 : 0,
    };
  }
}

/**
 * Singleton instance of the file cache
 */
const contractFileCache = new ContractFileCache();

/**
 * Recursively discover all api-contracts.md files under a given directory
 * @param docsPath - Root path to search (typically docs/features)
 * @param useCache - Whether to use cached results (default: true)
 * @returns Array of absolute file paths to api-contracts.md files
 */
export async function discoverContractFiles(
  docsPath: string,
  useCache: boolean = true,
): Promise<string[]> {
  const absolutePath = resolve(docsPath);

  // Check cache first
  if (useCache) {
    const cached = contractFileCache.getDiscovery();
    if (cached) {
      return cached;
    }
  }

  const contractFiles: string[] = [];

  /**
   * Recursively walk directory tree
   */
  async function walkDir(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await walkDir(fullPath);
          }
        } else if (
          entry.name === 'api-contracts.md' ||
          entry.name === 'API_CONTRACTS.md'
        ) {
          contractFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Gracefully handle directory read errors (e.g., permission denied)
      console.warn(`Warning: Failed to read directory ${dir}:`, error);
    }
  }

  try {
    await walkDir(absolutePath);
    // Cache the results
    contractFileCache.setDiscovery(contractFiles);
  } catch (error) {
    console.error(
      `Error discovering contract files in ${absolutePath}:`,
      error,
    );
    // Return empty array instead of throwing
    return [];
  }

  return contractFiles;
}

/**
 * Read contract file content asynchronously
 * Uses cache to avoid re-reading the same file
 * @param filePath - Path to the contract file
 * @param useCache - Whether to use cached results (default: true)
 * @returns File content as string, or null if file cannot be read
 */
export async function readContractFile(
  filePath: string,
  useCache: boolean = true,
): Promise<string | null> {
  const absolutePath = resolve(filePath);

  // Check cache first
  if (useCache) {
    const cached = contractFileCache.getFileContent(absolutePath);
    if (cached !== null) {
      return cached;
    }
  }

  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    // Cache the content
    contractFileCache.setFileContent(absolutePath, content);
    return content;
  } catch (error) {
    // Gracefully handle file read errors
    console.warn(
      `Warning: Failed to read contract file ${absolutePath}:`,
      error,
    );
    return null;
  }
}

/**
 * Read multiple contract files in parallel
 * @param filePaths - Array of file paths to read
 * @param useCache - Whether to use cached results (default: true)
 * @returns Object mapping file paths to their contents
 */
export async function readContractFiles(
  filePaths: string[],
  useCache: boolean = true,
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  // Read files in parallel using Promise.all
  const readPromises = filePaths.map(async (filePath) => {
    const content = await readContractFile(filePath, useCache);
    results[resolve(filePath)] = content;
  });

  await Promise.all(readPromises);
  return results;
}

/**
 * Clear the contract file cache
 * Useful for forcing a refresh of all cached data
 */
export function clearContractCache(): void {
  contractFileCache.clear();
}

/**
 * Invalidate cache for a specific file
 * Call this after a contract file has been updated
 * @param filePath - Path to the file to invalidate
 */
export function invalidateContractFileCache(filePath: string): void {
  contractFileCache.invalidateFile(resolve(filePath));
}

/**
 * Get information about current cache state
 * Useful for debugging and monitoring cache effectiveness
 * @returns Cache statistics
 */
export function getCacheStats(): {
  cachedFiles: number;
  hasDiscoveryCache: boolean;
  cacheSize: { files: number; discoveryCount: number };
} {
  const size = contractFileCache.getSize();
  return {
    cachedFiles: size.files,
    hasDiscoveryCache: size.discoveryCount > 0,
    cacheSize: size,
  };
}

// ============================================================================
// Markdown Parsing Functions
// ============================================================================

/**
 * Extract feature name from file path
 * @param filePath - Path to contract file (e.g., docs/features/user-profile/api-contracts.md)
 * @returns Feature name (e.g., "user-profile")
 */
function extractFeatureFromPath(filePath: string): string {
  const parts = filePath.split('/');
  const featuresIndex = parts.indexOf('features');
  if (featuresIndex !== -1 && featuresIndex < parts.length - 1) {
    return parts[featuresIndex + 1];
  }
  return 'unknown';
}

/**
 * Extract metadata from API Overview section
 * @param content - Full markdown content
 * @returns Metadata object with base URL, authentication, and content type
 */
function extractMetadata(content: string): {
  baseUrl: string;
  authentication: string;
  contentType: string;
} {
  const metadata = {
    baseUrl: '',
    authentication: '',
    contentType: 'application/json',
  };

  // Extract base URL
  const baseUrlMatch = content.match(/\*\*Base URL\*\*:\s*`([^`]+)`/i);
  if (baseUrlMatch) {
    metadata.baseUrl = baseUrlMatch[1].trim();
  }

  // Extract authentication
  const authMatch = content.match(/\*\*Authentication\*\*:\s*([^\n]+)/i);
  if (authMatch) {
    metadata.authentication = authMatch[1].trim();
  }

  // Extract content type
  const contentTypeMatch = content.match(/\*\*Content Type\*\*:\s*`([^`]+)`/i);
  if (contentTypeMatch) {
    metadata.contentType = contentTypeMatch[1].trim();
  }

  return metadata;
}

/**
 * Extract HTTP method from endpoint header
 * Handles various formats:
 * - "### 1. Get User Profile" followed by "**GET** `/api/profile`"
 * - "**GET** `/api/profile`"
 * - "GET /api/profile"
 * - "```http\nGET /api/profile\n```"
 * @param section - Markdown section containing endpoint definition
 * @returns Object with method and path
 */
function extractMethodAndPath(section: string): {
  method: HttpMethod | null;
  path: string | null;
} {
  // Try pattern: **METHOD** `/path`
  const boldMethodMatch = section.match(/\*\*([A-Z]+)\*\*\s+`([^`]+)`/);
  if (boldMethodMatch) {
    return {
      method: boldMethodMatch[1] as HttpMethod,
      path: boldMethodMatch[2].trim(),
    };
  }

  // Try pattern: ```http\nMETHOD /path\n```
  const httpBlockMatch = section.match(/```http\s*\n([A-Z]+)\s+([^\s\n]+)/);
  if (httpBlockMatch) {
    return {
      method: httpBlockMatch[1] as HttpMethod,
      path: httpBlockMatch[2].trim(),
    };
  }

  // Try pattern: METHOD /path (plain text)
  const plainMatch = section.match(/^([A-Z]+)\s+([^\s\n]+)/m);
  if (plainMatch) {
    return {
      method: plainMatch[1] as HttpMethod,
      path: plainMatch[2].trim(),
    };
  }

  return { method: null, path: null };
}

/**
 * Extract code block content by language
 * @param section - Markdown section
 * @param language - Code block language (typescript, json, bash, etc.)
 * @returns Code block content or undefined
 */
function extractCodeBlock(
  section: string,
  language: string,
): string | undefined {
  // Match code blocks with specific language
  const regex = new RegExp(
    `\`\`\`${language}\\s*\\n([\\s\\S]*?)\\n\`\`\``,
    'i',
  );
  const match = section.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract all code blocks of a specific language
 * @param section - Markdown section
 * @param language - Code block language
 * @returns Array of code block contents
 */
function extractAllCodeBlocks(section: string, language: string): string[] {
  const blocks: string[] = [];
  const regex = new RegExp(
    `\`\`\`${language}\\s*\\n([\\s\\S]*?)\\n\`\`\``,
    'gi',
  );
  let match;

  while ((match = regex.exec(section)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

/**
 * Extract error responses from Error Responses section
 * @param section - Markdown section containing error responses
 * @returns Array of error response objects
 */
function extractErrorResponses(section: string): ErrorResponse[] {
  const errors: ErrorResponse[] = [];

  // Pattern: **401 Unauthorized** - Description
  const errorHeaderRegex = /\*\*(\d{3})\s+([^*]+)\*\*\s*-?\s*([^\n]+)/g;
  let match;

  while ((match = errorHeaderRegex.exec(section)) !== null) {
    const statusCode = parseInt(match[1]);
    const description = match[3].trim();

    // Try to find associated JSON example after this error header
    const remainingSection = section.substring(match.index);
    const jsonExample = extractCodeBlock(
      remainingSection.split(/\*\*\d{3}/)[0],
      'json',
    );

    errors.push({
      statusCode,
      description,
      example: jsonExample,
    });
  }

  return errors;
}

/**
 * Extract query or path parameters from markdown section
 * @param section - Markdown section
 * @param paramType - 'query' or 'path'
 * @returns Array of parameter objects
 */
function extractParameters(
  section: string,
  paramType: 'query' | 'path',
): QueryParameter[] | PathParameter[] {
  const parameters: any[] = [];

  // Look for parameter list section
  const headerPattern =
    paramType === 'query'
      ? /#### Query Parameters\s*\n([\s\S]*?)(?=\n####|\n###|$)/
      : /#### Path Parameters\s*\n([\s\S]*?)(?=\n####|\n###|$)/;

  const paramSection = section.match(headerPattern);
  if (!paramSection) return parameters;

  // Extract individual parameters
  // Pattern: - `paramName` (type, required/optional): Description (default: value)
  const paramRegex =
    /-\s+`([^`]+)`\s*\(([^,)]+)(?:,\s*([^)]+))?\):\s*([^\n]+)/g;
  let match;

  while ((match = paramRegex.exec(paramSection[1])) !== null) {
    const name = match[1].trim();
    const type = match[2].trim();
    const optionalInfo = match[3]?.trim() || '';
    const description = match[4].trim();

    const required = !optionalInfo.toLowerCase().includes('optional');

    // Extract default value if present
    const defaultMatch = description.match(
      /default:\s*['"']?([^'"',\n)]+)['"']?/i,
    );
    const defaultValue = defaultMatch ? defaultMatch[1].trim() : undefined;

    parameters.push({
      name,
      type,
      description: description.replace(/\(default:.*?\)/i, '').trim(),
      required,
      ...(defaultValue && { default: defaultValue }),
    });
  }

  return parameters;
}

/**
 * Determine if authentication is required for an endpoint
 * @param section - Markdown section
 * @returns True if authentication is required
 */
function extractAuthentication(section: string): boolean {
  const authMatch = section.match(/\*\*Authentication:\*\*\s*([^\n]+)/i);
  if (authMatch) {
    const authText = authMatch[1].toLowerCase();
    return authText.includes('required') || authText.includes('yes');
  }
  return true; // Default to required if not specified
}

/**
 * Extract description from endpoint header
 * @param section - Markdown section
 * @returns Description text or empty string
 */
function extractDescription(section: string): string {
  // Try to extract from header like: ### 1. Get User Profile
  const headerMatch = section.match(/###\s*\d+\.\s*([^\n]+)/);
  if (headerMatch) {
    return headerMatch[1].trim();
  }
  return '';
}

/**
 * Split markdown content into endpoint sections
 * @param content - Full markdown content
 * @returns Array of endpoint section strings
 */
function splitIntoEndpointSections(content: string): string[] {
  const sections: string[] = [];

  // Split by h3 headers (### )
  const parts = content.split(/(?=###\s+\d+\.)/);

  for (const part of parts) {
    // Skip if it doesn't look like an endpoint section
    if (
      part.includes('###') &&
      (part.includes('GET') ||
        part.includes('POST') ||
        part.includes('PUT') ||
        part.includes('PATCH') ||
        part.includes('DELETE'))
    ) {
      sections.push(part);
    }
  }

  return sections;
}

/**
 * Parse a single endpoint section
 * @param section - Markdown section for one endpoint
 * @param feature - Feature name
 * @returns ApiEndpoint object or null if parsing fails
 */
function parseEndpointSection(
  section: string,
  feature: string,
): ApiEndpoint | null {
  const { method, path } = extractMethodAndPath(section);

  if (!method || !path) {
    console.warn(
      `Warning: Could not extract method/path from section in feature ${feature}`,
    );
    return null;
  }

  const description = extractDescription(section);
  const authentication = extractAuthentication(section);

  // Extract schemas
  const requestSchema =
    extractCodeBlock(section, 'typescript') ||
    extractCodeBlock(section.split('#### Response')[0], 'typescript');
  const responseSchema = extractCodeBlock(
    section.split('#### Response Schema')[1] || section,
    'typescript',
  );

  // Extract examples
  const bashExamples = extractAllCodeBlocks(section, 'bash');
  const requestExample =
    bashExamples.length > 0
      ? bashExamples[0]
      : extractCodeBlock(section, 'curl');

  const jsonExamples = extractAllCodeBlocks(section, 'json');
  const responseExample = jsonExamples.length > 0 ? jsonExamples[0] : undefined;

  // Extract parameters
  const queryParameters = extractParameters(
    section,
    'query',
  ) as QueryParameter[];
  const pathParameters = extractParameters(section, 'path') as PathParameter[];

  // Extract error responses
  let errorResponses: ErrorResponse[] = [];
  const errorSection = section.split(/#### Error Responses?/i)[1];
  if (errorSection) {
    errorResponses = extractErrorResponses(errorSection);
  }

  return {
    method,
    path,
    description,
    feature,
    authentication,
    requestSchema,
    responseSchema,
    requestExample,
    responseExample,
    errorResponses: errorResponses.length > 0 ? errorResponses : undefined,
    queryParameters: queryParameters.length > 0 ? queryParameters : undefined,
    pathParameters: pathParameters.length > 0 ? pathParameters : undefined,
  };
}

/**
 * Parse a complete API contract markdown file
 * @param filePath - Path to the contract file
 * @param content - Markdown content
 * @param options - Parsing options
 * @returns ParseResult with contract or errors
 */
export async function parseContractFile(
  filePath: string,
  content?: string,
  options: ParseOptions = {},
): Promise<ParseResult> {
  const errors: ParsingError[] = [];

  try {
    // Read content if not provided
    const markdown = content || (await readContractFile(filePath));
    if (!markdown) {
      return {
        success: false,
        errors: [
          {
            filePath,
            message: 'Failed to read contract file',
            severity: 'error',
          },
        ],
        endpointCount: 0,
      };
    }

    // Extract feature name from path
    const feature = extractFeatureFromPath(filePath);

    // Extract metadata
    const metadata = extractMetadata(markdown);

    // Split into endpoint sections
    const endpointSections = splitIntoEndpointSections(markdown);

    if (endpointSections.length === 0) {
      errors.push({
        filePath,
        message: 'No endpoint sections found in contract file',
        severity: 'warn',
      });
    }

    // Parse each endpoint
    const endpoints: ApiEndpoint[] = [];
    for (const section of endpointSections) {
      try {
        const endpoint = parseEndpointSection(section, feature);
        if (endpoint) {
          endpoints.push(endpoint);
        } else {
          errors.push({
            filePath,
            message: 'Failed to parse endpoint section',
            severity: 'warn',
          });
        }
      } catch (error) {
        errors.push({
          filePath,
          message: `Error parsing endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warn',
        });
      }
    }

    // Build contract object
    const contract: ApiContract = {
      feature,
      baseUrl: metadata.baseUrl,
      authentication: metadata.authentication,
      contentType: metadata.contentType,
      endpoints,
      filePath,
      parsedAt: new Date(),
    };

    return {
      contract,
      errors,
      success: true,
      endpointCount: endpoints.length,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          filePath,
          message: `Critical parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
        },
      ],
      endpointCount: 0,
    };
  }
}

/**
 * Parse all contract files in a directory
 * @param docsPath - Path to docs/features directory
 * @param options - Parsing options
 * @returns Array of parse results
 */
export async function parseAllContracts(
  docsPath: string,
  options: ParseOptions = {},
): Promise<ParseResult[]> {
  const contractFiles = await discoverContractFiles(docsPath);
  const results: ParseResult[] = [];

  for (const filePath of contractFiles) {
    const result = await parseContractFile(filePath, undefined, options);
    results.push(result);
  }

  return results;
}

/**
 * Get all successfully parsed contracts
 * @param docsPath - Path to docs/features directory
 * @param options - Parsing options
 * @returns Array of API contracts
 */
export async function getAllContracts(
  docsPath: string,
  options: ParseOptions = {},
): Promise<ApiContract[]> {
  const results = await parseAllContracts(docsPath, options);
  return results.filter((r) => r.success && r.contract).map((r) => r.contract!);
}

// ============================================================================
// Search and Filter Utilities
// ============================================================================

/**
 * Represents a scored search result for an endpoint
 */
interface ScoredEndpoint extends ApiEndpoint {
  matchScore: number;
}

/**
 * Rank a single endpoint based on search query match relevance
 * Returns a score from 0 to 100, where 100 is exact match
 * @param endpoint - Endpoint to score
 * @param query - Search query (lowercase)
 * @returns Match score (0-100)
 */
function rankEndpointMatch(endpoint: ApiEndpoint, query: string): number {
  const lowerPath = endpoint.path.toLowerCase();
  const lowerDescription = endpoint.description.toLowerCase();
  const lowerFeature = endpoint.feature.toLowerCase();
  const lowerMethod = endpoint.method.toLowerCase();

  let score = 0;

  // Exact path match = highest score
  if (lowerPath === query) {
    return 100;
  }

  // Path starts with query = high score
  if (lowerPath.startsWith(query)) {
    score = Math.max(score, 90);
  }

  // Path contains query = high score
  if (lowerPath.includes(query)) {
    score = Math.max(score, 80);
  }

  // Exact method match = medium-high score
  if (lowerMethod === query) {
    score = Math.max(score, 75);
  }

  // Feature name match = medium score
  if (lowerFeature === query) {
    score = Math.max(score, 70);
  }

  // Feature name starts with query = medium score
  if (lowerFeature.startsWith(query)) {
    score = Math.max(score, 65);
  }

  // Feature name contains query = medium score
  if (lowerFeature.includes(query)) {
    score = Math.max(score, 60);
  }

  // Description contains query = lower score
  if (lowerDescription.includes(query)) {
    score = Math.max(score, 40);
  }

  return score;
}

/**
 * Search endpoints by keyword across path, method, description, and feature name
 * Search is case-insensitive and supports partial matching
 * Results are ranked by relevance (highest scores first)
 *
 * @param contracts - Array of API contracts to search
 * @param query - Search query string
 * @param options - Optional search options
 * @returns Array of matching endpoints sorted by relevance, empty if no matches
 */
export function searchEndpoints(
  contracts: ApiContract[],
  query: string,
  options: SearchOptions = {},
): ScoredEndpoint[] {
  // Normalize query
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  // Collect all endpoints with scores
  const scoredEndpoints: ScoredEndpoint[] = [];

  for (const contract of contracts) {
    // Check if feature filter is applied
    if (
      options.feature &&
      contract.feature.toLowerCase() !== options.feature.toLowerCase()
    ) {
      continue;
    }

    for (const endpoint of contract.endpoints) {
      // Check if method filter is applied
      if (options.method && endpoint.method !== options.method) {
        continue;
      }

      // Calculate relevance score for this endpoint
      const matchScore = rankEndpointMatch(endpoint, normalizedQuery);

      // Only include endpoints with non-zero match score
      if (matchScore > 0) {
        scoredEndpoints.push({
          ...endpoint,
          matchScore,
        });
      }
    }
  }

  // Sort by relevance (highest score first)
  scoredEndpoints.sort((a, b) => b.matchScore - a.matchScore);

  // Apply result limit if specified
  if (options.limit && options.limit > 0) {
    return scoredEndpoints.slice(0, options.limit);
  }

  return scoredEndpoints;
}

/**
 * Filter endpoints by feature name
 * Search is case-insensitive
 *
 * @param contracts - Array of API contracts to filter
 * @param feature - Feature name to filter by
 * @returns Array of endpoints from the specified feature, empty if not found
 */
export function filterByFeature(
  contracts: ApiContract[],
  feature: string,
): ApiEndpoint[] {
  const normalizedFeature = feature.trim().toLowerCase();

  if (!normalizedFeature) {
    return [];
  }

  const endpoints: ApiEndpoint[] = [];

  for (const contract of contracts) {
    if (contract.feature.toLowerCase() === normalizedFeature) {
      endpoints.push(...contract.endpoints);
    }
  }

  return endpoints;
}

/**
 * Find a specific endpoint by path and optional HTTP method
 * If method is not provided, returns the first endpoint matching the path
 * Search is case-insensitive for path comparison
 *
 * @param contracts - Array of API contracts to search
 * @param path - API path to find (e.g., "/api/profile")
 * @param method - Optional HTTP method to match
 * @returns Matching ApiEndpoint or null if not found
 */
export function findEndpoint(
  contracts: ApiContract[],
  path: string,
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
): ApiEndpoint | null {
  const normalizedPath = path.trim().toLowerCase();

  if (!normalizedPath) {
    return null;
  }

  for (const contract of contracts) {
    for (const endpoint of contract.endpoints) {
      // Compare paths case-insensitively
      if (endpoint.path.toLowerCase() === normalizedPath) {
        // If method is specified, must match exactly
        if (method && endpoint.method !== method) {
          continue;
        }
        // Found matching endpoint
        return endpoint;
      }
    }
  }

  // No matching endpoint found
  return null;
}

// ============================================================================
// Validation Logic - Compare Documentation vs Implementation
// ============================================================================

import { execSync } from 'child_process';

/**
 * Represents a route found in the codebase
 */
interface ImplementedRoute {
  method: HttpMethod;
  path: string;
  file: string;
  line: number;
}

/**
 * Parse a route declaration line to extract method and path
 * Handles patterns like:
 * - fastify.get('/api/profile', ...)
 * - typedFastify.post('/rbac/roles', ...)
 * - fastify.put('/', ...) // relative paths
 *
 * @param line - Source code line containing route declaration
 * @param file - File path for context
 * @returns Parsed route info or null if not a valid route
 */
function parseRouteDeclaration(
  line: string,
  file: string,
): Omit<ImplementedRoute, 'line'> | null {
  // Pattern: fastify.METHOD('PATH', ...)
  // Matches: fastify.get, typedFastify.post, etc.
  const routePattern =
    /(?:fastify|typedFastify)\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/i;
  const match = line.match(routePattern);

  if (!match) {
    return null;
  }

  const method = match[1].toUpperCase() as HttpMethod;
  const path = match[2].trim();

  // Handle relative paths - need to determine base path from file
  // For now, just track them as-is
  // Future enhancement: resolve relative paths based on route registration context

  return {
    method,
    path,
    file,
  };
}

/**
 * Find all implemented routes in the codebase
 * Searches through route files and extracts route registrations
 *
 * @param codebaseRoot - Root directory of the codebase
 * @param feature - Optional feature name to filter routes
 * @returns Array of implemented routes
 */
async function findImplementedRoutes(
  codebaseRoot: string,
  feature?: string,
): Promise<ImplementedRoute[]> {
  const routes: ImplementedRoute[] = [];

  try {
    // Search for route files in the API directory
    // Updated path to match actual structure: apps/api/src/layers/
    const searchPath = join(codebaseRoot, 'apps/api/src/layers');

    // Find all .routes.ts files
    let routeFiles: string[] = [];

    try {
      const findResult = execSync(
        `find "${searchPath}" -type f -name "*.routes.ts" 2>/dev/null || true`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
      );

      routeFiles = findResult.split('\n').filter((f) => f.trim().length > 0);
    } catch (error) {
      console.warn(
        `Warning: Failed to find route files in ${searchPath}:`,
        error,
      );
      return routes;
    }

    // If feature filter is specified, filter files by feature name
    if (feature) {
      routeFiles = routeFiles.filter((f) => f.includes(`/${feature}/`));
    }

    // Read and parse each route file
    for (const routeFile of routeFiles) {
      try {
        const content = await fs.readFile(routeFile, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const parsed = parseRouteDeclaration(line, routeFile);

          if (parsed) {
            routes.push({
              ...parsed,
              line: i + 1,
            });
          }
        }
      } catch (error) {
        console.warn(`Warning: Failed to read route file ${routeFile}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Error finding implemented routes:', error);
  }

  return routes;
}

/**
 * Normalize API path for comparison
 * Handles variations like /api/profile vs /profile
 *
 * @param path - API path to normalize
 * @returns Normalized path
 */
function normalizePath(path: string): string {
  // Remove trailing slashes
  let normalized = path.replace(/\/+$/, '');

  // Ensure leading slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  return normalized;
}

/**
 * Check if two paths match, considering parameter variations
 * Handles cases like:
 * - /api/users/:id matches /api/users/:userId
 * - /api/users/:id matches /api/users/:user_id
 *
 * @param docPath - Path from documentation
 * @param implPath - Path from implementation
 * @returns True if paths match
 */
function pathsMatch(docPath: string, implPath: string): boolean {
  const normalizedDoc = normalizePath(docPath);
  const normalizedImpl = normalizePath(implPath);

  // Exact match
  if (normalizedDoc === normalizedImpl) {
    return true;
  }

  // Parameter matching - replace :param with a regex pattern
  const docPattern = normalizedDoc
    .replace(/:[^/]+/g, '[^/]+')
    .replace(/\//g, '\\/');

  const implPattern = normalizedImpl
    .replace(/:[^/]+/g, '[^/]+')
    .replace(/\//g, '\\/');

  // Check if patterns match
  const docRegex = new RegExp(`^${docPattern}$`);
  const implRegex = new RegExp(`^${implPattern}$`);

  return docRegex.test(normalizedImpl) || implRegex.test(normalizedDoc);
}

/**
 * Validate API implementation against documentation
 * Compares documented contracts with actual route implementations
 *
 * @param contracts - Array of API contracts from documentation
 * @param feature - Feature name to validate (optional - validates all if not specified)
 * @param codebaseRoot - Root directory of the codebase
 * @returns Validation report with matched, missing, undocumented, and mismatched endpoints
 */
export async function validateFeature(
  contracts: ApiContract[],
  feature: string | undefined,
  codebaseRoot: string,
): Promise<ValidationReport> {
  // Filter contracts by feature if specified
  const contractsToValidate = feature
    ? contracts.filter((c) => c.feature === feature)
    : contracts;

  // Collect all documented endpoints
  const documentedEndpoints: ApiEndpoint[] = [];
  for (const contract of contractsToValidate) {
    documentedEndpoints.push(...contract.endpoints);
  }

  // Find all implemented routes
  const implementedRoutes = await findImplementedRoutes(codebaseRoot, feature);

  // Track validation results
  const missing: MissingEndpoint[] = [];
  const undocumented: UndocumentedEndpoint[] = [];
  const methodMismatches: MethodMismatch[] = [];
  let matched = 0;

  // Check each documented endpoint
  for (const docEndpoint of documentedEndpoints) {
    const matchingImpl = implementedRoutes.find((impl) =>
      pathsMatch(docEndpoint.path, impl.path),
    );

    if (!matchingImpl) {
      // Documented but not implemented
      missing.push({
        method: docEndpoint.method,
        path: docEndpoint.path,
        expectedFile: `apps/api/src/layers/*/${docEndpoint.feature}/*.routes.ts`,
      });
    } else if (matchingImpl.method !== docEndpoint.method) {
      // Implemented but with wrong method
      methodMismatches.push({
        path: docEndpoint.path,
        documentedMethod: docEndpoint.method,
        implementedMethod: matchingImpl.method,
        file: relative(codebaseRoot, matchingImpl.file),
      });
    } else {
      // Correctly implemented
      matched++;
    }
  }

  // Check for undocumented implementations
  for (const implRoute of implementedRoutes) {
    const matchingDoc = documentedEndpoints.find(
      (doc) =>
        pathsMatch(doc.path, implRoute.path) && doc.method === implRoute.method,
    );

    if (!matchingDoc) {
      // Check if path matches but method differs (already counted in methodMismatches)
      const pathOnlyMatch = documentedEndpoints.find((doc) =>
        pathsMatch(doc.path, implRoute.path),
      );

      if (!pathOnlyMatch) {
        // Truly undocumented
        undocumented.push({
          method: implRoute.method,
          path: implRoute.path,
          foundIn: relative(codebaseRoot, implRoute.file),
        });
      }
    }
  }

  return {
    feature: feature || 'all',
    matched,
    missing,
    undocumented,
    methodMismatches,
    validatedAt: new Date(),
  };
}

/**
 * Validate all features in the codebase
 * Runs validation for each feature separately and returns individual reports
 *
 * @param contracts - Array of API contracts
 * @param codebaseRoot - Root directory of the codebase
 * @returns Array of validation reports, one per feature
 */
export async function validateAllFeatures(
  contracts: ApiContract[],
  codebaseRoot: string,
): Promise<ValidationReport[]> {
  const features = getUniqueFeatures(contracts);
  const reports: ValidationReport[] = [];

  for (const feature of features) {
    const report = await validateFeature(contracts, feature, codebaseRoot);
    reports.push(report);
  }

  return reports;
}

/**
 * Get all unique features from contracts
 * @param contracts - Array of API contracts
 * @returns Array of unique feature names
 */
function getUniqueFeatures(contracts: ApiContract[]): string[] {
  const features = new Set<string>();
  for (const contract of contracts) {
    features.add(contract.feature);
  }
  return Array.from(features).sort();
}
