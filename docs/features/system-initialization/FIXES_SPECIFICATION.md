# Import System - Critical Fixes Specification

> **Status**: Ready for Implementation
> **Date**: 2025-12-13
> **Implementation Strategy**: Haiku → Sonnet → Opus (escalate if needed)

## Overview

This document contains detailed specifications for fixing 5 critical issues identified in the Sonnet code review of the Auto-Discovery Import System.

---

## Fix #1: Authentication Context (CRITICAL)

### Problem

**Location**: `apps/api/src/core/import/base/base-import.service.ts:369`

**Current Code**:

```typescript
await this.importHistoryRepository.create({
  // ... other fields
  imported_by: 'system', // ❌ Hardcoded - WRONG
});
```

**Issue**: Using hardcoded `'system'` string instead of real authenticated user ID. This breaks audit trail and violates security best practices.

### Solution

**Approach**: Pass authenticated user context through the entire import chain.

**Implementation Steps**:

1. **Update IImportService Interface** (`import-service.types.ts`):

   ```typescript
   export interface ImportContext {
     userId: string;
     userName?: string;
     ipAddress?: string;
     userAgent?: string;
   }

   export interface IImportService<T = any> {
     // Add context parameter to all methods that need it
     validateFile(
       buffer: Buffer,
       fileName: string,
       fileType: string,
       context: ImportContext, // NEW
     ): Promise<ValidationResult>;

     importData(
       sessionId: string,
       options: ImportOptions,
       context: ImportContext, // NEW
     ): Promise<ImportJobResponse>;

     rollback(
       jobId: string,
       context: ImportContext, // NEW
     ): Promise<void>;
   }
   ```

2. **Update BaseImportService** (`base-import.service.ts`):

   ```typescript
   export abstract class BaseImportService<T> implements IImportService<T> {
     async validateFile(
       buffer: Buffer,
       fileName: string,
       fileType: string,
       context: ImportContext, // NEW
     ): Promise<ValidationResult> {
       // ... existing validation logic

       // Save session with user context
       await this.db('import_sessions').insert({
         session_id: sessionId,
         module_name: this.getMetadata().module,
         validated_data: validatedRows,
         validation_result: { isValid, errors, warnings },
         created_by: context.userId, // NEW
         created_at: new Date(),
       });

       return { sessionId, isValid, errors, warnings /* ... */ };
     }

     async importData(
       sessionId: string,
       options: ImportOptions,
       context: ImportContext, // NEW
     ): Promise<ImportJobResponse> {
       // ... existing import logic

       // Create import history with user context
       await this.importHistoryRepository.create({
         job_id: jobId,
         module_name: this.getMetadata().module,
         imported_by: context.userId, // ✅ FIXED
         imported_by_name: context.userName, // NEW (optional)
         ip_address: context.ipAddress, // NEW (optional)
         user_agent: context.userAgent, // NEW (optional)
         // ... other fields
       });

       return { jobId, status: 'queued', message: 'Import queued' };
     }

     async rollback(
       jobId: string,
       context: ImportContext, // NEW
     ): Promise<void> {
       // ... rollback logic with user context
       this.logger.info(`Rollback initiated by user ${context.userId}`);
     }
   }
   ```

3. **Update SystemInitController** (`system-init.controller.ts`):

   ```typescript
   export class SystemInitController {
     async validateFile(request: FastifyRequest, reply: FastifyReply) {
       const data = await request.file();
       const { moduleName } = request.params as { moduleName: string };

       const service = this.discoveryService.getService(moduleName);
       if (!service) {
         return reply.notFound(`Module ${moduleName} not found`);
       }

       const buffer = await data.toBuffer();

       // ✅ Create context from authenticated user
       const context: ImportContext = {
         userId: request.user.id,
         userName: request.user.display_name || request.user.email,
         ipAddress: request.ip,
         userAgent: request.headers['user-agent'],
       };

       const result = await service.validateFile(
         buffer,
         data.filename,
         data.mimetype,
         context, // ✅ PASS CONTEXT
       );

       return reply.code(200).send(result);
     }

     async executeImport(request: FastifyRequest, reply: FastifyReply) {
       const { moduleName } = request.params as { moduleName: string };
       const { sessionId, options } = request.body as ExecuteImportBody;

       const service = this.discoveryService.getService(moduleName);
       if (!service) {
         return reply.notFound(`Module ${moduleName} not found`);
       }

       // ✅ Create context from authenticated user
       const context: ImportContext = {
         userId: request.user.id,
         userName: request.user.display_name || request.user.email,
         ipAddress: request.ip,
         userAgent: request.headers['user-agent'],
       };

       const result = await service.importData(
         sessionId,
         options,
         context, // ✅ PASS CONTEXT
       );

       return reply.code(200).send(result);
     }

     async rollbackImport(request: FastifyRequest, reply: FastifyReply) {
       const { moduleName, jobId } = request.params as RollbackParams;

       const service = this.discoveryService.getService(moduleName);
       if (!service) {
         return reply.notFound(`Module ${moduleName} not found`);
       }

       // ✅ Create context
       const context: ImportContext = {
         userId: request.user.id,
         userName: request.user.display_name || request.user.email,
         ipAddress: request.ip,
         userAgent: request.headers['user-agent'],
       };

       await service.rollback(jobId, context); // ✅ PASS CONTEXT

       return reply.code(200).send({ message: 'Rollback successful' });
     }
   }
   ```

