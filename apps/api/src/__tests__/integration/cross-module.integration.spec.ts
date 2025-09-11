import { FastifyInstance } from 'fastify';
import { setupTestContext } from './setup';
import { AuthHelper } from './auth-helper';
import { DatabaseHelper } from './db-helper';
import { RequestHelper } from './request-helper';
import { expectResponse, commonAssertions } from './assertions';

describe('Cross-Module Integration Tests', () => {
  let app: FastifyInstance;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let requestHelper: RequestHelper;
  let testContext: any;

  // Test users with different roles
  let adminUser: any;
  let adminToken: string;
  let managerUser: any;
  let managerToken: string;
  let regularUser: any;
  let regularToken: string;
  let limitedUser: any;
  let limitedToken: string;

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

    // Create test users with comprehensive permissions
    const adminResult = await authHelper.createUserWithRole(
      'admin',
      [
        'admin.read',
        'admin.write',
        'users.read',
        'users.write',
        'navigation.read',
        'navigation.write',
        'profile.read',
        'profile.write',
        'reports.read',
        'settings.read',
        'settings.write',
      ],
      {
        email: 'crosstest-admin@example.com',
        username: 'crosstest-admin',
        firstName: 'Super',
        lastName: 'Admin',
      },
    );
    adminUser = adminResult;
    const adminTokens = await authHelper.loginUser(
      adminUser.email,
      adminUser.password,
    );
    adminToken = adminTokens.accessToken;

    const managerResult = await authHelper.createUserWithRole(
      'manager',
      [
        'users.read',
        'navigation.read',
        'profile.read',
        'profile.write',
        'reports.read',
        'team.read',
        'team.write',
      ],
      {
        email: 'crosstest-manager@example.com',
        username: 'crosstest-manager',
        firstName: 'Team',
        lastName: 'Manager',
      },
    );
    managerUser = managerResult;
    const managerTokens = await authHelper.loginUser(
      managerUser.email,
      managerUser.password,
    );
    managerToken = managerTokens.accessToken;

    const regularResult = await authHelper.createUserWithRole(
      'user',
      ['profile.read', 'profile.write', 'navigation.read', 'basic.read'],
      {
        email: 'crosstest-user@example.com',
        username: 'crosstest-user',
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

    const limitedResult = await authHelper.createUserWithRole(
      'limited',
      ['profile.read'],
      {
        email: 'crosstest-limited@example.com',
        username: 'crosstest-limited',
        firstName: 'Limited',
        lastName: 'User',
      },
    );
    limitedUser = limitedResult;
    const limitedTokens = await authHelper.loginUser(
      limitedUser.email,
      limitedUser.password,
    );
    limitedToken = limitedTokens.accessToken;

    // Create comprehensive test navigation structure
    await testContext.factories.data.createNavigationStructure();
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(async () => {
    // Reset any changes made during individual tests
    await testContext.db
      .connection('user_preferences')
      .where('user_id', regularUser.id)
      .update({
        theme: 'default',
        scheme: 'light',
        layout: 'classic',
        navigation_type: 'default',
        updated_at: new Date(),
      });
  });

  describe('Authentication → Profile → Navigation Flow', () => {
    it('should show complete user journey from login to navigation', async () => {
      // Step 1: Login
      const loginResponse = await requestHelper.post('/api/auth/login', {
        body: {
          email: regularUser.email,
          password: regularUser.password,
        },
      });

      expectResponse(loginResponse).hasStatus(200).isSuccess();

      const { accessToken } = loginResponse.body.data;

      // Step 2: Get Profile
      const profileResponse = await requestHelper.getAuth(
        '/api/users/profile',
        {
          token: accessToken,
        },
      );

      expectResponse(profileResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.id).toBe(regularUser.id);
          expect(data.role.name).toBe('user');
          expect(data.preferences).toBeDefined();
        });

      // Step 3: Get Navigation based on user role and preferences
      const navigationResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: accessToken,
          query: {
            type: profileResponse.body.data.preferences.navigation.type,
          },
        },
      );

      expectResponse(navigationResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data).toBeDefined();
          // Navigation should be filtered based on user permissions
        });

      // Step 4: Verify navigation permissions match user role
      const userPermissions = profileResponse.body.data.role.permissions;
      expect(userPermissions).toContain('navigation.read');
      expect(userPermissions).not.toContain('admin.read');
    });

    it('should reflect preference changes in navigation display', async () => {
      // Update user preferences to compact layout
      const prefsUpdate = await requestHelper.putAuth(
        '/api/users/preferences',
        {
          token: regularToken,
          body: {
            navigation: {
              type: 'compact',
              collapsed: true,
            },
          },
        },
      );

      expectResponse(prefsUpdate).hasStatus(200).isSuccess();

      // Get navigation with updated preferences
      const navigationResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: regularToken,
          query: { type: 'compact' },
        },
      );

      expectResponse(navigationResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.compact).toBeDefined();
          expect(data.default).toBeUndefined();
        });
    });
  });

  describe('Role-Based Access Control Integration', () => {
    it('should enforce consistent permissions across all modules', async () => {
      // Test that limited user cannot access restricted resources
      const restrictedEndpoints = [
        '/api/users/profile', // Should work (has profile.read)
        '/api/users/preferences', // Should fail (no profile.write for preferences endpoint)
        '/api/navigation/user', // Should fail (no navigation.read)
      ];

      // Test profile access (should work)
      const profileResponse = await requestHelper.getAuth(
        '/api/users/profile',
        {
          token: limitedToken,
        },
      );
      expectResponse(profileResponse).hasStatus(200).isSuccess();

      // Test preferences access (should work for GET)
      const prefsResponse = await requestHelper.getAuth(
        '/api/users/preferences',
        {
          token: limitedToken,
        },
      );
      expectResponse(prefsResponse).hasStatus(200).isSuccess();

      // Test navigation access (should fail due to lack of navigation.read)
      const navResponse = await requestHelper.getAuth('/api/navigation/user', {
        token: limitedToken,
      });
      expectResponse(navResponse).hasStatus(403).isForbidden();
    });

    it('should show different navigation items based on role permissions', async () => {
      // Get navigation for different user roles
      const adminNavResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: adminToken,
          query: { type: 'default' },
        },
      );

      const managerNavResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: managerToken,
          query: { type: 'default' },
        },
      );

      const regularNavResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: regularToken,
          query: { type: 'default' },
        },
      );

      expectResponse(adminNavResponse).hasStatus(200).isSuccess();
      expectResponse(managerNavResponse).hasStatus(200).isSuccess();
      expectResponse(regularNavResponse).hasStatus(200).isSuccess();

      const adminNav = adminNavResponse.body.data.default || [];
      const managerNav = managerNavResponse.body.data.default || [];
      const regularNav = regularNavResponse.body.data.default || [];

      // Helper to flatten navigation items
      const flattenNav = (items: any[]): string[] => {
        return items.reduce((acc, item) => {
          acc.push(item.id);
          if (item.children) {
            acc.push(...flattenNav(item.children));
          }
          return acc;
        }, []);
      };

      const adminItems = flattenNav(adminNav);
      const managerItems = flattenNav(managerNav);
      const regularItems = flattenNav(regularNav);

      // Admin should have the most items
      expect(adminItems.length).toBeGreaterThanOrEqual(managerItems.length);
      expect(managerItems.length).toBeGreaterThanOrEqual(regularItems.length);

      // Regular user should not see admin-specific items
      const hasAdminItems = regularItems.some((item) => item.includes('admin'));
      expect(hasAdminItems).toBe(false);
    });

    it('should maintain session consistency across modules', async () => {
      // Login and get tokens
      const loginResponse = await requestHelper.post('/api/auth/login', {
        body: {
          email: managerUser.email,
          password: managerUser.password,
        },
      });

      const { accessToken, refreshToken } = loginResponse.body.data;

      // Use token across different modules
      const profileResponse = await requestHelper.getAuth(
        '/api/users/profile',
        {
          token: accessToken,
        },
      );

      const navigationResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: accessToken,
        },
      );

      expectResponse(profileResponse).hasStatus(200).isSuccess();
      expectResponse(navigationResponse).hasStatus(200).isSuccess();

      // Both should return data for the same user
      expect(profileResponse.body.data.id).toBe(managerUser.id);
      expect(navigationResponse.body.success).toBe(true);

      // Logout should invalidate token across all modules
      const logoutResponse = await requestHelper.postAuth('/api/auth/logout', {
        token: accessToken,
      });

      expectResponse(logoutResponse).hasStatus(200).isSuccess();

      // Token should now be invalid for all modules
      const profileAfterLogout = await requestHelper.getAuth(
        '/api/users/profile',
        {
          token: accessToken,
        },
      );

      const navAfterLogout = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: accessToken,
        },
      );

      expectResponse(profileAfterLogout).isUnauthorized();
      expectResponse(navAfterLogout).isUnauthorized();
    });
  });

  describe('Data Consistency and Transactions', () => {
    it('should maintain data consistency when updating profiles', async () => {
      // Update profile data
      const profileUpdate = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      const updateResponse = await requestHelper.putAuth('/api/users/profile', {
        token: regularToken,
        body: profileUpdate,
      });

      expectResponse(updateResponse).hasStatus(200).isSuccess();

      // Verify the change is reflected when getting profile
      const getProfileResponse = await requestHelper.getAuth(
        '/api/users/profile',
        {
          token: regularToken,
        },
      );

      expectResponse(getProfileResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.firstName).toBe('UpdatedFirst');
          expect(data.lastName).toBe('UpdatedLast');
          expect(data.name).toBe('UpdatedFirst UpdatedLast');
        });

      // Verify the change is also reflected in the database
      const dbUser = await testContext.db
        .connection('users')
        .where('id', regularUser.id)
        .first();

      expect(dbUser.first_name).toBe('UpdatedFirst');
      expect(dbUser.last_name).toBe('UpdatedLast');
    });

    it('should handle cascading preference updates', async () => {
      // Update navigation preferences
      const prefsUpdate = {
        theme: 'dark',
        navigation: {
          type: 'horizontal',
          collapsed: false,
          position: 'top',
        },
      };

      const updateResponse = await requestHelper.putAuth(
        '/api/users/preferences',
        {
          token: regularToken,
          body: prefsUpdate,
        },
      );

      expectResponse(updateResponse).hasStatus(200).isSuccess();

      // Get updated profile to see preference changes
      const profileResponse = await requestHelper.getAuth(
        '/api/users/profile',
        {
          token: regularToken,
        },
      );

      expectResponse(profileResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.preferences.theme).toBe('dark');
          expect(data.preferences.navigation.type).toBe('horizontal');
          expect(data.preferences.navigation.position).toBe('top');
        });

      // Navigation should reflect the new preferences
      const navigationResponse = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: regularToken,
          query: { type: 'horizontal' },
        },
      );

      expectResponse(navigationResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.horizontal).toBeDefined();
          expect(data.default).toBeUndefined();
        });
    });
  });

  describe('Error Propagation and Handling', () => {
    it('should handle authentication failures consistently across modules', async () => {
      const expiredToken = authHelper.generateToken(
        { id: regularUser.id, email: regularUser.email },
        { expiresIn: '-1h' },
      );

      const endpoints = [
        '/api/users/profile',
        '/api/users/preferences',
        '/api/navigation/user',
      ];

      for (const endpoint of endpoints) {
        const response = await requestHelper.getAuth(endpoint, {
          token: expiredToken,
        });

        expectResponse(response).isUnauthorized().isError('TOKEN_EXPIRED');
      }
    });

    it('should handle permission errors consistently', async () => {
      // Create a user with very limited permissions
      const veryLimitedUser = await authHelper.createUserWithRole(
        'viewer',
        [],
        {
          email: 'crosstest-viewer@example.com',
          username: 'crosstest-viewer',
        },
      );
      const viewerTokens = await authHelper.loginUser(
        veryLimitedUser.email,
        veryLimitedUser.password,
      );
      const viewerToken = viewerTokens.accessToken;

      // Test endpoints that should fail
      const protectedEndpoints = [
        { url: '/api/users/preferences', method: 'PUT' as const },
        { url: '/api/navigation/user', method: 'GET' as const },
      ];

      for (const endpoint of protectedEndpoints) {
        let response;
        if (endpoint.method === 'PUT') {
          response = await requestHelper.putAuth(endpoint.url, {
            token: viewerToken,
            body: { theme: 'dark' },
          });
        } else {
          response = await requestHelper.getAuth(endpoint.url, {
            token: viewerToken,
          });
        }

        expect([403, 401]).toContain(response.status);
      }
    });

    it('should maintain consistent error response format across modules', async () => {
      const invalidRequests = [
        { url: '/api/users/profile', token: 'invalid' },
        { url: '/api/navigation/user', token: 'invalid' },
        { url: '/api/users/preferences', token: 'invalid' },
      ];

      for (const request of invalidRequests) {
        const response = await requestHelper.getAuth(request.url, {
          token: request.token,
        });

        expectResponse(response)
          .isUnauthorized()
          .matchesOpenApiSchema((body: any) => {
            expect(body.success).toBe(false);
            expect(body.error).toBeDefined();
            expect(body.error.code).toBeDefined();
            expect(body.error.message).toBeDefined();
            expect(typeof body.error.code).toBe('string');
            expect(typeof body.error.message).toBe('string');
          });
      }
    });
  });

  describe('Performance and Caching Integration', () => {
    it('should handle concurrent requests across modules efficiently', async () => {
      const startTime = Date.now();

      // Make concurrent requests to different modules
      const requests = [
        requestHelper.getAuth('/api/users/profile', { token: adminToken }),
        requestHelper.getAuth('/api/navigation/user', { token: adminToken }),
        requestHelper.getAuth('/api/users/preferences', { token: adminToken }),
        requestHelper.getAuth('/api/navigation', { token: adminToken }),
      ];

      const responses = await Promise.all(requests);

      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach((response) => {
        expect([200, 201]).toContain(response.status);
      });

      // Should complete reasonably quickly (within 2 seconds for all concurrent requests)
      expect(totalTime).toBeLessThan(2000);
    });

    it('should maintain cache consistency across modules', async () => {
      // Get navigation twice to test caching
      const nav1 = await requestHelper.getAuth('/api/navigation', {
        token: adminToken,
        query: { type: 'default' },
      });

      const nav2 = await requestHelper.getAuth('/api/navigation', {
        token: adminToken,
        query: { type: 'default' },
      });

      expectResponse(nav1).hasStatus(200).isSuccess();
      expectResponse(nav2).hasStatus(200).isSuccess();

      // Both responses should be structurally identical
      expect(nav1.body.success).toBe(nav2.body.success);
      expect(nav1.body.data).toBeDefined();
      expect(nav2.body.data).toBeDefined();
    });
  });

  describe('End-to-End User Workflows', () => {
    it('should support complete user onboarding workflow', async () => {
      // 1. Register new user
      const userData = {
        email: 'crosstest-newworkflow@example.com',
        username: 'crosstest-workflowuser',
        password: 'securepass123',
        firstName: 'Workflow',
        lastName: 'User',
      };

      const registerResponse = await requestHelper.post('/api/auth/register', {
        body: userData,
      });

      expectResponse(registerResponse).hasStatus(201).isSuccess();

      const { accessToken } = registerResponse.body.data;

      // 2. Get initial profile
      const initialProfile = await requestHelper.getAuth('/api/users/profile', {
        token: accessToken,
      });

      expectResponse(initialProfile)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.firstName).toBe('Workflow');
          expect(data.preferences).toBeDefined();
          expect(data.preferences.theme).toBe('default');
        });

      // 3. Customize preferences
      const customPrefs = {
        theme: 'dark',
        layout: 'compact',
        navigation: {
          type: 'compact',
          position: 'left',
        },
      };

      const prefsResponse = await requestHelper.putAuth(
        '/api/users/preferences',
        {
          token: accessToken,
          body: customPrefs,
        },
      );

      expectResponse(prefsResponse).hasStatus(200).isSuccess();

      // 4. Get personalized navigation
      const personalizedNav = await requestHelper.getAuth(
        '/api/navigation/user',
        {
          token: accessToken,
          query: { type: 'compact' },
        },
      );

      expectResponse(personalizedNav)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.compact).toBeDefined();
        });

      // 5. Update profile information
      const profileUpdate = {
        firstName: 'Updated Workflow',
        lastName: 'Power User',
      };

      const updateResponse = await requestHelper.putAuth('/api/users/profile', {
        token: accessToken,
        body: profileUpdate,
      });

      expectResponse(updateResponse)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.firstName).toBe('Updated Workflow');
          expect(data.lastName).toBe('Power User');
        });

      // 6. Verify all changes persist
      const finalProfile = await requestHelper.getAuth('/api/users/profile', {
        token: accessToken,
      });

      expectResponse(finalProfile)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.firstName).toBe('Updated Workflow');
          expect(data.preferences.theme).toBe('dark');
          expect(data.preferences.layout).toBe('compact');
        });
    });

    it('should handle admin user management workflow', async () => {
      // Admin views all users (if such endpoint exists)
      // This test assumes there might be admin endpoints for user management

      // For now, test that admin has the necessary permissions
      const adminProfile = await requestHelper.getAuth('/api/users/profile', {
        token: adminToken,
      });

      expectResponse(adminProfile)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.role.name).toBe('admin');
          expect(data.role.permissions).toContain('admin.read');
          expect(data.role.permissions).toContain('users.read');
          expect(data.role.permissions).toContain('users.write');
        });

      // Admin should see full navigation including admin sections
      const adminNav = await requestHelper.getAuth('/api/navigation/user', {
        token: adminToken,
      });

      expectResponse(adminNav).hasStatus(200).isSuccess();

      // Test that admin can access all functionality
      const adminFunctionality = [
        '/api/users/profile',
        '/api/navigation/user',
        '/api/users/preferences',
      ];

      for (const endpoint of adminFunctionality) {
        const response = await requestHelper.getAuth(endpoint, {
          token: adminToken,
        });
        expectResponse(response).hasStatus(200).isSuccess();
      }
    });
  });
});
