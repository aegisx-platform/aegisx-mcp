import { DefaultController } from '../default.controller';
import { DefaultService } from '../default.service';
import { FastifyRequest, FastifyReply } from 'fastify';

// Mock DefaultService
const mockDefaultService = {
  getApiInfo: jest.fn(),
  getSystemStatus: jest.fn(),
  getHealthStatus: jest.fn(),
} as unknown as DefaultService;

// Mock FastifyRequest
const mockRequest = {
  log: {
    error: jest.fn(),
  },
} as unknown as FastifyRequest;

// Mock FastifyReply
const mockReply = {
  success: jest.fn().mockReturnThis(),
  error: jest.fn().mockReturnThis(),
} as unknown as FastifyReply;

describe('DefaultController', () => {
  let controller: DefaultController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DefaultController(mockDefaultService);
  });

  describe('getApiInfo', () => {
    it('should return API information successfully', async () => {
      const mockApiInfo = {
        name: 'AegisX Platform API',
        version: '1.0.0',
        description: 'Enterprise monorepo API',
        environment: 'development',
        uptime: 1234,
        timestamp: '2025-10-31T00:00:00.000Z',
      };

      (mockDefaultService.getApiInfo as jest.Mock).mockResolvedValue(
        mockApiInfo,
      );

      await controller.getApiInfo(mockRequest, mockReply);

      expect(mockDefaultService.getApiInfo).toHaveBeenCalledTimes(1);
      expect(mockReply.success).toHaveBeenCalledWith(
        mockApiInfo,
        'API information retrieved successfully',
      );
    });

    it('should handle errors and return error response', async () => {
      const error = new Error('Database connection failed');
      (mockDefaultService.getApiInfo as jest.Mock).mockRejectedValue(error);

      await controller.getApiInfo(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        error,
        'Failed to get API info',
      );
      expect(mockReply.error).toHaveBeenCalledWith(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve API information',
        500,
      );
    });
  });

  describe('getSystemStatus', () => {
    it('should return system status successfully', async () => {
      const mockSystemStatus = {
        status: 'healthy' as const,
        timestamp: '2025-10-31T00:00:00.000Z',
        uptime: 1234,
        version: '1.0.0',
        services: {
          database: {
            status: 'connected' as const,
            responseTime: 15,
          },
          redis: {
            status: 'connected' as const,
            responseTime: 5,
          },
        },
        memory: {
          used: 100000,
          total: 1000000,
          free: 900000,
          percentage: 10,
        },
      };

      (mockDefaultService.getSystemStatus as jest.Mock).mockResolvedValue(
        mockSystemStatus,
      );

      await controller.getSystemStatus(mockRequest, mockReply);

      expect(mockDefaultService.getSystemStatus).toHaveBeenCalledTimes(1);
      expect(mockReply.success).toHaveBeenCalledWith(
        mockSystemStatus,
        'System status retrieved successfully',
      );
    });

    it('should handle errors and return error response', async () => {
      const error = new Error('Failed to check system status');
      (mockDefaultService.getSystemStatus as jest.Mock).mockRejectedValue(
        error,
      );

      await controller.getSystemStatus(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        error,
        'Failed to get system status',
      );
      expect(mockReply.error).toHaveBeenCalledWith(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve system status',
        500,
      );
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status successfully', async () => {
      const mockHealthStatus = {
        status: 'ok' as const,
        timestamp: '2025-10-31T00:00:00.000Z',
        version: '1.0.0',
      };

      (mockDefaultService.getHealthStatus as jest.Mock).mockResolvedValue(
        mockHealthStatus,
      );

      await controller.getHealthStatus(mockRequest, mockReply);

      expect(mockDefaultService.getHealthStatus).toHaveBeenCalledTimes(1);
      expect(mockReply.success).toHaveBeenCalledWith(
        mockHealthStatus,
        'API is healthy',
      );
    });

    it('should handle errors and return error response', async () => {
      const error = new Error('Health check failed');
      (mockDefaultService.getHealthStatus as jest.Mock).mockRejectedValue(
        error,
      );

      await controller.getHealthStatus(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        error,
        'Health check failed',
      );
      expect(mockReply.error).toHaveBeenCalledWith(
        'INTERNAL_SERVER_ERROR',
        'Health check failed',
        500,
      );
    });
  });

  describe('getPing', () => {
    it('should return pong response', async () => {
      await controller.getPing(mockRequest, mockReply);

      expect(mockReply.success).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'pong',
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
        'Ping successful',
      );
    });

    it('should return current timestamp', async () => {
      const beforeCall = new Date().toISOString();
      await controller.getPing(mockRequest, mockReply);
      const afterCall = new Date().toISOString();

      const callArgs = (mockReply.success as jest.Mock).mock.calls[0][0];
      expect(callArgs.timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(callArgs.timestamp).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('getWelcome', () => {
    it('should return welcome message with all required fields', async () => {
      await controller.getWelcome(mockRequest, mockReply);

      expect(mockReply.success).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Welcome to AegisX Platform API',
          description: 'Enterprise-Ready Full Stack Application',
          version: '1.1.1',
          environment: expect.any(String),
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          endpoints: expect.objectContaining({
            api: '/api',
            health: '/api/health',
            info: '/api/info',
            status: '/api/status',
            documentation: '/documentation',
          }),
          logo: expect.arrayContaining([expect.any(String)]),
        }),
        'Welcome to AegisX Platform',
      );
    });

    it('should include ASCII logo as array of strings', async () => {
      await controller.getWelcome(mockRequest, mockReply);

      const callArgs = (mockReply.success as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(callArgs.logo)).toBe(true);
      expect(callArgs.logo.length).toBeGreaterThan(0);
      expect(typeof callArgs.logo[0]).toBe('string');
    });

    it('should include all endpoint information', async () => {
      await controller.getWelcome(mockRequest, mockReply);

      const callArgs = (mockReply.success as jest.Mock).mock.calls[0][0];
      expect(callArgs.endpoints).toEqual({
        api: '/api',
        health: '/api/health',
        info: '/api/info',
        status: '/api/status',
        documentation: '/documentation',
      });
    });

    it('should use correct environment from process.env', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await controller.getWelcome(mockRequest, mockReply);

      const callArgs = (mockReply.success as jest.Mock).mock.calls[0][0];
      expect(callArgs.environment).toBe('production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should default to development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      await controller.getWelcome(mockRequest, mockReply);

      const callArgs = (mockReply.success as jest.Mock).mock.calls[0][0];
      expect(callArgs.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('error handling', () => {
    it('should log errors with proper context', async () => {
      const error = new Error('Test error');
      (mockDefaultService.getApiInfo as jest.Mock).mockRejectedValue(error);

      await controller.getApiInfo(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        error,
        'Failed to get API info',
      );
    });

    it('should return 500 status code for internal errors', async () => {
      const error = new Error('Internal error');
      (mockDefaultService.getSystemStatus as jest.Mock).mockRejectedValue(
        error,
      );

      await controller.getSystemStatus(mockRequest, mockReply);

      expect(mockReply.error).toHaveBeenCalledWith(
        'INTERNAL_SERVER_ERROR',
        expect.any(String),
        500,
      );
    });
  });
});
