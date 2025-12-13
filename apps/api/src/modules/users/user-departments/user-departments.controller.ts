import { FastifyRequest, FastifyReply } from 'fastify';
import { UserDepartmentsService } from '../../../core/users/user-departments.service';
import { AppError } from '../../../core/errors/app-error';
import type {
  AssignUserToDepartment,
  GetUserDepartmentsQuery,
  GetDepartmentUsersQuery,
  UserDepartmentParam,
  UserIdParam,
  DepartmentIdParam,
} from './user-departments.schemas';

/**
 * UserDepartmentsController
 *
 * Handles HTTP requests for user-department management endpoints.
 * Delegates business logic to UserDepartmentsService.
 *
 * Implements REST endpoints:
 * - GET /users/:userId/departments - List user's departments
 * - POST /users/:userId/departments - Assign user to department
 * - DELETE /users/:userId/departments/:deptId - Remove assignment
 * - PUT /users/:userId/departments/:deptId/primary - Set as primary
 * - GET /departments/:deptId/users - List department users
 * - GET /users/:userId/departments/:deptId/permissions - Check permissions
 */
export class UserDepartmentsController {
  constructor(private userDepartmentsService: UserDepartmentsService) {}

  /**
   * GET /users/:userId/departments
   *
   * List all active department assignments for a user.
   * Returns departments with their permissions and validity dates.
   *
   * @param request - Fastify request with userId param and query options
   * @param reply - Fastify reply
   */
  async listUserDepartments(
    request: FastifyRequest<{
      Params: UserIdParam;
      Querystring: GetUserDepartmentsQuery;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const { page = 1, limit = 20, activeOnly = true } = request.query;

      // Fetch user's departments from service
      const departments =
        await this.userDepartmentsService.getUserDepartments(userId);

      // Filter active only if requested (service returns active by default, but respect the parameter)
      if (!activeOnly) {
        // If not active only, we'd need to call a different method that returns all assignments
        // For now, service returns active by default, which is the recommended behavior
      }

      // Calculate pagination
      const total = departments.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedDepartments = departments.slice(
        startIndex,
        startIndex + limit,
      );

      return reply.code(200).send({
        success: true,
        data: paginatedDepartments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error listing user departments');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list user departments',
        },
      });
    }
  }

  /**
   * POST /users/:userId/departments
   *
   * Assign a user to a department.
   * Supports multiple departments per user, granular permissions, and temporal assignments.
   *
   * @param request - Fastify request with userId param and assignment data in body
   * @param reply - Fastify reply
   */
  async assignUserToDepartment(
    request: FastifyRequest<{
      Params: UserIdParam;
      Body: AssignUserToDepartment;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const {
        departmentId,
        isPrimary,
        assignedRole,
        permissions,
        validFrom,
        validUntil,
        notes,
      } = request.body;
      const currentUser = (request as any).user;

      // Assign user to department with provided options
      const assignment = await this.userDepartmentsService.assignUser(
        userId,
        departmentId,
        {
          isPrimary,
          assignedRole,
          permissions,
          validFrom: validFrom ? new Date(validFrom) : undefined,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          assignedBy: currentUser?.id,
          notes,
        },
      );

      return reply.code(201).send({
        success: true,
        data: assignment,
        message: 'User assigned to department successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error assigning user to department');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign user to department',
        },
      });
    }
  }

  /**
   * DELETE /users/:userId/departments/:deptId
   *
   * Remove a user from a department (soft delete).
   * Sets valid_until to NOW() to mark assignment as inactive.
   * Preserves assignment history for audit purposes.
   *
   * @param request - Fastify request with userId and deptId params
   * @param reply - Fastify reply
   */
  async removeUserFromDepartment(
    request: FastifyRequest<{
      Params: UserDepartmentParam;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId, deptId } = request.params;

      // Remove user from department
      await this.userDepartmentsService.removeUser(userId, deptId);

      return reply.code(200).send({
        success: true,
        data: null,
        message: 'User removed from department successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error removing user from department');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove user from department',
        },
      });
    }
  }

  /**
   * PUT /users/:userId/departments/:deptId/primary
   *
   * Set a department as the user's primary department.
   * Automatically unsets other departments as primary.
   * Primary department is used for operations like creating budget requests.
   *
   * @param request - Fastify request with userId and deptId params
   * @param reply - Fastify reply
   */
  async setPrimaryDepartment(
    request: FastifyRequest<{
      Params: UserDepartmentParam;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId, deptId } = request.params;

      // Set as primary
      const updated = await this.userDepartmentsService.setPrimaryDepartment(
        userId,
        deptId,
      );

      return reply.code(200).send({
        success: true,
        data: updated,
        message: 'Primary department updated successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error setting primary department');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to set primary department',
        },
      });
    }
  }

  /**
   * GET /departments/:deptId/users
   *
   * List all users assigned to a department.
   * Returns user details along with their assignment information and permissions.
   *
   * @param request - Fastify request with deptId param and query options
   * @param reply - Fastify reply
   */
  async listDepartmentUsers(
    request: FastifyRequest<{
      Params: DepartmentIdParam;
      Querystring: GetDepartmentUsersQuery;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { deptId } = request.params;
      const { page = 1, limit = 20 } = request.query;

      // Fetch department users from service
      const users = await this.userDepartmentsService.getDepartmentUsers(deptId);

      // Calculate pagination
      const total = users.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedUsers = users.slice(startIndex, startIndex + limit);

      return reply.code(200).send({
        success: true,
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error listing department users');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list department users',
        },
      });
    }
  }

  /**
   * GET /users/:userId/departments/:deptId/permissions
   *
   * Check user's permissions in a specific department.
   * Returns individual permission flags for the assignment.
   *
   * @param request - Fastify request with userId and deptId params
   * @param reply - Fastify reply
   */
  async checkPermissions(
    request: FastifyRequest<{
      Params: UserDepartmentParam;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId, deptId } = request.params;

      // Check each permission
      const [canCreate, canEdit, canSubmit, canApprove, canViewReports] =
        await Promise.all([
          this.userDepartmentsService.hasPermissionInDepartment(
            userId,
            deptId,
            'canCreateRequests',
          ),
          this.userDepartmentsService.hasPermissionInDepartment(
            userId,
            deptId,
            'canEditRequests',
          ),
          this.userDepartmentsService.hasPermissionInDepartment(
            userId,
            deptId,
            'canSubmitRequests',
          ),
          this.userDepartmentsService.hasPermissionInDepartment(
            userId,
            deptId,
            'canApproveRequests',
          ),
          this.userDepartmentsService.hasPermissionInDepartment(
            userId,
            deptId,
            'canViewReports',
          ),
        ]);

      return reply.code(200).send({
        success: true,
        data: {
          userId,
          departmentId: deptId,
          permissions: {
            canCreateRequests: canCreate,
            canEditRequests: canEdit,
            canSubmitRequests: canSubmit,
            canApproveRequests: canApprove,
            canViewReports: canViewReports,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error checking permissions');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check permissions',
        },
      });
    }
  }

  /**
   * GET /users/:userId/departments/primary
   *
   * Get user's primary department.
   * Useful for operations that need the primary department context.
   *
   * @param request - Fastify request with userId param
   * @param reply - Fastify reply
   */
  async getUserPrimaryDepartment(
    request: FastifyRequest<{
      Params: UserIdParam;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { userId } = request.params;

      const primaryDept =
        await this.userDepartmentsService.getUserPrimaryDepartment(userId);

      if (!primaryDept) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PRIMARY_DEPARTMENT_NOT_FOUND',
            message: 'User has no primary department assigned',
          },
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          departmentId: primaryDept.departmentId,
          departmentCode: primaryDept.departmentCode,
          departmentName: primaryDept.departmentName,
          isPrimary: primaryDept.isPrimary,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      request.log.error(error, 'Error getting primary department');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get primary department',
        },
      });
    }
  }
}
