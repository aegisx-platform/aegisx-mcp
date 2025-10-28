import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import type { HelperDelegate } from 'handlebars';
import { Knex } from 'knex';
import * as path from 'path';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { FileUploadRepository } from '../core/file-upload/file-upload.repository';
import { FileUploadService } from '../core/file-upload/file-upload.service';
import { PdfTemplateRepository } from '../core/pdf-export/repositories/pdf-template.repository';
import {
  CompiledTemplate,
  CreatePdfTemplate,
  JsonObject,
  JsonValue,
  PdfRender,
  PdfRenderRequest,
  PdfRenderResponse,
  PdfTemplate,
  PdfTemplateData,
  PdfTemplateListQuery,
  PdfTemplateStats,
  TemplateValidationResult,
  UpdatePdfTemplate,
} from '../types/pdf-template.types';
import { HandlebarsTemplateService } from './handlebars-template.service';
import { PDFMakeService } from './pdfmake.service';

type LoggerLike = Pick<Console, 'log' | 'error' | 'warn'> & {
  debug?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
};

/**
 * PDF Template Service
 *
 * Main service for managing PDF templates and rendering
 * Integrates Handlebars templating with PDFMake generation
 */
export class PdfTemplateService {
  private repository: PdfTemplateRepository;
  private fileUploadRepository: FileUploadRepository;
  private fileUploadService: FileUploadService | null = null;
  private handlebarsService: HandlebarsTemplateService;
  private pdfMakeService: PDFMakeService;
  private renderCache: Map<string, CompiledTemplate> = new Map();
  private readonly renderDir: string;

  constructor(knex: Knex, logger?: LoggerLike) {
    this.repository = new PdfTemplateRepository(knex);
    this.fileUploadRepository = new FileUploadRepository({
      db: knex,
      logger: (logger || console) as unknown as FastifyInstance['log'],
    });
    this.handlebarsService = new HandlebarsTemplateService();
    this.pdfMakeService = new PDFMakeService();
    this.renderDir = path.join(process.cwd(), 'temp', 'pdf-renders');
    this.ensureRenderDir();
  }

  /**
   * Set FileUploadService (injected from routes)
   */
  setFileUploadService(service: FileUploadService): void {
    this.fileUploadService = service;
  }

