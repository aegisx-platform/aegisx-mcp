import { Type, Static } from '@sinclair/typebox';

/**
 * PDF Templates CRUD Schemas
 * Re-export from the main schemas for CRUD generator compatibility
 */

// Import from existing schemas
import {
  CreatePdfTemplateSchema,
  UpdatePdfTemplateSchema,
  PdfTemplateIdParamSchema,
  PdfTemplateListQuerySchema,
} from '../../../schemas/pdf-template.schemas';

// Re-export for CRUD generator
export {
  CreatePdfTemplateSchema as CreatePdf_TemplatesRequestSchema,
  UpdatePdfTemplateSchema as UpdatePdf_TemplatesRequestSchema,
  PdfTemplateIdParamSchema,
  PdfTemplateListQuerySchema as ListPdf_TemplatesQuerySchema,
};

// Base PDF Template Schema
export const PdfTemplateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  display_name: Type.String(),
  description: Type.Optional(Type.String()),
  category: Type.String(),
  type: Type.String(),
  template_data: Type.Any(),
  sample_data: Type.Optional(Type.Any()),
  schema: Type.Optional(Type.Any()),
  page_size: Type.String(),
  orientation: Type.String(),
  styles: Type.Optional(Type.Any()),
  fonts: Type.Optional(Type.Any()),
  version: Type.String(),
  is_active: Type.Boolean(),
  is_default: Type.Boolean(),
  is_template_starter: Type.Boolean(),
  usage_count: Type.Number(),
  assets: Type.Optional(Type.Array(Type.Any())),
  permissions: Type.Optional(Type.Array(Type.String())),
  created_by: Type.Optional(Type.String({ format: 'uuid' })),
  updated_by: Type.Optional(Type.String({ format: 'uuid' })),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

export type PdfTemplate = Static<typeof PdfTemplateSchema>;
export type CreatePdf_TemplatesRequest = Static<typeof CreatePdfTemplateSchema>;
export type UpdatePdf_TemplatesRequest = Static<typeof UpdatePdfTemplateSchema>;
export type ListPdf_TemplatesQuery = Static<typeof PdfTemplateListQuerySchema>;
