import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import * as path from 'path';
import * as fs from 'fs/promises';

async function staticFilesPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // Get API prefix from serverInfo to avoid duplication
  const apiPrefix = (fastify as any).serverInfo?.apiPrefix || '/api';

  // Serve avatar files
  fastify.route({
    method: 'GET',
    url: `${apiPrefix}/uploads/avatars/:filename`,
    schema: {
      description: 'Serve avatar image files',
      tags: ['Files'],
      summary: 'Get avatar image',
      params: {
        type: 'object',
        required: ['filename'],
        properties: {
          filename: {
            type: 'string',
            pattern: '^[a-zA-Z0-9._-]+\\.(jpg|jpeg|png|webp)$',
            description: 'Avatar filename',
          },
        },
      },
      response: {
        200: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean', const: false },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { filename } = request.params as { filename: string };

      // Basic security: only allow certain file extensions
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(filename).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        return reply.notFound();
      }

      // Prevent directory traversal
      if (
        filename.includes('..') ||
        filename.includes('/') ||
        filename.includes('\\')
      ) {
        return reply.notFound();
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
      const filePath = path.join(uploadsDir, filename);

      try {
        // Check if file exists
        await fs.access(filePath);

        // Set appropriate content type
        const contentTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
        };

        reply.type(contentTypes[ext] || 'application/octet-stream');

        // Set caching headers
        reply.header('Cache-Control', 'public, max-age=31536000'); // 1 year
        reply.header('ETag', `"${filename}"`);

        // Stream the file
        const stream = require('fs').createReadStream(filePath);
        return reply.send(stream);
      } catch (_error) {
        return reply.notFound();
      }
    },
  });

  fastify.log.info('Static files plugin registered successfully');
}

export default fp(staticFilesPlugin, {
  name: 'static-files-plugin',
});
