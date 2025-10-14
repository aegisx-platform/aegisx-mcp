import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { PdfTemplateService } from '../../../services/pdf-template.service';
import { PdfTemplateData } from '../../../types/pdf-template.types';
import {
  CreatePdfTemplateSchema,
  UpdatePdfTemplateSchema,
  PdfTemplateIdParamSchema,
  PdfTemplateListQuerySchema,
  PdfRenderRequestSchema,
  PdfTemplateSearchQuerySchema,
  PdfTemplatePreviewRequestSchema,
} from '../../../schemas/pdf-template.schemas';

/**
 * PDF Template Routes
 *
 * Provides comprehensive PDF template management and rendering API
 */
export async function pdfTemplateRoutes(fastify: FastifyInstance) {
  // Create PDF Template Service and inject FileUploadService from fastify instance
  const templateService = new PdfTemplateService(fastify.knex);
  templateService.setFileUploadService(fastify.fileUploadService);

  /**
   * Create PDF Template
   * POST /api/pdf-templates
   */
  fastify.post<{
    Body: Static<typeof CreatePdfTemplateSchema>;
  }>(
    '/',
    {
      schema: {
        description: 'Create a new PDF template',
        tags: ['PDF Templates'],
        body: CreatePdfTemplateSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{ Body: Static<typeof CreatePdfTemplateSchema> }>,
      reply: FastifyReply,
    ) => {
      try {
        const template = await templateService.createTemplate(
          request.body,
          request.user?.id,
        );

        request.log.info(
          {
            templateId: template.id,
            templateName: template.name,
          },
          'PDF template created successfully',
        );

        return reply.code(201).send({
          success: true,
          data: template,
          message: 'Template created successfully',
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to create PDF template');

        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get PDF Template by ID
   * GET /api/pdf-templates/:id
   */
  fastify.get<{
    Params: Static<typeof PdfTemplateIdParamSchema>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Get PDF template by ID',
        tags: ['PDF Templates'],
        params: PdfTemplateIdParamSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
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
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: Static<typeof PdfTemplateIdParamSchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const template = await templateService.getTemplate(request.params.id);

        if (!template) {
          return reply.code(404).send({
            success: false,
            error: 'Template not found',
          });
        }

        return reply.send({
          success: true,
          data: template,
        });
      } catch (error) {
        request.log.error(
          { error, templateId: request.params.id },
          'Failed to get PDF template',
        );

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * List PDF Templates
   * GET /api/pdf-templates
   */
  fastify.get<{
    Querystring: Static<typeof PdfTemplateListQuerySchema>;
  }>(
    '/',
    {
      schema: {
        description: 'List PDF templates with filtering and pagination',
        tags: ['PDF Templates'],
        querystring: PdfTemplateListQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
              pagination: { type: 'object' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Querystring: Static<typeof PdfTemplateListQuerySchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const result = await templateService.listTemplates(request.query);

        return reply.send({
          success: true,
          data: result.data,
          pagination: result.pagination,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to list PDF templates');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Update PDF Template
   * PUT /api/pdf-templates/:id
   */
  fastify.put<{
    Params: Static<typeof PdfTemplateIdParamSchema>;
    Body: Static<typeof UpdatePdfTemplateSchema>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Update PDF template',
        tags: ['PDF Templates'],
        params: PdfTemplateIdParamSchema,
        body: UpdatePdfTemplateSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: Static<typeof PdfTemplateIdParamSchema>;
        Body: Static<typeof UpdatePdfTemplateSchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const template = await templateService.updateTemplate(
          request.params.id,
          request.body,
          request.user?.id,
        );

        request.log.info(
          {
            templateId: template.id,
            templateName: template.name,
          },
          'PDF template updated successfully',
        );

        return reply.send({
          success: true,
          data: template,
          message: 'Template updated successfully',
        });
      } catch (error) {
        request.log.error(
          { error, templateId: request.params.id },
          'Failed to update PDF template',
        );

        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Delete PDF Template
   * DELETE /api/pdf-templates/:id
   */
  fastify.delete<{
    Params: Static<typeof PdfTemplateIdParamSchema>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Delete PDF template',
        tags: ['PDF Templates'],
        params: PdfTemplateIdParamSchema,
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
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: Static<typeof PdfTemplateIdParamSchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const deleted = await templateService.deleteTemplate(request.params.id);

        if (!deleted) {
          return reply.code(404).send({
            success: false,
            error: 'Template not found',
          });
        }

        request.log.info(
          {
            templateId: request.params.id,
          },
          'PDF template deleted successfully',
        );

        return reply.send({
          success: true,
          message: 'Template deleted successfully',
        });
      } catch (error) {
        request.log.error(
          { error, templateId: request.params.id },
          'Failed to delete PDF template',
        );

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Render PDF from Template
   * POST /api/pdf-templates/render
   */
  fastify.post<{
    Body: Static<typeof PdfRenderRequestSchema>;
  }>(
    '/render',
    {
      schema: {
        description: 'Render PDF from template with data',
        tags: ['PDF Templates'],
        body: PdfRenderRequestSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{ Body: Static<typeof PdfRenderRequestSchema> }>,
      reply: FastifyReply,
    ) => {
      try {
        const result = await templateService.renderPdf(
          request.body,
          request.user?.id,
          request.ip,
          request.headers['user-agent'],
        );

        if (!result.success) {
          return reply.code(400).send({
            success: false,
            error: result.error,
          });
        }

        // If we have a buffer (direct render), send it as PDF
        if (result.buffer) {
          const buffer = result.buffer;

          reply
            .header('Content-Type', 'application/pdf')
            .header(
              'Content-Disposition',
              `inline; filename="${result.filename || 'document.pdf'}"`,
            )
            .header('Content-Length', buffer.length);

          return reply.send(buffer);
        }

        // Otherwise return JSON response with URLs
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to render PDF');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Preview Template
   * POST /api/pdf-templates/:id/preview
   */
  fastify.post<{
    Params: Static<typeof PdfTemplateIdParamSchema>;
    Body: Static<typeof PdfTemplatePreviewRequestSchema>;
  }>(
    '/:id/preview',
    {
      schema: {
        description: 'Preview PDF template with sample or custom data',
        tags: ['PDF Templates'],
        params: PdfTemplateIdParamSchema,
        body: PdfTemplatePreviewRequestSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              renderId: { type: 'string' },
              previewUrl: { type: 'string' },
              filename: { type: 'string' },
              renderTime: { type: 'number' },
              metadata: {
                type: 'object',
                properties: {
                  templateName: { type: 'string' },
                  templateVersion: { type: 'string' },
                  renderedAt: { type: 'string' },
                  expiresAt: { type: 'string' },
                },
              },
            },
            required: ['success'],
            additionalProperties: true,
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: Static<typeof PdfTemplateIdParamSchema>;
        Body: Static<typeof PdfTemplatePreviewRequestSchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const result = await templateService.previewTemplate(
          request.params.id,
          request.body.data,
        );

        // Return the response directly - it already has success: true
        return reply.send(result);
      } catch (error) {
        request.log.error(
          { error, templateId: request.params.id },
          'Failed to preview template',
        );

        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Validate Template
   * POST /api/pdf-templates/validate
   */
  fastify.post<{
    Body: { template_data: PdfTemplateData };
  }>(
    '/validate',
    {
      schema: {
        description: 'Validate PDF template structure and syntax',
        tags: ['PDF Templates'],
        body: {
          type: 'object',
          properties: {
            template_data: { type: 'object' },
          },
          required: ['template_data'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{ Body: { template_data: PdfTemplateData } }>,
      reply: FastifyReply,
    ) => {
      try {
        const validation = templateService.validateTemplate(
          request.body.template_data,
        );

        return reply.send({
          success: true,
          data: validation,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to validate template');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Search Templates
   * GET /api/pdf-templates/search
   */
  fastify.get<{
    Querystring: Static<typeof PdfTemplateSearchQuerySchema>;
  }>(
    '/search',
    {
      schema: {
        description: 'Search PDF templates by content',
        tags: ['PDF Templates'],
        querystring: PdfTemplateSearchQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Querystring: Static<typeof PdfTemplateSearchQuerySchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const templates = await templateService.searchTemplates(
          request.query.q,
        );

        return reply.send({
          success: true,
          data: templates,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to search templates');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Duplicate Template
   * POST /api/pdf-templates/:id/duplicate
   */
  fastify.post<{
    Params: Static<typeof PdfTemplateIdParamSchema>;
    Body: { name: string };
  }>(
    '/:id/duplicate',
    {
      schema: {
        description: 'Duplicate PDF template',
        tags: ['PDF Templates'],
        params: PdfTemplateIdParamSchema,
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
          },
          required: ['name'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: Static<typeof PdfTemplateIdParamSchema>;
        Body: { name: string };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const template = await templateService.duplicateTemplate(
          request.params.id,
          request.body.name,
          request.user?.id,
        );

        request.log.info(
          {
            originalId: request.params.id,
            newId: template.id,
            newName: template.name,
          },
          'PDF template duplicated successfully',
        );

        return reply.code(201).send({
          success: true,
          data: template,
          message: 'Template duplicated successfully',
        });
      } catch (error) {
        request.log.error(
          { error, templateId: request.params.id },
          'Failed to duplicate template',
        );

        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Template Versions
   * GET /api/pdf-templates/:id/versions
   */
  fastify.get<{
    Params: Static<typeof PdfTemplateIdParamSchema>;
  }>(
    '/:id/versions',
    {
      schema: {
        description: 'Get PDF template version history',
        tags: ['PDF Templates'],
        params: PdfTemplateIdParamSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: Static<typeof PdfTemplateIdParamSchema>;
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const versions = await templateService.getTemplateVersions(
          request.params.id,
        );

        return reply.send({
          success: true,
          data: versions,
        });
      } catch (error) {
        request.log.error(
          { error, templateId: request.params.id },
          'Failed to get template versions',
        );

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Template Statistics
   * GET /api/pdf-templates/stats
   */
  fastify.get(
    '/stats',
    {
      schema: {
        description: 'Get PDF template usage statistics',
        tags: ['PDF Templates'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = await templateService.getStats();

        return reply.send({
          success: true,
          data: stats,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get template stats');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Template Categories
   * GET /api/pdf-templates/categories
   */
  fastify.get(
    '/categories',
    {
      schema: {
        description: 'Get PDF template categories',
        tags: ['PDF Templates'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const categories = await templateService.getCategories();

        return reply.send({
          success: true,
          data: categories,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get template categories');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Template Types
   * GET /api/pdf-templates/types
   */
  fastify.get(
    '/types',
    {
      schema: {
        description: 'Get PDF template types',
        tags: ['PDF Templates'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const types = await templateService.getTypes();

        return reply.send({
          success: true,
          data: types,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get template types');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Available Handlebars Helpers
   * GET /api/pdf-templates/helpers
   */
  fastify.get(
    '/helpers',
    {
      schema: {
        description: 'Get available Handlebars helpers for templates',
        tags: ['PDF Templates'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const helpers = templateService.getAvailableHelpers();

        return reply.send({
          success: true,
          data: helpers,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get template helpers');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Template Starters
   * GET /api/pdf-templates/starters
   */
  fastify.get(
    '/starters',
    {
      schema: {
        description: 'Get PDF template starters for creating new templates',
        tags: ['PDF Templates'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const starters = await templateService.getTemplateStarters();

        return reply.send({
          success: true,
          data: starters,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get template starters');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );

  /**
   * Get Active Templates for Use (excludes template starters)
   * GET /api/pdf-templates/for-use
   */
  fastify.get(
    '/for-use',
    {
      schema: {
        description:
          'Get active PDF templates for actual use (excludes template starters)',
        tags: ['PDF Templates'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const templates = await templateService.getActiveTemplatesForUse();

        return reply.send({
          success: true,
          data: templates,
        });
      } catch (error) {
        request.log.error({ error }, 'Failed to get active templates for use');

        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  );
}
