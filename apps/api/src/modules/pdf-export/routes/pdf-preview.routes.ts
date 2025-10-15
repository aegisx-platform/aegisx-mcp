import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import {
  PDFMakeService,
  PdfExportOptions,
} from '../../../services/pdfmake.service';
import {
  PdfPreviewRequestSchema,
  PdfPreviewResponseSchema,
  PdfTemplateSchema,
} from '../../../schemas/pdf-preview.schemas';
import * as fs from 'fs';

/**
 * PDF Preview Routes
 *
 * Provides server-side PDF preview functionality using PDFMakeService
 * Supports template-based PDF generation and file serving
 */
export async function pdfPreviewRoutes(fastify: FastifyInstance) {
  const pdfMakeService = new PDFMakeService();

  /**
   * Generate PDF Preview
   * POST /api/pdf-preview/generate
   */
  fastify.post<{
    Body: Static<typeof PdfPreviewRequestSchema>;
    Reply: Static<typeof PdfPreviewResponseSchema>;
  }>(
    '/generate',
    {
      schema: {
        description: 'Generate PDF preview with template support',
        tags: ['PDF Preview'],
        body: PdfPreviewRequestSchema,
        response: {
          200: PdfPreviewResponseSchema,
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: Static<typeof PdfPreviewRequestSchema> }>,
      reply: FastifyReply,
    ) => {
      try {
        const {
          data,
          fields,
          title,
          subtitle,
          template = 'professional',
          pageSize = 'A4',
          orientation,
          showSummary = true,
          groupBy,
          logo,
          metadata,
        } = request.body;

        // Validate data
        if (!data || !Array.isArray(data)) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid data format. Expected array of objects.',
          });
        }

        // Prepare PDF export options
        const pdfOptions: PdfExportOptions = {
          data,
          fields: fields?.map((field) => ({
            ...field,
            format: undefined, // Remove format string as it needs to be a function
          })),
          title,
          subtitle,
          template,
          pageSize,
          orientation,
          showSummary,
          groupBy,
          logo,
          metadata: {
            ...metadata,
            exportedBy:
              (request.user as any)?.username ||
              (request.user as any)?.email ||
              'System',
            exportedAt: new Date(),
            totalRecords: data.length,
          },
          preview: true,
        };

        // Generate preview
        const previewResult = await pdfMakeService.generatePreview(pdfOptions);

        if (!previewResult.success) {
          return reply.code(500).send({
            success: false,
            error: previewResult.error || 'Preview generation failed',
          });
        }

        // Log successful preview generation
        request.log.info(
          {
            template,
            dataRows: data.length,
            fieldsCount: fields?.length || 0,
            previewUrl: previewResult.previewUrl,
          },
          'PDF preview generated successfully',
        );

        return reply.send({
          success: true,
          previewUrl: previewResult.previewUrl,
          documentDefinition: previewResult.documentDefinition,
          metadata: {
            template,
            pageSize,
            orientation:
              orientation ||
              (fields && fields.length > 6 ? 'landscape' : 'portrait'),
            recordCount: data.length,
            fieldsCount: fields?.length || 0,
            generatedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        request.log.error({ error }, 'PDF preview generation failed');

        return reply.code(500).send({
          success: false,
          error: `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    },
  );

  /**
   * Serve PDF Preview File
   * GET /api/pdf-preview/:previewId
   */
  fastify.get<{
    Params: { previewId: string };
  }>(
    '/:previewId',
    {
      schema: {
        description: 'Serve PDF preview file by ID',
        tags: ['PDF Preview'],
        params: {
          type: 'object',
          properties: {
            previewId: { type: 'string' },
          },
          required: ['previewId'],
        },
        response: {
          200: {
            type: 'string',
            format: 'binary',
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { previewId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { previewId } = request.params;

        // Validate preview ID format
        if (!previewId || !previewId.match(/^preview_\d+_[a-z0-9]+$/)) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid preview ID format',
          });
        }

        // Try to get preview file path from PDFMake service (export system)
        let previewFilePath = pdfMakeService.getPreviewFile(previewId);

        // If not found, try template render directory (template system)
        if (!previewFilePath || !fs.existsSync(previewFilePath)) {
          const path = require('path');
          const renderDir = path.join(process.cwd(), 'temp', 'pdf-renders');
          const templatePreviewPath = path.join(renderDir, previewId);

          if (fs.existsSync(templatePreviewPath)) {
            previewFilePath = templatePreviewPath;
          }
        }

        if (!previewFilePath || !fs.existsSync(previewFilePath)) {
          return reply.code(404).send({
            success: false,
            error: 'Preview file not found or expired',
          });
        }

        // Set appropriate headers for PDF
        reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `inline; filename="${previewId}.pdf"`)
          .header('Cache-Control', 'no-cache, no-store, must-revalidate')
          .header('Pragma', 'no-cache')
          .header('Expires', '0');

        // Stream the file
        const fileStream = fs.createReadStream(previewFilePath);

        request.log.info(
          {
            previewId,
            filePath: previewFilePath,
          },
          'Serving PDF preview file',
        );

        return reply.send(fileStream);
      } catch (error) {
        request.log.error(
          { error, previewId: request.params.previewId },
          'Failed to serve preview file',
        );

        return reply.code(500).send({
          success: false,
          error: 'Failed to serve preview file',
        });
      }
    },
  );

  /**
   * Get Available Templates
   * GET /api/pdf-preview/templates
   */
  fastify.get(
    '/templates',
    {
      schema: {
        description: 'Get list of available PDF templates',
        tags: ['PDF Preview'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              templates: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    displayName: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const availableTemplates = pdfMakeService.getAvailableTemplates();

        const templateInfo = availableTemplates.map((templateName) => {
          const template = pdfMakeService.getTemplate(templateName);
          return {
            name: templateName,
            displayName: template?.name || templateName,
            description: getTemplateDescription(templateName),
          };
        });

        return reply.send({
          success: true,
          templates: templateInfo,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get templates');

        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve templates',
        });
      }
    },
  );

  /**
   * Register Custom Template
   * POST /api/pdf-preview/templates/register
   */
  fastify.post<{
    Body: Static<typeof PdfTemplateSchema>;
  }>(
    '/templates/register',
    {
      schema: {
        description: 'Register custom PDF template',
        tags: ['PDF Preview'],
        body: PdfTemplateSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              templateName: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: Static<typeof PdfTemplateSchema> }>,
      reply: FastifyReply,
    ) => {
      try {
        const template = request.body;

        // Validate template
        if (!template.name || !template.styles) {
          return reply.code(400).send({
            success: false,
            error: 'Template must have name and styles',
          });
        }

        // Register template with proper type conversion
        const properTemplate: any = {
          name: template.name,
          layout: template.layout,
          styles: template.styles,
          pageMargins:
            template.pageMargins?.length === 4
              ? (template.pageMargins as [number, number, number, number])
              : ([40, 60, 40, 60] as [number, number, number, number]),
          watermark: template.watermark,
          // Skip header and footer as they need to be functions, not strings
        };
        pdfMakeService.registerTemplate(properTemplate);

        request.log.info(
          {
            templateName: template.name,
          },
          'Custom template registered successfully',
        );

        return reply.send({
          success: true,
          message: 'Template registered successfully',
          templateName: template.name,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to register template');

        return reply.code(500).send({
          success: false,
          error: 'Failed to register template',
        });
      }
    },
  );

  /**
   * Cleanup Old Previews
   * DELETE /api/pdf-preview/cleanup
   */
  fastify.delete(
    '/cleanup',
    {
      schema: {
        description: 'Clean up old preview files',
        tags: ['PDF Preview'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await pdfMakeService.cleanupPreviews();

        request.log.info('Preview cleanup completed');

        return reply.send({
          success: true,
          message: 'Preview files cleaned up successfully',
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to cleanup previews');

        return reply.code(500).send({
          success: false,
          error: 'Failed to cleanup preview files',
        });
      }
    },
  );
}

// Helper functions
function getTemplateDescription(templateName: string): string {
  const descriptions = {
    professional:
      'Clean, professional layout with headers, footers, and proper spacing',
    minimal: 'Simple, minimalist design with clean lines and minimal styling',
    standard:
      'Standard business format with balanced styling and clear structure',
  };

  return descriptions[templateName] || 'Custom template';
}
