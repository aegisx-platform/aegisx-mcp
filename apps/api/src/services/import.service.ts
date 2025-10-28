import * as ExcelJS from 'exceljs';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ImportField {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean';
  required?: boolean;
  validate?: (value: any) => { valid: boolean; error?: string };
  transform?: (value: any) => any;
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  data: any[];
  sessionId?: string;
}

export interface ImportOptions {
  fields: ImportField[];
  skipHeaderRows?: number; // How many rows to skip before data starts
  maxRows?: number;
  allowPartialData?: boolean;
}

export class ImportService {
  private readonly tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'aegisx-imports');
    this.ensureTempDir();
  }

  /**
   * Parse and validate Excel file
   */
  async parseExcel(
    buffer: Buffer,
    options: ImportOptions,
  ): Promise<ImportValidationResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1); // First sheet
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    return this.parseWorksheet(worksheet, options);
  }

  /**
   * Parse and validate CSV file
   */
  async parseCsv(
    buffer: Buffer,
    options: ImportOptions,
  ): Promise<ImportValidationResult> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      const stream = csv.parseString(buffer.toString(), { headers: true });

      stream.on('data', (row) => rows.push(row));
      stream.on('end', () => {
        try {
          const result = this.validateRows(rows, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }

  /**
   * Parse worksheet with intelligent header detection
   */
  private parseWorksheet(
    worksheet: ExcelJS.Worksheet,
    options: ImportOptions,
  ): ImportValidationResult {
    const rows: any[] = [];
    const { fields } = options;

    // Find header row by looking for field labels
    let headerRowIndex = -1;
    let headerRow: ExcelJS.Row | null = null;

    worksheet.eachRow((row, rowNumber) => {
      // Try to find header row by matching field labels
      const cellValues = row.values as any[];
      const hasAllHeaders = fields.every((field) =>
        cellValues.some(
          (cell) =>
            cell &&
            this.normalizeString(cell.toString()) ===
              this.normalizeString(field.label),
        ),
      );

      if (hasAllHeaders && headerRowIndex === -1) {
        headerRowIndex = rowNumber;
        headerRow = row;
      }
    });

    if (headerRowIndex === -1 || !headerRow) {
      throw new Error(
        'Could not find header row. Template structure may have changed.',
      );
    }

    // Build column mapping from header row
    const columnMapping = new Map<number, string>();
    const headerValues = headerRow.values as any[];

    headerValues.forEach((cell, colIndex) => {
      if (cell) {
        const normalizedCell = this.normalizeString(cell.toString());
        const field = fields.find(
          (f) => this.normalizeString(f.label) === normalizedCell,
        );
        if (field) {
          columnMapping.set(colIndex, field.key);
        }
      }
    });

    // Parse data rows (after header row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= headerRowIndex) return; // Skip header and metadata rows

      const rowData: any = {};
      let hasData = false;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const fieldKey = columnMapping.get(colNumber);
        if (fieldKey) {
          const value = this.getCellValue(cell);
          if (value !== null && value !== undefined && value !== '') {
            hasData = true;
          }
          rowData[fieldKey] = value;
        }
      });

      // Only add rows that have at least one non-empty cell
      if (hasData) {
        rowData._rowNumber = rowNumber; // Track original row number for error reporting
        rows.push(rowData);
      }
    });

    return this.validateRows(rows, options);
  }

  /**
   * Get cell value with type conversion
   */
  private getCellValue(cell: ExcelJS.Cell): any {
    if (!cell || cell.value === null || cell.value === undefined) {
      return null;
    }

    // Handle formula cells
    if (cell.type === ExcelJS.ValueType.Formula) {
      return (cell.value as any).result;
    }

    // Handle rich text
    if (cell.type === ExcelJS.ValueType.RichText) {
      return (cell.value as any).richText.map((rt: any) => rt.text).join('');
    }

    // Handle date
    if (cell.type === ExcelJS.ValueType.Date) {
      return cell.value;
    }

    // Handle boolean
    if (cell.type === ExcelJS.ValueType.Boolean) {
      return cell.value;
    }

    // Handle hyperlink
    if (cell.type === ExcelJS.ValueType.Hyperlink) {
      return (cell.value as any).text;
    }

    return cell.value;
  }

  /**
   * Validate rows against field definitions
   */
  private validateRows(
    rows: any[],
    options: ImportOptions,
  ): ImportValidationResult {
    const { fields, maxRows = 10000 } = options;
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const validData: any[] = [];

    // Check row limit
    if (rows.length > maxRows) {
      throw new Error(
        `File contains ${rows.length} rows, maximum allowed is ${maxRows}`,
      );
    }

    rows.forEach((row, index) => {
      const rowNumber = row._rowNumber || index + 1;
      const rowErrors: ValidationError[] = [];
      const processedRow: any = {};

      fields.forEach((field) => {
        let value = row[field.key];

        // Check required fields
        if (
          field.required &&
          (value === null || value === undefined || value === '')
        ) {
          rowErrors.push({
            row: rowNumber,
            field: field.key,
            value,
            error: `${field.label} is required`,
            severity: 'error',
          });
          return;
        }

        // Skip validation for empty optional fields
        if (
          !field.required &&
          (value === null || value === undefined || value === '')
        ) {
          processedRow[field.key] = null;
          return;
        }

        // Type conversion and validation
        if (value !== null && value !== undefined) {
          try {
            // Convert boolean strings (Yes/No, True/False, 1/0)
            if (field.type === 'boolean') {
              const strValue = String(value).trim().toLowerCase();
              if (['yes', 'true', '1', 'y', 't'].includes(strValue)) {
                value = true;
              } else if (['no', 'false', '0', 'n', 'f'].includes(strValue)) {
                value = false;
              } else {
                rowErrors.push({
                  row: rowNumber,
                  field: field.key,
                  value,
                  error: `${field.label} must be Yes/No, True/False, or 1/0`,
                  severity: 'error',
                });
                return;
              }
            }

            // Convert numbers
            if (field.type === 'number') {
              const numValue = Number(value);
              if (isNaN(numValue)) {
                rowErrors.push({
                  row: rowNumber,
                  field: field.key,
                  value,
                  error: `${field.label} must be a valid number`,
                  severity: 'error',
                });
                return;
              }
              value = numValue;
            }

            // Convert dates
            if (field.type === 'date') {
              if (!(value instanceof Date)) {
                const dateValue = new Date(value);
                if (isNaN(dateValue.getTime())) {
                  rowErrors.push({
                    row: rowNumber,
                    field: field.key,
                    value,
                    error: `${field.label} must be a valid date`,
                    severity: 'error',
                  });
                  return;
                }
                value = dateValue;
              }
            }

            // Apply custom transform
            if (field.transform) {
              value = field.transform(value);
            }

            // Apply custom validation
            if (field.validate) {
              const validation = field.validate(value);
              if (!validation.valid) {
                rowErrors.push({
                  row: rowNumber,
                  field: field.key,
                  value,
                  error: validation.error || 'Validation failed',
                  severity: 'error',
                });
                return;
              }
            }

            processedRow[field.key] = value;
          } catch (error) {
            rowErrors.push({
              row: rowNumber,
              field: field.key,
              value,
              error: `Error processing field: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'error',
            });
          }
        }
      });

      if (rowErrors.length === 0) {
        validData.push(processedRow);
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      valid: errors.length === 0,
      totalRows: rows.length,
      validRows: validData.length,
      invalidRows: rows.length - validData.length,
      errors,
      warnings,
      data: validData,
    };
  }

  /**
   * Normalize string for comparison (trim, lowercase, remove special chars)
   */
  private normalizeString(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  /**
   * Ensure temp directory exists
   */
  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Save validation result to session (for later use in execute)
   */
  async saveValidationSession(result: ImportValidationResult): Promise<string> {
    const sessionId = `import-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const sessionFile = path.join(this.tempDir, `${sessionId}.json`);

    await fs.promises.writeFile(
      sessionFile,
      JSON.stringify(result, null, 2),
      'utf-8',
    );

    // Set expiration (1 hour)
    setTimeout(
      () => {
        this.cleanupSession(sessionId);
      },
      60 * 60 * 1000,
    );

    return sessionId;
  }

  /**
   * Load validation session
   */
  async loadValidationSession(
    sessionId: string,
  ): Promise<ImportValidationResult> {
    const sessionFile = path.join(this.tempDir, `${sessionId}.json`);

    if (!fs.existsSync(sessionFile)) {
      throw new Error('Import session not found or expired');
    }

    const content = await fs.promises.readFile(sessionFile, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Cleanup session file
   */
  private async cleanupSession(sessionId: string): Promise<void> {
    const sessionFile = path.join(this.tempDir, `${sessionId}.json`);
    if (fs.existsSync(sessionFile)) {
      await fs.promises.unlink(sessionFile);
    }
  }
}
