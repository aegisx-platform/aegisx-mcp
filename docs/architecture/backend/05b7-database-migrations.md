# Database Migrations & Seeds

## Knex Migration System

### Migration Configuration

```typescript
// database/knexfile.ts
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const knexConfig = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'myapp_dev',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password',
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
      extension: 'ts',
      loadExtensions: ['.ts'],
      schemaName: 'public',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    },
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 5,
      max: 20,
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 10,
      max: 50,
    },
    acquireConnectionTimeout: 60000,
  },
};

export default knexConfig;
```

### Migration Commands Setup

```json
// package.json scripts
{
  "scripts": {
    "db:migrate": "knex migrate:latest --knexfile database/knexfile.ts",
    "db:migrate:make": "knex migrate:make --knexfile database/knexfile.ts",
    "db:migrate:rollback": "knex migrate:rollback --knexfile database/knexfile.ts",
    "db:migrate:rollback:all": "knex migrate:rollback --all --knexfile database/knexfile.ts",
    "db:migrate:status": "knex migrate:status --knexfile database/knexfile.ts",
    "db:seed": "knex seed:run --knexfile database/knexfile.ts",
    "db:seed:make": "knex seed:make --knexfile database/knexfile.ts",
    "db:reset": "yarn db:migrate:rollback:all && yarn db:migrate && yarn db:seed",
    "db:fresh": "yarn db:migrate:rollback:all && yarn db:migrate",
    "db:setup": "yarn db:migrate && yarn db:seed"
  }
}
```

## Migration Best Practices

### Migration File Structure