4. **Update Database Migration** (if needed):

   ```typescript
   // Add new columns to import_sessions if not exists
   await knex.schema.alterTable('import_sessions', (table) => {
     table.string('created_by', 255); // user_id
     table.string('ip_address', 50);
     table.text('user_agent');
   });

   // Add new columns to import_history if not exists
   await knex.schema.alterTable('import_history', (table) => {
     table.string('imported_by_name', 255);
     table.string('ip_address', 50);
     table.text('user_agent');
   });
   ```

5. **Update All Import Service Implementations**:
   - `departments-import.service.ts`
   - `users-import.service.ts`
   - Any future import services

   Make sure they inherit the updated method signatures from `BaseImportService`.

### Acceptance Criteria

- ✅ All import operations log the real authenticated user ID
- ✅ Import history shows who performed each import
- ✅ Rollback operations track who initiated them
- ✅ Audit trail is complete and accurate
- ✅ No hardcoded 'system' strings
- ✅ TypeScript builds without errors
- ✅ All existing tests pass

### Complexity: **MEDIUM**

**Recommended Agent**: Haiku (should be sufficient)

---

## Fix #2: File Size Limits (CRITICAL)

### Problem

**Location**: `apps/api/src/modules/admin/system-init/system-init.route.ts`

**Issue**: No file size limits on multipart file uploads. This creates a Denial of Service (DoS) risk where attackers can upload massive files to exhaust server resources.

### Solution

**Approach**: Add file size limits at multiple layers (Fastify config, route schema, and validation).

**Implementation Steps**:

1. **Update Fastify Configuration** (`apps/api/src/server.ts` or main server file):

   ```typescript
   const server = Fastify({
     logger: true,
     bodyLimit: 10 * 1024 * 1024, // Global 10MB limit
     // ... other config
   });

   // Register multipart with limits
   await server.register(multipart, {
     limits: {
       fileSize: 10 * 1024 * 1024, // 10MB per file
       files: 1, // Only 1 file per request
       fields: 10, // Max 10 form fields
       headerPairs: 2000, // Prevent header overflow
     },
   });
   ```

2. **Add File Size Validation in BaseImportService**:

   ```typescript
   export abstract class BaseImportService<T> {
     // Add configuration
     protected readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
     protected readonly MAX_ROWS = 10000; // 10k rows

     async validateFile(buffer: Buffer, fileName: string, fileType: string, context: ImportContext): Promise<ValidationResult> {
       const errors: ValidationError[] = [];

       // ✅ CHECK FILE SIZE
       if (buffer.length > this.MAX_FILE_SIZE) {
         errors.push({
           row: 0,
           field: 'file',
           message: `File size ${this.formatBytes(buffer.length)} exceeds maximum allowed size of ${this.formatBytes(this.MAX_FILE_SIZE)}`,
           severity: 'ERROR',
           code: 'FILE_TOO_LARGE',
         });

         return {
           sessionId: null,
           isValid: false,
           errors,
           warnings: [],
           stats: { totalRows: 0, validRows: 0, errorRows: 0 },
           canProceed: false,
         };
       }

       // Parse file...
       const rows = await this.parseFile(buffer, fileName, fileType);

       // ✅ CHECK ROW COUNT
       if (rows.length > this.MAX_ROWS) {
         errors.push({
           row: 0,
           field: 'file',
           message: `File contains ${rows.length} rows, exceeding maximum of ${this.MAX_ROWS} rows`,
           severity: 'ERROR',
           code: 'TOO_MANY_ROWS',
         });

         return {
           sessionId: null,
           isValid: false,
           errors,
           warnings: [],
           stats: { totalRows: rows.length, validRows: 0, errorRows: 0 },
           canProceed: false,
         };
       }

       // Continue with validation...
     }

     private formatBytes(bytes: number): string {
       if (bytes < 1024) return bytes + ' B';
       if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
       return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
     }
   }
   ```

3. **Update Route Schema** (`system-init.schemas.ts`):

   ```typescript
   export const validateFileSchema = {
     description: 'Validate uploaded import file',
     tags: ['system-init'],
     params: Type.Object({
       moduleName: Type.String({ minLength: 1, maxLength: 100 }),
     }),
     response: {
       200: ValidationResultSchema,
       400: ErrorResponseSchema,
       413: Type.Object({
         statusCode: Type.Literal(413),
         error: Type.Literal('Payload Too Large'),
         message: Type.String(),
       }),
     },
   };
   ```

