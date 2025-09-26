import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcrypt';

/**
 * API Key Crypto Utilities
 *
 * Provides secure API key generation, validation, and management utilities
 * following enterprise security best practices.
 */

export interface ApiKeyComponents {
  /** Full API key (ak_xxx_yyy) - Only shown once during creation */
  fullKey: string;
  /** Key prefix for identification (ak_xxx) */
  prefix: string;
  /** Secure hash for database storage */
  hash: string;
  /** Last 4 characters for display purposes */
  preview: string;
}

export interface ApiKeyValidationResult {
  /** Whether the key is valid */
  isValid: boolean;
  /** Key prefix if valid */
  prefix?: string;
  /** Error message if invalid */
  error?: string;
}

/**
 * Generate a secure API key with proper formatting
 */
export function generateApiKey(): ApiKeyComponents {
  // Generate random components
  const prefixBytes = randomBytes(8).toString('hex').substring(0, 8);
  const secretBytes = randomBytes(32).toString('hex');

  // Format: ak_{prefix}_{secret}
  const prefix = `ak_${prefixBytes}`;
  const fullKey = `${prefix}_${secretBytes}`;

  // Create secure hash for storage
  const hash = createSecureHash(fullKey);

  // Generate preview (last 4 characters with masking)
  const preview = `***...${secretBytes.slice(-4)}`;

  return {
    fullKey,
    prefix,
    hash,
    preview,
  };
}

/**
 * Create a secure hash of the API key for database storage
 */
export function createSecureHash(apiKey: string): string {
  // Use bcrypt for secure hashing with salt rounds
  const saltRounds = 12;
  return bcrypt.hashSync(apiKey, saltRounds);
}

/**
 * Validate an API key against its stored hash
 */
export function validateApiKey(apiKey: string, storedHash: string): boolean {
  try {
    return bcrypt.compareSync(apiKey, storedHash);
  } catch (error) {
    console.error('[ApiKeyCrypto] Validation error:', error);
    return false;
  }
}

/**
 * Validate API key format and extract components
 */
export function validateApiKeyFormat(apiKey: string): ApiKeyValidationResult {
  // Expected format: ak_{8chars}_{64chars}
  const apiKeyRegex = /^ak_[a-f0-9]{8}_[a-f0-9]{64}$/;

  if (!apiKey || typeof apiKey !== 'string') {
    return {
      isValid: false,
      error: 'API key must be a non-empty string',
    };
  }

  if (!apiKeyRegex.test(apiKey)) {
    return {
      isValid: false,
      error: 'Invalid API key format. Expected: ak_{prefix}_{secret}',
    };
  }

  // Extract prefix
  const parts = apiKey.split('_');
  const prefix = `${parts[0]}_${parts[1]}`;

  return {
    isValid: true,
    prefix,
  };
}

/**
 * Generate API key preview for display
 */
export function generatePreview(fullKey: string): string {
  const parts = fullKey.split('_');
  if (parts.length !== 3) {
    return '***...****';
  }

  const secret = parts[2];
  return `***...${secret.slice(-4)}`;
}

/**
 * Secure comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  try {
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');
    return timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

/**
 * Generate scoped API key with specific permissions
 */
export interface ApiKeyScope {
  /** Resource type (e.g., 'users', 'files', 'settings') */
  resource: string;
  /** Allowed actions (e.g., ['read'], ['read', 'write'], ['*']) */
  actions: string[];
  /** Optional conditions or filters */
  conditions?: Record<string, any>;
}

export function generateScopedApiKey(
  scopes: ApiKeyScope[],
): ApiKeyComponents & {
  scopes: ApiKeyScope[];
} {
  const keyComponents = generateApiKey();

  return {
    ...keyComponents,
    scopes,
  };
}

/**
 * Validate if API key has required scope for action
 */
export function validateScope(
  keyScopes: ApiKeyScope[] | Record<string, any>,
  requiredResource: string,
  requiredAction: string,
): boolean {
  // Handle legacy format or null scopes
  if (!keyScopes || typeof keyScopes !== 'object') {
    return false;
  }

  // Convert legacy format to new format if needed
  let scopesArray: ApiKeyScope[];
  if (Array.isArray(keyScopes)) {
    scopesArray = keyScopes;
  } else {
    // Legacy: convert Record<string, any> to ApiKeyScope[]
    scopesArray = Object.entries(keyScopes).map(([resource, actions]) => ({
      resource,
      actions: Array.isArray(actions) ? actions : [String(actions)],
    }));
  }

  for (const scope of scopesArray) {
    if (scope.resource === requiredResource || scope.resource === '*') {
      // Check if action is allowed
      if (
        scope.actions.includes('*') ||
        scope.actions.includes(requiredAction)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Generate a revocation token for key rotation
 */
export function generateRevocationToken(): string {
  return `rev_${randomBytes(16).toString('hex')}`;
}

/**
 * Create audit hash for key operations
 */
export function createAuditHash(
  operation: string,
  keyPrefix: string,
  userId: string,
): string {
  const data = `${operation}:${keyPrefix}:${userId}:${Date.now()}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Constants for key management
 */
export const API_KEY_CONSTANTS = {
  PREFIX_LENGTH: 8,
  SECRET_LENGTH: 64,
  HASH_SALT_ROUNDS: 12,
  MAX_KEYS_PER_USER: 50,
  DEFAULT_EXPIRY_DAYS: 365,
  PREVIEW_SUFFIX_LENGTH: 4,
  REVOCATION_TOKEN_LENGTH: 32,
} as const;

/**
 * Utility to check if key is expired
 */
export function isKeyExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Calculate key expiration date
 */
export function calculateExpiration(
  days: number = API_KEY_CONSTANTS.DEFAULT_EXPIRY_DAYS,
): Date {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + days);
  return expiration;
}
