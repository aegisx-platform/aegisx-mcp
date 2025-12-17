import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import {
  Profile,
  UpdateProfile,
  ChangePasswordResponse,
} from '../schemas/profile.schemas';
import { ProfileRepository } from '../repositories/profile.repository';

/**
 * ProfileService
 *
 * Service layer for user profile management, providing business logic and validation
 * for profile operations including department validation.
 *
 * Features:
 * - Get user profile
 * - Update user profile with validation
 * - Validate department existence
 * - Error handling with appropriate HTTP status codes
 */
export class ProfileService {
  private repository: ProfileRepository;

  constructor(private knex: Knex) {
    this.repository = new ProfileRepository(knex);
  }

  /**
   * Get user profile
   *
   * Retrieves a user's profile information by ID.
   *
   * @param userId - User ID (UUID)
   * @returns Profile object
   * @throws Error with code 'PROFILE_NOT_FOUND' (404) if user not found
   */
  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.repository.getProfile(userId);

    if (!profile) {
      const error = new Error('User profile not found');
      (error as any).statusCode = 404;
      (error as any).code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    return profile;
  }

  /**
   * Update user profile
   *
   * Updates user profile with validation of required fields.
   *
   * @param userId - User ID (UUID)
   * @param data - Partial profile data to update
   * @returns Updated profile object
   * @throws Error with code 'PROFILE_NOT_FOUND' (404) if user not found
   */
  async updateProfile(
    userId: string,
    data: Partial<UpdateProfile>,
  ): Promise<Profile> {
    // Validate that user exists first
    const existingProfile = await this.repository.getProfile(userId);
    if (!existingProfile) {
      const error = new Error('User profile not found');
      (error as any).statusCode = 404;
      (error as any).code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    // Update profile
    const updatedProfile = await this.repository.updateProfile(userId, data);

    if (!updatedProfile) {
      const error = new Error('Failed to update user profile');
      (error as any).statusCode = 500;
      (error as any).code = 'UPDATE_FAILED';
      throw error;
    }

    return updatedProfile;
  }

  /**
   * Change user password
   *
   * Changes a user's password with validation and bcrypt hashing.
   * Validates current password, checks new password confirmation, and securely updates the password.
   *
   * @param userId - User ID (UUID)
   * @param currentPassword - Current password for verification
   * @param newPassword - New password (minimum 8 characters)
   * @param confirmPassword - Confirmation of new password
   * @returns ChangePasswordResponse with success message and timestamp
   * @throws Error with code 'PROFILE_NOT_FOUND' (404) if user not found
   * @throws Error with code 'INVALID_CURRENT_PASSWORD' (400) if current password is incorrect
   * @throws Error with code 'PASSWORDS_DO_NOT_MATCH' (422) if new passwords don't match
   * @throws Error with code 'PASSWORD_UPDATE_FAILED' (500) if database update fails
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<ChangePasswordResponse> {
    // 1. Validate passwords match
    if (newPassword !== confirmPassword) {
      const error = new Error('New password and confirmation do not match');
      (error as any).statusCode = 422;
      (error as any).code = 'PASSWORDS_DO_NOT_MATCH';
      throw error;
    }

    // 2. Fetch user with password hash
    const user = await this.repository.getUserWithPassword(userId);
    if (!user) {
      const error = new Error('User profile not found');
      (error as any).statusCode = 404;
      (error as any).code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    // 3. Verify current password with bcrypt
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      const error = new Error('Current password is incorrect');
      (error as any).statusCode = 400;
      (error as any).code = 'INVALID_CURRENT_PASSWORD';
      throw error;
    }

    // 4. Hash new password with bcrypt (salt rounds = 12)
    const newHash = await bcrypt.hash(newPassword, 12);

    // 5. Update database
    const updateSuccess = await this.repository.updatePassword(userId, newHash);
    if (!updateSuccess) {
      const error = new Error('Failed to update password');
      (error as any).statusCode = 500;
      (error as any).code = 'PASSWORD_UPDATE_FAILED';
      throw error;
    }

    // 6. Return success response
    return {
      success: true,
      data: {
        message: 'Password changed successfully',
        changedAt: new Date().toISOString(),
      },
    };
  }
}