4. **Add Error Handling in Controller**:

   ```typescript
   export class SystemInitController {
     async validateFile(request: FastifyRequest, reply: FastifyReply) {
       try {
         const data = await request.file();

         if (!data) {
           return reply.badRequest('No file uploaded');
         }

         const buffer = await data.toBuffer();

         // Additional check (defense in depth)
         const MAX_SIZE = 10 * 1024 * 1024;
         if (buffer.length > MAX_SIZE) {
           return reply.code(413).send({
             statusCode: 413,
             error: 'Payload Too Large',
             message: `File size exceeds maximum allowed size of ${(MAX_SIZE / (1024 * 1024)).toFixed(0)}MB`,
           });
         }

         // Continue with validation...
       } catch (error: any) {
         if (error.message?.includes('exceeded')) {
           return reply.code(413).send({
             statusCode: 413,
             error: 'Payload Too Large',
             message: 'File size exceeds maximum allowed size',
           });
         }
         throw error;
       }
     }
   }
   ```

5. **Add Configuration Constants** (`apps/api/src/config/import.config.ts`):
   ```typescript
   export const IMPORT_CONFIG = {
     MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
     MAX_ROWS: 10000, // 10k rows per import
     MAX_BATCH_SIZE: 1000, // 1k rows per batch
     SESSION_EXPIRY_MINUTES: 30,
     SUPPORTED_FORMATS: ['csv', 'xlsx', 'xls'] as const,
     SUPPORTED_MIME_TYPES: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] as const,
   };
   ```

### Acceptance Criteria

- ✅ Files larger than 10MB are rejected with 413 error
- ✅ Files with more than 10,000 rows are rejected
- ✅ Clear error messages indicating size limits
- ✅ Limits configurable via constants
- ✅ Multiple layers of protection (Fastify, schema, validation)
- ✅ No server crashes from large uploads
- ✅ TypeScript builds without errors

### Complexity: **EASY**

**Recommended Agent**: Haiku

---

## Fix #3: In-Memory Storage (CRITICAL)

### Problem

**Location**: `base-import.service.ts` and `import-discovery.service.ts`

**Current Implementation**:

```typescript
// ❌ Sessions stored in Map - data lost on restart
private sessions = new Map<string, SessionData>();

// ❌ Jobs stored in Map - data lost on restart
private jobs = new Map<string, JobStatus>();
```

**Issue**: Using in-memory `Map` for session and job storage causes data loss on server restart. Users lose validation sessions and can't track import progress.

### Solution

**Approach**: Migrate to database storage using existing `import_sessions` and `import_history` tables.

**Implementation Steps**:

1. **Remove In-Memory Maps from BaseImportService**:

   ```typescript
   export abstract class BaseImportService<T> {
     // ❌ REMOVE THESE
     // private sessions = new Map<string, SessionData>();
     // private jobs = new Map<string, JobStatus>();

     // ✅ USE REPOSITORIES INSTEAD
     constructor(
       protected db: Knex,
       protected logger: Logger,
       protected importSessionRepository: ImportSessionRepository, // NEW
       protected importHistoryRepository: ImportHistoryRepository, // Existing
     ) {}
   }
   ```

2. **Create ImportSessionRepository** (`apps/api/src/core/import/repositories/import-session.repository.ts`):

   ```typescript
   import { BaseRepository } from '../../../database/base.repository';
   import { Knex } from 'knex';

   export interface ImportSession {
     session_id: string;
     module_name: string;
     validated_data: any; // JSONB
     validation_result: any; // JSONB
     can_proceed: boolean;
     created_by: string;
     created_at: Date;
     expires_at: Date;
     ip_address?: string;
     user_agent?: string;
   }

   export class ImportSessionRepository extends BaseRepository<ImportSession> {
     constructor(db: Knex) {
       super(db, 'import_sessions', 'session_id');
     }

     async createSession(data: Omit<ImportSession, 'session_id' | 'created_at' | 'expires_at'>): Promise<ImportSession> {
       const sessionId = crypto.randomUUID();
       const now = new Date();
       const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

       const [session] = await this.db(this.tableName)
         .insert({
           session_id: sessionId,
           created_at: now,
           expires_at: expiresAt,
           ...data,
         })
         .returning('*');

       return session;
     }

     async getValidSession(sessionId: string): Promise<ImportSession | null> {
       const session = await this.db(this.tableName).where({ session_id: sessionId }).where('expires_at', '>', new Date()).first();

       return session || null;
     }

     async deleteExpiredSessions(): Promise<number> {
       return this.db(this.tableName).where('expires_at', '<', new Date()).delete();
     }

     async deleteSession(sessionId: string): Promise<void> {
       await this.db(this.tableName).where({ session_id: sessionId }).delete();
     }
   }
   ```

