import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { pdfFontsRoutes } from '../routes/pdf-fonts.routes';

/**
 * PDF Fonts Plugin
 *
 * Registers PDF fonts management routes
 */
export default fp(
  async function pdfFontsPlugin(fastify: FastifyInstance) {
    // Register PDF fonts routes under /api/pdf-fonts
    await fastify.register(pdfFontsRoutes, { prefix: '/api/pdf-fonts' });

    fastify.log.info('PDF Fonts plugin registered successfully');
  },
  {
    name: 'pdf-fonts',
    dependencies: [],
  }
);