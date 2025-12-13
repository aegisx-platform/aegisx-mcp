import type { Knex } from 'knex';

/**
 * UserDepartment Entity
 *
 * Represents a user's assignment to a department with permissions and temporal validity.
 * Supports multi-department users, granular permissions per department, and soft deletes.
 */
export interface UserDepartment {
  id: string;
  userId: string;
  departmentId: number;
  hospitalId: number | null;
  isPrimary: boolean;
  assignedRole: string | null;
  canCreateRequests: boolean;
  canEditRequests: boolean;
  canSubmitRequests: boolean;
  canApproveRequests: boolean;
  canViewReports: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  assignedBy: string | null;
  assignedAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data structure for assigning a user to a department
 */
export interface AssignUserToDepartmentData {
  userId: string;
  departmentId: number;
  hospitalId?: number | null;
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
}

/**
 * UserDepartmentsRepository
 *
 * Manages user-department relationships with support for:
 * - Multi-department users
 * - Temporal assignments (valid_from/until)
 * - Granular permissions per department
 * - Soft deletes via valid_until date
 * - Audit trail (assigned_by, assigned_at)
 *
 * Week 1 Database Layer Implementation
 */
export class UserDepartmentsRepository {
  constructor(private db: Knex) {}

  /**
   * Find all department assignments for a specific user
   *
   * Returns all assignments (including expired/inactive ones).
   * Use getActiveDepartments() to get only currently valid assignments.
   *
   * @param userId - UUID of the user
   * @returns Array of UserDepartment records, ordered by primary first, then creation date
   */
  async findByUserId(userId: string): Promise<UserDepartment[]> {
    const result = await this.db('user_departments')
      .where({ user_id: userId })
      .orderBy('is_primary', 'desc')
      .orderBy('created_at', 'asc');

    return result.map((row) => this.transformFromDatabase(row));
  }

  /**
   * Find all users assigned to a specific department
   *
   * Returns all assignments (including expired/inactive ones).
   * Use with date filtering if you need only active assignments.
   *
   * @param departmentId - ID of the department
   * @returns Array of UserDepartment records, ordered by primary assignments first
   */
  async findByDepartmentId(departmentId: number): Promise<UserDepartment[]> {
    const result = await this.db('user_departments')
      .where({ department_id: departmentId })
      .orderBy('is_primary', 'desc')
      .orderBy('created_at', 'asc');

    return result.map((row) => this.transformFromDatabase(row));
  }

  /**
   * Get a user's primary department
   *
   * Returns only the primary department if it's currently valid (respects valid_from/until).
   * Returns null if user has no primary department or if it has expired.
   *
   * Use case: When creating a budget request, get the department_id from user's primary department
   *
   * @param userId - UUID of the user
   * @returns UserDepartment record or null if not found/not active
   */
  async getPrimaryDepartment(userId: string): Promise<UserDepartment | null> {
    const result = await this.db('user_departments')
      .where({ user_id: userId, is_primary: true })
      .whereRaw('(valid_from IS NULL OR valid_from <= NOW()::date)')
      .whereRaw('(valid_until IS NULL OR valid_until >= NOW()::date)')
      .orderBy('assigned_at', 'desc')
      .first();

    if (!result) return null;
    return this.transformFromDatabase(result);
  }

  /**
   * Get all currently active departments for a user
   *
   * Returns only departments where the assignment is currently valid:
   * - valid_from date has passed (or is NULL)
   * - valid_until date has not passed (or is NULL)
   * - valid_until is used for soft deletes (when set to NOW(), assignment becomes inactive)
   *
   * Use case: When fetching user's departments for UI display or permission checks
   *
   * @param userId - UUID of the user
   * @returns Array of active UserDepartment records
   */
  async getActiveDepartments(userId: string): Promise<UserDepartment[]> {
    const result = await this.db('user_departments')
      .where({ user_id: userId })
      .whereRaw('(valid_from IS NULL OR valid_from <= NOW()::date)')
      .whereRaw('(valid_until IS NULL OR valid_until >= NOW()::date)')
      .orderBy('is_primary', 'desc')
      .orderBy('created_at', 'asc');

    return result.map((row) => this.transformFromDatabase(row));
  }

