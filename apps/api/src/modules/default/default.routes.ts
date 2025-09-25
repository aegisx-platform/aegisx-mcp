import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { DefaultController } from './default.controller';
import { SchemaRefs } from '../../schemas/registry';

export interface DefaultRoutesOptions {
  controller: DefaultController;
}

export async function defaultRoutes(
  fastify: FastifyInstance,
  options: DefaultRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /api/info - API Information endpoint
  typedFastify.route({
    method: 'GET',
    url: '/info',
    schema: {
      description:
        'Get API information including version, environment, and basic statistics',
      tags: ['System'],
      summary: 'Get API information',
      response: {
        200: SchemaRefs.module('default', 'api-info-response'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getApiInfo.bind(controller),
  });

  // GET /api/status - Detailed system status endpoint
  typedFastify.route({
    method: 'GET',
    url: '/status',
    schema: {
      description:
        'Get detailed system status including database, memory, and service health',
      tags: ['System'],
      summary: 'Get system status',
      response: {
        200: SchemaRefs.module('default', 'system-status-response'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getSystemStatus.bind(controller),
  });

  // GET /api/health - Simple health check endpoint
  typedFastify.route({
    method: 'GET',
    url: '/health',
    schema: {
      description:
        'Simple health check endpoint for load balancers and monitoring systems',
      tags: ['System'],
      summary: 'Health check',
      response: {
        200: SchemaRefs.module('default', 'health-check-response'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getHealthStatus.bind(controller),
  });

  // GET /api/ping - Simple ping endpoint
  typedFastify.route({
    method: 'GET',
    url: '/ping',
    schema: {
      description: 'Simple ping endpoint that returns pong',
      tags: ['System'],
      summary: 'Ping endpoint',
      response: {
        200: SchemaRefs.module('default', 'ping-response-data'),
        500: SchemaRefs.ServerError,
      },
    },
    handler: controller.getPing.bind(controller),
  });
}
