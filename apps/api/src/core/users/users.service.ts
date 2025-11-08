import bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import {
  UserCreateData,
  UserUpdateData,
  UserListOptions,
  UserWithRole,
  UserRole,
  BulkOperationResult,
} from './users.types';
import { AppError } from '../../core/errors/app-error';

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * Helper method to populate user roles array for a single user
   * Fetches all active roles assigned to the user
   */
  private async populateUserRoles(user: UserWithRole): Promise<UserWithRole> {
    try {
      const roles = await this.usersRepository.getUserRoles(user.id);
      return {
        ...user,
        roles: roles,
        primaryRole: roles.length > 0 ? roles[0] : undefined,
      };
    } catch (error) {
      // If role population fails, return user with empty roles array
      return {
        ...user,
        roles: [],
        primaryRole: undefined,
      };
    }
  }

  /**
   * Helper method to populate user roles for multiple users
   */
  private async populateUsersRoles(
    users: UserWithRole[],
  ): Promise<UserWithRole[]> {
    return Promise.all(users.map((user) => this.populateUserRoles(user)));
  }

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

    // Populate roles for all users
    const usersWithRoles = await this.populateUsersRoles(users);

    return {
      users: usersWithRoles,
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

    // Populate user roles
    return this.populateUserRoles(user);
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
        throw new AppError(
          'Default user role not found',
          500,
          'DEFAULT_ROLE_NOT_FOUND',
        );
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

    // Populate user roles
    return this.populateUserRoles(user);
  }

  async updateUser(
    id: string,
    data: UserUpdateData,
    currentUserId?: string,
  ): Promise<UserWithRole> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Security: Prevent user from changing their own status or role
    if (currentUserId && id === currentUserId) {
      if (data.status !== undefined) {
        throw new AppError(
          'Cannot change your own account status',
          403,
          'CANNOT_CHANGE_OWN_STATUS',
        );
      }
      if (data.roleId !== undefined) {
        throw new AppError(
          'Cannot change your own role',
          403,
          'CANNOT_CHANGE_OWN_ROLE',
        );
      }
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

    // Populate user roles
    return this.populateUserRoles(updatedUser);
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

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
    },
  ): Promise<any> {
    // Check if username is taken (if username is being changed)
    if (data.username) {
      const existingUser = await this.usersRepository.findByUsername(
        data.username,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Username is already taken', 400, 'USERNAME_TAKEN');
      }
    }

    const updatedProfile = await this.usersRepository.updateProfile(
      userId,
      data,
    );
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
      validateCurrentState: (user) => user.status !== 'active',
      stateErrorCode: 'USER_ALREADY_ACTIVE',
      stateErrorMessage: 'User is already active',
      operation: async (userId) => {
        await this.usersRepository.update(userId, { status: 'active' });
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
      validateCurrentState: (user) => user.status === 'active',
      stateErrorCode: 'USER_ALREADY_INACTIVE',
      stateErrorMessage: 'User is already inactive',
      operation: async (userId) => {
        await this.usersRepository.update(userId, { status: 'inactive' });
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
   * Now supports assigning multiple roles to each user
   */
  async bulkChangeUserRoles(
    userIds: string[],
    roleIds: string[],
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    // Validate all roles exist first
    const roles = await this.usersRepository.getRoles();
    const targetRoles: Array<{ id: string; name: string }> = [];

    for (const roleId of roleIds) {
      const targetRole = roles.find((r) => r.id === roleId);
      if (!targetRole) {
        throw new AppError(
          `Target role with ID ${roleId} not found`,
          400,
          'ROLE_NOT_FOUND',
        );
      }
      targetRoles.push(targetRole);
    }

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

        // Business rule: Check if self-modification is allowed for this operation
        if (userId === currentUserId) {
          results.push({
            userId,
            success: false,
            error: {
              code: 'CANNOT_CHANGE_OWN_ROLE',
              message: 'Cannot change your own roles',
            },
          });
          failureCount++;
          continue;
        }

        // Replace all roles for the user using the replaceRoles method
        // This removes ALL existing roles and assigns ONLY the specified roles
        // Semantics: bulk role change should be a "replace" operation, not "add"
        await this.usersRepository.replaceRoles(userId, roleIds);

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
        message: `Bulk role change completed with ${successCount} successes and ${failureCount} failures`,
        hasFailures: failureCount > 0,
      },
    };
  }

  /**
   * Bulk change user status with proper error handling and business rules
   */
  async bulkChangeUserStatus(
    userIds: string[],
    targetStatus: 'active' | 'inactive' | 'suspended' | 'pending',
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    return this.executeBulkOperation(userIds, currentUserId, 'status-change', {
      validateCurrentState: (user) => user.status !== targetStatus,
      stateErrorCode: 'USER_ALREADY_HAS_STATUS',
      stateErrorMessage: `User already has status: ${targetStatus}`,
      operation: async (userId) => {
        await this.usersRepository.update(userId, { status: targetStatus });
      },
      // Special handling: prevent deactivation of self, but allow other status changes
      allowSelfModification: (user, userId, currentUser) => {
        // Allow self-modification only if NOT changing to 'inactive'
        return targetStatus !== 'inactive';
      },
    });
  }

  /**
   * Generic bulk operation executor with business rule validation
   */
  private async executeBulkOperation(
    userIds: string[],
    currentUserId: string,
    operationType:
      | 'activate'
      | 'deactivate'
      | 'delete'
      | 'role-change'
      | 'status-change',
    options: {
      validateCurrentState: (user: UserWithRole) => boolean;
      stateErrorCode: string;
      stateErrorMessage: string;
      operation: (userId: string) => Promise<void>;
      allowSelfModification?: (
        user: UserWithRole,
        userId: string,
        currentUserId: string,
      ) => boolean;
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

        // Business rule: Check if self-modification is allowed for this operation
        if (userId === currentUserId) {
          // For some operations, self-modification is never allowed
          if (
            operationType === 'deactivate' ||
            operationType === 'delete' ||
            operationType === 'role-change'
          ) {
            results.push({
              userId,
              success: false,
              error: {
                code:
                  operationType === 'delete'
                    ? 'CANNOT_DELETE_SELF'
                    : operationType === 'deactivate'
                      ? 'CANNOT_DEACTIVATE_SELF'
                      : 'CANNOT_CHANGE_OWN_ROLE',
                message:
                  operationType === 'delete'
                    ? 'Cannot delete your own account'
                    : operationType === 'deactivate'
                      ? 'Cannot deactivate your own account'
                      : 'Cannot change your own role',
              },
            });
            failureCount++;
            continue;
          }

          // For status-change, check if the specific status change is allowed for self
          if (
            operationType === 'status-change' &&
            options.allowSelfModification &&
            !options.allowSelfModification(user, userId, currentUserId)
          ) {
            results.push({
              userId,
              success: false,
              error: {
                code: 'CANNOT_CHANGE_OWN_STATUS',
                message: 'Cannot change your own account to this status',
              },
            });
            failureCount++;
            continue;
          }
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
    const user =
      await this.usersRepository.findByIdWithPasswordForVerification(userId);
    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password);
  }

  // Soft delete account
  async softDeleteAccount(
    userId: string,
    metadata: {
      reason?: string;
      ip?: string;
      userAgent?: string;
    },
  ): Promise<{
    deletedAt: string;
    recoveryDeadline: string;
  }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.deleted_at) {
      throw new AppError(
        'Account is already marked for deletion',
        409,
        'ACCOUNT_ALREADY_DELETED',
      );
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

    const success = await this.usersRepository.updateUserDeletionData(
      userId,
      updateData,
    );

    if (!success) {
      throw new AppError('Failed to delete account', 500, 'DELETE_FAILED');
    }

    return {
      deletedAt: now.toISOString(),
      recoveryDeadline: recoveryDeadline.toISOString(),
    };
  }

  // Get user by ID (including deleted users) - overloaded method
  async getUserByIdIncludeDeleted(
    userId: string,
    includeDeleted: boolean = false,
  ): Promise<UserWithRole | null> {
    if (includeDeleted) {
      return this.usersRepository.findByIdIncludeDeleted(userId);
    }
    return this.usersRepository.findById(userId);
  }

  async getDropdownOptions(options: any = {}): Promise<{
    options: Array<{
      value: string;
      label: string;
      disabled?: boolean;
    }>;
    total: number;
  }> {
    const { limit = 100, search, active = true, exclude = [] } = options;

    // Build query for active users
    const query: any = {
      limit,
      sortBy: 'first_name',
      sortOrder: 'asc',
    };

    if (search) {
      query.search = search;
    }

    if (active) {
      query.status = 'active';
    }

    const result = await this.usersRepository.findAll(query);

    // Transform to dropdown format
    const dropdownOptions = result.users
      .filter((user) => !exclude.includes(user.id))
      .map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName} (${user.email})`,
        disabled: (user as any).status !== 'active',
      }));

    return {
      options: dropdownOptions,
      total: result.total,
    };
  }

  // ===== MULTI-ROLE MANAGEMENT METHODS =====

  /**
   * Get all roles assigned to a user
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return this.usersRepository.getUserRoles(userId);
  }

  /**
   * Assign one or more roles to a user
   */
  async assignRolesToUser(
    userId: string,
    roleIds: string[],
    assignedBy?: string,
    expiresAt?: Date,
  ): Promise<{ message: string; userId: string }> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Validate roles exist
    const allRoles = await this.usersRepository.getRoles();
    for (const roleId of roleIds) {
      if (!allRoles.find((r) => r.id === roleId)) {
        throw new AppError(
          `Role with ID ${roleId} not found`,
          400,
          'ROLE_NOT_FOUND',
        );
      }
    }

    // Assign roles (deduplication handled at repository level)
    await this.usersRepository.assignRoles(
      userId,
      roleIds,
      assignedBy,
      expiresAt,
    );

    // Return success message with userId as per schema
    return {
      message: `Successfully assigned ${roleIds.length} role(s) to user`,
      userId,
    };
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
  ): Promise<UserWithRole> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Remove role
    await this.usersRepository.removeRole(userId, roleId);

    // Return updated user with populated roles
    const updatedUser = await this.usersRepository.findById(userId);
    if (!updatedUser) {
      throw new AppError('Failed to fetch updated user', 500, 'UPDATE_FAILED');
    }

    return this.populateUserRoles(updatedUser);
  }

  /**
   * Update role expiration date for a user
   */
  async updateRoleExpiry(
    userId: string,
    roleId: string,
    expiresAt?: Date,
  ): Promise<UserWithRole> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Update role expiry
    await this.usersRepository.updateRoleExpiry(userId, roleId, expiresAt);

    // Return updated user with populated roles
    const updatedUser = await this.usersRepository.findById(userId);
    if (!updatedUser) {
      throw new AppError('Failed to fetch updated user', 500, 'UPDATE_FAILED');
    }

    return this.populateUserRoles(updatedUser);
  }
}
