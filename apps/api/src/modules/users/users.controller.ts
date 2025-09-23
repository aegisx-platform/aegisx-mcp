import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service';
import { EventService } from '../../shared/websocket/event.service';
import { CrudEventHelper } from '../../shared/websocket/crud-event-helper';
import {
  ListUsersQuery,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  ChangeUserPasswordRequest,
  SelfPasswordChangeRequest,
  BulkStatusChangeRequest,
  BulkUserIdsRequest,
  BulkRoleChangeRequest,
} from './users.schemas';

export class UsersController {
  private userEvents: CrudEventHelper;
  
  constructor(
    private usersService: UsersService,
    private eventService: EventService,
  ) {
    // Create CRUD event helper for users
    this.userEvents = this.eventService.createCrudHelper('users', 'user');
  }

  async listUsers(
    request: FastifyRequest<{ Querystring: ListUsersQuery }>,
    reply: FastifyReply,
  ) {
    try {
      request.log.info({ query: request.query }, 'Listing users with query');
      const result = await this.usersService.listUsers(request.query);
      request.log.info({ resultCount: result.users.length }, 'Users retrieved');

      // Return paginated response according to standard
      return reply.paginated(
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
      );
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          query: request.query,
        },
        'Error listing users',
      );
      throw error;
    }
  }

  async getUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const user = await this.usersService.getUserById(request.params.id);
    return reply.success(user);
  }

  async createUser(
    request: FastifyRequest<{ Body: CreateUserRequest }>,
    reply: FastifyReply,
  ) {
    const user = await this.usersService.createUser(request.body);
    
    // Emit real-time event
    this.userEvents.emitCreated(user);
    
    return reply.code(201).success(user);
  }

  async updateUser(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateUserRequest;
    }>,
    reply: FastifyReply,
  ) {
    const user = await this.usersService.updateUser(
      request.params.id,
      request.body,
    );
    
    // Emit real-time event
    this.userEvents.emitUpdated(user);
    
    return reply.success(user);
  }

  async changeUserPassword(
    request: FastifyRequest<{
      Params: { id: string };
      Body: ChangeUserPasswordRequest;
    }>,
    reply: FastifyReply,
  ) {
    await this.usersService.changeUserPassword(
      request.params.id,
      request.body.newPassword,
    );
    return reply.success({
      message: 'Password changed successfully',
    });
  }

  async changeSelfPassword(
    request: FastifyRequest<{
      Body: SelfPasswordChangeRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user.id;
      await this.usersService.changeSelfPassword(
        userId,
        request.body.currentPassword,
        request.body.newPassword,
        request.body.confirmPassword,
      );
      return reply.success({
        message: 'Password changed successfully',
      });
    } catch (error) {
      request.log.error({ error }, 'Error changing user password');
      
      if (error.code === 'PASSWORD_MISMATCH') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message: 'New password and confirmation do not match',
          },
        });
      }
      
      if (error.code === 'INVALID_CURRENT_PASSWORD') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect',
          },
        });
      }
      
      if (error.code === 'SAME_PASSWORD') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'SAME_PASSWORD',
            message: 'New password must be different from current password',
          },
        });
      }
      
      if (error.code === 'USER_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        },
      });
    }
  }

  async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const currentUserId = request.user.id;
      await this.usersService.deleteUser(request.params.id, currentUserId);
      
      // Emit real-time event
      console.log('🗑️ Emitting userDeleted event for ID:', request.params.id);
      this.userEvents.emitDeleted(request.params.id);
      console.log('✅ userDeleted event emitted successfully');
      
      return reply.success({
        id: request.params.id,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('❌ Failed to delete user:', error);
      
      if (error.code === 'CANNOT_DELETE_SELF') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'Cannot delete your own account',
          },
        });
      }
      
      if (error.code === 'USER_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
        },
      });
    }
  }

  async listRoles(request: FastifyRequest, reply: FastifyReply) {
    const roles = await this.usersService.listRoles();
    return reply.success(roles);
  }

  // ===== PROFILE METHODS =====

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const profile = await this.usersService.getProfile(userId);
      return reply.success(profile);
    } catch (error) {
      request.log.error({ error }, 'Error getting user profile');
      throw error;
    }
  }

  async updateProfile(
    request: FastifyRequest<{
      Body: UpdateProfileRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user.id;
      const updatedProfile = await this.usersService.updateProfile(userId, request.body);
      return reply.success(updatedProfile);
    } catch (error) {
      request.log.error({ error }, 'Error updating user profile');
      
      if (error.code === 'USERNAME_TAKEN') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already taken',
          },
        });
      }

      if (error.code === 'PROFILE_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'Profile not found',
          },
        });
      }

      throw error;
    }
  }

  // ===== BULK OPERATIONS =====

  async bulkActivateUsers(
    request: FastifyRequest<{ Body: BulkStatusChangeRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const currentUserId = request.user.id;
      request.log.info(
        {
          userIds: request.body.userIds,
          requestedBy: currentUserId,
          operation: 'bulk_activate',
        },
        'Bulk activate users requested',
      );

      const result = await this.usersService.bulkActivateUsers(
        request.body.userIds,
        currentUserId,
      );

      request.log.info(
        {
          totalRequested: result.totalRequested,
          successCount: result.successCount,
          failureCount: result.failureCount,
          operation: 'bulk_activate',
        },
        'Bulk activate operation completed',
      );

      return reply.success(result, 'Bulk activation completed');
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          userIds: request.body.userIds,
          operation: 'bulk_activate',
        },
        'Error in bulk activate users',
      );
      throw error;
    }
  }

  async bulkDeactivateUsers(
    request: FastifyRequest<{ Body: BulkStatusChangeRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const currentUserId = request.user.id;
      request.log.info(
        {
          userIds: request.body.userIds,
          requestedBy: currentUserId,
          operation: 'bulk_deactivate',
        },
        'Bulk deactivate users requested',
      );

      const result = await this.usersService.bulkDeactivateUsers(
        request.body.userIds,
        currentUserId,
      );

      request.log.info(
        {
          totalRequested: result.totalRequested,
          successCount: result.successCount,
          failureCount: result.failureCount,
          operation: 'bulk_deactivate',
        },
        'Bulk deactivate operation completed',
      );

      return reply.success(result, 'Bulk deactivation completed');
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          userIds: request.body.userIds,
          operation: 'bulk_deactivate',
        },
        'Error in bulk deactivate users',
      );
      throw error;
    }
  }

  async bulkDeleteUsers(
    request: FastifyRequest<{ Body: BulkUserIdsRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const currentUserId = request.user.id;
      request.log.info(
        {
          userIds: request.body.userIds,
          requestedBy: currentUserId,
          operation: 'bulk_delete',
        },
        'Bulk delete users requested',
      );

      const result = await this.usersService.bulkDeleteUsers(
        request.body.userIds,
        currentUserId,
      );

      request.log.info(
        {
          totalRequested: result.totalRequested,
          successCount: result.successCount,
          failureCount: result.failureCount,
          operation: 'bulk_delete',
        },
        'Bulk delete operation completed',
      );

      return reply.success(result, 'Bulk deletion completed');
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          userIds: request.body.userIds,
          operation: 'bulk_delete',
        },
        'Error in bulk delete users',
      );
      throw error;
    }
  }

  async bulkChangeUserRoles(
    request: FastifyRequest<{ Body: BulkRoleChangeRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const currentUserId = request.user.id;
      request.log.info(
        {
          userIds: request.body.userIds,
          roleId: request.body.roleId,
          requestedBy: currentUserId,
          operation: 'bulk_role_change',
        },
        'Bulk role change requested',
      );

      const result = await this.usersService.bulkChangeUserRoles(
        request.body.userIds,
        request.body.roleId,
        currentUserId,
      );

      request.log.info(
        {
          totalRequested: result.totalRequested,
          successCount: result.successCount,
          failureCount: result.failureCount,
          roleId: request.body.roleId,
          operation: 'bulk_role_change',
        },
        'Bulk role change operation completed',
      );

      return reply.success(result, 'Bulk role change completed');
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          userIds: request.body.userIds,
          roleId: request.body.roleId,
          operation: 'bulk_role_change',
        },
        'Error in bulk role change',
      );
      throw error;
    }
  }
}
