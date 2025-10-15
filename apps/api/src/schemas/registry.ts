import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  ApiMetaSchema,
  PaginationMetaSchema,
  ApiErrorResponseSchema,
  OperationResultResponseSchema,
  ValidationErrorResponseSchema,
  UnauthorizedResponseSchema,
  ForbiddenResponseSchema,
  NotFoundResponseSchema,
  ConflictResponseSchema,
  ServerErrorResponseSchema,
  PaginationQuerySchema,
  SearchQuerySchema,
  UuidParamSchema,
  NumericIdParamSchema,
} from './base.schemas';

/**
 * Schema Registry
 * Central registry for all reusable schemas across the application
 */

export class SchemaRegistry {
  private fastify: FastifyInstance;
  private registeredSchemas = new Set<string>();

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify.withTypeProvider<TypeBoxTypeProvider>();
  }

  /**
   * Register base schemas that are used across all modules
   */
  registerBaseSchemas(): void {
    const baseSchemas = {
      // New schema naming convention
      'api-meta': ApiMetaSchema,
      'pagination-meta': PaginationMetaSchema,
      'api-error-response': ApiErrorResponseSchema,
      'operation-result': OperationResultResponseSchema,
      'validation-error-response': ValidationErrorResponseSchema,
      'unauthorized-response': UnauthorizedResponseSchema,
      'forbidden-response': ForbiddenResponseSchema,
      'not-found-response': NotFoundResponseSchema,
      'conflict-response': ConflictResponseSchema,
      'server-error-response': ServerErrorResponseSchema,
      'pagination-query': PaginationQuerySchema,
      'search-query': SearchQuerySchema,
      'uuid-param': UuidParamSchema,
      'numeric-id-param': NumericIdParamSchema,

      // Legacy compatibility (old naming convention)
      validationErrorResponse: ValidationErrorResponseSchema,
      unauthorizedResponse: UnauthorizedResponseSchema,
      forbiddenResponse: ForbiddenResponseSchema,
      notFoundResponse: NotFoundResponseSchema,
      conflictResponse: ConflictResponseSchema,
      serverErrorResponse: ServerErrorResponseSchema,
    };

    Object.entries(baseSchemas).forEach(([id, schema]) => {
      this.registerSchema(id, schema);
    });
  }

  /**
   * Register a schema with the Fastify instance
   */
  private registerSchema(id: string, schema: any): void {
    if (this.registeredSchemas.has(id)) {
      this.fastify.log.warn(
        `Schema with ID '${id}' is already registered. Skipping...`,
      );
      return;
    }

    try {
      this.fastify.addSchema({
        $id: id,
        ...schema,
      });
      this.registeredSchemas.add(id);
      this.fastify.log.debug(`Registered schema: ${id}`);
    } catch (error) {
      this.fastify.log.error(
        `Failed to register schema '${id}': ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Check if a schema is registered
   */
  isSchemaRegistered(id: string): boolean {
    return this.registeredSchemas.has(id);
  }

  /**
   * Get list of all registered schema IDs
   */
  getRegisteredSchemaIds(): string[] {
    return Array.from(this.registeredSchemas);
  }

  /**
   * Register module-specific schemas
   */
  registerModuleSchemas(
    moduleName: string,
    schemas: Record<string, any>,
  ): void {
    Object.entries(schemas).forEach(([name, schema]) => {
      const schemaId = `${moduleName}-${name}`;
      this.registerSchema(schemaId, schema);
    });
  }
}

/**
 * Factory function to create and initialize schema registry
 */
export function createSchemaRegistry(fastify: FastifyInstance): SchemaRegistry {
  const registry = new SchemaRegistry(fastify);
  registry.registerBaseSchemas();
  return registry;
}

/**
 * Schema reference helpers for easy referencing in route definitions
 */
export const SchemaRefs = {
  // Response schemas
  OperationResult: { $ref: 'operation-result#' },
  ValidationError: { $ref: 'validation-error-response#' },
  Unauthorized: { $ref: 'unauthorized-response#' },
  Forbidden: { $ref: 'forbidden-response#' },
  NotFound: { $ref: 'not-found-response#' },
  Conflict: { $ref: 'conflict-response#' },
  ServerError: { $ref: 'server-error-response#' },

  // Query schemas
  Pagination: { $ref: 'pagination-query#' },
  Search: { $ref: 'search-query#' },

  // Parameter schemas
  UuidParam: { $ref: 'uuid-param#' },
  NumericIdParam: { $ref: 'numeric-id-param#' },

  // Helper function to create module schema references
  module: (moduleName: string, schemaName: string) => ({
    $ref: `${moduleName}-${schemaName}#`,
  }),
};

/**
 * Common response schema patterns for routes
 */
export const CommonRouteSchemas = {
  // Standard CRUD responses
  created: (dataRef: any) => ({
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: true },
        data: dataRef,
        message: { type: 'string' },
        meta: SchemaRefs.module('api', 'meta'),
      },
      required: ['success', 'data'],
    },
    400: SchemaRefs.ValidationError,
    401: SchemaRefs.Unauthorized,
    403: SchemaRefs.Forbidden,
    500: SchemaRefs.ServerError,
  }),

  updated: (dataRef: any) => ({
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: true },
        data: dataRef,
        message: { type: 'string' },
        meta: SchemaRefs.module('api', 'meta'),
      },
      required: ['success', 'data'],
    },
    400: SchemaRefs.ValidationError,
    401: SchemaRefs.Unauthorized,
    403: SchemaRefs.Forbidden,
    404: SchemaRefs.NotFound,
    409: SchemaRefs.Conflict,
    500: SchemaRefs.ServerError,
  }),

  deleted: {
    204: {
      type: 'null',
    },
    401: SchemaRefs.Unauthorized,
    403: SchemaRefs.Forbidden,
    404: SchemaRefs.NotFound,
    500: SchemaRefs.ServerError,
  },

  list: (itemRef: any) => ({
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: itemRef,
            },
            pagination: SchemaRefs.module('pagination', 'meta'),
          },
          required: ['items', 'pagination'],
        },
        meta: SchemaRefs.module('api', 'meta'),
      },
      required: ['success', 'data'],
    },
    400: SchemaRefs.ValidationError,
    401: SchemaRefs.Unauthorized,
    403: SchemaRefs.Forbidden,
    500: SchemaRefs.ServerError,
  }),
};
