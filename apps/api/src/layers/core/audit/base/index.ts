/**
 * Base Audit System
 *
 * Provides base classes, interfaces, and schemas for building audit log systems.
 *
 * Usage:
 * ```typescript
 * import {
 *   BaseAuditRepository,
 *   BaseAuditService,
 *   BaseAuditController,
 *   CommonSchemas,
 * } from '@/core/audit-system/base';
 * ```
 */

// Repository
export {
  BaseAuditRepository,
  type BaseAuditLog,
  type BaseAuditQuery,
  type PaginationResult,
  type BaseStats,
  type FieldMapping,
} from './base.repository';

// Service
export {
  BaseAuditService,
  type CleanupQuery,
  type ExportOptions,
} from './base.service';

// Controller
export { BaseAuditController, type StatsQuery } from './base.controller';

// Schemas (all types and schemas)
export * from './base.schemas';
export { CommonSchemas } from './base.schemas';
