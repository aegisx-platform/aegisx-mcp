import * as fs from 'fs';
import * as path from 'path';
import { FontManagerService } from './font-manager.service';

// Use server-side PdfPrinter instead of client-side PdfMake
const PdfPrinter = require('pdfmake');

export interface PdfExportField {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'json';
  format?: (value: any) => string;
  width?: number | 'auto' | '*';
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export interface PdfExportOptions {
  data: any[];
  fields?: PdfExportField[];
  title?: string;
  subtitle?: string;
  metadata?: {
    exportedBy?: string;
    exportedAt?: Date;
    filters?: Record<string, any>;
    totalRecords?: number;
  };
  template?: 'standard' | 'professional' | 'minimal' | 'custom';
  customTemplate?: PdfTemplate;
  pageSize?: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
  showSummary?: boolean;
  groupBy?: string;
  logo?: string; // Base64 or path
  preview?: boolean; // For server-side preview generation
}

export interface PdfTemplate {
  name: string;
  layout: {
    name: string;
    config?: any;
  };
  styles: Record<string, any>;
  pageMargins: [number, number, number, number];
  defaultFont?: string;
  header?: (currentPage: number, pageCount: number, pageSize: any) => any;
  footer?: (currentPage: number, pageCount: number, pageSize: any) => any;
  watermark?: {
    text: string;
    color?: string;
    opacity?: number;
    bold?: boolean;
    italics?: boolean;
  };
}

export interface PdfPreviewResponse {
  success: boolean;
  previewUrl?: string;
  documentDefinition?: any;
  error?: string;
}

export class PDFMakeService {
  private readonly templates: Map<string, PdfTemplate>;
  private readonly previewDir: string;
  private fontManager: FontManagerService;
  private fontsInitialized: boolean = false;

  constructor() {
    this.templates = new Map();
    this.previewDir = path.join(process.cwd(), 'temp', 'pdf-previews');
    this.fontManager = new FontManagerService();
    this.initializeTemplates();
    this.ensurePreviewDir();
    this.initializeFonts();
  }

  /**
   * Initialize fonts asynchronously
   */
  private async initializeFonts(): Promise<void> {
    try {
      await this.fontManager.initialize();

      // Fonts will be provided to PdfPrinter when creating documents

      this.fontsInitialized = true;
      console.log('PDFMake fonts initialized successfully');

      // Log font status for debugging
      const fontStatus = this.fontManager.getFontStatus();
      console.log('Font Status:', {
        loaded: fontStatus.loaded,
        thaiFontsAvailable: fontStatus.thaiFontsAvailable
      });

    } catch (error) {
      console.warn('Font initialization failed, using defaults:', error.message);
      this.fontsInitialized = true; // Continue with default fonts
    }
  }

