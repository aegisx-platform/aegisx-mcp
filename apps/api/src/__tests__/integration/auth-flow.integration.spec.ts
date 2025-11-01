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

  describe('Rate Limiting', () => {
    describe('POST /api/auth/register rate limit', () => {
      it('should enforce rate limit of 3 registrations per hour', async () => {
        const baseData = createRegisterRequestData();
        const responses: any[] = [];

        // Attempt 4 registrations (limit is 3)
        for (let i = 0; i < 4; i++) {
          const response = await requestHelper.post('/api/auth/register', {
            body: {
              ...baseData,
              email: `ratelimit-register${i}@example.com`,
              username: `ratelimit-register${i}`,
            },
          });
          responses.push(response);
        }

        // First 3 should succeed
        responses.slice(0, 3).forEach((response) => {
          expectResponse(response).hasStatus(201).isSuccess();
        });

        // 4th request should be rate limited
        expectResponse(responses[3]).hasStatus(429);
      });
    });

    describe('POST /api/auth/login rate limit', () => {
      it('should enforce rate limit of 5 login attempts per minute', async () => {
        // First create a test user
        const userData = createRegisterRequestData({
          email: 'ratelimit-login@example.com',
          username: 'ratelimit-login',
          password: 'TestPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: userData });

        const responses: any[] = [];

        // Attempt 6 logins (limit is 5 per minute per IP+email)
        for (let i = 0; i < 6; i++) {
          const response = await requestHelper.post('/api/auth/login', {
            body: {
              email: userData.email,
              password: userData.password,
            },
          });
          responses.push(response);
        }

        // First 5 should succeed (or fail with 401 if password wrong, but not 429)
        responses.slice(0, 5).forEach((response) => {
          expect([200, 401]).toContain(response.statusCode);
          expect(response.statusCode).not.toBe(429);
        });

        // 6th request should be rate limited
        expectResponse(responses[5]).hasStatus(429);
      });

      it('should use IP+email combination for login rate limiting', async () => {
        // Create two test users
        const user1Data = createRegisterRequestData({
          email: 'ratelimit-user1@example.com',
          username: 'ratelimit-user1',
          password: 'TestPass123!',
        });

        const user2Data = createRegisterRequestData({
          email: 'ratelimit-user2@example.com',
          username: 'ratelimit-user2',
          password: 'TestPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: user1Data });
        await requestHelper.post('/api/auth/register', { body: user2Data });

        // Attempt 5 logins for user1
        for (let i = 0; i < 5; i++) {
          await requestHelper.post('/api/auth/login', {
            body: {
              email: user1Data.email,
              password: user1Data.password,
            },
          });
        }

        // user1 should now be rate limited
        const user1Response = await requestHelper.post('/api/auth/login', {
          body: {
            email: user1Data.email,
            password: user1Data.password,
          },
        });
        expectResponse(user1Response).hasStatus(429);

        // user2 should still be able to login (different email)
        const user2Response = await requestHelper.post('/api/auth/login', {
          body: {
            email: user2Data.email,
            password: user2Data.password,
          },
        });
        expect([200, 401]).toContain(user2Response.statusCode);
        expect(user2Response.statusCode).not.toBe(429);
      });
    });

    describe('POST /api/auth/refresh rate limit', () => {
      it('should enforce rate limit of 10 refresh attempts per minute', async () => {
        // Create and login a test user to get refresh token
        const userData = createRegisterRequestData({
          email: 'ratelimit-refresh@example.com',
          username: 'ratelimit-refresh',
          password: 'TestPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: userData });

        const loginResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });

        const refreshToken =
          loginResponse.body.data?.refreshToken ||
          (Array.isArray(loginResponse.headers['set-cookie'])
            ? loginResponse.headers['set-cookie'].find((c: string) =>
                c.startsWith('refreshToken='),
              )
            : loginResponse.headers['set-cookie']);

        const responses: any[] = [];

        // Attempt 11 refresh requests (limit is 10)
        for (let i = 0; i < 11; i++) {
          const response = await requestHelper.post('/api/auth/refresh', {
            body: { refreshToken },
          });
          responses.push(response);
        }

        // First 10 should succeed (or fail with 401, but not 429)
        responses.slice(0, 10).forEach((response) => {
          expect([200, 401]).toContain(response.statusCode);
          expect(response.statusCode).not.toBe(429);
        });

        // 11th request should be rate limited
        expectResponse(responses[10]).hasStatus(429);
      });
    });
  });

  describe('Account Lockout', () => {
    describe('POST /api/auth/login lockout after failed attempts', () => {
      it('should lock account after 5 failed login attempts', async () => {
        // Create a test user
        const userData = createRegisterRequestData({
          email: 'lockout-test@example.com',
          username: 'lockout-test',
          password: 'CorrectPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: userData });

        // Attempt 5 logins with wrong password
        for (let i = 0; i < 5; i++) {
          const response = await requestHelper.post('/api/auth/login', {
            body: {
              email: userData.email,
              password: 'WrongPassword123!',
            },
          });
          expectResponse(response).hasStatus(401);
        }

        // 6th attempt should return 429 (account locked)
        const lockedResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password, // Even with correct password
          },
        });

        expectResponse(lockedResponse).hasStatus(429);
        expect(lockedResponse.body.error?.code).toBe('ACCOUNT_LOCKED');
        expect(lockedResponse.body.error?.message).toContain(
          'Account is locked',
        );
      });

      it('should return attempts remaining in lockout status', async () => {
        // Create a test user
        const userData = createRegisterRequestData({
          email: 'attempts-test@example.com',
          username: 'attempts-test',
          password: 'CorrectPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: userData });

        // Attempt 3 failed logins
        for (let i = 0; i < 3; i++) {
          await requestHelper.post('/api/auth/login', {
            body: {
              email: userData.email,
              password: 'WrongPassword123!',
            },
          });
        }

        // Note: Without exposing attempts remaining in response,
        // we can only verify the account gets locked after 5 attempts
        // This test verifies that we haven't been locked yet
        const notLockedResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });

        // Should succeed (account not locked yet with only 3 failed attempts)
        expectResponse(notLockedResponse).hasStatus(200).isSuccess();
      });
    });

    describe('Successful login clears failed attempts', () => {
      it('should reset failed attempt counter on successful login', async () => {
        // Create a test user
        const userData = createRegisterRequestData({
          email: 'reset-attempts@example.com',
          username: 'reset-attempts',
          password: 'CorrectPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: userData });

        // Attempt 3 failed logins
        for (let i = 0; i < 3; i++) {
          await requestHelper.post('/api/auth/login', {
            body: {
              email: userData.email,
              password: 'WrongPassword123!',
            },
          });
        }

        // Successful login
        const successResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });
        expectResponse(successResponse).hasStatus(200).isSuccess();

        // Now we can fail 5 more times before lockout (counter was reset)
        for (let i = 0; i < 5; i++) {
          await requestHelper.post('/api/auth/login', {
            body: {
              email: userData.email,
              password: 'WrongPassword123!',
            },
          });
        }

        // 6th failed attempt after reset should lock the account
        const lockedResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });
        expectResponse(lockedResponse).hasStatus(429);
      });
    });

    describe('Login attempts are logged to database', () => {
      it('should log all login attempts to database', async () => {
        // Create a test user
        const userData = createRegisterRequestData({
          email: 'logging-test@example.com',
          username: 'logging-test',
          password: 'CorrectPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        const userId = registerResponse.body.data?.user?.id;

        // Make some failed attempts
        await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: 'WrongPassword1!',
          },
        });

        await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: 'WrongPassword2!',
          },
        });

        // Make a successful attempt
        await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });

        // Verify attempts are logged in database
        // Note: This requires direct database access
        const app = requestHelper.app;
        const attempts = await app
          .knex('login_attempts')
          .where('user_id', userId)
          .orWhere('email', userData.email)
          .orderBy('created_at', 'desc')
          .select('*');

        expect(attempts.length).toBeGreaterThanOrEqual(3);

        // Check we have both failed and successful attempts
        const failedAttempts = attempts.filter((a) => !a.success);
        const successAttempts = attempts.filter((a) => a.success);

        expect(failedAttempts.length).toBeGreaterThanOrEqual(2);
        expect(successAttempts.length).toBeGreaterThanOrEqual(1);

        // Verify failure reasons are recorded
        expect(failedAttempts[0].failure_reason).toBe('invalid_password');
      });
    });

    describe('Manual account unlock (Admin)', () => {
      it('should allow admin to unlock a locked account', async () => {
        // Create a regular user
        const userData = createRegisterRequestData({
          email: 'unlock-test@example.com',
          username: 'unlock-test',
          password: 'CorrectPass123!',
        });

        await requestHelper.post('/api/auth/register', { body: userData });

        // Lock the account by failing 5 times
        for (let i = 0; i < 5; i++) {
          await requestHelper.post('/api/auth/login', {
            body: {
              email: userData.email,
              password: 'WrongPassword123!',
            },
          });
        }

        // Verify account is locked
        const lockedResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });
        expectResponse(lockedResponse).hasStatus(429);

        // Create an admin user with unlock permission
        const adminData = createRegisterRequestData({
          email: 'admin-unlock@example.com',
          username: 'admin-unlock',
          password: 'AdminPass123!',
        });

        const adminRegisterResponse = await requestHelper.post(
          '/api/auth/register',
          { body: adminData },
        );
        const adminUserId = adminRegisterResponse.body.data?.user?.id;

        // Give admin the auth:unlock permission
        // First, create the permission if it doesn't exist
        const app = requestHelper.app;
        await app
          .knex('permissions')
          .insert({
            id: app.knex.raw('gen_random_uuid()'),
            resource: 'auth',
            action: 'unlock',
            description: 'Unlock locked accounts',
          })
          .onConflict(['resource', 'action'])
          .ignore();

        const permission = await app
          .knex('permissions')
          .where({ resource: 'auth', action: 'unlock' })
          .first();

        // Get admin role
        const adminRole = await app
          .knex('roles')
          .where({ name: 'admin' })
          .first();

        if (adminRole && permission) {
          // Assign admin role to admin user
          await app
            .knex('user_roles')
            .insert({
              user_id: adminUserId,
              role_id: adminRole.id,
              is_active: true,
            })
            .onConflict(['user_id', 'role_id'])
            .ignore();

          // Assign unlock permission to admin role
          await app
            .knex('role_permissions')
            .insert({
              role_id: adminRole.id,
              permission_id: permission.id,
            })
            .onConflict(['role_id', 'permission_id'])
            .ignore();
        }

        // Login as admin
        const adminLoginResponse = await requestHelper.post('/api/auth/login', {
          body: {
            email: adminData.email,
            password: adminData.password,
          },
        });
        const adminToken = adminLoginResponse.body.data?.accessToken;

        // Unlock the locked account
        const unlockResponse = await requestHelper.post(
          '/api/auth/unlock-account',
          {
            body: { identifier: userData.email },
            headers: { authorization: `Bearer ${adminToken}` },
          },
        );

        expectResponse(unlockResponse).hasStatus(200).isSuccess();
        expect(unlockResponse.body.data?.identifier).toBe(userData.email);

        // Verify user can now login
        const loginAfterUnlock = await requestHelper.post('/api/auth/login', {
          body: {
            email: userData.email,
            password: userData.password,
          },
        });

        expectResponse(loginAfterUnlock).hasStatus(200).isSuccess();
      });
    });
  });

  describe('Email Verification', () => {
    describe('POST /api/auth/register creates verification token', () => {
      it('should create email verification token after registration', async () => {
        const userData = createRegisterRequestData({
          email: 'verify-test@example.com',
          username: 'verify-test',
          password: 'TestPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        expectResponse(registerResponse).hasStatus(201).isSuccess();

        const userId = registerResponse.body.data?.user?.id;

        // Verify token was created in database
        const app = requestHelper.app;
        const verification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();

        expect(verification).toBeDefined();
        expect(verification.email).toBe(userData.email);
        expect(verification.verified).toBe(false);
        expect(verification.token).toBeDefined();
        expect(verification.token.length).toBe(64); // 32 bytes hex = 64 chars
      });
    });

    describe('POST /api/auth/verify-email', () => {
      it('should verify email with valid token', async () => {
        const userData = createRegisterRequestData({
          email: 'verify-valid@example.com',
          username: 'verify-valid',
          password: 'TestPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        const userId = registerResponse.body.data?.user?.id;

        // Get verification token from database
        const app = requestHelper.app;
        const verification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();

        // Verify email
        const verifyResponse = await requestHelper.post(
          '/api/auth/verify-email',
          {
            body: { token: verification.token },
          },
        );

        expectResponse(verifyResponse).hasStatus(200).isSuccess();
        expect(verifyResponse.body.data?.emailVerified).toBe(true);

        // Check database updated
        const updatedUser = await app.knex('users').where('id', userId).first();
        expect(updatedUser.email_verified).toBe(true);
        expect(updatedUser.email_verified_at).toBeDefined();

        const updatedVerification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();
        expect(updatedVerification.verified).toBe(true);
        expect(updatedVerification.verified_at).toBeDefined();
      });

      it('should reject invalid verification token', async () => {
        const verifyResponse = await requestHelper.post(
          '/api/auth/verify-email',
          {
            body: { token: 'invalid-token-12345' },
          },
        );

        expectResponse(verifyResponse).hasStatus(400);
        expect(verifyResponse.body.error?.code).toBe(
          'EMAIL_VERIFICATION_FAILED',
        );
      });

      it('should handle already verified email', async () => {
        const userData = createRegisterRequestData({
          email: 'already-verified@example.com',
          username: 'already-verified',
          password: 'TestPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        const userId = registerResponse.body.data?.user?.id;

        // Get verification token
        const app = requestHelper.app;
        const verification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();

        // Verify first time
        await requestHelper.post('/api/auth/verify-email', {
          body: { token: verification.token },
        });

        // Try to verify again
        const secondVerifyResponse = await requestHelper.post(
          '/api/auth/verify-email',
          {
            body: { token: verification.token },
          },
        );

        expectResponse(secondVerifyResponse).hasStatus(200).isSuccess();
        expect(secondVerifyResponse.body.message).toContain('already verified');
      });
    });

    describe('POST /api/auth/resend-verification', () => {
      it('should resend verification email to authenticated user', async () => {
        const userData = createRegisterRequestData({
          email: 'resend-test@example.com',
          username: 'resend-test',
          password: 'TestPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        const accessToken = registerResponse.body.data?.accessToken;
        const userId = registerResponse.body.data?.user?.id;

        // Get old token
        const app = requestHelper.app;
        const oldVerification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();

        // Resend verification
        const resendResponse = await requestHelper.post(
          '/api/auth/resend-verification',
          {
            body: {},
            headers: { authorization: `Bearer ${accessToken}` },
          },
        );

        expectResponse(resendResponse).hasStatus(200).isSuccess();
        expect(resendResponse.body.data?.message).toContain('resent');

        // Check new token created and old one deleted
        const verifications = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .where('verified', false);

        expect(verifications.length).toBe(1);
        expect(verifications[0].token).not.toBe(oldVerification.token);
      });

      it('should reject resend for already verified email', async () => {
        const userData = createRegisterRequestData({
          email: 'resend-verified@example.com',
          username: 'resend-verified',
          password: 'TestPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        const accessToken = registerResponse.body.data?.accessToken;
        const userId = registerResponse.body.data?.user?.id;

        // Get token and verify
        const app = requestHelper.app;
        const verification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();

        await requestHelper.post('/api/auth/verify-email', {
          body: { token: verification.token },
        });

        // Try to resend after verification
        const resendResponse = await requestHelper.post(
          '/api/auth/resend-verification',
          {
            body: {},
            headers: { authorization: `Bearer ${accessToken}` },
          },
        );

        expectResponse(resendResponse).hasStatus(400);
        expect(resendResponse.body.error?.code).toBe('EMAIL_ALREADY_VERIFIED');
      });
    });

    describe('Token expiration', () => {
      it('should reject expired verification token', async () => {
        const userData = createRegisterRequestData({
          email: 'expired-token@example.com',
          username: 'expired-token',
          password: 'TestPass123!',
        });

        const registerResponse = await requestHelper.post(
          '/api/auth/register',
          { body: userData },
        );
        const userId = registerResponse.body.data?.user?.id;

        // Get token and manually expire it
        const app = requestHelper.app;
        const verification = await app
          .knex('email_verifications')
          .where('user_id', userId)
          .first();

        // Set expiry to past
        await app
          .knex('email_verifications')
          .where('id', verification.id)
          .update({
            expires_at: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          });

        // Try to verify with expired token
        const verifyResponse = await requestHelper.post(
          '/api/auth/verify-email',
          {
            body: { token: verification.token },
          },
        );

        expectResponse(verifyResponse).hasStatus(400);
        expect(verifyResponse.body.error?.message).toContain('expired');
      });
    });
  });
});
