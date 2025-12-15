import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { pdfPreviewRoutes } from './routes/pdf-preview.routes.js';
import { pdfTemplateRoutes } from './routes/pdf-template.routes.js';
import { pdfFontsRoutes } from './routes/pdf-fonts.routes.js';

/**
 * Platform PDF Export Module
 *
 * Comprehensive PDF generation and management system including:
 * - PDF preview generation
 * - PDF template management
 * - PDF font management with Thai language support
 */
export default async function platformPdfExportPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Register all PDF-related routes with prefix
  const prefix = options.prefix || '/v1/platform/pdf';

  await fastify.register(pdfPreviewRoutes, { prefix: `${prefix}/preview` });
  await fastify.register(pdfTemplateRoutes, { prefix: `${prefix}/templates` });
  await fastify.register(pdfFontsRoutes, { prefix: `${prefix}/fonts` });

  // Lifecycle hook
  fastify.addHook('onReady', async () => {
    fastify.log.info('Platform PDF Export module registered successfully');
  });
}
