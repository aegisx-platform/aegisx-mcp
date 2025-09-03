import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface UserFactoryOptions {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface NavigationItemFactoryOptions {
  id?: string;
  title?: string;
  type?: 'item' | 'group' | 'collapsible' | 'divider' | 'spacer';
  link?: string;
  icon?: string;
  badge?: {
    title?: string;
    variant?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'error';
  };
  permissions?: string[];
  parentId?: string;
  order?: number;
  enabled?: boolean;
}

export interface SessionFactoryOptions {
  userId?: string;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface SettingsFactoryOptions {
  userId?: string;
  theme?: string;
  scheme?: 'light' | 'dark' | 'auto';
  layout?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  notifications?: {
    email?: boolean;
    push?: boolean;
    desktop?: boolean;
    sound?: boolean;
  };
  navigation?: {
    collapsed?: boolean;
    type?: string;
    position?: 'left' | 'right' | 'top';
  };
}

export class TestUserFactory {
  constructor(private db: Knex) {}

  async create(options: UserFactoryOptions = {}): Promise<any> {
    const timestamp = Date.now();
    const userData = {
      id: uuidv4(),
      email: options.email || `user${timestamp}@example.com`,
      username: options.username || `user${timestamp}`,
      password: options.password || 'testpass123',
      first_name: options.firstName || 'Test',
      last_name: options.lastName || 'User',
      role: options.role || 'user',
      status: options.status || 'active',
      email_verified: options.emailVerified ?? true,
      two_factor_enabled: options.twoFactorEnabled ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      parseInt(process.env.BCRYPT_ROUNDS || '10'),
    );

    // Get or create role
    let roleId: string;
    const existingRole = await this.db('roles')
      .where({ name: userData.role })
      .first();

    if (existingRole) {
      roleId = existingRole.id;
    } else {
      const [newRole] = await this.db('roles')
        .insert({
          name: userData.role,
          description: `${userData.role} role`,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      roleId = newRole.id;
    }

    // Insert user (remove role from userData to avoid conflict)
    const { role, ...userDataWithoutRole } = userData;
    const [user] = await this.db('users')
      .insert({
        ...userDataWithoutRole,
        password: hashedPassword,
      })
      .returning('*');

    // Assign role to user
    await this.db('user_roles').insert({
      user_id: user.id,
      role_id: roleId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create default preferences
    await this.createPreferences(user.id);

    return {
      ...user,
      password: userData.password, // Return original password for tests
    };
  }

  async createMany(
    count: number,
    options: UserFactoryOptions = {},
  ): Promise<any[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create({
        ...options,
        email: options.email ? `${i}-${options.email}` : undefined,
        username: options.username ? `${i}-${options.username}` : undefined,
      });
      users.push(user);
    }
    return users;
  }

  async createAdmin(options: UserFactoryOptions = {}): Promise<any> {
    return this.create({
      ...options,
      role: 'admin',
      firstName: options.firstName || 'Admin',
      lastName: options.lastName || 'User',
    });
  }

  async createWithRole(
    roleName: string,
    permissions: string[] = [],
    options: UserFactoryOptions = {},
  ): Promise<any> {
    // Create role with permissions
    const timestamp = Date.now();
    const [role] = await this.db('roles')
      .insert({
        name: roleName,
        description: `${roleName} role`,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    const roleId = role.id;

    // Add permissions
    for (const permission of permissions) {
      // Parse permission format (e.g., "navigation.read" -> resource: "navigation", action: "read")
      const [resource, action] = permission.split('.');

      let permissionRecord = await this.db('permissions')
        .where({ resource, action })
        .first();

      if (!permissionRecord) {
        const [newPermission] = await this.db('permissions')
          .insert({
            resource: resource || permission,
            action: action || 'access',
            description: `Permission: ${permission}`,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning('*');
        permissionRecord = newPermission;
      }

      await this.db('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permissionRecord.id,
          created_at: new Date(),
        })
        .onConflict(['role_id', 'permission_id'])
        .ignore();
    }

    return this.create({
      ...options,
      role: roleName,
    });
  }

  private async createPreferences(userId: string): Promise<void> {
    await this.db('user_preferences').insert({
      user_id: userId,
      theme: 'default',
      scheme: 'light',
      layout: 'classic',
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      notifications_email: true,
      notifications_push: false,
      notifications_desktop: true,
      notifications_sound: true,
      navigation_collapsed: false,
      navigation_type: 'default',
      navigation_position: 'left',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}

export class NavigationItemFactory {
  constructor(private db: Knex) {}

  async create(options: NavigationItemFactoryOptions = {}): Promise<any> {
    const timestamp = Date.now();
    const itemData = {
      id: options.id,
      key: options.id || `test-item-${timestamp}`, // key is required and unique
      title: options.title || `Test Item ${timestamp}`,
      type: options.type || 'item',
      link: options.link || `/test-${timestamp}`,
      icon: options.icon || 'heroicons-outline:home',
      parent_id: options.parentId || null,
      sort_order: options.order || 0,
      disabled: !(options.enabled ?? true),
      target: '_self',
      exact_match: false,
      hidden: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add badge if provided
    if (options.badge) {
      itemData['badge_title'] = options.badge.title || '';
      itemData['badge_variant'] = options.badge.variant || 'default';
    }

    const [item] = await this.db('navigation_items')
      .insert(itemData)
      .returning('*');

    // Add permissions if provided
    if (options.permissions && options.permissions.length > 0) {
      for (const permission of options.permissions) {
        // Parse permission format (e.g., "navigation.read" -> resource: "navigation", action: "read")
        const [resource, action] = permission.split('.');

        let permissionRecord = await this.db('permissions')
          .where({ resource, action })
          .first();

        if (!permissionRecord) {
          const [newPermission] = await this.db('permissions')
            .insert({
              resource: resource || permission,
              action: action || 'access',
              description: `Permission: ${permission}`,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning('*');
          permissionRecord = newPermission;
        }

        await this.db('navigation_permissions')
          .insert({
            navigation_item_id: item.id,
            permission_id: permissionRecord.id,
            created_at: new Date(),
          })
          .onConflict(['navigation_item_id', 'permission_id'])
          .ignore();
      }
    }

    return item;
  }

  async createMany(
    count: number,
    options: NavigationItemFactoryOptions = {},
  ): Promise<any[]> {
    const items = [];
    for (let i = 0; i < count; i++) {
      const item = await this.create({
        ...options,
        title: options.title ? `${options.title} ${i}` : undefined,
        order: options.order !== undefined ? options.order + i : i,
      });
      items.push(item);
    }
    return items;
  }

  async createGroup(
    title: string,
    children: NavigationItemFactoryOptions[] = [],
  ): Promise<any> {
    const group = await this.create({
      title,
      type: 'group',
      link: null,
    });

    const childItems = [];
    for (const childOptions of children) {
      const child = await this.create({
        ...childOptions,
        parentId: group.id,
      });
      childItems.push(child);
    }

    return {
      ...group,
      children: childItems,
    };
  }
}

export class SessionFactory {
  constructor(private db: Knex) {}

  async create(options: SessionFactoryOptions = {}): Promise<any> {
    const timestamp = Date.now();
    const sessionData = {
      id: uuidv4(),
      user_id: options.userId,
      token: options.token || `token-${timestamp}`,
      refresh_token: options.refreshToken || `refresh-${timestamp}`,
      expires_at: options.expiresAt || new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      user_agent: options.userAgent || 'Test User Agent',
      ip_address: options.ipAddress || '127.0.0.1',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [session] = await this.db('user_sessions')
      .insert(sessionData)
      .returning('*');

    return session;
  }

  async createForUser(
    userId: string,
    options: Omit<SessionFactoryOptions, 'userId'> = {},
  ): Promise<any> {
    return this.create({
      ...options,
      userId,
    });
  }
}

export class SettingsFactory {
  constructor(private db: Knex) {}

  async create(options: SettingsFactoryOptions = {}): Promise<any> {
    const settingsData = {
      user_id: options.userId,
      theme: options.theme || 'default',
      scheme: options.scheme || 'light',
      layout: options.layout || 'classic',
      language: options.language || 'en',
      timezone: options.timezone || 'UTC',
      date_format: options.dateFormat || 'MM/DD/YYYY',
      time_format: options.timeFormat || '12h',
      notifications_email: options.notifications?.email ?? true,
      notifications_push: options.notifications?.push ?? false,
      notifications_desktop: options.notifications?.desktop ?? true,
      notifications_sound: options.notifications?.sound ?? true,
      navigation_collapsed: options.navigation?.collapsed ?? false,
      navigation_type: options.navigation?.type || 'default',
      navigation_position: options.navigation?.position || 'left',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [settings] = await this.db('user_preferences')
      .insert(settingsData)
      .returning('*');

    return settings;
  }

  async createForUser(
    userId: string,
    options: Omit<SettingsFactoryOptions, 'userId'> = {},
  ): Promise<any> {
    return this.create({
      ...options,
      userId,
    });
  }
}

export class TestDataFactory {
  public user: TestUserFactory;
  public navigation: NavigationItemFactory;
  public session: SessionFactory;
  public settings: SettingsFactory;

  constructor(db: Knex) {
    this.user = new TestUserFactory(db);
    this.navigation = new NavigationItemFactory(db);
    this.session = new SessionFactory(db);
    this.settings = new SettingsFactory(db);
  }

  /**
   * Create a complete user with preferences and session
   */
  async createCompleteUser(options: UserFactoryOptions = {}): Promise<{
    user: any;
    preferences: any;
    session: any;
  }> {
    const user = await this.user.create(options);
    const session = await this.session.createForUser(user.id);

    // Preferences are created automatically by UserFactory
    const preferences = await this.db('user_preferences')
      .where({ user_id: user.id })
      .first();

    return {
      user,
      preferences,
      session,
    };
  }

  /**
   * Create test navigation structure
   */
  async createNavigationStructure(): Promise<any[]> {
    const dashboardId = uuidv4();
    const dashboard = await this.navigation.create({
      id: dashboardId,
      title: 'Dashboard',
      type: 'item',
      icon: 'heroicons-outline:home',
      link: '/dashboard',
      order: 0,
    });

    const appsGroup = await this.navigation.createGroup('Apps', [
      {
        title: 'Users',
        type: 'item',
        icon: 'heroicons-outline:users',
        link: '/apps/users',
        permissions: ['users.read'],
        order: 0,
      },
      {
        title: 'Settings',
        type: 'item',
        icon: 'heroicons-outline:cog-6-tooth',
        link: '/apps/settings',
        permissions: ['settings.read'],
        order: 1,
      },
    ]);

    const adminGroup = await this.navigation.createGroup('Administration', [
      {
        title: 'User Management',
        type: 'item',
        icon: 'heroicons-outline:user-group',
        link: '/admin/users',
        permissions: ['admin.users.read'],
        order: 0,
      },
      {
        title: 'Role Management',
        type: 'item',
        icon: 'heroicons-outline:shield-check',
        link: '/admin/roles',
        permissions: ['admin.roles.read'],
        order: 1,
      },
    ]);

    return [dashboard, appsGroup, adminGroup];
  }

  /**
   * Reference to the database for custom operations
   */
  get db(): Knex {
    return this.user['db'];
  }
}

// Individual factories are already exported above
