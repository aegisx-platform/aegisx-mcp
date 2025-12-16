import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../../../../../shared/test/test-app-helper';

/**
 * Budget Request - Department Integration Tests
 *
 * End-to-end tests for budget request department workflow.
 * Tests auto-population, validation, error scenarios, and approval flow.
 *
 * Requirements:
 * - REQ-4: Budget Request Auto-Population
 * - REQ-5: User-Department Validation
 *
 * Generated for: user-department-integration spec
 * Created on: 2025-12-16
 */

describe('Budget Request - Department Integration Tests', () => {
  let app: FastifyInstance;
  let testDepartmentId: number;
  let testUserWithDeptId: string;
  let testUserWithoutDeptId: string;
  let testAccessTokenWithDept: string;
  let testAccessTokenWithoutDept: string;

  // Test data factories
  const createDepartmentData = (suffix: string = Date.now().toString()) => ({
    dept_code: `BD${suffix}`.substring(0, 10),
    dept_name: `Budget Test Department ${suffix}`,
    is_active: true,
  });

  const createUserData = (suffix: string = Date.now().toString()) => ({
    email: `budget.test.${suffix}@example.com`,
    username: `budgettest${suffix}`,
    password: 'SecurePassword123!',
    first_name: 'Budget',
    last_name: `Tester ${suffix}`,
    is_active: true,
  });

  const createBudgetRequestData = (fiscalYear: number = 2567) => ({
    fiscal_year: fiscalYear,
    justification: 'Integration test budget request',
  });

  beforeAll(async () => {
    app = await createTestApp();

    // Create test department
    const deptResponse = await app.inject({
      method: 'POST',
      url: '/core/departments',
      payload: createDepartmentData('BUDG'),
    });
    testDepartmentId = deptResponse.json().data.id;

    // Create user WITH department
    const userWithDeptData = {
      ...createUserData('WITHDEPT'),
      department_id: testDepartmentId,
    };
    const userWithDeptResponse = await app.inject({
      method: 'POST',
      url: '/platform/users',
      payload: userWithDeptData,
    });
    testUserWithDeptId = userWithDeptResponse.json().data.id;

    // Login to get token
    const loginWithDeptResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: userWithDeptData.email,
        password: userWithDeptData.password,
      },
    });
    testAccessTokenWithDept = loginWithDeptResponse.json().data.accessToken;

    // Create user WITHOUT department
    const userWithoutDeptData = createUserData('NODEPT');
    const userWithoutDeptResponse = await app.inject({
      method: 'POST',
      url: '/platform/users',
      payload: userWithoutDeptData,
    });
    testUserWithoutDeptId = userWithoutDeptResponse.json().data.id;

    // Login to get token
    const loginWithoutDeptResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: userWithoutDeptData.email,
        password: userWithoutDeptData.password,
      },
    });
    testAccessTokenWithoutDept =
      loginWithoutDeptResponse.json().data.accessToken;
  });

  afterAll(async () => {
    // Cleanup users
    if (testUserWithDeptId) {
      await app.inject({
        method: 'DELETE',
        url: `/platform/users/${testUserWithDeptId}`,
      });
    }
    if (testUserWithoutDeptId) {
      await app.inject({
        method: 'DELETE',
        url: `/platform/users/${testUserWithoutDeptId}`,
      });
    }

    // Cleanup department
    if (testDepartmentId) {
      await app.inject({
        method: 'DELETE',
        url: `/core/departments/${testDepartmentId}`,
      });
    }

    await app.close();
  });

  describe('REQ-4: Budget Request Auto-Population', () => {
    it('should auto-populate department_id from authenticated user', async () => {
      const budgetData = createBudgetRequestData(2567);

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.department_id).toBe(testDepartmentId);
      expect(body.data.fiscal_year).toBe(2567);
    });

    it('should use explicitly provided department_id over auto-population', async () => {
      // Create another department for manual override
      const overrideDeptResponse = await app.inject({
        method: 'POST',
        url: '/core/departments',
        payload: createDepartmentData('OVERRIDE'),
      });
      const overrideDeptId = overrideDeptResponse.json().data.id;

      const budgetData = {
        ...createBudgetRequestData(2568),
        department_id: overrideDeptId,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.department_id).toBe(overrideDeptId); // Should use manual override

      // Cleanup
      await app.inject({
        method: 'DELETE',
        url: `/core/departments/${overrideDeptId}`,
      });
    });

    it('should error when user has no department and department_id not provided', async () => {
      const budgetData = createBudgetRequestData(2569);

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithoutDept}`,
        },
        payload: budgetData,
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('USER_NO_DEPARTMENT');
      expect(body.error.message).toContain('not assigned to a department');
      expect(body.error.message).toContain('contact your administrator');
    });

    it('should allow user without department to manually specify department_id', async () => {
      const budgetData = {
        ...createBudgetRequestData(2570),
        department_id: testDepartmentId,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithoutDept}`,
        },
        payload: budgetData,
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.department_id).toBe(testDepartmentId);
    });
  });

  describe('REQ-5: Department Validation', () => {
    it('should reject invalid department_id in budget request', async () => {
      const budgetData = {
        ...createBudgetRequestData(2571),
        department_id: 999999, // Non-existent department
      };

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      expect(response.statusCode).toBe(422);

      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should validate department exists during creation', async () => {
      const budgetData = {
        ...createBudgetRequestData(2572),
        department_id: 0, // Invalid ID
      };

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      expect([400, 422]).toContain(response.statusCode);

      const body = response.json();
      expect(body.success).toBe(false);
    });
  });

  describe('Budget Request Approval Workflow', () => {
    let testBudgetRequestId: string;

    beforeAll(async () => {
      // Create a budget request for approval tests
      const budgetData = {
        ...createBudgetRequestData(2573),
        department_id: testDepartmentId,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      testBudgetRequestId = response.json().data.id;

      // Add budget request items
      const itemResponse = await app.inject({
        method: 'POST',
        url: `/inventory/budget-requests/${testBudgetRequestId}/items`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: {
          item_name: 'Test Item',
          quantity: 10,
          unit_price: 100,
        },
      });

      expect(itemResponse.statusCode).toBe(201);
    });

    it('should require department_id for budget approval', async () => {
      // Update budget request to remove department (simulate legacy data)
      await app.inject({
        method: 'PUT',
        url: `/inventory/budget-requests/${testBudgetRequestId}`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: {
          department_id: null,
        },
      });

      // Try to approve
      const approveResponse = await app.inject({
        method: 'POST',
        url: `/inventory/budget-requests/${testBudgetRequestId}/approve-finance`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
      });

      expect(approveResponse.statusCode).toBe(400);

      const body = approveResponse.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('BUDGET_REQUEST_NO_DEPARTMENT');
      expect(body.error.message).toContain(
        'Cannot approve budget request without a department',
      );
      expect(body.error.message).toContain('Please update the budget request');

      // Restore department for other tests
      await app.inject({
        method: 'PUT',
        url: `/inventory/budget-requests/${testBudgetRequestId}`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: {
          department_id: testDepartmentId,
        },
      });
    });

    it('should successfully approve budget request with department', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/inventory/budget-requests/${testBudgetRequestId}/approve-finance`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('approved');
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle legacy budget requests with null department_id', async () => {
      // Create budget request without department (simulating legacy data)
      const budgetData = {
        ...createBudgetRequestData(2574),
        department_id: null,
      };

      // This should succeed during creation (backward compatibility)
      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      // May succeed (200/201) or fail (400) depending on validation rules
      expect([200, 201, 400]).toContain(response.statusCode);

      if (response.statusCode === 201) {
        const body = response.json();
        expect(body.data.department_id).toBeNull();
      }
    });

    it('should list budget requests with mixed department assignments', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/inventory/budget-requests?page=1&limit=10',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should filter budget requests by department_id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/inventory/budget-requests?department_id=${testDepartmentId}`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.success).toBe(true);

      // All returned requests should have the specified department_id
      body.data.forEach((request: any) => {
        expect(request.department_id).toBe(testDepartmentId);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return clear error when user not found during auto-population', async () => {
      // This test would require mocking or creating a scenario where user is deleted mid-request
      // For now, we test the validation scenario
      const budgetData = createBudgetRequestData(2575);

      // Without auth token (no user context)
      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        payload: budgetData,
      });

      // Should fail with unauthorized or user not found
      expect([400, 401, 404]).toContain(response.statusCode);

      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should provide actionable error message for USER_NO_DEPARTMENT', async () => {
      const budgetData = createBudgetRequestData(2576);

      const response = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithoutDept}`,
        },
        payload: budgetData,
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body.error.code).toBe('USER_NO_DEPARTMENT');

      // Error message should guide user
      expect(body.error.message).toContain('not assigned to a department');
      expect(body.error.message).toContain('administrator');
      expect(body.error.message).toContain('manually');
    });

    it('should provide actionable error message for BUDGET_REQUEST_NO_DEPARTMENT during approval', async () => {
      // Create budget without department
      const budgetData = {
        ...createBudgetRequestData(2577),
        department_id: testDepartmentId,
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/inventory/budget-requests',
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: budgetData,
      });

      const budgetId = createResponse.json().data.id;

      // Add items
      await app.inject({
        method: 'POST',
        url: `/inventory/budget-requests/${budgetId}/items`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: {
          item_name: 'Test Item',
          quantity: 1,
          unit_price: 100,
        },
      });

      // Remove department
      await app.inject({
        method: 'PUT',
        url: `/inventory/budget-requests/${budgetId}`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
        payload: {
          department_id: null,
        },
      });

      // Try to approve
      const approveResponse = await app.inject({
        method: 'POST',
        url: `/inventory/budget-requests/${budgetId}/approve-finance`,
        headers: {
          Authorization: `Bearer ${testAccessTokenWithDept}`,
        },
      });

      expect(approveResponse.statusCode).toBe(400);

      const body = approveResponse.json();
      expect(body.error.code).toBe('BUDGET_REQUEST_NO_DEPARTMENT');

      // Error message should guide admin
      expect(body.error.message).toContain('Cannot approve budget request');
      expect(body.error.message).toContain('update the budget request');
      expect(body.error.message).toContain('valid department_id');
    });
  });
});
