/**
 * Base Import Service (Auto-Discovery Import System)
 * Abstract class implementing IImportService interface
 *
 * Provides default implementations for:
 * - Template generation (CSV/Excel) from column definitions
 * - File validation (session-based workflow)
 * - Row-by-row validation with error accumulation
 * - Import execution with transaction support
 * - Status tracking using import_history table
 * - Rollback capability
 * - Import history retrieval
 *
 * Child classes must implement:
 * - getTemplateColumns(): Define template structure
 * - validateRow(): Custom row validation logic
 *
 * @abstract
 * @generic T - Entity type being imported
 */

import { v4 as uuidv4 } from 'uuid';
import { Knex } from 'knex';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';

import {
  IImportService,
  ImportServiceMetadata,
  ImportContext,
  TemplateColumn,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  ImportOptions,
  ImportStatus,
  ImportJobStatus,
  ImportHistoryRecord,
} from '../types/import-service.types';
import { IMPORT_CONFIG } from '../../../config/import.config';
import {
  ImportSessionRepository,
  ImportSession,
} from '../repositories/import-session.repository';
import {
  ImportHistoryRepository,
  ImportHistory,
} from '../repositories/import-history.repository';

/**
 * Abstract Base Import Service
 * Implements IImportService interface with template generation,
 * validation, import execution, and rollback capabilities
 */
export abstract class BaseImportService<
  T extends Record<string, any> = Record<string, any>,
