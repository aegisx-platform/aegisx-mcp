# OpenAPI Schemas & Response Standards

## 🚨 MANDATORY: TypeBox Schema System

**ALL routes MUST use TypeBox schemas - NO EXCEPTIONS**

See [TypeBox Schema Standard](./05c-typebox-schema-standard.md) for complete implementation guide.

### Quick Reference:

```typescript
// ✅ CORRECT - TypeBox with type safety
import { Type, Static } from '@sinclair/typebox';
const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
});

// ❌ WRONG - Plain JSON Schema
const userSchema = {
  type: 'object',
  properties: { id: { type: 'string' } },
};
```

## MANDATORY OpenAPI Schema System

### Complete Schema Definitions

```typescript
// apps/api/src/schemas/user.schema.ts
export const userSchemas = {
  // Base entity schemas
  user: {
    $id: 'user',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique user identifier' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      username: { type: 'string', minLength: 3, maxLength: 50, description: 'Username' },
      firstName: { type: 'string', minLength: 1, maxLength: 100, description: 'First name' },
      lastName: { type: 'string', minLength: 1, maxLength: 100, description: 'Last name' },
      isActive: { type: 'boolean', description: 'User active status' },
      role: { $ref: 'role#' },
      createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
      updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
    },
    required: ['id', 'email', 'username', 'firstName', 'lastName', 'isActive', 'role', 'createdAt', 'updatedAt'],
    additionalProperties: false,
  },

  // Request schemas
  createUserRequest: {
    $id: 'createUserRequest',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        maxLength: 255,
      },
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: '^[a-zA-Z0-9_-]+$',
        description: 'Username (alphanumeric, underscore, hyphen only)',
      },
      firstName: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'First name',
      },
      lastName: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Last name',
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        description: 'Password (minimum 8 characters)',
      },
      roleId: {
        type: 'string',
        format: 'uuid',
        description: 'Role identifier',
      },
      isActive: {
        type: 'boolean',
        default: true,
        description: 'Initial active status',
      },
    },
    required: ['email', 'username', 'firstName', 'lastName', 'password', 'roleId'],
    additionalProperties: false,
  },

  updateUserRequest: {
    $id: 'updateUserRequest',
    type: 'object',
    properties: {
      firstName: { type: 'string', minLength: 1, maxLength: 100 },
      lastName: { type: 'string', minLength: 1, maxLength: 100 },
      isActive: { type: 'boolean' },
      roleId: { type: 'string', format: 'uuid' },
    },
    additionalProperties: false,
    minProperties: 1,
  },

  // Response schemas - ALL REQUIRED
  userResponse: {
    $id: 'userResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: { $ref: 'user#' },
      message: { type: 'string' },
    },
    required: ['success', 'data'],
    additionalProperties: false,
  },

  paginatedUsersResponse: {
    $id: 'paginatedUsersResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: {
        type: 'array',
        items: { $ref: 'user#' },
      },
      message: { type: 'string' },
      pagination: { $ref: 'pagination#' },
    },
    required: ['success', 'data', 'pagination'],
    additionalProperties: false,
  },
};

// Common error response schemas
export const commonSchemas = {
  errorResponse: {
    $id: 'errorResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object', additionalProperties: true },
          statusCode: { type: 'integer' },
        },
        required: ['code', 'message'],
      },
      message: { type: 'string' },
    },
    required: ['success', 'error'],
    additionalProperties: false,
  },

  validationErrorResponse: {
    $id: 'validationErrorResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', const: 'VALIDATION_ERROR' },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } },
          statusCode: { type: 'integer', const: 400 },
        },
        required: ['code', 'message'],
      },
      message: { type: 'string' },
    },
    required: ['success', 'error'],
    additionalProperties: false,
  },

  unauthorizedResponse: {
    $id: 'unauthorizedResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', const: 'UNAUTHORIZED' },
          message: { type: 'string', default: 'Authentication required' },
          statusCode: { type: 'integer', const: 401 },
        },
        required: ['code', 'message'],
      },
    },
    required: ['success', 'error'],
    additionalProperties: false,
  },

  forbiddenResponse: {
    $id: 'forbiddenResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', const: 'FORBIDDEN' },
          message: { type: 'string', default: 'Insufficient permissions' },
          statusCode: { type: 'integer', const: 403 },
        },
        required: ['code', 'message'],
      },
    },
    required: ['success', 'error'],
    additionalProperties: false,
  },

  notFoundResponse: {
    $id: 'notFoundResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', const: 'NOT_FOUND' },
          message: { type: 'string' },
          statusCode: { type: 'integer', const: 404 },
        },
        required: ['code', 'message'],
      },
    },
    required: ['success', 'error'],
    additionalProperties: false,
  },

  conflictResponse: {
    $id: 'conflictResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', const: 'CONFLICT' },
          message: { type: 'string' },
          statusCode: { type: 'integer', const: 409 },
        },
        required: ['code', 'message'],
      },
    },
    required: ['success', 'error'],
    additionalProperties: false,
  },

  pagination: {
    $id: 'pagination',
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
      total: { type: 'integer', minimum: 0 },
      totalPages: { type: 'integer', minimum: 0 },
    },
    required: ['page', 'limit', 'total', 'totalPages'],
    additionalProperties: false,
  },
};
```

