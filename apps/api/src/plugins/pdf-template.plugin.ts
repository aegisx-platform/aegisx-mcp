import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { pdfTemplateRoutes } from '../routes/pdf-template.routes';

/**
 * PDF Template Plugin
 * 
 * Registers PDF template management and rendering functionality
 * Provides dynamic template-based PDF generation with Handlebars
 */
const pdfTemplatePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register PDF template routes under /pdf-templates
  await fastify.register(pdfTemplateRoutes, { prefix: '/pdf-templates' });

  // Log plugin registration
  fastify.log.info('PDF Template plugin registered successfully');
};

export default fp(pdfTemplatePlugin, {
  name: 'pdf-template',
  dependencies: []
});