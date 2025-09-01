import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

// Common error response schemas
export const commonSchemas = {
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
          statusCode: { type: 'integer', const: 400 }
        },
        required: ['code', 'message']
      }
    },
    required: ['success', 'error'],
    additionalProperties: false
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
          statusCode: { type: 'integer', const: 401 }
        },
        required: ['code', 'message']
      }
    },
    required: ['success', 'error'],
    additionalProperties: false
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
          statusCode: { type: 'integer', const: 403 }
        },
        required: ['code', 'message']
      }
    },
    required: ['success', 'error'],
    additionalProperties: false
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
          statusCode: { type: 'integer', const: 404 }
        },
        required: ['code', 'message']
      }
    },
    required: ['success', 'error'],
    additionalProperties: false
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
          statusCode: { type: 'integer', const: 409 }
        },
        required: ['code', 'message']
      }
    },
    required: ['success', 'error'],
    additionalProperties: false
  },

  serverErrorResponse: {
    $id: 'serverErrorResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', const: 'INTERNAL_SERVER_ERROR' },
          message: { type: 'string', default: 'An unexpected error occurred' },
          statusCode: { type: 'integer', const: 500 }
        },
        required: ['code', 'message']
      }
    },
    required: ['success', 'error'],
    additionalProperties: false
  }
};

async function schemasPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Register common schemas
  for (const [key, schema] of Object.entries(commonSchemas)) {
    fastify.addSchema(schema);
  }
}

export default fp(schemasPlugin, {
  name: 'schemas-plugin'
});