```typescript
// database/migrations/20241201000001_create_users_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Required fields
    table.string('email', 255).notNullable().unique();
    table.string('username', 100).notNullable().unique();
    table.string('password', 255).notNullable();

    // Optional profile fields
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.text('bio');
    table.string('avatar_url', 500);
    table.string('phone', 20);
    table.date('birth_date');

    // Status and metadata
    table.boolean('is_active').notNullable().defaultTo(true);
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.timestamp('email_verified_at');
    table.timestamp('last_login_at');

    // Foreign keys
    table.uuid('role_id').notNullable();
    table.foreign('role_id').references('id').inTable('roles').onDelete('RESTRICT');

    // Audit fields
    table.timestamps(true, true); // created_at, updated_at
    table.timestamp('deleted_at'); // Soft delete support

    // Indexes for performance
    table.index(['email'], 'idx_users_email');
    table.index(['username'], 'idx_users_username');
    table.index(['role_id'], 'idx_users_role_id');
    table.index(['is_active'], 'idx_users_is_active');
    table.index(['created_at'], 'idx_users_created_at');
    table.index(['email_verified'], 'idx_users_email_verified');
  });

  // Add comments for documentation
  await knex.raw(`
    COMMENT ON TABLE users IS 'Application users with profile information and authentication data';
    COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
    COMMENT ON COLUMN users.email IS 'User email address (unique, used for login)';
    COMMENT ON COLUMN users.username IS 'User chosen username (unique, used for display)';
    COMMENT ON COLUMN users.password IS 'Bcrypt hashed password';
    COMMENT ON COLUMN users.is_active IS 'Whether user account is active';
    COMMENT ON COLUMN users.email_verified IS 'Whether email address has been verified';
    COMMENT ON COLUMN users.role_id IS 'Reference to user role for permissions';
    COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Always provide a way to rollback
  await knex.schema.dropTableIfExists('users');
}
```

### Complex Migration with Data Transformation

```typescript
// database/migrations/20241201000010_add_user_preferences.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add new columns
  await knex.schema.alterTable('users', (table) => {
    table.jsonb('preferences').defaultTo('{}');
    table.string('timezone', 50).defaultTo('UTC');
    table.string('language', 10).defaultTo('en');
    table.boolean('notifications_enabled').defaultTo(true);
  });

  // Migrate existing data
  await knex('users').update({
    preferences: JSON.stringify({
      theme: 'light',
      emailNotifications: true,
      pushNotifications: false,
    }),
    timezone: 'UTC',
    language: 'en',
  });

  // Add constraints after data migration
  await knex.raw(`
    ALTER TABLE users 
    ADD CONSTRAINT check_timezone 
    CHECK (timezone IN (
      'UTC', 'America/New_York', 'America/Los_Angeles', 
      'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 
      'Asia/Bangkok', 'Australia/Sydney'
    ))
  `);

  await knex.raw(`
    ALTER TABLE users 
    ADD CONSTRAINT check_language 
    CHECK (language IN ('en', 'th', 'ja', 'fr', 'de', 'es'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('preferences');
    table.dropColumn('timezone');
    table.dropColumn('language');
    table.dropColumn('notifications_enabled');
  });
}
```

### Junction Table Migration

```typescript
// database/migrations/20241201000005_create_role_permissions.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create permissions table first
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('resource', 100).notNullable(); // users, roles, products
    table.string('action', 50).notNullable(); // create, read, update, delete
    table.string('description', 255);
    table.timestamps(true, true);

    // Ensure unique resource-action combination
    table.unique(['resource', 'action'], 'unique_resource_action');

    // Indexes
    table.index(['resource'], 'idx_permissions_resource');
    table.index(['action'], 'idx_permissions_action');
  });

  // Create junction table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').notNullable();
    table.uuid('permission_id').notNullable();
    table.timestamps(true, true);

    // Composite primary key
    table.primary(['role_id', 'permission_id']);

    // Foreign keys with cascade delete
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE').onUpdate('CASCADE');

    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE').onUpdate('CASCADE');

    // Indexes for join performance
    table.index(['role_id'], 'idx_role_permissions_role_id');
    table.index(['permission_id'], 'idx_role_permissions_permission_id');
  });

  // Add comments
  await knex.raw(`
    COMMENT ON TABLE permissions IS 'System permissions for role-based access control';
    COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop in reverse order (foreign key dependencies)
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
}
```

### Schema Migration with Constraints

```typescript
// database/migrations/20241201000015_add_user_constraints.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add check constraints
  await knex.raw(`
    ALTER TABLE users 
    ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
  `);

  await knex.raw(`
    ALTER TABLE users 
    ADD CONSTRAINT check_username_format 
    CHECK (username ~* '^[a-zA-Z0-9_-]{3,50}$')
  `);

  await knex.raw(`
    ALTER TABLE users 
    ADD CONSTRAINT check_phone_format 
    CHECK (phone IS NULL OR phone ~* '^\\+?[1-9]\\d{1,14}$')
  `);

  await knex.raw(`
    ALTER TABLE users 
    ADD CONSTRAINT check_birth_date 
    CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE)
  `);

  // Add triggers for updated_at
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop triggers
  await knex.raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');

  // Drop constraints
  await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_email_format');
  await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_username_format');
  await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_phone_format');
  await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_birth_date');
}
```

### Index Optimization Migration

```typescript
// database/migrations/20241201000020_optimize_user_indexes.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Composite indexes for common query patterns
  await knex.raw(`
    CREATE INDEX CONCURRENTLY idx_users_role_active 
    ON users (role_id, is_active) 
    WHERE deleted_at IS NULL
  `);

  await knex.raw(`
    CREATE INDEX CONCURRENTLY idx_users_email_verified_active 
    ON users (email_verified, is_active) 
    WHERE deleted_at IS NULL
  `);

  await knex.raw(`
    CREATE INDEX CONCURRENTLY idx_users_created_at_active 
    ON users (created_at DESC) 
    WHERE is_active = true AND deleted_at IS NULL
  `);

  // Full-text search index
  await knex.raw(`
    CREATE INDEX CONCURRENTLY idx_users_fulltext 
    ON users USING GIN (
      to_tsvector('english', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(username, '') || ' ' || 
        COALESCE(email, '')
      )
    )
  `);

  // Partial index for active users only
  await knex.raw(`
    CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_active_unique 
    ON users (email) 
    WHERE is_active = true AND deleted_at IS NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_users_role_active');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_verified_active');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_users_created_at_active');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_users_fulltext');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_active_unique');
}
```

## Database Seeds System

### Base Seed Class

```typescript
// database/seeds/base.seed.ts
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export abstract class BaseSeed {
  protected knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  abstract seed(): Promise<void>;

  // Utility methods
  protected async truncateTable(tableName: string): Promise<void> {
    await this.knex.raw(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
  }

  protected async clearTable(tableName: string): Promise<void> {
    await this.knex(tableName).del();
  }

  protected generateUUID(): string {
    return faker.string.uuid();
  }

  protected async getTableCount(tableName: string): Promise<number> {
    const [{ count }] = await this.knex(tableName).count('* as count');
    return parseInt(count as string);
  }

  protected async tableExists(tableName: string): Promise<boolean> {
    return await this.knex.schema.hasTable(tableName);
  }
}
```

### Role Seeds (Foundation Data)

```typescript
// database/seeds/01_roles.ts
import { Knex } from 'knex';
import { BaseSeed } from './base.seed';

export class RolesSeed extends BaseSeed {
  async seed(): Promise<void> {
    // Clear existing roles
    await this.clearTable('role_permissions');
    await this.clearTable('roles');

    // Insert predefined roles
    const roles = [
      {
        id: this.generateUUID(),
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        level: 100,
        is_system: true,
      },
      {
        id: this.generateUUID(),
        name: 'admin',
        description: 'Administrator with management access',
        level: 80,
        is_system: true,
      },
      {
        id: this.generateUUID(),
        name: 'manager',
        description: 'Manager with team oversight access',
        level: 60,
        is_system: true,
      },
      {
        id: this.generateUUID(),
        name: 'user',
        description: 'Standard user with basic access',
        level: 40,
        is_system: true,
      },
      {
        id: this.generateUUID(),
        name: 'guest',
        description: 'Guest user with read-only access',
        level: 20,
        is_system: true,
      },
    ];

    await this.knex('roles').insert(roles);

    console.log(`✅ Seeded ${roles.length} roles`);
  }
}

// Knex seed function
export async function seed(knex: Knex): Promise<void> {
  const rolesSeed = new RolesSeed(knex);
  await rolesSeed.seed();
}
```

### Permission Seeds

```typescript
// database/seeds/02_permissions.ts
import { Knex } from 'knex';
import { BaseSeed } from './base.seed';

export class PermissionsSeed extends BaseSeed {
  async seed(): Promise<void> {
    // Clear existing permissions
    await this.clearTable('role_permissions');
    await this.clearTable('permissions');

    // Define resources and actions
    const resources = ['users', 'roles', 'permissions', 'audit_logs', 'products', 'orders', 'categories', 'customers', 'reports', 'settings', 'system'];

    const actions = ['create', 'read', 'update', 'delete', 'manage'];

    const permissions = [];

    // Generate permissions for each resource-action combination
    for (const resource of resources) {
      for (const action of actions) {
        permissions.push({
          id: this.generateUUID(),
          resource,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Insert permissions in batches
    const batchSize = 50;
    for (let i = 0; i < permissions.length; i += batchSize) {
      const batch = permissions.slice(i, i + batchSize);
      await this.knex('permissions').insert(batch);
    }

    console.log(`✅ Seeded ${permissions.length} permissions`);
  }
}

export async function seed(knex: Knex): Promise<void> {
  const permissionsSeed = new PermissionsSeed(knex);
  await permissionsSeed.seed();
}
```

### Role-Permission Assignment Seeds

```typescript
// database/seeds/03_role_permissions.ts
import { Knex } from 'knex';
import { BaseSeed } from './base.seed';

export class RolePermissionsSeed extends BaseSeed {
  async seed(): Promise<void> {
    // Clear existing role-permission assignments
    await this.clearTable('role_permissions');

    // Get roles and permissions
    const roles = await this.knex('roles').select('id', 'name');
    const permissions = await this.knex('permissions').select('id', 'resource', 'action');

    const rolePermissions = [];

    for (const role of roles) {
      let allowedPermissions: string[] = [];

      switch (role.name) {
        case 'super_admin':
          // Full access to everything
          allowedPermissions = permissions.map((p) => p.id);
          break;

        case 'admin':
          // All except system management
          allowedPermissions = permissions.filter((p) => p.resource !== 'system' || p.action === 'read').map((p) => p.id);
          break;

        case 'manager':
          // Users and business operations
          allowedPermissions = permissions.filter((p) => ['users', 'products', 'orders', 'customers', 'reports'].includes(p.resource) && ['create', 'read', 'update'].includes(p.action)).map((p) => p.id);
          break;

        case 'user':
          // Read-only for most, own profile update
          allowedPermissions = permissions.filter((p) => p.action === 'read' || (p.resource === 'users' && p.action === 'update')).map((p) => p.id);
          break;

        case 'guest':
          // Read-only for public resources
          allowedPermissions = permissions.filter((p) => p.action === 'read' && ['products', 'categories'].includes(p.resource)).map((p) => p.id);
          break;
      }

      // Create role-permission records
      for (const permissionId of allowedPermissions) {
        rolePermissions.push({
          role_id: role.id,
          permission_id: permissionId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < rolePermissions.length; i += batchSize) {
      const batch = rolePermissions.slice(i, i + batchSize);
      await this.knex('role_permissions').insert(batch);
    }

    console.log(`✅ Seeded ${rolePermissions.length} role-permission assignments`);
  }
}

export async function seed(knex: Knex): Promise<void> {
  const rolePermissionsSeed = new RolePermissionsSeed(knex);
  await rolePermissionsSeed.seed();
}
```

### User Seeds with Realistic Data

```typescript
// database/seeds/04_users.ts
import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { BaseSeed } from './base.seed';

export class UsersSeed extends BaseSeed {
  async seed(): Promise<void> {
    // Don't clear users in production
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Skipping user seeds in production');
      return;
    }

    // Clear existing users
    await this.clearTable('users');

    // Get roles for assignment
    const roles = await this.knex('roles').select('id', 'name');
    const adminRole = roles.find((r) => r.name === 'admin')!;
    const managerRole = roles.find((r) => r.name === 'manager')!;
    const userRole = roles.find((r) => r.name === 'user')!;

    // Create predefined admin users
    const adminUsers = [
      {
        id: this.generateUUID(),
        email: 'admin@example.com',
        username: 'admin',
        password: await bcrypt.hash('Admin123!', 12),
        first_name: 'System',
        last_name: 'Administrator',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        role_id: adminRole.id,
        preferences: JSON.stringify({
          theme: 'dark',
          emailNotifications: true,
          language: 'en',
        }),
        timezone: 'UTC',
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: this.generateUUID(),
        email: 'manager@example.com',
        username: 'manager',
        password: await bcrypt.hash('Manager123!', 12),
        first_name: 'Team',
        last_name: 'Manager',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        role_id: managerRole.id,
        preferences: JSON.stringify({
          theme: 'light',
          emailNotifications: true,
          language: 'en',
        }),
        timezone: 'America/New_York',
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await this.knex('users').insert(adminUsers);

    // Generate realistic test users
    const testUsers = [];
    const userCount = process.env.NODE_ENV === 'development' ? 50 : 10;

    for (let i = 0; i < userCount; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.username({ firstName, lastName }).toLowerCase();

      testUsers.push({
        id: this.generateUUID(),
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        username: username,
        password: await bcrypt.hash('User123!', 12),
        first_name: firstName,
        last_name: lastName,
        bio: faker.person.bio(),
        phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }),
        birth_date: faker.helpers.maybe(() => faker.date.birthdate({ min: 18, max: 65, mode: 'age' }), { probability: 0.5 }),
        is_active: faker.helpers.weightedArrayElement([
          { weight: 0.9, value: true },
          { weight: 0.1, value: false },
        ]),
        email_verified: faker.helpers.weightedArrayElement([
          { weight: 0.8, value: true },
          { weight: 0.2, value: false },
        ]),
        email_verified_at: faker.helpers.maybe(() => faker.date.recent({ days: 30 }), { probability: 0.8 }),
        last_login_at: faker.helpers.maybe(() => faker.date.recent({ days: 7 }), { probability: 0.6 }),
        role_id: faker.helpers.weightedArrayElement([
          { weight: 0.8, value: userRole.id },
          { weight: 0.15, value: managerRole.id },
          { weight: 0.05, value: adminRole.id },
        ]),
        preferences: JSON.stringify({
          theme: faker.helpers.arrayElement(['light', 'dark']),
          emailNotifications: faker.datatype.boolean(0.7),
          pushNotifications: faker.datatype.boolean(0.4),
          language: faker.helpers.weightedArrayElement([
            { weight: 0.7, value: 'en' },
            { weight: 0.2, value: 'th' },
            { weight: 0.1, value: 'ja' },
          ]),
        }),
        timezone: faker.helpers.arrayElement(['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Bangkok', 'Asia/Tokyo']),
        language: 'en',
        created_at: faker.date.past({ years: 2 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
    }

    // Insert test users in batches
    const batchSize = 20;
    for (let i = 0; i < testUsers.length; i += batchSize) {
      const batch = testUsers.slice(i, i + batchSize);
      await this.knex('users').insert(batch);
    }

    console.log(`✅ Seeded ${adminUsers.length + testUsers.length} users`);
  }
}

export async function seed(knex: Knex): Promise<void> {
  const usersSeed = new UsersSeed(knex);
  await usersSeed.seed();
}
```

### Audit Log Seeds

```typescript
// database/seeds/05_audit_logs.ts
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { BaseSeed } from './base.seed';

export class AuditLogsSeed extends BaseSeed {
  async seed(): Promise<void> {
    // Skip in production
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Skipping audit log seeds in production');
      return;
    }

    // Clear existing audit logs
    await this.clearTable('audit_logs');

    // Get users for realistic audit data
    const users = await this.knex('users').select('id', 'email').limit(20);
    if (users.length === 0) {
      console.log('⚠️ No users found, skipping audit log seeds');
      return;
    }

    const auditLogs = [];
    const logCount = process.env.NODE_ENV === 'development' ? 200 : 50;

    // Define realistic actions and resources
    const actions = ['POST /api/users', 'PUT /api/users/:id', 'DELETE /api/users/:id', 'POST /api/roles', 'PUT /api/roles/:id', 'GET /api/reports/users', 'GET /api/reports/activities', 'POST /api/auth/login', 'POST /api/auth/logout', 'PUT /api/users/:id/profile', 'POST /api/users/:id/change-password'];

    const resources = ['users', 'roles', 'permissions', 'reports', 'auth', 'profile'];

    for (let i = 0; i < logCount; i++) {
      const user = faker.helpers.arrayElement(users);
      const action = faker.helpers.arrayElement(actions);
      const resource = faker.helpers.arrayElement(resources);

      auditLogs.push({
        id: this.generateUUID(),
        user_id: user.id,
        action: action,
        resource: resource,
        resource_id: faker.helpers.maybe(() => this.generateUUID(), { probability: 0.7 }),
        details: JSON.stringify({
          userAgent: faker.internet.userAgent(),
          requestBody: faker.helpers.maybe(
            () => ({
              field: faker.lorem.word(),
              value: faker.lorem.words(2),
            }),
            { probability: 0.5 },
          ),
          responseStatus: faker.helpers.weightedArrayElement([
            { weight: 0.85, value: 200 },
            { weight: 0.1, value: 400 },
            { weight: 0.03, value: 403 },
            { weight: 0.02, value: 500 },
          ]),
        }),
        ip_address: faker.internet.ip(),
        user_agent: faker.internet.userAgent(),
        created_at: faker.date.past({ years: 1 }),
      });
    }

    // Sort by date for realistic chronological order
    auditLogs.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < auditLogs.length; i += batchSize) {
      const batch = auditLogs.slice(i, i + batchSize);
      await this.knex('audit_logs').insert(batch);
    }

    console.log(`✅ Seeded ${auditLogs.length} audit log entries`);
  }
}

export async function seed(knex: Knex): Promise<void> {
  const auditLogsSeed = new AuditLogsSeed(knex);
  await auditLogsSeed.seed();
}
```

### Environment-Specific Seeds

```typescript
// database/seeds/99_environment_specific.ts
import { Knex } from 'knex';
import { BaseSeed } from './base.seed';

export class EnvironmentSpecificSeed extends BaseSeed {
  async seed(): Promise<void> {
    const environment = process.env.NODE_ENV;

    switch (environment) {
      case 'development':
        await this.seedDevelopmentData();
        break;
      case 'staging':
        await this.seedStagingData();
        break;
      case 'production':
        await this.seedProductionData();
        break;
      default:
        console.log('Unknown environment, skipping environment-specific seeds');
    }
  }

  private async seedDevelopmentData(): Promise<void> {
    // Add development-specific data
    console.log('🔧 Seeding development data...');

    // Create test API clients
    const testClients = [
      {
        id: this.generateUUID(),
        name: 'Development Test Client',
        client_id: 'dev-test-client',
        client_secret: 'dev-secret-123',
        redirect_uris: JSON.stringify(['http://localhost:4200/callback']),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    if (await this.tableExists('oauth_clients')) {
      await this.knex('oauth_clients').insert(testClients);
      console.log('✅ Added development OAuth clients');
    }
  }

  private async seedStagingData(): Promise<void> {
    console.log('🔧 Seeding staging data...');

    // Add staging-specific configurations
    const configs = [
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable maintenance mode for staging tests',
      },
      {
        key: 'debug_mode',
        value: 'true',
        description: 'Enable debug features for staging',
      },
    ];

    if (await this.tableExists('system_configs')) {
      await this.knex('system_configs').insert(configs);
      console.log('✅ Added staging configurations');
    }
  }

  private async seedProductionData(): Promise<void> {
    console.log('🔧 Checking production data...');

    // Only create essential production data if missing
    const adminCount = await this.knex('users').join('roles', 'users.role_id', 'roles.id').where('roles.name', 'super_admin').count('users.id as count').first();

    if (parseInt(adminCount?.count as string) === 0) {
      // Create production admin if none exists
      const superAdminRole = await this.knex('roles').where('name', 'super_admin').first();

      if (superAdminRole) {
        const prodAdmin = {
          id: this.generateUUID(),
          email: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
          username: 'admin',
          password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12),
          first_name: 'System',
          last_name: 'Administrator',
          is_active: true,
          email_verified: true,
          email_verified_at: new Date(),
          role_id: superAdminRole.id,
          created_at: new Date(),
          updated_at: new Date(),
        };

        await this.knex('users').insert(prodAdmin);
        console.log('✅ Created production admin user');
      }
    }
  }
}

export async function seed(knex: Knex): Promise<void> {
  const environmentSeed = new EnvironmentSpecificSeed(knex);
  await environmentSeed.seed();
}
```

## Advanced Migration Patterns

### Data Migration with Validation

```typescript
// database/migrations/20241201000025_migrate_user_data.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Migration with data validation and error handling
  const batchSize = 1000;
  let processed = 0;
  let errors = 0;

  console.log('Starting user data migration...');

  // Process users in batches
  while (true) {
    const users = await knex('users').select('*').whereNull('migrated_at').limit(batchSize);

    if (users.length === 0) break;

    const transaction = await knex.transaction();

    try {
      for (const user of users) {
        try {
          // Validate and transform data
          const transformedData = {
            ...user,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
            display_name: user.username || user.email.split('@')[0],
            migrated_at: new Date(),
          };

          // Validate email format
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            throw new Error(`Invalid email format: ${user.email}`);
          }

          // Update user with transformed data
          await transaction('users').where({ id: user.id }).update(transformedData);

          processed++;
        } catch (error) {
          console.error(`Error migrating user ${user.id}:`, error.message);
          errors++;

          // Log error but continue with other users
          await transaction('migration_errors').insert({
            migration_name: '20241201000025_migrate_user_data',
            resource_type: 'user',
            resource_id: user.id,
            error_message: error.message,
            created_at: new Date(),
          });
        }
      }

      await transaction.commit();
      console.log(`Processed batch: ${processed} users, ${errors} errors`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  console.log(`Migration completed: ${processed} users processed, ${errors} errors`);
}

export async function down(knex: Knex): Promise<void> {
  // Rollback migration
  await knex('users').update({
    full_name: null,
    display_name: null,
    migrated_at: null,
  });
}
```

### Schema Version Migration

```typescript
// database/migrations/20241201000030_add_schema_version.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create schema versioning table
  await knex.schema.createTable('schema_versions', (table) => {
    table.increments('id').primary();
    table.string('version', 20).notNullable().unique();
    table.text('description');
    table.timestamp('applied_at').defaultTo(knex.fn.now());
    table.string('applied_by', 100);
    table.integer('batch_number');
  });

  // Insert current schema version
  await knex('schema_versions').insert({
    version: '1.0.0',
    description: 'Initial schema with users, roles, and permissions',
    applied_by: process.env.USER || 'system',
    batch_number: 1,
  });

  // Create function to automatically update schema version
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_schema_version()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO schema_versions (version, description, applied_by, batch_number)
      VALUES (
        COALESCE(NEW.version, OLD.version),
        'Migration applied',
        current_user,
        (SELECT COALESCE(MAX(batch_number), 0) + 1 FROM schema_versions)
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION IF EXISTS update_schema_version()');
  await knex.schema.dropTableIfExists('schema_versions');
}
```

## Seed Data Factory Pattern

### Data Factory Utilities

```typescript
// database/seeds/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export interface UserFactoryOptions {
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  includeProfile?: boolean;
}

export class UserFactory {
  static async create(options: UserFactoryOptions = {}) {
    const { role = 'user', isActive = true, emailVerified = true, includeProfile = true } = options;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();

    const baseUser = {
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username: username,
      password: await bcrypt.hash('TestPassword123!', 12),
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      email_verified: emailVerified,
      email_verified_at: emailVerified ? faker.date.recent({ days: 30 }) : null,
      created_at: faker.date.past({ years: 1 }),
      updated_at: faker.date.recent({ days: 7 }),
    };

    if (includeProfile) {
      return {
        ...baseUser,
        bio: faker.person.bio(),
        phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }),
        birth_date: faker.helpers.maybe(() => faker.date.birthdate({ min: 18, max: 65, mode: 'age' }), { probability: 0.6 }),
        avatar_url: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.4 }),
        preferences: JSON.stringify({
          theme: faker.helpers.arrayElement(['light', 'dark']),
          emailNotifications: faker.datatype.boolean(0.8),
          pushNotifications: faker.datatype.boolean(0.5),
          language: faker.helpers.arrayElement(['en', 'th', 'ja']),
        }),
        timezone: faker.helpers.arrayElement(['UTC', 'America/New_York', 'Europe/London', 'Asia/Bangkok']),
        language: 'en',
      };
    }

    return baseUser;
  }

  static async createBatch(count: number, options: UserFactoryOptions = []) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(options));
    }
    return users;
  }

  static createAdmin() {
    return this.create({
      role: 'admin',
      isActive: true,
      emailVerified: true,
      includeProfile: false,
    });
  }

  static createManager() {
    return this.create({
      role: 'manager',
      isActive: true,
      emailVerified: true,
    });
  }

  static createInactiveUser() {
    return this.create({
      isActive: false,
      emailVerified: false,
    });
  }
}
```

### Test Data Sets

```typescript
// database/seeds/factories/test-data.factory.ts
export class TestDataFactory {
  static getTestUsers() {
    return [
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
      },
      {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'manager',
      },
      {
        email: 'admin.user@example.com',
        username: 'adminuser',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      },
    ];
  }

  static getTestRoles() {
    return [
      { name: 'super_admin', description: 'Super Administrator', level: 100 },
      { name: 'admin', description: 'Administrator', level: 80 },
      { name: 'manager', description: 'Manager', level: 60 },
      { name: 'user', description: 'Standard User', level: 40 },
      { name: 'guest', description: 'Guest User', level: 20 },
    ];
  }

  static getTestPermissions() {
    const resources = ['users', 'roles', 'permissions', 'reports'];
    const actions = ['create', 'read', 'update', 'delete'];

    const permissions = [];
    for (const resource of resources) {
      for (const action of actions) {
        permissions.push({
          resource,
          action,
          description: `${action} ${resource}`,
        });
      }
    }

    return permissions;
  }
}
```

## Migration Utilities

### Database Helper Functions

```typescript
// database/utils/migration.utils.ts
import { Knex } from 'knex';

export class MigrationUtils {
  static async addTimestamps(knex: Knex, tableName: string): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
      table.timestamps(true, true);
    });
  }

  static async addSoftDelete(knex: Knex, tableName: string): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
      table.timestamp('deleted_at');
    });

    // Add index for soft delete queries
    await knex.raw(`
      CREATE INDEX idx_${tableName}_deleted_at 
      ON ${tableName} (deleted_at) 
      WHERE deleted_at IS NULL
    `);
  }

  static async addAuditFields(knex: Knex, tableName: string): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
      table.uuid('created_by');
      table.uuid('updated_by');
      table.foreign('created_by').references('id').inTable('users');
      table.foreign('updated_by').references('id').inTable('users');
    });
  }

  static async createEnum(knex: Knex, enumName: string, values: string[]): Promise<void> {
    const valuesString = values.map((v) => `'${v}'`).join(', ');
    await knex.raw(`CREATE TYPE ${enumName} AS ENUM (${valuesString})`);
  }

  static async dropEnum(knex: Knex, enumName: string): Promise<void> {
    await knex.raw(`DROP TYPE IF EXISTS ${enumName}`);
  }

  static async addFullTextSearch(knex: Knex, tableName: string, searchColumn: string, sourceColumns: string[]): Promise<void> {
    // Add tsvector column
    await knex.schema.alterTable(tableName, (table) => {
      table.specificType(searchColumn, 'tsvector');
    });

    // Create trigger to update search vector
    const sourceList = sourceColumns.map((col) => `COALESCE(${col}, '')`).join(" || ' ' || ");

    await knex.raw(`
      CREATE OR REPLACE FUNCTION update_${tableName}_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.${searchColumn} = to_tsvector('english', ${sourceList});
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await knex.raw(`
      CREATE TRIGGER update_${tableName}_search_vector_trigger
      BEFORE INSERT OR UPDATE ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION update_${tableName}_search_vector();
    `);

    // Create GIN index for fast full-text search
    await knex.raw(`
      CREATE INDEX CONCURRENTLY idx_${tableName}_${searchColumn}
      ON ${tableName} USING GIN (${searchColumn})
    `);

    // Update existing records
    await knex.raw(`
      UPDATE ${tableName} 
      SET ${searchColumn} = to_tsvector('english', ${sourceList})
    `);
  }

  static async createPartitionedTable(knex: Knex, tableName: string, partitionKey: string, partitionType: 'RANGE' | 'LIST' | 'HASH' = 'RANGE'): Promise<void> {
    // Create partitioned table
    await knex.raw(`
      CREATE TABLE ${tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ${partitionKey} TIMESTAMP NOT NULL,
        -- other columns defined in main migration
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) PARTITION BY ${partitionType} (${partitionKey})
    `);

    // Create monthly partitions for the current and next year
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`;
        const endDate = month === 12 ? `${year + 1}-01-01` : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

        await knex.raw(`
          CREATE TABLE ${tableName}_${year}_${monthStr} 
          PARTITION OF ${tableName}
          FOR VALUES FROM ('${startDate}') TO ('${endDate}')
        `);
      }
    }
  }
}
```

## Backup & Restore Seeds

### Database Backup Utility

```typescript
// Example backup utility (create in your project if needed)
// utils/database-backup.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class DatabaseBackup {
  private connectionUrl: string;
  private backupDir: string;

  constructor(connectionUrl: string, backupDir: string = './backups') {
    this.connectionUrl = connectionUrl;
    this.backupDir = backupDir;
  }

  async createBackup(name?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.sql`);

    // Ensure backup directory exists
    await execAsync(`mkdir -p ${this.backupDir}`);

    // Create backup with pg_dump
    const command = `pg_dump "${this.connectionUrl}" --no-owner --no-privileges > "${backupPath}"`;

    try {
      await execAsync(command);
      console.log(`✅ Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    // Warning: This will drop and recreate the database
    console.log('⚠️ Warning: This will completely replace the current database');

    const command = `psql "${this.connectionUrl}" < "${backupPath}"`;

    try {
      await execAsync(command);
      console.log(`✅ Database restored from: ${backupPath}`);
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  async createSchemaOnlyBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `schema-${timestamp}.sql`);

    await execAsync(`mkdir -p ${this.backupDir}`);

    const command = `pg_dump "${this.connectionUrl}" --schema-only --no-owner --no-privileges > "${backupPath}"`;

    try {
      await execAsync(command);
      console.log(`✅ Schema backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Schema backup failed:', error.message);
      throw error;
    }
  }
}
```

### Seed Reset Utility

```typescript
// Example seed reset utility (create in your project if needed)
// utils/reset-seeds.ts
import knex from 'knex';
import knexConfig from '../knexfile';

