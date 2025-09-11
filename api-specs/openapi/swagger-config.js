/**
 * Swagger Configuration for AegisX Platform API
 *
 * This configuration can be used with @fastify/swagger to serve OpenAPI documentation
 * and generate interactive API documentation with Swagger UI.
 *
 * Usage in Fastify:
 *
 * ```javascript
 * import { swaggerConfig, swaggerUiConfig } from './openapi/swagger-config.js';
 *
 * // Register swagger
 * await fastify.register(import('@fastify/swagger'), swaggerConfig);
 *
 * // Register swagger UI
 * await fastify.register(import('@fastify/swagger-ui'), swaggerUiConfig);
 * ```
 */

export const swaggerConfig = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'AegisX Platform API',
      description: `
# AegisX Platform API

Complete API specification for the AegisX Platform including all UI library endpoints.

This API provides comprehensive functionality for:
- **Authentication** - Login, logout, token refresh, and session management
- **User Profile** - Profile management, avatar uploads, and preferences
- **Navigation** - Dynamic navigation structure and menu management
- **Settings** - Application settings, themes, and user preferences

## 🔐 Authentication

Most endpoints require authentication via JWT Bearer tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## 📝 Error Handling

All API responses follow a consistent format:

**Success Response:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
\`\`\`

## 🚀 Rate Limiting

API requests are rate limited to prevent abuse:
- **Authenticated users**: 1000 requests/hour
- **Unauthenticated users**: 100 requests/hour
- **File uploads**: 10 uploads/minute

Rate limit headers are included in all responses.

## 🔄 Versioning

The API uses header-based versioning:
\`\`\`
Accept: application/json; version=1.0
\`\`\`

If no version is specified, the latest stable version is used.
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
        url: 'http://localhost:3000/api',
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
        name: 'Authentication',
        description: 'Authentication and session management endpoints',
        externalDocs: {
          description: 'Auth Guide',
          url: 'https://docs.aegisx.com/auth',
        },
      },
      {
        name: 'Navigation',
        description: 'Navigation structure and menu management',
        externalDocs: {
          description: 'Navigation Guide',
          url: 'https://docs.aegisx.com/navigation',
        },
      },
      {
        name: 'User Profile',
        description: 'User profile and preferences management',
        externalDocs: {
          description: 'Profile Guide',
          url: 'https://docs.aegisx.com/profile',
        },
      },
      {
        name: 'Settings',
        description: 'Application settings and configuration',
        externalDocs: {
          description: 'Settings Guide',
          url: 'https://docs.aegisx.com/settings',
        },
      },
      {
        name: 'Theme',
        description: 'Theme and appearance settings',
        externalDocs: {
          description: 'Theming Guide',
          url: 'https://docs.aegisx.com/theming',
        },
      },
    ],
    externalDocs: {
      description: 'AegisX Platform Documentation',
      url: 'https://docs.aegisx.com',
    },
  },
  // Enable OpenAPI schema transformations
  transform: ({ schema, url, method }) => {
    // Add common response headers
    if (schema.response) {
      Object.keys(schema.response).forEach((statusCode) => {
        if (!schema.response[statusCode].headers) {
          schema.response[statusCode].headers = {};
        }

        // Add rate limiting headers
        schema.response[statusCode].headers['X-RateLimit-Limit'] = {
          type: 'integer',
          description: 'Request limit per hour',
        };
        schema.response[statusCode].headers['X-RateLimit-Remaining'] = {
          type: 'integer',
          description: 'Remaining requests in current window',
        };
        schema.response[statusCode].headers['X-RateLimit-Reset'] = {
          type: 'integer',
          description: 'Time when rate limit resets (Unix timestamp)',
        };

        // Add request ID header
        schema.response[statusCode].headers['X-Request-ID'] = {
          type: 'string',
          description: 'Unique request identifier for tracing',
        };
      });
    }

    return { schema, url };
  },
  // Hide internal routes from documentation
  hideUntagged: true,
  // Expose OpenAPI JSON at /documentation/json
  exposeRoute: true,
};

export const swaggerUiConfig = {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    displayOperationId: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    validatorUrl: null, // Disable online validator
    // Custom CSS for AegisX branding
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #1976d2; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { 
        background: #f8f9fa; 
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 10px;
        margin: 10px 0;
      }
      .swagger-ui .btn.authorize { 
        background-color: #1976d2;
        border-color: #1976d2;
      }
      .swagger-ui .btn.authorize:hover { 
        background-color: #1565c0;
        border-color: #1565c0;
      }
      .swagger-ui .opblock.opblock-get .opblock-summary { 
        border-color: #28a745;
        background: rgba(40, 167, 69, 0.1);
      }
      .swagger-ui .opblock.opblock-post .opblock-summary { 
        border-color: #007bff;
        background: rgba(0, 123, 255, 0.1);
      }
      .swagger-ui .opblock.opblock-put .opblock-summary { 
        border-color: #fd7e14;
        background: rgba(253, 126, 20, 0.1);
      }
      .swagger-ui .opblock.opblock-delete .opblock-summary { 
        border-color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
      }
    `,
    // Custom site title and favicon
    customSiteTitle: 'AegisX Platform API Documentation',
    customfavIcon: '/favicon.ico',
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  // Allow iframe embedding for documentation
  uiHooks: {
    onComplete: function () {
      // Add custom JavaScript if needed
      console.log('AegisX API Documentation loaded');
    },
  },
};

/**
 * JSON Schema definitions for common response formats
 * These can be reused across multiple endpoints
 */
export const commonSchemas = {
  ApiResponse: {
    type: 'object',
    required: ['success'],
    properties: {
      success: {
        type: 'boolean',
        description: 'Indicates if the request was successful',
      },
      meta: {
        $ref: '#/components/schemas/ApiMeta',
      },
    },
  },

  ApiMeta: {
    type: 'object',
    properties: {
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp of the response',
      },
      version: {
        type: 'string',
        description: 'API version',
      },
      requestId: {
        type: 'string',
        description: 'Unique request identifier for tracing',
      },
    },
  },

  ApiError: {
    type: 'object',
    required: ['success', 'error'],
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            description: 'Error code identifier',
          },
          message: {
            type: 'string',
            description: 'Human-readable error message',
          },
          details: {
            type: 'object',
            additionalProperties: true,
            description: 'Additional error details',
          },
          field: {
            type: 'string',
            description: 'Field that caused the error (for validation errors)',
          },
        },
      },
    },
  },

  ValidationError: {
    type: 'object',
    required: ['success', 'error'],
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
                code: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Common response definitions that can be referenced in route schemas
 */
export const commonResponses = {
  BadRequest: {
    description: 'Bad request - invalid input',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
        example: {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid request format or parameters',
          },
        },
      },
    },
  },

  Unauthorized: {
    description: 'Authentication required',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
        example: {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
      },
    },
  },

  Forbidden: {
    description: 'Insufficient permissions',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
        example: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
      },
    },
  },

  NotFound: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
        example: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Requested resource not found',
          },
        },
      },
    },
  },

  ValidationError: {
    description: 'Validation error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ValidationError' },
      },
    },
  },

  InternalServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
        example: {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
      },
    },
  },
};

export default {
  swaggerConfig,
  swaggerUiConfig,
  commonSchemas,
  commonResponses,
};
