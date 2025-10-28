import { FastifyInstance } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { UserProfileRepository } from '../user-profile.repository';
import { AvatarService } from './avatar.service';
import {
  UserProfile,
  UserPreferences,
  UserProfileUpdateRequest,
  UserPreferencesUpdateRequest,
  AvatarUploadResult
} from '../user-profile.types';

export interface UserProfileServiceDependencies {
  repository: UserProfileRepository;
  avatarService: AvatarService;
  logger: FastifyInstance['log'];
}

export class UserProfileService {
  constructor(private deps: UserProfileServiceDependencies) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profile = await this.deps.repository.findUserWithProfileById(userId);
      
      if (!profile) {
        this.deps.logger.warn({ userId }, 'User profile not found');
        return null;
      }

      this.deps.logger.info({ userId }, 'User profile retrieved successfully');
      return profile;
    } catch (error) {
      this.deps.logger.error({ error, userId }, 'Error retrieving user profile');
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: UserProfileUpdateRequest): Promise<UserProfile | null> {
    try {
      // Prepare database updates
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) {
        dbUpdates.name = updates.name.trim();
      }
      
      if (updates.firstName !== undefined) {
        dbUpdates.first_name = updates.firstName.trim();
      }
      
      if (updates.lastName !== undefined) {
        dbUpdates.last_name = updates.lastName.trim();
      }
      
      if (updates.bio !== undefined) {
        dbUpdates.bio = updates.bio.trim() || null;
      }

      // Update user basic info if provided
      if (Object.keys(dbUpdates).length > 0) {
        await this.deps.repository.updateUserProfile(userId, dbUpdates);
      }

      // Update preferences if provided
      if (updates.preferences) {
        await this.deps.repository.updateUserPreferences(userId, updates.preferences);
      }

      // Get updated profile
      const updatedProfile = await this.deps.repository.findUserWithProfileById(userId);
      
      if (!updatedProfile) {
        throw new Error('USER_NOT_FOUND');
      }

      this.deps.logger.info({ userId, updates: Object.keys(dbUpdates) }, 'User profile updated successfully');
      return updatedProfile;
    } catch (error) {
      this.deps.logger.error({ error, userId }, 'Error updating user profile');
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const preferences = await this.deps.repository.getUserPreferences(userId);
      
      if (!preferences) {
        // Return default preferences if none exist
        const defaultPreferences: UserPreferences = {
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
            sound: true
          },
          navigation: {
            collapsed: false,
            type: 'default',
            position: 'left'
          }
        };

        // Create default preferences in database
        await this.deps.repository.updateUserPreferences(userId, defaultPreferences);
        
        this.deps.logger.info({ userId }, 'Created default user preferences');
        return defaultPreferences;
      }

      this.deps.logger.info({ userId }, 'User preferences retrieved successfully');
      return preferences;
    } catch (error) {
      this.deps.logger.error({ error, userId }, 'Error retrieving user preferences');
      throw error;
    }
  }

  async updateUserPreferences(userId: string, updates: UserPreferencesUpdateRequest): Promise<UserPreferences> {
    try {
      // Validate timezone if provided
      if (updates.timezone) {
        this.validateTimezone(updates.timezone);
      }

      // Validate language if provided
      if (updates.language) {
        this.validateLanguage(updates.language);
      }

      const updated = await this.deps.repository.updateUserPreferences(userId, updates);
      
      if (!updated) {
        throw new Error('PREFERENCES_UPDATE_FAILED');
      }

      // Get updated preferences
      const preferences = await this.deps.repository.getUserPreferences(userId);
      
      if (!preferences) {
        throw new Error('PREFERENCES_NOT_FOUND');
      }

      this.deps.logger.info({ 
        userId, 
        updatedFields: Object.keys(updates)
      }, 'User preferences updated successfully');
      
      return preferences;
    } catch (error) {
      this.deps.logger.error({ error, userId }, 'Error updating user preferences');
      throw error;
    }
  }

  async uploadUserAvatar(userId: string, file: MultipartFile): Promise<AvatarUploadResult> {
    try {
      // Delete existing avatar files first
      const existingAvatar = await this.deps.repository.getUserAvatarFile(userId);
      if (existingAvatar) {
        await this.deps.avatarService.deleteAvatarFiles(existingAvatar);
        await this.deps.repository.deleteOldAvatarFiles(userId);
      }

      // Process new avatar
      const result = await this.deps.avatarService.processAvatarUpload(file, userId);

      // Save avatar metadata to database
      const avatarData = {
        userId,
        originalFilename: file.filename || 'avatar',
        mimeType: file.mimetype,
        fileSize: (await file.toBuffer()).length,
        storagePath: result.avatar,
        thumbnails: result.thumbnails
      };

      const avatarFile = await this.deps.repository.createAvatarFile(avatarData);

      // Update user's avatar URL
      await this.deps.repository.updateUserAvatar(userId, result.avatar);

      this.deps.logger.info({ 
        userId, 
        originalFilename: file.filename,
        avatarId: avatarFile.id
      }, 'User avatar uploaded successfully');

      return result;
    } catch (error) {
      this.deps.logger.error({ error, userId }, 'Error uploading user avatar');
      
      // Map specific errors to user-friendly messages
      if (error.message === 'UNSUPPORTED_MEDIA_TYPE') {
        throw new Error('UNSUPPORTED_MEDIA_TYPE');
      }
      if (error.message === 'FILE_TOO_LARGE') {
        throw new Error('FILE_TOO_LARGE');
      }
      
      throw error;
    }
  }

  async deleteUserAvatar(userId: string): Promise<void> {
    try {
      const existingAvatar = await this.deps.repository.getUserAvatarFile(userId);
      
      if (!existingAvatar) {
        throw new Error('AVATAR_NOT_FOUND');
      }

      // Delete physical files
      await this.deps.avatarService.deleteAvatarFiles(existingAvatar);

      // Delete from database
      await this.deps.repository.deleteUserAvatar(userId);

      this.deps.logger.info({ 
        userId,
        avatarId: existingAvatar.id
      }, 'User avatar deleted successfully');
    } catch (error) {
      this.deps.logger.error({ error, userId }, 'Error deleting user avatar');
      throw error;
    }
  }

  private validateTimezone(timezone: string): void {
    // Basic timezone validation
    // In a real application, you might want to validate against a list of valid timezones
    if (timezone.length === 0 || timezone.length > 100) {
      throw new Error('INVALID_TIMEZONE');
    }
  }

  private validateLanguage(language: string): void {
    // Validate ISO 639-1 language code format
    if (!/^[a-z]{2}$/.test(language)) {
      throw new Error('INVALID_LANGUAGE_CODE');
    }
  }
}