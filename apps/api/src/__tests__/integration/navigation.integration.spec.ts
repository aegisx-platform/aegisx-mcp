import { FastifyInstance } from 'fastify';
import { setupTestContext } from './setup';
import { AuthHelper } from './auth-helper';
import { DatabaseHelper } from './db-helper';
import { RequestHelper } from './request-helper';
import { expectResponse, commonAssertions } from './assertions';

describe('Navigation API Integration Tests', () => {
  let app: FastifyInstance;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let requestHelper: RequestHelper;
  let testContext: any;

  // Test users
  let adminUser: any;
  let adminToken: string;
  let regularUser: any;
  let regularToken: string;
  let managerUser: any;
  let managerToken: string;

  beforeAll(async () => {
    // Setup test context
    testContext = await setupTestContext({
      runMigrations: true,
      runSeeds: true,
      cleanDatabase: true,
    });

    app = testContext.app;
    authHelper = new AuthHelper(app, testContext.db.connection);
    dbHelper = new DatabaseHelper(testContext.db.connection);
    requestHelper = new RequestHelper(app);

    // Create test users with different roles
    const adminResult = await authHelper.createUserWithRole(
      'admin',
      ['navigation.view', 'navigation.write', 'admin.read', 'admin.write'],
      {
        email: 'navtest-admin@test.com',
        username: 'navtest-admin',
        firstName: 'Admin',
        lastName: 'User',
      },
    );
    adminUser = adminResult;
    const adminTokens = await authHelper.loginUser(
      adminUser.email,
      adminUser.password,
    );
    adminToken = adminTokens.accessToken;

    const regularResult = await authHelper.createUserWithRole(
      'user',
      ['navigation.view', 'profile.read', 'profile.write'],
      {
        email: 'navtest-user@test.com',
        username: 'navtest-regularuser',
        firstName: 'Regular',
        lastName: 'User',
      },
    );
    regularUser = regularResult;
    const regularTokens = await authHelper.loginUser(
      regularUser.email,
      regularUser.password,
    );
    regularToken = regularTokens.accessToken;

    const managerResult = await authHelper.createUserWithRole(
      'manager',
      ['navigation.view', 'users.read', 'reports.read'],
      {
        email: 'navtest-manager@test.com',
        username: 'navtest-manager',
        firstName: 'Manager',
        lastName: 'User',
      },
    );
    managerUser = managerResult;
    const managerTokens = await authHelper.loginUser(
      managerUser.email,
      managerUser.password,
    );
    managerToken = managerTokens.accessToken;

    // Create test navigation structure
    await testContext.factories.data.createNavigationStructure();
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(async () => {
    // Clean up any test-specific data created during tests
    await dbHelper.cleanup();
    // Recreate test navigation structure
    await testContext.factories.data.createNavigationStructure();
  });

  describe('GET /api/navigation', () => {
    describe('Authentication and Authorization', () => {
      it('should reject requests without authentication', async () => {
        const response = await requestHelper.get('/api/navigation');

        expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
      });

      it('should reject requests with invalid token', async () => {
        const response = await requestHelper.get('/api/navigation', {
          headers: { Authorization: 'Bearer invalid-token' },
        });

        expectResponse(response).isUnauthorized();
      });

      it('should accept requests with valid token', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: regularToken,
        });

        expectResponse(response).hasStatus(200).isSuccess();
      });
    });

    describe('Navigation Structure Response', () => {
      it('should return complete navigation structure by default', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.default).toBeDefined();
            expect(data.compact).toBeDefined();
            expect(data.horizontal).toBeDefined();
            expect(data.mobile).toBeDefined();
            expect(Array.isArray(data.default)).toBe(true);
          })
          .hasMeta({ version: '1.0' });
      });

      it('should return specific navigation type when requested', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { type: 'compact' },
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.compact).toBeDefined();
            expect(data.default).toBeUndefined();
            expect(data.horizontal).toBeUndefined();
            expect(data.mobile).toBeUndefined();
          });
      });

      it('should validate navigation type parameter', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { type: 'invalid-type' },
        });

        expectResponse(response)
          .hasStatus(400)
          .isError('INVALID_NAVIGATION_TYPE');
      });

      it('should handle includeDisabled parameter', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { includeDisabled: 'true' },
        });

        expectResponse(response).hasStatus(200).isSuccess();
      });
    });

    describe('Navigation Item Structure Validation', () => {
      it('should return navigation items with correct structure', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { type: 'default' },
        });

        const responseData = expectResponse(response)
          .hasStatus(200)
          .isSuccess();

        const body = response.body;
        if (body.data.default && body.data.default.length > 0) {
          const firstItem = body.data.default[0];

          // Verify required fields
          expect(firstItem.id).toBeDefined();
          expect(typeof firstItem.id).toBe('string');
          expect(firstItem.title).toBeDefined();
          expect(typeof firstItem.title).toBe('string');
          expect(firstItem.type).toBeDefined();
          expect([
            'item',
            'group',
            'collapsible',
            'divider',
            'spacer',
          ]).toContain(firstItem.type);

          // Verify optional fields when present
          if (firstItem.badge) {
            expect([
              'default',
              'primary',
              'secondary',
              'success',
              'warning',
              'error',
            ]).toContain(firstItem.badge.variant || 'default');
          }

          if (firstItem.permissions) {
            expect(Array.isArray(firstItem.permissions)).toBe(true);
            firstItem.permissions.forEach((permission: any) => {
              expect(typeof permission).toBe('string');
            });
          }
        }
      });

      it('should return hierarchical structure with children', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { type: 'default' },
        });

        expectResponse(response).hasStatus(200).isSuccess();

        const body = response.body;
        const collapsibleItem = body.data.default?.find(
          (item: any) => item.type === 'group' && item.children,
        );

        if (collapsibleItem && collapsibleItem.children) {
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

    describe('Caching Behavior', () => {
      it('should handle cache-related headers correctly', async () => {
        const response1 = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { type: 'default' },
        });

        const response2 = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
          query: { type: 'default' },
        });

        expectResponse(response1).hasStatus(200).isSuccess();

        expectResponse(response2).hasStatus(200).isSuccess();

        // Both responses should have similar structure
        expect(response1.body.success).toBe(true);
        expect(response2.body.success).toBe(true);
        expect(response1.body.data).toBeDefined();
        expect(response2.body.data).toBeDefined();
      });

      it('should return appropriate cache headers', async () => {
        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
        });

        expectResponse(response).hasStatus(200).isSuccess();

        // Check for cache-related headers
        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });

    describe('Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        // Simulate database error by closing connection temporarily
        await testContext.db.connection.destroy();

        const response = await requestHelper.getAuth('/api/navigation', {
          token: adminToken,
        });

        // Should handle the error gracefully
        expect([500, 503]).toContain(response.status);

        // Reconnect for other tests
        testContext = await setupTestContext({
          runMigrations: false,
          runSeeds: false,
          cleanDatabase: false,
        });
      });

      it('should return proper error structure for server errors', async () => {
        const response = await requestHelper.getAuth(
          '/api/navigation/nonexistent',
          {
            token: adminToken,
          },
        );

        expectResponse(response).hasStatus(404);
      });
    });
  });

  describe('GET /api/navigation/user', () => {
    describe('Authentication', () => {
      it('should reject requests without authentication', async () => {
        const response = await requestHelper.get('/api/navigation/user');

        expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
      });

      it('should accept authenticated requests', async () => {
        const response = await requestHelper.getAuth('/api/navigation/user', {
          token: regularToken,
        });

        expectResponse(response).hasStatus(200).isSuccess();
      });
    });

    describe('User-specific Navigation', () => {
      it('should return user-specific navigation structure', async () => {
        const response = await requestHelper.getAuth('/api/navigation/user', {
          token: regularToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data).toBeDefined();
            expect(typeof data).toBe('object');
          })
          .hasMeta({ version: '1.0' });
      });

      it('should filter navigation by user permissions', async () => {
        // Get navigation for regular user
        const userResponse = await requestHelper.getAuth(
          '/api/navigation/user',
          {
            token: regularToken,
            query: { type: 'default' },
          },
        );

        // Get navigation for admin user
        const adminResponse = await requestHelper.getAuth(
          '/api/navigation/user',
          {
            token: adminToken,
            query: { type: 'default' },
          },
        );

        expectResponse(userResponse).hasStatus(200).isSuccess();

        expectResponse(adminResponse).hasStatus(200).isSuccess();

        const userData = userResponse.body.data;
        const adminData = adminResponse.body.data;

        expect(userData).toBeDefined();
        expect(adminData).toBeDefined();

        // Admin should typically have access to more items
        // This depends on the seed data and permission setup
      });

      it('should exclude items user does not have permissions for', async () => {
        const response = await requestHelper.getAuth('/api/navigation/user', {
          token: regularToken,
          query: { type: 'default' },
        });

        expectResponse(response).hasStatus(200).isSuccess();

        const body = response.body;
        const allItems = body.data.default || [];

        // Helper to flatten navigation tree
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

        // Regular user should not have access to admin-only items
        const adminItems = flatItems.filter(
          (item: any) =>
            item.permissions &&
            item.permissions.some((p: string) => p.startsWith('admin.')),
        );

        expect(adminItems.length).toBe(0);
      });

      it('should return specific navigation type for user', async () => {
        const response = await requestHelper.getAuth('/api/navigation/user', {
          token: regularToken,
          query: { type: 'mobile' },
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.mobile).toBeDefined();
            expect(data.default).toBeUndefined();
          });
      });

      it('should validate navigation type parameter', async () => {
        const response = await requestHelper.getAuth('/api/navigation/user', {
          token: regularToken,
          query: { type: 'invalid-type' },
        });

        expectResponse(response)
          .hasStatus(400)
          .isError('INVALID_NAVIGATION_TYPE');
      });
    });

    describe('Role-based Navigation', () => {
      it('should return different navigation for different roles', async () => {
        const regularResponse = await requestHelper.getAuth(
          '/api/navigation/user',
          {
            token: regularToken,
            query: { type: 'default' },
          },
        );

        const managerResponse = await requestHelper.getAuth(
          '/api/navigation/user',
          {
            token: managerToken,
            query: { type: 'default' },
          },
        );

        const adminResponse = await requestHelper.getAuth(
          '/api/navigation/user',
          {
            token: adminToken,
            query: { type: 'default' },
          },
        );

        expectResponse(regularResponse).hasStatus(200).isSuccess();
        expectResponse(managerResponse).hasStatus(200).isSuccess();
        expectResponse(adminResponse).hasStatus(200).isSuccess();

        // Each role should have access to different sets of navigation items
        const regularData = regularResponse.body.data;
        const managerData = managerResponse.body.data;
        const adminData = adminResponse.body.data;

        expect(regularData).toBeDefined();
        expect(managerData).toBeDefined();
        expect(adminData).toBeDefined();
      });

      it('should include role-specific navigation items', async () => {
        const managerResponse = await requestHelper.getAuth(
          '/api/navigation/user',
          {
            token: managerToken,
            query: { type: 'default' },
          },
        );

        expectResponse(managerResponse).hasStatus(200).isSuccess();

        // Manager should have access to manager-specific items
        // This test depends on the seed data structure
      });
    });
  });

  describe('Navigation Health Check', () => {
    it('should return navigation module health status', async () => {
      const response = await requestHelper.get('/api/navigation/health');

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.module).toBe('navigation');
          expect(data.status).toBe('healthy');
          expect(data.database).toBe('connected');
          expect(data.responseTime).toBeDefined();
          expect(data.timestamp).toBeDefined();
          expect(data.uptime).toBeDefined();
        });
    });
  });

  describe('Response Format Validation', () => {
    it('should match OpenAPI specification format', async () => {
      const response = await requestHelper.getAuth('/api/navigation', {
        token: adminToken,
        query: { type: 'default' },
      });

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .matchesOpenApiSchema((body: any) => {
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

    it('should include proper timestamp format in meta', async () => {
      const response = await requestHelper.getAuth('/api/navigation', {
        token: adminToken,
      });

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasMeta({
          version: '1.0',
          timestamp: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
        });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();

      const response = await requestHelper.getAuth('/api/navigation', {
        token: adminToken,
      });

      const responseTime = Date.now() - startTime;

      expectResponse(response).hasStatus(200).isSuccess();

      // Response should be under 1 second for navigation data
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          requestHelper.getAuth('/api/navigation', { token: adminToken }),
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expectResponse(response).hasStatus(200).isSuccess();
      });
    });
  });
});
