import Knex from 'knex';

export async function up(knex: any): Promise<void> {
  // Create user_sessions table for storing refresh tokens
  await knex.schema.createTable('user_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('refresh_token', 500).unique().notNullable();
    table.string('user_agent', 500);
    table.string('ip_address', 45);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('refresh_token');
    table.index('expires_at');
  });
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('user_sessions');
}