import { UserProfileService } from '../services/user-profile.service';
import { UserProfileRepository } from '../user-profile.repository';
import { AvatarService } from '../services/avatar.service';
import {
  UserProfile,
  UserPreferences,
  UserProfileUpdateRequest,
  UserPreferencesUpdateRequest,
  AvatarUploadResult,
} from '../user-profile.types';

// Mock dependencies
const mockRepository = {
  findUserWithProfileById: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  createAvatarFile: jest.fn(),
  updateUserAvatar: jest.fn(),
  getUserAvatarFile: jest.fn(),
  deleteUserAvatar: jest.fn(),
  deleteOldAvatarFiles: jest.fn(),
} as any;

const mockAvatarService = {
  processAvatarUpload: jest.fn(),
  deleteAvatarFiles: jest.fn(),
  cleanupOrphanedFiles: jest.fn(),
} as any;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('UserProfileService', () => {
  let service: UserProfileService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new UserProfileService({
      repository: mockRepository,
      avatarService: mockAvatarService,
      logger: mockLogger as any,
    });
  });

  describe('getUserProfile', () => {
    const userId = 'user-123';
    const mockProfile: UserProfile = {
      id: userId,
      email: 'test@example.com',
      username: 'johndoe',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      role: {
        id: 'role-1',
        name: 'User',
        permissions: ['read'],
      },
      preferences: {
        theme: 'default',
        language: 'en',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
    };

    it('should return user profile when found', async () => {
      mockRepository.findUserWithProfileById.mockResolvedValue(mockProfile);

      const result = await service.getUserProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(mockRepository.findUserWithProfileById).toHaveBeenCalledWith(
        userId,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId },
        'User profile retrieved successfully',
      );
    });

    it('should return null when profile not found', async () => {
      mockRepository.findUserWithProfileById.mockResolvedValue(null);

      const result = await service.getUserProfile(userId);

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { userId },
        'User profile not found',
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRepository.findUserWithProfileById.mockRejectedValue(error);

      await expect(service.getUserProfile(userId)).rejects.toThrow(
        'Database error',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        { error, userId },
        'Error retrieving user profile',
      );
    });
  });

  describe('updateUserProfile', () => {
    const userId = 'user-123';
    const updates: UserProfileUpdateRequest = {
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      preferences: {
        theme: 'dark',
      },
    };

    const mockUpdatedProfile: UserProfile = {
      id: userId,
      email: 'test@example.com',
      username: 'janedoe',
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      role: {
        id: 'role-1',
        name: 'User',
        permissions: ['read'],
      },
      preferences: {
        theme: 'dark',
        language: 'en',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
    };

    it('should update profile successfully', async () => {
      mockRepository.updateUserProfile.mockResolvedValue(true);
      mockRepository.updateUserPreferences.mockResolvedValue(true);
      mockRepository.findUserWithProfileById.mockResolvedValue(
        mockUpdatedProfile,
      );

      const result = await service.updateUserProfile(userId, updates);

      expect(result).toEqual(mockUpdatedProfile);
      expect(mockRepository.updateUserProfile).toHaveBeenCalledWith(userId, {
        name: 'Jane Doe',
        first_name: 'Jane',
        last_name: 'Doe',
      });
      expect(mockRepository.updateUserPreferences).toHaveBeenCalledWith(
        userId,
        updates.preferences,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId, updates: ['name', 'first_name', 'last_name'] },
        'User profile updated successfully',
      );
    });

    it('should throw error when user not found after update', async () => {
      mockRepository.updateUserProfile.mockResolvedValue(true);
      mockRepository.findUserWithProfileById.mockResolvedValue(null);

      await expect(service.updateUserProfile(userId, updates)).rejects.toThrow(
        'USER_NOT_FOUND',
      );
    });
  });

  describe('getUserPreferences', () => {
    const userId = 'user-123';
    const mockPreferences: UserPreferences = {
      theme: 'dark',
      scheme: 'dark',
      layout: 'compact',
      language: 'en',
      timezone: 'UTC',
    };

    it('should return user preferences when found', async () => {
      mockRepository.getUserPreferences.mockResolvedValue(mockPreferences);

      const result = await service.getUserPreferences(userId);

      expect(result).toEqual(mockPreferences);
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId },
        'User preferences retrieved successfully',
      );
    });

    it('should create and return default preferences when none exist', async () => {
      mockRepository.getUserPreferences.mockResolvedValue(null);
      mockRepository.updateUserPreferences.mockResolvedValue(true);

      const result = await service.getUserPreferences(userId);

      expect(result).toEqual(
        expect.objectContaining({
          theme: 'default',
          scheme: 'light',
          layout: 'classic',
          language: 'en',
          timezone: 'UTC',
        }),
      );
      expect(mockRepository.updateUserPreferences).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId },
        'Created default user preferences',
      );
    });
  });

  describe('updateUserPreferences', () => {
    const userId = 'user-123';
    const updates: UserPreferencesUpdateRequest = {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York',
    };

    const mockUpdatedPreferences: UserPreferences = {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York',
    };

    it('should update preferences successfully', async () => {
      mockRepository.updateUserPreferences.mockResolvedValue(true);
      mockRepository.getUserPreferences.mockResolvedValue(
        mockUpdatedPreferences,
      );

      const result = await service.updateUserPreferences(userId, updates);

      expect(result).toEqual(mockUpdatedPreferences);
      expect(mockRepository.updateUserPreferences).toHaveBeenCalledWith(
        userId,
        updates,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId, updatedFields: ['theme', 'language', 'timezone'] },
        'User preferences updated successfully',
      );
    });

    it('should validate timezone', async () => {
      const invalidUpdates = { ...updates, timezone: 'a'.repeat(101) }; // Too long, > 100 chars

      await expect(
        service.updateUserPreferences(userId, invalidUpdates),
      ).rejects.toThrow('INVALID_TIMEZONE');
    });

    it('should validate language code', async () => {
      const invalidUpdates = { ...updates, language: 'invalid' };

      await expect(
        service.updateUserPreferences(userId, invalidUpdates),
      ).rejects.toThrow('INVALID_LANGUAGE_CODE');
    });

    it('should throw error when preferences not found after update', async () => {
      mockRepository.updateUserPreferences.mockResolvedValue(true);
      mockRepository.getUserPreferences.mockResolvedValue(null);

      await expect(
        service.updateUserPreferences(userId, updates),
      ).rejects.toThrow('PREFERENCES_NOT_FOUND');
    });
  });

  describe('uploadUserAvatar', () => {
    const userId = 'user-123';
    const mockFile = {
      filename: 'avatar.jpg',
      mimetype: 'image/jpeg',
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-data')),
    } as any;

    const mockUploadResult: AvatarUploadResult = {
      avatar: '/api/uploads/avatars/user-123_avatar.jpg',
      thumbnails: {
        small: '/api/uploads/avatars/user-123_avatar_small.jpg',
        medium: '/api/uploads/avatars/user-123_avatar_medium.jpg',
        large: '/api/uploads/avatars/user-123_avatar_large.jpg',
      },
    };

    it('should upload avatar successfully', async () => {
      mockRepository.getUserAvatarFile.mockResolvedValue(null);
      mockAvatarService.processAvatarUpload.mockResolvedValue(mockUploadResult);
      mockRepository.createAvatarFile.mockResolvedValue({
        id: 'avatar-123',
        userId,
        originalFilename: 'avatar.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        storagePath: mockUploadResult.avatar,
        thumbnails: mockUploadResult.thumbnails,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRepository.updateUserAvatar.mockResolvedValue(true);

      const result = await service.uploadUserAvatar(userId, mockFile);

      expect(result).toEqual(mockUploadResult);
      expect(mockAvatarService.processAvatarUpload).toHaveBeenCalledWith(
        mockFile,
        userId,
      );
      expect(mockRepository.createAvatarFile).toHaveBeenCalled();
      expect(mockRepository.updateUserAvatar).toHaveBeenCalledWith(
        userId,
        mockUploadResult.avatar,
      );
    });

    it('should handle unsupported media type error', async () => {
      const error = new Error('UNSUPPORTED_MEDIA_TYPE');
      mockRepository.getUserAvatarFile.mockResolvedValue(null);
      mockAvatarService.processAvatarUpload.mockRejectedValue(error);

      await expect(service.uploadUserAvatar(userId, mockFile)).rejects.toThrow(
        'UNSUPPORTED_MEDIA_TYPE',
      );
    });

    it('should handle file too large error', async () => {
      const error = new Error('FILE_TOO_LARGE');
      mockRepository.getUserAvatarFile.mockResolvedValue(null);
      mockAvatarService.processAvatarUpload.mockRejectedValue(error);

      await expect(service.uploadUserAvatar(userId, mockFile)).rejects.toThrow(
        'FILE_TOO_LARGE',
      );
    });
  });

  describe('deleteUserAvatar', () => {
    const userId = 'user-123';
    const mockAvatarFile = {
      id: 'avatar-123',
      userId,
      originalFilename: 'avatar.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      storagePath: '/api/uploads/avatars/avatar.jpg',
      thumbnails: {
        small: 'small.jpg',
        medium: 'medium.jpg',
        large: 'large.jpg',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete avatar successfully', async () => {
      mockRepository.getUserAvatarFile.mockResolvedValue(mockAvatarFile);
      mockAvatarService.deleteAvatarFiles.mockResolvedValue(undefined);
      mockRepository.deleteUserAvatar.mockResolvedValue(true);

      await service.deleteUserAvatar(userId);

      expect(mockAvatarService.deleteAvatarFiles).toHaveBeenCalledWith(
        mockAvatarFile,
      );
      expect(mockRepository.deleteUserAvatar).toHaveBeenCalledWith(userId);
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId, avatarId: mockAvatarFile.id },
        'User avatar deleted successfully',
      );
    });

    it('should throw error when avatar not found', async () => {
      mockRepository.getUserAvatarFile.mockResolvedValue(null);

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        'AVATAR_NOT_FOUND',
      );
    });
  });
});