export class SeedReset {
  private db: knex.Knex;

  constructor(environment: string = 'development') {
    this.db = knex(knexConfig[environment]);
  }

  async resetToBaseline(): Promise<void> {
    console.log('🔄 Resetting database to baseline...');

    try {
      // Disable foreign key checks temporarily
      await this.db.raw('SET FOREIGN_KEY_CHECKS = 0');

      // Clear all data tables (keep schema)
      const dataTables = ['audit_logs', 'user_sessions', 'role_permissions', 'users', 'permissions', 'roles'];

      for (const table of dataTables) {
        const exists = await this.db.schema.hasTable(table);
        if (exists) {
          await this.db(table).del();
          console.log(`  ✅ Cleared ${table}`);
        }
      }

      // Re-enable foreign key checks
      await this.db.raw('SET FOREIGN_KEY_CHECKS = 1');

      // Run seeds
      console.log('🌱 Running seeds...');
      await this.runSeeds();

      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Reset failed:', error.message);
      throw error;
    } finally {
      await this.db.destroy();
    }
  }

  private async runSeeds(): Promise<void> {
    // Import and run seeds in order
    const seedFiles = ['../seeds/01_roles', '../seeds/02_permissions', '../seeds/03_role_permissions', '../seeds/04_users', '../seeds/05_audit_logs'];

    for (const seedFile of seedFiles) {
      try {
        const { seed } = await import(seedFile);
        await seed(this.db);
        console.log(`  ✅ Seeded ${seedFile}`);
      } catch (error) {
        console.error(`  ❌ Failed to seed ${seedFile}:`, error.message);
        throw error;
      }
    }
  }

