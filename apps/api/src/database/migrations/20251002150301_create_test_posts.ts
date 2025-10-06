import type { Knex } from 'knex';

/**
 * Migration: Create test posts table (placeholder)
 * Purpose: Fix missing migration file error
 */

export async function up(knex: Knex): Promise<void> {
  console.log('📝 Creating test_posts table (placeholder)...');

  await knex.schema.createTable('test_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('content').nullable();
    table.timestamps(true, true);
  });

  console.log('✅ Test posts table created successfully');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🗑️ Dropping test_posts table...');

  await knex.schema.dropTableIfExists('test_posts');

  console.log('✅ Test posts table dropped successfully');
}