3. **Update BaseImportService to Use Repository**:

   ```typescript
   export abstract class BaseImportService<T> {
     async validateFile(buffer: Buffer, fileName: string, fileType: string, context: ImportContext): Promise<ValidationResult> {
       // ... validation logic

       // ✅ Save session to DATABASE
       const session = await this.importSessionRepository.createSession({
         module_name: this.getMetadata().module,
         validated_data: validatedRows,
         validation_result: { isValid, errors, warnings, stats },
         can_proceed: isValid || (errors.length === 0 && warnings.length > 0),
         created_by: context.userId,
         ip_address: context.ipAddress,
         user_agent: context.userAgent,
       });

       return {
         sessionId: session.session_id,
         isValid,
         errors,
         warnings,
         stats,
         expiresAt: session.expires_at.toISOString(),
         canProceed: session.can_proceed,
       };
     }

     async importData(sessionId: string, options: ImportOptions, context: ImportContext): Promise<ImportJobResponse> {
       // ✅ Get session from DATABASE
       const session = await this.importSessionRepository.getValidSession(sessionId);

       if (!session) {
         throw new AppError('Import session not found or expired. Please re-upload and validate the file.', 400, 'SESSION_EXPIRED');
       }

       if (!session.can_proceed) {
         throw new AppError('Cannot proceed with import. File validation failed.', 400, 'VALIDATION_FAILED');
       }

       const jobId = crypto.randomUUID();

       // ✅ Create job in DATABASE (import_history)
       await this.importHistoryRepository.create({
         job_id: jobId,
         module_name: this.getMetadata().module,
         status: 'queued',
         total_rows: session.validation_result.stats.totalRows,
         imported_rows: 0,
         error_rows: 0,
         imported_by: context.userId,
         imported_by_name: context.userName,
         ip_address: context.ipAddress,
         user_agent: context.userAgent,
         started_at: new Date(),
       });

       // Start async import process
       this.processImport(jobId, session.validated_data, options, context).catch((error) => {
         this.logger.error(`Import job ${jobId} failed:`, error);
       });

       // ✅ Delete session after use
       await this.importSessionRepository.deleteSession(sessionId);

       return {
         jobId,
         status: 'queued',
         message: 'Import job queued successfully',
       };
     }

     async getImportStatus(jobId: string): Promise<ImportStatus> {
       // ✅ Get status from DATABASE
       const job = await this.importHistoryRepository.findById(jobId);

       if (!job) {
         throw new AppError('Import job not found', 404, 'JOB_NOT_FOUND');
       }

       return {
         jobId: job.job_id,
         status: job.status,
         progress: {
           totalRows: job.total_rows,
           importedRows: job.imported_rows,
           errorRows: job.error_rows,
           currentRow: job.imported_rows + job.error_rows,
           percentComplete: Math.round((job.imported_rows / job.total_rows) * 100),
         },
         startedAt: job.started_at?.toISOString(),
         completedAt: job.completed_at?.toISOString(),
         error: job.error_details,
       };
     }

     private async processImport(jobId: string, validatedData: any[], options: ImportOptions, context: ImportContext): Promise<void> {
       try {
         // ✅ Update status in DATABASE
         await this.importHistoryRepository.update(jobId, { status: 'processing' });

         const batchSize = options.batchSize || 100;
         let importedCount = 0;
         let errorCount = 0;

         for (let i = 0; i < validatedData.length; i += batchSize) {
           const batch = validatedData.slice(i, i + batchSize);

           try {
             await this.db.transaction(async (trx) => {
               await this.insertBatch(batch, trx);
             });

             importedCount += batch.length;

             // ✅ Update progress in DATABASE
             await this.importHistoryRepository.update(jobId, {
               imported_rows: importedCount,
               error_rows: errorCount,
             });
           } catch (error) {
             errorCount += batch.length;
             this.logger.error(`Batch import failed:`, error);
           }
         }

         // ✅ Mark complete in DATABASE
         await this.importHistoryRepository.update(jobId, {
           status: 'completed',
           imported_rows: importedCount,
           error_rows: errorCount,
           completed_at: new Date(),
         });
       } catch (error: any) {
         // ✅ Mark failed in DATABASE
         await this.importHistoryRepository.update(jobId, {
           status: 'failed',
           error_details: {
             message: error.message,
             stack: error.stack,
           },
           completed_at: new Date(),
         });

         throw error;
       }
     }
   }
   ```

4. **Update ImportHistoryRepository** (if needed):

   ```typescript
   export class ImportHistoryRepository extends BaseRepository<ImportHistory> {
     async update(jobId: string, data: Partial<ImportHistory>): Promise<void> {
       await this.db(this.tableName).where({ job_id: jobId }).update(data);
     }

     async getRecentImports(limit: number = 10): Promise<ImportHistory[]> {
       return this.db(this.tableName).orderBy('started_at', 'desc').limit(limit);
     }

     async getImportsByModule(moduleName: string): Promise<ImportHistory[]> {
       return this.db(this.tableName).where({ module_name: moduleName }).orderBy('started_at', 'desc');
     }
   }
   ```

