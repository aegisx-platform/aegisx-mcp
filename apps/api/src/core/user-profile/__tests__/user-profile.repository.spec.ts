import { UserProfileRepository } from '../user-profile.repository';
import {
  UserPreferencesUpdateRequest,
  DatabaseUser,
} from '../user-profile.types';

// Mock Knex instance
const mockKnexChain = {
  leftJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  whereNot: jest.fn().mockReturnThis(),
  first: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn(),
  del: jest.fn(),
  returning: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  transaction: jest.fn(),
  raw: jest.fn(),
};

// Mock knex function that returns the chain
const mockKnex = jest.fn().mockReturnValue(mockKnexChain) as any;
// Add transaction method directly to mockKnex
mockKnex.transaction = jest.fn();

describe('UserProfileRepository', () => {
  let repository: UserProfileRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserProfileRepository(mockKnex);
  });

  describe('findUserWithProfileById', () => {
    const userId = 'user-123';
    const mockDbResult = {
      id: userId,
      email: 'test@example.com',
      name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      avatar_url: null,
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      last_login_at: new Date('2024-01-01'),
      role_id: 'role-1',
      role_name: 'User',
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
    };

    it('should return user profile when found', async () => {
      // Setup first query for user data
      mockKnexChain.first.mockResolvedValue(mockDbResult);

      // Create a separate mock for permissions query
      const permissionsQuery = jest.fn().mockReturnValue({
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest
          .fn()
          .mockResolvedValue([
            { name: 'users.view' },
            { name: 'users.update' },
          ]),
      });

      // Mock the knex function call for permissions
      mockKnex.mockImplementation((table) => {
        if (table === 'role_permissions') {
          return permissionsQuery();
        }
        return mockKnexChain;
      });

      const result = await repository.findUserWithProfileById(userId);

      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          email: 'test@example.com',
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          status: 'active',
          emailVerified: true,
          twoFactorEnabled: false,
        }),
      );
    });

    it('should return null when user not found', async () => {
      mockKnexChain.first.mockResolvedValue(null);

      const result = await repository.findUserWithProfileById(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    const userId = 'user-123';
    const updates: Partial<DatabaseUser> = {
      first_name: 'Jane',
      last_name: 'Doe',
      name: 'Jane Doe',
    };

    it('should update user profile successfully', async () => {
      mockKnexChain.update.mockResolvedValue(1);

      const result = await repository.updateUserProfile(userId, updates);

      expect(result).toBe(true);
      expect(mockKnexChain.where).toHaveBeenCalledWith('id', userId);
      expect(mockKnexChain.where).toHaveBeenCalledWith('deleted_at', null);
      expect(mockKnexChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updated_at: expect.any(Date),
        }),
      );
    });

    it('should return false when no rows updated', async () => {
      mockKnexChain.update.mockResolvedValue(0);

      const result = await repository.updateUserProfile(userId, updates);

      expect(result).toBe(false);
    });
  });

  describe('getUserPreferences', () => {
    const userId = 'user-123';
    const mockPreferences = {
      user_id: userId,
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
    };

    it('should return user preferences when found', async () => {
      mockKnexChain.first.mockResolvedValue(mockPreferences);

      const result = await repository.getUserPreferences(userId);

      expect(result).toEqual({
        theme: 'dark',
        scheme: 'dark',
        layout: 'compact',
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
      });
      expect(mockKnexChain.where).toHaveBeenCalledWith('user_id', userId);
    });

    it('should return null when preferences not found', async () => {
      mockKnexChain.first.mockResolvedValue(null);

      const result = await repository.getUserPreferences(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    const userId = 'user-123';
    const updates: UserPreferencesUpdateRequest = {
      theme: 'dark',
      notifications: {
        email: false,
        push: true,
      },
      navigation: {
        collapsed: true,
      },
    };

    it('should create new preferences when none exist', async () => {
      mockKnexChain.first.mockResolvedValue(null); // No existing preferences
      mockKnexChain.insert.mockReturnThis();
      mockKnexChain.returning = jest
        .fn()
        .mockResolvedValue([{ id: 'pref-123' }]);

      const result = await repository.updateUserPreferences(userId, updates);

      expect(result).toBe(true);
      expect(mockKnexChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          theme: 'dark',
          notifications_email: false,
          notifications_push: true,
          navigation_collapsed: true,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      );
    });

    it('should update existing preferences', async () => {
      mockKnexChain.first.mockResolvedValue({ user_id: userId }); // Existing preferences
      mockKnexChain.update.mockResolvedValue(1);

      const result = await repository.updateUserPreferences(userId, updates);

      expect(result).toBe(true);
      expect(mockKnexChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
          notifications_email: false,
          notifications_push: true,
          navigation_collapsed: true,
          updated_at: expect.any(Date),
        }),
      );
    });
  });

  describe('createAvatarFile', () => {
    const avatarData = {
      userId: 'user-123',
      originalFilename: 'avatar.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      storagePath: '/uploads/avatar.jpg',
      thumbnails: {
        small: 'small.jpg',
        medium: 'medium.jpg',
        large: 'large.jpg',
      },
    };

    it('should create avatar file record', async () => {
      const mockDbResult = {
        id: 'avatar-123',
        user_id: avatarData.userId,
        original_filename: avatarData.originalFilename,
        mime_type: avatarData.mimeType,
        file_size: avatarData.fileSize,
        storage_path: avatarData.storagePath,
        thumbnails: JSON.stringify(avatarData.thumbnails),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockKnexChain.returning.mockResolvedValue([mockDbResult]);

      const result = await repository.createAvatarFile(avatarData);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'avatar-123',
          userId: avatarData.userId,
          originalFilename: avatarData.originalFilename,
          mimeType: avatarData.mimeType,
          fileSize: avatarData.fileSize,
          storagePath: avatarData.storagePath,
          thumbnails: avatarData.thumbnails,
        }),
      );

      expect(mockKnexChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: avatarData.userId,
          original_filename: avatarData.originalFilename,
          mime_type: avatarData.mimeType,
          file_size: avatarData.fileSize,
          storage_path: avatarData.storagePath,
          thumbnails: JSON.stringify(avatarData.thumbnails),
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      );
    });
  });

  describe('deleteUserAvatar', () => {
    const userId = 'user-123';

    it('should delete avatar files and update user record in transaction', async () => {
      const mockTrxChain = {
        del: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue(1),
        where: jest.fn().mockReturnThis(),
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      // Mock trx as a function that returns the chain
      const mockTrx = jest.fn().mockReturnValue(mockTrxChain) as any;
      // Add commit and rollback methods directly to mockTrx
      mockTrx.commit = jest.fn();
      mockTrx.rollback = jest.fn();

      mockKnex.transaction.mockImplementation(async (callback) => {
        // If no callback is provided, return the transaction object directly
        if (!callback) {
          return mockTrx;
        }
        return callback(mockTrx);
      });

      const result = await repository.deleteUserAvatar(userId);

      expect(result).toBe(true);
      expect(mockTrxChain.del).toHaveBeenCalled();
      expect(mockTrxChain.update).toHaveBeenCalledWith({
        avatar_url: null,
        updated_at: expect.any(Date),
      });
      expect(mockTrx.commit).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const mockTrxChain = {
        del: jest.fn().mockRejectedValue(new Error('Database error')),
        where: jest.fn().mockReturnThis(),
        update: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      // Mock trx as a function that returns the chain
      const mockTrx = jest.fn().mockReturnValue(mockTrxChain) as any;
      // Add commit and rollback methods directly to mockTrx
      mockTrx.commit = jest.fn();
      mockTrx.rollback = jest.fn();

      mockKnex.transaction.mockImplementation(async (callback) => {
        // If no callback is provided, return the transaction object directly
        if (!callback) {
          return mockTrx;
        }
        return callback(mockTrx);
      });

      await expect(repository.deleteUserAvatar(userId)).rejects.toThrow(
        'Database error',
      );
      expect(mockTrx.rollback).toHaveBeenCalled();
    });
  });

  describe('updateUserAvatar', () => {
    const userId = 'user-123';
    const avatarUrl = 'http://example.com/avatar.jpg';

    it('should update user avatar URL', async () => {
      mockKnexChain.update.mockResolvedValue(1);

      const result = await repository.updateUserAvatar(userId, avatarUrl);

      expect(result).toBe(true);
      expect(mockKnexChain.where).toHaveBeenCalledWith('id', userId);
      expect(mockKnexChain.where).toHaveBeenCalledWith('deleted_at', null);
      expect(mockKnexChain.update).toHaveBeenCalledWith({
        avatar_url: avatarUrl,
        updated_at: expect.any(Date),
      });
    });

    it('should return false when no rows updated', async () => {
      mockKnexChain.update.mockResolvedValue(0);

      const result = await repository.updateUserAvatar(userId, avatarUrl);

      expect(result).toBe(false);
    });
  });
});
