import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
  async function swaggerPlugin(fastify: FastifyInstance) {
    // Register Swagger OpenAPI documentation generation
    await fastify.register(fastifySwagger, {
      mode: 'dynamic',
      openapi: {
        openapi: '3.0.3',
        info: {
          title: 'AegisX Platform API',
          description: `
Complete API specification for the AegisX Platform including all UI library endpoints.

This API provides comprehensive functionality for:
- Authentication and session management
- User profile and preferences management
- Navigation structure and menu management
- Application settings and themes
- System monitoring and health checks

## Authentication

Most endpoints require authentication via JWT Bearer tokens. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Error Handling

All API responses follow a consistent format with a \`success\` boolean and standardized error structure.

## Rate Limiting

API requests are rate limited to prevent abuse. Rate limit headers are included in responses.
          `,
          version: '1.0.0',
          contact: {
            name: 'AegisX Platform Team',
            url: 'https://github.com/aegisx-platform',
            email: 'support@aegisx.com',
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
          termsOfService: 'https://aegisx.com/terms',
        },
        servers: [
          {
            url: 'http://localhost:3333',
            description: 'Development server',
          },
          {
            url: 'https://staging-api.aegisx.com',
            description: 'Staging server',
          },
          {
            url: 'https://api.aegisx.com',
            description: 'Production server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'JWT Bearer token authentication',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
        tags: [
          {
            name: 'Documentation',
            description: 'OpenAPI specification and documentation endpoints',
          },
          {
            name: 'System',
            description: 'System information and health check endpoints',
          },
          {
            name: 'Authentication',
            description: 'Authentication and session management endpoints',
          },
          {
            name: 'Navigation',
            description: 'Navigation structure and menu management',
          },
          {
            name: 'User Profile',
            description: 'User profile and preferences management',
          },
          {
            name: 'Settings',
            description: 'Application settings and configuration',
          },
        ],
      },
      hideUntagged: false,
      stripBasePath: false,
    });

    // Register Swagger UI
    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'none',
      },
    });

    // Add JSON endpoint for programmatic access
    // Use serverInfo.apiPrefix to avoid duplication
    const apiPrefix = (fastify as any).serverInfo?.apiPrefix || '/api';
    fastify.get(
      `${apiPrefix}/documentation/json`,
      {
        schema: {
          tags: ['Documentation'],
          description: 'Get OpenAPI specification in JSON format',
          response: {
            200: {
              type: 'object',
              description: 'OpenAPI 3.0.3 specification',
            },
          },
        },
      },
      async (request, reply) => {
        return fastify.swagger();
      },
    );

    // Log Swagger setup
    fastify.log.info('Swagger OpenAPI documentation configured');
    fastify.log.info('Swagger UI available at: /documentation');
    fastify.log.info(
      `OpenAPI JSON available at: ${apiPrefix}/documentation/json`,
    );
  },
  {
    name: 'swagger-plugin',
    dependencies: ['schemas-plugin'],
  },
);
