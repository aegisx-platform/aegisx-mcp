import { Type, Static } from '@sinclair/typebox';

/**
 * PDF Export Field Schema
 */
export const PdfExportFieldSchema = Type.Object({
  key: Type.String({ description: 'Field key/column name' }),
  label: Type.String({ description: 'Display label for the field' }),
  type: Type.Optional(Type.Union([
    Type.Literal('string'),
    Type.Literal('number'),
    Type.Literal('date'),
    Type.Literal('boolean'),
    Type.Literal('json')
  ], { description: 'Field data type for formatting' })),
  format: Type.Optional(Type.String({ description: 'Custom format function (not supported in API)' })),
  width: Type.Optional(Type.Union([
    Type.Number(),
    Type.Literal('auto'),
    Type.Literal('*')
  ], { description: 'Column width specification' })),
  align: Type.Optional(Type.Union([
    Type.Literal('left'),
    Type.Literal('center'),
    Type.Literal('right')
  ], { description: 'Text alignment' })),
  bold: Type.Optional(Type.Boolean({ description: 'Bold text formatting' }))
});

/**
 * PDF Export Metadata Schema
 */
export const PdfExportMetadataSchema = Type.Object({
  exportedBy: Type.Optional(Type.String({ description: 'User who exported the data' })),
  exportedAt: Type.Optional(Type.String({ 
    format: 'date-time',
    description: 'Export timestamp' 
  })),
  filters: Type.Optional(Type.Record(Type.String(), Type.Any(), {
    description: 'Applied filters'
  })),
  totalRecords: Type.Optional(Type.Integer({ 
    minimum: 0,
    description: 'Total number of records' 
  })),
  selectedRecords: Type.Optional(Type.Integer({ 
    minimum: 0,
    description: 'Number of selected records' 
  }))
});

/**
 * PDF Preview Request Schema
 */
export const PdfPreviewRequestSchema = Type.Object({
  data: Type.Array(Type.Record(Type.String(), Type.Any()), {
    description: 'Array of data objects to export',
    minItems: 0
  }),
  fields: Type.Optional(Type.Array(PdfExportFieldSchema, {
    description: 'Field definitions for export'
  })),
  title: Type.Optional(Type.String({ 
    description: 'Document title',
    maxLength: 200
  })),
  subtitle: Type.Optional(Type.String({ 
    description: 'Document subtitle',
    maxLength: 200
  })),
  template: Type.Optional(Type.Union([
    Type.Literal('professional'),
    Type.Literal('minimal'),
    Type.Literal('standard'),
    Type.Literal('custom')
  ], { 
    description: 'Template to use for PDF generation',
    default: 'professional'
  })),
  pageSize: Type.Optional(Type.Union([
    Type.Literal('A4'),
    Type.Literal('A3'),
    Type.Literal('LETTER'),
    Type.Literal('LEGAL')
  ], { 
    description: 'Page size',
    default: 'A4'
  })),
  orientation: Type.Optional(Type.Union([
    Type.Literal('portrait'),
    Type.Literal('landscape')
  ], { 
    description: 'Page orientation (auto-detected if not specified)'
  })),
  showSummary: Type.Optional(Type.Boolean({ 
    description: 'Include summary section',
    default: true
  })),
  groupBy: Type.Optional(Type.String({ 
    description: 'Field to group data by'
  })),
  logo: Type.Optional(Type.String({ 
    description: 'Base64 encoded logo or logo URL'
  })),
  metadata: Type.Optional(PdfExportMetadataSchema)
});

/**
 * PDF Preview Response Schema
 */
export const PdfPreviewResponseSchema = Type.Object({
  success: Type.Boolean({ description: 'Operation success status' }),
  previewUrl: Type.Optional(Type.String({ 
    description: 'URL to access the generated preview',
    format: 'uri'
  })),
  documentDefinition: Type.Optional(Type.Record(Type.String(), Type.Any(), {
    description: 'Sanitized document definition (for debugging)'
  })),
  metadata: Type.Optional(Type.Object({
    template: Type.String({ description: 'Template used' }),
    pageSize: Type.String({ description: 'Page size used' }),
    orientation: Type.String({ description: 'Orientation used' }),
    recordCount: Type.Integer({ description: 'Number of records processed' }),
    fieldsCount: Type.Integer({ description: 'Number of fields processed' }),
    generatedAt: Type.String({ 
      format: 'date-time',
      description: 'Generation timestamp' 
    })
  })),
  error: Type.Optional(Type.String({ description: 'Error message if failed' }))
});

/**
 * PDF Template Layout Schema
 */
