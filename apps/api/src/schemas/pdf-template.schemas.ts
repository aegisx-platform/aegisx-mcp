import { Type, Static } from '@sinclair/typebox';

/**
 * Logo Settings Schema
 */
export const LogoSettingsSchema = Type.Object({
  width: Type.Optional(Type.Number({ description: 'Logo width in pixels' })),
  height: Type.Optional(Type.Number({ description: 'Logo height in pixels' })),
  position: Type.Optional(
    Type.Union(
      [Type.Literal('header'), Type.Literal('footer'), Type.Literal('custom')],
      { description: 'Logo position' },
    ),
  ),
  alignment: Type.Optional(
    Type.Union(
      [Type.Literal('left'), Type.Literal('center'), Type.Literal('right')],
      { description: 'Logo alignment' },
    ),
  ),
  marginTop: Type.Optional(
    Type.Number({ description: 'Top margin in pixels' }),
  ),
  marginBottom: Type.Optional(
    Type.Number({ description: 'Bottom margin in pixels' }),
  ),
  marginLeft: Type.Optional(
    Type.Number({ description: 'Left margin in pixels' }),
  ),
  marginRight: Type.Optional(
    Type.Number({ description: 'Right margin in pixels' }),
  ),
});

/**
 * PDF Template Data Schema
 */
export const PdfTemplateDataSchema = Type.Object({
  pageSize: Type.Optional(
    Type.String({ description: 'Page size (A4, A3, LETTER, LEGAL)' }),
  ),
  pageOrientation: Type.Optional(
    Type.String({ description: 'Page orientation (portrait, landscape)' }),
  ),
  pageMargins: Type.Optional(
    Type.Array(Type.Number(), {
      description: 'Page margins [left, top, right, bottom]',
      minItems: 4,
      maxItems: 4,
    }),
  ),
  content: Type.Array(Type.Any(), {
    description: 'PDFMake content array with Handlebars templates',
  }),
  styles: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'PDFMake style definitions',
    }),
  ),
  defaultStyle: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Default style settings',
    }),
  ),
  header: Type.Optional(Type.Any({ description: 'Header definition' })),
  footer: Type.Optional(Type.Any({ description: 'Footer definition' })),
  watermark: Type.Optional(Type.Any({ description: 'Watermark settings' })),
  info: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Document metadata',
    }),
  ),
});

/**
 * PDF Template Schema (JSON Schema for data validation)
 */
export const PdfTemplateSchemaSchema = Type.Object({
  type: Type.Literal('object'),
  required: Type.Optional(Type.Array(Type.String())),
  properties: Type.Record(
    Type.String(),
    Type.Object({
      type: Type.String(),
      format: Type.Optional(Type.String()),
      items: Type.Optional(Type.Any()),
      properties: Type.Optional(Type.Any()),
      description: Type.Optional(Type.String()),
    }),
  ),
});

/**
 * PDF Template Asset Schema
 */
export const PdfTemplateAssetSchema = Type.Object({
  id: Type.String({ description: 'Asset ID' }),
  name: Type.String({ description: 'Asset name' }),
  type: Type.Union(
    [Type.Literal('image'), Type.Literal('font'), Type.Literal('file')],
    { description: 'Asset type' },
  ),
  url: Type.String({ description: 'Asset URL' }),
  size: Type.Optional(Type.Number({ description: 'File size in bytes' })),
  mime_type: Type.Optional(Type.String({ description: 'MIME type' })),
});

/**
 * Create PDF Template Schema
 */
export const CreatePdfTemplateSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9_-]+$',
    description: 'Template name (alphanumeric, underscore, hyphen only)',
  }),
  display_name: Type.String({
    minLength: 1,
    maxLength: 200,
    description: 'Display name for the template',
  }),
  description: Type.Optional(
    Type.String({
      maxLength: 1000,
      description: 'Template description',
    }),
  ),
  category: Type.Optional(
    Type.String({
      maxLength: 50,
      default: 'general',
      description: 'Template category',
    }),
  ),
  type: Type.Optional(
    Type.String({
      maxLength: 50,
      default: 'document',
      description: 'Template type (document, report, invoice, etc.)',
    }),
  ),
  // Accept both Object (pure JSON) and String (Handlebars template)
  template_data: Type.Union([PdfTemplateDataSchema, Type.String()], {
    description:
      'Template data - Object for pure JSON or String for Handlebars templates',
  }),
  sample_data: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Sample data for template testing',
    }),
  ),
  schema: Type.Optional(PdfTemplateSchemaSchema),
  page_size: Type.Optional(
    Type.Union(
      [
        Type.Literal('A4'),
        Type.Literal('A3'),
        Type.Literal('LETTER'),
        Type.Literal('LEGAL'),
      ],
      { default: 'A4' },
    ),
  ),
  orientation: Type.Optional(
    Type.Union([Type.Literal('portrait'), Type.Literal('landscape')], {
      default: 'portrait',
    }),
  ),
  styles: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Custom PDFMake styles',
    }),
  ),
  fonts: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Font configuration',
    }),
  ),
  version: Type.Optional(
    Type.String({
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      default: '1.0.0',
      description: 'Template version (semantic versioning)',
    }),
  ),
  is_active: Type.Optional(
    Type.Boolean({
      default: true,
      description: 'Whether template is active',
    }),
  ),
  is_default: Type.Optional(
    Type.Boolean({
      default: false,
      description: 'Whether this is a default template',
    }),
  ),
  is_template_starter: Type.Optional(
    Type.Boolean({
      default: false,
      description: 'Whether this template can be used as a starter template',
    }),
  ),
  assets: Type.Optional(
    Type.Array(PdfTemplateAssetSchema, {
      description: 'Associated assets (images, fonts, etc.)',
    }),
  ),
  permissions: Type.Optional(
    Type.Array(Type.String(), {
      description: 'Required permissions to use this template',
    }),
  ),
  logo_file_id: Type.Optional(
    Type.Union([Type.String({ format: 'uuid' }), Type.Null()], {
      description: 'UUID of uploaded logo file, or null to remove logo',
    }),
  ),
  logo_settings: Type.Optional(LogoSettingsSchema),
});

