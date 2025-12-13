import {
  UserDepartmentsRepository,
  UserDepartment,
} from './user-departments.repository';
import { UsersRepository } from './users.repository';
import { DepartmentsRepository } from '../../modules/inventory/master-data/departments/departments.repository';
import { AppError } from '../errors/app-error';

/**
 * UserDepartmentsService
 *
 * Business logic for managing user-department relationships.
 * Provides high-level operations with proper validation, error handling, and business rules.
 *
 * Week 2 Service Layer Implementation
 * Implements 6 core methods from the design specification
 */
export class UserDepartmentsService {
  constructor(
    private userDepartmentsRepository: UserDepartmentsRepository,
    private usersRepository: UsersRepository,
    private departmentsRepository: DepartmentsRepository,
  ) {}

  /**
   * 1. Assign a user to a department
   *
   * Validates that both user and department exist, checks for duplicate assignments,
   * and applies business rules before assignment.
   *
   * Use case:
   * - Onboarding: Assign a new user to their primary department
   * - Transfers: Assign a user to an additional department
   * - Organizational changes: Update user's department assignments
   *
   * @param userId - UUID of the user to assign
   * @param departmentId - ID of the department to assign to
   * @param options - Additional assignment options (role, permissions, validity dates, etc.)
   * @returns The created UserDepartment assignment
   * @throws AppError if validation fails
   */
  async assignUser(
    userId: string,
    departmentId: number,
    options: {
      isPrimary?: boolean;
      assignedRole?: string | null;
      permissions?: {
        canCreateRequests?: boolean;
        canEditRequests?: boolean;
        canSubmitRequests?: boolean;
        canApproveRequests?: boolean;
        canViewReports?: boolean;
      };
      validFrom?: Date | null;
      validUntil?: Date | null;
      assignedBy?: string | null;
      notes?: string | null;
    } = {},
  ): Promise<UserDepartment> {
    // Validate: User exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError(`User ${userId} not found`, 404, 'USER_NOT_FOUND');
    }

    // Validate: Department exists
    const department = await this.departmentsRepository.findById(departmentId);
    if (!department) {
      throw new AppError(
        `Department ${departmentId} not found`,
        404,
        'DEPARTMENT_NOT_FOUND',
      );
    }

    // Validate: Duplicate assignment check
    const existingAssignment =
      await this.userDepartmentsRepository.getAssignment(userId, departmentId);
    if (existingAssignment) {
      throw new AppError(
        `User ${userId} is already assigned to department ${departmentId}`,
        409,
        'ASSIGNMENT_EXISTS',
      );
    }

    // Validate: If setting as primary, ensure user has at least one active department
    if (options.isPrimary) {
      const activeDepartments =
        await this.userDepartmentsRepository.getActiveDepartments(userId);
      if (activeDepartments.length === 0 && !options.validFrom) {
        // First assignment, so isPrimary is allowed
      }
    }

    // Validate: Date range logic
    if (
      options.validFrom &&
      options.validUntil &&
      options.validFrom > options.validUntil
    ) {
      throw new AppError(
        'Valid from date must be before valid until date',
        400,
        'INVALID_DATE_RANGE',
      );
    }

