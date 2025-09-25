import bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import {
  UserCreateData,
  UserUpdateData,
  UserListOptions,
  UserWithRole,
  BulkOperationResult,
} from './users.types';
import { AppError } from '../../core/errors/app-error';

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async listUsers(options: UserListOptions): Promise<{
    users: UserWithRole[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { users, total } = await this.usersRepository.findAll(options);
    const { page = 1, limit = 10 } = options;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<UserWithRole> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async createUser(data: UserCreateData): Promise<UserWithRole> {
    // Check if email already exists
    const existingEmailUser = await this.usersRepository.findByEmail(
      data.email,
    );
    if (existingEmailUser) {
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    }

    // Check if username already exists
    const existingUsernameUser = await this.usersRepository.findByUsername(
      data.username,
    );
    if (existingUsernameUser) {
      throw new AppError('Username already exists', 409, 'USERNAME_EXISTS');
    }

    // Determine roleId - either from roleId field or by converting role name
    let roleId = data.roleId;
    if (!roleId && data.role) {
      const roles = await this.usersRepository.getRoles();
      const role = roles.find((r) => r.name === data.role);
      if (role) {
        roleId = role.id;
      } else {
        throw new AppError('Invalid role', 400, 'INVALID_ROLE');
      }
    }
    
    // If still no roleId, use default 'user' role
    if (!roleId) {
      const roles = await this.usersRepository.getRoles();
      const defaultRole = roles.find((r) => r.name === 'user');
      if (defaultRole) {
        roleId = defaultRole.id;
      } else {
        throw new AppError('Default user role not found', 500, 'DEFAULT_ROLE_NOT_FOUND');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.usersRepository.create({
      ...data,
      roleId,
      password: hashedPassword,
    });

    return user;
  }

  async updateUser(id: string, data: UserUpdateData): Promise<UserWithRole> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if email is being changed and already exists
    if (data.email && data.email !== existingUser.email) {
      const emailUser = await this.usersRepository.findByEmail(data.email);
      if (emailUser) {
        throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
      }
    }

    // Check if username is being changed and already exists
    if (data.username && data.username !== existingUser.username) {
      const usernameUser = await this.usersRepository.findByUsername(
        data.username,
      );
      if (usernameUser) {
        throw new AppError('Username already exists', 409, 'USERNAME_EXISTS');
      }
    }

    // Update user
    const updatedUser = await this.usersRepository.update(id, data);

    if (!updatedUser) {
      throw new AppError('Failed to update user', 500, 'UPDATE_FAILED');
    }

    return updatedUser;
  }

  async changeUserPassword(id: string, newPassword: string): Promise<void> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const success = await this.usersRepository.updatePassword(
      id,
      hashedPassword,
    );

    if (!success) {
      throw new AppError('Failed to update password', 500, 'UPDATE_FAILED');
    }
  }

  async changeSelfPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new AppError(
        'New password and confirmation do not match',
        400,
        'PASSWORD_MISMATCH',
      );
    }

    // Get user with password hash
    const user = await this.usersRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Current password is incorrect',
        400,
        'INVALID_CURRENT_PASSWORD',
      );
    }

    // Ensure new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError(
        'New password must be different from current password',
        400,
        'SAME_PASSWORD',
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const success = await this.usersRepository.updatePassword(
      userId,
      hashedNewPassword,
    );

    if (!success) {
      throw new AppError('Failed to update password', 500, 'UPDATE_FAILED');
    }

    // TODO: Invalidate all user sessions except current one
    // This would require session management implementation
  }

  async deleteUser(id: string, currentUserId: string): Promise<void> {
    // Prevent user from deleting themselves
    if (id === currentUserId) {
      throw new AppError(
        'Cannot delete your own account',
        400,
        'CANNOT_DELETE_SELF',
      );
    }

    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Delete user
    const success = await this.usersRepository.delete(id);

    if (!success) {
      throw new AppError('Failed to delete user', 500, 'DELETE_FAILED');
    }
  }

  // Profile-specific methods
  async getProfile(userId: string): Promise<any> {
    const profile = await this.usersRepository.findProfileById(userId);
    if (!profile) {
      throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }
    return profile;
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
  }): Promise<any> {
    // Check if username is taken (if username is being changed)
    if (data.username) {
      const existingUser = await this.usersRepository.findByUsername(data.username);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Username is already taken', 400, 'USERNAME_TAKEN');
      }
    }

    const updatedProfile = await this.usersRepository.updateProfile(userId, data);
    if (!updatedProfile) {
      throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return updatedProfile;
  }

  async listRoles() {
    return this.usersRepository.getRoles();
  }

  /**
   * Bulk activate users with proper error handling and business rules
   */
  async bulkActivateUsers(
    userIds: string[],
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    return this.executeBulkOperation(userIds, currentUserId, 'activate', {
      validateCurrentState: (user) => !user.isActive,
      stateErrorCode: 'USER_ALREADY_ACTIVE',
      stateErrorMessage: 'User is already active',
      operation: async (userId) => {
        await this.usersRepository.update(userId, { isActive: true });
      },
    });
  }

  /**
   * Bulk deactivate users with proper error handling and business rules
   */
  async bulkDeactivateUsers(
    userIds: string[],
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    return this.executeBulkOperation(userIds, currentUserId, 'deactivate', {
      validateCurrentState: (user) => user.isActive,
      stateErrorCode: 'USER_ALREADY_INACTIVE',
      stateErrorMessage: 'User is already inactive',
      operation: async (userId) => {
        await this.usersRepository.update(userId, { isActive: false });
      },
    });
  }

  /**
   * Bulk delete users (soft delete) with proper error handling and business rules
   */
  async bulkDeleteUsers(
    userIds: string[],
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    return this.executeBulkOperation(userIds, currentUserId, 'delete', {
      validateCurrentState: () => true, // Always allow if other validations pass
      stateErrorCode: '',
      stateErrorMessage: '',
      operation: async (userId) => {
        await this.usersRepository.delete(userId);
      },
    });
  }

  /**
   * Bulk change user roles with proper error handling and business rules
   */
  async bulkChangeUserRoles(
    userIds: string[],
    roleId: string,
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    // Validate role exists first
    const roles = await this.usersRepository.getRoles();
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) {
      throw new AppError('Target role not found', 400, 'ROLE_NOT_FOUND');
    }

    return this.executeBulkOperation(userIds, currentUserId, 'role-change', {
      validateCurrentState: (user) => user.roleId !== roleId,
      stateErrorCode: 'USER_ALREADY_HAS_ROLE',
      stateErrorMessage: `User already has role: ${targetRole.name}`,
      operation: async (userId) => {
        await this.usersRepository.update(userId, { roleId });
      },
    });
  }

  /**
   * Generic bulk operation executor with business rule validation
   */
  private async executeBulkOperation(
    userIds: string[],
    currentUserId: string,
    operationType: 'activate' | 'deactivate' | 'delete' | 'role-change',
    options: {
      validateCurrentState: (user: UserWithRole) => boolean;
      stateErrorCode: string;
      stateErrorMessage: string;
      operation: (userId: string) => Promise<void>;
    },
  ): Promise<BulkOperationResult> {
    const results: BulkOperationResult['results'] = [];
    let successCount = 0;
    let failureCount = 0;

    // Remove duplicates and validate input
    const uniqueUserIds = [...new Set(userIds)];

    for (const userId of uniqueUserIds) {
      try {
        // Check if user exists
        const user = await this.usersRepository.findById(userId);
        if (!user) {
          results.push({
            userId,
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          });
          failureCount++;
          continue;
        }

        // Business rule: Cannot modify own account (for deactivate/delete)
        if (
          (operationType === 'deactivate' || operationType === 'delete') &&
          userId === currentUserId
        ) {
          results.push({
            userId,
            success: false,
            error: {
              code:
                operationType === 'delete'
                  ? 'CANNOT_DELETE_SELF'
                  : 'CANNOT_DEACTIVATE_SELF',
              message:
                operationType === 'delete'
                  ? 'Cannot delete your own account'
                  : 'Cannot deactivate your own account',
            },
          });
          failureCount++;
          continue;
        }

        // Business rule: Validate current state
        if (!options.validateCurrentState(user)) {
          results.push({
            userId,
            success: false,
            error: {
              code: options.stateErrorCode,
              message: options.stateErrorMessage,
            },
          });
          failureCount++;
          continue;
        }

        // Execute the operation
        await options.operation(userId);

        results.push({
          userId,
          success: true,
        });
        successCount++;
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: {
            code: 'OPERATION_FAILED',
            message:
              error instanceof Error ? error.message : 'Unknown error occurred',
          },
        });
        failureCount++;
      }
    }

    return {
      totalRequested: uniqueUserIds.length,
      successCount,
      failureCount,
      results,
      summary: {
        message: `Bulk ${operationType} completed with ${successCount} successes and ${failureCount} failures`,
        hasFailures: failureCount > 0,
      },
    };
  }

  // Password verification for account deletion
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.usersRepository.findByIdWithPasswordForVerification(userId);
    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password);
  }

  // Soft delete account
  async softDeleteAccount(userId: string, metadata: {
    reason?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{
    deletedAt: string;
    recoveryDeadline: string;
  }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.deleted_at) {
      throw new AppError('Account is already marked for deletion', 409, 'ACCOUNT_ALREADY_DELETED');
    }

    const now = new Date();
    const recoveryDeadline = new Date(now);
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 30); // 30 days recovery period

    const updateData = {
      deleted_at: now,
      recovery_deadline: recoveryDeadline,
      deletion_reason: metadata.reason || null,
      deleted_by_ip: metadata.ip || null,
      deleted_by_user_agent: metadata.userAgent || null,
    };

    const success = await this.usersRepository.updateUserDeletionData(userId, updateData);
    
    if (!success) {
      throw new AppError('Failed to delete account', 500, 'DELETE_FAILED');
    }

    return {
      deletedAt: now.toISOString(),
      recoveryDeadline: recoveryDeadline.toISOString(),
    };
  }

  // Get user by ID (including deleted users) - overloaded method
  async getUserByIdIncludeDeleted(userId: string, includeDeleted: boolean = false): Promise<UserWithRole | null> {
    if (includeDeleted) {
      return this.usersRepository.findByIdIncludeDeleted(userId);
    }
    return this.usersRepository.findById(userId);
  }
}