5. **Add Cleanup Job** (`apps/api/src/core/import/jobs/cleanup-sessions.job.ts`):

   ```typescript
   import { Knex } from 'knex';
   import { ImportSessionRepository } from '../repositories/import-session.repository';

   export class SessionCleanupJob {
     constructor(
       private db: Knex,
       private logger: Logger,
     ) {}

     async run(): Promise<void> {
       const repository = new ImportSessionRepository(this.db);
       const deletedCount = await repository.deleteExpiredSessions();

       if (deletedCount > 0) {
         this.logger.info(`Deleted ${deletedCount} expired import sessions`);
       }
     }
   }

   // Schedule to run every 30 minutes
   export function scheduleSessionCleanup(db: Knex, logger: Logger) {
     const job = new SessionCleanupJob(db, logger);

     setInterval(
       () => {
         job.run().catch((error) => {
           logger.error('Session cleanup job failed:', error);
         });
       },
       30 * 60 * 1000,
     ); // 30 minutes
   }
   ```

6. **Update Dependency Injection**:
   - Update all places where `BaseImportService` is instantiated
   - Pass `importSessionRepository` to constructor
   - Update `DepartmentsImportService` and `UsersImportService`

### Acceptance Criteria

- ✅ No in-memory Map storage
- ✅ All sessions persisted to database
- ✅ All jobs tracked in database
- ✅ Server restart doesn't lose data
- ✅ Expired sessions automatically cleaned up
- ✅ Import progress survives server restart
- ✅ TypeScript builds without errors
- ✅ All tests pass

### Complexity: **MEDIUM-HIGH**

**Recommended Agent**: Haiku → Sonnet (if Haiku struggles with DI changes)

---

## Fix #4: Time-based Rollback (HIGH PRIORITY)

### Problem

**Location**: `base-import.service.ts` rollback method

**Current Implementation**:

```typescript
// ❌ Uses time window - imprecise and risky
await this.db.transaction(async (trx) => {
  await trx(this.tableName).where('created_at', '>=', job.started_at).where('created_at', '<=', job.completed_at).delete();
});
```

**Issue**: Rolling back by time window can accidentally delete records from other imports or miss records if there are clock skew issues.

### Solution

**Approach**: Add batch ID tracking to all imported records.

**Implementation Steps**:

1. **Add batch_id Column to Import History**:

   ```typescript
   // Migration: apps/api/src/database/migrations/20251213_add_batch_tracking.ts
   export async function up(knex: Knex): Promise<void> {
     // Add batch_id to import_history
     await knex.schema.alterTable('import_history', (table) => {
       table.string('batch_id', 100).unique().index();
     });

     // Update existing records with batch_id = job_id
     await knex('import_history')
       .whereNull('batch_id')
       .update({
         batch_id: knex.raw('job_id'),
       });
   }

   export async function down(knex: Knex): Promise<void> {
     await knex.schema.alterTable('import_history', (table) => {
       table.dropColumn('batch_id');
     });
   }
   ```

2. **Add import_batch_id to Target Tables**:

   This requires updating each table that supports import:

   ```typescript
   // Example for departments table
   await knex.schema.alterTable('inventory.departments', (table) => {
     table.string('import_batch_id', 100).nullable().index();
   });

   // Example for users table
   await knex.schema.alterTable('users', (table) => {
     table.string('import_batch_id', 100).nullable().index();
   });
   ```

