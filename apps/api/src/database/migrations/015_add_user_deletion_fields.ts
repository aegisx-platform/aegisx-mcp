import type { Knex } from 'knex';

export async function up(knex: any): Promise<void> {
  await knex.schema.table('users', (table) => {
    // deleted_at already exists, only add missing columns
    table.text('deletion_reason').nullable();
    table.timestamp('recovery_deadline').nullable();
    table.string('deleted_by_ip', 45).nullable(); // Track IP that initiated deletion
    table.text('deleted_by_user_agent').nullable(); // Track user agent
  });

  // Add index on recovery_deadline for cleanup jobs
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_users_recovery_deadline ON users(recovery_deadline) WHERE recovery_deadline IS NOT NULL',
  );
}

export async function down(knex: any): Promise<void> {
  await knex.schema.raw('DROP INDEX IF EXISTS idx_users_recovery_deadline');

  await knex.schema.table('users', (table) => {
    // Don't drop deleted_at as it existed before
    table.dropColumn('deletion_reason');
    table.dropColumn('recovery_deadline');
    table.dropColumn('deleted_by_ip');
    table.dropColumn('deleted_by_user_agent');
  });
}
