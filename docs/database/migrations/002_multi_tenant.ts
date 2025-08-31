import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create tenants table
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.string('domain', 255).unique();
    table.jsonb('settings').defaultTo('{}');
    table.jsonb('metadata').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('trial_ends_at');
    table.string('subscription_status', 50).defaultTo('trial');
    table.string('subscription_plan', 50);
    table.integer('max_users').defaultTo(5);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('slug');
    table.index('domain');
    table.index('is_active');
  });

  // Add tenant_id to users table
  await knex.schema.alterTable('users', (table) => {
    table.uuid('tenant_id').after('id');
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index('tenant_id');
    
    // Update unique constraints to include tenant_id
    table.dropUnique(['email']);
    table.dropUnique(['username']);
    table.unique(['tenant_id', 'email']);
    table.unique(['tenant_id', 'username']);
  });

  // Create tenant_users junction table for multi-tenant users
  await knex.schema.createTable('tenant_users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.uuid('user_id').notNullable();
    table.uuid('role_id').notNullable();
    table.boolean('is_primary').defaultTo(false);
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.timestamp('last_access_at');
    
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('role_id').references('id').inTable('roles');
    
    table.unique(['tenant_id', 'user_id']);
    table.index('user_id');
    table.index('tenant_id');
  });

  // Create tenant_invitations table
  await knex.schema.createTable('tenant_invitations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.string('email', 255).notNullable();
    table.uuid('role_id').notNullable();
    table.string('token', 255).notNullable().unique();
    table.uuid('invited_by').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('accepted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('role_id').references('id').inTable('roles');
    table.foreign('invited_by').references('id').inTable('users');
    
    table.index('token');
    table.index('email');
    table.index(['tenant_id', 'email']);
  });

  // Create tenant-specific roles
  await knex.schema.createTable('tenant_roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.string('name', 50).notNullable();
    table.string('description', 255);
    table.boolean('is_custom').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.unique(['tenant_id', 'name']);
    table.index('tenant_id');
  });

  // Create tenant_role_permissions junction table
  await knex.schema.createTable('tenant_role_permissions', (table) => {
    table.uuid('tenant_role_id').notNullable();
    table.uuid('permission_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('tenant_role_id').references('id').inTable('tenant_roles').onDelete('CASCADE');
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.primary(['tenant_role_id', 'permission_id']);
  });

  // Add tenant_id to audit_logs
  await knex.schema.alterTable('audit_logs', (table) => {
    table.uuid('tenant_id').after('id');
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index('tenant_id');
  });

  // Update triggers for new tables
  const newTablesWithUpdatedAt = ['tenants', 'tenant_roles'];
  for (const tableName of newTablesWithUpdatedAt) {
    await knex.raw(`
      CREATE TRIGGER update_${tableName}_updated_at
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  // Create function for tenant isolation
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_tenant_id()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id = current_setting('app.current_tenant_id')::uuid;
      END IF;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create RLS (Row Level Security) policies for tenant isolation
  await knex.raw(`
    -- Enable RLS on tables
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY tenant_isolation_users ON users
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
    
    CREATE POLICY tenant_isolation_audit_logs ON audit_logs
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop RLS policies
  await knex.raw(`
    DROP POLICY IF EXISTS tenant_isolation_users ON users;
    DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
  `);

  // Drop function
  await knex.raw('DROP FUNCTION IF EXISTS set_tenant_id');

  // Drop triggers
  const tablesWithUpdatedAt = ['tenants', 'tenant_roles'];
  for (const tableName of tablesWithUpdatedAt) {
    await knex.raw(`DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName}`);
  }

  // Remove tenant_id from audit_logs
  await knex.schema.alterTable('audit_logs', (table) => {
    table.dropColumn('tenant_id');
  });

  // Restore original unique constraints on users
  await knex.schema.alterTable('users', (table) => {
    table.dropUnique(['tenant_id', 'email']);
    table.dropUnique(['tenant_id', 'username']);
    table.unique(['email']);
    table.unique(['username']);
    table.dropColumn('tenant_id');
  });

  // Drop tables
  await knex.schema.dropTableIfExists('tenant_role_permissions');
  await knex.schema.dropTableIfExists('tenant_roles');
  await knex.schema.dropTableIfExists('tenant_invitations');
  await knex.schema.dropTableIfExists('tenant_users');
  await knex.schema.dropTableIfExists('tenants');
}