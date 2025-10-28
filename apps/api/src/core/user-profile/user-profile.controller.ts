import { FastifyReply, FastifyRequest } from 'fastify';

// Extend FastifyRequest for @aegisx/fastify-multipart
declare module 'fastify' {
  interface FastifyRequest {
    parseMultipart(): Promise<{
      files: Array<{
        filename: string;
        mimetype: string;
        encoding: string;
        size: number;
        toBuffer(): Promise<Buffer>;
        createReadStream(): NodeJS.ReadableStream;
      }>;
      fields: Record<string, string>;
    }>;
  }
}

import { UserProfileService } from './services/user-profile.service';
import {
  UserPreferencesUpdateRequest,
  UserProfileUpdateRequest,
} from './user-profile.types';

export interface UserProfileControllerDependencies {
  userProfileService: UserProfileService;
}

export class UserProfileController {
  constructor(private deps: UserProfileControllerDependencies) {}

  async getUserProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.unauthorized('Authentication required');
      }

      const profile = await this.deps.userProfileService.getUserProfile(userId);

      if (!profile) {
        return reply.notFound('User profile not found');
      }

      return reply.success(profile, 'User profile retrieved successfully');
    } catch (error) {
      request.log.error({ error }, 'Error retrieving user profile');
      return reply.internalServerError('Failed to retrieve user profile');
    }
  }

  async updateUserProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.unauthorized('Authentication required');
      }

      const updates = request.body as UserProfileUpdateRequest;

      // Basic validation
      if (updates.name !== undefined && updates.name.trim().length === 0) {
        return reply.badRequest('Name cannot be empty');
      }

      if (
        updates.firstName !== undefined &&
        updates.firstName.trim().length === 0
      ) {
        return reply.badRequest('First name cannot be empty');
      }

      if (
        updates.lastName !== undefined &&
        updates.lastName.trim().length === 0
      ) {
        return reply.badRequest('Last name cannot be empty');
      }

      if (updates.bio !== undefined && updates.bio.length > 500) {
        return reply.badRequest('Bio cannot exceed 500 characters');
      }

      const updatedProfile =
        await this.deps.userProfileService.updateUserProfile(userId, updates);

      if (!updatedProfile) {
        return reply.notFound('User not found');
      }

      return reply.success(updatedProfile, 'User profile updated successfully');
    } catch (error) {
      request.log.error({ error }, 'Error updating user profile');

      if (error.message === 'USER_NOT_FOUND') {
        return reply.notFound('User not found');
      }

      if (error.message === 'INVALID_TIMEZONE') {
        return reply.badRequest('Invalid timezone provided');
      }

      if (error.message === 'INVALID_LANGUAGE_CODE') {
        return reply.badRequest('Invalid language code provided');
      }

      return reply.internalServerError('Failed to update user profile');
    }
  }

  async getUserPreferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.unauthorized('Authentication required');
      }

      const preferences =
        await this.deps.userProfileService.getUserPreferences(userId);

      return reply.success(
        preferences,
        'User preferences retrieved successfully',
      );
    } catch (error) {
      request.log.error({ error }, 'Error retrieving user preferences');
      return reply.internalServerError('Failed to retrieve user preferences');
    }
  }

  async updateUserPreferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.unauthorized('Authentication required');
      }

      const updates = request.body as UserPreferencesUpdateRequest;

      const updatedPreferences =
        await this.deps.userProfileService.updateUserPreferences(
          userId,
          updates,
        );

      return reply.success(
        updatedPreferences,
        'User preferences updated successfully',
      );
    } catch (error) {
      request.log.error({ error }, 'Error updating user preferences');

      if (error.message === 'INVALID_TIMEZONE') {
        return reply.badRequest('Invalid timezone provided');
      }

      if (error.message === 'INVALID_LANGUAGE_CODE') {
        return reply.badRequest('Invalid language code provided');
      }

      if (error.message === 'PREFERENCES_UPDATE_FAILED') {
        return reply.internalServerError('Failed to update preferences');
      }

      return reply.internalServerError('Failed to update user preferences');
    }
  }

  async uploadUserAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // Use @aegisx/fastify-multipart clean API
      const { files, fields } = await request.parseMultipart();

      if (!files || files.length === 0) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No avatar file provided in request',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const data = files[0]; // Get first file for avatar upload

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.code(415).send({
          success: false,
          error: {
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Only JPEG, PNG, and WebP images are supported',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // Validate file size (5MB limit)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (data.size > maxSizeInBytes) {
        return reply.code(413).send({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds maximum limit of 5MB',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // Create adapter object for backward compatibility with MultipartFile interface
      const multipartFile = {
        filename: data.filename,
        mimetype: data.mimetype,
        encoding: data.encoding,
        file: data.createReadStream(),
        toBuffer: () => data.toBuffer(),
      };

      const result = await this.deps.userProfileService.uploadUserAvatar(
        userId,
        multipartFile as any,
      );

      return reply.success(result, 'Avatar uploaded successfully');
    } catch (error) {
      request.log.error({ error }, 'Error uploading user avatar');

      if (error.message === 'UNSUPPORTED_MEDIA_TYPE') {
        return reply.code(415).send({
          success: false,
          error: {
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Only JPEG, PNG, and WebP images are supported',
          },
        });
      }

      if (error.message === 'FILE_TOO_LARGE') {
        return reply.code(413).send({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds maximum limit of 5MB',
          },
        });
      }

      return reply.internalServerError('Failed to upload avatar');
    }
  }

  async deleteUserAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.unauthorized('Authentication required');
      }

      await this.deps.userProfileService.deleteUserAvatar(userId);

      return reply.success(
        { message: 'Avatar deleted successfully' },
        'Avatar deleted successfully',
      );
    } catch (error) {
      request.log.error({ error }, 'Error deleting user avatar');

      if (error.message === 'AVATAR_NOT_FOUND') {
        return reply.notFound('No avatar found for the current user');
      }

      return reply.internalServerError('Failed to delete avatar');
    }
  }
}
