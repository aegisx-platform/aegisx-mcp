/**
 * AegisX API Testing Tools
 * Tools for authentication and API endpoint testing
 */

import type { ToolDefinition } from './index.js';

// ============ STATE MANAGEMENT ============

interface AuthState {
  token: string | null;
  user: any | null;
  baseUrl: string;
  loginTime: number | null;
}

interface RequestHistoryEntry {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

// Global state
let authState: AuthState = {
  token: null,
  user: null,
  baseUrl: 'http://localhost:3000',
  loginTime: null,
};

let requestHistory: RequestHistoryEntry[] = [];
let requestIdCounter = 1;
const MAX_HISTORY = 50;

// ============ TOOL DEFINITIONS ============

export const apiTestingTools: ToolDefinition[] = [
  {
    name: 'aegisx_auth_login',
    description:
      'Login to AegisX API and store access token for subsequent requests. Default baseUrl is http://localhost:3000',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email address',
        },
        password: {
          type: 'string',
          description: 'User password',
        },
        baseUrl: {
          type: 'string',
          description:
            'API base URL (default: http://localhost:3000, supports AEGISX_API_URL env var)',
        },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: 'aegisx_auth_status',
    description:
      'Check current authentication status including token info and user details',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'aegisx_auth_decode_jwt',
    description:
      'Decode and display JWT token information including header, payload, and expiry details',
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description:
            'JWT token to decode (optional - uses current logged-in token if not provided)',
        },
      },
    },
  },
  {
    name: 'aegisx_auth_logout',
    description: 'Logout and clear authentication token and session data',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'aegisx_api_request',
    description:
      'Make an authenticated HTTP request to AegisX API endpoints. Automatically includes Authorization header if logged in.',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          description: 'HTTP method',
        },
        path: {
          type: 'string',
          description:
            'API endpoint path (e.g., "/api/profile", "/api/inventory/drugs")',
        },
        body: {
          type: 'object',
          description: 'Request body for POST/PUT/PATCH requests (optional)',
        },
        headers: {
          type: 'object',
          description: 'Additional headers (optional)',
        },
        queryParams: {
          type: 'object',
          description: 'Query parameters as key-value pairs (optional)',
        },
      },
      required: ['method', 'path'],
    },
  },
  {
    name: 'aegisx_api_history',
    description:
      'View request/response history. Shows last 50 requests with status, timing, and response data.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of recent requests to show (default: 10)',
        },
        method: {
          type: 'string',
          description: 'Filter by HTTP method (optional)',
        },
        status: {
          type: 'number',
          description: 'Filter by status code (optional)',
        },
      },
    },
  },
  {
    name: 'aegisx_api_clear_history',
    description: 'Clear all request/response history',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ============ HELPER FUNCTIONS ============

function decodeJWT(token: string): {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  expiresIn: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const header = JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf-8'),
    );
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    );
    const signature = parts[2];

    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp || 0;
    const iat = payload.iat || 0;

    const isExpired = exp > 0 && now > exp;
    const expiresIn = exp > 0 ? formatTimeRemaining(exp - now) : null;
    const issuedAt = iat > 0 ? new Date(iat * 1000).toISOString() : null;
    const expiresAt = exp > 0 ? new Date(exp * 1000).toISOString() : null;

    return {
      header,
      payload,
      signature,
      isExpired,
      expiresIn,
      issuedAt,
      expiresAt,
    };
  } catch (error) {
    throw new Error(
      `Failed to decode JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

function addToHistory(entry: Omit<RequestHistoryEntry, 'id'>): void {
  requestHistory.unshift({
    id: requestIdCounter++,
    ...entry,
  });

  // Keep only last MAX_HISTORY entries
  if (requestHistory.length > MAX_HISTORY) {
    requestHistory = requestHistory.slice(0, MAX_HISTORY);
  }
}

async function makeHttpRequest(
  method: string,
  url: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
  } = {},
): Promise<{
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
}> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const responseTime = Date.now() - startTime;

    let body: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    throw {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
}

// ============ TOOL HANDLERS ============

async function handleLogin(args: any): Promise<{ content: any[] }> {
  const { email, password, baseUrl } = args;

  // Use provided baseUrl or env var or default
  authState.baseUrl =
    baseUrl || process.env.AEGISX_API_URL || 'http://localhost:3000';

  const url = `${authState.baseUrl}/api/auth/login`;

  try {
    const result = await makeHttpRequest('POST', url, {
      body: { email, password },
    });

    addToHistory({
      timestamp: new Date().toISOString(),
      method: 'POST',
      url,
      status: result.status,
      statusText: result.statusText,
      responseTime: result.responseTime,
      requestBody: { email, password: '***' },
      responseBody: result.body,
    });

    if (result.status !== 200) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Login failed (${result.status} ${result.statusText})\n\nResponse:\n${JSON.stringify(result.body, null, 2)}`,
          },
        ],
      };
    }

    // Store auth state
    authState.token = result.body.data?.token || result.body.token || null;
    authState.user = result.body.data?.user || result.body.user || null;
    authState.loginTime = Date.now();

    if (!authState.token) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️  Login response received but no token found\n\nResponse:\n${JSON.stringify(result.body, null, 2)}`,
          },
        ],
      };
    }

    // Decode token to show info
    const decoded = decodeJWT(authState.token);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Login successful!\n\n**User Info:**\n${JSON.stringify(authState.user, null, 2)}\n\n**Token Info:**\n- Issued at: ${decoded.issuedAt}\n- Expires at: ${decoded.expiresAt}\n- Time remaining: ${decoded.expiresIn}\n\n**Base URL:** ${authState.baseUrl}\n\n✨ You can now make authenticated requests using aegisx_api_request`,
        },
      ],
    };
  } catch (error: any) {
    addToHistory({
      timestamp: new Date().toISOString(),
      method: 'POST',
      url,
      status: 0,
      statusText: 'Error',
      responseTime: error.responseTime || 0,
      error: error.error || error.message,
    });

    return {
      content: [
        {
          type: 'text',
          text: `❌ Login failed\n\nError: ${error.error || error.message}\n\nPlease check:\n- API server is running at ${authState.baseUrl}\n- Email and password are correct\n- Network connectivity`,
        },
      ],
    };
  }
}

