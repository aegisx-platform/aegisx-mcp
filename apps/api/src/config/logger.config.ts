/**
 * Logger Configuration
 *
 * Pino logger configuration for structured, analyzable logging
 * - Development: Pretty console output
 * - Production: JSON structured output
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Pino logger configuration
 */
export const loggerConfig: pino.LoggerOptions = {
  // Log level
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Base fields attached to every log
  base: {
    service: 'aegisx-api',
    env: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Development: Pretty console output
  // Production: JSON structured output
  transport:
    isDevelopment && !isTest
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            colorize: true,
            singleLine: false,
            messageFormat: '{if phase}[{phase}]{end} {msg}',
            customColors: 'info:cyan,warn:yellow,error:red',
          },
        }
      : undefined,

  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },

  // Redact sensitive data
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      'apiKey',
      'smtp_password',
    ],
    remove: true,
  },
};

/**
 * Create Pino logger instance
 */
export function createPinoLogger(
  options?: Partial<pino.LoggerOptions>,
): pino.Logger {
  return pino({
    ...loggerConfig,
    ...options,
  });
}
