import { Knex } from 'knex';
import { PdfTemplateRepository } from '../repositories/pdf-template.repository';
import { HandlebarsTemplateService } from './handlebars-template.service';
import { PDFMakeService } from './pdfmake.service';
import {
  PdfTemplate,
  CreatePdfTemplate,
  UpdatePdfTemplate,
  PdfRenderRequest,
  PdfRenderResponse,
  PdfTemplateListQuery,
  PdfTemplateStats,
  TemplateValidationResult,
  PdfRender,
  CompiledTemplate
} from '../types/pdf-template.types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * PDF Template Service
 * 
 * Main service for managing PDF templates and rendering
 * Integrates Handlebars templating with PDFMake generation
 */
export class PdfTemplateService {
  private repository: PdfTemplateRepository;
  private handlebarsService: HandlebarsTemplateService;
  private pdfMakeService: PDFMakeService;
  private renderCache: Map<string, CompiledTemplate> = new Map();
  private readonly renderDir: string;

  constructor(knex: Knex) {
    this.repository = new PdfTemplateRepository(knex);
    this.handlebarsService = new HandlebarsTemplateService();
    this.pdfMakeService = new PDFMakeService();
    this.renderDir = path.join(process.cwd(), 'temp', 'pdf-renders');
    this.ensureRenderDir();
  }

