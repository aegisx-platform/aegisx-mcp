import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(
  async function schemaEnforcementPlugin(fastify: FastifyInstance) {
    // Hook to validate that all routes have schemas
    fastify.addHook('onRoute', (routeOptions) => {
      // Skip internal Fastify routes and health checks without prefix
      if (
        routeOptions.url === '/health' ||
        routeOptions.url.startsWith('/.well-known/') ||
        routeOptions.url.includes('*')
      ) {
        return;
      }

      // Skip Swagger UI routes
      if (
        routeOptions.url.includes('/documentation') ||
        routeOptions.url.includes('/api-docs') ||
        routeOptions.url.includes('/swagger')
      ) {
        return;
      }

      // Skip existing auth and user-profile routes temporarily (they need to be updated separately)
      if (
        routeOptions.url.includes('/auth/') ||
        routeOptions.url.includes('/users/')
      ) {
        return;
      }

      // Ensure all API routes have complete schema definition
      if (!routeOptions.schema) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have schema definition`,
        );
      }

      // Ensure all routes have response schemas
      if (!routeOptions.schema.response) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have response schema`,
        );
      }

      // Ensure POST/PUT/PATCH routes have body schemas (except multipart/form-data uploads)
      const methodArray = Array.isArray(routeOptions.method)
        ? routeOptions.method
        : [routeOptions.method];
      const hasPostPutPatch = methodArray.some((method) =>
        ['POST', 'PUT', 'PATCH'].includes(method),
      );

      // Cast schema to any for additional properties (tags, description, summary, consumes)
      const extendedSchema = routeOptions.schema as any;

      // Check if route accepts multipart/form-data
      const isMultipartUpload = extendedSchema?.consumes?.includes(
        'multipart/form-data',
      );

      if (hasPostPutPatch && !routeOptions.schema.body && !isMultipartUpload) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have body schema`,
        );
      }

      // Ensure routes with params have params schema
      if (routeOptions.url.includes(':') && !routeOptions.schema.params) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have params schema`,
        );
      }

      // Ensure all routes have tags for Swagger organization
      if (!extendedSchema.tags || extendedSchema.tags.length === 0) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have tags for Swagger documentation`,
        );
      }

      // Ensure all routes have description
      if (!extendedSchema.description) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have description`,
        );
      }

      // Ensure all routes have summary
      if (!extendedSchema.summary) {
        throw new Error(
          `Route ${routeOptions.method} ${routeOptions.url} must have summary`,
        );
      }
    });

    // Hook to add standard error responses if not specified
    fastify.addHook('onRoute', (routeOptions) => {
      if (routeOptions.schema?.response) {
        const responses = routeOptions.schema.response;

        // Add standard server error response if missing
        if (!responses['500']) {
          responses['500'] = { $ref: 'serverErrorResponse#' };
        }
      }
    });

    // Log schema enforcement activation
    fastify.log.info(
      'Schema enforcement plugin activated - all routes must have complete schemas',
    );
  },
  {
    name: 'schema-enforcement-plugin',
  },
);