  /**
   * Assign a user to a department
   *
   * If isPrimary is true, automatically unsets other departments as primary for this user.
   * Returns the newly created assignment record.
   *
   * Throws error if assignment already exists (handled at service level for business validation).
   *
   * @param data - Assignment data
   * @returns The created UserDepartment record
   */
  async assignUserToDepartment(
    data: AssignUserToDepartmentData,
  ): Promise<UserDepartment> {
    // If setting as primary, unset other primaries first
    if (data.isPrimary) {
      await this.db('user_departments')
        .where({ user_id: data.userId })
        .update({ is_primary: false });
    }

    const dbData = {
      user_id: data.userId,
      department_id: data.departmentId,
      hospital_id: data.hospitalId ?? null,
      is_primary: data.isPrimary ?? false,
      assigned_role: data.assignedRole ?? null,
      can_create_requests: data.permissions?.canCreateRequests ?? true,
      can_edit_requests: data.permissions?.canEditRequests ?? true,
      can_submit_requests: data.permissions?.canSubmitRequests ?? true,
      can_approve_requests: data.permissions?.canApproveRequests ?? false,
      can_view_reports: data.permissions?.canViewReports ?? true,
      valid_from: data.validFrom ?? null,
      valid_until: data.validUntil ?? null,
      assigned_by: data.assignedBy ?? null,
      notes: data.notes ?? null,
    };

    const [result] = await this.db('user_departments')
      .insert(dbData)
      .returning('*');

    return this.transformFromDatabase(result);
  }

  /**
   * Remove a user from a department (soft delete)
   *
   * Sets valid_until to NOW() to mark the assignment as inactive.
   * This preserves the assignment history for audit purposes.
   *
   * Use case: When deactivating a user's department assignment
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department
   */
  async removeUserFromDepartment(
    userId: string,
    departmentId: number,
  ): Promise<void> {
    // Soft delete: set valid_until to NOW()
    await this.db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .update({ valid_until: this.db.fn.now() });
  }

  /**
   * Check if a user has a specific permission in a department
   *
   * Only checks currently active assignments (respects valid_from/until dates).
   * Returns false if assignment is expired or doesn't exist.
   *
   * Use case: Authorization checks before allowing operations like creating or approving requests
   *
   * Example:
   * ```
   * const canApprove = await repo.hasPermissionInDepartment(
   *   userId,
   *   departmentId,
   *   'canApproveRequests'
   * );
   * if (!canApprove) {
   *   throw new UnauthorizedException('User cannot approve in this department');
   * }
   * ```
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department
   * @param permission - Permission field name to check (e.g., 'canApproveRequests')
   * @returns true if user has the permission and assignment is active, false otherwise
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
    // Map camelCase property to snake_case column
    const permissionColumn = this.permissionToColumn(permission);

    const result = await this.db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .where(permissionColumn, true)
      .whereRaw('(valid_from IS NULL OR valid_from <= NOW()::date)')
      .whereRaw('(valid_until IS NULL OR valid_until >= NOW()::date)')
      .first();

    return !!result;
  }

  /**
   * Get a specific user-department assignment
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department
   * @returns UserDepartment record or null if not found
   */
  async getAssignment(
    userId: string,
    departmentId: number,
  ): Promise<UserDepartment | null> {
    const result = await this.db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .first();

    if (!result) return null;
    return this.transformFromDatabase(result);
  }

  /**
   * Check if a user is assigned to a department
   *
   * Returns true if ANY assignment exists, regardless of validity dates.
   * Use getActiveDepartments() to check for active assignments only.
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department
   * @returns true if assignment exists, false otherwise
   */
  async isAssignedToDepartment(
    userId: string,
    departmentId: number,
  ): Promise<boolean> {
    const result = await this.db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .first();

    return !!result;
  }

