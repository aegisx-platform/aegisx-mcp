import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { IncomingMessage, ServerResponse } from 'http';

export interface RequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  files?: { [fieldname: string]: any };
}

export interface AuthenticatedRequestOptions extends RequestOptions {
  token: string;
}

export class RequestHelper {
  private request: any;

  constructor(private app: FastifyInstance) {
    // Convert Fastify instance to HTTP server for supertest
    this.request = supertest(app.server);
  }

  /**
   * Make a GET request
   */
  async get(
    url: string,
    options: RequestOptions = {},
  ): Promise<supertest.Response> {
    let req = this.request.get(url);

    if (options.headers) {
      req = req.set(options.headers);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    return req;
  }

  /**
   * Make an authenticated GET request
   */
  async getAuth(
    url: string,
    options: AuthenticatedRequestOptions,
  ): Promise<supertest.Response> {
    return this.get(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${options.token}`,
      },
    });
  }

  /**
   * Make a POST request
   */
  async post(
    url: string,
    options: RequestOptions = {},
  ): Promise<supertest.Response> {
    let req = this.request.post(url);

    if (options.headers) {
      req = req.set(options.headers);
    }

    if (options.body) {
      req = req.send(options.body);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    const response = await req;

    // Debug logging for registration endpoint
    if (url.includes('/register')) {
      process.stdout.write('\n=== POST REQUEST DEBUG ===\n');
      process.stdout.write('URL: ' + url + '\n');
      process.stdout.write('Full request URL: ' + req.url + '\n');
      process.stdout.write(
        'Request headers: ' + JSON.stringify(req.header, null, 2) + '\n',
      );
      process.stdout.write(
        'Request body: ' + JSON.stringify(options.body, null, 2) + '\n',
      );
      process.stdout.write('Response status: ' + response.status + '\n');
      process.stdout.write(
        'Response headers: ' + JSON.stringify(response.headers, null, 2) + '\n',
      );
      process.stdout.write(
        'Response body: ' + JSON.stringify(response.body, null, 2) + '\n',
      );
      process.stdout.write('=== END DEBUG ===\n\n');
    }

    return response;
  }

  /**
   * Make an authenticated POST request
   */
  async postAuth(
    url: string,
    options: AuthenticatedRequestOptions,
  ): Promise<supertest.Response> {
    return this.post(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${options.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a PUT request
   */
  async put(
    url: string,
    options: RequestOptions = {},
  ): Promise<supertest.Response> {
    let req = this.request.put(url);

    if (options.headers) {
      req = req.set(options.headers);
    }

    if (options.body) {
      req = req.send(options.body);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    return req;
  }

  /**
   * Make an authenticated PUT request
   */
  async putAuth(
    url: string,
    options: AuthenticatedRequestOptions,
  ): Promise<supertest.Response> {
    return this.put(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${options.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a PATCH request
   */
  async patch(
    url: string,
    options: RequestOptions = {},
  ): Promise<supertest.Response> {
    let req = this.request.patch(url);

    if (options.headers) {
      req = req.set(options.headers);
    }

    if (options.body) {
      req = req.send(options.body);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    return req;
  }

  /**
   * Make an authenticated PATCH request
   */
  async patchAuth(
    url: string,
    options: AuthenticatedRequestOptions,
  ): Promise<supertest.Response> {
    return this.patch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${options.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a DELETE request
   */
  async delete(
    url: string,
    options: RequestOptions = {},
  ): Promise<supertest.Response> {
    let req = this.request.delete(url);

    if (options.headers) {
      req = req.set(options.headers);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    return req;
  }

  /**
   * Make an authenticated DELETE request
   */
  async deleteAuth(
    url: string,
    options: AuthenticatedRequestOptions,
  ): Promise<supertest.Response> {
    return this.delete(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${options.token}`,
      },
    });
  }

  /**
   * Upload file using multipart/form-data
   */
  async uploadFile(
    url: string,
    fieldName: string,
    filePath: string,
    options: AuthenticatedRequestOptions = { token: '' },
  ): Promise<supertest.Response> {
    let req = this.request.post(url);

    if (options.token) {
      req = req.set('Authorization', `Bearer ${options.token}`);
    }

    if (options.headers) {
      req = req.set(options.headers);
    }

    req = req.attach(fieldName, filePath);

    if (options.body) {
      for (const [key, value] of Object.entries(options.body)) {
        req = req.field(key, String(value));
      }
    }

    return req;
  }

  /**
   * Upload buffer as file
   */
  async uploadBuffer(
    url: string,
    fieldName: string,
    buffer: Buffer,
    filename: string,
    options: AuthenticatedRequestOptions = { token: '' },
  ): Promise<supertest.Response> {
    let req = this.request.post(url);

    if (options.token) {
      req = req.set('Authorization', `Bearer ${options.token}`);
    }

    if (options.headers) {
      req = req.set(options.headers);
    }

    req = req.attach(fieldName, buffer, filename);

    if (options.body) {
      for (const [key, value] of Object.entries(options.body)) {
        req = req.field(key, String(value));
      }
    }

    return req;
  }

  /**
   * Make a request with cookies
   */
  async requestWithCookies(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    cookies: Record<string, string>,
    options: RequestOptions = {},
  ): Promise<supertest.Response> {
    let req: supertest.Test;

    switch (method) {
      case 'GET':
        req = this.request.get(url);
        break;
      case 'POST':
        req = this.request.post(url);
        break;
      case 'PUT':
        req = this.request.put(url);
        break;
      case 'PATCH':
        req = this.request.patch(url);
        break;
      case 'DELETE':
        req = this.request.delete(url);
        break;
    }

    // Set cookies
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    req = req.set('Cookie', cookieString);

    if (options.headers) {
      req = req.set(options.headers);
    }

    if (options.body) {
      req = req.send(options.body);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    return req;
  }

  /**
   * Extract cookies from response
   */
  extractCookies(response: supertest.Response): Record<string, string> {
    const cookies: Record<string, string> = {};
    const setCookieHeader = response.headers['set-cookie'];

    if (setCookieHeader) {
      for (const cookie of setCookieHeader) {
        const [keyValue] = cookie.split(';');
        const [key, value] = keyValue.split('=');
        if (key && value) {
          cookies[key.trim()] = value.trim();
        }
      }
    }

    return cookies;
  }

  /**
   * Follow redirects manually (useful for testing redirect flows)
   */
  async followRedirects(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    options: RequestOptions = {},
    maxRedirects = 5,
  ): Promise<supertest.Response[]> {
    const responses: supertest.Response[] = [];
    let currentUrl = url;
    let redirectCount = 0;

    while (redirectCount < maxRedirects) {
      let response: supertest.Response;

      switch (method) {
        case 'GET':
          response = await this.get(currentUrl, options);
          break;
        case 'POST':
          response = await this.post(currentUrl, options);
          break;
        case 'PUT':
          response = await this.put(currentUrl, options);
          break;
        case 'PATCH':
          response = await this.patch(currentUrl, options);
          break;
        case 'DELETE':
          response = await this.delete(currentUrl, options);
          break;
      }

      responses.push(response);

      // Check if response is a redirect
      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.location
      ) {
        currentUrl = response.headers.location;
        redirectCount++;
        // Only GET requests should be used for subsequent redirects
        method = 'GET';
        options.body = undefined; // Remove body for GET redirects
      } else {
        break;
      }
    }

    return responses;
  }

  /**
   * Wait for response with polling
   */
  async waitForResponse(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    expectedStatus: number | number[],
    options: RequestOptions = {},
    config: { maxAttempts?: number; intervalMs?: number } = {},
  ): Promise<supertest.Response> {
    const { maxAttempts = 30, intervalMs = 1000 } = config;
    const expectedStatuses = Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let response: supertest.Response;

      switch (method) {
        case 'GET':
          response = await this.get(url, options);
          break;
        case 'POST':
          response = await this.post(url, options);
          break;
        case 'PUT':
          response = await this.put(url, options);
          break;
        case 'PATCH':
          response = await this.patch(url, options);
          break;
        case 'DELETE':
          response = await this.delete(url, options);
          break;
      }

      if (expectedStatuses.includes(response.status)) {
        return response;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error(
      `Expected status ${expectedStatus} not received after ${maxAttempts} attempts`,
    );
  }
}

/**
 * Create request helper from Fastify app
 */
export function createRequestHelper(app: FastifyInstance): RequestHelper {
  return new RequestHelper(app);
}