function handleStatus(): { content: any[] } {
  if (!authState.token) {
    return {
      content: [
        {
          type: 'text',
          text: `🔓 **Not Authenticated**\n\nUse aegisx_auth_login to login first.\n\nExample:\n\`\`\`\naegix_auth_login({ email: "admin@example.com", password: "password" })\n\`\`\``,
        },
      ],
    };
  }

  try {
    const decoded = decodeJWT(authState.token);

    const lines: string[] = [];
    lines.push('🔐 **Authenticated**\n');
    lines.push('**User Info:**');
    lines.push(JSON.stringify(authState.user, null, 2));
    lines.push('');
    lines.push('**Token Status:**');
    lines.push(`- Expired: ${decoded.isExpired ? '❌ Yes' : '✅ No'}`);
    lines.push(`- Issued at: ${decoded.issuedAt}`);
    lines.push(`- Expires at: ${decoded.expiresAt}`);
    lines.push(`- Time remaining: ${decoded.expiresIn}`);
    lines.push('');
    lines.push(`**Base URL:** ${authState.baseUrl}`);
    lines.push(
      `**Logged in:** ${new Date(authState.loginTime!).toISOString()}`,
    );

    if (decoded.isExpired) {
      lines.push('');
      lines.push(
        '⚠️  **Token expired!** Please login again using aegisx_auth_login',
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: lines.join('\n'),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `⚠️  Authentication status unknown\n\nError decoding token: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease login again using aegisx_auth_login`,
        },
      ],
    };
  }
}

