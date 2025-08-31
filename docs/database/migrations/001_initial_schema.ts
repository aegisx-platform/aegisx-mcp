import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 50).notNullable().unique();
    table.string('description', 255);
    table.boolean('is_system').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('name');
  });

  // Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable().unique();
    table.string('resource', 50).notNullable();
    table.string('action', 50).notNullable();
    table.string('description', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['resource', 'action']);
    table.unique(['resource', 'action']);
  });

  // Create role_permissions junction table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').notNullable();
    table.uuid('permission_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.primary(['role_id', 'permission_id']);
  });

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).notNullable().unique();
    table.string('username', 50).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_email_verified').defaultTo(false);
    table.string('email_verification_token', 255);
    table.timestamp('email_verified_at');
    table.string('password_reset_token', 255);
    table.timestamp('password_reset_expires');
    table.uuid('role_id').notNullable();
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('updated_by');
    
    table.foreign('role_id').references('id').inTable('roles');
    table.foreign('created_by').references('id').inTable('users');
    table.foreign('updated_by').references('id').inTable('users');
    
    table.index('email');
    table.index('username');
    table.index('is_active');
    table.index('role_id');
  });

  // Create sessions table for JWT refresh tokens
  await knex.schema.createTable('sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable();
    table.string('refresh_token', 500).notNullable().unique();
    table.string('device_id', 255);
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_used_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('refresh_token');
    table.index('user_id');
    table.index('expires_at');
  });

  // Create audit_logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id');
    table.string('action', 255).notNullable();
    table.string('resource', 100).notNullable();
    table.string('resource_id', 255);
    table.jsonb('details');
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index('user_id');
    table.index('resource');
    table.index('created_at');
    table.index('action');
  });

  // Create trigger for updated_at columns
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Apply trigger to tables with updated_at
  const tablesWithUpdatedAt = ['roles', 'permissions', 'users'];
  for (const tableName of tablesWithUpdatedAt) {
    await knex.raw(`
      CREATE TRIGGER update_${tableName}_updated_at
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop triggers
  const tablesWithUpdatedAt = ['roles', 'permissions', 'users'];
  for (const tableName of tablesWithUpdatedAt) {
    await knex.raw(`DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName}`);
  }
  
  // Drop function
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column');
  
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
}