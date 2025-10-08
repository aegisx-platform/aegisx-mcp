import * as ExcelJS from 'exceljs';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PDFMakeService, PdfExportField } from './pdfmake.service';


export interface ExportField {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'json';
  format?: (value: any) => string;
}

export interface PdfOptions {
  template?: 'standard' | 'professional' | 'minimal' | 'custom';
  pageSize?: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
  subtitle?: string;
  showSummary?: boolean;
  groupBy?: string;
  logo?: string;
  preview?: boolean;
}

export interface ExportOptions {
  data: any[];
  fields?: ExportField[];
  filename?: string;
  title?: string;
  metadata?: {
    exportedBy?: string;
    exportedAt?: Date;
    filters?: Record<string, any>;
    totalRecords?: number;
  };
  pdfOptions?: PdfOptions;
}

export class ExportService {
  private readonly tempDir: string;
  private readonly pdfService: PDFMakeService;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'aegisx-exports');
    this.pdfService = new PDFMakeService();
    this.ensureTempDir();
  }

  /**
   * Export data to CSV format
   */
  async exportToCsv(options: ExportOptions): Promise<Buffer> {
    const { data, fields, filename = 'export.csv' } = options;

    return new Promise((resolve, reject) => {
      const tempFile = path.join(this.tempDir, `temp-${Date.now()}.csv`);
      const csvStream = csv.format({ headers: true });
      const writeStream = fs.createWriteStream(tempFile);

      csvStream.pipe(writeStream);

      // Prepare headers and data
      const headers = this.getHeaders(fields, data);
      const processedData = this.processDataForExport(data, fields);

      // Write data
      processedData.forEach((row) => csvStream.write(row));
      csvStream.end();

      writeStream.on('finish', () => {
        const buffer = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile); // Clean up temp file
        resolve(buffer);
      });

      writeStream.on('error', reject);
    });
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(options: ExportOptions): Promise<Buffer> {
    const {
      data,
      fields,
      filename = 'export.xlsx',
      title = 'Data Export',
      metadata,
    } = options;

    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = metadata?.exportedBy || 'AegisX System';
    workbook.created = metadata?.exportedAt || new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Data');

    // Add title if provided
    if (title) {
      worksheet.addRow([title]);
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.addRow([]); // Empty row
    }

    // Add metadata if provided
    if (metadata) {
      if (metadata.exportedAt) {
        worksheet.addRow(['Exported:', metadata.exportedAt.toISOString()]);
      }
      if (metadata.exportedBy) {
        worksheet.addRow(['Exported by:', metadata.exportedBy]);
      }
      if (metadata.totalRecords) {
        worksheet.addRow(['Total records:', metadata.totalRecords]);
      }
      if (metadata.filters && Object.keys(metadata.filters).length > 0) {
        worksheet.addRow([
          'Filters applied:',
          JSON.stringify(metadata.filters),
        ]);
      }
      worksheet.addRow([]); // Empty row
    }

    // Prepare headers and data
    const headers = this.getHeaders(fields, data);
    const processedData = this.processDataForExport(data, fields);

    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3F2FD' },
    };

    // Add data rows
    processedData.forEach((row) => {
      const dataRow = worksheet.addRow(Object.values(row));

      // Format cells based on field types
      if (fields) {
        fields.forEach((field, index) => {
          const cell = dataRow.getCell(index + 1);

          switch (field.type) {
            case 'number':
              cell.numFmt = '#,##0.00';
              break;
            case 'date':
              cell.numFmt = 'dd/mm/yyyy';
              break;
            case 'boolean':
              cell.value = cell.value ? 'Yes' : 'No';
              break;
          }
        });
      }
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      const lengths = column.values?.map((v) =>
        v ? v.toString().length : 10,
      ) || [10];
      const maxLength = Math.max(
        ...lengths.filter((v) => typeof v === 'number'),
      );
      column.width = Math.min(maxLength + 2, 50);
    });

    // Add borders to data range
    const dataRange = `A${title ? 4 : 1}:${String.fromCharCode(65 + headers.length - 1)}${worksheet.rowCount}`;
    worksheet.getCell(dataRange).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  /**
   * Export data to PDF format using PDFMakeService
   */
  async exportToPdf(options: ExportOptions): Promise<Buffer> {
    const {
      data,
      fields,
      filename = 'export.pdf',
      title = 'Data Export',
      metadata,
      pdfOptions,
    } = options;

    // Convert ExportField[] to PdfExportField[]
    const pdfFields: PdfExportField[] | undefined = fields?.map(field => ({
      key: field.key,
      label: field.label,
      type: field.type,
      format: field.format
    }));

    // Use PDFMakeService for advanced PDF generation
    return await this.pdfService.generatePdf({
      data,
      fields: pdfFields,
      title,
      subtitle: pdfOptions?.subtitle,
      metadata,
      template: pdfOptions?.template || 'professional',
      pageSize: pdfOptions?.pageSize || 'A4',
      orientation: pdfOptions?.orientation,
      showSummary: pdfOptions?.showSummary,
      groupBy: pdfOptions?.groupBy,
      logo: pdfOptions?.logo,
      preview: pdfOptions?.preview
    });
  }

  /**
   * Get headers from fields or data
   */
  private getHeaders(fields: ExportField[] | undefined, data: any[]): string[] {
    if (fields && fields.length > 0) {
      return fields.map((field) => field.label);
    }

    if (data.length > 0) {
      return Object.keys(data[0]);
    }

    return [];
  }

  /**
   * Process data for export based on field definitions
   */
  private processDataForExport(data: any[], fields?: ExportField[]): any[] {
    if (!fields || fields.length === 0) {
      return data;
    }

    return data.map((item) => {
      const processedItem: any = {};

      fields.forEach((field) => {
        let value = item[field.key];

        // Apply custom formatter if provided
        if (field.format && typeof field.format === 'function') {
          value = field.format(value);
        } else {
          // Apply default formatting based on type
          switch (field.type) {
            case 'date':
              if (value instanceof Date) {
                value = value.toISOString().split('T')[0];
              } else if (typeof value === 'string') {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  value = date.toISOString().split('T')[0];
                }
              }
              break;
            case 'boolean':
              value = value ? 'Yes' : 'No';
              break;
            case 'json':
              if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
              }
              break;
          }
        }

        processedItem[field.label] = value;
      });

      return processedItem;
    });
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
   * Clean up temp files older than 1 hour
   */
  async cleanup(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup export temp files:', error);
    }
  }
}
