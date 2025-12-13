/**
 * Import System Configuration
 *
 * Centralized configuration for the auto-discovery import system,
 * including file size limits, row limits, batch sizes, and session expiry.
 */

export const IMPORT_CONFIG = {
  // File size limit in bytes
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Maximum rows per import
  MAX_ROWS: 10000, // 10k rows per import

  // Batch size for processing
  MAX_BATCH_SIZE: 1000, // 1k rows per batch

  // Session expiry time in minutes
  SESSION_EXPIRY_MINUTES: 30,

  // Supported file formats
  SUPPORTED_FORMATS: ['csv', 'xlsx', 'xls'] as const,

  // Supported MIME types
  SUPPORTED_MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ] as const,
} as const;

export type ImportConfig = typeof IMPORT_CONFIG;
