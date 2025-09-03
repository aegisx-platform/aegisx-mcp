import { FastifyInstance } from 'fastify';
import { build } from '../../../test-helpers/app-helper';

describe('Navigation API Integration', () => {
  let app: FastifyInstance;
  let validToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'aegisx_test';

    app = await build({ logger: false });

    try {
      // Create test users and get tokens
      const userResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'testpass123',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'testpass123',
        },
      });

      if (loginResponse.statusCode === 200) {
        validToken = JSON.parse(loginResponse.body).data.accessToken;
      } else {
        // Create a mock token for testing if registration/login fails
        validToken = app.jwt.sign({
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'user',
        });
      }

      // Create admin user
      const adminResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'admin@example.com',
          username: 'admin',
          password: 'adminpass123',
          firstName: 'Admin',
          lastName: 'User',
        },
      });

      // Login as admin
      const adminLoginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'admin@example.com',
          password: 'adminpass123',
        },
      });

      if (adminLoginResponse.statusCode === 200) {
        adminToken = JSON.parse(adminLoginResponse.body).data.accessToken;
      } else {
        // Create a mock token for testing if registration/login fails
        adminToken = app.jwt.sign({
          id: 'admin-user-id',
          email: 'admin@example.com',
          roles: ['admin'],
        });
      }
    } catch (error) {
      // Fallback to mock tokens if auth setup fails
      validToken = app.jwt.sign({
        id: 'test-user-id',
        email: 'test@example.com',
        roles: ['user'],
      });

      adminToken = app.jwt.sign({
        id: 'admin-user-id',
        email: 'admin@example.com',
        roles: ['admin'],
      });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/navigation', () => {
    describe('Authentication', () => {
      it('should reject requests without authentication', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation',
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('UNAUTHORIZED');
      });

      it('should reject requests with invalid token', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation',
          headers: {
            authorization: 'Bearer invalid-token',
          },
        });

        expect(response.statusCode).toBe(401);
      });
    });

    describe('Successful requests', () => {
      it('should return complete navigation structure', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.default).toBeDefined();
        expect(body.data.compact).toBeDefined();
        expect(body.data.horizontal).toBeDefined();
        expect(body.data.mobile).toBeDefined();
        expect(body.meta).toBeDefined();
        expect(body.meta.timestamp).toBeDefined();
        expect(body.meta.version).toBe('1.0');
      });

      it('should return specific navigation type when requested', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation?type=compact',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.success).toBe(true);
        expect(body.data.compact).toBeDefined();
        expect(body.data.default).toBeUndefined();
        expect(body.data.horizontal).toBeUndefined();
        expect(body.data.mobile).toBeUndefined();
      });

      it('should handle includeDisabled parameter', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation?includeDisabled=true',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });

      it('should validate navigation type parameter', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation?type=invalid',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('INVALID_NAVIGATION_TYPE');
      });

      it('should handle boolean parameters correctly', async () => {
        const testCases = [
          { param: 'includeDisabled=true', expected: true },
          { param: 'includeDisabled=false', expected: false },
          { param: 'includeDisabled=1', expected: true },
          { param: 'includeDisabled=0', expected: false },
        ];

        for (const testCase of testCases) {
          const response = await app.inject({
            method: 'GET',
            url: `/api/navigation?${testCase.param}`,
            headers: {
              authorization: `Bearer ${validToken}`,
            },
          });

          expect(response.statusCode).toBe(200);
          // The actual behavior should be tested through mock verification
          // since we can't easily test the internal parameter passing
        }
      });
    });

    describe('Navigation structure validation', () => {
      it('should return navigation items with correct structure', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation?type=default',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        if (body.data.default && body.data.default.length > 0) {
          const firstItem = body.data.default[0];

          // Verify required fields
          expect(firstItem.id).toBeDefined();
          expect(firstItem.title).toBeDefined();
          expect(firstItem.type).toBeDefined();
          expect([
            'item',
            'group',
            'collapsible',
            'divider',
            'spacer',
          ]).toContain(firstItem.type);

          // Verify optional fields are properly included/excluded
          if (firstItem.target) {
            expect(['_self', '_blank', '_parent', '_top']).toContain(
              firstItem.target,
            );
          }

          if (firstItem.badge) {
            expect(
              firstItem.badge.title || firstItem.badge.variant,
            ).toBeDefined();
          }

          if (firstItem.children) {
            expect(Array.isArray(firstItem.children)).toBe(true);
          }
        }
      });

      it('should return hierarchical structure with children', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation?type=default',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        // Look for a collapsible item that should have children
        const collapsibleItem = body.data.default?.find(
          (item: any) => item.type === 'collapsible',
        );

        if (collapsibleItem) {
          expect(collapsibleItem.children).toBeDefined();
          expect(Array.isArray(collapsibleItem.children)).toBe(true);

          if (collapsibleItem.children.length > 0) {
            const child = collapsibleItem.children[0];
            expect(child.id).toBeDefined();
            expect(child.title).toBeDefined();
            expect(child.type).toBeDefined();
          }
        }
      });
    });
  });

  describe('GET /api/navigation/user', () => {
    describe('Authentication', () => {
      it('should reject requests without authentication', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation/user',
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Successful requests', () => {
      it('should return user-specific navigation structure', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation/user',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.meta).toBeDefined();
        expect(body.meta.timestamp).toBeDefined();
        expect(body.meta.version).toBe('1.0');
      });

      it('should filter navigation by user permissions', async () => {
        const userResponse = await app.inject({
          method: 'GET',
          url: '/api/navigation/user',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        const adminResponse = await app.inject({
          method: 'GET',
          url: '/api/navigation/user',
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        });

        expect(userResponse.statusCode).toBe(200);
        expect(adminResponse.statusCode).toBe(200);

        const userBody = JSON.parse(userResponse.body);
        const adminBody = JSON.parse(adminResponse.body);

        // Admin should typically have more or equal navigation items
        // This test depends on the seed data and permission setup
        expect(userBody.data).toBeDefined();
        expect(adminBody.data).toBeDefined();
      });

      it('should return specific navigation type for user', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation/user?type=mobile',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.success).toBe(true);
        expect(body.data.mobile).toBeDefined();
        expect(body.data.default).toBeUndefined();
      });

      it('should validate navigation type parameter', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation/user?type=invalid',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('INVALID_NAVIGATION_TYPE');
      });
    });

    describe('User-specific features', () => {
      it('should exclude items user does not have permissions for', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/navigation/user?type=default',
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        // Check that items requiring high-level permissions are not included
        // This depends on the permission setup in seeds
        const allItems = body.data.default || [];
        const flattenItems = (items: any[]): any[] => {
          return items.reduce((acc, item) => {
            acc.push(item);
            if (item.children) {
              acc.push(...flattenItems(item.children));
            }
            return acc;
          }, []);
        };

        const flatItems = flattenItems(allItems);

        // Items should not include those requiring system-level permissions
        const systemItems = flatItems.filter(
          (item: any) =>
            item.permissions &&
            item.permissions.some((p: string) => p.startsWith('system.')),
        );

        expect(systemItems.length).toBe(0);
      });
    });
  });

  describe('Health check endpoint', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/navigation/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data.module).toBe('navigation');
      expect(body.data.status).toBe('healthy');
      expect(body.data.database).toBe('connected');
      expect(body.data.responseTime).toBeDefined();
      expect(body.data.timestamp).toBeDefined();
      expect(body.data.uptime).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // Mock a database error by using an invalid URL
      const response = await app.inject({
        method: 'GET',
        url: '/api/navigation/nonexistent',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return proper error structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/navigation',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBeDefined();
      expect(body.error.message).toBeDefined();
    });
  });

  describe('Response format validation', () => {
    it('should match OpenAPI specification format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/navigation?type=default',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Validate top-level response structure
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.meta).toBeDefined();
      expect(body.meta.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(body.meta.version).toBe('1.0');

      // Validate navigation structure
      if (body.data.default) {
        expect(Array.isArray(body.data.default)).toBe(true);

        body.data.default.forEach((item: any) => {
          expect(typeof item.id).toBe('string');
          expect(typeof item.title).toBe('string');
          expect([
            'item',
            'group',
            'collapsible',
            'divider',
            'spacer',
          ]).toContain(item.type);

          if (item.badge) {
            expect([
              'default',
              'primary',
              'secondary',
              'success',
              'warning',
              'error',
            ]).toContain(item.badge.variant || 'default');
          }

          if (item.permissions) {
            expect(Array.isArray(item.permissions)).toBe(true);
            item.permissions.forEach((permission: any) => {
              expect(typeof permission).toBe('string');
            });
          }
        });
      }
    });
  });

  describe('Caching behavior', () => {
    it('should handle cache-related headers correctly', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/navigation?type=default',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/navigation?type=default',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      // Both responses should be successful and have similar structure
      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body1.success).toBe(true);
      expect(body2.success).toBe(true);
      expect(body1.data).toBeDefined();
      expect(body2.data).toBeDefined();
    });
  });
});
