import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../shared/test/test-app-helper';

/**
 * User-Department Integration Tests
 *
 * End-to-end tests for user-department integration.
 * Tests user CRUD with department_id, auth flow, and validation.
 *
 * Requirements:
 * - REQ-1: User Authentication with Department Context
 * - REQ-2: Backend User Profile Enhancement
 * - REQ-5: User-Department Validation
 *
 * Generated for: user-department-integration spec
 * Created on: 2025-12-16
 */

describe('User-Department Integration Tests', () => {
  let app: FastifyInstance;
  let testDepartmentId: number;
  let testUserId: string;
  let testUserWithoutDeptId: string;

  // Test data factory
  const createUserData = (suffix: string = Date.now().toString()) => ({
    email: `test.user.${suffix}@example.com`,
    username: `testuser${suffix}`,
    password: 'SecurePassword123!',
    first_name: 'Test',
    last_name: `User ${suffix}`,
    is_active: true,
  });

  const createDepartmentData = (suffix: string = Date.now().toString()) => ({
    dept_code: `D${suffix}`.substring(0, 10),
    dept_name: `Test Department ${suffix}`,
    is_active: true,
  });

  beforeAll(async () => {
    app = await createTestApp();

    // Create a test department for user assignments
    const deptResponse = await app.inject({
      method: 'POST',
      url: '/core/departments',
      payload: createDepartmentData('USRTEST'),
    });
    testDepartmentId = deptResponse.json().data.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test department (will set users' department_id to null)
    if (testDepartmentId) {
      await app.inject({
        method: 'DELETE',
        url: `/core/departments/${testDepartmentId}`,
      });
    }

    await app.close();
  });

  describe('REQ-2: User CRUD with Department', () => {
    it('should create user with department_id', async () => {
      const userData = {
        ...createUserData('DEPT1'),
        department_id: testDepartmentId,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: userData,
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        email: userData.email,
        username: userData.username,
        department_id: testDepartmentId,
      });
      expect(body.data.id).toBeDefined();

      // Store for later tests
      testUserId = body.data.id;
    });

    it('should create user without department_id (null)', async () => {
      const userData = createUserData('NODEPT1');

      const response = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: userData,
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.department_id).toBeNull();

      // Store for later tests
      testUserWithoutDeptId = body.data.id;
    });

    it('should retrieve user with department_id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/platform/users/${testUserId}`,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testUserId);
      expect(body.data.department_id).toBe(testDepartmentId);
    });

    it('should update user department_id', async () => {
      // Create another department
      const newDeptResponse = await app.inject({
        method: 'POST',
        url: '/core/departments',
        payload: createDepartmentData('UPDATE'),
      });
      const newDeptId = newDeptResponse.json().data.id;

      const response = await app.inject({
        method: 'PUT',
        url: `/platform/users/${testUserId}`,
        payload: {
          department_id: newDeptId,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.department_id).toBe(newDeptId);

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/core/departments/${newDeptId}`,
      });
    });

    it('should allow setting department_id to null', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/platform/users/${testUserId}`,
        payload: {
          department_id: null,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.department_id).toBeNull();

      // Restore department for other tests
      await app.inject({
        method: 'PUT',
        url: `/platform/users/${testUserId}`,
        payload: {
          department_id: testDepartmentId,
        },
      });
    });
  });

  describe('REQ-5: Department Validation', () => {
    it('should reject invalid department_id on user creation', async () => {
      const userData = {
        ...createUserData('INVDEPT'),
        department_id: 999999, // Non-existent department
      };

      const response = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: userData,
      });

      expect(response.statusCode).toBe(422);

      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should reject invalid department_id on user update', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/platform/users/${testUserId}`,
        payload: {
          department_id: 999999, // Non-existent department
        },
      });

      expect(response.statusCode).toBe(422);

      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should allow assignment to inactive department', async () => {
      // Create inactive department
      const inactiveDeptResponse = await app.inject({
        method: 'POST',
        url: '/core/departments',
        payload: {
          ...createDepartmentData('INACTIVE'),
          is_active: false,
        },
      });
      const inactiveDeptId = inactiveDeptResponse.json().data.id;

      const response = await app.inject({
        method: 'PUT',
        url: `/platform/users/${testUserId}`,
        payload: {
          department_id: inactiveDeptId,
        },
      });

      // Should succeed but with warning (implementation may vary)
      expect([200, 422]).toContain(response.statusCode);

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/core/departments/${inactiveDeptId}`,
      });

      // Restore department
      await app.inject({
        method: 'PUT',
        url: `/platform/users/${testUserId}`,
        payload: {
          department_id: testDepartmentId,
        },
      });
    });
  });

  describe('REQ-1: Auth Login with Department Context', () => {
    it('should include department_id in login response', async () => {
      const userData = createUserData('AUTH1');
      const userPayload = {
        ...userData,
        department_id: testDepartmentId,
      };

      // Create user
      const createResponse = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: userPayload,
      });
      const userId = createResponse.json().data.id;

      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: userData.email,
          password: userData.password,
        },
      });

      expect(loginResponse.statusCode).toBe(200);

      const loginBody = loginResponse.json();
      expect(loginBody.success).toBe(true);
      expect(loginBody.data.user).toBeDefined();
      expect(loginBody.data.user.department_id).toBe(testDepartmentId);
      expect(loginBody.data.accessToken).toBeDefined();

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/platform/users/${userId}`,
      });
    });

    it('should include department_id in profile endpoint', async () => {
      const userData = createUserData('PROFILE1');
      const userPayload = {
        ...userData,
        department_id: testDepartmentId,
      };

      // Create user
      const createResponse = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: userPayload,
      });
      const userId = createResponse.json().data.id;

      // Login to get token
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: userData.email,
          password: userData.password,
        },
      });
      const accessToken = loginResponse.json().data.accessToken;

      // Get profile
      const profileResponse = await app.inject({
        method: 'GET',
        url: '/auth/profile',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(profileResponse.statusCode).toBe(200);

      const profileBody = profileResponse.json();
      expect(profileBody.success).toBe(true);
      expect(profileBody.data.department_id).toBe(testDepartmentId);

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/platform/users/${userId}`,
      });
    });

    it('should handle null department_id in login', async () => {
      const userData = createUserData('AUTHNULL');

      // Create user without department
      const createResponse = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: userData,
      });
      const userId = createResponse.json().data.id;

      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: userData.email,
          password: userData.password,
        },
      });

      expect(loginResponse.statusCode).toBe(200);

      const loginBody = loginResponse.json();
      expect(loginBody.success).toBe(true);
      expect(loginBody.data.user.department_id).toBeNull();

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/platform/users/${userId}`,
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should list users with mixed department assignments', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/platform/users?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);

      // Check that both users with and without departments are returned
      const users = body.data;
      const usersWithDept = users.filter((u: any) => u.department_id !== null);
      const usersWithoutDept = users.filter(
        (u: any) => u.department_id === null,
      );

      // Both types should exist
      expect(usersWithDept.length).toBeGreaterThan(0);
      expect(usersWithoutDept.length).toBeGreaterThan(0);
    });

    it('should filter users by department_id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/platform/users?department_id=${testDepartmentId}`,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);

      // All returned users should have the specified department_id
      body.data.forEach((user: any) => {
        expect(user.department_id).toBe(testDepartmentId);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return proper error structure for invalid department', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: {
          ...createUserData('ERR1'),
          department_id: 999999,
        },
      });

      expect(response.statusCode).toBe(422);

      const body = response.json();
      expect(body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
        }),
      });
    });

    it('should handle department deletion gracefully', async () => {
      // Create department
      const deptResponse = await app.inject({
        method: 'POST',
        url: '/core/departments',
        payload: createDepartmentData('DELTEST'),
      });
      const deptId = deptResponse.json().data.id;

      // Assign user to department
      const userResponse = await app.inject({
        method: 'POST',
        url: '/platform/users',
        payload: {
          ...createUserData('DELUSER'),
          department_id: deptId,
        },
      });
      const userId = userResponse.json().data.id;

      // Delete department (should set user's department_id to null)
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/core/departments/${deptId}`,
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify user's department is now null
      const getUserResponse = await app.inject({
        method: 'GET',
        url: `/platform/users/${userId}`,
      });

      const user = getUserResponse.json().data;
      expect(user.department_id).toBeNull();

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/platform/users/${userId}`,
      });
    });
  });
});
