import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions?: string[];
  emailVerified?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthHelper {
  constructor(
    private app: FastifyInstance,
    private db: Knex,
  ) {}

  /**
   * Generate a valid UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Create a test user directly in database
   */
  async createTestUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
    const defaultUser: TestUser = {
      id: userData.id || this.generateUUID(),
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      emailVerified: true,
      status: 'active',
      ...userData,
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(
      defaultUser.password,
      parseInt(process.env.BCRYPT_ROUNDS || '10'),
    );

    // Get or create role
    let roleId: string;
    const existingRole = await this.db('roles')
      .where({ name: defaultUser.role })
      .first();

    if (existingRole) {
      roleId = existingRole.id;
    } else {
      const [newRole] = await this.db('roles')
        .insert({
          id: this.generateUUID(),
          name: defaultUser.role,
          description: `${defaultUser.role} role`,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id');
      roleId = newRole.id;
    }

    // Insert user
    const [insertedUser] = await this.db('users')
      .insert({
        id: defaultUser.id,
        email: defaultUser.email,
        username: defaultUser.username,
        password: hashedPassword,
        first_name: defaultUser.firstName,
        last_name: defaultUser.lastName,
        email_verified: defaultUser.emailVerified,
        status: defaultUser.status,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning(['id', 'email', 'username', 'first_name', 'last_name']);

    // Create user-role relationship
    await this.db('user_roles').insert({
      user_id: defaultUser.id,
      role_id: roleId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create user preferences
    await this.db('user_preferences').insert({
      user_id: defaultUser.id,
      theme: 'default',
      scheme: 'light',
      layout: 'classic',
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      notifications_email: true,
      notifications_push: false,
      notifications_desktop: true,
      notifications_sound: true,
      navigation_collapsed: false,
      navigation_type: 'default',
      navigation_position: 'left',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      ...defaultUser,
      id: insertedUser.id,
    };
  }

  /**
   * Login user and get tokens
   */
  async loginUser(email: string, password: string): Promise<AuthTokens> {
    const response = await this.app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email,
        password,
      },
    });

    if (response.statusCode !== 200) {
      throw new Error(`Login failed: ${response.body}`);
    }

    const body = JSON.parse(response.body);
    return {
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
      expiresIn: body.data.expiresIn,
    };
  }

  /**
   * Create user and login in one step
   */
  async createAndLoginUser(userData: Partial<TestUser> = {}): Promise<{
    user: TestUser;
    tokens: AuthTokens;
  }> {
    const user = await this.createTestUser(userData);
    const tokens = await this.loginUser(user.email, user.password);

    return { user, tokens };
  }

  /**
   * Generate JWT token directly (for testing without login flow)
   */
  generateToken(payload: any, options?: { expiresIn?: string }): string {
    return this.app.jwt.sign(payload, {
      expiresIn: options?.expiresIn || '1h',
    });
  }

  /**
   * Create admin user with all permissions
   */
  async createAdminUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
    return this.createTestUser({
      role: 'admin',
      email: `admin${Date.now()}@example.com`,
      username: `admin${Date.now()}`,
      firstName: 'Admin',
      lastName: 'User',
      ...userData,
    });
  }

  /**
   * Create user with specific role and permissions
   */
  async createUserWithRole(
    roleName: string,
    permissions: string[] = [],
    userData: Partial<TestUser> = {},
  ): Promise<TestUser> {
    // Create role with permissions if it doesn't exist
    const existingRole = await this.db('roles')
      .where({ name: roleName })
      .first();

    let roleId: string;
    if (existingRole) {
      roleId = existingRole.id;
    } else {
      const [newRole] = await this.db('roles')
        .insert({
          id: this.generateUUID(),
          name: roleName,
          description: `${roleName} role`,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id');
      roleId = newRole.id;

      // Add permissions to role
      for (const permission of permissions) {
        // Parse permission format (e.g., "navigation.read" -> resource: "navigation", action: "read")
        const [resource, action] = permission.split('.');

        // Create permission if it doesn't exist
        let permissionRecord = await this.db('permissions')
          .where({ resource, action })
          .first();

        if (!permissionRecord) {
          const [newPermission] = await this.db('permissions')
            .insert({
              id: this.generateUUID(),
              resource: resource || permission,
              action: action || 'access',
              description: `Permission: ${permission}`,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning('*');
          permissionRecord = newPermission;
        }

        // Link role to permission
        await this.db('role_permissions')
          .insert({
            role_id: roleId,
            permission_id: permissionRecord.id,
            created_at: new Date(),
          })
          .onConflict(['role_id', 'permission_id'])
          .ignore();
      }
    }

    return this.createTestUser({
      role: roleName,
      permissions,
      ...userData,
    });
  }

  /**
   * Get authorization header with Bearer token
   */
  getBearerHeader(token: string): { authorization: string } {
    return { authorization: `Bearer ${token}` };
  }

  /**
   * Verify token validity
   */
  verifyToken(token: string): any {
    try {
      return this.app.jwt.verify(token);
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (response.statusCode !== 200) {
      throw new Error(`Token refresh failed: ${response.body}`);
    }

    const body = JSON.parse(response.body);
    return {
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
      expiresIn: body.data.expiresIn,
    };
  }

  /**
   * Logout user
   */
  async logoutUser(accessToken: string): Promise<void> {
    const response = await this.app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: this.getBearerHeader(accessToken),
    });

    if (response.statusCode !== 200) {
      throw new Error(`Logout failed: ${response.body}`);
    }
  }

  /**
   * Clean up test users
   */
  async cleanupTestUsers(): Promise<void> {
    // Since user IDs are UUIDs, we need to track test users by email or username patterns
    const testUsers = await this.db('users')
      .where('email', 'like', 'test%')
      .orWhere('username', 'like', 'test%')
      .select('id');

    if (testUsers.length > 0) {
      const userIds = testUsers.map((u) => u.id);

      // Delete in correct order due to foreign key constraints
      await this.db('user_sessions').whereIn('user_id', userIds).del();
      await this.db('user_preferences').whereIn('user_id', userIds).del();
      await this.db('users').whereIn('id', userIds).del();
    }
  }
}

/**
 * Helper function to create authenticated request headers
 */
export function authHeaders(token: string): { authorization: string } {
  return { authorization: `Bearer ${token}` };
}

/**
 * Helper function to create test user data
 */
export function createTestUserData(
  overrides: Partial<TestUser> = {},
): Partial<TestUser> {
  const timestamp = Date.now();
  return {
    email: `test${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'testpass123',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    emailVerified: true,
    status: 'active',
    ...overrides,
  };
}

/**
 * Helper function to create register request data (API schema compatible)
 */
export function createRegisterRequestData(
  overrides: Partial<{
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }> = {},
) {
  const timestamp = Date.now();
  return {
    email: `test${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'testpass123',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  };
}
