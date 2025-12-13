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
  TemplateColumn,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  ImportOptions,
  ImportStatus,
  ImportJobStatus,
  ImportHistoryRecord,
} from '../types/import-service.types';

/**
 * Import session stored in database/cache
 * Tracks file validation state during multi-step import workflow
 */
interface ImportSession {
  sessionId: string;
  moduleName: string;
  fileName: string;
  fileType: 'csv' | 'excel';
  fileSize: number;
  uploadedAt: Date;
  expiresAt: Date;
  validatedData: any[];
  validationResult: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    stats: {
      totalRows: number;
      validRows: number;
      errorRows: number;
    };
  };
  canProceed: boolean;
  createdBy: string;
}

/**
 * Import job tracking
 * Stores execution progress and metadata
 */
interface ImportJob {
  jobId: string;
  sessionId: string;
  moduleName: string;
  status: ImportJobStatus;
  totalRows: number;
  importedRows: number;
  errorRows: number;
  warningCount: number;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  canRollback: boolean;
  importedBy: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

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
   * In-memory session storage (can be replaced with database/Redis)
   * @private
   */
  private sessions: Map<string, ImportSession> = new Map();

  /**
   * In-memory job storage (can be replaced with database/Redis)
   * @private
   */
  private jobs: Map<string, ImportJob> = new Map();