  /**
   * Update a department assignment
   *
   * If updating isPrimary to true, automatically unsets other departments as primary.
   *
   * @param userId - UUID of the user
   * @param departmentId - ID of the department
   * @param updates - Fields to update (partial UserDepartment)
   * @returns Updated UserDepartment record or null if not found
   */
  async updateAssignment(
    userId: string,
    departmentId: number,
    updates: Partial<
      Omit<AssignUserToDepartmentData, 'userId' | 'departmentId'>
    >,
  ): Promise<UserDepartment | null> {
    // If setting as primary, unset other primaries first
    if (updates.isPrimary) {
      await this.db('user_departments')
        .where({ user_id: userId })
        .update({ is_primary: false });
    }

    const dbUpdates: Record<string, any> = {};

    if (updates.hospitalId !== undefined)
      dbUpdates.hospital_id = updates.hospitalId;
    if (updates.isPrimary !== undefined)
      dbUpdates.is_primary = updates.isPrimary;
    if (updates.assignedRole !== undefined)
      dbUpdates.assigned_role = updates.assignedRole;
    if (updates.permissions?.canCreateRequests !== undefined) {
      dbUpdates.can_create_requests = updates.permissions.canCreateRequests;
    }
    if (updates.permissions?.canEditRequests !== undefined) {
      dbUpdates.can_edit_requests = updates.permissions.canEditRequests;
    }
    if (updates.permissions?.canSubmitRequests !== undefined) {
      dbUpdates.can_submit_requests = updates.permissions.canSubmitRequests;
    }
    if (updates.permissions?.canApproveRequests !== undefined) {
      dbUpdates.can_approve_requests = updates.permissions.canApproveRequests;
    }
    if (updates.permissions?.canViewReports !== undefined) {
      dbUpdates.can_view_reports = updates.permissions.canViewReports;
    }
    if (updates.validFrom !== undefined)
      dbUpdates.valid_from = updates.validFrom;
    if (updates.validUntil !== undefined)
      dbUpdates.valid_until = updates.validUntil;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    // Always update the timestamp
    dbUpdates.updated_at = new Date();

    const [result] = await this.db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .update(dbUpdates)
      .returning('*');

    if (!result) return null;
    return this.transformFromDatabase(result);
  }

  /**
   * Count active departments for a user
   *
   * @param userId - UUID of the user
   * @returns Number of currently active department assignments
   */
  async countActiveDepartments(userId: string): Promise<number> {
    const result = await this.db('user_departments')
      .where({ user_id: userId })
      .whereRaw('(valid_from IS NULL OR valid_from <= NOW()::date)')
      .whereRaw('(valid_until IS NULL OR valid_until >= NOW()::date)')
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  /**
   * Count active users in a department
   *
   * @param departmentId - ID of the department
   * @returns Number of currently active user assignments
   */
  async countActiveDepartmentUsers(departmentId: number): Promise<number> {
    const result = await this.db('user_departments')
      .where({ department_id: departmentId })
      .whereRaw('(valid_from IS NULL OR valid_from <= NOW()::date)')
      .whereRaw('(valid_until IS NULL OR valid_until >= NOW()::date)')
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Transform database row to entity (snake_case to camelCase)
   */
  private transformFromDatabase(row: any): UserDepartment {
    return {
      id: row.id,
      userId: row.user_id,
      departmentId: row.department_id,
      hospitalId: row.hospital_id,
      isPrimary: row.is_primary,
      assignedRole: row.assigned_role,
      canCreateRequests: row.can_create_requests,
      canEditRequests: row.can_edit_requests,
      canSubmitRequests: row.can_submit_requests,
      canApproveRequests: row.can_approve_requests,
      canViewReports: row.can_view_reports,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map camelCase permission property name to snake_case column name
   */
  private permissionToColumn(
    permission: keyof Pick<
      UserDepartment,
      | 'canCreateRequests'
      | 'canEditRequests'
      | 'canSubmitRequests'
      | 'canApproveRequests'
      | 'canViewReports'
    >,
  ): string {
    const permissionMap: Record<string, string> = {
      canCreateRequests: 'can_create_requests',
      canEditRequests: 'can_edit_requests',
      canSubmitRequests: 'can_submit_requests',
      canApproveRequests: 'can_approve_requests',
      canViewReports: 'can_view_reports',
    };

    return permissionMap[permission] || permission;
  }
}