3. **Update BaseImportService to Track Batch ID**:

   ```typescript
   export abstract class BaseImportService<T> {
     private async processImport(jobId: string, validatedData: any[], options: ImportOptions, context: ImportContext): Promise<void> {
       const batchId = crypto.randomUUID(); // Generate unique batch ID

       try {
         // ✅ Store batch ID in import_history
         await this.importHistoryRepository.update(jobId, {
           status: 'processing',
           batch_id: batchId,
         });

         const batchSize = options.batchSize || 100;
         let importedCount = 0;

         for (let i = 0; i < validatedData.length; i += batchSize) {
           const batch = validatedData.slice(i, i + batchSize);

           // ✅ Add batch ID to each record
           const batchWithId = batch.map((record) => ({
             ...record,
             import_batch_id: batchId,
           }));

           await this.db.transaction(async (trx) => {
             await this.insertBatch(batchWithId, trx);
           });

           importedCount += batch.length;

           await this.importHistoryRepository.update(jobId, {
             imported_rows: importedCount,
           });
         }

         await this.importHistoryRepository.update(jobId, {
           status: 'completed',
           imported_rows: importedCount,
           completed_at: new Date(),
         });
       } catch (error: any) {
         await this.importHistoryRepository.update(jobId, {
           status: 'failed',
           error_details: { message: error.message },
           completed_at: new Date(),
         });
         throw error;
       }
     }

     async rollback(jobId: string, context: ImportContext): Promise<void> {
       const job = await this.importHistoryRepository.findById(jobId);

       if (!job) {
         throw new AppError('Import job not found', 404, 'JOB_NOT_FOUND');
       }

       if (job.status !== 'completed' && job.status !== 'failed') {
         throw new AppError('Can only rollback completed or failed imports', 400, 'INVALID_STATUS');
       }

       if (!job.batch_id) {
         throw new AppError('Import job does not have batch ID. Cannot rollback safely.', 400, 'NO_BATCH_ID');
       }

       try {
         await this.db.transaction(async (trx) => {
           // ✅ Delete by batch_id - precise and safe
           const deletedCount = await this.performRollback(job.batch_id!, trx);

           this.logger.info(`Rolled back ${deletedCount} records from batch ${job.batch_id}`);
         });

         // Mark as rolled back
         await this.importHistoryRepository.update(jobId, {
           status: 'rolled_back',
           rolled_back_at: new Date(),
           rolled_back_by: context.userId,
         });
       } catch (error: any) {
         this.logger.error(`Rollback failed for job ${jobId}:`, error);
         throw new AppError(`Rollback failed: ${error.message}`, 500, 'ROLLBACK_FAILED');
       }
     }

     /**
      * Override this in child classes to implement table-specific rollback
      */
     protected abstract performRollback(batchId: string, trx: Knex.Transaction): Promise<number>;
   }
   ```

4. **Update Import Services to Implement performRollback**:

   ```typescript
   // departments-import.service.ts
   @ImportService({
     module: 'departments',
     // ...
     supportsRollback: true,
   })
   export class DepartmentsImportService extends BaseImportService<Department> {
     protected async performRollback(batchId: string, trx: Knex.Transaction): Promise<number> {
       return trx('inventory.departments').where({ import_batch_id: batchId }).delete();
     }
   }

   // users-import.service.ts
   @ImportService({
     module: 'users',
     // ...
     supportsRollback: true,
   })
   export class UsersImportService extends BaseImportService<User> {
     protected async performRollback(batchId: string, trx: Knex.Transaction): Promise<number> {
       // Delete user_departments first (foreign key)
       await trx('user_departments')
         .whereIn('user_id', function () {
           this.select('id').from('users').where({ import_batch_id: batchId });
         })
         .delete();

       // Delete users
       return trx('users').where({ import_batch_id: batchId }).delete();
     }
   }
   ```

5. **Update import_history Schema**:
   ```typescript
   export interface ImportHistory {
     job_id: string;
     module_name: string;
     batch_id?: string; // NEW
     status: 'queued' | 'processing' | 'completed' | 'failed' | 'rolled_back'; // Add rolled_back
     total_rows: number;
     imported_rows: number;
     error_rows: number;
     imported_by: string;
     started_at: Date;
     completed_at?: Date;
     rolled_back_at?: Date; // NEW
     rolled_back_by?: string; // NEW
     error_details?: any;
   }
   ```

### Acceptance Criteria

- ✅ All imported records have batch_id
- ✅ Rollback uses batch_id (not time window)
- ✅ Rollback deletes exact records from import
- ✅ No accidental deletion of other records
- ✅ Import history tracks rollback status
- ✅ TypeScript builds without errors
- ✅ All tests pass

### Complexity: **MEDIUM**

**Recommended Agent**: Haiku → Sonnet (if migration changes are complex)

---

## Fix #5: Test Coverage (HIGH PRIORITY)

### Problem

**Issue**: No unit tests for critical import system components.

### Solution

**Approach**: Add unit tests for critical services using Jest.

**Implementation Steps**:

