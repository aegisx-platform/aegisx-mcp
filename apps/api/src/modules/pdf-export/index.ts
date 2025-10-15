import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { pdfPreviewRoutes } from './routes/pdf-preview.routes.js';
import { pdfTemplateRoutes } from './routes/pdf-template.routes.js';
import { pdfFontsRoutes } from './routes/pdf-fonts.routes.js';

/**
 * PDF Export Module
 *
 * Comprehensive PDF generation and management system including:
 * - PDF preview generation
 * - PDF template management
 * - PDF font management with Thai language support
 */
const pdfExportPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  // Register all PDF-related routes
  await fastify.register(pdfPreviewRoutes, { prefix: '/pdf-preview' });
  await fastify.register(pdfTemplateRoutes, { prefix: '/pdf-templates' });
  await fastify.register(pdfFontsRoutes, { prefix: '/pdf-fonts' });

  // Log plugin registration
  fastify.log.info('PDF Export module registered successfully');
};

export default fp(pdfExportPlugin, {
  name: 'pdf-export',
  dependencies: [],
});