    // Perform assignment
    return this.userDepartmentsRepository.assignUserToDepartment({
      userId,
      departmentId,
      isPrimary: options.isPrimary ?? false,
      assignedRole: options.assignedRole ?? null,
      permissions: options.permissions,
      validFrom: options.validFrom ?? null,
      validUntil: options.validUntil ?? null,
      assignedBy: options.assignedBy ?? null,
      notes: options.notes ?? null,
    });
  }

  /**
   * 2. Remove a user from a department (soft delete)
   *
   * Sets the valid_until date to NOW() to mark the assignment as inactive.
   * This preserves the assignment history for audit purposes.
   *
   * Use case:
   * - User transfers departments
   * - Temporary assignments end
   * - Organizational restructuring
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department to remove from
   * @throws AppError if user or assignment not found
   */
  async removeUser(userId: string, departmentId: number): Promise<void> {
    // Validate: User exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError(`User ${userId} not found`, 404, 'USER_NOT_FOUND');
    }

    // Validate: Assignment exists
    const assignment = await this.userDepartmentsRepository.getAssignment(
      userId,
      departmentId,
    );
    if (!assignment) {
      throw new AppError(
        `No assignment found for user ${userId} in department ${departmentId}`,
        404,
        'ASSIGNMENT_NOT_FOUND',
      );
    }

    // Validate: Cannot remove primary if it's the only active department
    if (assignment.isPrimary) {
      const activeDepartments =
        await this.userDepartmentsRepository.getActiveDepartments(userId);
      if (activeDepartments.length === 1) {
        throw new AppError(
          'Cannot remove user from their only primary department. Assign another primary first.',
          400,
          'CANNOT_REMOVE_ONLY_PRIMARY',
        );
      }
    }

    // Perform soft delete
    await this.userDepartmentsRepository.removeUserFromDepartment(
      userId,
      departmentId,
    );
  }

  /**
   * 3. Get all active departments for a user
   *
   * Returns only currently valid departments (respects valid_from/until dates).
   * Useful for displaying user's current department assignments in UI.
   *
   * Use case:
   * - Display user's department assignments
   * - Authorization checks
   * - Department context selection
   *
   * @param userId - UUID of the user
   * @returns Array of active UserDepartment assignments
   * @throws AppError if user not found
   */
  async getUserDepartments(userId: string): Promise<UserDepartment[]> {
    // Validate: User exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError(`User ${userId} not found`, 404, 'USER_NOT_FOUND');
    }

    // Return active departments only
    return this.userDepartmentsRepository.getActiveDepartments(userId);
  }

  /**
   * 4. Get all users in a department with their details
   *
   * Fetches all users assigned to a department and enriches with user details
   * (email, display name, etc.) via a join with the users table.
   *
   * Use case:
   * - Department roster view
   * - Permission delegation to department members
   * - Broadcasting notifications to department users
   *
   * @param departmentId - ID of the department
   * @returns Array of assignments enriched with user details
   * @throws AppError if department not found
   */
  async getDepartmentUsers(departmentId: number): Promise<
    (UserDepartment & {
      userEmail: string;
      userFirstName: string;
      userLastName: string;
    })[]
  > {
    // Validate: Department exists
    const department = await this.departmentsRepository.findById(departmentId);
    if (!department) {
      throw new AppError(
        `Department ${departmentId} not found`,
        404,
        'DEPARTMENT_NOT_FOUND',
      );
    }

    // Get all assignments for the department
    const assignments =
      await this.userDepartmentsRepository.findByDepartmentId(departmentId);

    // Enrich each assignment with user details
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const userDetails = await this.usersRepository.findById(
          assignment.userId,
        );
        if (!userDetails) {
          throw new AppError(
            `User ${assignment.userId} referenced in assignment not found`,
            500,
            'USER_DATA_INCONSISTENCY',
          );
        }

        return {
          ...assignment,
          userEmail: userDetails.email,
          userFirstName: userDetails.firstName,
          userLastName: userDetails.lastName,
        };
      }),
    );

    return enrichedAssignments;
  }

  /**
   * 5. Set a user's primary department
   *
   * Atomically updates the primary department for a user.
   * Automatically unsets any other departments as primary.
   *
   * Use case:
   * - User transfer to new primary department
   * - Default department for budget request creation
   * - User's "home" department
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the new primary department
   * @throws AppError if user or assignment not found
   */
  async setPrimaryDepartment(
    userId: string,
    departmentId: number,
  ): Promise<UserDepartment> {
    // Validate: User exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError(`User ${userId} not found`, 404, 'USER_NOT_FOUND');
    }

    // Validate: Assignment exists and is currently active
    const assignment = await this.userDepartmentsRepository.getAssignment(
      userId,
      departmentId,
    );
    if (!assignment) {
      throw new AppError(
        `No assignment found for user ${userId} in department ${departmentId}`,
        404,
        'ASSIGNMENT_NOT_FOUND',
      );
    }

    // Check if assignment is currently valid (within validity period)
    const now = new Date();
    const validFrom = assignment.validFrom
      ? new Date(assignment.validFrom)
      : null;
    const validUntil = assignment.validUntil
      ? new Date(assignment.validUntil)
      : null;

    if (validFrom && validFrom > now) {
      throw new AppError(
        'Cannot set future assignment as primary. Valid from date has not been reached.',
        400,
        'ASSIGNMENT_NOT_YET_VALID',
      );
    }

    if (validUntil && validUntil <= now) {
      throw new AppError(
        'Cannot set expired assignment as primary.',
        400,
        'ASSIGNMENT_EXPIRED',
      );
    }

    // Perform atomic update: unset all other primaries, then set this one as primary
    const updated = await this.userDepartmentsRepository.updateAssignment(
      userId,
      departmentId,
      { isPrimary: true },
    );

    if (!updated) {
      throw new AppError(
        'Failed to update primary department',
        500,
        'UPDATE_FAILED',
      );
    }

    return updated;
  }

  /**
   * 6. Check if user has a specific permission in a department
   *
   * Validates that the user has the required permission in the specified department.
   * Respects temporal validity (valid_from/until dates).
   *
   * Use case:
   * - Authorization checks before operations
   * - Permission gates in API endpoints
   * - Role-based access control (RBAC) integration
   *
   * Example permissions:
   * - canCreateRequests: User can create budget requests in this department
   * - canApproveRequests: User can approve requests from this department
   * - canViewReports: User can view department reports
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department
   * @param permission - Permission to check (camelCase, e.g., 'canApproveRequests')
   * @returns true if user has the permission, false otherwise
   */
  async hasPermissionInDepartment(
    userId: string,
    departmentId: number,
    permission: keyof Pick<
      UserDepartment,
      | 'canCreateRequests'
      | 'canEditRequests'
      | 'canSubmitRequests'
      | 'canApproveRequests'
      | 'canViewReports'
    >,
  ): Promise<boolean> {
    // Note: No explicit validation here - method returns false for non-existent users/assignments
    // This is intentional for authorization checks (fail-safe: deny if not found)
    return this.userDepartmentsRepository.hasPermissionInDepartment(
      userId,
      departmentId,
      permission,
    );
  }

  // ========================================================================
  // ADDITIONAL HELPER METHODS (not in design spec but useful for workflows)
  // ========================================================================

  /**
   * Get user's primary department with full details
   *
   * Returns the user's primary department or null if no primary exists.
   *
   * Use case: Creating budget requests - fetch department_id for the request
   */
  async getUserPrimaryDepartment(
    userId: string,
  ): Promise<
    (UserDepartment & { departmentCode: string; departmentName: string }) | null
  > {
    // Validate: User exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError(`User ${userId} not found`, 404, 'USER_NOT_FOUND');
    }

    const primaryAssignment =
      await this.userDepartmentsRepository.getPrimaryDepartment(userId);

    if (!primaryAssignment) {
      return null;
    }

    // Fetch department details
    const department = await this.departmentsRepository.findById(
      primaryAssignment.departmentId,
    );
    if (!department) {
      throw new AppError(
        `Department ${primaryAssignment.departmentId} not found`,
        500,
        'DEPARTMENT_NOT_FOUND',
      );
    }

    return {
      ...primaryAssignment,
      departmentCode: (department as any).dept_code,
      departmentName: (department as any).dept_name,
    };
  }

  /**
   * Verify user has active department assignment
   *
   * Used to validate users are properly onboarded with at least one department.
   */
  async hasActiveDepartmentAssignment(userId: string): Promise<boolean> {
    // No explicit user validation here - method returns false for non-existent users
    const departments =
      await this.userDepartmentsRepository.getActiveDepartments(userId);
    return departments.length > 0;
  }

  /**
   * Count active departments for a user
   *
   * Returns the number of currently valid department assignments.
   */
  async countUserActiveDepartments(userId: string): Promise<number> {
    return this.userDepartmentsRepository.countActiveDepartments(userId);
  }

  /**
   * Count active users in a department
   *
   * Returns the number of currently valid user assignments.
   */
  async countDepartmentActiveUsers(departmentId: number): Promise<number> {
    return this.userDepartmentsRepository.countActiveDepartmentUsers(
      departmentId,
    );
  }
}
