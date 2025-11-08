import Knex from 'knex';
import {
  User,
  UserWithRole,
  UserCreateData,
  UserUpdateData,
  UserListOptions,
  UserRole,
} from './users.types';

export class UsersRepository {
  constructor(private knex: any) {}

  async findAll(
    options: UserListOptions,
  ): Promise<{ users: UserWithRole[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;
    const offset = (page - 1) * limit;

    // Base query for users (without joins to get distinct users)
    let query = this.knex('users')
      .select('users.*')
      .whereNull('users.deleted_at'); // Exclude deleted users

    // Count query for distinct users
    let countQuery = this.knex('users')
      .distinct('users.id')
      .whereNull('users.deleted_at'); // Exclude deleted users

    // Apply filters
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.where((builder) => {
        builder
          .where('users.email', 'ilike', searchPattern)
          .orWhere('users.username', 'ilike', searchPattern)
          .orWhere('users.first_name', 'ilike', searchPattern)
          .orWhere('users.last_name', 'ilike', searchPattern);
      });
      countQuery = countQuery.where((builder) => {
        builder
          .where('users.email', 'ilike', searchPattern)
          .orWhere('users.username', 'ilike', searchPattern)
          .orWhere('users.first_name', 'ilike', searchPattern)
          .orWhere('users.last_name', 'ilike', searchPattern);
      });
    }

    // If role filter is applied, join with user_roles and roles tables
    if (role) {
      query = query
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .where('roles.name', role);

      countQuery = countQuery
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .leftJoin('roles', 'user_roles.role_id', 'roles.id')
        .where('roles.name', role);
    }

    if (status) {
      query = query.where('users.status', status);
      countQuery = countQuery.where('users.status', status);
    }

    // Get total count of distinct users
    const countResult = await countQuery;
    const total = countResult.length;

    // Map camelCase sortBy to snake_case database column
    const dbSortBy = this.mapSortFieldToDbColumn(sortBy);

    // Apply sorting and pagination to get unique user IDs
    const userRows = await query
      .orderBy(`users.${dbSortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    // Get user IDs for role fetching
    const userIds = userRows.map((user) => user.id);

    // Fetch all users with their roles
    const users = await Promise.all(
      userRows.map(async (user) => {
        // Get primary role (first role if exists)
        const primaryRole = await this.knex('user_roles')
          .join('roles', 'user_roles.role_id', 'roles.id')
          .select('roles.name as role', 'roles.id as roleId')
          .where('user_roles.user_id', user.id)
          .where('user_roles.is_active', true)
          .orderBy('user_roles.assigned_at', 'asc')
          .first();

        return this.mapToUserWithRole({
          ...user,
          role: primaryRole?.role || null,
          roleId: primaryRole?.roleId || null,
        });
      }),
    );

    return {
      users,
      total,
    };
  }

  async findById(id: string): Promise<UserWithRole | null> {
    const user = await this.knex('users')
      .select('users.*', 'roles.name as role', 'roles.id as roleId')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', id)
      .whereNull('users.deleted_at') // Exclude deleted users
      .first();

    return user ? this.mapToUserWithRole(user) : null;
  }

  async findByIdWithPassword(
    id: string,
  ): Promise<(User & { password: string }) | null> {
    const user = await this.knex('users')
      .select('*')
      .where('id', id)
      .whereNull('deleted_at') // Exclude deleted users
      .first();

    return user ? { ...this.mapToUser(user), password: user.password } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.knex('users')
      .where('email', email)
      .whereNull('deleted_at') // Exclude deleted users
      .first();

    return user ? this.mapToUser(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.knex('users')
      .where('username', username)
      .whereNull('deleted_at') // Exclude deleted users
      .first();

    return user ? this.mapToUser(user) : null;
  }

  async create(data: UserCreateData): Promise<UserWithRole> {
    const trx = await this.knex.transaction();

    try {
      // Create user
      const [user] = await trx('users')
        .insert({
          email: data.email,
          username: data.username,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          status: data.status ?? 'active',
        })
        .returning('*');

      // Assign role
      await trx('user_roles').insert({
        user_id: user.id,
        role_id: data.roleId,
      });

      // Get role name
      const role = await trx('roles').where('id', data.roleId).first();

      await trx.commit();

      return this.mapToUserWithRole({
        ...user,
        role: role.name,
        roleId: role.id,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(id: string, data: UserUpdateData): Promise<UserWithRole | null> {
    const trx = await this.knex.transaction();

    try {
      // Update user fields
      const updateData: any = {};
      if (data.email !== undefined) updateData.email = data.email;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.firstName !== undefined) updateData.first_name = data.firstName;
      if (data.lastName !== undefined) updateData.last_name = data.lastName;
      if (data.status !== undefined) updateData.status = data.status;

      const [user] = await trx('users')
        .where('id', id)
        .update(updateData)
        .returning('*');

      if (!user) {
        await trx.rollback();
        return null;
      }

      // Update role if provided
      if (data.roleId) {
        await trx('user_roles').where('user_id', id).delete();

        await trx('user_roles').insert({
          user_id: id,
          role_id: data.roleId,
        });
      }

      // Get current role
      const userRole = await trx('user_roles')
        .select('roles.name', 'roles.id')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', id)
        .first();

      await trx.commit();

      return this.mapToUserWithRole({
        ...user,
        role: userRole?.name,
        roleId: userRole?.id,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await this.knex('users')
      .where('id', id)
      .update({ password: hashedPassword });

    return result > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.knex('users').where('id', id).delete();

    return result > 0;
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      status: row.status,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapToUserWithRole(row: any): UserWithRole {
    return {
      ...this.mapToUser(row),
      role: row.role,
      roleId: row.roleId,
      roles: [], // Will be populated by service layer
    };
  }

  // Profile-specific methods
  async findProfileById(id: string): Promise<any | null> {
    const user = await this.knex('users')
      .select(
        'users.id',
        'users.email',
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.bio',
        'users.avatar_url',
        'users.status',
        'users.email_verified',
        'users.created_at',
        'users.updated_at',
        'roles.name as role',
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', id)
      .first();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      role: user.role || 'user',
      status: user.status,
      emailVerified: user.email_verified || false,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }

  async updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
    },
  ): Promise<any | null> {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.bio !== undefined) updateData.bio = data.bio;

    const [user] = await this.knex('users')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!user) return null;

    // Return updated profile with role
    return this.findProfileById(id);
  }

  async getRoles() {
    const roles = await this.knex
      .select('id', 'name', 'description')
      .from('roles')
      .orderBy('name');

    return roles;
  }

  // ===== MULTI-ROLE MANAGEMENT METHODS =====

  /**
   * Get all roles assigned to a user
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const roles = await this.knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .where('user_roles.is_active', true)
      .select(
        'user_roles.id as id',
        'roles.id as roleId',
        'roles.name as roleName',
        'user_roles.assigned_at as assignedAt',
        'user_roles.assigned_by as assignedBy',
        'user_roles.expires_at as expiresAt',
        'user_roles.is_active as isActive',
      );

    return roles.map((role) => ({
      id: role.id,
      roleId: role.roleId,
      roleName: role.roleName,
      assignedAt: new Date(role.assignedAt),
      assignedBy: role.assignedBy,
      expiresAt: role.expiresAt ? new Date(role.expiresAt) : null,
      isActive: role.isActive,
    }));
  }

  /**
   * Assign roles to a user
   */
  async assignRoles(
    userId: string,
    roleIds: string[],
    assignedBy?: string,
    expiresAt?: Date,
  ): Promise<UserRole[]> {
    const trx = await this.knex.transaction();

    try {
      // Check for duplicates and validate roles exist
      const existingRoles = await trx('user_roles')
        .where('user_roles.user_id', userId)
        .whereIn('user_roles.role_id', roleIds)
        .select('role_id');

      const existingRoleIds = existingRoles.map((r: any) => r.role_id);
      const newRoleIds = roleIds.filter((id) => !existingRoleIds.includes(id));

      // Insert new role assignments
      if (newRoleIds.length > 0) {
        const assignments = newRoleIds.map((roleId) => ({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy || null,
          expires_at: expiresAt || null,
          is_active: true,
        }));

        await trx('user_roles').insert(assignments);
      }

      await trx.commit();

      // Return updated roles
      return this.getUserRoles(userId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Replace all roles for a user with a new set of roles
   * This removes ALL existing roles and assigns ONLY the specified roles
   * Used for bulk role change operations where semantics should be "replace" not "add"
   */
  async replaceRoles(
    userId: string,
    roleIds: string[],
    assignedBy?: string,
    expiresAt?: Date,
  ): Promise<UserRole[]> {
    const trx = await this.knex.transaction();

    try {
      // Delete ALL existing role assignments for this user
      await trx('user_roles').where('user_id', userId).delete();

      // Insert new role assignments
      if (roleIds.length > 0) {
        const assignments = roleIds.map((roleId) => ({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy || null,
          expires_at: expiresAt || null,
          is_active: true,
        }));

        await trx('user_roles').insert(assignments);
      }

      await trx.commit();

      // Return updated roles
      return this.getUserRoles(userId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, roleId: string): Promise<boolean> {
    const result = await this.knex('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .delete();

    return result > 0;
  }

  /**
   * Update role expiry date
   */
  async updateRoleExpiry(
    userId: string,
    roleId: string,
    expiresAt?: Date,
  ): Promise<boolean> {
    const result = await this.knex('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .update({
        expires_at: expiresAt || null,
        updated_at: this.knex.fn.now(),
      });

    return result > 0;
  }

  // Update user deletion data for soft delete
  async updateUserDeletionData(
    id: string,
    data: {
      deleted_at: Date;
      recovery_deadline: Date;
      deletion_reason?: string | null;
      deleted_by_ip?: string | null;
      deleted_by_user_agent?: string | null;
    },
  ): Promise<boolean> {
    const result = await this.knex('users').where({ id }).update({
      deleted_at: data.deleted_at,
      recovery_deadline: data.recovery_deadline,
      deletion_reason: data.deletion_reason,
      deleted_by_ip: data.deleted_by_ip,
      deleted_by_user_agent: data.deleted_by_user_agent,
      updated_at: this.knex.fn.now(),
    });

    return result > 0;
  }

  // Find user by ID including deleted users
  async findByIdIncludeDeleted(id: string): Promise<UserWithRole | null> {
    const user = await this.knex
      .select('users.*', 'roles.name as role_name', 'roles.id as role_id')
      .from('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', id)
      .first();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar_url,
      bio: user.bio,
      status: user.status,
      isEmailVerified: user.email_verified,
      lastLoginAt: user.last_login_at
        ? new Date(user.last_login_at)
        : undefined,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      role: user.role_name || 'user',
      roleId: user.role_id,
      roles: [], // Will be populated by service layer
      deleted_at: user.deleted_at,
      deletion_reason: user.deletion_reason,
      recovery_deadline: user.recovery_deadline,
    };
  }

  // Find user by ID with password (for password verification) - Updated method
  async findByIdWithPasswordForVerification(
    id: string,
  ): Promise<(UserWithRole & { password: string }) | null> {
    const user = await this.knex
      .select(
        'users.*',
        'roles.name as role_name',
        'roles.description as role_description',
      )
      .from('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', id)
      .whereNull('users.deleted_at') // Exclude deleted users
      .first();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      status: user.status,
      lastLoginAt: user.last_login_at
        ? new Date(user.last_login_at)
        : undefined,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      password: user.password, // Include password hash
      role: user.role_name || 'user',
      roleId: user.role_id,
      roles: [], // Will be populated by service layer
      deleted_at: user.deleted_at,
      deletion_reason: user.deletion_reason,
      recovery_deadline: user.recovery_deadline,
    };
  }

  /**
   * Maps camelCase API field names to snake_case database column names for sorting
   */
  private mapSortFieldToDbColumn(sortField: string): string {
    const fieldMapping: Record<string, string> = {
      // CamelCase API fields -> snake_case DB columns
      firstName: 'first_name',
      lastName: 'last_name',
      isActive: 'is_active',
      lastLoginAt: 'last_login_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      emailVerified: 'email_verified',
      emailVerifiedAt: 'email_verified_at',
      twoFactorEnabled: 'two_factor_enabled',
      twoFactorSecret: 'two_factor_secret',
      twoFactorBackupCodes: 'two_factor_backup_codes',
      deletedAt: 'deleted_at',
      avatarUrl: 'avatar_url',
      dateOfBirth: 'date_of_birth',
      deletionReason: 'deletion_reason',
      recoveryDeadline: 'recovery_deadline',
      deletedByIp: 'deleted_by_ip',
      deletedByUserAgent: 'deleted_by_user_agent',
      // Fields that are the same in both formats
      id: 'id',
      email: 'email',
      username: 'username',
      password: 'password',
      name: 'name',
      status: 'status',
      bio: 'bio',
      timezone: 'timezone',
      language: 'language',
      phone: 'phone',
    };

    // Return mapped column or original field name if no mapping exists
    return fieldMapping[sortField] || sortField;
  }
}
