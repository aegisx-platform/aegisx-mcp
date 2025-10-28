import { ActivityAction } from '../../core/user-profile/user-activity.schemas';

/**
 * Configuration options for activity logging on specific routes
 */
export interface ActivityLogConfig {
  /** Enable/disable activity logging for this route */
  enabled: boolean;
  
  /** Custom action name (overrides auto-detection) */
  action?: ActivityAction | string;
  
  /** Custom description template with placeholders like {method}, {url}, {status} */
  description?: string;
  
  /** Force specific severity level (otherwise auto-detected from response status) */
  severity?: 'info' | 'warning' | 'error' | 'critical';
  
  /** Skip logging successful GET requests (200-299 status) */
  skipSuccessfulGets?: boolean;
  
  /** Include request body/query in metadata (be careful with sensitive data) */
  includeRequestData?: boolean;
  
  /** Include response data in metadata (be careful with sensitive data) */
  includeResponseData?: boolean;
  
  /** Additional metadata to include in the log */
  metadata?: Record<string, any>;
  
  /** Custom condition function to determine if logging should occur */
  shouldLog?: (request: any, reply: any) => boolean;
  
  /** Async mode - don't wait for logging to complete before sending response */
  async?: boolean;
}

/**
 * Plugin-level configuration for activity logging
 */
export interface ActivityLogPluginConfig {
  /** Global enable/disable */
  enabled: boolean;
  
  /** Default configuration for routes that don't specify their own */
  defaultConfig: Partial<ActivityLogConfig>;
  
  /** Maximum request/response data size to include in metadata (in bytes) */
  maxDataSize?: number;
  
  /** Fields to exclude from request/response data logging */
  excludeFields?: string[];
  
  /** Enable batch logging for better performance */
  enableBatching?: boolean;
  
  /** Batch size for bulk activity log inserts */
  batchSize?: number;
  
  /** Batch flush interval in milliseconds */
  batchInterval?: number;
  
  /** Enable automatic error logging for failed requests */
  autoLogErrors?: boolean;
  
  /** Minimum severity level to log */
  minSeverity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Default plugin configuration
 */
export const defaultPluginConfig: ActivityLogPluginConfig = {
  enabled: true,
  defaultConfig: {
    enabled: false, // Routes must explicitly opt-in
    skipSuccessfulGets: true,
    includeRequestData: false,
    includeResponseData: false,
    async: true, // Non-blocking by default
  },
  maxDataSize: 10 * 1024, // 10KB
  excludeFields: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
  ],
  enableBatching: false, // Disable batching by default for simplicity
  batchSize: 10,
  batchInterval: 5000, // 5 seconds
  autoLogErrors: true,
  minSeverity: 'info',
};

/**
 * Default route configuration
 */
export const defaultRouteConfig: ActivityLogConfig = {
  enabled: false,
  skipSuccessfulGets: true,
  includeRequestData: false,
  includeResponseData: false,
  async: true,
};

/**
 * Predefined configurations for common route types
 */
export const presetConfigs = {
  // Authentication routes
  auth: {
    enabled: true,
    severity: 'info' as const,
    includeRequestData: false, // Never log passwords
    async: false, // Ensure auth events are logged synchronously
  },
  
  // Profile management routes
  profile: {
    enabled: true,
    severity: 'info' as const,
    includeRequestData: true,
    skipSuccessfulGets: false,
  },
  
  // Security-sensitive routes
  security: {
    enabled: true,
    severity: 'warning' as const,
    includeRequestData: true,
    includeResponseData: false,
    async: false, // Security events should be logged synchronously
  },
  
  // Administrative routes
  admin: {
    enabled: true,
    severity: 'warning' as const,
    includeRequestData: true,
    skipSuccessfulGets: false,
    async: false,
  },
  
  // API access logging (minimal)
  api: {
    enabled: true,
    severity: 'info' as const,
    skipSuccessfulGets: true,
    includeRequestData: false,
    includeResponseData: false,
  },
  
  // Error logging only
  errorOnly: {
    enabled: true,
    shouldLog: (_request: any, reply: any) => reply.statusCode >= 400,
  },
} as const;

/**
 * Activity action mapping based on HTTP method and route patterns
 */
export const actionMappings = {
  // Authentication patterns
  'POST /api/auth/login': 'login',
  'POST /api/auth/logout': 'logout',
  'POST /api/auth/register': 'register',
  'POST /api/auth/refresh': 'token_refresh',
  'POST /api/auth/forgot-password': 'password_reset_request',
  'POST /api/auth/reset-password': 'password_reset_complete',
  
  // Profile patterns
  'GET /api/profile': 'profile_view',
  'PUT /api/profile': 'profile_update',
  'PATCH /api/profile': 'profile_update',
  'POST /api/profile/avatar': 'avatar_upload',
  'DELETE /api/profile/avatar': 'avatar_delete',
  'PUT /api/profile/password': 'password_change',
  
  // Preferences patterns
  'GET /api/profile/preferences': 'preferences_view',
  'PUT /api/profile/preferences': 'preferences_update',
  'PATCH /api/profile/preferences': 'preferences_update',
  
  // General patterns (fallback)
  'GET': 'api_access',
  'POST': 'api_create',
  'PUT': 'api_update',
  'PATCH': 'api_partial_update',
  'DELETE': 'api_delete',
} as const;

/**
 * Get action name for a request based on method and URL pattern
 */
export function getActionForRequest(method: string, url: string): string {
  // Try exact match first
  const exactKey = `${method.toUpperCase()} ${url}` as keyof typeof actionMappings;
  if (actionMappings[exactKey]) {
    return actionMappings[exactKey];
  }
  
  // Try pattern matching for common endpoints
  const pathPattern = url.replace(/\/[0-9a-f-]{36}/g, '/:id'); // Replace UUIDs with :id
  const patternKey = `${method.toUpperCase()} ${pathPattern}` as keyof typeof actionMappings;
  if (actionMappings[patternKey]) {
    return actionMappings[patternKey];
  }
  
  // Fall back to method-based action
  const methodKey = method.toUpperCase() as keyof typeof actionMappings;
  return actionMappings[methodKey] || 'api_access';
}

/**
 * Get severity level based on HTTP status code
 */
export function getSeverityFromStatus(statusCode: number): 'info' | 'warning' | 'error' | 'critical' {
  if (statusCode >= 500) return 'critical';
  if (statusCode >= 400) return 'error';
  if (statusCode >= 300) return 'warning';
  return 'info';
}

/**
 * Generate description for activity log
 */
export function generateDescription(
  template: string | undefined,
  method: string,
  url: string,
  statusCode: number,
  userAgent?: string
): string {
  if (template) {
    return template
      .replace('{method}', method.toUpperCase())
      .replace('{url}', url)
      .replace('{status}', statusCode.toString())
      .replace('{userAgent}', userAgent || 'Unknown');
  }
  
  // Generate default description
  const action = getActionForRequest(method, url);
  const statusText = statusCode >= 400 ? 'failed' : 'completed';
  
  return `${action.replace(/_/g, ' ')} ${statusText}`;
}