import { ApiKeysController } from '../api-keys.controller';
import { ApiKeysService } from '../services/api-keys.service';
// Load FastifyReply type extensions
import type {} from '../../../../plugins/response-handler.plugin';

// Mock ApiKeysService
const mockService = {
  createKey: jest.fn(),
  listKeys: jest.fn(),
  getKey: jest.fn(),
  updateKey: jest.fn(),
  revokeKey: jest.fn(),
  getUsageStats: jest.fn(),
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
  success: jest.fn().mockReturnThis(),
  error: jest.fn().mockReturnThis(),
  notFound: jest.fn().mockReturnThis(),
  badRequest: jest.fn().mockReturnThis(),
} as any;

describe('ApiKeysController', () => {
  let controller: ApiKeysController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ApiKeysController(mockService as any);
  });

  describe('createKey', () => {
    it('should create API key and return it with plain key', async () => {
      const mockResult = {
        key: 'pk_test_abcdef123456',
        keyData: {
          id: 'key-1',
          userId: 'user-1',
          name: 'Test Key',
          keyPrefix: 'pk_test',
          permissions: ['api:read', 'api:write'],
          usageCount: 0,
          revoked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockService.createKey.mockResolvedValue(mockResult);

      mockRequest.body = {
        name: 'Test Key',
        permissions: ['api:read', 'api:write'],
        expiresAt: '2025-01-01',
      };

      await controller.createKey(mockRequest, mockReply);

      expect(mockService.createKey).toHaveBeenCalledWith(
        'user-1',
        'Test Key',
        ['api:read', 'api:write'],
        new Date('2025-01-01'),
      );
      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            key: 'pk_test_abcdef123456',
          }),
        }),
      );
    });

    it('should handle validation errors', async () => {
      const error = new Error('API key name is required');
      (error as any).code = 'API_KEY_INVALID';

      mockService.createKey.mockRejectedValue(error);

      mockRequest.body = {
        name: '',
        permissions: ['api:read'],
      };

      await controller.createKey(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'API_KEY_INVALID',
          }),
        }),
      );
    });

    it('should throw on unexpected errors', async () => {
      const error = new Error('Database error');

      mockService.createKey.mockRejectedValue(error);

      mockRequest.body = {
        name: 'Test Key',
        permissions: ['api:read'],
      };

      await expect(
        controller.createKey(mockRequest, mockReply),
      ).rejects.toThrow('Database error');
    });
  });

  describe('listKeys', () => {
    it('should return paginated list of API keys', async () => {
      const mockKeys = [
        {
          id: 'key-1',
          userId: 'user-1',
          name: 'Key 1',
          keyPrefix: 'pk_test',
          permissions: ['api:read'],
          usageCount: 5,
          revoked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockService.listKeys.mockResolvedValue(mockKeys);

      mockRequest.query = { page: 1, limit: 20 };

      await controller.listKeys(mockRequest, mockReply);

      expect(mockService.listKeys).toHaveBeenCalledWith('user-1');
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockKeys.slice(0, 20),
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        }),
      );
    });

    it('should handle pagination parameters', async () => {
      const mockKeys = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `key-${i}`,
          userId: 'user-1',
          name: `Key ${i}`,
          keyPrefix: 'pk_test',
          permissions: ['api:read'],
          usageCount: 0,
          revoked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

      mockService.listKeys.mockResolvedValue(mockKeys);

      mockRequest.query = { page: 2, limit: 10 };

      await controller.listKeys(mockRequest, mockReply);

      const sentData = mockReply.send.mock.calls[0][0];
      expect(sentData.data).toHaveLength(10);
      expect(sentData.pagination.totalPages).toBe(5);
    });
  });

  describe('getKey', () => {
    it('should return API key details', async () => {
      const mockKey = {
        id: 'key-1',
        userId: 'user-1',
        name: 'Test Key',
        keyPrefix: 'pk_test',
        permissions: ['api:read'],
        usageCount: 5,
        revoked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockService.getKey.mockResolvedValue(mockKey);

      mockRequest.params = { keyId: 'key-1' };

      await controller.getKey(mockRequest, mockReply);

      expect(mockService.getKey).toHaveBeenCalledWith('user-1', 'key-1');
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockKey,
        }),
      );
    });

    it('should handle key not found', async () => {
      const error = new Error('API key not found');
      (error as any).code = 'API_KEY_NOT_FOUND';

      mockService.getKey.mockRejectedValue(error);

      mockRequest.params = { keyId: 'nonexistent' };

      await controller.getKey(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'API_KEY_NOT_FOUND',
          }),
        }),
      );
    });

    it('should handle forbidden access', async () => {
      const error = new Error('Access denied');
      (error as any).code = 'API_KEY_FORBIDDEN';

      mockService.getKey.mockRejectedValue(error);

      mockRequest.params = { keyId: 'key-1' };

      await controller.getKey(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'API_KEY_FORBIDDEN',
          }),
        }),
      );
    });
  });

  describe('updateKey', () => {
    it('should update API key', async () => {
      const mockUpdatedKey = {
        id: 'key-1',
        userId: 'user-1',
        name: 'Updated Key',
        keyPrefix: 'pk_test',
        permissions: ['api:read', 'api:write'],
        usageCount: 5,
        revoked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockService.updateKey.mockResolvedValue(mockUpdatedKey);

      mockRequest.params = { keyId: 'key-1' };
      mockRequest.body = {
        name: 'Updated Key',
        permissions: ['api:read', 'api:write'],
      };

      await controller.updateKey(mockRequest, mockReply);

      expect(mockService.updateKey).toHaveBeenCalledWith('user-1', 'key-1', {
        name: 'Updated Key',
        permissions: ['api:read', 'api:write'],
      });
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedKey,
        }),
      );
    });

    it('should handle update errors', async () => {
      const error = new Error('API key not found');
      (error as any).code = 'API_KEY_NOT_FOUND';

      mockService.updateKey.mockRejectedValue(error);

      mockRequest.params = { keyId: 'nonexistent' };
      mockRequest.body = { name: 'New Name' };

      await controller.updateKey(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
    });
  });

  describe('revokeKey', () => {
    it('should revoke API key', async () => {
      const mockKey = {
        id: 'key-1',
        userId: 'user-1',
        name: 'Test Key',
        keyPrefix: 'pk_test',
        permissions: ['api:read'],
        usageCount: 5,
        revoked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockService.getKey.mockResolvedValue(mockKey);
      mockService.revokeKey.mockResolvedValue(undefined);

      mockRequest.params = { keyId: 'key-1' };

      await controller.revokeKey(mockRequest, mockReply);

      expect(mockService.getKey).toHaveBeenCalledWith('user-1', 'key-1');
      expect(mockService.revokeKey).toHaveBeenCalledWith('user-1', 'key-1');
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'key-1',
            message: expect.stringContaining('Test Key'),
          }),
        }),
      );
    });

    it('should handle revoke errors', async () => {
      const error = new Error('API key not found');
      (error as any).code = 'API_KEY_NOT_FOUND';

      mockService.getKey.mockRejectedValue(error);

      mockRequest.params = { keyId: 'nonexistent' };

      await controller.revokeKey(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const mockKey = {
        id: 'key-1',
        userId: 'user-1',
        name: 'Test Key',
        keyPrefix: 'pk_test',
        permissions: ['api:read'],
        usageCount: 42,
        lastUsedAt: '2024-01-01T00:00:00Z',
        expiresAt: '2025-01-01T00:00:00Z',
        revoked: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockStats = {
        usageCount: 42,
        lastUsedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockService.getKey.mockResolvedValue(mockKey);
      mockService.getUsageStats.mockResolvedValue(mockStats);

      mockRequest.params = { keyId: 'key-1' };

      await controller.getUsageStats(mockRequest, mockReply);

      expect(mockService.getKey).toHaveBeenCalledWith('user-1', 'key-1');
      expect(mockService.getUsageStats).toHaveBeenCalledWith('user-1', 'key-1');
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            usageCount: 42,
            lastUsedAt: '2024-01-01T00:00:00Z',
          }),
        }),
      );
    });

    it('should handle stats errors', async () => {
      const error = new Error('API key not found');
      (error as any).code = 'API_KEY_NOT_FOUND';

      mockService.getKey.mockRejectedValue(error);

      mockRequest.params = { keyId: 'nonexistent' };

      await controller.getUsageStats(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
    });
  });
});