  async createSnapshot(name: string): Promise<void> {
    console.log(`📸 Creating database snapshot: ${name}`);

    const backup = new DatabaseBackup(process.env.DATABASE_URL!);
    await backup.createBackup(`snapshot-${name}`);

    console.log(`✅ Snapshot created: ${name}`);
  }

  async restoreSnapshot(name: string): Promise<void> {
    console.log(`📥 Restoring database snapshot: ${name}`);

    const backup = new DatabaseBackup(process.env.DATABASE_URL!);
    const backupPath = `./backups/snapshot-${name}.sql`;
    await backup.restoreBackup(backupPath);

    console.log(`✅ Snapshot restored: ${name}`);
  }
}
```

## Performance Migration Patterns

### Index Creation with Monitoring

```typescript
// database/migrations/20241201000035_optimize_performance.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create indexes concurrently to avoid table locks
  console.log('Creating performance indexes...');

  // User search optimization
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_composite
    ON users (is_active, email_verified, role_id, created_at DESC)
    WHERE deleted_at IS NULL
  `);

  // Audit log performance
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_performance
    ON audit_logs (user_id, resource, created_at DESC)
  `);

  // Session cleanup performance
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_cleanup
    ON user_sessions (expires_at)
    WHERE expires_at < CURRENT_TIMESTAMP
  `);

  // Role hierarchy queries
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roles_level_active
    ON roles (level DESC, is_active)
  `);

  console.log('✅ Performance indexes created');

  // Analyze tables for query planner
  const tables = ['users', 'roles', 'permissions', 'audit_logs', 'user_sessions'];
  for (const table of tables) {
    await knex.raw(`ANALYZE ${table}`);
    console.log(`  ✅ Analyzed ${table}`);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop performance indexes
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_users_search_composite');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_audit_logs_performance');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_sessions_cleanup');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS idx_roles_level_active');
}
```

### Data Archival Migration

```typescript
// database/migrations/20241201000040_setup_data_archival.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create archived tables for old data
  await knex.schema.createTable('audit_logs_archive', (table) => {
    // Same structure as audit_logs but for historical data
    table.uuid('id').primary();
    table.uuid('user_id');
    table.string('action', 255).notNullable();
    table.string('resource', 100).notNullable();
    table.string('resource_id', 255);
    table.jsonb('details');
    table.specificType('ip_address', 'inet');
    table.text('user_agent');
    table.timestamp('created_at').notNullable();
    table.timestamp('archived_at').defaultTo(knex.fn.now());

    // Indexes for archived data queries
    table.index(['user_id'], 'idx_audit_archive_user_id');
    table.index(['resource'], 'idx_audit_archive_resource');
    table.index(['created_at'], 'idx_audit_archive_created_at');
    table.index(['archived_at'], 'idx_audit_archive_archived_at');
  });

  // Create archival function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION archive_old_audit_logs()
    RETURNS INTEGER AS $$
    DECLARE
      archived_count INTEGER;
    BEGIN
      -- Archive audit logs older than 2 years
      WITH archived AS (
        DELETE FROM audit_logs 
        WHERE created_at < CURRENT_DATE - INTERVAL '2 years'
        RETURNING *
      )
      INSERT INTO audit_logs_archive (
        id, user_id, action, resource, resource_id, 
        details, ip_address, user_agent, created_at
      )
      SELECT 
        id, user_id, action, resource, resource_id,
        details, ip_address, user_agent, created_at
      FROM archived;
      
      GET DIAGNOSTICS archived_count = ROW_COUNT;
      
      -- Log the archival
      INSERT INTO system_logs (level, message, details, created_at)
      VALUES (
        'info',
        'Archived old audit logs',
        json_build_object('archived_count', archived_count),
        CURRENT_TIMESTAMP
      );
      
      RETURN archived_count;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create automated archival job (called by cron or scheduler)
  await knex.raw(`
    CREATE OR REPLACE FUNCTION schedule_archival()
    RETURNS void AS $$
    BEGIN
      -- Run archival if not run in the last 24 hours
      IF NOT EXISTS (
        SELECT 1 FROM system_logs 
        WHERE message = 'Archived old audit logs' 
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      ) THEN
        PERFORM archive_old_audit_logs();
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION IF EXISTS schedule_archival()');
  await knex.raw('DROP FUNCTION IF EXISTS archive_old_audit_logs()');
  await knex.schema.dropTableIfExists('audit_logs_archive');
}
```

## Migration Testing

### Migration Test Utilities

```typescript
// database/tests/migration.test.ts
import { test, expect, beforeEach, afterEach } from 'vitest';
import knex from 'knex';
import knexConfig from '../knexfile';

describe('Database Migrations', () => {
  let db: knex.Knex;

  beforeEach(async () => {
    // Use test database
    db = knex({
      ...knexConfig.development,
      connection: {
        ...knexConfig.development.connection,
        database: 'myapp_test',
      },
    });

    // Start with clean database
    await db.migrate.rollback(undefined, true);
  });

  afterEach(async () => {
    await db.destroy();
  });

  test('should run all migrations successfully', async () => {
    const [batch, migrations] = await db.migrate.latest();

    expect(migrations).toHaveLength(expect.any(Number));
    expect(batch).toBeGreaterThan(0);

    // Verify core tables exist
    const tables = ['users', 'roles', 'permissions', 'role_permissions', 'audit_logs'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      expect(exists).toBe(true);
    }
  });

  test('should rollback migrations correctly', async () => {
    // Run migrations
    await db.migrate.latest();

    // Rollback last migration
    await db.migrate.rollback();

    // Verify rollback worked
    const exists = await db.schema.hasTable('users');
    expect(exists).toBe(true); // Should still exist after partial rollback
  });

  test('should handle migration errors gracefully', async () => {
    // Test with invalid migration
    await expect(async () => {
      await db.migrate.up({ name: 'invalid_migration.ts' });
    }).rejects.toThrow();
  });

  test('should verify foreign key constraints', async () => {
    await db.migrate.latest();

    // Try to insert user with invalid role_id
    await expect(
      db('users').insert({
        email: 'test@example.com',
        username: 'test',
        password: 'hashed',
        first_name: 'Test',
        last_name: 'User',
        role_id: 'invalid-uuid',
      }),
    ).rejects.toThrow();
  });

  test('should verify unique constraints', async () => {
    await db.migrate.latest();
    await db.seed.run();

    // Try to insert duplicate email
    await expect(
      db('users').insert({
        email: 'admin@example.com', // Already exists from seed
        username: 'admin2',
        password: 'hashed',
        first_name: 'Admin',
        last_name: 'Two',
        role_id: (await db('roles').first()).id,
      }),
    ).rejects.toThrow();
  });
});
```

## Migration Deployment Strategy

### Production Migration Process

```bash
#!/bin/bash
# Example production migration script (create in your project if needed)
# scripts/migrate-production.sh

set -e  # Exit on any error

echo "🚀 Starting production migration..."

# 1. Create backup before migration
echo "📦 Creating pre-migration backup..."
BACKUP_NAME="pre-migration-$(date +%Y%m%d-%H%M%S)"
pg_dump $DATABASE_URL > "backups/${BACKUP_NAME}.sql"
echo "✅ Backup created: ${BACKUP_NAME}.sql"

# 2. Check migration status
echo "📊 Checking current migration status..."
npx knex migrate:status --knexfile database/knexfile.ts

# 3. Dry run migration (if supported)
echo "🧪 Testing migration on backup..."
# Create temporary test database and run migration
TEST_DB_URL="${DATABASE_URL}_test"
createdb "${TEST_DB_URL##*/}"
psql $TEST_DB_URL < "backups/${BACKUP_NAME}.sql"
npx knex migrate:latest --knexfile database/knexfile.ts --env test

# 4. If test passes, run on production
echo "🎯 Running production migration..."
npx knex migrate:latest --knexfile database/knexfile.ts --env production

# 5. Verify migration success
echo "✅ Verifying migration..."
npx knex migrate:status --knexfile database/knexfile.ts --env production

# 6. Run post-migration verification
echo "🔍 Running post-migration verification..."
# Run data integrity verification
node utils/verify-data-integrity.js

echo "🎉 Production migration completed successfully!"

# Cleanup test database
dropdb "${TEST_DB_URL##*/}" || true
```

### Data Integrity Verification

```typescript
// Example data integrity verification (create in your project if needed)
// utils/verify-data-integrity.ts
import knex from 'knex';
import knexConfig from '../knexfile';

async function verifyDataIntegrity() {
  const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

  try {
    console.log('🔍 Verifying data integrity...');

    // Check foreign key constraints
    const orphanedUsers = await db('users').leftJoin('roles', 'users.role_id', 'roles.id').whereNull('roles.id').count('users.id as count').first();

    if (parseInt(orphanedUsers?.count as string) > 0) {
      throw new Error(`Found ${orphanedUsers?.count} users with invalid role_id`);
    }

    // Check required data exists
    const adminRole = await db('roles').where('name', 'admin').first();
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const adminUser = await db('users').join('roles', 'users.role_id', 'roles.id').where('roles.name', 'admin').first();

    if (!adminUser) {
      console.warn('⚠️ Warning: No admin user found');
    }

    // Check table constraints
    const tables = ['users', 'roles', 'permissions', 'audit_logs'];
    for (const table of tables) {
      const count = await db(table).count('* as count').first();
      console.log(`  📊 ${table}: ${count?.count} records`);
    }

    // Verify indexes exist
    const indexes = await db.raw(`
      SELECT schemaname, tablename, indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'roles', 'permissions', 'audit_logs')
      ORDER BY tablename, indexname
    `);

    console.log(`  🔗 Found ${indexes.rows.length} indexes`);

    console.log('✅ Data integrity verification passed');
  } catch (error) {
    console.error('❌ Data integrity verification failed:', error.message);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run verification
verifyDataIntegrity().catch(console.error);
```

