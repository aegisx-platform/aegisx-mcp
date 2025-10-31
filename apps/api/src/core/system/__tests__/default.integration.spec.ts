import { FastifyInstance } from 'fastify';
import { build } from '../../../test-helpers/app-helper';

describe('System API Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'aegisx_test';

    app = await build({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/info', () => {
    it('should return API information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/info',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.name).toBe('AegisX Platform API');
      expect(body.data.version).toBeDefined();
      expect(body.data.description).toBeDefined();
      expect(body.data.environment).toBe('test');
      expect(body.data.uptime).toBeGreaterThanOrEqual(0);
      expect(body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include message in response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/info',
      });

      const body = JSON.parse(response.body);
      expect(body.message).toBe('API information retrieved successfully');
    });
  });

  describe('GET /api/status', () => {
    it('should return detailed system status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/status',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.status).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(body.data.uptime).toBeGreaterThanOrEqual(0);
      expect(body.data.version).toBeDefined();
    });

    it('should include database service status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/status',
      });

      const body = JSON.parse(response.body);
      expect(body.data.services).toBeDefined();
      expect(body.data.services.database).toBeDefined();
      expect(body.data.services.database.status).toMatch(
        /^(connected|disconnected|error)$/,
      );

      if (body.data.services.database.status === 'connected') {
        expect(body.data.services.database.responseTime).toBeGreaterThanOrEqual(
          0,
        );
      }
    });

    it('should include memory status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/status',
      });

      const body = JSON.parse(response.body);
      expect(body.data.memory).toBeDefined();
      expect(body.data.memory.used).toBeGreaterThan(0);
      expect(body.data.memory.total).toBeGreaterThan(0);
      expect(body.data.memory.free).toBeGreaterThanOrEqual(0);
      expect(body.data.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(body.data.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should include Redis status when available', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/status',
      });

      const body = JSON.parse(response.body);

      // Redis may or may not be configured in test environment
      if (body.data.services.redis) {
        expect(body.data.services.redis.status).toMatch(
          /^(connected|disconnected|error)$/,
        );
      }
    });
  });

  describe('GET /api/health', () => {
    it('should return simple health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.status).toMatch(/^(ok|error)$/);
      expect(body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(body.data.version).toBeDefined();
    });

    it('should return ok status in test environment', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('ok');
    });
  });

  describe('GET /api/ping', () => {
    it('should return pong response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/ping',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.message).toBe('pong');
      expect(body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should have message "Ping successful"', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/ping',
      });

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Ping successful');
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.message).toBe('Welcome to AegisX Platform API');
      expect(body.data.description).toBeDefined();
      expect(body.data.version).toBeDefined();
      expect(body.data.environment).toBe('test');
      expect(body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include endpoints information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      const body = JSON.parse(response.body);
      expect(body.data.endpoints).toBeDefined();
      expect(body.data.endpoints.api).toBe('/api');
      expect(body.data.endpoints.health).toBe('/api/health');
      expect(body.data.endpoints.info).toBe('/api/info');
      expect(body.data.endpoints.status).toBe('/api/status');
      expect(body.data.endpoints.documentation).toBe('/documentation');
    });

    it('should include ASCII logo', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      const body = JSON.parse(response.body);
      expect(body.data.logo).toBeDefined();
      expect(Array.isArray(body.data.logo)).toBe(true);
      expect(body.data.logo.length).toBeGreaterThan(0);
      expect(typeof body.data.logo[0]).toBe('string');
    });
  });

  describe('Response format consistency', () => {
    it('should follow standard success response format', async () => {
      const endpoints = ['/api/info', '/api/status', '/api/health', '/api/ping'];

      for (const endpoint of endpoints) {
        const response = await app.inject({
          method: 'GET',
          url: endpoint,
        });

        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('success');
        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('message');
        expect(body.success).toBe(true);
      }
    });
  });

  describe('Performance', () => {
    it('should respond quickly to health check', async () => {
      const startTime = Date.now();

      await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should be under 100ms
    });

    it('should respond quickly to ping', async () => {
      const startTime = Date.now();

      await app.inject({
        method: 'GET',
        url: '/api/ping',
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50); // Should be under 50ms
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10)
        .fill(null)
        .map(() =>
          app.inject({
            method: 'GET',
            url: '/api/health',
          }),
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });
    });

    it('should maintain consistent uptime values', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/info',
      });

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/info',
      });

      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body2.data.uptime).toBeGreaterThanOrEqual(body1.data.uptime);
    });
  });
});
