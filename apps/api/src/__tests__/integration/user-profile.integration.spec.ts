import { FastifyInstance } from 'fastify';
import * as fs from 'fs/promises';
import * as path from 'path';
import { setupTestContext } from './setup';
import { AuthHelper } from './auth-helper';
import { DatabaseHelper } from './db-helper';
import { RequestHelper } from './request-helper';
import { expectResponse, commonAssertions } from './assertions';

describe('User Profile API Integration Tests', () => {
  let app: FastifyInstance;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let requestHelper: RequestHelper;
  let testContext: any;

  // Test users
  let testUser: any;
  let testUserToken: string;
  let adminUser: any;
  let adminToken: string;
  let otherUser: any;
  let otherUserToken: string;

  // Test file paths
  const testImagePath = path.join(__dirname, 'test-assets', 'test-avatar.jpg');
  const invalidImagePath = path.join(
    __dirname,
    'test-assets',
    'test-document.txt',
  );

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

    // Create test directory and files
    await fs.mkdir(path.dirname(testImagePath), { recursive: true });

    // Create a mock JPEG file (minimal valid JPEG header)
    const jpegHeader = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
    ]);
    await fs.writeFile(testImagePath, jpegHeader);

    // Create a text file for invalid image tests
    await fs.writeFile(invalidImagePath, 'This is not an image file');

    // Create test users
    const testUserResult = await authHelper.createUserWithRole(
      'user',
      ['profile.read', 'profile.write'],
      {
        email: 'profiletest-testuser@example.com',
        username: 'profiletest-testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    );
    testUser = testUserResult;
    const testUserTokens = await authHelper.loginUser(
      testUser.email,
      testUser.password,
    );
    testUserToken = testUserTokens.accessToken;

    const adminResult = await authHelper.createUserWithRole(
      'admin',
      [
        'profile.read',
        'profile.write',
        'admin.users.read',
        'admin.users.write',
      ],
      {
        email: 'profiletest-admin@example.com',
        username: 'profiletest-admin',
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

    const otherUserResult = await authHelper.createUserWithRole(
      'user',
      ['profile.read', 'profile.write'],
      {
        email: 'profiletest-other@example.com',
        username: 'profiletest-otheruser',
        firstName: 'Other',
        lastName: 'User',
      },
    );
    otherUser = otherUserResult;
    const otherUserTokens = await authHelper.loginUser(
      otherUser.email,
      otherUser.password,
    );
    otherUserToken = otherUserTokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.unlink(testImagePath);
      await fs.unlink(invalidImagePath);
      await fs.rmdir(path.dirname(testImagePath));
    } catch (error) {
      // Ignore cleanup errors
    }

    await testContext.cleanup();
  });

  beforeEach(async () => {
    // Reset any profile changes made during tests
    await testContext.db.connection('users').where('id', testUser.id).update({
      first_name: 'Test',
      last_name: 'User',
      updated_at: new Date(),
    });

    // Reset preferences
    await testContext.db
      .connection('user_preferences')
      .where('user_id', testUser.id)
      .update({
        theme: 'default',
        scheme: 'light',
        layout: 'classic',
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        updated_at: new Date(),
      });
  });

  describe('GET /api/users/profile', () => {
    describe('Authentication and Authorization', () => {
      it('should reject requests without authentication', async () => {
        const response = await requestHelper.get('/api/users/profile');

        expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
      });

      it('should reject requests with invalid token', async () => {
        const response = await requestHelper.get('/api/users/profile', {
          headers: { Authorization: 'Bearer invalid-token' },
        });

        expectResponse(response).isUnauthorized();
      });

      it('should return user profile for authenticated user', async () => {
        const response = await requestHelper.getAuth('/api/users/profile', {
          token: testUserToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.id).toBe(testUser.id);
            expect(data.email).toBe(testUser.email);
            expect(data.firstName).toBe('Test');
            expect(data.lastName).toBe('User');
            expect(data.role).toBeDefined();
            expect(data.preferences).toBeDefined();
          });
      });
    });

    describe('Profile Data Structure', () => {
      it('should return complete profile information', async () => {
        const response = await requestHelper.getAuth('/api/users/profile', {
          token: testUserToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            // Basic user info
            expect(data.id).toBeDefined();
            expect(data.email).toBeDefined();
            expect(data.username).toBeDefined();
            expect(data.firstName).toBeDefined();
            expect(data.lastName).toBeDefined();
            expect(data.name).toBeDefined();

            // Status and verification
            expect(data.status).toBeDefined();
            expect(typeof data.emailVerified).toBe('boolean');
            expect(typeof data.twoFactorEnabled).toBe('boolean');

            // Timestamps
            expect(data.createdAt).toBeDefined();
            expect(data.updatedAt).toBeDefined();

            // Role information
            expect(data.role).toBeDefined();
            expect(data.role.id).toBeDefined();
            expect(data.role.name).toBeDefined();

            // Preferences
            expect(data.preferences).toBeDefined();
            expect(data.preferences.theme).toBeDefined();
            expect(data.preferences.scheme).toBeDefined();
            expect(data.preferences.layout).toBeDefined();
            expect(data.preferences.language).toBeDefined();
            expect(data.preferences.timezone).toBeDefined();
            expect(data.preferences.notifications).toBeDefined();
            expect(data.preferences.navigation).toBeDefined();
          });
      });

      it('should include role permissions', async () => {
        const response = await requestHelper.getAuth('/api/users/profile', {
          token: testUserToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.role.permissions).toBeDefined();
            expect(Array.isArray(data.role.permissions)).toBe(true);
            expect(data.role.permissions).toContain('profile.read');
            expect(data.role.permissions).toContain('profile.write');
          });
      });

      it('should handle users without avatar', async () => {
        const response = await requestHelper.getAuth('/api/users/profile', {
          token: testUserToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.avatar).toBeNull();
          });
      });
    });

    describe('Response Format Validation', () => {
      it('should match OpenAPI specification', async () => {
        const response = await requestHelper.getAuth('/api/users/profile', {
          token: testUserToken,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .matchesOpenApiSchema((body: any) => {
            expect(body.success).toBe(true);
            expect(body.data).toBeDefined();
            expect(body.meta).toBeDefined();
            expect(body.meta.timestamp).toMatch(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
            );
            expect(body.meta.version).toBeDefined();
          });
      });
    });
  });

  describe('PUT /api/users/profile', () => {
    describe('Authentication and Authorization', () => {
      it('should reject requests without authentication', async () => {
        const response = await requestHelper.put('/api/users/profile', {
          body: { firstName: 'Updated' },
        });

        expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
      });

      it('should allow users to update their own profile', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
        };

        const response = await requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: updateData,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.firstName).toBe('Updated');
            expect(data.lastName).toBe('Name');
          });
      });
    });

    describe('Profile Updates', () => {
      it('should update basic profile information', async () => {
        const updateData = {
          firstName: 'NewFirst',
          lastName: 'NewLast',
        };

        const response = await requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: updateData,
        });

        expectResponse(response).hasStatus(200).isSuccess();

        // Verify the update in database
        const updatedUser = await testContext.db
          .connection('users')
          .where('id', testUser.id)
          .first();

        expect(updatedUser.first_name).toBe('NewFirst');
        expect(updatedUser.last_name).toBe('NewLast');
      });

      it('should not allow email updates through profile endpoint', async () => {
        const updateData = {
          email: 'newemail@example.com',
          firstName: 'Updated',
        };

        const response = await requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: updateData,
        });

        expectResponse(response).hasStatus(200).isSuccess();

        // Verify email was not changed
        const user = await testContext.db
          .connection('users')
          .where('id', testUser.id)
          .first();

        expect(user.email).toBe(testUser.email); // Should remain unchanged
        expect(user.first_name).toBe('Updated'); // Other fields should update
      });

      it('should validate input data', async () => {
        const invalidData = {
          firstName: '', // Empty string should fail validation
          lastName: 'Valid',
        };

        const response = await requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: invalidData,
        });

        expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
      });

      it('should validate name length limits', async () => {
        const longName = 'a'.repeat(256); // Very long name

        const response = await requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: {
            firstName: longName,
            lastName: 'Valid',
          },
        });

        expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
      });

      it('should handle partial updates', async () => {
        const updateData = {
          firstName: 'OnlyFirst',
          // lastName not provided
        };

        const response = await requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: updateData,
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.firstName).toBe('OnlyFirst');
            expect(data.lastName).toBe('User'); // Should remain unchanged
          });
      });
    });

    describe('Concurrency and Race Conditions', () => {
      it('should handle concurrent profile updates', async () => {
        const update1 = requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: { firstName: 'Concurrent1' },
        });

        const update2 = requestHelper.putAuth('/api/users/profile', {
          token: testUserToken,
          body: { firstName: 'Concurrent2' },
        });

        const [response1, response2] = await Promise.all([update1, update2]);

        // Both should succeed (last one wins)
        expect([200, 409]).toContain(response1.status);
        expect([200, 409]).toContain(response2.status);
      });
    });
  });

  describe('GET /api/users/preferences', () => {
    it('should return user preferences', async () => {
      const response = await requestHelper.getAuth('/api/users/preferences', {
        token: testUserToken,
      });

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.theme).toBeDefined();
          expect(data.scheme).toBeDefined();
          expect(data.layout).toBeDefined();
          expect(data.language).toBeDefined();
          expect(data.timezone).toBeDefined();
          expect(data.dateFormat).toBeDefined();
          expect(data.timeFormat).toBeDefined();
          expect(data.notifications).toBeDefined();
          expect(data.navigation).toBeDefined();
        });
    });

    it('should reject unauthenticated requests', async () => {
      const response = await requestHelper.get('/api/users/preferences');

      expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences', async () => {
      const preferencesUpdate = {
        theme: 'dark',
        scheme: 'dark',
        notifications: {
          email: false,
          push: true,
          desktop: false,
          sound: false,
        },
        navigation: {
          collapsed: true,
          type: 'compact',
          position: 'left',
        },
      };

      const response = await requestHelper.putAuth('/api/users/preferences', {
        token: testUserToken,
        body: preferencesUpdate,
      });

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.theme).toBe('dark');
          expect(data.scheme).toBe('dark');
          expect(data.notifications.email).toBe(false);
          expect(data.notifications.push).toBe(true);
          expect(data.navigation.collapsed).toBe(true);
          expect(data.navigation.type).toBe('compact');
        });

      // Verify in database
      const prefs = await testContext.db
        .connection('user_preferences')
        .where('user_id', testUser.id)
        .first();

      expect(prefs.theme).toBe('dark');
      expect(prefs.scheme).toBe('dark');
      expect(prefs.notifications_email).toBe(false);
      expect(prefs.notifications_push).toBe(true);
    });

    it('should validate preference values', async () => {
      const invalidPreferences = {
        language: 'invalid-language-code',
        scheme: 'invalid-scheme',
      };

      const response = await requestHelper.putAuth('/api/users/preferences', {
        token: testUserToken,
        body: invalidPreferences,
      });

      expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
    });

    it('should handle partial preference updates', async () => {
      const partialUpdate = {
        theme: 'dark',
        // Other preferences not specified
      };

      const response = await requestHelper.putAuth('/api/users/preferences', {
        token: testUserToken,
        body: partialUpdate,
      });

      expectResponse(response).hasStatus(200).isSuccess();

      // Only theme should be updated, others remain the same
      const prefs = await testContext.db
        .connection('user_preferences')
        .where('user_id', testUser.id)
        .first();

      expect(prefs.theme).toBe('dark');
      expect(prefs.scheme).toBe('light'); // Should remain unchanged
      expect(prefs.layout).toBe('classic'); // Should remain unchanged
    });
  });

  describe('POST /api/users/avatar', () => {
    it('should upload and set user avatar', async () => {
      const response = await requestHelper.uploadFile(
        '/api/users/avatar',
        'avatar',
        testImagePath,
        { token: testUserToken },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.avatarUrl).toBeDefined();
          expect(data.avatarUrl).toMatch(/\.(jpg|jpeg|png)$/i);
        });

      // Verify avatar URL is stored in database
      const user = await testContext.db
        .connection('users')
        .where('id', testUser.id)
        .first();

      expect(user.avatar_url).toBeDefined();
      expect(user.avatar_url).toContain('/avatars/');
    });

    it('should reject non-image files', async () => {
      const response = await requestHelper.uploadFile(
        '/api/users/avatar',
        'avatar',
        invalidImagePath,
        { token: testUserToken },
      );

      expectResponse(response).hasStatus(400).isError('INVALID_FILE_TYPE');
    });

    it('should reject requests without file', async () => {
      const response = await requestHelper.postAuth('/api/users/avatar', {
        token: testUserToken,
      });

      expectResponse(response).hasStatus(400).isError('FILE_REQUIRED');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await requestHelper.uploadFile(
        '/api/users/avatar',
        'avatar',
        testImagePath,
      );

      expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
    });

    it('should replace existing avatar', async () => {
      // Upload first avatar
      await requestHelper.uploadFile(
        '/api/users/avatar',
        'avatar',
        testImagePath,
        { token: testUserToken },
      );

      // Upload second avatar (should replace first)
      const response = await requestHelper.uploadFile(
        '/api/users/avatar',
        'avatar',
        testImagePath,
        { token: testUserToken },
      );

      expectResponse(response)
        .hasStatus(200)
        .isSuccess()
        .hasData((data: any) => {
          expect(data.avatarUrl).toBeDefined();
        });
    });
  });

  describe('DELETE /api/users/avatar', () => {
    beforeEach(async () => {
      // Ensure user has an avatar before each delete test
      await requestHelper.uploadFile(
        '/api/users/avatar',
        'avatar',
        testImagePath,
        { token: testUserToken },
      );
    });

    it('should delete user avatar', async () => {
      const response = await requestHelper.deleteAuth('/api/users/avatar', {
        token: testUserToken,
      });

      expectResponse(response).hasStatus(200).isSuccess();

      // Verify avatar is removed from database
      const user = await testContext.db
        .connection('users')
        .where('id', testUser.id)
        .first();

      expect(user.avatar_url).toBeNull();
    });

    it('should handle deletion when no avatar exists', async () => {
      // First delete the avatar
      await requestHelper.deleteAuth('/api/users/avatar', {
        token: testUserToken,
      });

      // Try to delete again
      const response = await requestHelper.deleteAuth('/api/users/avatar', {
        token: testUserToken,
      });

      expectResponse(response).hasStatus(404).isError('AVATAR_NOT_FOUND');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await requestHelper.delete('/api/users/avatar');

      expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error by closing connection
      await testContext.db.connection.destroy();

      const response = await requestHelper.getAuth('/api/users/profile', {
        token: testUserToken,
      });

      // Should return server error
      expect([500, 503]).toContain(response.status);

      // Reconnect for other tests
      testContext = await setupTestContext({
        runMigrations: false,
        runSeeds: false,
        cleanDatabase: false,
      });
    });

    it('should handle malformed request bodies', async () => {
      const response = await requestHelper.putAuth('/api/users/profile', {
        token: testUserToken,
        body: 'invalid-json-string',
      });

      expectResponse(response).hasStatus(400).isError('INVALID_JSON');
    });

    it('should validate content type for profile updates', async () => {
      const response = await requestHelper.put('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${testUserToken}`,
          'Content-Type': 'text/plain',
        },
        body: 'plain text body',
      });

      expectResponse(response).hasStatus(400).isError('INVALID_CONTENT_TYPE');
    });
  });

  describe('Performance Tests', () => {
    it('should respond to profile requests within acceptable time', async () => {
      const startTime = Date.now();

      const response = await requestHelper.getAuth('/api/users/profile', {
        token: testUserToken,
      });

      const responseTime = Date.now() - startTime;

      expectResponse(response).hasStatus(200).isSuccess();

      // Profile should load within 500ms
      expect(responseTime).toBeLessThan(500);
    });

    it('should handle concurrent profile requests', async () => {
      const concurrentRequests = 5;
      const requests = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          requestHelper.getAuth('/api/users/profile', { token: testUserToken }),
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expectResponse(response).hasStatus(200).isSuccess();
      });
    });
  });
});
