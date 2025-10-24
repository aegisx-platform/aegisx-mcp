/**
 * Base Import Service
 * Generic service for bulk data import functionality
 * Modules extend this and provide configuration instead of reimplementing logic
 */

import { Knex } from 'knex';
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import {
  ImportModuleConfig,
  ImportFieldConfig,
  ImportSession,
  ImportValidationError,
  ImportRowValidation,
  ImportValidationSummary,
  ImportValidationSeverity,
  ImportJobData,
  ImportJobStatus,
  ImportTemplateOptions,
  ImportValidationRequest,
  ImportValidationResponse,
  ImportExecutionRequest,
  ImportExecutionResponse,
  ImportJobStatusResponse,
  FieldValidator,
} from './import-config.interface';

/**
 * Base class for module import services
 * Generic type T represents the entity type being imported
 */
export abstract class BaseImportService<T> {
  protected readonly config: ImportModuleConfig<T>;
  protected readonly knex: Knex;

  // In-memory storage (can be upgraded to Redis)
  private sessions: Map<string, ImportSession> = new Map();
  private jobs: Map<string, ImportJobData> = new Map();

  constructor(knex: Knex, config: ImportModuleConfig<T>) {
    this.knex = knex;
    this.config = config;

    // Set defaults
    this.config.maxRows = config.maxRows || 10000;
    this.config.allowWarnings = config.allowWarnings ?? true;
    this.config.sessionExpirationMinutes = config.sessionExpirationMinutes || 30;
    this.config.batchSize = config.batchSize || 100;
  }

  /**
   * Generate Excel/CSV template with headers and example data
   */
  async generateTemplate(options: ImportTemplateOptions): Promise<Buffer> {
    const { format, includeExamples = true, exampleRowCount = 3 } = options;

    // Build headers from field configurations
    const headers = this.config.fields.map((field) => field.label);

    // Build example rows if requested
    const rows: any[][] = [];
    if (includeExamples) {
      for (let i = 0; i < exampleRowCount; i++) {
        const row = this.config.fields.map((field) =>
          this.generateExampleValue(field, i),
        );
        rows.push(row);
      }
    }

    // Generate file based on format
    if (format === 'excel') {
      return this.generateExcelTemplate(headers, rows);
    } else {
      return this.generateCsvTemplate(headers, rows);
    }
  }

  /**
   * Generate example value for a field
   */
  private generateExampleValue(field: ImportFieldConfig, index: number): any {
    // Use custom generator if provided
    if (field.exampleGenerator) {
      return field.exampleGenerator();
    }

    // Use default example if provided
    if (field.defaultExample !== undefined) {
      return field.defaultExample;
    }

    // Generate based on type
    switch (field.type) {
      case 'email':
        return `example${index + 1}@example.com`;
      case 'string':
        return `Example ${field.label} ${index + 1}`;
      case 'number':
        return (index + 1) * 10;
      case 'boolean':
        return index % 2 === 0 ? 'Yes' : 'No';
      case 'date': {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date.toISOString().split('T')[0];
      }
      case 'uuid':
        return uuidv4();
      case 'url':
        return `https://example.com/${field.name}${index + 1}`;
      default:
        return '';
    }
  }

  /**
   * Generate Excel template
   */
  private generateExcelTemplate(
    headers: string[],
    rows: any[][],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create data array (headers + rows)
        const data = [headers, ...rows];

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Set column widths
        const colWidths = headers.map(() => ({ wch: 20 }));
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          `${this.config.displayName} Template`,
        );

