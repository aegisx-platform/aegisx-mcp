import { FastifyRequest, FastifyReply } from 'fastify';
import { UserDepartmentsService } from './user-departments.service';

/**
 * UserDepartmentsController
 *
 * Handles HTTP requests for user-department operations.
 * Provides endpoints for users to view their department assignments.
 */
export class UserDepartmentsController {
  constructor(private userDepartmentsService: UserDepartmentsService) {}

  /**
   * Get all active departments for the current user
   *
   * GET /users/me/departments
   *
   * Returns all currently valid department assignments for the authenticated user.
   */
  async getMyDepartments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).userId;

      const departments =
        await this.userDepartmentsService.getUserDepartments(userId);

      return reply.success({
        departments,
        count: departments.length,
      });
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          userId: (request.user as any)?.userId,
        },
        'Error fetching user departments',
      );
      throw error;
    }
  }

  /**
   * Get primary department for the current user
   *
   * GET /users/me/departments/primary
   *
   * Returns the user's primary department with full details.
   */
  async getMyPrimaryDepartment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).userId;

      const primaryDepartment =
        await this.userDepartmentsService.getUserPrimaryDepartment(userId);

      if (!primaryDepartment) {
        return reply.notFound(
          'No primary department assigned. Please contact your administrator.',
        );
      }

      return reply.success(primaryDepartment);
    } catch (error) {
      request.log.error(
        {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          userId: (request.user as any)?.userId,
        },
        'Error fetching primary department',
      );
      throw error;
    }
  }
}
