/**
 * PDF Template Domain Types
 *
 * Defines the structure for dynamic PDF templates stored in database
 */

export interface LogoSettings {
  width?: number;
  height?: number;
  position?: 'header' | 'footer' | 'custom';
  alignment?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

export interface PdfTemplate {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  type: string;
  template_data: PdfTemplateData;
  sample_data?: Record<string, any>;
  schema?: PdfTemplateSchema;
  page_size: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  orientation: 'portrait' | 'landscape';
  styles?: Record<string, any>;
  fonts?: Record<string, any>;
  version: string;
  is_active: boolean;
  is_default: boolean;
  is_template_starter?: boolean;
  usage_count: number;
  assets?: PdfTemplateAsset[];
  permissions?: string[];
  logo_file_id?: string;
  logo_settings?: LogoSettings;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePdfTemplate {
  name: string;
  display_name: string;
  description?: string;
  category?: string;
  type?: string;
  template_data: PdfTemplateData;
  sample_data?: Record<string, any>;
  schema?: PdfTemplateSchema;
  page_size?: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
  styles?: Record<string, any>;
  fonts?: Record<string, any>;
  version?: string;
  is_active?: boolean;
  is_default?: boolean;
  is_template_starter?: boolean;
  assets?: PdfTemplateAsset[];
  permissions?: string[];
  logo_file_id?: string;
  logo_settings?: LogoSettings;
}

export interface UpdatePdfTemplate extends Partial<CreatePdfTemplate> {
  id?: never; // Prevent ID updates
}

/**
 * PDF Template Data
 * Can be either:
 * - Object: Parsed PDFMake structure (pure JSON templates)
 * - String: Raw Handlebars template string (will be compiled before rendering)
 */
export type PdfTemplateData = PdfTemplateDataObject | string;

export interface PdfTemplateDataObject {
  pageSize?: string;
  pageOrientation?: string;
  pageMargins?: number[];
  content: any[]; // PDFMake content with Handlebars templates
  styles?: Record<string, any>;
  defaultStyle?: Record<string, any>;
  header?: any;
  footer?: any;
  watermark?: any;
  info?: Record<string, any>;
}

export interface PdfTemplateSchema {
  type: 'object';
  required?: string[];
  properties: Record<
    string,
    {
      type: string;
      format?: string;
      items?: any;
      properties?: any;
      description?: string;
    }
  >;
}

export interface PdfTemplateAsset {
  id: string;
  name: string;
  type: 'image' | 'font' | 'file';
  url: string;
  size?: number;
  mime_type?: string;
}

export interface PdfTemplateVersion {
  id: string;
  template_id: string;
  version: string;
  changelog?: string;
  template_data: PdfTemplateData;
  sample_data?: Record<string, any>;
  schema?: PdfTemplateSchema;
  styles?: Record<string, any>;
  fonts?: Record<string, any>;
  created_by?: string;
  created_at: Date;
}

export interface PdfRender {
  id: string;
  template_id: string;
  template_version?: string;
  render_type: 'normal' | 'preview' | 'test';
  render_data?: Record<string, any>;
  page_count?: number;
  file_size?: number;
  render_time_ms?: number;
  rendered_at: Date;
  rendered_by?: string;
  ip_address?: string;
  user_agent?: string;
  file_path?: string;
  file_url?: string;
  expires_at?: Date;
  status: 'pending' | 'completed' | 'failed';
  error_message?: string;
}

export interface PdfRenderRequest {
  templateName: string;
  templateVersion?: string;
  data: Record<string, any>;
  options?: {
    renderType?: 'normal' | 'preview' | 'test';
    pageSize?: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
    orientation?: 'portrait' | 'landscape';
    filename?: string;
    saveFile?: boolean;
    expiresIn?: number; // minutes
  };
}

export interface PdfRenderResponse {
  success: boolean;
  renderId?: string;
  fileUrl?: string;
  previewUrl?: string;
  filename?: string;
  pageCount?: number;
  fileSize?: number;
  renderTime?: number;
  error?: string;
  metadata?: {
    templateName: string;
    templateVersion: string;
    renderedAt: string;
    expiresAt?: string;
  };
}

export interface PdfTemplateListQuery {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'usage_count';
  sortOrder?: 'asc' | 'desc';
}

export interface PdfTemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  totalRenders: number;
  popularTemplates: Array<{
    id: string;
    name: string;
    usage_count: number;
  }>;
  rendersByCategory: Record<string, number>;
  recentActivity: Array<{
    template_name: string;
    rendered_at: Date;
    rendered_by?: string;
  }>;
}

// Handlebars helper function types
export type HandlebarsHelper = (
  ...args: any[]
) => string | number | boolean | any;

export interface HandlebarsHelpers {
  formatDate: HandlebarsHelper;
  formatCurrency: HandlebarsHelper;
  formatNumber: HandlebarsHelper;
  formatPercent: HandlebarsHelper;
  uppercase: HandlebarsHelper;
  lowercase: HandlebarsHelper;
  truncate: HandlebarsHelper;
  default: HandlebarsHelper;
  eq: HandlebarsHelper;
  gt: HandlebarsHelper;
  lt: HandlebarsHelper;
  or: HandlebarsHelper;
  and: HandlebarsHelper;
  multiply: HandlebarsHelper;
  divide: HandlebarsHelper;
  add: HandlebarsHelper;
  subtract: HandlebarsHelper;
  [key: string]: HandlebarsHelper;
}

// Template compilation and rendering types
export interface CompiledTemplate {
  templateId: string;
  templateName: string;
  version: string;
  compiledContent: any; // Compiled Handlebars template
  styles?: Record<string, any>;
  pageSettings: {
    size: string;
    orientation: string;
    margins: number[];
  };
  compiledAt: Date;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  compiledSize?: number;
}

export interface TemplatePreviewOptions {
  data?: Record<string, any>;
  useDefaultData?: boolean;
  renderType?: 'quick' | 'full';
  pageLimit?: number;
}
