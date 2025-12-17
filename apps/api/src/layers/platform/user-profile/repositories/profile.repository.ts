import { Profile, UpdateProfile } from '../schemas/profile.schemas';

/**
 * ProfileRepository
 *
 * Handles database operations for user profiles, including retrieval and updates.
 * Works with the users table and maps snake_case database columns to camelCase API fields.
 */
export class ProfileRepository {
  constructor(private knex: any) {}

  /**
   * Get user profile by ID
   *
   * Retrieves a user's profile information from the users table,
   * excluding sensitive data like password_hash.
   * Also fetches primary department information if available.
   *
   * @param userId - User ID (UUID)
   * @returns Profile object or null if user not found
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const user = await this.knex('users')
      .select(
        'users.id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'users.avatar_url',
        'users.created_at',
        'users.updated_at',
        'up.scheme as theme',
        'up.language',
        'up.notifications_email as notifications',
      )
      .leftJoin('user_preferences as up', 'users.id', 'up.user_id')
      .where('users.id', userId)
      .whereNull('users.deleted_at') // Exclude soft-deleted users
      .first();

    if (!user) return null;

    // Fetch primary department if exists
    const knex = this.knex;
    const primaryDepartment = await this.knex('user_departments as ud')
      .select(
        'ud.department_id as id',
        'd.dept_code as code',
        'd.dept_name as name',
        'ud.is_primary as isPrimary',
      )
      .join('departments as d', 'ud.department_id', 'd.id')
      .where('ud.user_id', userId)
      .where('ud.is_primary', true)
      .where(function () {
        this.whereNull('ud.valid_until').orWhere(
          'ud.valid_until',
          '>',
          knex.fn.now(),
        );
      })
      .first();

    return this.mapToProfile(user, primaryDepartment);
  }

  /**
   * Update user profile
   *
   * Updates profile fields for a user. Only provided fields are updated.
   * Returns the updated profile.
   *
   * @param userId - User ID (UUID)
   * @param data - Partial profile data to update
   * @returns Updated profile or null if user not found
   */
  async updateProfile(
    userId: string,
    data: Partial<UpdateProfile>,
  ): Promise<Profile | null> {
    // Build update object for users table with snake_case column names
    const userUpdateData: any = {};

    if (data.firstName !== undefined)
      userUpdateData.first_name = data.firstName;
    if (data.lastName !== undefined) userUpdateData.last_name = data.lastName;
    if (data.avatarUrl !== undefined)
      userUpdateData.avatar_url = data.avatarUrl;

    // Update users table if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.updated_at = this.knex.fn.now();

      await this.knex('users')
        .where('id', userId)
        .whereNull('deleted_at')
        .update(userUpdateData);
    }

    // Build update object for user_preferences table
    const preferencesUpdateData: any = {};

    if (data.theme !== undefined) preferencesUpdateData.scheme = data.theme;
    if (data.language !== undefined)
      preferencesUpdateData.language = data.language;
    if (data.notifications !== undefined)
      preferencesUpdateData.notifications_email = data.notifications;

    // Update user_preferences if there are changes
    if (Object.keys(preferencesUpdateData).length > 0) {
      preferencesUpdateData.updated_at = this.knex.fn.now();

      // Upsert preferences - insert if not exists, update if exists
      await this.knex.raw(
        `
        INSERT INTO user_preferences (user_id, scheme, language, notifications_email, updated_at)
        VALUES (?, ?, ?, ?, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          scheme = COALESCE(EXCLUDED.scheme, user_preferences.scheme),
          language = COALESCE(EXCLUDED.language, user_preferences.language),
          notifications_email = COALESCE(EXCLUDED.notifications_email, user_preferences.notifications_email),
          updated_at = NOW()
      `,
        [
          userId,
          preferencesUpdateData.scheme || null,
          preferencesUpdateData.language || null,
          preferencesUpdateData.notifications_email ?? null,
        ],
      );
    }

    // Fetch and return the updated profile
    const user = await this.knex('users')
      .select(
        'users.id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'users.avatar_url',
        'users.created_at',
        'users.updated_at',
        'up.scheme as theme',
        'up.language',
        'up.notifications_email as notifications',
      )
      .leftJoin('user_preferences as up', 'users.id', 'up.user_id')
      .where('users.id', userId)
      .whereNull('users.deleted_at')
      .first();

    if (!user) return null;

    // Fetch primary department if exists
    const knex = this.knex;
    const primaryDepartment = await this.knex('user_departments as ud')
      .select(
        'ud.department_id as id',
        'd.dept_code as code',
        'd.dept_name as name',
        'ud.is_primary as isPrimary',
      )
      .join('departments as d', 'ud.department_id', 'd.id')
      .where('ud.user_id', userId)
      .where('ud.is_primary', true)
      .where(function () {
        this.whereNull('ud.valid_until').orWhere(
          'ud.valid_until',
          '>',
          knex.fn.now(),
        );
      })
      .first();

    return this.mapToProfile(user, primaryDepartment);
  }

  /**
   * Get user by ID with password hash
   *
   * Retrieves a user including their password hash for verification.
   * Used for password change operations.
   *
   * @param userId - User ID (UUID)
   * @returns User object with password or null if user not found
   */
  async getUserWithPassword(
    userId: string,
  ): Promise<{ id: string; password: string } | null> {
    const user = await this.knex('users')
      .select('id', 'password')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();

    return user || null;
  }

  /**
   * Update user password
   *
   * Updates the password hash for a user.
   *
   * @param userId - User ID (UUID)
   * @param passwordHash - New bcrypt password hash
   * @returns true if password updated successfully
   */
  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const updateData = {
      password: passwordHash,
      updated_at: this.knex.fn.now(),
    };

    const rowsUpdated = await this.knex('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .update(updateData);

    return rowsUpdated > 0;
  }

  /**
   * Map database row to Profile object
   *
   * Converts snake_case database columns to camelCase API fields
   * and formats timestamps as ISO strings.
   *
   * @param row - Raw database row from users table
   * @param primaryDepartment - Optional primary department data
   * @returns Profile object
   */
  private mapToProfile(row: any, primaryDepartment?: any): Profile {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url || undefined,
      theme: row.theme || 'auto',
      language: row.language || 'en',
      notifications: row.notifications ?? true,
      primaryDepartment: primaryDepartment
        ? {
            id: primaryDepartment.id,
            code: primaryDepartment.code,
            name: primaryDepartment.name,
            isPrimary: primaryDepartment.isPrimary,
          }
        : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
}
