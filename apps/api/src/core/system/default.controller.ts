import { FastifyRequest, FastifyReply } from 'fastify';
import { DefaultService } from './default.service';

export class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  async getApiInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const apiInfo = await this.defaultService.getApiInfo();
      return reply.success(apiInfo, 'API information retrieved successfully');
    } catch (error) {
      request.log.error(error, 'Failed to get API info');
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve API information',
        500,
      );
    }
  }

  async getSystemStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const systemStatus = await this.defaultService.getSystemStatus();
      return reply.success(
        systemStatus,
        'System status retrieved successfully',
      );
    } catch (error) {
      request.log.error(error, 'Failed to get system status');
      return reply.error(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve system status',
        500,
      );
    }
  }

  async getHealthStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const healthStatus = await this.defaultService.getHealthStatus();
      return reply.success(healthStatus, 'API is healthy');
    } catch (error) {
      request.log.error(error, 'Health check failed');
      return reply.error('INTERNAL_SERVER_ERROR', 'Health check failed', 500);
    }
  }

  async getPing(request: FastifyRequest, reply: FastifyReply) {
    return reply.success(
      {
        message: 'pong',
        timestamp: new Date().toISOString(),
      },
      'Ping successful',
    );
  }

  async getWelcome(request: FastifyRequest, reply: FastifyReply) {
    const welcomeMessage = {
      message: 'Welcome to AegisX Platform API',
      description: 'Enterprise-Ready Full Stack Application',
      version: '1.1.1',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        api: '/api',
        health: '/api/health',
        info: '/api/info',
        status: '/api/status',
        documentation: '/documentation',
      },
      logo: [
        '     █████╗ ███████╗ ██████╗ ██╗███████╗██╗  ██╗',
        '    ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚██╗██╔╝',
        '    ███████║█████╗  ██║  ███╗██║███████╗ ╚███╔╝ ',
        '    ██╔══██║██╔══╝  ██║   ██║██║╚════██║ ██╔██╗ ',
        '    ██║  ██║███████╗╚██████╔╝██║███████║██╔╝ ██╗',
        '    ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝',
      ],
    };

    return reply.success(welcomeMessage, 'Welcome to AegisX Platform');
  }
}
