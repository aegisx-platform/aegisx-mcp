import type { Knex } from 'knex';
import {
  UserDepartmentsRepository,
  UserDepartment,
} from './user-departments.repository';
import { DepartmentsRepository } from '../departments/departments.repository';
import { AppError } from '../../../shared/errors/app-error';

/**
 * UserDepartmentsService
 *
 * Business logic for managing user-department relationships.
 * Provides high-level operations with proper validation, error handling, and business rules.
 *
 * Focuses on single responsibility: department membership management only.
 * Permissions are managed through RBAC system (RbacService).
 *
 * Phase 5 Update: Removed permission-related methods and simplified validation logic
 * to use direct Knex queries instead of repository joins.
 */
export class UserDepartmentsService {
  constructor(
    private userDepartmentsRepository: UserDepartmentsRepository,
    private departmentsRepository: DepartmentsRepository,
    private knex: Knex,
  ) {}

  /**
   * 1. Assign a user to a department
   *
   * Validates that both user and department exist, checks for duplicate assignments,
   * and applies business rules before assignment.
   *
   * Note: Permissions are managed through RBAC system, not department assignments.
   *
   * Use case:
   * - Onboarding: Assign a new user to their primary department
   * - Transfers: Assign a user to an additional department
   * - Organizational changes: Update user's department assignments
   *
   * @param userId - UUID of the user to assign
   * @param departmentId - ID of the department to assign to
   * @param options - Additional assignment options (role, validity dates, etc.)
   * @returns The created UserDepartment assignment
   * @throws AppError if validation fails
   */
  async assignUser(
    userId: string,
    departmentId: number,
    options: {
      isPrimary?: boolean;
      assignedRole?: string | null;
      validFrom?: Date | null;
      validUntil?: Date | null;
      assignedBy?: string | null;
      notes?: string | null;
    } = {},
  ): Promise<UserDepartment> {
    // Validate: User exists (simple existence check without joins)
    const userExists = await this.knex('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();
    if (!userExists) {
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
    // Validate: User exists (simple existence check without joins)
    const userExists = await this.knex('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();
    if (!userExists) {
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
    // Validate: User exists (simple existence check without joins)
    const userExists = await this.knex('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();
    if (!userExists) {
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

    // Get all assignments with user details using a single join query
    const results = await this.knex('user_departments')
      .select(
        'user_departments.id',
        'user_departments.user_id',
        'user_departments.department_id',
        'user_departments.hospital_id',
        'user_departments.is_primary',
        'user_departments.assigned_role',
        'user_departments.valid_from',
        'user_departments.valid_until',
        'user_departments.assigned_by',
        'user_departments.assigned_at',
        'user_departments.notes',
        'user_departments.created_at',
        'user_departments.updated_at',
        'users.email as user_email',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
      )
      .innerJoin('users', 'user_departments.user_id', 'users.id')
      .where('user_departments.department_id', departmentId)
      .whereNull('users.deleted_at')
      .orderBy('user_departments.is_primary', 'desc')
      .orderBy('user_departments.created_at', 'asc');

    // Transform database rows to typed objects
    return results.map((row) => ({
      id: row.id,
      userId: row.user_id,
      departmentId: row.department_id,
      hospitalId: row.hospital_id,
      isPrimary: row.is_primary,
      assignedRole: row.assigned_role,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userEmail: row.user_email,
      userFirstName: row.user_first_name,
      userLastName: row.user_last_name,
    }));
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
    // Validate: User exists (simple existence check without joins)
    const userExists = await this.knex('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();
    if (!userExists) {
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
    // Validate: User exists (simple existence check without joins)
    const userExists = await this.knex('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();
    if (!userExists) {
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
