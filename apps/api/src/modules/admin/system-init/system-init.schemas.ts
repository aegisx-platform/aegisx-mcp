/**
 * System Initialization API Schemas
 * TypeBox schemas for request/response validation
 * Supports auto-discovery import system endpoints
 */

import { Type } from '@sinclair/typebox';
import { TSchema } from '@sinclair/typebox';

// --- REQUEST SCHEMAS ---

/**
 * Query params for GET /available-modules
 */
export const AvailableModulesQuerySchema = Type.Object(
  {
    domain: Type.Optional(Type.String({ description: 'Filter by domain' })),
    tag: Type.Optional(Type.String({ description: 'Filter by tag' })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 1000 })),
  },
  { additionalProperties: false },
);
export type AvailableModulesQuery =
  (typeof AvailableModulesQuerySchema)['static'];

/**
 * Query params for GET /import-order
 */
export const ImportOrderQuerySchema = Type.Object(
  {
    includeDetails: Type.Optional(Type.Boolean({ default: false })),
  },
  { additionalProperties: false },
);
export type ImportOrderQuery = (typeof ImportOrderQuerySchema)['static'];

/**
 * Path params for GET /module/:moduleName/template
 */
export const ModuleNameParamSchema = Type.Object(
  {
    moduleName: Type.String({
      description: 'Module identifier (e.g., drug_generics)',
      minLength: 1,
    }),
  },
  { additionalProperties: false },
);
export type ModuleNameParam = (typeof ModuleNameParamSchema)['static'];

/**
 * Query params for GET /module/:moduleName/template
 */
export const TemplateQuerySchema = Type.Object(
  {
    format: Type.Optional(
      Type.Union([Type.Literal('csv'), Type.Literal('excel')], {
        default: 'csv',
        description: 'Template format',
      }),
    ),
  },
  { additionalProperties: false },
);
export type TemplateQuery = (typeof TemplateQuerySchema)['static'];

/**
 * Path params for POST /module/:moduleName/validate
 */
