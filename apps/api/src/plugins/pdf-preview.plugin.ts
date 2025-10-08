import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { pdfPreviewRoutes } from '../routes/pdf-preview.routes';

/**
 * PDF Preview Plugin
 * 
 * Registers PDF preview routes and functionality
 * Provides server-side PDF generation and preview capabilities
 */
const pdfPreviewPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register PDF preview routes under /pdf-preview
  await fastify.register(pdfPreviewRoutes, { prefix: '/pdf-preview' });

  // Log plugin registration
  fastify.log.info('PDF Preview plugin registered successfully');
};

export default fp(pdfPreviewPlugin, {
  name: 'pdf-preview',
  dependencies: []
});