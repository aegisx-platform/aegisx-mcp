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