  /**
   * Constructor
   * @param knex - Knex database instance
   */
  constructor(protected knex: Knex) {}

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
   * Validate uploaded file and create session
   * Session-based workflow allows review before import
   * @param buffer - File buffer
   * @param fileName - Original filename
   * @param fileType - 'csv' or 'excel'
   * @returns Validation result with session ID
   */
  async validateFile(
    buffer: Buffer,
    fileName: string,
    fileType: 'csv' | 'excel',
  ): Promise<ValidationResult> {
    const metadata = this.getMetadata();
    const sessionId = uuidv4();

    try {
      // Parse file
      const rows = await this.parseFile(buffer, fileType);

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

      // Create session
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30-minute expiry

      const session: ImportSession = {
        sessionId,
        moduleName: metadata.module,
        fileName,
        fileType,
        fileSize: buffer.length,
        uploadedAt: new Date(),
        expiresAt,
        validatedData: rows,
        validationResult: {
          isValid,
          errors,
          warnings,
          stats: {
            totalRows: rows.length,
            validRows: validRowCount,
            errorRows: rows.length - validRowCount,
          },
        },
        canProceed,
        createdBy: 'system', // Will be set by caller
      };

      // Store session
      this.sessions.set(sessionId, session);

      // Schedule cleanup
      setTimeout(() => this.sessions.delete(sessionId), 30 * 60 * 1000);

      return {
        sessionId,
        isValid,
        errors,
        warnings,
        stats: session.validationResult.stats,
        expiresAt,
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
   * @returns Job ID and status
   */
  async importData(
    sessionId: string,
    options: ImportOptions,
  ): Promise<{
    jobId: string;
    status: 'queued' | 'running';
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Validation session not found or expired');
    }

    if (!session.canProceed && !options.skipWarnings) {
      throw new Error('Cannot proceed with import due to validation errors');
    }

    const metadata = this.getMetadata();
    const jobId = uuidv4();

    // Create job record
    const job: ImportJob = {
      jobId,
      sessionId,
      moduleName: metadata.module,
      status: ImportJobStatus.PENDING,
      totalRows: session.validationResult.stats.totalRows,
      importedRows: 0,
      errorRows: 0,
      warningCount: session.validationResult.warnings.length,
      startedAt: new Date(),
      canRollback: metadata.supportsRollback,
      importedBy: session.createdBy,
      fileName: session.fileName,
      fileSize: session.fileSize,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, job);

    // Store job in database
    await this.storeImportHistory(job);

    // Start background import (non-blocking)
    setImmediate(() => {
      this.executeImportJob(jobId, session, options).catch((error) => {
        console.error(`Import job ${jobId} failed:`, error);
        job.status = ImportJobStatus.FAILED;
        job.errorMessage =
          error instanceof Error ? error.message : String(error);
        job.completedAt = new Date();
        job.updatedAt = new Date();
      });
    });

    return {
      jobId,
      status: 'queued',
    };
  }

  /**
   * Execute import job with transaction support
   * @private
   */
  private async executeImportJob(
    jobId: string,
    session: ImportSession,
    options: ImportOptions,
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const batchSize = options.batchSize || 100;
    const trx = await this.knex.transaction();

    try {
      job.status = ImportJobStatus.RUNNING;
      job.updatedAt = new Date();
      await this.updateImportHistory(job);

      const rows = session.validatedData;
      let successCount = 0;
      let errorCount = 0;

      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        try {
          // Allow child class to implement batch insertion
          const inserted = await this.insertBatch(batch, trx, options);
          successCount += inserted.length;
          job.importedRows += inserted.length;
        } catch (error) {
          errorCount += batch.length;
          job.errorRows += batch.length;
          console.error(`Batch ${i / batchSize} failed:`, error);

          // Handle conflict resolution
          if (options.onConflict === 'error') {
            throw error;
          } else if (options.onConflict === 'skip') {
            // Continue with next batch
            continue;
          }
          // For 'update', let child class handle it
        }

        job.updatedAt = new Date();
        await this.updateImportHistory(job);
      }

      // Commit transaction
      await trx.commit();

      job.status = ImportJobStatus.COMPLETED;
      job.completedAt = new Date();
      job.durationMs = job.completedAt.getTime() - job.startedAt.getTime();
      job.updatedAt = new Date();
      await this.updateImportHistory(job);
    } catch (error) {
      await trx.rollback();

      job.status = ImportJobStatus.FAILED;
      job.errorMessage = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      job.durationMs = job.completedAt.getTime() - job.startedAt.getTime();
      job.updatedAt = new Date();
      await this.updateImportHistory(job);

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
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Import job not found');
    }

    return {
      jobId,
      status: job.status,
      progress: {
        totalRows: job.totalRows,
        importedRows: job.importedRows,
        errorRows: job.errorRows,
        currentRow: job.importedRows,
        percentComplete: Math.round((job.importedRows / job.totalRows) * 100),
      },
      startedAt: job.startedAt,
      estimatedCompletion:
        job.status === ImportJobStatus.RUNNING
          ? this.estimateCompletion(job)
          : job.completedAt,
      error: job.errorMessage,
    };
  }

  /**
   * Estimate completion time based on current progress
   * @private
   */
  private estimateCompletion(job: ImportJob): Date | undefined {
    if (job.importedRows === 0) return undefined;

    const elapsed = Date.now() - job.startedAt.getTime();
    const rowsPerMs = job.importedRows / elapsed;
    const remainingRows = job.totalRows - job.importedRows;
    const remainingMs = remainingRows / rowsPerMs;

    return new Date(Date.now() + remainingMs);
  }

  /**
   * Check if import can be rolled back
   * @param jobId - Job ID
   * @returns true if rollback is supported and job is completed
   */
  async canRollback(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    const metadata = this.getMetadata();
    return (
      metadata.supportsRollback &&
      job.status === ImportJobStatus.COMPLETED &&
      !job.canRollback === false
    );
  }

  /**
   * Rollback import job
   * Deletes records inserted by the job
   * @param jobId - Job ID
   */
  async rollback(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Import job not found');
    }

    if (job.status !== ImportJobStatus.COMPLETED) {
      throw new Error('Can only rollback completed imports');
    }

    const metadata = this.getMetadata();
    if (!metadata.supportsRollback) {
      throw new Error('Rollback is not supported for this module');
    }

    try {
      // Call child class rollback implementation
      await this.performRollback(jobId, job);

      // Mark as rolled back
      job.status = ImportJobStatus.ROLLED_BACK;
      job.updatedAt = new Date();
      await this.updateImportHistory(job);
    } catch (error) {
      throw new Error(
        `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Perform rollback - must be implemented by child class
   * @protected
   */
  protected async performRollback(
    jobId: string,
    job: ImportJob,
  ): Promise<void> {
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
      const records = await this.knex('import_history')
        .where('module_name', metadata.module)
        .orderBy('created_at', 'desc')
        .limit(limit);

      return records.map((record) => ({
        jobId: record.job_id,
        moduleName: record.module_name,
        status: record.status as ImportJobStatus,
        recordsImported: record.imported_rows,
        completedAt: new Date(record.completed_at),
        importedBy: {
          id: record.imported_by,
          name: 'Unknown', // Would need join to users table
        },
      }));
    } catch (error) {
      console.error('Failed to retrieve import history:', error);
      return [];
    }
  }

  /**
   * Store import job in database
   * @private
   */
  private async storeImportHistory(job: ImportJob): Promise<void> {
    try {
      await this.knex('import_history').insert({
        job_id: job.jobId,
        session_id: job.sessionId,
        module_name: job.moduleName,
        status: job.status,
        total_rows: job.totalRows,
        imported_rows: job.importedRows,
        error_rows: job.errorRows,
        warning_count: job.warningCount,
        started_at: job.startedAt,
        can_rollback: job.canRollback,
        imported_by: job.importedBy,
        file_name: job.fileName,
        file_size_bytes: job.fileSize,
        created_at: job.createdAt,
        updated_at: job.updatedAt,
      });
    } catch (error) {
      console.error('Failed to store import history:', error);
      // Don't throw - allow import to continue
    }
  }

  /**
   * Update import job in database
   * @private
   */
  private async updateImportHistory(job: ImportJob): Promise<void> {
    try {
      await this.knex('import_history').where('job_id', job.jobId).update({
        status: job.status,
        imported_rows: job.importedRows,
        error_rows: job.errorRows,
        completed_at: job.completedAt,
        duration_ms: job.durationMs,
        error_message: job.errorMessage,
        updated_at: job.updatedAt,
      });
    } catch (error) {
      console.error('Failed to update import history:', error);
      // Don't throw - allow import to continue
    }
  }
}
