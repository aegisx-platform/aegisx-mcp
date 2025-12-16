import { ActivityLogsController } from '../activity-logs.controller';
import { ActivityLogsService } from '../activity-logs.service';
// Load FastifyReply type extensions
import type {} from '../../../../../plugins/response-handler.plugin';

// Mock ActivityLogsService
const mockService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  getStats: jest.fn(),
  cleanup: jest.fn(),
  exportToCSV: jest.fn(),
  exportToJSON: jest.fn(),
};

// Mock Fastify request/reply
const mockRequest = {
  query: {},
  params: {},
  body: {},
  user: { id: 'user-1' },
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
} as any;

const mockReply = {
  code: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis(),
  success: jest.fn().mockReturnThis(),
  error: jest.fn().mockReturnThis(),
  notFound: jest.fn().mockReturnThis(),
  badRequest: jest.fn().mockReturnThis(),
} as any;

describe('ActivityLogsController', () => {
  let controller: ActivityLogsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ActivityLogsController(mockService as any);
  });

  describe('findAll', () => {
    it('should return paginated activity logs', async () => {
      const mockLogs = [{ id: '1', description: 'Created user' }];
      const mockResult = {
        data: mockLogs,
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };
      mockService.findAll.mockResolvedValue(mockResult);

      mockRequest.query = { page: 1, limit: 10 };

      await controller.findAll(mockRequest, mockReply);

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockLogs,
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: 1,
          }),
        }),
      );
    });

    it('should handle filters in query', async () => {
      const mockResult = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      mockService.findAll.mockResolvedValue(mockResult);

      mockRequest.query = {
        page: 1,
        limit: 10,
        action: 'create',
        severity: 'info',
      };

      await controller.findAll(mockRequest, mockReply);

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          severity: 'info',
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      mockService.findAll.mockRejectedValue(new Error('Database error'));

      mockRequest.query = { page: 1, limit: 10 };

      await controller.findAll(mockRequest, mockReply);

      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.error).toHaveBeenCalledWith(
        'FETCH_ERROR',
        'Failed to fetch activity logs',
        500,
      );
    });
  });

  describe('findById', () => {
    it('should return activity log by ID', async () => {
      const mockLog = { id: '1', description: 'Created user' };
      mockService.findById.mockResolvedValue(mockLog);

      mockRequest.params = { id: '1' };

      await controller.findById(mockRequest, mockReply);

      expect(mockService.findById).toHaveBeenCalledWith('1');
      expect(mockReply.success).toHaveBeenCalledWith(mockLog);
    });

    it('should return 404 if activity log not found', async () => {
      mockService.findById.mockRejectedValue(new Error('ERROR_NOT_FOUND'));

      mockRequest.params = { id: 'nonexistent' };

      await controller.findById(mockRequest, mockReply);

      expect(mockReply.notFound).toHaveBeenCalledWith('Activity log not found');
    });
  });

  describe('delete', () => {
    it('should delete activity log by ID', async () => {
      mockService.delete.mockResolvedValue(undefined);

      mockRequest.params = { id: '1' };

      await controller.delete(mockRequest, mockReply);

      expect(mockService.delete).toHaveBeenCalledWith('1');
      expect(mockReply.success).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('deleted'),
        }),
      );
    });
  });

  describe('getStats', () => {
    it('should return activity log statistics', async () => {
      const mockStats = {
        totalCount: 200,
        period: { days: 7, startDate: '2024-01-01', endDate: '2024-01-07' },
        customStats: {},
      };
      mockService.getStats.mockResolvedValue(mockStats);

      mockRequest.query = { days: 7 };

      await controller.getStats(mockRequest, mockReply);

      expect(mockService.getStats).toHaveBeenCalledWith(7);
      expect(mockReply.success).toHaveBeenCalledWith(mockStats);
    });
  });

  describe('export', () => {
    it('should export activity logs', async () => {
      const mockData = 'export-data';
      mockService.exportToCSV = jest.fn().mockResolvedValue(mockData);

      mockRequest.query = { action: 'create', format: 'csv' };

      // Export method is inherited from base controller
      // We're just verifying the method exists
      expect(controller).toHaveProperty('export');
    });
  });

  describe('getExportFilename', () => {
    it('should return correct export filename', () => {
      const filename = controller['getExportFilename']();
      expect(filename).toBe('activity-logs');
    });
  });
});
