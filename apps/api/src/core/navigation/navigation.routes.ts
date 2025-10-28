import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { createNavigationController } from './navigation.controller';
import { SchemaRefs } from '../../schemas/registry';

/**
 * Navigation Routes
 * Defines HTTP routes for the navigation API
 * Includes authentication, validation, and proper error handling
 */
export default async function navigationRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();
  
  // Get navigation service from fastify instance
  const navigationService = fastify.navigationService;
  if (!navigationService) {
    throw new Error('NavigationService not found. Make sure the navigation plugin is registered.');
  }

  // Create controller instance
  const controller = createNavigationController(navigationService);

  /**
   * GET /navigation
   * Get complete navigation structure
   * Requires authentication and navigation.view permission
   */
  typedFastify.get('/navigation', {
    schema: {
      description: 'Get complete navigation structure',
      tags: ['Navigation'],
      summary: 'Get navigation items for all variants',
      security: [{ bearerAuth: [] }],
      querystring: SchemaRefs.module('navigation', 'get-navigation-query'),
      response: {
        200: SchemaRefs.module('navigation', 'navigation-response'),
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError
      }
    },
    preHandler: [
      fastify.authenticate, // JWT authentication
      fastify.verifyPermission('navigation', 'view') // Permission check
    ],
    handler: controller.getNavigation
  });

  /**
   * GET /navigation/user
   * Get user-specific navigation filtered by permissions
   * Requires authentication
   */
  typedFastify.get('/navigation/user', {
    schema: {
      description: 'Get user-specific navigation filtered by permissions',
      tags: ['Navigation'],
      summary: 'Get navigation items filtered by user permissions',
      security: [{ bearerAuth: [] }],
      querystring: SchemaRefs.module('navigation', 'get-user-navigation-query'),
      response: {
        200: SchemaRefs.module('navigation', 'navigation-response'),
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError
      }
    },
    preHandler: [
      fastify.authenticate // JWT authentication only
    ],
    handler: controller.getUserNavigation
  });

  // Health check for navigation module
  typedFastify.get('/navigation/health', {
    schema: {
      description: 'Navigation module health check',
      tags: ['Navigation', 'Health'],
      summary: 'Check navigation module health status',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                module: { type: 'string' },
                status: { type: 'string' },
                database: { type: 'string' },
                responseTime: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                uptime: { type: 'number' }
              }
            },
            message: { type: 'string' }
          }
        },
        500: SchemaRefs.ServerError
      }
    },
    handler: async (request, reply) => {
      const startTime = process.hrtime.bigint();
      
      try {
        // Simple database connectivity test
        await fastify.knex.raw('SELECT 1');
        
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        return reply.success({
          module: 'navigation',
          status: 'healthy',
          database: 'connected',
          responseTime: `${responseTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }, 'Navigation module is healthy');
      } catch (error) {
        fastify.log.error(`Navigation health check failed: ${error}`);
        
        return reply.error(
          'HEALTH_CHECK_FAILED',
          'Navigation module health check failed',
          500,
          {
            module: 'navigation',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    }
  });

  // Log registered routes
  fastify.log.info('Navigation routes registered successfully');
}