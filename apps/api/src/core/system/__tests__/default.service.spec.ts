import { DefaultService } from '../default.service';
import { FastifyInstance } from 'fastify';

// Mock Knex
const mockKnex = {
  raw: jest.fn(),
};

// Mock Fastify with Redis
const mockFastifyWithRedis = {
  knex: mockKnex,
  redis: {
    ping: jest.fn(),
  },
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
} as unknown as FastifyInstance;

// Mock Fastify without Redis
const mockFastifyWithoutRedis = {
  knex: mockKnex,
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
} as unknown as FastifyInstance;

describe('DefaultService', () => {
  let service: DefaultService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiInfo', () => {
    it('should return API information with correct structure', async () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const result = await service.getApiInfo();

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');

      expect(result.name).toBe('AegisX Platform API');
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe(
        'Enterprise monorepo API for AegisX Platform',
      );
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 format
    });

    it('should use environment from process.env', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getApiInfo();

      expect(result.environment).toBe('production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should default to development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getApiInfo();

      expect(result.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getSystemStatus', () => {
    it('should return healthy status when all services are connected', async () => {
      mockKnex.raw.mockResolvedValue({ rows: [{ '?column?': 1 }] });
      (mockFastifyWithRedis.redis!.ping as jest.Mock).mockResolvedValue('PONG');

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getSystemStatus();

      expect(result.status).toBe('healthy');
      expect(result.services.database.status).toBe('connected');
      expect(result.services.database.responseTime).toBeDefined();
      expect(result.services.redis).toBeDefined();
      expect(result.services.redis!.status).toBe('connected');
      expect(result.services.redis!.responseTime).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.memory.used).toBeGreaterThan(0);
      expect(result.memory.total).toBeGreaterThan(0);
      expect(result.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(result.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should return unhealthy status when database is disconnected', async () => {
      mockKnex.raw.mockRejectedValue(new Error('Connection refused'));

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getSystemStatus();

      expect(result.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('error');
      expect(result.services.database.responseTime).toBeUndefined();
    });

    it('should return degraded status when Redis is down', async () => {
      mockKnex.raw.mockResolvedValue({ rows: [{ '?column?': 1 }] });
      (mockFastifyWithRedis.redis!.ping as jest.Mock).mockRejectedValue(
        new Error('Redis connection failed'),
      );

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getSystemStatus();

      expect(result.status).toBe('degraded');
      expect(result.services.database.status).toBe('connected');
      expect(result.services.redis).toBeDefined();
      expect(result.services.redis!.status).toBe('error');
    });

    it('should work without Redis when not configured', async () => {
      mockKnex.raw.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      service = new DefaultService(mockKnex, mockFastifyWithoutRedis);
      const result = await service.getSystemStatus();

      expect(result.status).toBe('healthy');
      expect(result.services.database.status).toBe('connected');
      expect(result.services.redis).toBeUndefined();
    });

    it('should return degraded when database response time > 1000ms', async () => {
      // Mock slow database response
      mockKnex.raw.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ rows: [{ '?column?': 1 }] }), 1100);
          }),
      );

      service = new DefaultService(mockKnex, mockFastifyWithoutRedis);
      const result = await service.getSystemStatus();

      expect(result.status).toBe('degraded');
      expect(result.services.database.responseTime).toBeGreaterThan(1000);
    });

    it('should include memory status', async () => {
      mockKnex.raw.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      service = new DefaultService(mockKnex, mockFastifyWithoutRedis);
      const result = await service.getSystemStatus();

      expect(result.memory).toBeDefined();
      expect(result.memory.used).toBeGreaterThan(0);
      expect(result.memory.total).toBeGreaterThan(0);
      expect(result.memory.free).toBeGreaterThanOrEqual(0);
      expect(result.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(result.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should include timestamp and uptime', async () => {
      mockKnex.raw.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      service = new DefaultService(mockKnex, mockFastifyWithoutRedis);
      const result = await service.getSystemStatus();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('getHealthStatus', () => {
    it('should return ok status', async () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getHealthStatus();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.version).toBe('1.0.0');
    });

    it('should have consistent structure', async () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await service.getHealthStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
    });
  });

  describe('checkDatabase', () => {
    it('should return connected status when database is reachable', async () => {
      mockKnex.raw.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await (service as any).checkDatabase();

      expect(result.status).toBe('connected');
      expect(result.responseTime).toBeDefined();
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return error status when database is unreachable', async () => {
      mockKnex.raw.mockRejectedValue(new Error('Connection refused'));

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await (service as any).checkDatabase();

      expect(result.status).toBe('error');
      expect(result.responseTime).toBeUndefined();
    });
  });

  describe('checkRedis', () => {
    it('should return connected status when Redis is reachable', async () => {
      (mockFastifyWithRedis.redis!.ping as jest.Mock).mockResolvedValue('PONG');

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await (service as any).checkRedis();

      expect(result.status).toBe('connected');
      expect(result.responseTime).toBeDefined();
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return error status when Redis is unreachable', async () => {
      (mockFastifyWithRedis.redis!.ping as jest.Mock).mockRejectedValue(
        new Error('Connection refused'),
      );

      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = await (service as any).checkRedis();

      expect(result.status).toBe('error');
      expect(result.responseTime).toBeUndefined();
    });

    it('should return disconnected status when Redis is not configured', async () => {
      service = new DefaultService(mockKnex, mockFastifyWithoutRedis);
      const result = await (service as any).checkRedis();

      expect(result.status).toBe('disconnected');
    });
  });

  describe('getMemoryStatus', () => {
    it('should calculate memory usage correctly', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);
      const result = (service as any).getMemoryStatus();

      expect(result.used).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.free).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);

      // Verify calculation
      const expectedPercentage = Math.round((result.used / result.total) * 100);
      expect(result.percentage).toBe(expectedPercentage);
    });
  });

  describe('determineOverallStatus', () => {
    it('should return healthy when all services are ok', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = { status: 'connected' as const, responseTime: 50 };
      const redisStatus = { status: 'connected' as const, responseTime: 10 };
      const memoryStatus = {
        used: 100,
        total: 1000,
        free: 900,
        percentage: 10,
      };

      const result = (service as any).determineOverallStatus(
        databaseStatus,
        redisStatus,
        memoryStatus,
      );

      expect(result).toBe('healthy');
    });

    it('should return unhealthy when database is disconnected', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = { status: 'disconnected' as const };

      const result = (service as any).determineOverallStatus(databaseStatus);

      expect(result).toBe('unhealthy');
    });

    it('should return unhealthy when database has error', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = { status: 'error' as const };

      const result = (service as any).determineOverallStatus(databaseStatus);

      expect(result).toBe('unhealthy');
    });

    it('should return degraded when memory usage > 90%', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = { status: 'connected' as const, responseTime: 50 };
      const memoryStatus = { used: 950, total: 1000, free: 50, percentage: 95 };

      const result = (service as any).determineOverallStatus(
        databaseStatus,
        undefined,
        memoryStatus,
      );

      expect(result).toBe('degraded');
    });

    it('should return degraded when Redis is down', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = { status: 'connected' as const, responseTime: 50 };
      const redisStatus = { status: 'error' as const };
      const memoryStatus = {
        used: 100,
        total: 1000,
        free: 900,
        percentage: 10,
      };

      const result = (service as any).determineOverallStatus(
        databaseStatus,
        redisStatus,
        memoryStatus,
      );

      expect(result).toBe('degraded');
    });

    it('should return degraded when database response time > 1000ms', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = {
        status: 'connected' as const,
        responseTime: 1500,
      };
      const memoryStatus = {
        used: 100,
        total: 1000,
        free: 900,
        percentage: 10,
      };

      const result = (service as any).determineOverallStatus(
        databaseStatus,
        undefined,
        memoryStatus,
      );

      expect(result).toBe('degraded');
    });

    it('should return healthy when Redis is undefined (not configured)', () => {
      service = new DefaultService(mockKnex, mockFastifyWithRedis);

      const databaseStatus = { status: 'connected' as const, responseTime: 50 };
      const memoryStatus = {
        used: 100,
        total: 1000,
        free: 900,
        percentage: 10,
      };

      const result = (service as any).determineOverallStatus(
        databaseStatus,
        undefined,
        memoryStatus,
      );

      expect(result).toBe('healthy');
    });
  });
});
