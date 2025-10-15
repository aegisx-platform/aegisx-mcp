import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from '../../core/users/users.service';
import { UserActivityService } from './user-activity.service';
import { ACTIVITY_ACTIONS } from './user-activity.schemas';
import {
  DeleteAccountRequest,
  DeleteAccountResponse,
} from './delete-account.schemas';

export class DeleteAccountController {
  constructor(
    private usersService: UsersService,
    private activityService: UserActivityService,
  ) {}

  async deleteAccount(
    request: FastifyRequest<{ Body: DeleteAccountRequest }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { confirmation, password, reason } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          statusCode: 401,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
        },
      });
    }

    try {
      // 1. Validate confirmation text
      if (confirmation !== 'DELETE') {
        await this.activityService.logActivity(
          userId,
          ACTIVITY_ACTIONS.ACCOUNT_DELETE_FAILED,
          'Account deletion failed: Invalid confirmation text',
          request,
          {
            severity: 'warning',
            metadata: { reason: 'invalid_confirmation' },
          },
        );

        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_CONFIRMATION',
            message: 'Confirmation text must be exactly "DELETE"',
            statusCode: 400,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId: request.id,
          },
        });
      }

      // 2. Verify current password
      const isPasswordValid = await this.usersService.verifyPassword(
        userId,
        password,
      );
      if (!isPasswordValid) {
        await this.activityService.logActivity(
          userId,
          ACTIVITY_ACTIONS.ACCOUNT_DELETE_FAILED,
          'Account deletion failed: Incorrect password',
          request,
          {
            severity: 'warning',
            metadata: { reason: 'incorrect_password' },
          },
        );

        return reply.status(401).send({
          success: false,
          error: {
            code: 'INCORRECT_PASSWORD',
            message: 'Current password is incorrect',
            statusCode: 401,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId: request.id,
          },
        });
      }

      // 3. Check if account is already deleted
      const user = await this.usersService.getUserByIdIncludeDeleted(
        userId,
        true,
      );
      if (!user) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            statusCode: 404,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId: request.id,
          },
        });
      }

      if (user.deleted_at) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'ACCOUNT_ALREADY_DELETED',
            message: 'Account is already marked for deletion',
            statusCode: 409,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId: request.id,
          },
        });
      }

      // 4. Perform soft delete
      const deletionResult = await this.usersService.softDeleteAccount(userId, {
        reason,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      // 5. Log the successful activity
      await this.activityService.logActivity(
        userId,
        ACTIVITY_ACTIONS.ACCOUNT_DELETE,
        `Account marked for deletion${reason ? ` - Reason: ${reason}` : ''}`,
        request,
        {
          severity: 'warning',
          metadata: {
            reason,
            recoveryDeadline: deletionResult.recoveryDeadline,
          },
        },
      );

      // 6. Return success response
      const response: DeleteAccountResponse = {
        success: true,
        data: {
          message: 'Account has been marked for deletion',
          deletedAt: deletionResult.deletedAt,
          recoveryPeriod: '30 days',
          recoveryDeadline: deletionResult.recoveryDeadline,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
        },
      };

      return reply.status(200).send(response);
    } catch (error: any) {
      request.log.error(`Account deletion failed: ${error.message}`);

      // Log the failed activity
      try {
        await this.activityService.logActivity(
          userId,
          ACTIVITY_ACTIONS.ACCOUNT_DELETE_FAILED,
          `Account deletion failed: ${error.message}`,
          request,
          {
            severity: 'error',
            metadata: {
              error: error.message,
              reason: 'internal_error',
            },
          },
        );
      } catch (logError) {
        request.log.error(
          `Failed to log activity: ${(logError as Error).message}`,
        );
      }

      // Handle specific known errors
      if (error.code === 'USER_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            statusCode: 404,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId: request.id,
          },
        });
      }

      if (error.code === 'ACCOUNT_ALREADY_DELETED') {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'ACCOUNT_ALREADY_DELETED',
            message: 'Account is already marked for deletion',
            statusCode: 409,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId: request.id,
          },
        });
      }

      // Generic server error
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          statusCode: 500,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
        },
      });
    }
  }
}
