import { Page, Route, Request } from '@playwright/test';
import { TEST_API_ENDPOINTS, TestUser } from '../fixtures/test-data';

export interface MockResponse {
  status?: number;
  contentType?: string;
  body?: any;
  headers?: Record<string, string>;
}

export interface MockRequest {
  method?: string;
  url: string | RegExp;
  response: MockResponse;
  delay?: number;
}

/**
 * API Mocking Helper
 * Provides utilities for mocking API responses in E2E tests
 */
export class ApiMockHelper {
  private page: Page;
  private mockRequests: Map<string, MockRequest> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock a single API endpoint
   */
  async mockEndpoint(request: MockRequest): Promise<void> {
    const key = `${request.method || 'GET'}_${request.url.toString()}`;
    this.mockRequests.set(key, request);

    await this.page.route(request.url, async (route: Route) => {
      const req = route.request();

      // Check if method matches
      if (request.method && req.method() !== request.method) {
        await route.continue();
        return;
      }

      // Add delay if specified
      if (request.delay) {
        await this.page.waitForTimeout(request.delay);
      }

      // Fulfill with mock response
      await route.fulfill({
        status: request.response.status || 200,
        contentType: request.response.contentType || 'application/json',
        body:
          typeof request.response.body === 'string'
            ? request.response.body
            : JSON.stringify(request.response.body),
        headers: request.response.headers,
      });
    });
  }

  /**
   * Mock multiple API endpoints
   */
  async mockEndpoints(requests: MockRequest[]): Promise<void> {
    for (const request of requests) {
      await this.mockEndpoint(request);
    }
  }

  /**
   * Remove mock for specific endpoint
   */
  async removeMock(url: string | RegExp, method = 'GET'): Promise<void> {
    const key = `${method}_${url.toString()}`;
    this.mockRequests.delete(key);
    await this.page.unroute(url);
  }

  /**
   * Remove all mocks
   */
  async clearAllMocks(): Promise<void> {
    this.mockRequests.clear();
    await this.page.unrouteAll();
  }

  /**
   * Mock authentication endpoints
   */
  async mockAuthEndpoints(): Promise<void> {
    // Mock login success
    await this.mockEndpoint({
      method: 'POST',
      url: new RegExp(TEST_API_ENDPOINTS.auth.login),
      response: {
        body: {
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: 'admin@aegisx.com',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
          },
        },
      },
    });

    // Mock profile endpoint
    await this.mockEndpoint({
      method: 'GET',
      url: new RegExp(TEST_API_ENDPOINTS.auth.profile),
      response: {
        body: {
          id: '1',
          email: 'admin@aegisx.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          avatar: null,
        },
      },
    });