## Schema Enforcement Plugin

```typescript
// apps/api/src/plugins/schema-enforcement.plugin.ts
export default fp(async function schemaEnforcementPlugin(fastify: FastifyInstance) {
  // Hook to validate that all routes have schemas
  fastify.addHook('onRoute', (routeOptions) => {
    if (!routeOptions.schema) {
      throw new Error(`Route ${routeOptions.method} ${routeOptions.url} must have schema definition`);
    }

    // Ensure all routes have response schemas
    if (!routeOptions.schema.response) {
      throw new Error(`Route ${routeOptions.method} ${routeOptions.url} must have response schema`);
    }

    // Ensure POST/PUT/PATCH routes have body schemas
    if (['POST', 'PUT', 'PATCH'].includes(routeOptions.method) && !routeOptions.schema.body) {
      throw new Error(`Route ${routeOptions.method} ${routeOptions.url} must have body schema`);
    }

    // Ensure routes with params have params schema
    if (routeOptions.url.includes(':') && !routeOptions.schema.params) {
      throw new Error(`Route ${routeOptions.method} ${routeOptions.url} must have params schema`);
    }
  });

  // Hook to add standard error responses if not specified
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.schema?.response) {
      const responses = routeOptions.schema.response;

      // Add standard error responses if missing
      if (!responses['401']) {
        responses['401'] = { $ref: 'unauthorizedResponse#' };
      }
      if (!responses['500']) {
        responses['500'] = { $ref: 'serverErrorResponse#' };
      }
    }
  });
});
```

## Standard API Response Format

```typescript
// apps/api/src/types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: Pagination;
  meta?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Success responses
export const createSuccessResponse = <T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> => ({
  success: true,
  data,
  message,
  meta,
});

// Paginated responses
export const createPaginatedResponse = <T>(data: T[], page: number, limit: number, total: number, message?: string): ApiResponse<T[]> => ({
  success: true,
  data,
  message,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});

// Error responses
export const createErrorResponse = (code: string, message: string, details?: any, statusCode?: number): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
    statusCode,
  },
});
```

## Response Handler Plugin

```typescript
// apps/api/src/plugins/response-handler.plugin.ts
export default fp(async function responseHandlerPlugin(fastify: FastifyInstance) {
  // Decorate reply with helper methods
  fastify.decorateReply('success', function (data: any, message?: string) {
    return this.send(createSuccessResponse(data, message));
  });

  fastify.decorateReply('paginated', function (data: any[], page: number, limit: number, total: number, message?: string) {
    return this.send(createPaginatedResponse(data, page, limit, total, message));
  });

  fastify.decorateReply('error', function (code: string, message: string, statusCode: number = 400, details?: any) {
    return this.code(statusCode).send(createErrorResponse(code, message, details, statusCode));
  });

  fastify.decorateReply('created', function (data: any, message?: string) {
    return this.code(201).send(createSuccessResponse(data, message));
  });

  fastify.decorateReply('notFound', function (message: string = 'Resource not found') {
    return this.code(404).send(createErrorResponse('NOT_FOUND', message, undefined, 404));
  });
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyReply {
    success(data: any, message?: string): FastifyReply;
    paginated(data: any[], page: number, limit: number, total: number, message?: string): FastifyReply;
    error(code: string, message: string, statusCode?: number, details?: any): FastifyReply;
    created(data: any, message?: string): FastifyReply;
    notFound(message?: string): FastifyReply;
  }
}
```

## MANDATORY Schema Validation Rules

Every route MUST follow these schema requirements:

```typescript
// ⚠️ CRITICAL: No route without complete schema
fastify.route({
  method: 'ANY',
  url: '/any-endpoint',
  schema: {
    // REQUIRED: Description and tags
    description: 'Clear description of what this endpoint does',
    tags: ['FeatureName'],

    // REQUIRED: Query parameters (if any)
    querystring: {
      /* schema */
    },

    // REQUIRED: Path parameters (if any)
    params: {
      /* schema */
    },

    // REQUIRED: Request body (for POST/PUT/PATCH)
    body: {
      /* schema */
    },

    // REQUIRED: All possible response schemas
    response: {
      200: {
        /* success schema */
      },
      400: { $ref: 'errorResponse#' },
      401: { $ref: 'unauthorizedResponse#' },
      403: { $ref: 'forbiddenResponse#' },
      404: { $ref: 'notFoundResponse#' },
      500: { $ref: 'serverErrorResponse#' },
    },
  },
  handler: async (request, reply) => {
    /* implementation */
  },
});
```