  /**
   * Generate PDF using PDFMake with advanced features
   */
  async generatePdf(options: PdfExportOptions): Promise<Buffer> {
    try {
      // Ensure fonts are initialized
      await this.waitForFonts();

      const docDefinition = this.createDocumentDefinition(options);

      return new Promise((resolve, reject) => {
        try {
          // Get fonts for PdfPrinter
          const fonts = this.fontManager.getFontsForPDFMake();

          // Add direct Sarabun font loading from files
          const sarabunDir = path.join(process.cwd(), 'apps', 'api', 'src', 'assets', 'fonts', 'Sarabun');

          try {
            if (fs.existsSync(sarabunDir)) {
              console.log('🔍 Loading Sarabun fonts directly from:', sarabunDir);
              fonts.Sarabun = {
                normal: fs.readFileSync(path.join(sarabunDir, 'Sarabun-Regular.ttf')),
                bold: fs.readFileSync(path.join(sarabunDir, 'Sarabun-Bold.ttf')),
                italics: fs.readFileSync(path.join(sarabunDir, 'Sarabun-Italic.ttf')),
                bolditalics: fs.readFileSync(path.join(sarabunDir, 'Sarabun-BoldItalic.ttf'))
              };
              console.log('✅ Sarabun fonts loaded directly');
            } else {
              console.warn('⚠️ Sarabun directory not found, using Helvetica fallback');
              fonts.Sarabun = {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
              };
            }
          } catch (error) {
            console.error('❌ Failed to load Sarabun fonts:', error.message);
            fonts.Sarabun = {
              normal: 'Helvetica',
              bold: 'Helvetica-Bold',
              italics: 'Helvetica-Oblique',
              bolditalics: 'Helvetica-BoldOblique'
            };
          }

          console.log('🔍 Available fonts for PDF:', Object.keys(fonts));

          const printer = new PdfPrinter(fonts);

          // Create PDF document using server-side approach
          const pdfDoc = printer.createPdfKitDocument(docDefinition);
          const chunks: Buffer[] = [];

          pdfDoc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            resolve(result);
          });

          pdfDoc.on('error', (error: Error) => {
            console.error('PDF document generation error:', error);
            reject(new Error(`PDF generation failed: ${error.message}`));
          });

          // Finalize the PDF
          pdfDoc.end();

        } catch (error) {
          console.error('PDFMake createPdf error:', error);
          reject(new Error(`PDF generation failed: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('PDF generation preparation error:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Generate PDF preview for server-side preview
   */
  async generatePreview(options: PdfExportOptions): Promise<PdfPreviewResponse> {
    try {
      const docDefinition = this.createDocumentDefinition(options);

      // Generate a unique filename for the preview
      const previewId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const previewPath = path.join(this.previewDir, `${previewId}.pdf`);

      return new Promise((resolve) => {
        try {
          // Get fonts for PdfPrinter
          const fonts = this.fontManager.getFontsForPDFMake();
          const printer = new PdfPrinter(fonts);

          // Create PDF document using server-side approach
          const pdfDoc = printer.createPdfKitDocument(docDefinition);
          const chunks: Buffer[] = [];

          pdfDoc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          pdfDoc.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              fs.writeFileSync(previewPath, buffer);
              resolve({
                success: true,
                previewUrl: `/api/pdf-preview/${previewId}`,
                documentDefinition: this.sanitizeDocDefinitionForPreview(docDefinition)
              });
            } catch (writeError) {
              console.error('Preview file write error:', writeError);
              resolve({
                success: false,
                error: `Preview generation failed: ${writeError.message}`
              });
            }
          });

          pdfDoc.on('error', (error: Error) => {
            console.error('Preview PDF creation error:', error);
            resolve({
              success: false,
              error: `Preview creation failed: ${error.message}`
            });
          });

          // Finalize the PDF
          pdfDoc.end();

        } catch (error) {
          console.error('Preview PDF creation error:', error);
          resolve({
            success: false,
            error: `Preview creation failed: ${error.message}`
          });
        }
      });
    } catch (error) {
      console.error('Preview preparation error:', error);
      return {
        success: false,
        error: `Preview preparation failed: ${error.message}`
      };
    }
  }

  /**
   * Get preview file by ID
   */
  getPreviewFile(previewId: string): string | null {
    const previewPath = path.join(this.previewDir, `${previewId}.pdf`);

    if (fs.existsSync(previewPath)) {
      return previewPath;
    }

    return null;
  }

  /**
   * Clean up old preview files (older than 1 hour)
   */
  async cleanupPreviews(): Promise<void> {
    try {
      if (!fs.existsSync(this.previewDir)) {
        return;
      }

      const files = fs.readdirSync(this.previewDir);
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour

      for (const file of files) {
        const filePath = path.join(this.previewDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup preview files:', error);
    }
  }

  /**
   * Create document definition for PDFMake
   */
  private createDocumentDefinition(options: PdfExportOptions): any {
    const {
      data,
      fields,
      title = 'Data Export',
      subtitle,
      metadata,
      template = 'professional',
      customTemplate,
      pageSize = 'A4',
      orientation,
      showSummary = true,
      groupBy,
      logo
    } = options;

    // Get template configuration
    const templateConfig = customTemplate || this.templates.get(template) || this.templates.get('professional')!;

    // Debug log: show which template and styles are being used
    console.log('🔍 PDF Template Debug:', {
      templateName: template,
      templateFound: !!this.templates.get(template),
      usingTemplate: templateConfig.name,
      tableHeaderStyle: templateConfig.styles?.tableHeader,
      tableCellStyle: templateConfig.styles?.tableCell
    });

    // Auto-determine orientation based on field count
    const finalOrientation = orientation || (fields && fields.length > 6 ? 'landscape' : 'portrait');

    // Prepare content
    const content: any[] = [];

    // Add logo if provided
    if (logo) {
      const logoSection = this.createLogoSection(logo);
      if (logoSection) {
        content.push(logoSection);
      }
    }

    // Add title section
    content.push(this.createTitleSection(title, subtitle));

    // Metadata will be added at the bottom of content

    // Add data summary if enabled
    // if (showSummary) {
    //   content.push(this.createSummarySection(data, fields));
    // }

    // Add main data table
    if (groupBy) {
      content.push(...this.createGroupedTable(data, fields, groupBy));
    } else {
      content.push(this.createDataTable(data, fields));
    }

    // Metadata will be added to footer only

    // Determine the best font for the content
    const documentText = this.extractTextFromContent(content);
    const bestFont = this.fontManager.getBestFont(documentText, templateConfig.defaultFont);

    // Force use Sarabun font for better Thai support
    const finalFont = this.fontManager.isFontAvailable('Sarabun') ? 'Sarabun' : bestFont;

    console.log('🔍 PDF Font Debug:', {
      documentText: documentText.substring(0, 100),
      bestFont,
      finalFont,
      availableFonts: this.fontManager.getAvailableFonts(),
      fontStatus: this.fontManager.getFontStatus()
    });

    // Optimize styles for font
    const optimizedStyles = this.optimizeStylesForFont(templateConfig.styles, finalFont);

    // Create document definition with Thai font support
    const docDefinition: any = {
      pageSize: pageSize,
      pageOrientation: finalOrientation,
      pageMargins: templateConfig.pageMargins,
      content: content,
      styles: optimizedStyles,
      defaultStyle: {
        fontSize: this.fontManager.getFontSizeRecommendation('body', finalFont),
        font: finalFont,
        lineHeight: this.fontManager.getLineHeight(finalFont),
      },
    };

    // Debug log: show final styles being used
    console.log('🔍 Final Document Styles:', {
      tableHeaderFinal: optimizedStyles?.tableHeader,
      tableCellFinal: optimizedStyles?.tableCell,
      defaultStyleFont: docDefinition.defaultStyle.font,
      optimizedStylesKeys: Object.keys(optimizedStyles || {})
    });

    // Add header and footer if defined in template
    if (templateConfig.header) {
      docDefinition.header = templateConfig.header;
    }

    if (templateConfig.footer) {
      // Capture variables in closure for footer function
      const capturedMetadata = metadata;
      const capturedShowSummary = showSummary;
      const self = this;

      const originalFooter = templateConfig.footer;
      docDefinition.footer = (currentPage: number, pageCount: number, pageSize: any) => {
        if (typeof originalFooter === 'function') {
          const footerResult = originalFooter(currentPage, pageCount, pageSize);

          // Create export date text for footer
          const exportDateText = capturedMetadata && capturedShowSummary ?
            self.createExportDateText(capturedMetadata) : '';

          // Return footer with columns layout
          return {
            columns: [
              // Left side - empty
              { text: '', width: '*' },
              // Center - page number from original footer
              footerResult,
              // Right side - export date
              {
                text: exportDateText,
                alignment: 'right',
                fontSize: 7,
                color: '#95a5a6',
                width: '*',
                margin: [0, 0, 10, 0]
              }
            ]
          };
        }
        return originalFooter;
      };
    }

    // Add watermark if defined
    if (templateConfig.watermark) {
      docDefinition.watermark = templateConfig.watermark;
    }

    return docDefinition;
  }

  /**
   * Create logo section
   */
  private createLogoSection(logo: string): any {
    // Convert URL to local file path if it's a URL
    let logoPath = logo;
    if (logo && logo.startsWith('http')) {
      // Extract the path from URL like http://localhost:3383/api/assets/logos/aegisx-logo.png
      // Convert to local path: apps/api/src/assets/logos/aegisx-logo.png
      const urlPath = logo.split('/api/assets/')[1];
      if (urlPath) {
        logoPath = path.join(process.cwd(), 'apps', 'api', 'src', 'assets', urlPath);
        console.log(`🔍 Converting logo URL to local path: ${logo} -> ${logoPath}`);

        // Check if file exists
        if (!fs.existsSync(logoPath)) {
          console.warn(`⚠️ Logo file not found at: ${logoPath}`);
          return null; // Don't include logo if file doesn't exist
        }
      }
    }

    return {
      image: logoPath,
      width: 100,
      alignment: 'center',
      margin: [0, 0, 0, 5]
    };
  }

  /**
   * Create title section
   */
  private createTitleSection(title: string, subtitle?: string): any {
    const titleSection: any[] = [
      {
        text: title,
        style: 'documentTitle',
        alignment: 'center',
        margin: [0, 0, 0, 0]
      }
    ];

    if (subtitle) {
      titleSection.push({
        text: subtitle,
        style: 'documentSubtitle',
        alignment: 'center',
        margin: [0, 0, 0, 0]
      });
    } else {
      titleSection[0].margin = [0, 0, 0, 20];
    }

    return titleSection;
  }

  /**
   * Create metadata section for content (table format)
   */
  private createMetadataSection(metadata: PdfExportOptions['metadata']): any {
    const metadataContent: any[] = [];

    if (metadata?.exportedAt) {
      metadataContent.push([
        { text: 'Export Date:', style: 'metadataLabel' },
        {
          text: metadata.exportedAt.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }), style: 'metadataValue'
        }
      ]);
    }

    if (metadata?.exportedBy) {
      metadataContent.push([
        { text: 'Exported By:', style: 'metadataLabel' },
        { text: metadata.exportedBy, style: 'metadataValue' }
      ]);
    }

    if (metadata?.totalRecords) {
      metadataContent.push([
        { text: 'Total Records:', style: 'metadataLabel' },
        { text: metadata.totalRecords.toString(), style: 'metadataValue' }
      ]);
    }

    if (metadataContent.length === 0) return null;

    return {
      style: 'metadataSection',
      table: {
        body: metadataContent,
        widths: ['15%', '85%']
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 20],
    };
  }

  /**
   * Create export date text for footer
   */
  private createExportDateText(metadata: PdfExportOptions['metadata']): string {
    if (!metadata?.exportedAt) return '';

    return `Date: ${metadata.exportedAt.toLocaleString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })}`;
  }

  /**
   * Create summary section
   */
  private createSummarySection(data: any[], fields?: PdfExportField[]): any {
    const summaryData: any[] = [];

    // Basic statistics
    summaryData.push([
      { text: 'Record Count:', style: 'summaryLabel' },
      { text: data.length.toString(), style: 'summaryValue' }
    ]);

    if (fields) {
      summaryData.push([
        { text: 'Fields Exported:', style: 'summaryLabel' },
        { text: fields.length.toString(), style: 'summaryValue' }
      ]);
    }

    // Calculate numeric field statistics if any
    if (fields && data.length > 0) {
      const numericFields = fields.filter(f => f.type === 'number');

      numericFields.forEach(field => {
        const values = data.map(row => row[field.key]).filter(v => v != null && !isNaN(v));
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          summaryData.push([
            { text: `${field.label} (Avg):`, style: 'summaryLabel' },
            { text: avg.toFixed(2), style: 'summaryValue' }
          ]);
        }
      });
    }

    return {
      style: 'summarySection',
      table: {
        body: summaryData,
        widths: ['30%', '70%']
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20]
    };
  }

  /**
   * Create main data table
   */
  private createDataTable(data: any[], fields?: PdfExportField[]): any {
    if (!fields || fields.length === 0) {
      return { text: 'No fields selected for export', style: 'noData' };
    }

    if (data.length === 0) {
      return { text: 'No data available', style: 'noData' };
    }

    // Prepare table headers
    const headers = fields.map(field => ({
      text: field.label,
      style: 'tableHeader'
    }));

    // Debug log: show header structure
    console.log('🔍 Table Headers Debug:', {
      headerCount: headers.length,
      firstHeader: headers[0],
      headerStyles: headers.map(h => ({ text: h.text, style: h.style }))
    });

    // Prepare table body
    const tableBody = [headers];

    // Add data rows
    data.forEach((row, index) => {
      const tableRow = fields.map(field => {
        let value = row[field.key];

        // Apply custom formatting
        if (field.format && typeof field.format === 'function') {
          value = field.format(value);
        } else {
          // Apply default formatting based on type
          value = this.formatCellValue(value, field.type);
        }

        return {
          text: value || '',
          style: 'tableCell'
        };
      });

      tableBody.push(tableRow);
    });

    // Calculate column widths
    const widths = this.calculateColumnWidths(fields, data);

    return {
      style: 'dataTable',
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: tableBody,
        widths: widths
      },
      layout: 'lightHorizontalLines',
      margin: [0, 10, 0, 0]
    };
  }

  /**
   * Create grouped table
   */
  private createGroupedTable(data: any[], fields?: PdfExportField[], groupBy?: string): any[] {
    if (!groupBy || !fields) {
      return [this.createDataTable(data, fields)];
    }

    const groups = this.groupDataBy(data, groupBy);
    const content: any[] = [];

    Object.entries(groups).forEach(([groupValue, groupData]) => {
      // Add group header
      content.push({
        text: `${groupBy}: ${groupValue}`,
        style: 'groupHeader',
        margin: [0, 20, 0, 10]
      });

      // Add group table
      content.push(this.createDataTable(groupData, fields));
    });

    return content;
  }

  /**
   * Group data by field
   */
  private groupDataBy(data: any[], field: string): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const key = item[field] || 'Unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  }

  /**
   * Format cell value based on type
   */
  private formatCellValue(value: any, type?: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          return !isNaN(date.getTime()) ? date.toLocaleDateString() : value;
        }
        break;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value.toString();
      case 'json':
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString();
      default:
        return value.toString();
    }

    return value.toString();
  }

  /**
   * Calculate dynamic column widths
   */
  private calculateColumnWidths(fields: PdfExportField[], data: any[]): any[] {
    return fields.map(field => {
      // Use explicit width if provided
      if (field.width) {
        return field.width;
      }

      // Calculate based on field type and content
      const fieldName = field.key.toLowerCase();

      if (fieldName.includes('id') || fieldName.includes('uuid')) {
        return 60; // IDs are usually shorter
      }

      if (fieldName.includes('description') || fieldName.includes('content') || fieldName.includes('message')) {
        return '*'; // Description fields get remaining space
      }

      if (field.type === 'date') {
        return 80; // Date fields have predictable width
      }

      if (field.type === 'boolean') {
        return 50; // Boolean fields are short
      }

      if (field.type === 'number') {
        return 70; // Number fields are usually medium
      }

      // Default to auto-sizing
      return 'auto';
    });
  }

  /**
   * Sanitize document definition for preview (remove functions)
   */
  private sanitizeDocDefinitionForPreview(docDef: any): any {
    const sanitized = JSON.parse(JSON.stringify(docDef, (key, value) => {
      // Remove functions for JSON serialization
      if (typeof value === 'function') {
        return '[Function]';
      }
      return value;
    }));

    return sanitized;
  }

  /**
   * Ensure preview directory exists
   */
  private ensurePreviewDir(): void {
    if (!fs.existsSync(this.previewDir)) {
      fs.mkdirSync(this.previewDir, { recursive: true });
    }
  }

  /**
   * Initialize predefined templates
   */
  private initializeTemplates(): void {
    // Professional template
    this.templates.set('professional', {
      name: 'Professional',
      layout: {
        name: 'lightHorizontalLines'
      },
      pageMargins: [40, 60, 40, 60],
      styles: {
        documentTitle: {
          fontSize: 18,
          bold: true,
          color: '#2c3e50'
        },
        documentSubtitle: {
          fontSize: 14,
          color: '#7f8c8d'
        },
        metadataSection: {
          fontSize: 9,
          color: '#95a5a6',
          lineHeight: 0.6
        },
        metadataLabel: {
          bold: true,
          fontSize: 9
        },
        metadataValue: {
          fontSize: 9
        },
        summarySection: {
          fontSize: 10,
          color: '#2c3e50'
        },
        summaryLabel: {
          bold: true,
          fontSize: 10
        },
        summaryValue: {
          fontSize: 10
        },
        tableHeader: {
          fontSize: 6,
          bold: true,
          fillColor: '#ecf0f1',
          color: '#2c3e50',
          alignment: 'left'
        },
        tableCell: {
          fontSize: 5,
          color: '#2c3e50',
          alignment: 'left'
        },
        dataTable: {
          margin: [0, 10, 0, 0]
        },
        groupHeader: {
          fontSize: 14,
          bold: true,
          color: '#e74c3c'
        },
        noData: {
          fontSize: 12,
          italics: true,
          color: '#95a5a6',
          alignment: 'center'
        }
      },
      footer: (currentPage: number, pageCount: number) => ({
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        color: '#95a5a6'
      })
    });

    // Minimal template
    this.templates.set('minimal', {
      name: 'Minimal',
      layout: {
        name: 'noBorders'
      },
      pageMargins: [30, 40, 30, 40],
      styles: {
        documentTitle: {
          fontSize: 18,
          bold: true
        },
        documentSubtitle: {
          fontSize: 14
        },
        tableHeader: {
          fontSize: 9,
          bold: true
        },
        tableCell: {
          fontSize: 8
        },
        noData: {
          fontSize: 10,
          italics: true,
          alignment: 'center'
        }
      }
    });

    // Standard template
    this.templates.set('standard', {
      name: 'Standard',
      layout: {
        name: 'headerLineOnly'
      },
      pageMargins: [40, 50, 40, 50],
      styles: {
        documentTitle: {
          fontSize: 20,
          bold: true
        },
        documentSubtitle: {
          fontSize: 14
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          fillColor: '#f8f9fa'
        },
        tableCell: {
          fontSize: 9
        },
        groupHeader: {
          fontSize: 12,
          bold: true
        },
        noData: {
          fontSize: 11,
          italics: true,
          alignment: 'center'
        }
      },
      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage}/${pageCount}`,
        alignment: 'right',
        fontSize: 8,
        margin: [0, 0, 40, 0]
      })
    });
  }

  /**
   * Register custom template
   */
  registerTemplate(template: PdfTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Get template by name
   */
  getTemplate(name: string): PdfTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * Extract text content from document structure for font analysis
   */
  private extractTextFromContent(content: any[]): string {
    let text = '';

    const extractFromObject = (obj: any): void => {
      if (typeof obj === 'string') {
        text += obj + ' ';
      } else if (Array.isArray(obj)) {
        obj.forEach(extractFromObject);
      } else if (obj && typeof obj === 'object') {
        if (obj.text) {
          text += obj.text + ' ';
        }
        Object.values(obj).forEach(extractFromObject);
      }
    };

    content.forEach(extractFromObject);
    return text;
  }

  /**
   * Optimize styles for specific font
   */
  private optimizeStylesForFont(styles: any, fontFamily: string): any {
    if (!styles) return {};

    const optimizedStyles = JSON.parse(JSON.stringify(styles));

    // Apply font to all styles that don't explicitly set a font
    Object.keys(optimizedStyles).forEach(styleName => {
      const style = optimizedStyles[styleName];
      if (style && typeof style === 'object') {
        // Set font if not explicitly defined
        if (!style.font) {
          style.font = fontFamily;
        }

        // Optimize line height for Thai fonts
        if (!style.lineHeight && this.fontManager.isFontAvailable(fontFamily)) {
          style.lineHeight = this.fontManager.getLineHeight(fontFamily);
        }

        // Note: Font size optimization disabled to preserve manual control
        // All fontSize values are explicitly set in template styles
      }
    });

    return optimizedStyles;
  }

  /**
   * Get content type from style name for font size optimization
   */
  private getContentTypeFromStyleName(styleName: string): 'title' | 'body' | 'small' {
    const lowerName = styleName.toLowerCase();

    if (lowerName.includes('title') || lowerName.includes('heading') || lowerName.includes('header')) {
      return 'title';
    }

    if (lowerName.includes('small') || lowerName.includes('caption') || lowerName.includes('footnote')) {
      return 'small';
    }

    return 'body';
  }

  /**
   * Get font manager instance for external use
   */
  getFontManager(): FontManagerService {
    return this.fontManager;
  }

  /**
   * Check if fonts are initialized
   */
  areFontsInitialized(): boolean {
    return this.fontsInitialized;
  }

  /**
   * Wait for fonts to be initialized
   */
  async waitForFonts(): Promise<void> {
    if (this.fontsInitialized) {
      return;
    }

    // Wait up to 5 seconds for fonts to initialize
    const maxWait = 5000;
    const checkInterval = 100;
    let waited = 0;

    while (!this.fontsInitialized && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    if (!this.fontsInitialized) {
      console.warn('Font initialization timeout, proceeding with default fonts');
    }
  }

  /**
   * Get available fonts list
   */
  getAvailableFonts(): string[] {
    return this.fontManager.getAvailableFonts();
  }

  /**
   * Get font status for debugging
   */
  getFontStatus(): any {
    return {
      initialized: this.fontsInitialized,
      ...this.fontManager.getFontStatus()
    };
  }
}
