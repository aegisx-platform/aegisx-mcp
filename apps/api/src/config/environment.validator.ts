/**
 * Environment Variables Validation
 *
 * Ensures all required environment variables are present and valid
 * before application startup to prevent runtime errors
 */

export interface EnvironmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RequiredEnvVar {
  key: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
}

/**
 * Define required environment variables for the application
 */
export const REQUIRED_ENV_VARS: RequiredEnvVar[] = [
  // Application
  {
    key: 'NODE_ENV',
    description: 'Application environment (development, staging, production)',
    required: false,
    defaultValue: 'development',
    validator: (value) =>
      ['development', 'staging', 'production', 'test'].includes(value),
  },
  {
    key: 'PORT',
    description: 'Server port number',
    required: false,
    defaultValue: '3333',
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    key: 'API_PREFIX',
    description: 'Global API prefix',
    required: false,
    defaultValue: '/api',
  },

  // Database
  {
    key: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    required: true,
    validator: (value) =>
      value.startsWith('postgresql://') || value.startsWith('postgres://'),
  },

  // Security
  {
    key: 'JWT_SECRET',
    description: 'JWT signing secret (minimum 32 characters)',
    required: true,
    validator: (value) => value.length >= 32,
  },
  {
    key: 'SESSION_SECRET',
    description: 'Session encryption secret (minimum 32 characters)',
    required: true,
    validator: (value) => value.length >= 32,
  },

  // Optional but recommended
  {
    key: 'REDIS_URL',
    description: 'Redis connection string for caching',
    required: false,
  },
  {
    key: 'CORS_ORIGIN',
    description: 'Allowed CORS origins',
    required: false,
  },
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvironmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.key];

    // Check if required variable exists
    if (envVar.required && !value) {
      errors.push(
        `Missing required environment variable: ${envVar.key} - ${envVar.description}`,
      );
      continue;
    }

    // Use default value if not set
    if (!value && envVar.defaultValue) {
      process.env[envVar.key] = envVar.defaultValue;
      warnings.push(
        `Using default value for ${envVar.key}: ${envVar.defaultValue}`,
      );
      continue;
    }

    // Validate value if validator exists
    if (value && envVar.validator && !envVar.validator(value)) {
      errors.push(
        `Invalid value for ${envVar.key}: ${value} - ${envVar.description}`,
      );
    }

    // Warning for optional but recommended variables
    if (!envVar.required && !value) {
      warnings.push(
        `Optional environment variable not set: ${envVar.key} - ${envVar.description}`,
      );
    }
  }

  // Additional production checks
  if (process.env.NODE_ENV === 'production') {
    const productionChecks = [
      {
        condition: process.env.JWT_SECRET === 'supersecret',
        message: 'JWT_SECRET should not use default value in production',
      },
      {
        condition: process.env.SESSION_SECRET === 'my-secret',
        message: 'SESSION_SECRET should not use default value in production',
      },
      {
        condition: !process.env.REDIS_URL,
        message: 'REDIS_URL is highly recommended for production environments',
      },
    ];

    productionChecks.forEach((check) => {
      if (check.condition) {
        warnings.push(`Production warning: ${check.message}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment and throw error if invalid
 */
export function validateEnvironmentOrThrow(): void {
  const validation = validateEnvironment();

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:');
    validation.warnings.forEach((warning) => console.warn(`   ${warning}`));
    console.warn('');
  }

  // Throw error if validation fails
  if (!validation.isValid) {
    console.error('❌ Environment Validation Failed:');
    validation.errors.forEach((error) => console.error(`   ${error}`));
    console.error('');
    throw new Error(
      'Environment validation failed. Please check your environment variables.',
    );
  }

  console.log('✅ Environment validation passed');
}

/**
 * Get environment info for logging
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    port: process.env.PORT || '3333',
    apiPrefix: process.env.API_PREFIX || '/api',
    hasRedis: !!process.env.REDIS_URL,
    hasCustomJwtSecret: process.env.JWT_SECRET !== 'supersecret',
    timestamp: new Date().toISOString(),
  };
}