/**
 * Update PDF Template Schema
 */
export const UpdatePdfTemplateSchema = Type.Partial(CreatePdfTemplateSchema);

/**
 * PDF Template ID Parameter Schema
 */
export const PdfTemplateIdParamSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'Template UUID',
  }),
});

/**
 * PDF Template List Query Schema
 */
export const PdfTemplateListQuerySchema = Type.Object({
  page: Type.Optional(
    Type.Integer({
      minimum: 1,
      default: 1,
      description: 'Page number',
    }),
  ),
  limit: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 100,
      default: 20,
      description: 'Items per page',
    }),
  ),
  category: Type.Optional(
    Type.String({
      description: 'Filter by category',
    }),
  ),
  type: Type.Optional(
    Type.String({
      description: 'Filter by type',
    }),
  ),
  isActive: Type.Optional(
    Type.Boolean({
      description: 'Filter by active status',
    }),
  ),
  search: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 100,
      description: 'Search term',
    }),
  ),
  sortBy: Type.Optional(
    Type.Union(
      [
        Type.Literal('name'),
        Type.Literal('created_at'),
        Type.Literal('updated_at'),
        Type.Literal('usage_count'),
      ],
      {
        default: 'updated_at',
        description: 'Sort field',
      },
    ),
  ),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], {
      default: 'desc',
      description: 'Sort order',
    }),
  ),
});

/**
 * PDF Render Request Schema
 */
export const PdfRenderRequestSchema = Type.Object({
  templateName: Type.String({
    minLength: 1,
    description: 'Template name to render',
  }),
  templateVersion: Type.Optional(
    Type.String({
      description: 'Specific template version (uses latest if not specified)',
    }),
  ),
  data: Type.Record(Type.String(), Type.Any(), {
    description: 'Data to populate the template',
  }),
  options: Type.Optional(
    Type.Object({
      renderType: Type.Optional(
        Type.Union(
          [
            Type.Literal('normal'),
            Type.Literal('preview'),
            Type.Literal('test'),
          ],
          {
            default: 'normal',
            description: 'Render type',
          },
        ),
      ),
      pageSize: Type.Optional(
        Type.Union(
          [
            Type.Literal('A4'),
            Type.Literal('A3'),
            Type.Literal('LETTER'),
            Type.Literal('LEGAL'),
          ],
          { description: 'Override page size' },
        ),
      ),
      orientation: Type.Optional(
        Type.Union([Type.Literal('portrait'), Type.Literal('landscape')], {
          description: 'Override page orientation',
        }),
      ),
      filename: Type.Optional(
        Type.String({
          maxLength: 255,
          description: 'Custom filename',
        }),
      ),
      saveFile: Type.Optional(
        Type.Boolean({
          default: false,
          description: 'Save file to server',
        }),
      ),
      expiresIn: Type.Optional(
        Type.Integer({
          minimum: 1,
          maximum: 10080, // 1 week in minutes
          description: 'File expiration in minutes',
        }),
      ),
    }),
  ),
});

/**
 * PDF Template Search Query Schema
 */
export const PdfTemplateSearchQuerySchema = Type.Object({
  q: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Search query',
  }),
});

/**
 * PDF Template Preview Request Schema
 */
export const PdfTemplatePreviewRequestSchema = Type.Object({
  data: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Custom data for preview (uses sample data if not provided)',
    }),
  ),
});

/**
 * PDF Template Response Schema
 */