1. **Create Test for ImportSessionRepository**:

   ```typescript
   // apps/api/src/core/import/repositories/__tests__/import-session.repository.test.ts
   import { ImportSessionRepository } from '../import-session.repository';
   import { setupTestDatabase, teardownTestDatabase } from '../../../../test/helpers';

   describe('ImportSessionRepository', () => {
     let db: Knex;
     let repository: ImportSessionRepository;

     beforeAll(async () => {
       db = await setupTestDatabase();
       repository = new ImportSessionRepository(db);
     });

     afterAll(async () => {
       await teardownTestDatabase(db);
     });

     describe('createSession', () => {
       it('should create session with auto-generated ID and expiry', async () => {
         const session = await repository.createSession({
           module_name: 'test-module',
           validated_data: [{ id: 1, name: 'Test' }],
           validation_result: { isValid: true, errors: [], warnings: [] },
           can_proceed: true,
           created_by: 'user-123',
         });

         expect(session.session_id).toBeDefined();
         expect(session.expires_at).toBeInstanceOf(Date);
         expect(session.module_name).toBe('test-module');
       });
     });

     describe('getValidSession', () => {
       it('should return session if not expired', async () => {
         const created = await repository.createSession({
           module_name: 'test',
           validated_data: [],
           validation_result: {},
           can_proceed: true,
           created_by: 'user-123',
         });

         const retrieved = await repository.getValidSession(created.session_id);
         expect(retrieved).toBeDefined();
         expect(retrieved?.session_id).toBe(created.session_id);
       });

       it('should return null if session expired', async () => {
         // Create session with past expiry
         const [session] = await db('import_sessions')
           .insert({
             session_id: crypto.randomUUID(),
             module_name: 'test',
             validated_data: {},
             validation_result: {},
             can_proceed: true,
             created_by: 'user-123',
             created_at: new Date(),
             expires_at: new Date(Date.now() - 1000), // 1 second ago
           })
           .returning('*');

         const retrieved = await repository.getValidSession(session.session_id);
         expect(retrieved).toBeNull();
       });
     });

     describe('deleteExpiredSessions', () => {
       it('should delete only expired sessions', async () => {
         // Create valid session
         await repository.createSession({
           module_name: 'valid',
           validated_data: [],
           validation_result: {},
           can_proceed: true,
           created_by: 'user-123',
         });

         // Create expired session
         await db('import_sessions').insert({
           session_id: crypto.randomUUID(),
           module_name: 'expired',
           validated_data: {},
           validation_result: {},
           can_proceed: true,
           created_by: 'user-123',
           created_at: new Date(),
           expires_at: new Date(Date.now() - 1000),
         });

         const deletedCount = await repository.deleteExpiredSessions();
         expect(deletedCount).toBe(1);

         const remaining = await db('import_sessions').select('*');
         expect(remaining.length).toBe(1);
         expect(remaining[0].module_name).toBe('valid');
       });
     });
   });
   ```

2. **Create Test for BaseImportService**:

   ```typescript
   // apps/api/src/core/import/base/__tests__/base-import.service.test.ts
   import { BaseImportService } from '../base-import.service';
   import { ImportContext } from '../../types/import-service.types';

   class TestImportService extends BaseImportService<any> {
     getMetadata() {
       return {
         module: 'test',
         domain: 'test',
         displayName: 'Test Module',
         dependencies: [],
         priority: 1,
         supportsRollback: true,
       };
     }

     getTemplateColumns() {
       return [
         { name: 'id', required: true, type: 'number' },
         { name: 'name', required: true, type: 'string' },
       ];
     }

     async validateRow(row: any, rowNumber: number) {
       const errors = [];
       if (!row.id) errors.push({ row: rowNumber, field: 'id', message: 'Required' });
       if (!row.name) errors.push({ row: rowNumber, field: 'name', message: 'Required' });
       return errors;
     }

     async insertBatch(rows: any[], trx: Knex.Transaction) {
       return trx('test_table').insert(rows).returning('*');
     }

     protected async performRollback(batchId: string, trx: Knex.Transaction) {
       return trx('test_table').where({ import_batch_id: batchId }).delete();
     }
   }

   describe('BaseImportService', () => {
     let db: Knex;
     let service: TestImportService;
     let context: ImportContext;

     beforeAll(async () => {
       db = await setupTestDatabase();
       await db.schema.createTable('test_table', (table) => {
         table.increments('id');
         table.string('name');
         table.string('import_batch_id');
       });

       service = new TestImportService(db, logger, new ImportSessionRepository(db), new ImportHistoryRepository(db));

       context = {
         userId: 'user-123',
         userName: 'Test User',
         ipAddress: '127.0.0.1',
         userAgent: 'Jest',
       };
     });

     afterAll(async () => {
       await db.schema.dropTable('test_table');
       await teardownTestDatabase(db);
     });

     describe('validateFile', () => {
       it('should validate CSV file and create session', async () => {
         const csvContent = 'id,name\n1,Test\n2,Example';
         const buffer = Buffer.from(csvContent);

         const result = await service.validateFile(buffer, 'test.csv', 'text/csv', context);

         expect(result.isValid).toBe(true);
         expect(result.sessionId).toBeDefined();
         expect(result.stats.totalRows).toBe(2);
         expect(result.stats.validRows).toBe(2);
       });

       it('should reject file exceeding size limit', async () => {
         const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

         const result = await service.validateFile(largeBuffer, 'large.csv', 'text/csv', context);

         expect(result.isValid).toBe(false);
         expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
       });

       it('should detect validation errors in rows', async () => {
         const csvContent = 'id,name\n1,Test\n,MissingId\n3,Valid';
         const buffer = Buffer.from(csvContent);

         const result = await service.validateFile(buffer, 'test.csv', 'text/csv', context);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
         expect(result.stats.errorRows).toBe(1);
       });
     });

     describe('importData', () => {
       it('should import data and track progress', async () => {
         // First validate
         const csvContent = 'id,name\n1,Test\n2,Example';
         const buffer = Buffer.from(csvContent);
         const validation = await service.validateFile(buffer, 'test.csv', 'text/csv', context);

         // Then import
         const result = await service.importData(validation.sessionId!, { batchSize: 100, onConflict: 'skip' }, context);

         expect(result.jobId).toBeDefined();
         expect(result.status).toBe('queued');

         // Wait for import to complete
         await new Promise((resolve) => setTimeout(resolve, 1000));

         // Check status
         const status = await service.getImportStatus(result.jobId);
         expect(status.status).toBe('completed');
         expect(status.progress.importedRows).toBe(2);
       });

       it('should reject expired session', async () => {
         await expect(service.importData('expired-session-id', { batchSize: 100 }, context)).rejects.toThrow('SESSION_EXPIRED');
       });
     });

     describe('rollback', () => {
       it('should rollback imported records by batch ID', async () => {
         // Import data
         const csvContent = 'id,name\n10,RollbackTest';
         const buffer = Buffer.from(csvContent);
         const validation = await service.validateFile(buffer, 'test.csv', 'text/csv', context);

         const importResult = await service.importData(validation.sessionId!, { batchSize: 100 }, context);

         await new Promise((resolve) => setTimeout(resolve, 1000));

         // Verify record exists
         const records = await db('test_table').where({ id: 10 });
         expect(records.length).toBe(1);

         // Rollback
         await service.rollback(importResult.jobId, context);

         // Verify record deleted
         const afterRollback = await db('test_table').where({ id: 10 });
         expect(afterRollback.length).toBe(0);
       });
     });
   });
   ```

