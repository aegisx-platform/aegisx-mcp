import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // This migration was previously deleted during consolidation
  // No changes needed as test categories have been removed
}

export async function down(knex: Knex): Promise<void> {
  // No changes to undo
}