  /**
   * Create new PDF template
   */
  async createTemplate(data: CreatePdfTemplate, userId?: string): Promise<PdfTemplate> {
    try {
      // Validate template before creating
      const validation = this.validateTemplate(data.template_data);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if name is unique
      const existing = await this.repository.findByName(data.name);
      if (existing) {
        throw new Error(`Template with name '${data.name}' already exists`);
      }

      // Set defaults
      const templateData: CreatePdfTemplate = {
        ...data,
        category: data.category || 'general',
        type: data.type || 'document',
        page_size: data.page_size || 'A4',
        orientation: data.orientation || 'portrait',
        version: data.version || '1.0.0',
        is_active: data.is_active !== false,
        is_default: data.is_default || false
      };

      const template = await this.repository.create(templateData, userId);

      // Create initial version
      await this.repository.createVersion(template.id, template.version, {
        template_data: template.template_data,
        sample_data: template.sample_data,
        schema: template.schema,
        styles: template.styles,
        fonts: template.fonts,
        changelog: 'Initial version'
      }, userId);

      // Clear cache for this template
      this.clearTemplateCache(template.id);

      return template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  /**
   * Update PDF template
   */
  async updateTemplate(id: string, data: UpdatePdfTemplate, userId?: string): Promise<PdfTemplate> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Template not found');
      }

      // Validate template if template_data is being updated
      if (data.template_data) {
        const validation = this.validateTemplate(data.template_data);
        if (!validation.isValid) {
          throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Check name uniqueness if name is being changed
      if (data.name && data.name !== existing.name) {
        const nameExists = await this.repository.findByName(data.name);
        if (nameExists) {
          throw new Error(`Template with name '${data.name}' already exists`);
        }
      }

      const updated = await this.repository.update(id, data, userId);

      // Create new version if template content changed
      const hasContentChanges = data.template_data || data.styles || data.fonts;
      if (hasContentChanges) {
        const newVersion = this.incrementVersion(existing.version);
        await this.repository.update(id, { version: newVersion }, userId);
        
        await this.repository.createVersion(id, newVersion, {
          template_data: data.template_data || existing.template_data,
          sample_data: data.sample_data || existing.sample_data,
          schema: data.schema || existing.schema,
          styles: data.styles || existing.styles,
          fonts: data.fonts || existing.fonts,
          changelog: 'Template updated'
        }, userId);
      }

      // Clear cache for this template
      this.clearTemplateCache(id);

      return updated;
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<PdfTemplate | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      console.error('Error getting template:', error);
      throw new Error(`Failed to get template: ${error.message}`);
    }
  }

  /**
   * Get template by name
   */
  async getTemplateByName(name: string): Promise<PdfTemplate | null> {
    try {
      return await this.repository.findByName(name);
    } catch (error) {
      console.error('Error getting template by name:', error);
      throw new Error(`Failed to get template: ${error.message}`);
    }
  }

  /**
   * List templates with filtering
   */
  async listTemplates(query: PdfTemplateListQuery) {
    try {
      return await this.repository.findManyWithFilters(query);
    } catch (error) {
      console.error('Error listing templates:', error);
      throw new Error(`Failed to list templates: ${error.message}`);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      if (result) {
        this.clearTemplateCache(id);
      }
      return result;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  /**
   * Render PDF from template
   */
  async renderPdf(request: PdfRenderRequest, userId?: string, ipAddress?: string, userAgent?: string): Promise<PdfRenderResponse> {
    const startTime = Date.now();
    let renderId: string | undefined;

    try {
      // Get template
      const template = await this.repository.findByName(request.templateName);
      if (!template) {
        throw new Error(`Template '${request.templateName}' not found`);
      }

      if (!template.is_active) {
        throw new Error(`Template '${request.templateName}' is not active`);
      }

      // Create render record
      const renderRecord = await this.repository.createRender({
        template_id: template.id,
        template_version: request.templateVersion || template.version,
        render_type: request.options?.renderType || 'normal',
        render_data: request.data,
        rendered_by: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'pending'
      });

      renderId = renderRecord.id;

      // Get template version if specified
      let templateData = template.template_data;
      let templateVersion = template.version;

      if (request.templateVersion && request.templateVersion !== template.version) {
        const version = await this.repository.getVersion(template.id, request.templateVersion);
        if (version) {
          templateData = version.template_data;
          templateVersion = version.version;
        }
      }

      // Compile template
      const compiled = this.getOrCompileTemplate(template.id, template.name, templateData, templateVersion);

      // Render template with data
      const documentDefinition = this.handlebarsService.renderTemplate(compiled, request.data);

      // Override page settings if specified in options
      if (request.options?.pageSize) {
        documentDefinition.pageSize = request.options.pageSize;
      }
      if (request.options?.orientation) {
        documentDefinition.pageOrientation = request.options.orientation;
      }

      // Generate PDF
      let pdfBuffer: Buffer;
      let fileUrl: string | undefined;
      let previewUrl: string | undefined;

      if (request.options?.renderType === 'preview') {
        // Generate preview
        const previewResult = await this.pdfMakeService.generatePreview({
          data: [request.data],
          title: template.display_name,
          template: 'custom',
          customTemplate: {
            name: template.name,
            layout: { name: 'lightHorizontalLines' },
            styles: documentDefinition.styles || {},
            pageMargins: documentDefinition.pageMargins || [40, 60, 40, 60]
          },
          pageSize: documentDefinition.pageSize as any,
          orientation: documentDefinition.pageOrientation as any
        });

        if (!previewResult.success) {
          throw new Error(previewResult.error || 'Preview generation failed');
        }

        previewUrl = previewResult.previewUrl;
      } else {
        // Generate full PDF
        pdfBuffer = await this.generatePdfFromDefinition(documentDefinition);

        // Save file if requested
        if (request.options?.saveFile) {
          const filename = request.options.filename || `${template.name}_${Date.now()}.pdf`;
          const filePath = path.join(this.renderDir, filename);
          
          fs.writeFileSync(filePath, pdfBuffer);
          fileUrl = `/api/pdf-renders/${filename}`;

          // Set expiration if specified
          let expiresAt: Date | undefined;
          if (request.options.expiresIn) {
            expiresAt = new Date(Date.now() + request.options.expiresIn * 60 * 1000);
          }

          // Update render record with file info
          await this.repository.updateRender(renderId, {
            file_path: filePath,
            file_url: fileUrl,
            expires_at: expiresAt
          });
        }
      }

      const renderTime = Date.now() - startTime;

      // Update render record with completion
      await this.repository.updateRender(renderId, {
        page_count: this.estimatePageCount(pdfBuffer),
        file_size: pdfBuffer?.length,
        render_time_ms: renderTime,
        status: 'completed'
      });

      // Increment template usage count
      await this.repository.incrementUsageCount(template.id);

      const response: PdfRenderResponse = {
        success: true,
        renderId,
        fileUrl,
        previewUrl,
        filename: request.options?.filename,
        pageCount: this.estimatePageCount(pdfBuffer),
        fileSize: pdfBuffer?.length,
        renderTime,
        metadata: {
          templateName: template.name,
          templateVersion: templateVersion,
          renderedAt: new Date().toISOString(),
          expiresAt: request.options?.expiresIn ? 
            new Date(Date.now() + request.options.expiresIn * 60 * 1000).toISOString() : 
            undefined
        }
      };

      // Return PDF buffer directly for normal renders without file saving
      if (!request.options?.saveFile && request.options?.renderType !== 'preview') {
        // Add buffer to response (in real implementation, you might want to stream this)
        (response as any).buffer = pdfBuffer;
      }

      return response;

    } catch (error) {
      console.error('Error rendering PDF:', error);

      // Update render record with error
      if (renderId) {
        await this.repository.updateRender(renderId, {
          status: 'failed',
          error_message: error.message,
          render_time_ms: Date.now() - startTime
        });
      }

      return {
        success: false,
        error: error.message,
        renderId
      };
    }
  }

  /**
   * Get template statistics
   */
  async getStats(): Promise<PdfTemplateStats> {
    try {
      return await this.repository.getStats();
    } catch (error) {
      console.error('Error getting template stats:', error);
      throw new Error(`Failed to get template stats: ${error.message}`);
    }
  }

  /**
   * Get template categories
   */
  async getCategories() {
    try {
      return await this.repository.getCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get template types
   */
  async getTypes() {
    try {
      return await this.repository.getTypes();
    } catch (error) {
      console.error('Error getting types:', error);
      throw new Error(`Failed to get types: ${error.message}`);
    }
  }

  /**
   * Validate template
   */
  validateTemplate(templateData: any): TemplateValidationResult {
    try {
      return this.handlebarsService.validateTemplate(templateData);
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(templateId: string, customData?: Record<string, any>): Promise<PdfRenderResponse> {
    try {
      const template = await this.repository.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const previewData = customData || template.sample_data || {};

      return await this.renderPdf({
        templateName: template.name,
        data: previewData,
        options: {
          renderType: 'preview',
          filename: `preview_${template.name}_${Date.now()}.pdf`
        }
      });
    } catch (error) {
      console.error('Error previewing template:', error);
      throw new Error(`Failed to preview template: ${error.message}`);
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(templateId: string, newName: string, userId?: string): Promise<PdfTemplate> {
    try {
      return await this.repository.duplicateTemplate(templateId, newName, userId);
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw new Error(`Failed to duplicate template: ${error.message}`);
    }
  }

  /**
   * Get template versions
   */
  async getTemplateVersions(templateId: string) {
    try {
      return await this.repository.getVersions(templateId);
    } catch (error) {
      console.error('Error getting template versions:', error);
      throw new Error(`Failed to get template versions: ${error.message}`);
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm: string) {
    try {
      return await this.repository.searchTemplateContent(searchTerm);
    } catch (error) {
      console.error('Error searching templates:', error);
      throw new Error(`Failed to search templates: ${error.message}`);
    }
  }

  /**
   * Get render by ID
   */
  async getRender(renderId: string): Promise<PdfRender | null> {
    try {
      return await this.repository.getRender(renderId);
    } catch (error) {
      console.error('Error getting render:', error);
      throw new Error(`Failed to get render: ${error.message}`);
    }
  }

  /**
   * Cleanup expired renders
   */
  async cleanupExpiredRenders(): Promise<number> {
    try {
      return await this.repository.cleanupExpiredRenders();
    } catch (error) {
      console.error('Error cleaning up expired renders:', error);
      throw new Error(`Failed to cleanup expired renders: ${error.message}`);
    }
  }

  /**
   * Get available Handlebars helpers
   */
  getAvailableHelpers(): string[] {
    return this.handlebarsService.getAvailableHelpers();
  }

  /**
   * Register custom Handlebars helper
   */
  registerCustomHelper(name: string, helper: any): void {
    this.handlebarsService.registerCustomHelper(name, helper);
  }

  // Private helper methods

  private getOrCompileTemplate(templateId: string, templateName: string, templateData: any, version: string): CompiledTemplate {
    const cacheKey = `${templateId}_${version}`;
    
    if (this.renderCache.has(cacheKey)) {
      return this.renderCache.get(cacheKey)!;
    }

    const compiled = this.handlebarsService.compileTemplate(templateId, templateName, templateData, version);
    this.renderCache.set(cacheKey, compiled);
    
    return compiled;
  }

  private clearTemplateCache(templateId?: string): void {
    if (templateId) {
      const keysToDelete = Array.from(this.renderCache.keys())
        .filter(key => key.startsWith(templateId));
      keysToDelete.forEach(key => this.renderCache.delete(key));
    } else {
      this.renderCache.clear();
    }
  }

  private async generatePdfFromDefinition(docDefinition: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const PdfMake = require('pdfmake/build/pdfmake');
        
        // Try to load Thai fonts
        try {
          const vfsFonts = require('pdfmake/build/vfs_fonts');
          if (vfsFonts?.pdfMake?.vfs) {
            PdfMake.vfs = vfsFonts.pdfMake.vfs;
          }
        } catch (error) {
          console.warn('VFS fonts not available, using default fonts');
        }

        const pdfDoc = PdfMake.createPdf(docDefinition);
        
        pdfDoc.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        });
      } catch (error) {
        reject(new Error(`PDF generation failed: ${error.message}`));
      }
    });
  }

  private estimatePageCount(buffer?: Buffer): number {
    if (!buffer) return 0;
    // Simple estimation based on buffer size - this is rough
    // In production, you might want to parse the PDF to get actual page count
    return Math.max(1, Math.ceil(buffer.length / 50000));
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;
  }

  private ensureRenderDir(): void {
    if (!fs.existsSync(this.renderDir)) {
      fs.mkdirSync(this.renderDir, { recursive: true });
    }
  }
}