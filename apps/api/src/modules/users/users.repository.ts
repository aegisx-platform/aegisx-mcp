import { Knex } from 'knex';
import {
  User,
  UserWithRole,
  UserCreateData,
  UserUpdateData,
  UserListOptions,
} from './users.types';

export class UsersRepository {
  constructor(private knex: Knex) {}

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

    // Base query for users with roles
    let query = this.knex('users')
      .select('users.*', 'roles.name as role', 'roles.id as roleId')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id');

    // Count query
    let countQuery = this.knex('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id');

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

    if (role) {
      query = query.where('roles.name', role);
      countQuery = countQuery.where('roles.name', role);
    }

    if (status) {
      const isActive = status === 'active';
      query = query.where('users.is_active', isActive);
      countQuery = countQuery.where('users.is_active', isActive);
    }

    // Get total count
    const [{ count }] = await countQuery.count('users.id as count');
    const total = parseInt(count as string, 10);

    // Apply sorting and pagination
    const users = await query
      .orderBy(`users.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      users: users.map((user) => this.mapToUserWithRole(user)),
      total,
    };
  }

  async findById(id: string): Promise<UserWithRole | null> {
    const user = await this.knex('users')
      .select('users.*', 'roles.name as role', 'roles.id as roleId')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', id)
      .first();

    return user ? this.mapToUserWithRole(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.knex('users').where('email', email).first();

    return user ? this.mapToUser(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.knex('users').where('username', username).first();

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
          is_active: data.isActive ?? true,
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
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

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
      isActive: row.is_active,
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
    };
  }

  async getRoles() {
    const roles = await this.knex
      .select('id', 'name', 'description')
      .from('roles')
      .orderBy('name');

    return roles;
  }
}