3. **Create Test for ImportDiscoveryService**:

   ```typescript
   // apps/api/src/core/import/discovery/__tests__/import-discovery.service.test.ts
   describe('ImportDiscoveryService', () => {
     it('should discover import services', async () => {
       const service = new ImportDiscoveryService(fastify, db, logger);
       await service.discoverServices();

       const services = service.getAllServices();
       expect(services.length).toBeGreaterThan(0);

       // Should find departments and users
       const departmentsService = service.getService('departments');
       expect(departmentsService).toBeDefined();

       const usersService = service.getService('users');
       expect(usersService).toBeDefined();
     });

     it('should calculate correct import order', async () => {
       const service = new ImportDiscoveryService(fastify, db, logger);
       await service.discoverServices();

       const order = service.getImportOrder();

       // Departments should come before users (no dependencies)
       const deptIndex = order.findIndex((s) => s.module === 'departments');
       const userIndex = order.findIndex((s) => s.module === 'users');

       expect(deptIndex).toBeGreaterThanOrEqual(0);
       expect(userIndex).toBeGreaterThanOrEqual(0);
     });
   });
   ```

4. **Update package.json test scripts**:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage",
       "test:import": "jest --testPathPattern=import"
     }
   }
   ```

### Acceptance Criteria

- ✅ Unit tests for ImportSessionRepository (90%+ coverage)
- ✅ Unit tests for BaseImportService (80%+ coverage)
- ✅ Unit tests for ImportDiscoveryService (70%+ coverage)
- ✅ All tests pass
- ✅ Tests run in CI/CD pipeline
- ✅ Code coverage report generated

### Complexity: **MEDIUM**

**Recommended Agent**: Haiku → Sonnet (if test setup is complex)

---

## Implementation Order

**Recommended sequence for parallel agent execution:**

1. **Fix #2 (File Size Limits)** - Haiku - EASY, independent
2. **Fix #1 (Authentication Context)** - Haiku - MEDIUM, independent
3. **Fix #4 (Batch Tracking)** - Haiku/Sonnet - MEDIUM, depends on #1
4. **Fix #3 (Database Storage)** - Sonnet - HIGH, depends on #1
5. **Fix #5 (Test Coverage)** - Haiku/Sonnet - MEDIUM, depends on all

**Parallel Strategy:**

- Spawn #1 and #2 in parallel (independent)
- Wait for #1 completion before starting #3 and #4
- Start #5 after all core fixes complete

---

## Success Criteria (Overall)

- ✅ All 5 fixes implemented successfully
- ✅ Zero TypeScript errors
- ✅ Build passes (`pnpm run build`)
- ✅ All unit tests pass
- ✅ Sonnet code review Grade: A or better
- ✅ No security vulnerabilities
- ✅ Comprehensive commit message
- ✅ Documentation updated

---

## Escalation Rules

**Haiku → Sonnet** if:

- Implementation takes >30 minutes
- Complex dependency injection changes needed
- Multiple file interdependencies
- Agent reports "too complex"

**Sonnet → Opus** if:

- Major architectural changes required
- Sonnet fails after 2 attempts
- Cross-cutting concerns affecting >20 files
- Performance optimization needed

---

**Next Step**: Spawn agents according to implementation order above.
