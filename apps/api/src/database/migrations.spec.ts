import { Knex } from 'knex';
import * as path from 'path';

describe('Database Migrations', () => {
  let knex: Knex;

  beforeAll(async () => {
    // Create test database connection
    knex = require('knex')({
      client: 'postgresql',
      connection: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        database: process.env.DATABASE_NAME || 'aegisx_test',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
      },
      migrations: {
        directory: path.join(__dirname, 'migrations'),
      },
      seeds: {
        directory: path.join(__dirname, 'seeds'),
      },
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('Migration Structure', () => {
    beforeEach(async () => {
      // Ensure clean state
      await knex.migrate.rollback();
      await knex.migrate.latest();
    });

    afterEach(async () => {
      await knex.migrate.rollback();
    });

    test('should create all required tables', async () => {
      const tables = await knex('information_schema.tables')
        .select('table_name')
        .where('table_schema', 'public')
        .whereNotIn('table_name', ['knex_migrations', 'knex_migrations_lock']);

      const tableNames = tables.map(t => t.table_name).sort();
      expect(tableNames).toEqual([
        'permissions',
        'role_permissions',
        'roles',
        'user_roles',
        'user_sessions',
        'users',
      ]);
    });

    test('should create users table with correct columns', async () => {
      const columns = await knex('information_schema.columns')
        .select('column_name', 'data_type', 'is_nullable')
        .where('table_name', 'users')
        .orderBy('ordinal_position');

      const expectedColumns = [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'email', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'username', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'password', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'first_name', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'last_name', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'is_active', data_type: 'boolean', is_nullable: 'YES' },
        { column_name: 'last_login_at', data_type: 'timestamp with time zone', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
      ];

      expect(columns).toEqual(expectedColumns);
    });

    test('should create proper indexes', async () => {
      const indexes = await knex.raw(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname NOT LIKE '%_pkey'
        ORDER BY indexname
      `);

      const indexNames = indexes.rows.map(r => r.indexname);
      expect(indexNames).toContain('users_email_index');
      expect(indexNames).toContain('users_username_index');
      expect(indexNames).toContain('users_is_active_index');
    });

    test('should create foreign key constraints', async () => {
      const constraints = await knex.raw(`
        SELECT 
          tc.table_name, 
          tc.constraint_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name, tc.constraint_name
      `);

      const fkConstraints = constraints.rows;
      
      // Check user_roles constraints
      const userRolesConstraints = fkConstraints.filter(c => c.table_name === 'user_roles');
      expect(userRolesConstraints).toHaveLength(2);
      expect(userRolesConstraints.some(c => c.foreign_table_name === 'users')).toBe(true);
      expect(userRolesConstraints.some(c => c.foreign_table_name === 'roles')).toBe(true);
    });
  });

  describe('Migration Rollback', () => {
    test('should rollback all migrations cleanly', async () => {
      await knex.migrate.latest();
      await knex.migrate.rollback();

      const tables = await knex('information_schema.tables')
        .select('table_name')
        .where('table_schema', 'public')
        .whereNotIn('table_name', ['knex_migrations', 'knex_migrations_lock']);

      expect(tables).toHaveLength(0);
    });

    test('should be idempotent', async () => {
      // Run migrations multiple times
      await knex.migrate.latest();
      await knex.migrate.latest();
      
      // Should still have same tables
      const tables = await knex('information_schema.tables')
        .select('table_name')
        .where('table_schema', 'public')
        .whereNotIn('table_name', ['knex_migrations', 'knex_migrations_lock']);

      expect(tables).toHaveLength(6);
    });
  });

  describe('Seed Data', () => {
    beforeEach(async () => {
      await knex.migrate.rollback();
      await knex.migrate.latest();
      await knex.seed.run();
    });

    test('should create default roles', async () => {
      const roles = await knex('roles').select('name').orderBy('name');
      expect(roles).toEqual([
        { name: 'admin' },
        { name: 'user' },
      ]);
    });

    test('should create admin user with correct role', async () => {
      const adminUser = await knex('users')
        .select('users.email', 'roles.name as role')
        .join('user_roles', 'users.id', 'user_roles.user_id')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('users.email', 'admin@aegisx.local')
        .first();

      expect(adminUser).toEqual({
        email: 'admin@aegisx.local',
        role: 'admin',
      });
    });

    test('should assign all permissions to admin role', async () => {
      const adminPermissions = await knex('permissions')
        .count('* as count')
        .join('role_permissions', 'permissions.id', 'role_permissions.permission_id')
        .join('roles', 'role_permissions.role_id', 'roles.id')
        .where('roles.name', 'admin')
        .first();

      const totalPermissions = await knex('permissions').count('* as count').first();

      expect(adminPermissions.count).toEqual(totalPermissions.count);
    });
  });
});