export const PdfTemplateLayoutSchema = Type.Object({
  name: Type.String({ description: 'Layout name (e.g., lightHorizontalLines, noBorders)' }),
  config: Type.Optional(Type.Record(Type.String(), Type.Any(), {
    description: 'Layout configuration options'
  }))
});

/**
 * PDF Template Watermark Schema
 */
export const PdfTemplateWatermarkSchema = Type.Object({
  text: Type.String({ description: 'Watermark text' }),
  color: Type.Optional(Type.String({ description: 'Watermark color' })),
  opacity: Type.Optional(Type.Number({ 
    minimum: 0, 
    maximum: 1,
    description: 'Watermark opacity'
  })),
  bold: Type.Optional(Type.Boolean({ description: 'Bold watermark' })),
  italics: Type.Optional(Type.Boolean({ description: 'Italic watermark' }))
});

/**
 * PDF Template Schema
 */
export const PdfTemplateSchema = Type.Object({
  name: Type.String({ 
    description: 'Template name/identifier',
    minLength: 1,
    maxLength: 50
  }),
  layout: PdfTemplateLayoutSchema,
  styles: Type.Record(Type.String(), Type.Record(Type.String(), Type.Any()), {
    description: 'PDFMake style definitions'
  }),
  pageMargins: Type.Array(Type.Number(), {
    description: 'Page margins [left, top, right, bottom]',
    minItems: 4,
    maxItems: 4
  }),
  header: Type.Optional(Type.String({ 
    description: 'Header function (not supported in API - for reference only)'
  })),
  footer: Type.Optional(Type.String({ 
    description: 'Footer function (not supported in API - for reference only)'
  })),
  watermark: Type.Optional(PdfTemplateWatermarkSchema)
});

/**
 * Enhanced Export Query Schema with PDF options
 */
export const EnhancedExportQuerySchema = Type.Object({
  // Existing export fields
  format: Type.Union([
    Type.Literal('csv'),
    Type.Literal('excel'),
    Type.Literal('pdf')
  ], { description: 'Export format' }),
  ids: Type.Optional(Type.Array(Type.String(), {
    description: 'Specific record IDs to export'
  })),
  filters: Type.Optional(Type.Record(Type.String(), Type.Any(), {
    description: 'Filters to apply'
  })),
  fields: Type.Optional(Type.Array(Type.String(), {
    description: 'Fields to include in export'
  })),
  filename: Type.Optional(Type.String({ 
    description: 'Custom filename (without extension)' 
  })),
  includeMetadata: Type.Optional(Type.Boolean({ 
    description: 'Include metadata in export',
    default: true
  })),
  applyFilters: Type.Optional(Type.Boolean({ 
    description: 'Apply filters to data',
    default: false
  })),

  // PDF-specific options
  pdfTemplate: Type.Optional(Type.Union([
    Type.Literal('professional'),
    Type.Literal('minimal'),
    Type.Literal('standard'),
    Type.Literal('custom')
  ], { 
    description: 'PDF template to use',
    default: 'professional'
  })),
  pdfPageSize: Type.Optional(Type.Union([
    Type.Literal('A4'),
    Type.Literal('A3'),
    Type.Literal('LETTER'),
    Type.Literal('LEGAL')
  ], { 
    description: 'PDF page size',
    default: 'A4'
  })),
  pdfOrientation: Type.Optional(Type.Union([
    Type.Literal('portrait'),
    Type.Literal('landscape')
  ], { 
    description: 'PDF page orientation'
  })),
  pdfTitle: Type.Optional(Type.String({ 
    description: 'PDF document title'
  })),
  pdfSubtitle: Type.Optional(Type.String({ 
    description: 'PDF document subtitle'
  })),
  pdfShowSummary: Type.Optional(Type.Boolean({ 
    description: 'Include summary in PDF',
    default: true
  })),
  pdfGroupBy: Type.Optional(Type.String({ 
    description: 'Field to group PDF data by'
  })),
  pdfLogo: Type.Optional(Type.String({ 
    description: 'Base64 logo for PDF'
  })),
  preview: Type.Optional(Type.Boolean({ 
    description: 'Generate preview instead of download',
    default: false
  }))
});

// Type exports
export type PdfExportField = Static<typeof PdfExportFieldSchema>;
export type PdfExportMetadata = Static<typeof PdfExportMetadataSchema>;
export type PdfPreviewRequest = Static<typeof PdfPreviewRequestSchema>;
export type PdfPreviewResponse = Static<typeof PdfPreviewResponseSchema>;
export type PdfTemplate = Static<typeof PdfTemplateSchema>;
export type PdfTemplateLayout = Static<typeof PdfTemplateLayoutSchema>;
export type PdfTemplateWatermark = Static<typeof PdfTemplateWatermarkSchema>;
export type EnhancedExportQuery = Static<typeof EnhancedExportQuerySchema>;