        // Generate buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate CSV template
   */
  private generateCsvTemplate(
    headers: string[],
    rows: any[][],
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      // Build CSV content
      const lines: string[] = [];

      // Add headers
      lines.push(headers.map((h) => `"${h}"`).join(','));

      // Add rows
      rows.forEach((row) => {
        lines.push(row.map((cell) => `"${cell}"`).join(','));
      });

      const csvContent = lines.join('\n');
      resolve(Buffer.from(csvContent, 'utf-8'));
    });
  }

  /**
   * Validate uploaded file
   */
  async validateFile(
    request: ImportValidationRequest,
  ): Promise<ImportValidationResponse> {
    const { file, fileName, fileType } = request;

    // Parse file
    const rawRows = await this.parseFile(file, fileType);

    // Check max rows limit
    if (rawRows.length > this.config.maxRows!) {
      throw new Error(
        `File contains ${rawRows.length} rows, but maximum allowed is ${this.config.maxRows}`,
      );
    }

    // Validate each row
    const validatedRows: ImportRowValidation[] = [];
    for (let i = 0; i < rawRows.length; i++) {
      const validation = await this.validateRow(rawRows[i], i);
      validatedRows.push(validation);
    }

    // Run custom validation if provided
    if (this.config.customValidation) {
      const customErrors = await this.config.customValidation(rawRows);
      customErrors.forEach((errors, rowIndex) => {
        if (validatedRows[rowIndex]) {
          validatedRows[rowIndex].errors.push(...errors);
          validatedRows[rowIndex].isValid =
            validatedRows[rowIndex].errors.filter(
              (e) => e.severity === ImportValidationSeverity.ERROR,
            ).length === 0;
        }
      });
    }

    // Calculate summary
    const summary = this.calculateSummary(validatedRows);

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + this.config.sessionExpirationMinutes!,
    );

    const session: ImportSession = {
      sessionId,
      fileName,
      fileType,
      uploadedAt: new Date(),
      validatedRows,
      summary,
      expiresAt,
    };

    this.sessions.set(sessionId, session);

    // Schedule session cleanup
    setTimeout(
      () => {
        this.sessions.delete(sessionId);
      },
      this.config.sessionExpirationMinutes! * 60 * 1000,
    );

    return {
      sessionId,
      fileName,
      summary,
      errors: validatedRows.filter((r) => !r.isValid),
      canProceed: summary.canProceed,
      expiresAt,
    };
  }

  /**
   * Parse Excel or CSV file
   */
  private async parseFile(
    file: Buffer,
    fileType: 'excel' | 'csv',
  ): Promise<any[]> {
    if (fileType === 'excel') {
      return this.parseExcelFile(file);
    } else {
      return this.parseCsvFile(file);
    }
  }

  /**
   * Parse Excel file
   */
  private parseExcelFile(file: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const workbook = XLSX.read(file, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON (will use first row as headers)
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        // Map headers back to field names
        const mappedData = data.map((row: any) => {
          const mappedRow: any = {};
          this.config.fields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(row, field.label)) {
              mappedRow[field.name] = row[field.label];
            }
          });
          return mappedRow;
        });

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Parse CSV file
   */
  private parseCsvFile(file: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      const stream = Readable.from(file);

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          // Map headers to field names
          const mappedRow: any = {};
          this.config.fields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(row, field.label)) {
              mappedRow[field.name] = row[field.label];
            }
          });
          rows.push(mappedRow);
        })
        .on('end', () => resolve(rows))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Validate a single row
   */
  private async validateRow(
    row: any,
    index: number,
  ): Promise<ImportRowValidation> {
    const errors: ImportValidationError[] = [];
    const warnings: ImportValidationError[] = [];

    // Validate each field
    for (const field of this.config.fields) {
      const value = row[field.name];
      const fieldErrors = await this.validateField(field, value, row, index);

      fieldErrors.forEach((error) => {
        if (error.severity === ImportValidationSeverity.ERROR) {
          errors.push(error);
        } else if (error.severity === ImportValidationSeverity.WARNING) {
          warnings.push(error);
        }
      });
    }

    // Run custom row validator if provided
    if (this.config.rowValidator) {
      const customErrors = this.config.rowValidator(row, index);
      customErrors.forEach((error) => {
        if (error.severity === ImportValidationSeverity.ERROR) {
          errors.push(error);
        } else {
          warnings.push(error);
        }
      });
    }

    return {
      row: index + 1,
      isValid: errors.length === 0,
      errors,
      warnings,
      data: row,
    };
  }

  /**
   * Validate a single field
   */
  private async validateField(
    field: ImportFieldConfig,
    value: any,
    row: any,
    index: number,
  ): Promise<ImportValidationError[]> {
    const errors: ImportValidationError[] = [];

    // Apply transformer if provided
    const transformedValue = field.transformer
      ? field.transformer(value, row)
      : value;

    // Check required
    if (field.required && this.isEmpty(transformedValue)) {
      errors.push({
        field: field.name,
        message:
          field.errorMessages?.required || `${field.label} is required`,
        code: 'REQUIRED_FIELD',
        severity: ImportValidationSeverity.ERROR,
        value: transformedValue,
      });
      return errors; // Skip other validations if required field is missing
    }

    // Skip other validations if value is empty and not required
    if (!field.required && this.isEmpty(transformedValue)) {
      return errors;
    }

    // Type validation
    const typeError = this.validateFieldType(field, transformedValue);
    if (typeError) {
      errors.push(typeError);
    }

    // Length validation for strings
    if (
      field.type === 'string' &&
      field.maxLength &&
      String(transformedValue).length > field.maxLength
    ) {
      errors.push({
        field: field.name,
        message: `${field.label} must be at most ${field.maxLength} characters`,
        code: 'MAX_LENGTH_EXCEEDED',
        severity: ImportValidationSeverity.ERROR,
        value: transformedValue,
      });
    }

    // Range validation for numbers
    if (field.type === 'number') {
      const numValue = Number(transformedValue);
      if (field.minValue !== undefined && numValue < field.minValue) {
        errors.push({
          field: field.name,
          message: `${field.label} must be at least ${field.minValue}`,
          code: 'MIN_VALUE_NOT_MET',
          severity: ImportValidationSeverity.ERROR,
          value: transformedValue,
        });
      }
      if (field.maxValue !== undefined && numValue > field.maxValue) {
        errors.push({
          field: field.name,
          message: `${field.label} must be at most ${field.maxValue}`,
          code: 'MAX_VALUE_EXCEEDED',
          severity: ImportValidationSeverity.ERROR,
          value: transformedValue,
        });
      }
    }

    // Enum validation
    if (field.enumValues && !field.enumValues.includes(transformedValue)) {
      errors.push({
        field: field.name,
        message: `${field.label} must be one of: ${field.enumValues.join(', ')}`,
        code: 'INVALID_ENUM_VALUE',
        severity: ImportValidationSeverity.ERROR,
        value: transformedValue,
      });
    }

    // Custom validators
    if (field.validators) {
      for (const validator of field.validators) {
        const validationError = await validator(transformedValue, row, index);
        if (validationError) {
          errors.push(validationError);
        }
      }
    }

    return errors;
  }

  /**
   * Validate field type
   */
  private validateFieldType(
    field: ImportFieldConfig,
    value: any,
  ): ImportValidationError | null {
    const strValue = String(value).trim();

    switch (field.type) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) {
          return {
            field: field.name,
            message:
              field.errorMessages?.invalid ||
              `${field.label} must be a valid email`,
            code: 'INVALID_EMAIL',
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
        break;
      }

      case 'number':
        if (isNaN(Number(value))) {
          return {
            field: field.name,
            message:
              field.errorMessages?.invalid ||
              `${field.label} must be a valid number`,
            code: 'INVALID_NUMBER',
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
        break;

      case 'boolean': {
        const validBooleans = ['true', 'false', 'yes', 'no', '1', '0'];
        if (!validBooleans.includes(strValue.toLowerCase())) {
          return {
            field: field.name,
            message:
              field.errorMessages?.invalid ||
              `${field.label} must be a valid boolean (Yes/No, True/False, 1/0)`,
            code: 'INVALID_BOOLEAN',
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
        break;
      }

      case 'date': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return {
            field: field.name,
            message:
              field.errorMessages?.invalid ||
              `${field.label} must be a valid date`,
            code: 'INVALID_DATE',
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
        break;
      }

      case 'uuid': {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(strValue)) {
          return {
            field: field.name,
            message:
              field.errorMessages?.invalid ||
              `${field.label} must be a valid UUID`,
            code: 'INVALID_UUID',
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
        break;
      }

      case 'url':
        try {
          new URL(strValue);
        } catch {
          return {
            field: field.name,
            message:
              field.errorMessages?.invalid ||
              `${field.label} must be a valid URL`,
            code: 'INVALID_URL',
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
        break;
    }

    return null;
  }

  /**
   * Check if value is empty
   */
  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary(
    validatedRows: ImportRowValidation[],
  ): ImportValidationSummary {
    const totalRows = validatedRows.length;
    const validRows = validatedRows.filter((r) => r.isValid).length;
    const invalidRows = totalRows - validRows;

    const totalErrors = validatedRows.reduce(
      (sum, r) => sum + r.errors.length,
      0,
    );
    const totalWarnings = validatedRows.reduce(
      (sum, r) => sum + r.warnings.length,
      0,
    );

    const canProceed =
      invalidRows === 0 && (this.config.allowWarnings || totalWarnings === 0);

    return {
      totalRows,
      validRows,
      invalidRows,
      totalErrors,
      totalWarnings,
      canProceed,
    };
  }

  /**
   * Execute import from validated session
   */
  async executeImport(
    request: ImportExecutionRequest,
  ): Promise<ImportExecutionResponse> {
    const { sessionId, skipWarnings = false } = request;

    // Get session
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found or expired');
    }

    // Check if can proceed
    if (!session.summary.canProceed && !skipWarnings) {
      throw new Error('Cannot proceed with import due to validation errors');
    }

    // Create job
    const jobId = uuidv4();
    const validRows = session.validatedRows.filter((r) => r.isValid);

    const job: ImportJobData = {
      jobId,
      sessionId,
      status: ImportJobStatus.PENDING,
      progress: 0,
      totalRecords: validRows.length,
      processedRecords: 0,
      successCount: 0,
      failedCount: 0,
      startedAt: new Date(),
    };

    this.jobs.set(jobId, job);

    // Start background processing
    this.processImportJob(jobId, validRows).catch((error) => {
      job.status = ImportJobStatus.FAILED;
      job.error = error.message;
      job.completedAt = new Date();
    });

    return {
      jobId,
      status: ImportJobStatus.PENDING,
      message: 'Import job started',
    };
  }

  /**
   * Process import job in background
   */
  private async processImportJob(
    jobId: string,
    validRows: ImportRowValidation[],
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = ImportJobStatus.PROCESSING;

      // Transform rows to entity format
      const transformedRows = validRows.map((r) => {
        if (this.config.rowTransformer) {
          return this.config.rowTransformer(r.data);
        }
        return r.data as Partial<T>;
      });

      // Run pre-insert hook if provided
      if (this.config.preInsertHook) {
        await this.config.preInsertHook(transformedRows);
      }

      // Insert in batches
      const results: T[] = [];
      const batchSize = this.config.batchSize || 100;

      for (let i = 0; i < transformedRows.length; i += batchSize) {
        const batch = transformedRows.slice(i, i + batchSize);

        try {
          const inserted = await this.insertBatch(batch);
          results.push(...inserted);
          job.successCount += inserted.length;
        } catch (error) {
          job.failedCount += batch.length;
          if (this.config.errorHandler) {
            batch.forEach((row, idx) => {
              this.config.errorHandler!(
                error as Error,
                row,
                i + idx,
              );
            });
          }
        }

        job.processedRecords = Math.min(
          i + batchSize,
          transformedRows.length,
        );
        job.progress = Math.round(
          (job.processedRecords / job.totalRecords) * 100,
        );
      }

      // Run post-insert hook if provided
      if (this.config.postInsertHook) {
        await this.config.postInsertHook(results);
      }

      job.status = ImportJobStatus.COMPLETED;
      job.completedAt = new Date();
      job.results = results;
    } catch (error) {
      job.status = ImportJobStatus.FAILED;
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
    }
  }

  /**
   * Insert batch of records (must be implemented by subclass)
   */
  protected abstract insertBatch(batch: Partial<T>[]): Promise<T[]>;

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ImportJobStatusResponse> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    return {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      failedCount: job.failedCount,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
    };
  }

  /**
   * Cancel import job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (
      job.status === ImportJobStatus.COMPLETED ||
      job.status === ImportJobStatus.FAILED
    ) {
      throw new Error('Cannot cancel completed or failed job');
    }

    job.status = ImportJobStatus.CANCELLED;
    job.completedAt = new Date();
  }

  /**
   * Clean up expired sessions and completed jobs
   */
  cleanup(): void {
    const now = new Date();

    // Clean up expired sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    });

    // Clean up old jobs (keep for 1 hour after completion)
    this.jobs.forEach((job, jobId) => {
      if (
        job.completedAt &&
        now.getTime() - job.completedAt.getTime() > 3600000
      ) {
        this.jobs.delete(jobId);
      }
    });
  }
}
