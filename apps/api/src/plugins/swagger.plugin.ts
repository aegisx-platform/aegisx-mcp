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
          // === Core Platform ===
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

          // === Inventory: Organization ===
          {
            name: 'Inventory: Locations',
            description:
              'Storage locations management (warehouses, rooms, shelves)',
          },
          {
            name: 'Inventory: Departments',
            description: 'Hospital departments management',
          },
          {
            name: 'Inventory: Bank',
            description: 'Bank accounts for payment processing',
          },

          // === Inventory: Budget Structure ===
          {
            name: 'Inventory: Budget Types',
            description: 'Budget type definitions',
          },
          {
            name: 'Inventory: Budget Categories',
            description: 'Budget category classifications',
          },
          {
            name: 'Inventory: Budgets',
            description: 'Master budget management',
          },

          // === Inventory: Drug & Company ===
          {
            name: 'Inventory: Drug Generics',
            description: 'Generic drug names (e.g., Paracetamol, Amoxicillin)',
          },
          {
            name: 'Inventory: Drugs',
            description: 'Drug master data with trade names and pricing',
          },
          {
            name: 'Inventory: Companies',
            description: 'Pharmaceutical companies and vendors',
          },

          // === Inventory: Drug Information ===
          {
            name: 'Inventory: Drug Components',
            description: 'Drug active ingredients and compositions',
          },
          {
            name: 'Inventory: Drug Focus Lists',
            description: 'Drug classification lists (High Alert, LASA, etc.)',
          },
          {
            name: 'Inventory: Drug Pack Ratios',
            description: 'Drug packaging ratios and conversions',
          },

          // === Inventory: Lookup Tables ===
          {
            name: 'Inventory: Dosage Forms',
            description: 'Drug dosage forms (tablet, capsule, injection, etc.)',
          },
          {
            name: 'Inventory: Drug Units',
            description: 'Units of measurement for drugs',
          },
          {
            name: 'Inventory: Adjustment Reasons',
            description: 'Reasons for inventory adjustments',
          },
          {
            name: 'Inventory: Return Actions',
            description: 'Actions for drug returns',
          },
        ],
        'x-tagGroups': [
          {
            name: '🔧 Core Platform',
            tags: [
              'Documentation',
              'System',
              'Authentication',
              'Navigation',
              'User Profile',
              'Settings',
            ],
          },
          {
            name: '🏥 Inventory: Organization',
            tags: [
              'Inventory: Locations',
              'Inventory: Departments',
              'Inventory: Bank',
            ],
          },
          {
            name: '💰 Inventory: Budget',
            tags: [
              'Inventory: Budget Types',
              'Inventory: Budget Categories',
              'Inventory: Budgets',
            ],
          },
          {
            name: '💊 Inventory: Drug & Company',
            tags: [
              'Inventory: Drug Generics',
              'Inventory: Drugs',
              'Inventory: Companies',
            ],
          },
          {
            name: '🧪 Inventory: Drug Information',
            tags: [
              'Inventory: Drug Components',
              'Inventory: Drug Focus Lists',
              'Inventory: Drug Pack Ratios',
            ],
          },
          {
            name: '📚 Inventory: Lookup Tables',
            tags: [
              'Inventory: Dosage Forms',
              'Inventory: Drug Units',
              'Inventory: Adjustment Reasons',
              'Inventory: Return Actions',
            ],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, // Type assertion for Redoc x-tagGroups extension
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

    // Log Swagger setup
    fastify.log.info('Swagger OpenAPI documentation configured');
    fastify.log.info('Swagger UI available at: /documentation');
    fastify.log.info('OpenAPI JSON available at: /documentation/json');
  },
  {
    name: 'swagger-plugin',
    dependencies: ['schemas-plugin'],
  },
);