export const PdfTemplateResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  display_name: Type.String(),
  description: Type.Optional(Type.String()),
  category: Type.String(),
  type: Type.String(),
  template_data: PdfTemplateDataSchema,
  sample_data: Type.Optional(Type.Record(Type.String(), Type.Any())),
  schema: Type.Optional(PdfTemplateSchemaSchema),
  page_size: Type.String(),
  orientation: Type.String(),
  styles: Type.Optional(Type.Record(Type.String(), Type.Any())),
  fonts: Type.Optional(Type.Record(Type.String(), Type.Any())),
  version: Type.String(),
  is_active: Type.Boolean(),
  is_default: Type.Boolean(),
  usage_count: Type.Number(),
  assets: Type.Optional(Type.Array(PdfTemplateAssetSchema)),
  permissions: Type.Optional(Type.Array(Type.String())),
  logo_file_id: Type.Optional(
    Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  ),
  logo_settings: Type.Optional(LogoSettingsSchema),
  created_by: Type.Optional(Type.String({ format: 'uuid' })),
  updated_by: Type.Optional(Type.String({ format: 'uuid' })),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

/**
 * PDF Template List Response Schema
 */
export const PdfTemplateListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(PdfTemplateResponseSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  }),
});

/**
 * PDF Render Response Schema
 */
export const PdfRenderResponseSchema = Type.Object({
  success: Type.Boolean(),
  renderId: Type.Optional(Type.String({ format: 'uuid' })),
  fileUrl: Type.Optional(Type.String()),
  previewUrl: Type.Optional(Type.String()),
  filename: Type.Optional(Type.String()),
  pageCount: Type.Optional(Type.Number()),
  fileSize: Type.Optional(Type.Number()),
  renderTime: Type.Optional(Type.Number()),
  error: Type.Optional(Type.String()),
  metadata: Type.Optional(
    Type.Object({
      templateName: Type.String(),
      templateVersion: Type.String(),
      renderedAt: Type.String({ format: 'date-time' }),
      expiresAt: Type.Optional(Type.String({ format: 'date-time' })),
    }),
  ),
});

/**
 * Template Validation Response Schema
 */
export const TemplateValidationResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    isValid: Type.Boolean(),
    errors: Type.Array(Type.String()),
    warnings: Type.Array(Type.String()),
    compiledSize: Type.Optional(Type.Number()),
  }),
});

/**
 * Template Statistics Response Schema
 */
export const TemplateStatsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    totalTemplates: Type.Number(),
    activeTemplates: Type.Number(),
    totalRenders: Type.Number(),
    popularTemplates: Type.Array(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        usage_count: Type.Number(),
      }),
    ),
    rendersByCategory: Type.Record(Type.String(), Type.Number()),
    recentActivity: Type.Array(
      Type.Object({
        template_name: Type.String(),
        rendered_at: Type.String({ format: 'date-time' }),
        rendered_by: Type.Optional(Type.String({ format: 'uuid' })),
      }),
    ),
  }),
});

/**
 * Template Version Schema
 */
export const TemplateVersionSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  template_id: Type.String({ format: 'uuid' }),
  version: Type.String(),
  changelog: Type.Optional(Type.String()),
  template_data: PdfTemplateDataSchema,
  sample_data: Type.Optional(Type.Record(Type.String(), Type.Any())),
  schema: Type.Optional(PdfTemplateSchemaSchema),
  styles: Type.Optional(Type.Record(Type.String(), Type.Any())),
  fonts: Type.Optional(Type.Record(Type.String(), Type.Any())),
  created_by: Type.Optional(Type.String({ format: 'uuid' })),
  created_at: Type.String({ format: 'date-time' }),
});

/**
 * Template Versions Response Schema
 */
export const TemplateVersionsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(TemplateVersionSchema),
});

/**
 * Categories Response Schema
 */
export const CategoriesResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(
    Type.Object({
      category: Type.String(),
      count: Type.Number(),
    }),
  ),
});

/**
 * Types Response Schema
 */
export const TypesResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(
    Type.Object({
      type: Type.String(),
      count: Type.Number(),
    }),
  ),
});

/**
 * Helpers Response Schema
 */
export const HelpersResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(Type.String()),
});

// Type exports
export type CreatePdfTemplate = Static<typeof CreatePdfTemplateSchema>;
export type UpdatePdfTemplate = Static<typeof UpdatePdfTemplateSchema>;
export type PdfTemplateIdParam = Static<typeof PdfTemplateIdParamSchema>;
export type PdfTemplateListQuery = Static<typeof PdfTemplateListQuerySchema>;
export type PdfRenderRequest = Static<typeof PdfRenderRequestSchema>;
export type PdfTemplateSearchQuery = Static<
  typeof PdfTemplateSearchQuerySchema
>;
export type PdfTemplatePreviewRequest = Static<
  typeof PdfTemplatePreviewRequestSchema
>;
export type PdfTemplateResponse = Static<typeof PdfTemplateResponseSchema>;
export type PdfRenderResponse = Static<typeof PdfRenderResponseSchema>;
export type TemplateValidationResponse = Static<
  typeof TemplateValidationResponseSchema
>;
export type TemplateStatsResponse = Static<typeof TemplateStatsResponseSchema>;
