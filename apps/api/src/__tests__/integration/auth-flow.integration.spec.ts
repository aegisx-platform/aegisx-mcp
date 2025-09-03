import { FastifyInstance } from 'fastify';
import { setupTestContext } from './setup';
import {
  AuthHelper,
  createTestUserData,
  createRegisterRequestData,
} from './auth-helper';
import { DatabaseHelper } from './db-helper';
import { RequestHelper } from './request-helper';
import { expectResponse, commonAssertions } from './assertions';

describe('Authentication Flow Integration Tests', () => {
  let app: FastifyInstance;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let requestHelper: RequestHelper;
  let testContext: any;

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
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(async () => {
    // Clean up test-specific auth data but preserve seed data (roles, permissions)
    await testContext.db.connection('user_sessions').del();
    await testContext.db.connection('user_roles').del();
    await testContext.db.connection('users').del();
    // Keep roles, permissions, and other seed data intact
  });

  describe('User Registration Flow', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = createRegisterRequestData({
          email: 'authtest-newuser@example.com',
          username: 'authtest-newuser',
          password: 'securepass123',
        });

        const response = await requestHelper.post('/api/auth/register', {
          body: userData,
        });

        expectResponse(response)
          .hasStatus(201)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.user).toBeDefined();
            expect(data.user.id).toBeDefined();
            expect(data.user.email).toBe(userData.email);
            expect(data.user.username).toBe(userData.username);
            expect(data.user.password).toBeUndefined(); // Should not return password
            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
            expect(data.expiresIn).toBeDefined();
          });

        // Verify user was created in database
        const dbUser = await testContext.db
          .connection('users')
          .where('email', userData.email)
          .first();

        expect(dbUser).toBeDefined();
        expect(dbUser.email_verified).toBe(false); // Should default to unverified
        expect(dbUser.status).toBe('pending'); // Should default to pending until verified
      });

      it('should create user preferences on registration', async () => {
        const userData = createRegisterRequestData({
          email: 'authtest-userprefs@example.com',
          username: 'authtest-userprefs',
        });

        const response = await requestHelper.post('/api/auth/register', {
          body: userData,
        });

        expectResponse(response).hasStatus(201).isSuccess();

        const userId = response.body.data.user.id;

        // Verify preferences were created
        const preferences = await testContext.db
          .connection('user_preferences')
          .where('user_id', userId)
          .first();

        expect(preferences).toBeDefined();
        expect(preferences.theme).toBe('default');
        expect(preferences.scheme).toBe('light');
        expect(preferences.layout).toBe('classic');
      });

      it('should reject registration with duplicate email', async () => {
        const userData = createRegisterRequestData({
          email: 'authtest-duplicate@example.com',
          username: 'authtest-user1',
        });

        // Register first user
        await requestHelper.post('/api/auth/register', {
          body: userData,
        });

        // Try to register with same email
        const duplicateData = createRegisterRequestData({
          email: 'authtest-duplicate@example.com',
          username: 'authtest-user2',
        });

        const response = await requestHelper.post('/api/auth/register', {
          body: duplicateData,
        });

        expectResponse(response).hasStatus(409).isError('EMAIL_ALREADY_EXISTS');
      });

      it('should reject registration with duplicate username', async () => {
        const userData = createRegisterRequestData({
          email: 'authtest-user1@example.com',
          username: 'authtest-duplicateuser',
        });

        // Register first user
        await requestHelper.post('/api/auth/register', {
          body: userData,
        });

        // Try to register with same username
        const duplicateData = createRegisterRequestData({
          email: 'authtest-user2@example.com',
          username: 'authtest-duplicateuser',
        });

        const response = await requestHelper.post('/api/auth/register', {
          body: duplicateData,
        });

        expectResponse(response)
          .hasStatus(409)
          .isError('USERNAME_ALREADY_EXISTS');
      });

      it('should validate registration input', async () => {
        const invalidData = {
          email: 'invalid-email',
          username: 'ab', // Too short
          password: '123', // Too short
          firstName: '',
          lastName: '',
        };

        const response = await requestHelper.post('/api/auth/register', {
          body: invalidData,
        });

        expectResponse(response).hasStatus(400).isError('VALIDATION_ERROR');
      });

      it('should hash password before storing', async () => {
        const userData = createRegisterRequestData({
          email: 'authtest-hashtest@example.com',
          username: 'authtest-hashtest',
          password: 'plainpassword123',
        });

        const response = await requestHelper.post('/api/auth/register', {
          body: userData,
        });

        expectResponse(response).hasStatus(201).isSuccess();

        // Verify password is hashed in database
        const dbUser = await testContext.db
          .connection('users')
          .where('email', userData.email)
          .first();

        expect(dbUser.password).not.toBe(userData.password);
        expect(dbUser.password).toMatch(/^\$2[ab]\$\d{2}\$/); // bcrypt hash format
      });
    });
  });

  describe('User Login Flow', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await authHelper.createTestUser({
        email: 'authtest-logintest@example.com',
        username: 'authtest-loginuser',
        password: 'testpassword123',
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid email and password', async () => {
        const response = await requestHelper.post('/api/auth/login', {
          body: {
            email: testUser.email,
            password: testUser.password,
          },
        });

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.user).toBeDefined();
            expect(data.user.id).toBe(testUser.id);
            expect(data.user.email).toBe(testUser.email);
            expect(data.user.password).toBeUndefined();
            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
            expect(data.expiresIn).toBeDefined();
          });

        // Verify session was created
        const session = await testContext.db
          .connection('user_sessions')
          .where('user_id', testUser.id)
          .first();

        expect(session).toBeDefined();
      });

      it('should login with valid username and password', async () => {
        const response = await requestHelper.post('/api/auth/login', {
          body: {
            email: testUser.username, // Using username in email field
            password: testUser.password,
          },
        });

        expectResponse(response).hasStatus(200).isSuccess();
      });

      it('should reject login with invalid email', async () => {
        const response = await requestHelper.post('/api/auth/login', {
          body: {
            email: 'nonexistent@example.com',
            password: testUser.password,
          },
        });

        expectResponse(response).hasStatus(401).isError('INVALID_CREDENTIALS');
      });

      it('should reject login with invalid password', async () => {
        const response = await requestHelper.post('/api/auth/login', {
          body: {
            email: testUser.email,
            password: 'wrongpassword',
          },
        });

        expectResponse(response).hasStatus(401).isError('INVALID_CREDENTIALS');
      });

      it('should reject login for inactive user', async () => {
        // Deactivate user
        await testContext.db
          .connection('users')
          .where('id', testUser.id)
          .update({ status: 'inactive' });

        const response = await requestHelper.post('/api/auth/login', {
          body: {
            email: testUser.email,
            password: testUser.password,
          },
        });

        expectResponse(response).hasStatus(401).isError('ACCOUNT_DISABLED');
      });

      it('should update last login timestamp', async () => {
        const beforeLogin = new Date();

        await requestHelper.post('/api/auth/login', {
          body: {
            email: testUser.email,
            password: testUser.password,
          },
        });

        const updatedUser = await testContext.db
          .connection('users')
          .where('id', testUser.id)
          .first();

        expect(new Date(updatedUser.last_login_at)).toBeInstanceOf(Date);
        expect(
          new Date(updatedUser.last_login_at).getTime(),
        ).toBeGreaterThanOrEqual(beforeLogin.getTime());
      });

      it('should set refresh token cookie', async () => {
        const response = await requestHelper.post('/api/auth/login', {
          body: {
            email: testUser.email,
            password: testUser.password,
          },
        });

        expectResponse(response).hasStatus(200).isSuccess();

        // Check for Set-Cookie header
        expect(response.headers['set-cookie']).toBeDefined();
        const cookies = response.headers['set-cookie'];
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        const refreshTokenCookie = cookieArray.find((cookie: string) =>
          cookie.includes('refreshToken='),
        );
        expect(refreshTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toContain('HttpOnly');
        expect(refreshTokenCookie).toContain('SameSite=strict');
      });
    });
  });

  describe('Token Refresh Flow', () => {
    let testUser: any;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await authHelper.createTestUser();
      const tokens = await authHelper.loginUser(
        testUser.email,
        testUser.password,
      );
      refreshToken = tokens.refreshToken;
    });

    describe('POST /api/auth/refresh', () => {
      it('should refresh tokens with valid refresh token', async () => {
        const response = await requestHelper.requestWithCookies(
          'POST',
          '/api/auth/refresh',
          { refreshToken },
        );

        expectResponse(response)
          .hasStatus(200)
          .isSuccess()
          .hasData((data: any) => {
            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
            expect(data.expiresIn).toBeDefined();
            // New tokens should be different from old ones
            expect(data.refreshToken).not.toBe(refreshToken);
          });

        // Old refresh token should be invalidated
        const oldSession = await testContext.db
          .connection('user_sessions')
          .where('refresh_token', refreshToken)
          .first();

        expect(oldSession?.is_active).toBe(false);
      });

      it('should reject invalid refresh token', async () => {
        const response = await requestHelper.requestWithCookies(
          'POST',
          '/api/auth/refresh',
          { refreshToken: 'invalid-token' },
        );

        expectResponse(response)
          .hasStatus(401)
          .isError('INVALID_REFRESH_TOKEN');
      });

      it('should reject expired refresh token', async () => {
        // Update refresh token to be expired
        await testContext.db
          .connection('user_sessions')
          .where('refresh_token', refreshToken)
          .update({ expires_at: new Date(Date.now() - 1000) });

        const response = await requestHelper.requestWithCookies(
          'POST',
          '/api/auth/refresh',
          { refreshToken },
        );

        expectResponse(response)
          .hasStatus(401)
          .isError('REFRESH_TOKEN_EXPIRED');
      });

      it('should reject refresh token from deactivated user', async () => {
        // Deactivate user
        await testContext.db
          .connection('users')
          .where('id', testUser.id)
          .update({ status: 'inactive' });

        const response = await requestHelper.requestWithCookies(
          'POST',
          '/api/auth/refresh',
          { refreshToken },
        );

        expectResponse(response).hasStatus(401).isError('ACCOUNT_DISABLED');
      });
    });
  });

  describe('Logout Flow', () => {
    let testUser: any;
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await authHelper.createTestUser();
      const tokens = await authHelper.loginUser(
        testUser.email,
        testUser.password,
      );
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    });

    describe('POST /api/auth/logout', () => {
      it('should logout user successfully', async () => {
        const response = await requestHelper.postAuth('/api/auth/logout', {
          token: accessToken,
        });

        expectResponse(response).hasStatus(200).isSuccess();

        // Verify session was deactivated
        const session = await testContext.db
          .connection('user_sessions')
          .where('refresh_token', refreshToken)
          .first();

        expect(session?.is_active).toBe(false);
      });

      it('should reject logout without authentication', async () => {
        const response = await requestHelper.post('/api/auth/logout');

        expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
      });

      it('should reject logout with invalid token', async () => {
        const response = await requestHelper.postAuth('/api/auth/logout', {
          token: 'invalid-token',
        });

        expectResponse(response).isUnauthorized();
      });

      it('should clear refresh token cookie', async () => {
        const response = await requestHelper.postAuth('/api/auth/logout', {
          token: accessToken,
        });

        expectResponse(response).hasStatus(200).isSuccess();

        // Check for cleared cookie
        expect(response.headers['set-cookie']).toBeDefined();
        const cookies = response.headers['set-cookie'];
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        const clearCookie = cookieArray.find(
          (cookie: string) =>
            cookie.includes('refreshToken=') && cookie.includes('Max-Age=0'),
        );
        expect(clearCookie).toBeDefined();
      });
    });
  });

  describe('Token Validation and Expiration', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      testUser = await authHelper.createTestUser();
      const tokens = await authHelper.loginUser(
        testUser.email,
        testUser.password,
      );
      accessToken = tokens.accessToken;
    });

    describe('Expired Token Handling', () => {
      it('should reject requests with expired access token', async () => {
        // Generate an expired token
        const expiredToken = authHelper.generateToken(
          { id: testUser.id, email: testUser.email },
          { expiresIn: '-1h' },
        );

        const response = await requestHelper.getAuth('/api/users/profile', {
          token: expiredToken,
        });

        expectResponse(response).isUnauthorized().isError('TOKEN_EXPIRED');
      });

      it('should accept valid non-expired tokens', async () => {
        const response = await requestHelper.getAuth('/api/users/profile', {
          token: accessToken,
        });

        expectResponse(response).hasStatus(200).isSuccess();
      });
    });

    describe('Token Verification', () => {
      it('should verify token structure correctly', async () => {
        const decoded = authHelper.verifyToken(accessToken);

        expect(decoded.id).toBe(testUser.id);
        expect(decoded.email).toBe(testUser.email);
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp).toBeDefined();
      });

      it('should reject malformed tokens', async () => {
        expect(() => {
          authHelper.verifyToken('not.a.valid.token');
        }).toThrow();
      });

      it('should reject tokens with invalid signature', async () => {
        const parts = accessToken.split('.');
        const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`;

        expect(() => {
          authHelper.verifyToken(tamperedToken);
        }).toThrow();
      });
    });
  });

  describe('Unauthorized Access Scenarios', () => {
    it('should reject access to protected routes without token', async () => {
      const protectedRoutes = [
        '/api/users/profile',
        '/api/users/preferences',
        '/api/navigation/user',
      ];

      for (const route of protectedRoutes) {
        const response = await requestHelper.get(route);
        expectResponse(response).isUnauthorized().isError('UNAUTHORIZED');
      }
    });

    it('should reject access with malformed authorization header', async () => {
      const malformedHeaders = [
        'Bearer',
        'Bearer ',
        'InvalidBearer token',
        'bearer lowercase-bearer',
      ];

      for (const authHeader of malformedHeaders) {
        const response = await requestHelper.get('/api/users/profile', {
          headers: { Authorization: authHeader },
        });

        expectResponse(response).isUnauthorized();
      }
    });
  });

  describe('Session Management', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await authHelper.createTestUser();
    });

    it('should create session on login', async () => {
      const response = await requestHelper.post('/api/auth/login', {
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expectResponse(response).hasStatus(200).isSuccess();

      // Verify session exists
      const session = await testContext.db
        .connection('user_sessions')
        .where('user_id', testUser.id)
        .where('is_active', true)
        .first();

      expect(session).toBeDefined();
      expect(session.user_agent).toBeDefined();
      expect(session.ip_address).toBeDefined();
    });

    it('should support multiple active sessions per user', async () => {
      // Login twice to create multiple sessions
      await requestHelper.post('/api/auth/login', {
        body: { email: testUser.email, password: testUser.password },
      });

      await requestHelper.post('/api/auth/login', {
        body: { email: testUser.email, password: testUser.password },
      });

      // Verify multiple active sessions exist
      const sessions = await testContext.db
        .connection('user_sessions')
        .where('user_id', testUser.id)
        .where('is_active', true);

      expect(sessions.length).toBe(2);
    });

    it('should track session metadata', async () => {
      const response = await requestHelper.post('/api/auth/login', {
        body: {
          email: testUser.email,
          password: testUser.password,
        },
        headers: {
          'User-Agent': 'Test User Agent',
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      expectResponse(response).hasStatus(200).isSuccess();

      const session = await testContext.db
        .connection('user_sessions')
        .where('user_id', testUser.id)
        .where('is_active', true)
        .first();

      expect(session.user_agent).toBeDefined();
      expect(session.ip_address).toBeDefined();
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle rapid login attempts gracefully', async () => {
      const testUser = await authHelper.createTestUser();

      // Make multiple rapid login requests
      const requests = Array(5)
        .fill(null)
        .map(() =>
          requestHelper.post('/api/auth/login', {
            body: {
              email: testUser.email,
              password: testUser.password,
            },
          }),
        );

      const responses = await Promise.all(requests);

      // All should succeed (no rate limiting in test environment)
      responses.forEach((response) => {
        expectResponse(response).hasStatus(200).isSuccess();
      });
    });

    it('should handle concurrent registration attempts', async () => {
      const baseData = createRegisterRequestData();

      const requests = Array(3)
        .fill(null)
        .map((_, index) =>
          requestHelper.post('/api/auth/register', {
            body: {
              ...baseData,
              email: `authtest-concurrent${index}@example.com`,
              username: `authtest-concurrent${index}`,
            },
          }),
        );

      const responses = await Promise.all(requests);

      // All should succeed with unique emails/usernames
      responses.forEach((response) => {
        expectResponse(response).hasStatus(201).isSuccess();
      });
    });
  });
});
