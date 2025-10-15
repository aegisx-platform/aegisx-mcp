import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Pattern-based URL exclusions (Industry Standard)
 * URLs matching these patterns will NOT get /api prefix
 */
const SKIP_API_PREFIX_PATTERNS = [
  // Static assets
  /^\/assets\//,
  /^\/static\//,
  /^\/public\//,

  // Health & monitoring
  /^\/health$/,
  /^\/ping$/,
  /^\/metrics$/,
  /^\/status$/,

  // External integrations
  /^\/webhooks\//,
  /^\/auth\/callback\//,
  /^\/oauth\//,
  /^\/sso\//,

  // File operations
  /^\/downloads?\//,
  /^\/uploads?\//,
  /^\/files\/download\//,
  /^\/media\//,

  // API documentation
  /^\/docs\//,
  /^\/swagger\//,
  /^\/api-docs\//,
] as const;

/**
 * Base URL Interceptor (Industry Standard Pattern-based)
 *
 * Automatically prepends /api prefix to relative URLs except for excluded patterns.
 * This centralizes API URL management and removes the need for services
 * to include /api prefix manually.
 *
 * Behavior:
 * - Absolute URLs (http/https): Passed through unchanged
 * - Excluded patterns: Passed through unchanged
 * - Other relative URLs: Get /api prefix added
 * - Development: /api/users → proxy → http://localhost:3333/api/users
 * - Production: /api/users → same domain /api/users
 */
export const baseUrlInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  // Skip absolute URLs (external APIs)
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  // Skip URLs matching exclusion patterns
  if (shouldSkipApiPrefix(req.url)) {
    return next(req);
  }

  // Add /api prefix for internal API calls
  const apiReq = req.clone({
    url: `/api${req.url}`,
  });

  // Debug logging in development (optional)
  if (!environment.production) {
    // Uncomment for debugging:
    // console.log(`[BaseUrlInterceptor] ${req.method} ${req.url} → ${apiReq.url}`);
  }

  return next(apiReq);
};

/**
 * Check if URL should skip /api prefix based on patterns
 */
function shouldSkipApiPrefix(url: string): boolean {
  return SKIP_API_PREFIX_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Add new skip patterns dynamically (for special cases)
 * Note: This modifies the patterns array at runtime
 */
export function addSkipPattern(pattern: RegExp): void {
  // Create a new array to avoid readonly issues
  const patterns = [...SKIP_API_PREFIX_PATTERNS, pattern];
  // Replace the original patterns (for this implementation, we'll keep it simple)
  console.warn(
    'addSkipPattern: Consider using createBaseUrlInterceptor for custom patterns',
  );
}

/**
 * Get current skip patterns (for debugging/testing)
 */
export function getSkipPatterns(): readonly RegExp[] {
  return SKIP_API_PREFIX_PATTERNS;
}

/**
 * Configuration for BaseUrlInterceptor
 * Extended with pattern-based exclusions
 */
export interface BaseUrlConfig {
  skipPatterns?: RegExp[];
  debugMode?: boolean;
  apiPrefix?: string; // Default: '/api'
}

/**
 * Helper function to create config-based interceptor
 * For advanced use cases
 */
export function createBaseUrlInterceptor(
  config: BaseUrlConfig,
): HttpInterceptorFn {
  const apiPrefix = config.apiPrefix || '/api';
  const combinedPatterns = [
    ...SKIP_API_PREFIX_PATTERNS,
    ...(config.skipPatterns || []),
  ];

  return (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
  ): Observable<HttpEvent<unknown>> => {
    // Skip absolute URLs
    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
      return next(req);
    }

    // Skip URLs matching patterns
    if (combinedPatterns.some((pattern) => pattern.test(req.url))) {
      return next(req);
    }

    // Add API prefix
    const apiReq = req.clone({
      url: `${apiPrefix}${req.url}`,
    });

    // Debug logging
    if (config.debugMode && !environment.production) {
      console.log(
        `[BaseUrlInterceptor] ${req.method} ${req.url} → ${apiReq.url}`,
      );
    }

    return next(apiReq);
  };
}