    // Mock logout
    await this.mockEndpoint({
      method: 'POST',
      url: new RegExp(TEST_API_ENDPOINTS.auth.logout),
      response: {
        body: { success: true },
      },
    });
  }

  /**
   * Mock authentication failure
   */
  async mockAuthFailure(): Promise<void> {
    await this.mockEndpoint({
      method: 'POST',
      url: new RegExp(TEST_API_ENDPOINTS.auth.login),
      response: {
        status: 401,
        body: {
          success: false,
          error: 'Invalid credentials',
        },
      },
    });
  }

  /**
   * Mock user management endpoints
   */
  async mockUserEndpoints(users: TestUser[] = []): Promise<void> {
    // Mock get users list
    await this.mockEndpoint({
      method: 'GET',
      url: new RegExp(TEST_API_ENDPOINTS.users.list),
      response: {
        body: {
          data: users,
          total: users.length,
          page: 1,
          limit: 10,
        },
      },
    });

    // Mock create user
    await this.mockEndpoint({
      method: 'POST',
      url: new RegExp(TEST_API_ENDPOINTS.users.create),
      response: {
        status: 201,
        body: {
          id: 'new-user-id',
          email: 'newuser@test.com',
          firstName: 'New',
          lastName: 'User',
          role: 'user',
          isActive: true,
        },
      },
    });

    // Mock update user
    await this.mockEndpoint({
      method: 'PUT',
      url: new RegExp('/api/users/\\d+'),
      response: {
        body: {
          id: '1',
          email: 'updated@test.com',
          firstName: 'Updated',
          lastName: 'User',
          role: 'user',
          isActive: true,
        },
      },
    });

    // Mock delete user
    await this.mockEndpoint({
      method: 'DELETE',
      url: new RegExp('/api/users/\\d+'),
      response: {
        status: 204,
        body: '',
      },
    });
  }

  /**
   * Mock profile endpoints
   */
  async mockProfileEndpoints(): Promise<void> {
    // Mock get profile
    await this.mockEndpoint({
      method: 'GET',
      url: new RegExp(TEST_API_ENDPOINTS.profile.get),
      response: {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com',
          phone: '+1-555-0123',
          bio: 'Test user profile',
          avatar: null,
          timezone: 'UTC',
          language: 'en',
          theme: 'light',
        },
      },
    });

    // Mock update profile
    await this.mockEndpoint({
      method: 'PUT',
      url: new RegExp(TEST_API_ENDPOINTS.profile.update),
      response: {
        body: {
          success: true,
          message: 'Profile updated successfully',
        },
      },
    });

    // Mock avatar upload
    await this.mockEndpoint({
      method: 'POST',
      url: new RegExp(TEST_API_ENDPOINTS.profile.avatar),
      response: {
        body: {
          success: true,
          avatar: 'https://example.com/avatar.jpg',
        },
      },
    });
  }

  /**
   * Mock slow API responses
   */
  async mockSlowResponses(delay = 3000): Promise<void> {
    const commonEndpoints = [
      '/api/users',
      '/api/profile',
      '/api/dashboard',
      '/api/settings',
    ];

    for (const endpoint of commonEndpoints) {
      await this.mockEndpoint({
        url: new RegExp(endpoint),
        response: { body: { data: [] } },
        delay,
      });
    }
  }

  /**
   * Mock API errors
   */
  async mockApiErrors(): Promise<void> {
    // Mock 500 server error
    await this.mockEndpoint({
      url: new RegExp('/api/users'),
      response: {
        status: 500,
        body: {
          error: 'Internal server error',
        },
      },
    });

    // Mock 404 not found
    await this.mockEndpoint({
      url: new RegExp('/api/users/999'),
      response: {
        status: 404,
        body: {
          error: 'User not found',
        },
      },
    });

    // Mock 403 forbidden
    await this.mockEndpoint({
      url: new RegExp('/api/admin'),
      response: {
        status: 403,
        body: {
          error: 'Access forbidden',
        },
      },
    });
  }

  /**
   * Mock validation errors
   */
  async mockValidationErrors(): Promise<void> {
    await this.mockEndpoint({
      method: 'POST',
      url: new RegExp('/api/users'),
      response: {
        status: 422,
        body: {
          error: 'Validation failed',
          details: {
            email: 'Email is required',
            password: 'Password must be at least 8 characters',
          },
        },
      },
    });
  }

  /**
   * Mock network timeout
   */
  async mockNetworkTimeout(): Promise<void> {
    await this.page.route('**/*', async (_route) => {
      // Never fulfill the request to simulate timeout
      await new Promise(() => {
        // Intentionally empty to simulate timeout
      }); // Infinite promise
    });
  }

  /**
   * Mock successful file upload
   */
  async mockFileUpload(): Promise<void> {
    await this.mockEndpoint({
      method: 'POST',
      url: /\/upload|\/files/,
      response: {
        body: {
          success: true,
          url: 'https://example.com/uploaded-file.jpg',
          filename: 'uploaded-file.jpg',
          size: 1024,
        },
      },
    });
  }

  /**
   * Mock pagination
   */
  async mockPagination(totalItems = 100, pageSize = 10): Promise<void> {
    await this.page.route(new RegExp('/api/users'), async (route) => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(
        url.searchParams.get('limit') || pageSize.toString(),
      );

      const startIndex = (page - 1) * limit;
      const _endIndex = startIndex + limit;

      const items = Array.from({ length: limit }, (_, i) => ({
        id: (startIndex + i + 1).toString(),
        email: `user${startIndex + i + 1}@test.com`,
        firstName: `User${startIndex + i + 1}`,
        lastName: 'Test',
        role: 'user',
        isActive: true,
      }));

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          data: items,
          total: totalItems,
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit),
        }),
      });
    });
  }

  /**
   * Intercept and log API requests
   */
  async interceptRequests(): Promise<void> {
    await this.page.route('**/api/**', async (route) => {
      const request = route.request();
      console.log(`API Request: ${request.method()} ${request.url()}`);

      if (request.method() !== 'GET') {
        console.log(`Request body: ${request.postData()}`);
      }

      await route.continue();
    });
  }

  /**
   * Mock WebSocket connections
   */
  async mockWebSocket(): Promise<void> {
    await this.page.evaluateOnNewDocument(() => {
      const _originalWebSocket = window.WebSocket;

      class MockWebSocket extends EventTarget {
        readyState = 1; // OPEN
        url: string;

        constructor(url: string) {
          super();
          this.url = url;

          // Simulate connection
          setTimeout(() => {
            this.dispatchEvent(new Event('open'));
          }, 100);
        }

        send(data: string) {
          console.log('WebSocket send:', data);
          // Echo back
          setTimeout(() => {
            this.dispatchEvent(new MessageEvent('message', { data }));
          }, 100);
        }

        close() {
          this.readyState = 3; // CLOSED
          this.dispatchEvent(new Event('close'));
        }
      }

      (window as any).WebSocket = MockWebSocket;
    });
  }

  /**
   * Create API test scenarios
   */
  createApiTestScenarios() {
    return {
      success: () => this.mockAuthEndpoints(),
      failure: () => this.mockAuthFailure(),
      slow: (delay?: number) => this.mockSlowResponses(delay),
      errors: () => this.mockApiErrors(),
      validation: () => this.mockValidationErrors(),
      timeout: () => this.mockNetworkTimeout(),
      pagination: (total?: number, size?: number) =>
        this.mockPagination(total, size),
    };
  }

  /**
   * Wait for API request to complete
   */
  async waitForApiRequest(
    urlPattern: string | RegExp,
    timeout = 10000,
  ): Promise<Request> {
    return await this.page.waitForRequest(urlPattern, { timeout });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(
    urlPattern: string | RegExp,
    timeout = 10000,
  ): Promise<any> {
    const response = await this.page.waitForResponse(urlPattern, { timeout });
    return await response.json();
  }
}
