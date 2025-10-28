import Fastify, { FastifyInstance } from 'fastify';
import * as path from 'path';
import * as fs from 'fs/promises';
import userProfilePlugin from '../user-profile.plugin';
import { UserProfile } from '../user-profile.types';

// Mock database connection
const mockKnex = {
  raw: jest.fn(),
  select: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  leftJoin: jest.fn(),
  first: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  del: jest.fn(),
  returning: jest.fn(),
  orderBy: jest.fn(),
  transaction: jest.fn(),
};

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
};

const mockProfile: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'johndoe',
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  avatar: null,
  role: {
    id: 'role-user',
    name: 'User',
    permissions: ['profile.read', 'profile.update'],
  },
  preferences: {
    theme: 'default',
    scheme: 'light',
    layout: 'classic',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    notifications: {
      email: true,
      push: false,
      desktop: true,
      sound: true,
    },
    navigation: {
      collapsed: false,
      type: 'default',
      position: 'left',
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-01T08:00:00Z',
  status: 'active',
  emailVerified: true,
  twoFactorEnabled: false,
};

describe('User Profile API Integration Tests', () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = Fastify();

    // Mock JWT authentication
    await app.register(require('@fastify/jwt'), {
      secret: 'test-secret',
    });

    // Mock knex plugin
    app.decorate('knex', mockKnex as any);

    // Mock authentication
    app.decorate('authenticate', async (request: any, reply: any) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (token === 'valid-token') {
          request.user = mockUser;
        } else {
          reply.unauthorized('Invalid token');
        }
      } catch (error) {
        reply.unauthorized('Authentication required');
      }
    });

    // Register user profile plugin
    await app.register(userProfilePlugin);

    authToken = 'valid-token';
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile successfully', async () => {
      // Mock repository methods
      mockKnex.leftJoin = jest.fn().mockReturnThis();
      mockKnex.select = jest.fn().mockReturnThis();
      mockKnex.where = jest.fn().mockReturnThis();
      mockKnex.first = jest.fn().mockResolvedValue({
        id: mockProfile.id,
        email: mockProfile.email,
        name: mockProfile.name,
        first_name: mockProfile.firstName,
        last_name: mockProfile.lastName,
        avatar_url: mockProfile.avatar,
        status: mockProfile.status,
        email_verified: mockProfile.emailVerified,
        two_factor_enabled: mockProfile.twoFactorEnabled,
        created_at: new Date(mockProfile.createdAt),
        updated_at: new Date(mockProfile.updatedAt),
        last_login_at: mockProfile.lastLoginAt
          ? new Date(mockProfile.lastLoginAt)
          : null,
        role_id: mockProfile.role.id,
        role_name: mockProfile.role.name,
        theme: mockProfile.preferences.theme,
        scheme: mockProfile.preferences.scheme,
        layout: mockProfile.preferences.layout,
        language: mockProfile.preferences.language,
        timezone: mockProfile.preferences.timezone,
        date_format: mockProfile.preferences.dateFormat,
        time_format: mockProfile.preferences.timeFormat,
        notifications_email: mockProfile.preferences.notifications?.email,
        notifications_push: mockProfile.preferences.notifications?.push,
        notifications_desktop: mockProfile.preferences.notifications?.desktop,
        notifications_sound: mockProfile.preferences.notifications?.sound,
        navigation_collapsed: mockProfile.preferences.navigation?.collapsed,
        navigation_type: mockProfile.preferences.navigation?.type,
        navigation_position: mockProfile.preferences.navigation?.position,
      });

      // Mock permissions query
      const permissionsQuery = {
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest
          .fn()
          .mockResolvedValue([
            { name: 'profile.read' },
            { name: 'profile.update' },
          ]),
      };

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/profile',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(
        expect.objectContaining({
          id: mockProfile.id,
          email: mockProfile.email,
          name: mockProfile.name,
        }),
      );
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/profile',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Mock update operations
      mockKnex.update = jest.fn().mockResolvedValue(1);
      mockKnex.where = jest.fn().mockReturnThis();

      // Mock finding updated profile
      mockKnex.leftJoin = jest.fn().mockReturnThis();
      mockKnex.select = jest.fn().mockReturnThis();
      mockKnex.first = jest.fn().mockResolvedValue({
        ...mockProfile,
        name: updateData.name,
        first_name: updateData.firstName,
        last_name: updateData.lastName,
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/profile',
        headers: {
          authorization: `Bearer ${authToken}`,
          'content-type': 'application/json',
        },
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should validate input data', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/profile',
        headers: {
          authorization: `Bearer ${authToken}`,
          'content-type': 'application/json',
        },
        payload: {
          name: '', // Empty name should fail validation
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/preferences', () => {
    it('should return user preferences', async () => {
      mockKnex.where = jest.fn().mockReturnThis();
      mockKnex.first = jest.fn().mockResolvedValue({
        user_id: mockUser.id,
        theme: 'dark',
        scheme: 'dark',
        layout: 'compact',
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
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(
        expect.objectContaining({
          theme: 'dark',
          scheme: 'dark',
          layout: 'compact',
        }),
      );
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences', async () => {
      const preferencesUpdate = {
        theme: 'dark',
        notifications: {
          email: false,
          push: true,
        },
      };

      // Mock existing preferences check
      mockKnex.where = jest.fn().mockReturnThis();
      mockKnex.first = jest
        .fn()
        .mockResolvedValueOnce({ user_id: mockUser.id }) // existing preferences
        .mockResolvedValueOnce({
          // updated preferences
          theme: 'dark',
          notifications_email: false,
          notifications_push: true,
        });

      mockKnex.update = jest.fn().mockResolvedValue(1);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
          'content-type': 'application/json',
        },
        payload: preferencesUpdate,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should validate language code format', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
          'content-type': 'application/json',
        },
        payload: {
          language: 'invalid-code', // Should be 2-letter code
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/users/avatar', () => {
    const testImagePath = path.join(__dirname, 'test-image.jpg');

    beforeAll(async () => {
      // Create a test image file
      const testImageBuffer = Buffer.from('fake-jpeg-data');
      await fs.writeFile(testImagePath, testImageBuffer);
    });

    afterAll(async () => {
      // Cleanup test image
      try {
        await fs.unlink(testImagePath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    });

    it('should handle file upload', async () => {
      // Note: This test would require more complex setup for actual file upload testing
      // In a real scenario, you'd use multipart form data and mock the file processing

      const response = await app.inject({
        method: 'POST',
        url: '/api/users/avatar',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        // File upload testing would require additional setup
      });

      // Without actual file, this should return a 400 error
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/users/avatar', () => {
    it('should handle avatar deletion when no avatar exists', async () => {
      mockKnex.where = jest.fn().mockReturnThis();
      mockKnex.orderBy = jest.fn().mockReturnThis();
      mockKnex.first = jest.fn().mockResolvedValue(null); // No avatar found

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/avatar',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