  /**
   * Create new PDF template
   */
  async createTemplate(
    data: CreatePdfTemplate,
    userId?: string,
  ): Promise<PdfTemplate> {
    try {
      const sanitizedAssetIds = this.sanitizeAssetFileIds(data.asset_file_ids);

      // Validate template before creating
      const validation = this.validateTemplate(data.template_data);
      if (!validation.isValid) {
        throw new Error(
          `Template validation failed: ${validation.errors.join(', ')}`,
        );
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
        is_default: data.is_default || false,
        asset_file_ids: sanitizedAssetIds,
      };

      const template = await this.repository.create(templateData, userId);

      // Create initial version
      await this.repository.createVersion(
        template.id,
        template.version,
        {
          template_data: template.template_data,
          sample_data: template.sample_data,
          schema: template.schema,
          styles: template.styles,
          fonts: template.fonts,
          asset_file_ids: template.asset_file_ids,
          changelog: 'Initial version',
        },
        userId,
      );

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
  async updateTemplate(
    id: string,
    data: UpdatePdfTemplate,
    userId?: string,
  ): Promise<PdfTemplate> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Template not found');
      }

      // Validate template if template_data is being updated
      if (data.template_data) {
        const validation = this.validateTemplate(data.template_data);
        if (!validation.isValid) {
          throw new Error(
            `Template validation failed: ${validation.errors.join(', ')}`,
          );
        }
      }

      // Check name uniqueness if name is being changed
      if (data.name && data.name !== existing.name) {
        const nameExists = await this.repository.findByName(data.name);
        if (nameExists) {
          throw new Error(`Template with name '${data.name}' already exists`);
        }
      }

      let sanitizedAssetIds: string[] | undefined;
      if (typeof data.asset_file_ids !== 'undefined') {
        sanitizedAssetIds = this.sanitizeAssetFileIds(data.asset_file_ids);
      }

      const updatePayload: UpdatePdfTemplate = {
        ...data,
        ...(typeof sanitizedAssetIds !== 'undefined'
          ? { asset_file_ids: sanitizedAssetIds }
          : {}),
      };

      const updated = await this.repository.update(id, updatePayload, userId);

      // Create new version if template content changed
      const hasContentChanges =
        data.template_data ||
        data.styles ||
        data.fonts ||
        typeof data.asset_file_ids !== 'undefined';
      if (hasContentChanges) {
        const newVersion = this.incrementVersion(existing.version);
        await this.repository.update(id, { version: newVersion }, userId);

        await this.repository.createVersion(
          id,
          newVersion,
          {
            template_data: data.template_data || existing.template_data,
            sample_data: data.sample_data || existing.sample_data,
            schema: data.schema || existing.schema,
            styles: data.styles || existing.styles,
            fonts: data.fonts || existing.fonts,
            asset_file_ids: sanitizedAssetIds ?? existing.asset_file_ids ?? [],
            changelog: 'Template updated',
          },
          userId,
        );
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
   * Normalize asset file ID arrays
   */
  private sanitizeAssetFileIds(input?: string[] | null): string[] {
    if (!input) {
      return [];
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const uniqueIds = new Set<string>();

    for (const value of input) {
      if (typeof value === 'string' && uuidRegex.test(value)) {
        uniqueIds.add(value);
      }
    }

    return Array.from(uniqueIds);
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
  async renderPdf(
    request: PdfRenderRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PdfRenderResponse> {
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

      // Block template starters from being used for actual rendering (but allow preview)
      const isPreview = request.options?.renderType === 'preview';
      if (template.is_template_starter && !isPreview) {
        throw new Error(
          `Template '${request.templateName}' is a template starter and cannot be used directly for rendering. ` +
            `Please create a new template based on this starter first.`,
        );
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
        status: 'pending',
      });

      renderId = renderRecord.id;

      // Get template version if specified
      let templateData = template.template_data;
      let templateVersion = template.version;

      if (
        request.templateVersion &&
        request.templateVersion !== template.version
      ) {
        const version = await this.repository.getVersion(
          template.id,
          request.templateVersion,
        );
        if (version) {
          templateData = version.template_data;
          templateVersion = version.version;
        }
      }

      // Compile template
      const compiled = this.getOrCompileTemplate(
        template.id,
        template.name,
        templateData,
        templateVersion,
      );

      // Merge template metadata with render data
      // This ensures logo_file_id and other template fields are available
      const requestLogoValue: JsonValue | undefined =
        request.data['logo_file_id'];
      const hasLogoOverride =
        typeof requestLogoValue === 'string'
          ? requestLogoValue.trim().length > 0
          : requestLogoValue !== undefined && requestLogoValue !== null;

      const renderData: JsonObject = {
        ...request.data,
        ...(template.logo_file_id && !hasLogoOverride
          ? { logo_file_id: template.logo_file_id }
          : {}),
        // Include asset_file_ids array in render context
        ...(template.asset_file_ids && Array.isArray(template.asset_file_ids)
          ? { asset_file_ids: template.asset_file_ids }
          : {}),
      };

      // Render template with merged data
      let documentDefinition = this.handlebarsService.renderTemplate(
        compiled,
        renderData,
      );

      // Resolve logo/asset markers to base64 data URLs
      try {
        documentDefinition = await this.resolveFileMarkers(
          documentDefinition,
          template,
        );
      } catch (markerError) {
        console.error('[renderPdf] Error in resolveFileMarkers:', markerError);
        throw new Error(
          `File marker resolution failed: ${markerError instanceof Error ? markerError.message : String(markerError)}`,
        );
      }

      // Override page settings if specified in options
      if (request.options?.pageSize) {
        documentDefinition.pageSize = request.options.pageSize;
      }
      if (request.options?.orientation) {
        documentDefinition.pageOrientation = request.options.orientation;
      }

      // Generate PDF
      let pdfBuffer: Buffer | undefined;
      let fileUrl: string | undefined;
      let previewUrl: string | undefined;

      if (request.options?.renderType === 'preview') {
        // Generate preview using PDFMakeService directly (with proper Thai fonts)
        try {
          pdfBuffer =
            await this.pdfMakeService.generatePdfFromDocDefinition(
              documentDefinition,
            );
        } catch (pdfError) {
          console.error('[Preview] PDFMake generation error:', pdfError);
          console.error('[Preview] Error details:', {
            message:
              pdfError instanceof Error ? pdfError.message : String(pdfError),
            stack: pdfError instanceof Error ? pdfError.stack : 'N/A',
            documentDef: JSON.stringify(documentDefinition).substring(0, 1000),
          });
          throw new Error(
            `PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`,
          );
        }

        // Save preview to temp directory
        const previewId = `preview_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = path.join(this.renderDir, previewId);

        fs.writeFileSync(filePath, pdfBuffer);

        previewUrl = `/api/pdf-preview/${previewId}`;

        // Set cleanup after 15 minutes
        setTimeout(
          () => {
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (error) {
              console.error('Error cleaning up preview file:', error);
            }
          },
          15 * 60 * 1000,
        );

        console.log('[Preview] Preview generation completed');
      } else {
        // Generate full PDF
        pdfBuffer = await this.generatePdfFromDefinition(
          documentDefinition as unknown as TDocumentDefinitions,
        );

        // Save file if requested
        if (request.options?.saveFile) {
          const filename =
            request.options.filename || `${template.name}_${Date.now()}.pdf`;
          const filePath = path.join(this.renderDir, filename);

          fs.writeFileSync(filePath, pdfBuffer);
          fileUrl = `/api/pdf-renders/${filename}`;

          // Set expiration if specified
          let expiresAt: Date | undefined;
          if (request.options.expiresIn) {
            expiresAt = new Date(
              Date.now() + request.options.expiresIn * 60 * 1000,
            );
          }

          // Update render record with file info
          await this.repository.updateRender(renderId, {
            file_path: filePath,
            file_url: fileUrl,
            expires_at: expiresAt,
          });
        }
      }

      const renderTime = Date.now() - startTime;

      // Update render record with completion
      await this.repository.updateRender(renderId, {
        page_count: pdfBuffer ? this.estimatePageCount(pdfBuffer) : undefined,
        file_size: pdfBuffer?.length,
        render_time_ms: renderTime,
        status: 'completed',
      });

      // Increment template usage count
      await this.repository.incrementUsageCount(template.id);

      const response: PdfRenderResponse = {
        success: true,
        renderId,
        fileUrl,
        previewUrl,
        filename: request.options?.filename,
        pageCount: pdfBuffer ? this.estimatePageCount(pdfBuffer) : undefined,
        fileSize: pdfBuffer?.length,
        renderTime,
        metadata: {
          templateName: template.name,
          templateVersion: templateVersion,
          renderedAt: new Date().toISOString(),
          expiresAt: request.options?.expiresIn
            ? new Date(
                Date.now() + request.options.expiresIn * 60 * 1000,
              ).toISOString()
            : undefined,
        },
      };

      console.log(
        '[PDF Template Service] Response object:',
        JSON.stringify(response, null, 2),
      );

      // Return PDF buffer directly for normal renders without file saving
      if (
        !request.options?.saveFile &&
        request.options?.renderType !== 'preview'
      ) {
        // Add buffer to response (in real implementation, you might want to stream this)
        response.buffer = pdfBuffer;
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error occurred';
      console.error('Error rendering PDF:', error);
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'N/A',
      );

      // Update render record with error
      if (renderId) {
        await this.repository.updateRender(renderId, {
          status: 'failed',
          error_message: errorMessage,
          render_time_ms: Date.now() - startTime,
        });
      }

      return {
        success: false,
        error: `PDF generation failed: ${errorMessage}`,
        renderId,
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
   * Get template starters
   */
  async getTemplateStarters(): Promise<PdfTemplate[]> {
    try {
      return await this.repository.getTemplateStarters();
    } catch (error) {
      console.error('Error getting template starters:', error);
      throw new Error(`Failed to get template starters: ${error.message}`);
    }
  }

  /**
   * Get active templates for actual use (excludes template starters)
   */
  async getActiveTemplatesForUse(): Promise<PdfTemplate[]> {
    try {
      return await this.repository.getActiveTemplatesForUse();
    } catch (error) {
      console.error('Error getting active templates for use:', error);
      throw new Error(
        `Failed to get active templates for use: ${error.message}`,
      );
    }
  }

  /**
   * Validate template
   */
  validateTemplate(templateData: PdfTemplateData): TemplateValidationResult {
    try {
      return this.handlebarsService.validateTemplate(templateData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown template validation error';
      return {
        isValid: false,
        errors: [message],
        warnings: [],
      };
    }
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(
    templateId: string,
    customData?: JsonObject,
  ): Promise<PdfRenderResponse> {
    try {
      const template = await this.repository.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Merge preview data with template metadata
      // This ensures logo_file_id and other template fields are available in the render context
      const previewData: JsonObject = {
        ...(template.sample_data ?? {}),
        ...(customData ?? {}),
        ...(template.logo_file_id
          ? { logo_file_id: template.logo_file_id }
          : {}),
      };

      return await this.renderPdf({
        templateName: template.name,
        data: previewData,
        options: {
          renderType: 'preview',
          filename: `preview_${template.name}_${Date.now()}.pdf`,
        },
      });
    } catch (error) {
      console.error('Error previewing template:', error);
      throw new Error(`Failed to preview template: ${error.message}`);
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(
    templateId: string,
    newName: string,
    userId?: string,
  ): Promise<PdfTemplate> {
    try {
      return await this.repository.duplicateTemplate(
        templateId,
        newName,
        userId,
      );
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
  registerCustomHelper(name: string, helper: HelperDelegate): void {
    this.handlebarsService.registerCustomHelper(name, helper);
  }

  // Private helper methods

  private getOrCompileTemplate(
    templateId: string,
    templateName: string,
    templateData: PdfTemplateData,
    version: string,
  ): CompiledTemplate {
    const cacheKey = `${templateId}_${version}`;

    const cachedTemplate = this.renderCache.get(cacheKey);
    if (cachedTemplate) {
      return cachedTemplate;
    }

    const compiled = this.handlebarsService.compileTemplate(
      templateId,
      templateName,
      templateData,
      version,
    );
    this.renderCache.set(cacheKey, compiled);

    return compiled;
  }

  private clearTemplateCache(templateId?: string): void {
    if (templateId) {
      const keysToDelete = Array.from(this.renderCache.keys()).filter((key) =>
        key.startsWith(templateId),
      );
      keysToDelete.forEach((key) => this.renderCache.delete(key));
    } else {
      this.renderCache.clear();
    }
  }

  private async generatePdfFromDefinition(
    docDefinition: TDocumentDefinitions,
  ): Promise<Buffer> {
    console.log('[generatePdfFromDefinition] Starting...');
    return new Promise((resolve, reject) => {
      try {
        console.log('[generatePdfFromDefinition] Requiring pdfmake...');
        const PdfMake =
          require('pdfmake/build/pdfmake') as typeof import('pdfmake/build/pdfmake');
        console.log('[generatePdfFromDefinition] PdfMake loaded');

        // Try to load Thai fonts
        try {
          console.log('[generatePdfFromDefinition] Loading VFS fonts...');
          const vfsFonts = require('pdfmake/build/vfs_fonts');
          if (vfsFonts?.pdfMake?.vfs) {
            PdfMake.vfs = vfsFonts.pdfMake.vfs;
            console.log('[generatePdfFromDefinition] VFS fonts loaded');
          }
        } catch (fontLoadError) {
          console.warn(
            '[generatePdfFromDefinition] VFS fonts not available, using default fonts',
            fontLoadError,
          );
        }

        console.log('[generatePdfFromDefinition] Creating PDF document...');
        const pdfDoc = PdfMake.createPdf(docDefinition);
        console.log(
          '[generatePdfFromDefinition] PDF document created, getting buffer...',
        );

        pdfDoc.getBuffer((buffer: Buffer) => {
          console.log(
            '[generatePdfFromDefinition] Buffer received, size:',
            buffer.length,
          );
          resolve(buffer);
        });
      } catch (error) {
        console.error('[generatePdfFromDefinition] ERROR:', error);
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

  /**
   * Resolve file markers (logo & asset) in document definition
   * Replaces __LOGO_{fileId}__ / __ASSET_{fileId}__ markers with base64 data URLs or empty objects
   */
  private async resolveFileMarkers<TDoc>(
    docDefinition: TDoc,
    template: PdfTemplate,
  ): Promise<TDoc> {
    console.log('[resolveFileMarkers] Starting marker resolution...');

    const escapeRegExp = (value: string): string =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    type MarkerType = 'LOGO' | 'ASSET';

    interface MarkerReference {
      markerType: MarkerType;
      fileId: string;
    }

    try {
      let jsonString = JSON.stringify(docDefinition);
      console.log(
        '[resolveFileMarkers] Document JSON (first 500 chars):',
        jsonString.substring(0, 500),
      );

      const markerRegex = /__(LOGO|ASSET)_([^_]+)__/g;
      const markerEntries = Array.from(jsonString.matchAll(markerRegex));

      console.log(
        `[resolveFileMarkers] Found ${markerEntries.length} marker(s):`,
        markerEntries.map((m) => `__${m[1]}_${m[2]}__`),
      );

      if (markerEntries.length === 0) {
        return docDefinition;
      }

      const markerMap = new Map<string, MarkerReference>();
      for (const entry of markerEntries) {
        const markerType = entry[1] as MarkerType;
        const fileId = entry[2];
        markerMap.set(`${markerType}:${fileId}`, { markerType, fileId });
      }

      if (!this.fileUploadService) {
        console.warn(
          '[PdfTemplateService] FileUploadService not available for marker resolution',
        );
        for (const { markerType, fileId } of markerMap.values()) {
          const regex = new RegExp(
            `"__${markerType}_${escapeRegExp(fileId)}__"`,
            'g',
          );
          jsonString = jsonString.replace(regex, '{}');
        }
        return JSON.parse(jsonString) as TDoc;
      }

      for (const { markerType, fileId } of markerMap.values()) {
        console.log(
          `[resolveFileMarkers] Processing ${markerType} marker with fileId: "${fileId}"`,
        );

        if (
          !fileId ||
          fileId === 'null' ||
          fileId === 'undefined' ||
          fileId.length < 10
        ) {
          console.log(
            `[PdfTemplateService] Skipping invalid ${markerType.toLowerCase()} marker: __${markerType}_${fileId}__ (replacing with empty object)`,
          );
          const regex = new RegExp(
            `"__${markerType}_${escapeRegExp(fileId)}__"`,
            'g',
          );
          jsonString = jsonString.replace(regex, '{}');
          continue;
        }

        try {
          console.log(
            `[resolveFileMarkers] Fetching file record for ${markerType} ${fileId}...`,
          );
          // Use findByIdRaw to bypass access control for PDF rendering
          const fileRecord =
            await this.fileUploadRepository.findByIdRaw(fileId);

          if (!fileRecord) {
            console.warn(
              `[PdfTemplateService] ${markerType} file ${fileId} not found for template ${template.name} - replacing with empty object`,
            );
            const regex = new RegExp(
              `"__${markerType}_${escapeRegExp(fileId)}__"`,
              'g',
            );
            jsonString = jsonString.replace(regex, '{}');
            continue;
          }

          // Generate signed URL manually using storage adapter
          const fileMetadata = {
            id: fileRecord.id,
            originalName: fileRecord.originalName,
            storageKey: fileRecord.filepath,
            mimeType: fileRecord.mimeType,
            fileSize: fileRecord.fileSize,
            isPublic: fileRecord.isPublic,
            isTemporary: fileRecord.isTemporary,
            uploadedBy: fileRecord.uploadedBy,
            expiresAt: fileRecord.expiresAt
              ? new Date(fileRecord.expiresAt)
              : undefined,
          };

          const signedUrls = await this.fileUploadService[
            'deps'
          ].storageAdapter.generateMultipleUrls(fileMetadata, {
            expiresIn: 3600,
          });

          const response = await fetch(signedUrls.urls.view);
          if (!response.ok) {
            console.warn(
              `[PdfTemplateService] Failed to fetch ${markerType.toLowerCase()} ${fileId}: ${response.statusText} - replacing with empty object`,
            );
            const regex = new RegExp(
              `"__${markerType}_${escapeRegExp(fileId)}__"`,
              'g',
            );
            jsonString = jsonString.replace(regex, '{}');
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          const fileBuffer = Buffer.from(arrayBuffer);

          const base64Data = fileBuffer.toString('base64');
          const fallbackMime =
            markerType === 'LOGO' ? 'image/png' : 'application/octet-stream';
          const mimeType = fileRecord.mimeType || fallbackMime;
          const dataUrl = `data:${mimeType};base64,${base64Data}`;

          console.log(
            `[PdfTemplateService] ✅ Resolved ${markerType.toLowerCase()} ${fileId} (${fileRecord.originalName}) - ${Math.round(fileBuffer.length / 1024)}KB`,
          );

          const regex = new RegExp(
            `"__${markerType}_${escapeRegExp(fileId)}__"`,
            'g',
          );
          jsonString = jsonString.replace(regex, `"${dataUrl}"`);
        } catch (err) {
          console.error(
            `[PdfTemplateService] Error resolving ${markerType.toLowerCase()} ${fileId}:`,
            err,
          );
          const regex = new RegExp(
            `"__${markerType}_${escapeRegExp(fileId)}__"`,
            'g',
          );
          jsonString = jsonString.replace(regex, '{}');
        }
      }

      return JSON.parse(jsonString) as TDoc;
    } catch (error) {
      console.error('Error resolving file markers:', error);
      return docDefinition;
    }
  }

  private ensureRenderDir(): void {
    if (!fs.existsSync(this.renderDir)) {
      fs.mkdirSync(this.renderDir, { recursive: true });
    }
  }
}
