import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBUser {
  id: string;
  email: string;
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  user_agent?: string;
  ip_address?: string;
}

export class AuthRepository {
  constructor(private knex: Knex) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.knex('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .select('users.*', 'roles.name as role')
      .where('users.email', email)
      .first();

    return user ? this.transformUser(user) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.knex('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .select(
        'users.id',
        'users.email',
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.is_active',
        'roles.name as role',
        'users.created_at',
        'users.updated_at',
      )
      .where('users.id', id)
      .first();

    return user ? this.transformUser(user) : null;
  }

  async createUser(userData: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    role_name?: string;
  }): Promise<User> {
    console.log(
      '[AUTH_REPOSITORY] Creating user with data:',
      JSON.stringify(userData, null, 2),
    );

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      console.log('[AUTH_REPOSITORY] Password hashed successfully');

      // Get default user role if not provided
      const roleName = userData.role_name || 'user';
      console.log('[AUTH_REPOSITORY] Looking for role:', roleName);

      const role = await this.knex('roles').where('name', roleName).first();
      if (!role) {
        console.error('[AUTH_REPOSITORY] Role not found:', roleName);
        throw new Error('Role not found');
      }
      console.log('[AUTH_REPOSITORY] Found role:', role.id);

      // Start transaction
      const trx = await this.knex.transaction();

      try {
        // Create user
        const [user] = await trx('users')
          .insert({
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            first_name: userData.first_name,
            last_name: userData.last_name,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning('*');

        // Assign role
        await trx('user_roles').insert({
          user_id: user.id,
          role_id: role.id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Create user preferences with default values
        await trx('user_preferences').insert({
          user_id: user.id,
          theme: 'default',
          scheme: 'light',
          layout: 'classic',
          language: 'en',
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY',
          time_format: '12h',
          navigation_collapsed: false,
          navigation_type: 'default',
          navigation_position: 'left',
          notifications_email: true,
          notifications_push: false,
          notifications_desktop: true,
          notifications_sound: true,
          notifications_security: true,
          notifications_updates: true,
          notifications_marketing: false,
          notifications_reminders: true,
          profile_visibility: 'public',
          activity_tracking: true,
          analytics_opt_out: false,
          data_sharing: false,
          high_contrast: false,
          font_size: 'medium',
          reduced_motion: false,
          screen_reader: false,
          animations: true,
          lazy_loading: true,
          caching: true,
          compression: true,
          created_at: new Date(),
          updated_at: new Date(),
        });

        await trx.commit();
        console.log('[AUTH_REPOSITORY] User created successfully:', user.id);

        // Get user with role
        return this.findUserById(user.id) as Promise<User>;
      } catch (error) {
        console.error('[AUTH_REPOSITORY] Transaction error:', error);
        await trx.rollback();
        throw error;
      }
    } catch (outerError) {
      console.error('[AUTH_REPOSITORY] Outer error in createUser:', outerError);
      throw outerError;
    }
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createSession(sessionData: {
    user_id: string;
    refresh_token: string;
    expires_at: Date;
    user_agent?: string;
    ip_address?: string;
  }): Promise<UserSession> {
    const [session] = await this.knex('user_sessions')
      .insert({
        ...sessionData,
        created_at: new Date(),
      })
      .returning('*');

    return session;
  }

  async findSessionByToken(refreshToken: string): Promise<UserSession | null> {
    const session = await this.knex('user_sessions')
      .where('refresh_token', refreshToken)
      .where('expires_at', '>', new Date())
      .first();

    return session || null;
  }

  async deleteSession(refreshToken: string): Promise<boolean> {
    const deletedRows = await this.knex('user_sessions')
      .where('refresh_token', refreshToken)
      .del();

    return deletedRows > 0;
  }

  async deleteExpiredSessions(): Promise<number> {
    return this.knex('user_sessions')
      .where('expires_at', '<', new Date())
      .del();
  }

  async deleteUserSessions(userId: string): Promise<number> {
    return this.knex('user_sessions').where('user_id', userId).del();
  }

  // Transform snake_case DB fields to camelCase
  private transformUser(dbUser: DBUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      password: dbUser.password,
      firstName: dbUser.first_name || '',
      lastName: dbUser.last_name || '',
      isActive: dbUser.is_active,
      role: dbUser.role || 'user',
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}