export const ModuleValidateParamSchema = Type.Object(
  {
    moduleName: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type ModuleValidateParam = (typeof ModuleValidateParamSchema)['static'];

/**
 * Request body for POST /module/:moduleName/validate
 * This uses multipart/form-data (handled by Fastify multipart)
 * The file is parsed by middleware, so we define a placeholder
 */
export const ValidateFileRequestSchema = Type.Object(
  {
    // File is handled by multipart middleware
    // This schema represents the parsed result
  },
  { additionalProperties: true },
);
export type ValidateFileRequest = (typeof ValidateFileRequestSchema)['static'];

/**
 * Request body for POST /module/:moduleName/import
 */
export const ImportDataRequestSchema = Type.Object(
  {
    sessionId: Type.String({
      description: 'Valid session ID from validation',
      format: 'uuid',
    }),
    options: Type.Optional(
      Type.Object(
        {
          skipWarnings: Type.Optional(
            Type.Boolean({
              default: false,
              description: 'Skip validation warnings and proceed',
            }),
          ),
          batchSize: Type.Optional(
            Type.Integer({
              default: 100,
              minimum: 1,
              maximum: 10000,
              description: 'Batch size for database inserts',
            }),
          ),
          onConflict: Type.Optional(
            Type.Union(
              [
                Type.Literal('skip'),
                Type.Literal('update'),
                Type.Literal('error'),
              ],
              {
                default: 'skip',
                description: 'How to handle conflicts',
              },
            ),
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);
export type ImportDataRequest = (typeof ImportDataRequestSchema)['static'];

/**
 * Path params for GET /module/:moduleName/status/:jobId
 */
export const StatusParamSchema = Type.Object(
  {
    moduleName: Type.String({ minLength: 1 }),
    jobId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type StatusParam = (typeof StatusParamSchema)['static'];

/**
 * Path params for DELETE /module/:moduleName/rollback/:jobId
 */
export const RollbackParamSchema = Type.Object(
  {
    moduleName: Type.String({ minLength: 1 }),
    jobId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type RollbackParam = (typeof RollbackParamSchema)['static'];

/**
 * Query params for GET /dashboard
 */
export const DashboardQuerySchema = Type.Object(
  {
    includeHistory: Type.Optional(Type.Boolean({ default: true })),
    historyLimit: Type.Optional(
      Type.Integer({
        default: 10,
        minimum: 1,
        maximum: 100,
      }),
    ),
  },
  { additionalProperties: false },
);
export type DashboardQuery = (typeof DashboardQuerySchema)['static'];

// --- RESPONSE SCHEMAS ---

/**
 * Template column definition
 */
export const TemplateColumnSchema = Type.Object({
  name: Type.String(),
  displayName: Type.Optional(Type.String()),
  required: Type.Boolean(),
  type: Type.Union([
    Type.Literal('string'),
    Type.Literal('number'),
    Type.Literal('boolean'),
    Type.Literal('date'),
  ]),
  maxLength: Type.Optional(Type.Integer()),
  minValue: Type.Optional(Type.Number()),
  maxValue: Type.Optional(Type.Number()),
  pattern: Type.Optional(Type.String()),
  enumValues: Type.Optional(Type.Array(Type.String())),
  description: Type.Optional(Type.String()),
  example: Type.Optional(Type.String()),
});
export type TemplateColumn = (typeof TemplateColumnSchema)['static'];

/**
 * Import module metadata
 */
export const ImportModuleSchema = Type.Object({
  module: Type.String(),
  domain: Type.String(),
  subdomain: Type.Optional(Type.String()),
  displayName: Type.String(),
  description: Type.Optional(Type.String()),
  dependencies: Type.Array(Type.String()),
  priority: Type.Integer(),
  tags: Type.Array(Type.String()),
  supportsRollback: Type.Boolean(),
  version: Type.String(),
  importStatus: Type.Union([
    Type.Literal('not_started'),
    Type.Literal('in_progress'),
    Type.Literal('completed'),
    Type.Literal('failed'),
  ]),
  recordCount: Type.Integer(),
  lastImportDate: Type.Optional(Type.String({ format: 'date-time' })),
});
export type ImportModule = (typeof ImportModuleSchema)['static'];

/**
 * Response for GET /available-modules
 */
export const AvailableModulesResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    modules: Type.Array(ImportModuleSchema),
    totalModules: Type.Integer(),
    completedModules: Type.Integer(),
    pendingModules: Type.Integer(),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type AvailableModulesResponse =
  (typeof AvailableModulesResponseSchema)['static'];

/**
 * Import order item
 */
export const ImportOrderItemSchema = Type.Object({
  module: Type.String(),
  reason: Type.String(),
});
export type ImportOrderItem = (typeof ImportOrderItemSchema)['static'];

/**
 * Response for GET /import-order
 */
export const ImportOrderResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    order: Type.Array(ImportOrderItemSchema),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type ImportOrderResponse = (typeof ImportOrderResponseSchema)['static'];

/**
 * Template response (binary file)
 */
export const TemplateResponseSchema = Type.Object({
  // This is a file response, not JSON
  // Handled separately with Content-Type headers
});
export type TemplateResponse = (typeof TemplateResponseSchema)['static'];

/**
 * Validation error/warning
 */
export const ValidationMessageSchema = Type.Object({
  row: Type.Integer(),
  field: Type.String(),
  message: Type.String(),
  severity: Type.Union([
    Type.Literal('ERROR'),
    Type.Literal('WARNING'),
    Type.Literal('INFO'),
  ]),
  code: Type.String(),
});
export type ValidationMessage = (typeof ValidationMessageSchema)['static'];

/**
 * Validation statistics
 */
export const ValidationStatsSchema = Type.Object({
  totalRows: Type.Integer(),
  validRows: Type.Integer(),
  errorRows: Type.Integer(),
});
export type ValidationStats = (typeof ValidationStatsSchema)['static'];

/**
 * Response for POST /module/:moduleName/validate
 */
export const ValidateResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    sessionId: Type.String({ format: 'uuid' }),
    isValid: Type.Boolean(),
    errors: Type.Array(ValidationMessageSchema),
    warnings: Type.Array(ValidationMessageSchema),
    stats: ValidationStatsSchema,
    expiresAt: Type.String({ format: 'date-time' }),
    canProceed: Type.Boolean(),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type ValidateResponse = (typeof ValidateResponseSchema)['static'];

/**
 * Response for POST /module/:moduleName/import
 */
export const ImportResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    jobId: Type.String({ format: 'uuid' }),
    status: Type.Union([Type.Literal('queued'), Type.Literal('running')]),
    message: Type.String(),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type ImportResponse = (typeof ImportResponseSchema)['static'];

/**
 * Import progress information
 */
export const ImportProgressSchema = Type.Object({
  totalRows: Type.Integer(),
  importedRows: Type.Integer(),
  errorRows: Type.Integer(),
  currentRow: Type.Integer(),
  percentComplete: Type.Number(),
});
export type ImportProgress = (typeof ImportProgressSchema)['static'];

/**
 * Response for GET /module/:moduleName/status/:jobId
 */
export const StatusResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    jobId: Type.String({ format: 'uuid' }),
    status: Type.Union([
      Type.Literal('pending'),
      Type.Literal('running'),
      Type.Literal('completed'),
      Type.Literal('failed'),
      Type.Literal('rolled_back'),
    ]),
    progress: Type.Optional(ImportProgressSchema),
    startedAt: Type.Optional(Type.String({ format: 'date-time' })),
    completedAt: Type.Optional(Type.String({ format: 'date-time' })),
    estimatedCompletion: Type.Optional(Type.String({ format: 'date-time' })),
    error: Type.Optional(Type.String()),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type StatusResponse = (typeof StatusResponseSchema)['static'];

/**
 * Response for DELETE /module/:moduleName/rollback/:jobId
 */
export const RollbackResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    jobId: Type.String({ format: 'uuid' }),
    message: Type.String(),
    deletedRecords: Type.Integer(),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type RollbackResponse = (typeof RollbackResponseSchema)['static'];

/**
 * User reference
 */
export const UserRefSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
});
export type UserRef = (typeof UserRefSchema)['static'];

/**
 * Import history record
 */
export const ImportHistoryRecordSchema = Type.Object({
  jobId: Type.String({ format: 'uuid' }),
  module: Type.String(),
  status: Type.Union([
    Type.Literal('pending'),
    Type.Literal('running'),
    Type.Literal('completed'),
    Type.Literal('failed'),
    Type.Literal('rolled_back'),
  ]),
  recordsImported: Type.Integer(),
  completedAt: Type.String({ format: 'date-time' }),
  importedBy: UserRefSchema,
});
export type ImportHistoryRecord = (typeof ImportHistoryRecordSchema)['static'];

/**
 * Domain stats
 */
export const DomainStatsSchema = Type.Object({
  total: Type.Integer(),
  completed: Type.Integer(),
});
export type DomainStats = (typeof DomainStatsSchema)['static'];

/**
 * Dashboard overview
 */
export const DashboardOverviewSchema = Type.Object({
  totalModules: Type.Integer(),
  completedModules: Type.Integer(),
  inProgressModules: Type.Integer(),
  pendingModules: Type.Integer(),
  totalRecordsImported: Type.Integer(),
});
export type DashboardOverview = (typeof DashboardOverviewSchema)['static'];

/**
 * Recommended next module
 */
export const NextRecommendedSchema = Type.Object({
  module: Type.String(),
  reason: Type.String(),
});
export type NextRecommended = (typeof NextRecommendedSchema)['static'];

/**
 * Response for GET /dashboard
 */
export const DashboardResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    overview: DashboardOverviewSchema,
    modulesByDomain: Type.Record(Type.String(), DomainStatsSchema),
    recentImports: Type.Array(ImportHistoryRecordSchema),
    nextRecommended: Type.Array(NextRecommendedSchema),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type DashboardResponse = (typeof DashboardResponseSchema)['static'];

/**
 * Error response (generic)
 */
export const ErrorResponseSchema = Type.Object({
  success: Type.Boolean({ const: false }),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    statusCode: Type.Optional(Type.Integer()),
  }),
  meta: Type.Object({
    requestId: Type.String(),
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
  }),
});
export type ErrorResponse = (typeof ErrorResponseSchema)['static'];