function handleDecodeJWT(args: any): { content: any[] } {
  const token = args.token || authState.token;

  if (!token) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ No token provided and not logged in\n\nPlease either:\n1. Login using aegisx_auth_login\n2. Provide a token: aegisx_auth_decode_jwt({ token: "your-token" })`,
        },
      ],
    };
  }

  try {
    const decoded = decodeJWT(token);

    const lines: string[] = [];
    lines.push('# JWT Token Decoded\n');
    lines.push('## Header');
    lines.push('```json');
    lines.push(JSON.stringify(decoded.header, null, 2));
    lines.push('```\n');
    lines.push('## Payload');
    lines.push('```json');
    lines.push(JSON.stringify(decoded.payload, null, 2));
    lines.push('```\n');
    lines.push('## Token Info');
    lines.push(`- **Expired:** ${decoded.isExpired ? '❌ Yes' : '✅ No'}`);
    lines.push(`- **Issued at:** ${decoded.issuedAt}`);
    lines.push(`- **Expires at:** ${decoded.expiresAt}`);
    lines.push(`- **Time remaining:** ${decoded.expiresIn}`);
    lines.push(`- **Signature:** ${decoded.signature.substring(0, 20)}...`);

    return {
      content: [
        {
          type: 'text',
          text: lines.join('\n'),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Failed to decode JWT\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the token is a valid JWT in format: header.payload.signature`,
        },
      ],
    };
  }
}

function handleLogout(): { content: any[] } {
  if (!authState.token) {
    return {
      content: [
        {
          type: 'text',
          text: '🔓 Already logged out',
        },
      ],
    };
  }

  authState = {
    token: null,
    user: null,
    baseUrl: authState.baseUrl, // Keep base URL
    loginTime: null,
  };

  return {
    content: [
      {
        type: 'text',
        text: '✅ Logged out successfully\n\nAuthentication token and user session cleared.',
      },
    ],
  };
}

async function handleApiRequest(args: any): Promise<{ content: any[] }> {
  const { method, path, body, headers = {}, queryParams } = args;

  // Build URL with query params
  let url = `${authState.baseUrl}${path}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  // Add auth header if logged in
  const requestHeaders: Record<string, string> = { ...headers };
  if (authState.token) {
    requestHeaders['Authorization'] = `Bearer ${authState.token}`;
  }

  try {
    const result = await makeHttpRequest(method, url, {
      body,
      headers: requestHeaders,
    });

    addToHistory({
      timestamp: new Date().toISOString(),
      method,
      url,
      status: result.status,
      statusText: result.statusText,
      responseTime: result.responseTime,
      requestHeaders,
      requestBody: body,
      responseBody: result.body,
    });

    const lines: string[] = [];
    lines.push(
      `${result.status >= 200 && result.status < 300 ? '✅' : '❌'} **${method} ${path}**\n`,
    );
    lines.push(`**Status:** ${result.status} ${result.statusText}`);
    lines.push(`**Response Time:** ${result.responseTime}ms`);
    lines.push('');
    lines.push('**Response:**');
    lines.push('```json');
    lines.push(JSON.stringify(result.body, null, 2));
    lines.push('```');

    return {
      content: [
        {
          type: 'text',
          text: lines.join('\n'),
        },
      ],
    };
  } catch (error: any) {
    addToHistory({
      timestamp: new Date().toISOString(),
      method,
      url,
      status: 0,
      statusText: 'Error',
      responseTime: error.responseTime || 0,
      requestHeaders,
      requestBody: body,
      error: error.error || error.message,
    });

    return {
      content: [
        {
          type: 'text',
          text: `❌ **${method} ${path}** Failed\n\nError: ${error.error || error.message}\n\nPlease check:\n- API server is running at ${authState.baseUrl}\n- Endpoint path is correct\n- You are authenticated (if required)`,
        },
      ],
    };
  }
}

function handleHistory(args: any): { content: any[] } {
  const { limit = 10, method, status } = args;

  let filtered = requestHistory;

  if (method) {
    filtered = filtered.filter((entry) => entry.method === method);
  }

  if (status) {
    filtered = filtered.filter((entry) => entry.status === status);
  }

  const entries = filtered.slice(0, limit);

  if (entries.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: '📭 No request history\n\nMake some API requests using aegisx_api_request to see history.',
        },
      ],
    };
  }

  const lines: string[] = [];
  lines.push(`# Request History (${entries.length} of ${filtered.length})\n`);

  for (const entry of entries) {
    const statusIcon =
      entry.status >= 200 && entry.status < 300
        ? '✅'
        : entry.status === 0
          ? '❌'
          : '⚠️';
    lines.push(`## ${statusIcon} #${entry.id} ${entry.method} ${entry.url}`);
    lines.push(
      `**Time:** ${entry.timestamp} | **Status:** ${entry.status} ${entry.statusText} | **Duration:** ${entry.responseTime}ms`,
    );

    if (entry.error) {
      lines.push(`**Error:** ${entry.error}`);
    }

    if (entry.responseBody) {
      lines.push('**Response:**');
      lines.push('```json');
      lines.push(JSON.stringify(entry.responseBody, null, 2));
      lines.push('```');
    }

    lines.push('');
  }

  return {
    content: [
      {
        type: 'text',
        text: lines.join('\n'),
      },
    ],
  };
}

function handleClearHistory(): { content: any[] } {
  const count = requestHistory.length;
  requestHistory = [];
  requestIdCounter = 1;

  return {
    content: [
      {
        type: 'text',
        text: `✅ Cleared ${count} request(s) from history`,
      },
    ],
  };
}

// ============ MAIN HANDLER ============

export async function handleApiTestingTool(
  toolName: string,
  args: any,
): Promise<{ content: any[] }> {
  switch (toolName) {
    case 'aegisx_auth_login':
      return handleLogin(args);

    case 'aegisx_auth_status':
      return handleStatus();

    case 'aegisx_auth_decode_jwt':
      return handleDecodeJWT(args);

    case 'aegisx_auth_logout':
      return handleLogout();

    case 'aegisx_api_request':
      return handleApiRequest(args);

    case 'aegisx_api_history':
      return handleHistory(args);

    case 'aegisx_api_clear_history':
      return handleClearHistory();

    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${toolName}`,
          },
        ],
      };
  }
}