> implements IImportService<T>
{
  /**
   * Module name (must be set by child class via decorator)
   * @protected
   */
  protected moduleName!: string;

  /**
   * Import session repository (database-backed)
   * @protected
   */
  protected importSessionRepository: ImportSessionRepository;

  /**
   * Import history repository (database-backed)
   * @protected
   */
  protected importHistoryRepository: ImportHistoryRepository;

  /**
   * Constructor
   * @param knex - Knex database instance
   */
  constructor(protected knex: Knex) {
    this.importSessionRepository = new ImportSessionRepository(knex);
    this.importHistoryRepository = new ImportHistoryRepository(knex);
  }

  /**
   * Get service metadata
   * Must be called after decorator initialization
   * @returns Service metadata
   */
  abstract getMetadata(): ImportServiceMetadata;

  /**
   * Get template column definitions
   * Child classes must implement this to define import structure
   * @returns Array of template column definitions
   */
  abstract getTemplateColumns(): TemplateColumn[];

  /**
   * Validate a single row during batch validation
   * Child classes must implement custom validation logic
   * @param row - Row data to validate
   * @param rowNumber - 1-indexed row number
   * @returns Array of validation errors (empty if valid)
   */
  abstract validateRow(row: any, rowNumber: number): Promise<ValidationError[]>;

  /**
   * Generate template file (CSV or Excel)
   * Creates downloadable template with column definitions and examples
   * @param format - 'csv' or 'excel'
   * @returns Buffer containing template file
   */
  async generateTemplate(format: 'csv' | 'excel'): Promise<Buffer> {
    const columns = this.getTemplateColumns();

    if (format === 'excel') {
      return this.generateExcelTemplate(columns);
    } else {
      return this.generateCsvTemplate(columns);
    }
  }

  /**
   * Generate Excel template using ExcelJS
   * @private
   */
  private async generateExcelTemplate(
    columns: TemplateColumn[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    // Add header row with column definitions
    const headerRow = worksheet.addRow(
      columns.map((col) => col.displayName || col.name),
    );

    // Format header row
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    // Set column widths and apply data validation
    columns.forEach((col, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(15, (col.displayName || col.name).length + 2);

      // Add data validation for enum columns
      if (col.enumValues && col.enumValues.length > 0) {
        // Data validation will be applied to rows 2 onwards
        for (let row = 2; row <= 1000; row++) {
          const cell = worksheet.getCell(row, index + 1);
          cell.dataValidation = {
            type: 'list',
            formulae: [`"${col.enumValues.join(',')}"`],
            error: `Must be one of: ${col.enumValues.join(', ')}`,
            errorTitle: 'Invalid Value',
            showErrorMessage: true,
          };
        }
      }
    });

    // Add example row if available
    const exampleRow = worksheet.addRow(
      columns.map((col) => col.example || this.getExampleValue(col)),
    );
    exampleRow.font = { italic: true, color: { argb: 'FF808080' } };
    exampleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    };

    // Add data validation hints as a comment to the header
    const hintRow = worksheet.addRow([]);
    hintRow.height = 0; // Hide the hint row
    columns.forEach((col, index) => {
      const hints: string[] = [];
      if (col.required) hints.push('Required');
      if (col.maxLength) hints.push(`Max: ${col.maxLength}`);
      if (col.minValue !== undefined) hints.push(`Min: ${col.minValue}`);
      if (col.maxValue !== undefined) hints.push(`Max: ${col.maxValue}`);
      if (col.enumValues) hints.push(`Values: ${col.enumValues.join(', ')}`);
      if (col.pattern) hints.push(`Pattern: ${col.pattern}`);

      if (hints.length > 0) {
        headerRow.getCell(index + 1).note = {
          texts: [{ font: { size: 10 }, text: hints.join('\n') }],
        };
      }
    });

    // Write to buffer
    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  /**
   * Generate CSV template
   * @private
   */
  private generateCsvTemplate(columns: TemplateColumn[]): Promise<Buffer> {
    const lines: string[] = [];

    // Add header row
    const headers = columns.map((col) => col.displayName || col.name);
    lines.push(Papa.unparse([headers]));

    // Add example row
    const example = columns.map(
      (col) => col.example || this.getExampleValue(col),
    );
    lines.push(Papa.unparse([example]));

    // Add instructions as comments
    lines.push('');
    lines.push('# Required fields marked with *');
    columns.forEach((col) => {
      if (col.required) {
        lines.push(`# ${col.displayName || col.name} *`);
      }
    });

    const csvContent = lines.join('\n');
    return Promise.resolve(Buffer.from(csvContent, 'utf-8'));
  }

  /**
   * Get example value for a column
   * @private
   */
  private getExampleValue(col: TemplateColumn): string {
    if (col.example) return col.example;

    switch (col.type) {
      case 'string':
        return `Example ${col.displayName || col.name}`;
      case 'number':
        return '100';
      case 'boolean':
        return 'true';
      case 'date':
        return new Date().toISOString().split('T')[0];
      default:
        return '';
    }
  }

  /**
   * Format bytes to human-readable string
   * @private
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Validate uploaded file and create session
   * Session-based workflow allows review before import
   * @param buffer - File buffer
   * @param fileName - Original filename
   * @param fileType - 'csv' or 'excel'
   * @param context - Authenticated user context
   * @returns Validation result with session ID
   */
  async validateFile(
    buffer: Buffer,
    fileName: string,
    fileType: 'csv' | 'excel',
    context: ImportContext,
  ): Promise<ValidationResult> {
    const metadata = this.getMetadata();
    const sessionId = uuidv4();

    try {
      // CHECK FILE SIZE (First layer of protection)
      if (buffer.length > IMPORT_CONFIG.MAX_FILE_SIZE) {
        const errors: ValidationError[] = [
          {
            row: 0,
            field: 'file',
            message: `File size ${this.formatBytes(buffer.length)} exceeds maximum allowed size of ${this.formatBytes(IMPORT_CONFIG.MAX_FILE_SIZE)}`,
            severity: 'ERROR',
            code: 'FILE_TOO_LARGE',
          },
        ];

        return {
          sessionId: null,
          isValid: false,
          errors,
          warnings: [],
          stats: { totalRows: 0, validRows: 0, errorRows: 0 },
          canProceed: false,
        };
      }

      // Parse file
      const rows = await this.parseFile(buffer, fileType);

      // CHECK ROW COUNT (Second layer of protection)
      if (rows.length > IMPORT_CONFIG.MAX_ROWS) {
        const errors: ValidationError[] = [
          {
            row: 0,
            field: 'file',
            message: `File contains ${rows.length} rows, exceeding maximum of ${IMPORT_CONFIG.MAX_ROWS} rows`,
            severity: 'ERROR',
            code: 'TOO_MANY_ROWS',
          },
        ];

        return {
          sessionId: null,
          isValid: false,
          errors,
          warnings: [],
          stats: { totalRows: rows.length, validRows: 0, errorRows: 0 },
          canProceed: false,
        };
      }

      // Accumulate validation errors
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      let validRowCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const rowNumber = i + 1;
        const rowErrors = await this.validateRow(rows[i], rowNumber);

        rowErrors.forEach((error) => {
          if (error.severity === 'ERROR') {
            errors.push(error);
          } else if (error.severity === 'WARNING') {
            warnings.push(error as ValidationWarning);
          }
        });

        if (rowErrors.filter((e) => e.severity === 'ERROR').length === 0) {
          validRowCount++;
        }
      }

      // Determine if validation passed
      const isValid = errors.length === 0;
      const canProceed = isValid;

      // Create session in database
      const session = await this.importSessionRepository.createSession({
        module_name: metadata.module,
        file_name: fileName,
        file_size_bytes: buffer.length,
        file_type: fileType,
        validated_data: rows,
        validation_result: {
          isValid,
          errors,
          warnings,
          stats: {
            totalRows: rows.length,
            validRows: validRowCount,
            errorRows: rows.length - validRowCount,
          },
        },
        can_proceed: canProceed,
        created_by: context.userId,
      });

      return {
        sessionId: session.session_id,
        isValid,
        errors,
        warnings,
        stats: {
          totalRows: rows.length,
          validRows: validRowCount,
          errorRows: rows.length - validRowCount,
        },
        expiresAt: session.expires_at,
        canProceed,
      };
    } catch (error) {
      throw new Error(
        `File validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Parse CSV or Excel file
   * @private
   */
  private async parseFile(
    buffer: Buffer,
    fileType: 'csv' | 'excel',
  ): Promise<any[]> {
    if (fileType === 'excel') {
      return this.parseExcelFile(buffer);
    } else {
      return this.parseCsvFile(buffer);
    }
  }

  /**
   * Parse Excel file using ExcelJS
   * @private
   */
  private async parseExcelFile(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Excel file is empty');
    }

    const rows: any[] = [];
    const columns = this.getTemplateColumns();
    let headerRow: string[] = [];

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        // First row is header
        headerRow = row.values as string[];
      } else {
        // Convert row to object
        const obj: Record<string, any> = {};
        columns.forEach((col, index) => {
          const cellValue = row.getCell(index + 1).value;
          obj[col.name] = cellValue;
        });
        rows.push(obj);
      }
    });

    return rows;
  }

  /**
   * Parse CSV file using Papa Parse
   * @private
   */
  private parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const csvContent = buffer.toString('utf-8');
        const columns = this.getTemplateColumns();

        Papa.parse(csvContent, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const rows: any[] = [];
            const headerRow = results.data[0] as string[];

            // Process data rows
            for (let i = 1; i < results.data.length; i++) {
              const rowData = results.data[i] as any[];
              const obj: Record<string, any> = {};

              columns.forEach((col, index) => {
                obj[col.name] = rowData[index];
              });

              rows.push(obj);
            }

            resolve(rows);
          },
          error: (error: any) => {
            reject(new Error(`CSV parsing error: ${error.message}`));
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Execute import from validated session
   * Starts background import job with transaction support
   * @param sessionId - Validation session ID
   * @param options - Import options (skipWarnings, batchSize, onConflict)
   * @param context - Authenticated user context
   * @returns Job ID and status
   */
  async importData(
    sessionId: string,
    options: ImportOptions,
    context: ImportContext,
  ): Promise<{
    jobId: string;
    status: 'queued' | 'running';
  }> {
    // Get session from database
    const session =
      await this.importSessionRepository.getValidSession(sessionId);
    if (!session) {
      throw new Error('Validation session not found or expired');
    }

    if (!session.can_proceed && !options.skipWarnings) {
      throw new Error('Cannot proceed with import due to validation errors');
    }

    const metadata = this.getMetadata();
    const jobId = uuidv4();

    // Create job record in database with user context
    await this.importHistoryRepository.create({
      job_id: jobId,
      session_id: sessionId,
      module_name: metadata.module,
      status: ImportJobStatus.PENDING,
      total_rows: session.validation_result.stats.totalRows,
      imported_rows: 0,
      error_rows: 0,
      warning_count: session.validation_result.warnings.length,
      started_at: new Date(),
      can_rollback: metadata.supportsRollback,
      imported_by: context.userId,
      imported_by_name: context.userName,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      file_name: session.file_name,
      file_size_bytes: session.file_size_bytes,
    });

    // Start background import (non-blocking)
    setImmediate(() => {
      this.executeImportJob(jobId, session, options).catch(async (error) => {
        console.error(`Import job ${jobId} failed:`, error);
        await this.importHistoryRepository.updateByJobId(jobId, {
          status: ImportJobStatus.FAILED,
          error_message: error instanceof Error ? error.message : String(error),
          completed_at: new Date(),
        });
      });
    });

    return {
      jobId,
      status: 'queued',
    };
  }

  /**
   * Execute import job with transaction support
   * Generates unique batch ID for all imported records
   * @private
   */
  private async executeImportJob(
    jobId: string,
    session: ImportSession,
    options: ImportOptions,
  ): Promise<void> {
    const { randomUUID } = await import('crypto');
    const batchId = randomUUID(); // Generate unique batch ID for this import job
    const batchSize = options.batchSize || 100;
    const trx = await this.knex.transaction();

    try {
      // Update status to running and store batch_id
      await this.importHistoryRepository.updateByJobId(jobId, {
        status: ImportJobStatus.RUNNING,
        batch_id: batchId,
      });

      const rows = session.validated_data;
      let successCount = 0;
      let errorCount = 0;

      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        try {
          // Add batch_id to each record before insertion
          const batchWithId = batch.map((record) => ({
            ...record,
            import_batch_id: batchId,
          }));

          // Allow child class to implement batch insertion
          const inserted = await this.insertBatch(batchWithId, trx, options);
          successCount += inserted.length;

          // Update progress in database
          await this.importHistoryRepository.updateByJobId(jobId, {
            imported_rows: successCount,
            error_rows: errorCount,
          });
        } catch (error) {
          errorCount += batch.length;
          console.error(`Batch ${i / batchSize} failed:`, error);

          // Handle conflict resolution
          if (options.onConflict === 'error') {
            throw error;
          } else if (options.onConflict === 'skip') {
            // Continue with next batch
            continue;
          }
          // For 'update', let child class handle it

          // Update error count
          await this.importHistoryRepository.updateByJobId(jobId, {
            error_rows: errorCount,
          });
        }
      }

      // Commit transaction
      await trx.commit();

      // Get job to calculate duration
      const job = await this.importHistoryRepository.findByJobId(jobId);
      const completedAt = new Date();
      const durationMs = job?.started_at
        ? completedAt.getTime() - job.started_at.getTime()
        : null;

      // Mark as completed
      await this.importHistoryRepository.updateByJobId(jobId, {
        status: ImportJobStatus.COMPLETED,
        imported_rows: successCount,
        error_rows: errorCount,
        completed_at: completedAt,
        duration_ms: durationMs,
      });

      // Delete session after successful import
      await this.importSessionRepository.deleteSession(session.session_id);
    } catch (error) {
      await trx.rollback();

      // Get job to calculate duration
      const job = await this.importHistoryRepository.findByJobId(jobId);
      const completedAt = new Date();
      const durationMs = job?.started_at
        ? completedAt.getTime() - job.started_at.getTime()
        : null;

      // Mark as failed
      await this.importHistoryRepository.updateByJobId(jobId, {
        status: ImportJobStatus.FAILED,
        error_message: error instanceof Error ? error.message : String(error),
        completed_at: completedAt,
        duration_ms: durationMs,
      });

      throw error;
    }
  }

  /**
   * Insert batch of records
   * Child classes should override this to implement actual database insertion
   * @protected
   */
  protected async insertBatch(
    batch: any[],
    trx: Knex.Transaction,
    options: ImportOptions,
  ): Promise<T[]> {
    // Default implementation - must be overridden by child class
    throw new Error('insertBatch() must be implemented by child class');
  }

  /**
   * Get import job status
   * @param jobId - Job ID
   * @returns Current job status
   */
  async getImportStatus(jobId: string): Promise<ImportStatus> {
    const job = await this.importHistoryRepository.findByJobId(jobId);
    if (!job) {
      throw new Error('Import job not found');
    }

    const totalRows = job.total_rows || 0;
    const importedRows = job.imported_rows || 0;

    return {
      jobId,
      status: job.status as ImportJobStatus,
      progress: {
        totalRows,
        importedRows,
        errorRows: job.error_rows || 0,
        currentRow: importedRows,
        percentComplete:
          totalRows > 0 ? Math.round((importedRows / totalRows) * 100) : 0,
      },
      startedAt: job.started_at || undefined,
      estimatedCompletion:
        job.status === ImportJobStatus.RUNNING && job.started_at
          ? this.estimateCompletionFromJob(job)
          : job.completed_at || undefined,
      error: job.error_message || undefined,
    };
  }

  /**
   * Estimate completion time based on current progress
   * @private
   */
  private estimateCompletionFromJob(job: ImportHistory): Date | undefined {
    const importedRows = job.imported_rows || 0;
    const totalRows = job.total_rows || 0;

    if (importedRows === 0 || !job.started_at) return undefined;

    const elapsed = Date.now() - job.started_at.getTime();
    const rowsPerMs = importedRows / elapsed;
    const remainingRows = totalRows - importedRows;
    const remainingMs = remainingRows / rowsPerMs;

    return new Date(Date.now() + remainingMs);
  }

  /**
   * Check if import can be rolled back
   * @param jobId - Job ID
   * @returns true if rollback is supported and job is completed
   */
  async canRollback(jobId: string): Promise<boolean> {
    const job = await this.importHistoryRepository.findByJobId(jobId);
    if (!job) return false;

    const metadata = this.getMetadata();
    return (
      metadata.supportsRollback &&
      job.status === ImportJobStatus.COMPLETED &&
      job.can_rollback &&
      !job.rolled_back_at
    );
  }

  /**
   * Rollback import job
   * Deletes records inserted by the job using batch_id for precision
   * @param jobId - Job ID
   * @param context - Authenticated user context
   */
  async rollback(jobId: string, context: ImportContext): Promise<void> {
    const job = await this.importHistoryRepository.findByJobId(jobId);
    if (!job) {
      throw new Error('Import job not found');
    }

    if (
      job.status !== ImportJobStatus.COMPLETED &&
      job.status !== ImportJobStatus.FAILED
    ) {
      throw new Error('Can only rollback completed or failed imports');
    }

    const metadata = this.getMetadata();
    if (!metadata.supportsRollback) {
      throw new Error('Rollback is not supported for this module');
    }

    if (!job.can_rollback) {
      throw new Error('This import cannot be rolled back');
    }

    if (job.rolled_back_at) {
      throw new Error('This import has already been rolled back');
    }

    // Check if batch_id exists for precise rollback
    if (!job.batch_id) {
      throw new Error(
        'Import job does not have batch ID. Cannot rollback safely. Please contact support.',
      );
    }

    try {
      // Call child class rollback implementation with batch_id
      const deletedCount = await this.performRollback(job.batch_id, this.knex);

      console.log(
        `Rolled back ${deletedCount} records from batch ${job.batch_id}`,
      );

      // Mark as rolled back with user context
      await this.importHistoryRepository.markAsRolledBack(
        jobId,
        context.userId,
      );
    } catch (error) {
      throw new Error(
        `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Perform rollback - must be implemented by child class
   * Uses batch_id to delete only records from this specific import job
   * @protected
   * @param batchId - Batch ID identifying records to rollback
   * @param knex - Knex instance for database access
   * @returns Number of records deleted
   */
  protected async performRollback(
    batchId: string,
    knex: Knex,
  ): Promise<number> {
    // Default implementation - must be overridden by child class
    throw new Error('performRollback() must be implemented by child class');
  }

  /**
   * Get import history
   * @param limit - Maximum records to return
   * @returns Array of import history records
   */
  async getImportHistory(limit: number = 10): Promise<ImportHistoryRecord[]> {
    const metadata = this.getMetadata();

    try {
      const records = await this.importHistoryRepository.getImportsByModule(
        metadata.module,
        limit,
      );

      return records.map((record) => ({
        jobId: record.job_id,
        moduleName: record.module_name,
        status: record.status as ImportJobStatus,
        recordsImported: record.imported_rows,
        completedAt: record.completed_at || new Date(),
        importedBy: {
          id: record.imported_by,
          name: record.imported_by_name || 'Unknown',
        },
      }));
    } catch (error) {
      console.error('Failed to retrieve import history:', error);
      return [];
    }
  }
}