## Migration Commands Cheat Sheet

```bash
# Migration Management
yarn db:migrate:make create_users_table    # Create new migration
yarn db:migrate                           # Run pending migrations
yarn db:migrate:rollback                  # Rollback last batch
yarn db:migrate:rollback --all            # Rollback all migrations
yarn db:migrate:status                    # Show migration status

# Seed Management
yarn db:seed:make 01_roles                # Create new seed file
yarn db:seed                             # Run all seeds
yarn db:seed --specific=01_roles.js       # Run specific seed

# Database Operations
yarn db:reset                            # Rollback all + migrate + seed
yarn db:fresh                            # Rollback all + migrate (no seeds)
yarn db:setup                            # Migrate + seed (for new setup)

# Backup & Restore
# Example usage (if utilities are created):
node utils/backup.ts           # Create backup
node utils/restore.ts backup.sql  # Restore from backup

# Utilities
node utils/reset-seeds.ts      # Reset to baseline with seeds
node utils/verify-data-integrity.ts  # Verify data integrity
```

## Best Practices Summary

### Migration Best Practices

1. **Always Reversible** - Every `up()` must have corresponding `down()`
2. **Incremental Changes** - Small, focused migrations
3. **Data Safety** - Backup before destructive operations
4. **Performance Aware** - Use `CONCURRENTLY` for index creation
5. **Constraint Validation** - Add constraints after data migration
6. **Environment Specific** - Different behavior per environment
7. **Testing** - Test migrations on copy of production data
8. **Documentation** - Add comments to tables and columns

### Seed Best Practices

1. **Deterministic** - Same seeds produce same data
2. **Environment Aware** - Different data per environment
3. **Realistic Data** - Use faker for test data
4. **Performance** - Batch inserts for large datasets
5. **Dependencies** - Seed in dependency order
6. **Cleanup** - Clear existing data before seeding
7. **Factory Pattern** - Reusable data generation
8. **Error Handling** - Graceful failure handling

### Security Considerations

1. **Production Secrets** - Never seed real secrets
2. **Data Privacy** - No real customer data in seeds
3. **Access Control** - Verify permissions are correct
4. **Audit Trail** - Log all migration activities
5. **Backup Strategy** - Always backup before migrations
6. **Rollback Plan** - Test rollback procedures
7. **Monitoring** - Monitor migration performance
8. **Compliance** - Follow data retention policies
