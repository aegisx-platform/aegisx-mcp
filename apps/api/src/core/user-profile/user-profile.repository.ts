import Knex from 'knex';
import {
  UserProfile,
  UserRole,
  UserPreferences,
  DatabaseUser,
  DatabaseUserPreferences,
  AvatarFile,
  UserPreferencesUpdateRequest
} from './user-profile.types';

export class UserProfileRepository {
  constructor(private knex: any) {}

  async findUserWithProfileById(id: string): Promise<UserProfile | null> {
    const result = await this.knex('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .leftJoin('user_preferences', 'users.id', 'user_preferences.user_id')
      .select(
        // User fields
        'users.id',
        'users.email',
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.name',
        'users.bio',
        'users.avatar_url',
        'users.status',
        'users.email_verified',
        'users.two_factor_enabled',
        'users.created_at',
        'users.updated_at',
        'users.last_login_at',
        // Role fields
        'roles.id as role_id',
        'roles.name as role_name',
        // User preferences fields
        'user_preferences.theme',
        'user_preferences.scheme',
        'user_preferences.layout',
        'user_preferences.language',
        'user_preferences.timezone',
        'user_preferences.date_format',
        'user_preferences.time_format',
        'user_preferences.notifications_email',
        'user_preferences.notifications_push',
        'user_preferences.notifications_desktop',
        'user_preferences.notifications_sound',
        'user_preferences.navigation_collapsed',
        'user_preferences.navigation_type',
        'user_preferences.navigation_position'
      )
      .where('users.id', id)
      .where('users.deleted_at', null)
      .first();

    if (!result) {
      return null;
    }


    // Get role permissions
    const permissions: string[] = [];
    try {
      permissions.push(...(await this.getRolePermissions(result.role_id)));
    } catch (error) {
      // Continue with empty permissions on error
    }

    return this.transformToUserProfile(result, permissions);
  }

  async updateUserProfile(userId: string, updates: Partial<DatabaseUser>): Promise<boolean> {
    const updateData: any = {
      ...updates,
      updated_at: new Date()
    };

    const updated = await this.knex('users')
      .where('id', userId)
      .where('deleted_at', null)
      .update(updateData);

    return updated > 0;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const preferences = await this.knex('user_preferences')
      .where('user_id', userId)
      .first();

    if (!preferences) {
      return null;
    }

    return this.transformToUserPreferences(preferences);
  }

  async updateUserPreferences(userId: string, updates: UserPreferencesUpdateRequest): Promise<boolean> {
    // Check if preferences exist
    const existing = await this.knex('user_preferences')
      .where('user_id', userId)
      .first();

    if (!existing) {
      // Create new preferences record
      await this.knex('user_preferences').insert({
        user_id: userId,
        ...this.transformPreferencesToDb(updates),
        created_at: new Date(),
        updated_at: new Date()
      });
      return true;
    }

    // Update existing preferences
    const updateData = {
      ...this.transformPreferencesToDb(updates),
      updated_at: new Date()
    };

    const updated = await this.knex('user_preferences')
      .where('user_id', userId)
      .update(updateData);

    return updated > 0;
  }

  async createAvatarFile(avatarData: Omit<AvatarFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvatarFile> {
    const [avatar] = await this.knex('avatar_files')
      .insert({
        user_id: avatarData.userId,
        original_filename: avatarData.originalFilename,
        mime_type: avatarData.mimeType,
        file_size: avatarData.fileSize,
        storage_path: avatarData.storagePath,
        thumbnails: JSON.stringify(avatarData.thumbnails),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return this.transformToAvatarFile(avatar);
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    const updated = await this.knex('users')
      .where('id', userId)
      .where('deleted_at', null)
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date()
      });

    return updated > 0;
  }

  async getUserAvatarFile(userId: string): Promise<AvatarFile | null> {
    const avatar = await this.knex('avatar_files')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .first();

    return avatar ? this.transformToAvatarFile(avatar) : null;
  }

  async deleteUserAvatar(userId: string): Promise<boolean> {
    const trx = await this.knex.transaction();
    
    try {
      // Delete avatar file record
      await trx('avatar_files')
        .where('user_id', userId)
        .del();

      // Remove avatar URL from user
      await trx('users')
        .where('id', userId)
        .update({
          avatar_url: null,
          updated_at: new Date()
        });

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async deleteOldAvatarFiles(userId: string, excludeId?: string): Promise<void> {
    let query = this.knex('avatar_files')
      .where('user_id', userId);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    await query.del();
  }

  private async getRolePermissions(roleId: string): Promise<string[]> {
    if (!roleId) return [];

    const permissions = await this.knex('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select('permissions.resource', 'permissions.action');

    return permissions.map(p => `${p.resource}.${p.action}`);
  }

  private transformToUserProfile(dbResult: any, permissions: string[]): UserProfile {
    try {
      const role: UserRole = {
        id: dbResult.role_id || 'role_user',
        name: dbResult.role_name || 'User',
        permissions
      };

      const preferences: UserPreferences = {
        theme: dbResult.theme || 'default',
        scheme: dbResult.scheme || 'light',
        layout: dbResult.layout || 'classic',
        language: dbResult.language || 'en',
        timezone: dbResult.timezone || 'UTC',
        dateFormat: dbResult.date_format || 'MM/DD/YYYY',
        timeFormat: dbResult.time_format || '12h',
        notifications: {
          email: dbResult.notifications_email ?? true,
          push: dbResult.notifications_push ?? false,
          desktop: dbResult.notifications_desktop ?? true,
          sound: dbResult.notifications_sound ?? true
        },
        navigation: {
          collapsed: dbResult.navigation_collapsed ?? false,
          type: dbResult.navigation_type || 'default',
          position: dbResult.navigation_position || 'left'
        }
      };

      // Build full avatar URL with base API URL
      let avatarUrl = null;
      if (dbResult.avatar_url) {
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:4200';
        // If already absolute URL, use as is, otherwise prepend base URL
        if (dbResult.avatar_url.startsWith('http://') || dbResult.avatar_url.startsWith('https://')) {
          avatarUrl = dbResult.avatar_url;
        } else {
          avatarUrl = `${baseUrl}${dbResult.avatar_url}`;
        }
      }

      const profile = {
        id: dbResult.id,
        email: dbResult.email,
        username: dbResult.username,
        name: dbResult.name || `${dbResult.first_name || ''} ${dbResult.last_name || ''}`.trim(),
        firstName: dbResult.first_name,
        lastName: dbResult.last_name,
        bio: dbResult.bio,
        avatar: avatarUrl,
        role,
        preferences,
        createdAt: dbResult.created_at?.toISOString(),
        updatedAt: dbResult.updated_at?.toISOString(),
        lastLoginAt: dbResult.last_login_at?.toISOString(),
        status: dbResult.status,
        emailVerified: dbResult.email_verified || false,
        twoFactorEnabled: dbResult.two_factor_enabled || false
      };

      return profile;
    } catch (error) {
      throw error;
    }
  }

  private transformToUserPreferences(dbPrefs: DatabaseUserPreferences): UserPreferences {
    return {
      theme: dbPrefs.theme as any,
      scheme: dbPrefs.scheme as any,
      layout: dbPrefs.layout as any,
      language: dbPrefs.language,
      timezone: dbPrefs.timezone,
      dateFormat: dbPrefs.date_format as any,
      timeFormat: dbPrefs.time_format as any,
      notifications: {
        email: dbPrefs.notifications_email,
        push: dbPrefs.notifications_push,
        desktop: dbPrefs.notifications_desktop,
        sound: dbPrefs.notifications_sound
      },
      navigation: {
        collapsed: dbPrefs.navigation_collapsed,
        type: dbPrefs.navigation_type as any,
        position: dbPrefs.navigation_position as any
      }
    };
  }

  private transformPreferencesToDb(prefs: UserPreferencesUpdateRequest): any {
    const dbData: any = {};

    if (prefs.theme !== undefined) dbData.theme = prefs.theme;
    if (prefs.scheme !== undefined) dbData.scheme = prefs.scheme;
    if (prefs.layout !== undefined) dbData.layout = prefs.layout;
    if (prefs.language !== undefined) dbData.language = prefs.language;
    if (prefs.timezone !== undefined) dbData.timezone = prefs.timezone;
    if (prefs.dateFormat !== undefined) dbData.date_format = prefs.dateFormat;
    if (prefs.timeFormat !== undefined) dbData.time_format = prefs.timeFormat;

    if (prefs.notifications) {
      if (prefs.notifications.email !== undefined) dbData.notifications_email = prefs.notifications.email;
      if (prefs.notifications.push !== undefined) dbData.notifications_push = prefs.notifications.push;
      if (prefs.notifications.desktop !== undefined) dbData.notifications_desktop = prefs.notifications.desktop;
      if (prefs.notifications.sound !== undefined) dbData.notifications_sound = prefs.notifications.sound;
    }

    if (prefs.navigation) {
      if (prefs.navigation.collapsed !== undefined) dbData.navigation_collapsed = prefs.navigation.collapsed;
      if (prefs.navigation.type !== undefined) dbData.navigation_type = prefs.navigation.type;
      if (prefs.navigation.position !== undefined) dbData.navigation_position = prefs.navigation.position;
    }

    return dbData;
  }

  private transformToAvatarFile(dbAvatar: any): AvatarFile {
    return {
      id: dbAvatar.id,
      userId: dbAvatar.user_id,
      originalFilename: dbAvatar.original_filename,
      mimeType: dbAvatar.mime_type,
      fileSize: dbAvatar.file_size,
      storagePath: dbAvatar.storage_path,
      thumbnails: typeof dbAvatar.thumbnails === 'string' 
        ? JSON.parse(dbAvatar.thumbnails)
        : dbAvatar.thumbnails,
      createdAt: dbAvatar.created_at,
      updatedAt: dbAvatar.updated_at
    };
  }
}