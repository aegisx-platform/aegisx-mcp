/**
 * UUID Validation Utilities
 *
 * Provides comprehensive UUID validation for query parameters and data processing
 * to prevent PostgreSQL casting errors and improve user experience.
 */

/**
 * Standard UUID v4 regex pattern
 * Matches: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Where x is any hexadecimal digit and y is one of 8, 9, A, or B
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * More permissive UUID regex that accepts any version
 * Matches: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const UUID_GENERAL_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validation strategies for handling invalid UUIDs
 */
export enum UUIDValidationStrategy {
  STRICT = 'strict', // Throw error on invalid UUID
  GRACEFUL = 'graceful', // Ignore invalid UUID, continue processing
  WARN = 'warn', // Log warning but continue processing
}

/**
 * Configuration for UUID validation behavior
 */
export interface UUIDValidationConfig {
  strategy: UUIDValidationStrategy;
  allowAnyVersion: boolean; // If false, only allows UUID v4
  logInvalidAttempts: boolean;
}

/**
 * Default configuration - can be overridden by environment variables
 */
export const DEFAULT_UUID_CONFIG: UUIDValidationConfig = {
  strategy:
    (process.env.UUID_VALIDATION_STRATEGY as UUIDValidationStrategy) ||
    UUIDValidationStrategy.GRACEFUL,
  allowAnyVersion: process.env.UUID_ALLOW_ANY_VERSION === 'true' || true,
  logInvalidAttempts: process.env.UUID_LOG_INVALID === 'true' || true,
};

/**
 * Validates if a string is a valid UUID
 *
 * @param value - The string to validate
 * @param config - Validation configuration
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(
  value: string,
  config: UUIDValidationConfig = DEFAULT_UUID_CONFIG,
): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Remove any whitespace
  const trimmedValue = value.trim();

  // Check if empty after trimming
  if (!trimmedValue) {
    return false;
  }

  // Choose regex based on configuration
  const regex = config.allowAnyVersion ? UUID_GENERAL_REGEX : UUID_V4_REGEX;

  return regex.test(trimmedValue);
}

/**
 * Validates UUID and handles the result based on strategy
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field being validated (for error messages)
 * @param config - Validation configuration
 * @returns The validated UUID or null if invalid (depending on strategy)
 * @throws Error if strategy is STRICT and UUID is invalid
 */
export function validateUUID(
  value: any,
  fieldName: string = 'uuid',
  config: UUIDValidationConfig = DEFAULT_UUID_CONFIG,
): string | null {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return null;
  }

  // Convert to string if not already
  const stringValue = String(value);

  // Validate the UUID
  if (!isValidUUID(stringValue, config)) {
    if (config.logInvalidAttempts) {
      console.warn(
        `Invalid UUID provided for field "${fieldName}": "${stringValue}"`,
      );
    }

    switch (config.strategy) {
      case UUIDValidationStrategy.STRICT:
        throw new Error(
          `Invalid UUID format for field "${fieldName}": "${stringValue}". Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
        );

      case UUIDValidationStrategy.GRACEFUL:
      case UUIDValidationStrategy.WARN:
        return null; // Ignore invalid UUID
    }
  }

  return stringValue.trim();
}

/**
 * Validates multiple UUID values in an object
 * Useful for filtering query parameters that contain UUIDs
 *
 * @param filters - Object containing potential UUID fields
 * @param uuidFields - Array of field names that should be validated as UUIDs
 * @param config - Validation configuration
 * @returns Cleaned filters object with invalid UUIDs removed or errors thrown
 */
export function validateUUIDFields(
  filters: Record<string, any>,
  uuidFields: string[],
  config: UUIDValidationConfig = DEFAULT_UUID_CONFIG,
): Record<string, any> {
  const cleanedFilters = { ...filters };

  for (const fieldName of uuidFields) {
    if (fieldName in cleanedFilters) {
      try {
        const validatedUUID = validateUUID(
          cleanedFilters[fieldName],
          fieldName,
          config,
        );

        if (validatedUUID === null) {
          // Remove invalid UUID from filters
          delete cleanedFilters[fieldName];
        } else {
          // Keep the validated UUID
          cleanedFilters[fieldName] = validatedUUID;
        }
      } catch (error) {
        // Re-throw strict validation errors for strict mode
        if (config.strategy === UUIDValidationStrategy.STRICT) {
          throw error;
        }
        // For other modes, just remove the field silently
        delete cleanedFilters[fieldName];
      }
    }
  }

  return cleanedFilters;
}

/**
 * Auto-detects UUID fields in an object based on field names and values
 * Common UUID field patterns: *_id, id, *_uuid, uuid_*
 *
 * @param filters - Object to scan for UUID fields
 * @param config - Validation configuration
 * @returns Array of detected UUID field names
 */
export function detectUUIDFields(filters: Record<string, any>): string[] {
  const uuidFields: string[] = [];

  for (const [fieldName, value] of Object.entries(filters)) {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    const stringValue = String(value);

    // Skip numeric values - these are definitely NOT UUIDs
    // This handles integer IDs like budget_request_id, budget_id, drug_id, etc.
    if (/^\d+$/.test(stringValue)) {
      continue;
    }

    // Check field name patterns that typically contain UUIDs
    const isLikelyUUIDField =
      fieldName.endsWith('_id') ||
      fieldName === 'id' ||
      fieldName.includes('uuid') ||
      fieldName.endsWith('_uuid');

    // Check if value looks like a UUID (basic check)
    const looksLikeUUID =
      stringValue.length >= 32 && // Minimum length for UUID without dashes
      stringValue.includes('-') && // Contains dashes
      /^[0-9a-f-]+$/i.test(stringValue); // Only hex chars and dashes

    if (isLikelyUUIDField || looksLikeUUID) {
      uuidFields.push(fieldName);
    }
  }

  return uuidFields;
}

/**
 * Smart UUID validation for query filters
 * Auto-detects UUID fields and validates them
 *
 * @param filters - Query filters object
 * @param explicitUUIDFields - Explicitly declared UUID fields (optional)
 * @param config - Validation configuration
 * @returns Cleaned filters with validated UUIDs
 */
export function smartValidateUUIDs(
  filters: Record<string, any>,
  explicitUUIDFields: string[] = [],
  config: UUIDValidationConfig = DEFAULT_UUID_CONFIG,
): Record<string, any> {
  // Combine explicit fields with auto-detected ones
  const autoDetectedFields = detectUUIDFields(filters);
  const combinedFields = explicitUUIDFields.concat(autoDetectedFields);
  const allUUIDFields = Array.from(new Set(combinedFields));

  return validateUUIDFields(filters, allUUIDFields, config);
}

/**
 * Express/Fastify middleware helper for UUID validation
 * Can be used to validate request parameters
 *
 * @param uuidFields - Fields that should be validated as UUIDs
 * @param config - Validation configuration
 * @returns Validation result
 */
export function createUUIDValidator(
  uuidFields: string[],
  config: UUIDValidationConfig = DEFAULT_UUID_CONFIG,
) {
  return (params: Record<string, any>) => {
    try {
      return validateUUIDFields(params, uuidFields, config);
    } catch (error) {
      if (config.strategy === UUIDValidationStrategy.STRICT) {
        throw error;
      }
      return params;
    }
  };
}
